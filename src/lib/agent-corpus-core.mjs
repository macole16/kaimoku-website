// Agent-corpus core. Plain ESM, no Next.js imports, so the SAME code runs inside
// `next build` (via src/lib/agent-corpus.ts) and inside scripts/check-corpus.mjs.
// One implementation is the point: a checker with its own fact regex is a
// checker that can pass while the site build fails, or the reverse.
//
// Spec: docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

/** BUILD-time placeholder. Braces are excluded from the capture so a stray
 *  `{{fact:a}}}` cannot swallow the next token. */
export const FACT_RE = /\{\{fact:([^{}]*)\}\}/g;

/** Any SINGLE-brace token that is not part of a `{{...}}` pair. Catches the
 *  upstream `{domain}` form and curl's `%{http_code}` — both would read as a
 *  placeholder to an agent and neither is one of ours. */
export const SINGLE_BRACE_RE = /(?<!\{)\{[^{}\s]+\}(?!\})/g;

/** Keys inside a fact object that are metadata, not data. */
const RESERVED_KEYS = new Set(["verify", "pending"]);

/**
 * @param {string} factsPath absolute path to mail-facts.yaml
 * @returns {Record<string, any>}
 */
export function loadFacts(factsPath) {
  const raw = fs.readFileSync(factsPath, "utf-8");
  const parsed = yaml.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`facts file ${factsPath} did not parse to a mapping`);
  }
  return parsed;
}

/** @param {string} text */
export function normaliseRuntimePlaceholders(text) {
  return text.replaceAll("{domain}", "<domain>");
}

/**
 * Registrar rows in insertion order, excluding reserved keys.
 * @param {Record<string, any>} facts
 * @returns {Array<{key: string, name: string, dns_url?: string}>}
 */
export function registrarEntries(facts) {
  const reg = facts.registrars ?? {};
  return Object.entries(reg)
    .filter(([k]) => !RESERVED_KEYS.has(k))
    .map(([key, v]) => ({ key, name: v.name, dns_url: v.dns_url }));
}

/**
 * Markdown table an agent can match against. The key column is the substring
 * to look for in the FIRST nameserver host (lowercased, trailing dot stripped).
 * @param {Record<string, any>} facts
 */
export function renderRegistrarTable(facts) {
  const lines = [
    "| If the first nameserver CONTAINS | Registrar / DNS host | DNS panel |",
    "| --- | --- | --- |",
  ];
  for (const e of registrarEntries(facts)) {
    const panel = e.dns_url
      ? normaliseRuntimePlaceholders(e.dns_url)
      : "no panel link — name the registrar and hand off (HUMAN ACTION)";
    lines.push(`| \`${e.key}\` | ${e.name} | ${panel} |`);
  }
  return lines.join("\n");
}

/** Derived views: paths that are not YAML leaves but are rendered from them. */
const DERIVED = {
  "registrars.table": renderRegistrarTable,
};

/**
 * Resolve `{{fact:path}}` to a string. A path is dot-separated; array indexes
 * are numeric segments (`nameservers.0`). A fact object's `value:` wrapper
 * (the sibling of `verify`/`pending` metadata) is transparent EVERYWHERE —
 * mid-path (`nameservers.0` reaches into `nameservers.value[0]`) AND at the
 * terminal position (`signup_url` bare is identical to `signup_url.value`;
 * `test_migration_cap_gb` bare resolves the same way `.value` would) — but
 * only ONE hop, and never past a non-scalar: `nameservers` bare still
 * throws (its `value` is an array), `mx` bare still throws (it has no
 * `value` key at all — it needs `.target`). Only scalar leaves and derived
 * views resolve; anything else is an authoring error and must fail the
 * build.
 * @param {Record<string, any>} facts
 * @param {string} factPath
 * @returns {string}
 */
export function resolveFact(facts, factPath) {
  const trimmed = factPath.trim();
  if (Object.hasOwn(DERIVED, trimmed)) return DERIVED[trimmed](facts);
  let node = facts;
  for (const seg of trimmed.split(".")) {
    // A fact object wraps its actual value alongside metadata (`value` plus
    // `verify`/`pending`, e.g. nameservers: {value: [...], verify: {...}}).
    // If the next segment isn't a literal key of the current node but the
    // node has a `value` wrapper, descend through it transparently — this is
    // what lets `nameservers.0` reach the array without spelling out
    // `nameservers.value.0`. See the terminal unwrap below for the
    // end-of-path counterpart (a bare `signup_url` or `test_migration_cap_gb`).
    if (
      node !== null &&
      typeof node === "object" &&
      !Array.isArray(node) &&
      !Object.hasOwn(node, seg) &&
      Object.hasOwn(node, "value")
    ) {
      node = node.value;
    }
    if (node === null || typeof node !== "object" || !Object.hasOwn(node, seg)) {
      throw new Error(`unknown fact: ${trimmed}`);
    }
    node = node[seg];
  }
  // The `value:` wrapper is transparent at the END of a path too, not just
  // mid-path: `signup_url` bare must equal `signup_url.value`, and
  // `test_migration_cap_gb` bare must resolve to "2". Unwrap AT MOST ONCE —
  // if that single hop still lands on an object (nameservers.value is an
  // array; mx has no `value` key to unwrap through at all), the non-scalar
  // guard below still throws. That guard is what stops a fact from
  // silently flattening into a plausible-looking string (e.g. an array
  // comma-joining into "ns1.kuju.email,ns2.kuju.email") and must never be
  // weakened to accommodate this.
  if (node !== null && typeof node === "object" && !Array.isArray(node) && Object.hasOwn(node, "value")) {
    node = node.value;
  }
  if (node === null || typeof node === "object") {
    throw new Error(
      `fact ${trimmed} resolves to a non-scalar; reference a leaf (e.g. ${trimmed}.0 or ${trimmed}.value) or a derived view (${Object.keys(DERIVED).join(", ")})`,
    );
  }
  return normaliseRuntimePlaceholders(String(node));
}

/**
 * Replace every {{fact:...}} in `body`. Throws on the first unknown fact.
 * `used` is the set of TOP-LEVEL keys touched, for the facts_used check.
 * @param {string} body
 * @param {Record<string, any>} facts
 * @returns {{text: string, used: Set<string>}}
 */
export function interpolate(body, facts) {
  const used = new Set();
  const text = body.replace(FACT_RE, (_m, p) => {
    const value = resolveFact(facts, p);
    used.add(p.trim().split(".")[0]);
    return value;
  });
  return { text, used };
}

// ---------------------------------------------------------------------------
// Runbooks
// ---------------------------------------------------------------------------

export const RUNBOOK_URL_PREFIX = "/kuju-email/agent/";
export const REQUIRED_META = ["slug", "title", "order", "preconditions", "outcome", "facts_used"];

/**
 * Commands the corpus may never contain. Scanned over CODE only (fences,
 * indented blocks, inline spans) — code is what an agent executes; prose is
 * where "never run rm" legitimately appears. Every row has a must-deny AND a
 * must-allow case in scripts/corpus-selftest.mjs; add both when you add a row.
 */
export const DENYLIST = [
  { name: "rm", re: /(^|[\s;&|(])rm(\s|$)/ },
  { name: "curl write verb", re: /\bcurl\b.*\s-X\s*(POST|PUT|PATCH|DELETE)\b/i },
  { name: "curl upload flag", re: /\bcurl\b.*\s(-d|--data(-\w+)?|-F|--form|-T|--upload-file)(\s|$)/ },
  { name: "credential flag", re: /\s(-u|--user|--password|--token|--api-key)(\s|=)/ },
  { name: "auth header", re: /Authorization:|\bBearer\s+\S+/ },
  { name: "nsupdate", re: /\bnsupdate\b/ },
  { name: "privileged or destructive tool", re: /(^|[\s;&|(])(sudo|doas|dd|mkfs\S*|chmod|chown|kill|killall|pkill|shutdown|reboot|systemctl|launchctl)(\s|$)/ },
  { name: "remote shell or package tool", re: /(^|[\s;&|(])(ssh|scp|sftp|rsync|kubectl|docker|helm|npm|npx|pip3?|brew|apt(-get)?|yum|dnf)(\s|$)/ },
  { name: "file write redirect", re: /(^|\s)[12&]?>>?\s*(?!&[12](\s|$))(?!\/dev\/null(\s|$))\S/ },
  { name: "pipe to shell", re: /\|\s*(sh|bash|zsh|dash|python3?|perl|node)(\s|$)/ },
];

/**
 * @param {string} raw
 * @param {string} filename
 * @returns {{meta: any, body: string}}
 */
export function parseFrontMatter(raw, filename) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${filename}: missing front-matter (expected a leading --- block)`);
  const meta = yaml.parse(m[1]) ?? {};
  const missing = REQUIRED_META.filter((k) => !Object.hasOwn(meta, k));
  if (missing.length) throw new Error(`${filename}: front-matter missing keys: ${missing.join(", ")}`);
  if (!Array.isArray(meta.facts_used) || !Array.isArray(meta.preconditions)) {
    throw new Error(`${filename}: facts_used and preconditions must be lists`);
  }
  if (!Number.isInteger(meta.order)) throw new Error(`${filename}: order must be an integer`);
  return { meta, body: m[2] };
}

/**
 * Every line an agent could execute: lines inside ``` fences, 4-space-indented
 * lines, and inline `code` spans (each span becomes its own entry).
 * @param {string} body
 * @returns {Array<{line: number, text: string}>}
 */
export function extractCodeLines(body) {
  const out = [];
  let inFence = false;
  body.split("\n").forEach((raw, i) => {
    const line = i + 1;
    if (/^\s*```/.test(raw)) { inFence = !inFence; return; }
    if (inFence) { if (raw.trim()) out.push({ line, text: raw.trim() }); return; }
    if (/^ {4,}\S/.test(raw) || /^\t/.test(raw)) { out.push({ line, text: raw.trim() }); return; }
    for (const span of raw.matchAll(/`([^`\n]+)`/g)) out.push({ line, text: span[1].trim() });
  });
  return out;
}

/**
 * @param {string} body
 * @returns {Array<{line: number, name: string, text: string}>}
 */
export function scanDenylist(body) {
  const hits = [];
  for (const c of extractCodeLines(body)) {
    for (const rule of DENYLIST) {
      if (rule.re.test(c.text)) hits.push({ line: c.line, name: rule.name, text: c.text });
    }
  }
  return hits;
}

/**
 * Root-relative link targets (`](/...)`), anchors stripped, deduped, in order.
 * External links are not checked offline.
 * @param {string} body
 * @returns {string[]}
 */
export function extractInternalLinks(body) {
  const seen = new Set();
  for (const m of body.matchAll(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g)) seen.add(m[1]);
  return [...seen];
}

/**
 * @param {string} text
 * @param {string} siteUrl
 */
export function absolutiseLinks(text, siteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  return text.replace(/\]\((\/[^)\s]*)\)/g, (_m, p) => `](${base}${p})`);
}

/**
 * Load every *.md in contentDir. Slug must equal the filename stem; orders must
 * be unique. Anything else is an authoring error that would otherwise vanish
 * from the index silently (the "no orphans" rule).
 * @param {string} contentDir
 */
export function loadRunbooks(contentDir) {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md")).sort();
  if (files.length === 0) throw new Error(`no runbooks found in ${contentDir}`);
  const runbooks = files.map((filename) => {
    const raw = fs.readFileSync(path.join(contentDir, filename), "utf-8");
    const { meta, body } = parseFrontMatter(raw, filename);
    const stem = filename.replace(/\.md$/, "");
    if (meta.slug !== stem) throw new Error(`${filename}: slug "${meta.slug}" must equal the filename stem "${stem}"`);
    return { ...meta, body, filename };
  });
  const orders = new Map();
  for (const r of runbooks) {
    if (orders.has(r.order)) throw new Error(`${r.filename}: order ${r.order} is already used by ${orders.get(r.order)}`);
    orders.set(r.order, r.filename);
  }
  return runbooks.sort((a, b) => a.order - b.order);
}

/**
 * @param {any} runbook
 * @param {Record<string, any>} facts
 * @param {string} siteUrl
 */
export function renderRunbook(runbook, facts, siteUrl) {
  const { text, used } = interpolate(runbook.body, facts);
  const markdown = absolutiseLinks(text, siteUrl);
  const { body: _b, filename: _f, ...meta } = runbook;
  void _b;
  void _f;
  return { ...meta, markdown, url: `${siteUrl}${RUNBOOK_URL_PREFIX}${runbook.slug}.md`, used: [...used].sort() };
}

/**
 * @param {any[]} runbooks
 * @param {Record<string, any>} facts
 * @param {string} siteUrl
 * @param {Array<{title: string, url: string, description: string}>} reference
 */
export function buildIndex(runbooks, facts, siteUrl, reference) {
  return { siteUrl, runbooks: runbooks.map((r) => renderRunbook(r, facts, siteUrl)), reference };
}

const CORPUS_INTRO =
  "> Static, read-only instructions a customer's AI agent can follow to walk them through " +
  "Kuju Email invite redemption, DNS delegation, mailbox migration and delivery troubleshooting. " +
  "Every command is read-only. Angle-bracket placeholders like <domain> are for you to fill in at run time. " +
  "Steps marked HUMAN ACTION cannot be done by an agent: hand them to the person and wait.";

/** llms.txt per llmstxt.org: H1, blockquote summary, H2 sections of `- [name](url): description`. */
export function renderLlmsTxt(index) {
  const lines = ["# Kuju Email — agent runbooks", "", CORPUS_INTRO, "", "## Runbooks (read start-here first)", ""];
  for (const r of index.runbooks) lines.push(`- [${r.title}](${r.url}): ${r.outcome}`);
  lines.push("", "## Reference", "");
  for (const d of index.reference) lines.push(`- [${d.title}](${d.url}): ${d.description}`);
  lines.push("", "## Optional", "", `- [Everything in one file](${index.siteUrl}/llms-full.txt): the runbooks and reference concatenated`, "");
  return lines.join("\n");
}

/**
 * @param {any} index
 * @param {Record<string, string>} referenceBodies markdown keyed by reference url
 */
export function renderLlmsFullTxt(index, referenceBodies) {
  const parts = ["# Kuju Email — agent runbooks (full corpus)", "", CORPUS_INTRO, ""];
  for (const r of index.runbooks) parts.push(`<!-- ${r.url} -->`, "", r.markdown.trim(), "", "---", "");
  for (const d of index.reference) {
    const body = referenceBodies[d.url];
    if (typeof body !== "string") throw new Error(`llms-full: no body supplied for reference doc ${d.url}`);
    parts.push(`<!-- ${d.url} -->`, "", body.trim(), "", "---", "");
  }
  return parts.join("\n");
}
