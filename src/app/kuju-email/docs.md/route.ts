import { MARKDOWN_HEADERS, renderApiDocsMarkdown } from "@/lib/agent-corpus";

/** Generated twin of /kuju-email/docs. Same source (openapi.yaml + api-overlay.yaml). */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderApiDocsMarkdown(), { headers: MARKDOWN_HEADERS });
}
