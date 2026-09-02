import path from "path";
import { SITE_URL } from "@/lib/constants";
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

/** Filled in by Task 6. */
export function renderGlossaryMarkdown(): string {
  return "# Kuju Email glossary\n";
}

/** Filled in by Task 6. */
export function renderApiDocsMarkdown(): string {
  return "# Kuju Email API reference\n";
}
