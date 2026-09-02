import { TEXT_HEADERS, renderLlmsFullTxt } from "@/lib/agent-corpus";

/** The whole corpus in one file, for agents that fetch once. Generated. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLlmsFullTxt(), { headers: TEXT_HEADERS });
}
