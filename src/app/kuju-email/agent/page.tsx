import type { Metadata } from "next";
import Link from "next/link";
import { buildCorpusIndex } from "@/lib/agent-corpus";
import { SITE_URL } from "@/lib/constants";
import { CopyButton } from "@/components/agent/CopyButton";
import { PreLaunchNotice } from "@/components/PreLaunchNotice";

export const metadata: Metadata = {
  title: "Hand this to your agent · Kuju Email",
  description:
    "Read-only runbooks an AI agent can follow to walk you through Kuju Email invite redemption, DNS delegation, migration and delivery troubleshooting.",
};

const PROMPT = `You are helping me set up Kuju Email. Read ${SITE_URL}/llms.txt, then start with the runbook it lists first. Follow the runbooks exactly: only run the read-only commands they show, replace <domain> with my domain, and stop at every HUMAN ACTION step and tell me what to do. Never invent a value you did not observe.`;

export default function AgentLandingPage() {
  const index = buildCorpusIndex();
  return (
    <>
      <PreLaunchNotice what="This corpus" />
      <section className="bg-gradient-to-br from-surface-deep via-surface-mist to-surface-deep px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
            Kuju Email · for AI agents
          </p>
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight md:text-5xl">
            <em className="text-kuju-light">Hand this to your agent.</em>
          </h1>
          <p className="text-lg leading-[1.7] text-slate-300">
            These are runbooks written for an AI agent rather than a person:
            every step branches on something the agent can observe, every
            command is read-only, and every step a human must do is marked.
            Paste the prompt below into your agent, or give it any single
            runbook URL.
          </p>
          <p className="mt-8 text-sm">
            <Link href="/kuju-email" className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline">
              ← Back to Kuju Email
            </Link>
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <h2 className="mb-3 text-2xl text-primary">The prompt</h2>
            <pre className="mb-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {PROMPT}
            </pre>
            <CopyButton text={PROMPT} label="Copy prompt" />
          </div>

          <div>
            <h2 className="mb-3 text-2xl text-primary">Runbooks</h2>
            <ul className="space-y-4">
              {index.runbooks.map((r) => (
                <li key={r.slug} className="flex flex-wrap items-baseline justify-between gap-2 border-l-2 border-slate-200 pl-4">
                  <div>
                    <a href={r.url} className="font-medium text-kuju-dark underline underline-offset-4 hover:text-kuju">
                      {r.title}
                    </a>
                    <p className="text-sm text-slate-600">{r.outcome}</p>
                    {r.preconditions.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">
                        <li className="list-none -ml-4 font-medium">Assumes:</li>
                        {r.preconditions.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    )}
                    <p className="font-mono text-xs text-slate-500">{r.url}</p>
                  </div>
                  <CopyButton text={r.url} label="Copy URL" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl text-primary">Index files</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`${SITE_URL}/llms.txt`} className="font-mono text-kuju-dark underline underline-offset-4 hover:text-kuju">{`${SITE_URL}/llms.txt`}</a>
                <span className="text-slate-600"> — the map (short)</span>
              </li>
              <li>
                <a href={`${SITE_URL}/llms-full.txt`} className="font-mono text-kuju-dark underline underline-offset-4 hover:text-kuju">{`${SITE_URL}/llms-full.txt`}</a>
                <span className="text-slate-600"> — everything in one file</span>
              </li>
              {index.reference.map((d) => (
                <li key={d.url}>
                  <a href={d.url} className="font-mono text-kuju-dark underline underline-offset-4 hover:text-kuju">{d.url}</a>
                  <span className="text-slate-600"> — {d.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
