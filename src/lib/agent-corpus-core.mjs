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
