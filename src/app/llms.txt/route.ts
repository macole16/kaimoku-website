import { TEXT_HEADERS, renderLlmsTxt } from "@/lib/agent-corpus";

/** Curated map of the corpus (llmstxt.org). Generated, never hand-edited. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLlmsTxt(), { headers: TEXT_HEADERS });
}
