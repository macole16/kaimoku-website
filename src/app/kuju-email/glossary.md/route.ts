import { MARKDOWN_HEADERS, renderGlossaryMarkdown } from "@/lib/agent-corpus";

/** Generated twin of /kuju-email/glossary. Same source (src/lib/glossary.ts). */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderGlossaryMarkdown(), { headers: MARKDOWN_HEADERS });
}
