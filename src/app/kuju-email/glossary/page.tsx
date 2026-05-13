import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Email Security Glossary | Kuju Email",
  description:
    "Plain-language definitions for the security terms used across Kuju Email — SPF, DKIM, DMARC, TLS, and more.",
};

const entriesSorted = [...GLOSSARY].sort((a, b) =>
  a.term.localeCompare(b.term),
);

export default function GlossaryPage() {
  return (
    <>
      {/* Hero — quiet intro band, matches /kuju-email/guide visual rhythm */}
      <section className="bg-gradient-to-br from-surface-deep via-surface-mist to-surface-deep px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-300"
          >
            Kuju Email · reference
          </p>
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight md:text-5xl">
            <em className="text-kuju-light">Email security glossary.</em>
          </h1>
          <p
            className="text-lg leading-[1.7] text-slate-300"
          >
            Plain definitions for the security terms we use across Kuju Email.
            We&apos;d rather teach you the words than hide them.
          </p>
          <p className="mt-8 text-sm">
            <Link
              href="/kuju-email"
              className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              ← Back to Kuju Email
            </Link>
          </p>
        </div>
      </section>

      {/* Entries */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {entriesSorted.map((entry) => (
            <article key={entry.id} id={entry.id} className="scroll-mt-24">
              <h2 className="mb-3 text-2xl text-primary md:text-3xl">
                <span className="font-semibold">{entry.term}</span>
                {entry.expansion && (
                  <span className="ml-2 text-base text-slate-500 md:text-lg">
                    — {entry.expansion}
                  </span>
                )}
              </h2>
              <p
                className="mb-4 text-base leading-[1.75] text-slate-700"
              >
                {entry.definition}
              </p>
            {entry.examples && entry.examples.length > 0 && (
              <div className="mb-4 space-y-3">
                {entry.examples.map((ex) => (
                  <div
                    key={ex.label}
                    className="border-l-2 border-slate-200 pl-4"
                  >
                    <p className="mb-1 text-xs italic text-slate-500">
                      {ex.label}:
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                      <code className="font-mono">{ex.body}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
              <p className="text-base italic leading-[1.7] text-slate-600">
                <span className="not-italic font-medium text-primary">
                  Why it matters:
                </span>{" "}
                {entry.whyItMatters}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Outro */}
      <section className="border-t border-slate-200 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-slate-600">
            <Link
              href="/kuju-email"
              className="underline-offset-4 hover:text-kuju hover:underline"
            >
              ← Back to Kuju Email
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
