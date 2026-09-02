import { MARKDOWN_HEADERS, buildCorpusIndex } from "@/lib/agent-corpus";

/**
 * One runbook as text/markdown at /kuju-email/agent/<slug>.md.
 *
 * The dynamic segment VALUE carries the `.md` suffix (Next.js does not support
 * a partial segment like `[slug].md`). force-static + generateStaticParams
 * prerenders every runbook at build time; dynamicParams=false makes any other
 * value a 404 instead of a runtime render. Explicit suffix, not content
 * negotiation: a URL a person can paste to an agent is the delivery mechanism.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { file: string }[] {
  return buildCorpusIndex().runbooks.map((r) => ({ file: `${r.slug}.md` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const runbook = buildCorpusIndex().runbooks.find((r) => `${r.slug}.md` === file);
  if (!runbook) return new Response("Not found", { status: 404, headers: TEXT_404 });
  return new Response(runbook.markdown, { headers: MARKDOWN_HEADERS });
}

const TEXT_404 = { "Content-Type": "text/plain; charset=utf-8" } as const;
