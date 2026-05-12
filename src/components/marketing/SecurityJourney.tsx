"use client";

import Link from "next/link";

// The four checks every inbound message passes through.
// `techniques[].glossaryId` MUST match an `id` in src/lib/glossary.ts —
// it is the anchor the dotted-link technique label deep-links into.

type Technique = {
  label: string;
  glossaryId: string;
};

type Checkpoint = {
  /** Display label, italic in the UI (e.g. "Identity"). */
  label: string;
  /** Lowercase question shown under the label (e.g. "who sent this?"). */
  question: string;
  /** Two techniques per checkpoint, rendered as dotted-link mono labels. */
  techniques: [Technique, Technique];
};

const CHECKPOINTS: readonly Checkpoint[] = [
  {
    label: "Identity",
    question: "who sent this?",
    techniques: [
      { label: "SPF · DKIM · DMARC", glossaryId: "spf" },
      { label: "relay-hop trace", glossaryId: "relay-hop-trace" },
    ],
  },
  {
    label: "Path",
    question: "where did it come from?",
    techniques: [
      { label: "reputation checks", glossaryId: "reputation-checks" },
      {
        label: "spam & phishing patterns",
        glossaryId: "spam-and-phishing-patterns",
      },
    ],
  },
  {
    label: "Contents",
    question: "is it safe to open?",
    techniques: [
      { label: "URL safe-browsing", glossaryId: "url-safe-browsing" },
      { label: "virus stripping", glossaryId: "virus-stripping" },
    ],
  },
  {
    label: "Handoff",
    question: "does it arrive intact?",
    techniques: [
      { label: "TLS in flight", glossaryId: "tls-in-flight" },
      { label: "encrypted at rest", glossaryId: "encrypted-at-rest" },
    ],
  },
] as const;

const glossaryHref = (id: string) => `/kuju-email/glossary#${id}`;

export function SecurityJourney() {
  return (
    <section id="security" className="bg-surface px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl md:mb-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            How a message reaches you
          </p>
          <h2 className="mb-5 text-3xl leading-[1.2] tracking-tight text-primary md:text-4xl">
            <em>Every message passes through four checks</em>
            <br />
            before it reaches you.
          </h2>
          <p className="text-lg leading-[1.7] text-slate-600">
            We watch each arrival in four passes: the sender, the path, the
            contents, and the handoff. None of them ask you to think.
          </p>
        </div>

        {/* Mobile / SR semantic stack — desktop SVG (Task 5) will be hidden < md and visible ≥ md; this stack inverts that. */}
        <ol className="mx-auto max-w-md space-y-4 md:hidden">
          <li className="text-center text-sm italic text-slate-500">
            ✉ a message
          </li>
          {CHECKPOINTS.map((cp) => (
            <li
              key={cp.label}
              className="rounded border border-primary/60 bg-white p-4 shadow-sm"
            >
              <h3 className="mb-1 text-lg italic text-primary">{cp.label}</h3>
              <p className="mb-3 text-sm text-slate-500">{cp.question}</p>
              <ul className="space-y-1 text-xs">
                {cp.techniques.map((t) => (
                  <li key={t.glossaryId}>
                    <Link
                      href={glossaryHref(t.glossaryId)}
                      className="font-mono text-kuju underline decoration-dotted underline-offset-4 hover:text-kuju-dark"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li className="text-center text-sm italic text-slate-500">
            → your inbox
          </li>
        </ol>

        {/* Glossary link */}
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm italic text-slate-600">
          Unfamiliar terms?{" "}
          <Link
            href="/kuju-email/glossary"
            className="not-italic text-kuju underline decoration-dotted underline-offset-4 hover:text-kuju-dark"
          >
            Email security glossary →
          </Link>
        </p>

        {/* Closer */}
        <p className="mx-auto mt-10 max-w-2xl border-t border-slate-200 pt-8 text-center text-sm italic leading-[1.7] text-slate-600">
          Hidden detail isn&apos;t reassuring — visible, quiet detail is.
          We&apos;d rather teach you the words than hide them.
        </p>
      </div>
    </section>
  );
}
