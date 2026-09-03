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
const RESERVED_KEYS = new Set(["verify", "pending", "unverifiable"]);

/**
 * @param {string} factsPath absolute path to mail-facts.yaml
 * @returns {Record<string, any>}
 */
export function loadFacts(factsPath) {
  const raw = fs.readFileSync(factsPath, "utf-8");
  let parsed;
  try {
    parsed = yaml.parse(raw);
  } catch (err) {
    throw new Error(`facts file ${factsPath} is not valid YAML: ${err.message}`);
  }
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

/** Live MX expectation, derived from the SAME leaves the runbooks render. */
export function mxExpectation(mx) { return `${mx.priority} ${mx.target}.`; }

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
  // Fix round 3 (reviewer-confirmed: rounds 1 and 2 were the SAME boundary
  // treated as one knob, oscillating). Leading and trailing are different
  // problems with different character classes:
  //   - LEADING = command position: `(^|[\s;&|(])` — start of line, or after
  //     `;`/`&`/`|`/`(`/whitespace. A hyphen is correctly NEVER in this class,
  //     which is what keeps "yyyy-mm-dd" and "graceful-shutdown" allowed
  //     (round 1's mistake was widening this to a bare `\b`, which treats a
  //     hyphen as a boundary too).
  //   - TRAILING = command terminator: `(\s|[;&|)]|$)` — whitespace, or one of
  //     `;`/`&`/`|`/`)` (a shell one-liner needs no space before these), or
  //     end of string. A hyphen is correctly never in this class either
  //     (round 2's mistake was narrowing this back to `(\s|$)`, which missed
  //     that `reboot;true`, `shutdown)`, and `(rm)` are complete, executable
  //     one-liners with no argument and no trailing space).
  // Optional path segment `(?:\S*\/)?` sits between them, unchanged since
  // round 1/2. Accepted trade-off (ruled on explicitly): a bare `(dd)` is now
  // denied, since in a real shell `(dd)` is a subshell invocation — the only
  // cost is a contrived `(yyyy)-(mm)-(dd)` date format, which fails CLOSED.
  { name: "rm", re: /(^|[\s;&|(])(?:\S*\/)?rm(\s|[;&|)]|$)/ },
  { name: "curl write verb", re: /\bcurl\b.*\s-X\s*(POST|PUT|PATCH|DELETE)\b/i },
  { name: "curl upload flag", re: /\bcurl\b.*\s(-d|--data(-\w+)?|-F|--form|-T|--upload-file)(\s|$)/ },
  // `-u\S` catches curl's getopt-style attached form (`-uadmin:pw`). The
  // second alternative catches a SINGLE-DASH cluster containing `u`
  // (`-su`, `-sun`) without also matching the GNU long option `--url`: the
  // `(?!-)` after the first `-` rejects a second leading dash outright, so
  // `--url`'s two dashes never enter the cluster branch at all.
  { name: "credential flag", re: /\s(-u\S|-(?!-)[a-zA-Z]*u[a-zA-Z]*(?=\s|=|$)|--user(\s|=)|--password(\s|=)|--token(\s|=)|--api-key(\s|=))/ },
  // /i: an "authorization:"/"bearer" header is credential-bearing regardless
  // of case; the header name and scheme are conventionally capitalised but
  // HTTP header matching is case-insensitive and so is this rule now.
  { name: "auth header", re: /Authorization:|\bBearer\s+\S+/i },
  { name: "nsupdate", re: /\bnsupdate\b/ },
  { name: "privileged or destructive tool", re: /(^|[\s;&|(])(?:\S*\/)?(sudo|doas|dd|mkfs\S*|chmod|chown|kill|killall|pkill|shutdown|reboot|systemctl|launchctl)(\s|[;&|)]|$)/ },
  { name: "remote shell or package tool", re: /(^|[\s;&|(])(?:\S*\/)?(ssh|scp|sftp|rsync|kubectl|docker|helm|npm|npx|pip3?|brew|apt(-get)?|yum|dnf)(\s|[;&|)]|$)/ },
  { name: "file write redirect", re: /(^|\s)[12&]?>>?\s*(?!&[12](\s|$))(?!\/dev\/null(\s|$))\S/ },
  // Same terminator-class fix applies here: round 1's trailing `\b` treated a
  // hyphen as a boundary, over-denying `bash-completion`/`node-red`/
  // `perl-critic`; round 2 never touched this rule (it wasn't in Finding 1's
  // list), so it kept over-denying until this round.
  { name: "pipe to shell", re: /\|\s*(?:\S*\/)?(sh|bash|zsh|dash|python3?|perl|node)(\s|[;&|)]|$)/ },
];

/**
 * @param {string} raw
 * @param {string} filename
 * @returns {{meta: any, body: string}}
 */
export function parseFrontMatter(raw, filename) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${filename}: missing front-matter (expected a leading --- block)`);
  let meta;
  try {
    meta = yaml.parse(m[1]) ?? {};
  } catch (err) {
    throw new Error(`${filename}: front-matter is not valid YAML: ${err.message}`);
  }
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

/** The "Before you start" block. Empty list → empty string (start-here). */
export function renderPreconditions(preconditions) {
  if (!preconditions?.length) return "";
  return [
    "**Before you start.** This runbook assumes:",
    "",
    ...preconditions.map((p) => `- ${p}`),
    "",
    "If one of these is not true, say so before you continue — a step below may " +
      "already tell you what to do about it, so keep reading before you stop. Only " +
      "abort here if nothing further down handles it.",
  ].join("\n");
}

/**
 * Insert after the first H1 line that is NOT inside a fenced code block —
 * fence tracking mirrors extractCodeLines' (toggle on `/^\s*```/`, skip
 * lines while inside), so a runbook that shows a fenced markdown/llms.txt
 * EXAMPLE containing a bare `# ` line cannot have the block spliced into
 * that example. A body with no such H1 gets the block prepended.
 */
function injectAfterH1(text, block) {
  if (!block) return text;
  const lines = text.split("\n");
  let inFence = false;
  let pos = 0;
  let at = -1;
  for (const raw of lines) {
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
    } else if (at === -1 && !inFence && /^# .*$/.test(raw)) {
      at = pos + raw.length;
    }
    pos += raw.length + 1;
  }
  if (at === -1) return `${block}\n\n${text}`;
  // text.slice(at) already starts with the blank line that followed the H1
  // in the source, so the block is NOT followed by an extra "\n" here — an
  // extra one would double that blank line in the served bytes (D7 fix
  // round 1, Finding 2).
  return `${text.slice(0, at)}\n\n${block}${text.slice(at)}`;
}

/**
 * @param {any} runbook
 * @param {Record<string, any>} facts
 * @param {string} siteUrl
 */
export function renderRunbook(runbook, facts, siteUrl) {
  const { text, used } = interpolate(runbook.body, facts);
  const markdown = absolutiseLinks(injectAfterH1(text, renderPreconditions(runbook.preconditions)), siteUrl);
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
  for (const r of index.runbooks) {
    // Gate the summary line on renderPreconditions itself (not a raw
    // .length check) so this and the runbook body share one source of
    // truth for "does this doc have a preconditions block" — see the
    // falsifiability protocol in scripts/corpus-selftest.mjs.
    const hasBlock = renderPreconditions(r.preconditions) !== "";
    lines.push(
      `- [${r.title}](${r.url}): ${r.outcome}${hasBlock ? ` — Assumes: ${r.preconditions.join("; ")}.` : ""}`,
    );
  }
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
