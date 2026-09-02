import path from "path";
import { SITE_URL } from "@/lib/constants";
import { loadApiDocs } from "@/lib/api-docs";
import { GLOSSARY } from "@/lib/glossary";
import {
  buildIndex,
  loadFacts,
  loadRunbooks,
  renderLlmsFullTxt as coreRenderLlmsFullTxt,
  renderLlmsTxt as coreRenderLlmsTxt,
} from "@/lib/agent-corpus-core.mjs";

// ---------------------------------------------------------------------------
// Types (the core is plain JS; these are the shapes it returns)
// ---------------------------------------------------------------------------

export interface RunbookMeta {
  slug: string;
  title: string;
  order: number;
  preconditions: string[];
  outcome: string;
  facts_used: string[];
}

export interface RenderedRunbook extends RunbookMeta {
  /** Fully interpolated markdown with absolute internal links. */
  markdown: string;
  /** Absolute URL, e.g. https://kaimoku-website.vercel.app/kuju-email/agent/dns-delegation.md */
  url: string;
  /** Top-level fact keys the body actually referenced. */
  used: string[];
}

export interface ReferenceDoc {
  title: string;
  url: string;
  description: string;
}

export interface CorpusIndex {
  siteUrl: string;
  runbooks: RenderedRunbook[];
  reference: ReferenceDoc[];
}

export const MARKDOWN_HEADERS = { "Content-Type": "text/markdown; charset=utf-8" } as const;
export const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8" } as const;

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "agent");
const FACTS_PATH = path.join(process.cwd(), "src", "data", "mail-facts.yaml");

export const GLOSSARY_MD_URL = `${SITE_URL}/kuju-email/glossary.md`;
export const API_DOCS_MD_URL = `${SITE_URL}/kuju-email/docs.md`;

const REFERENCE: ReferenceDoc[] = [
  {
    title: "Email security glossary",
    url: GLOSSARY_MD_URL,
    description: "Plain-language definitions of SPF, DKIM, DMARC, MX and the other terms the runbooks use",
  },
  {
    title: "Kuju Email API reference",
    url: API_DOCS_MD_URL,
    description: "Endpoint list generated from the OpenAPI spec; informational only — the runbooks never call it",
  },
];

// Memoised: generateStaticParams and GET both call this during one build.
let cached: CorpusIndex | undefined;

/**
 * Load, interpolate and index the corpus. Synchronous file reads, safe in
 * server components and route handlers at build time — mirrors loadApiDocs().
 * Throws on an unknown {{fact:...}}: that is the second gate behind
 * scripts/check-corpus.mjs, so a bare `next build` cannot ship one either.
 */
export function buildCorpusIndex(): CorpusIndex {
  if (!cached) {
    const facts = loadFacts(FACTS_PATH);
    const runbooks = loadRunbooks(CONTENT_DIR);
    cached = buildIndex(runbooks, facts, SITE_URL, REFERENCE) as CorpusIndex;
  }
  return cached;
}

export function renderLlmsTxt(): string {
  return coreRenderLlmsTxt(buildCorpusIndex());
}

export function renderLlmsFullTxt(): string {
  return coreRenderLlmsFullTxt(buildCorpusIndex(), {
    [GLOSSARY_MD_URL]: renderGlossaryMarkdown(),
    [API_DOCS_MD_URL]: renderApiDocsMarkdown(),
  });
}

/**
 * Markdown twin of /kuju-email/glossary, from the same GLOSSARY array the page
 * renders. Sorted by term like the page. Examples become fenced blocks.
 */
export function renderGlossaryMarkdown(): string {
  const entries = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const lines: string[] = [
    "# Kuju Email glossary",
    "",
    `Plain definitions for the security terms used across Kuju Email. HTML version: ${SITE_URL}/kuju-email/glossary`,
    "",
  ];
  for (const e of entries) {
    lines.push(`## ${e.term}${e.expansion ? ` — ${e.expansion}` : ""}`, "", e.definition, "");
    for (const ex of e.examples ?? []) {
      lines.push(`*${ex.label}:*`, "", "```", ex.body, "```", "");
    }
    lines.push(`**Why it matters:** ${e.whyItMatters}`, "");
  }
  return lines.join("\n");
}

/**
 * Markdown twin of /kuju-email/docs from openapi.yaml + api-overlay.yaml via
 * loadApiDocs(). The HTML page's hand-written prose subsections (base URL,
 * authentication) are JSX and are NOT duplicated here; the twin links to them.
 * Informational for an agent: the runbooks never call the API.
 */
export function renderApiDocsMarkdown(): string {
  const { sections } = loadApiDocs();
  const lines: string[] = [
    "# Kuju Email API reference",
    "",
    `Generated from the OpenAPI spec. Base URL, authentication and examples are on the HTML page: ${SITE_URL}/kuju-email/docs`,
    "",
  ];
  for (const s of sections) {
    lines.push(`## ${s.name}`, "");
    for (const sub of s.children) {
      lines.push(`### ${sub.name}`, "");
      if (sub.endpoints.length === 0) {
        lines.push(`See ${SITE_URL}/kuju-email/docs#${sub.id}`, "");
        continue;
      }
      lines.push("| Method | Path | Auth | Description |", "| --- | --- | --- | --- |");
      for (const ep of sub.endpoints) {
        const desc = (ep.desc ?? "").replace(/\|/g, "\\|");
        lines.push(`| ${ep.method.toUpperCase()} | \`${ep.path}\` | ${ep.auth ?? "public"} | ${desc} |`);
      }
      lines.push("");
      for (const ep of sub.endpoints) {
        if (!ep.parameters?.length) continue;
        lines.push(`Parameters for \`${ep.method.toUpperCase()} ${ep.path}\`:`, "");
        for (const p of ep.parameters) {
          lines.push(`- \`${p.name}\` (${p.in}${p.required ? ", required" : ""})${p.description ? `: ${p.description}` : ""}`);
        }
        lines.push("");
      }
    }
  }
  return lines.join("\n");
}
