// Client-side: scroll-triggered glide animation via IntersectionObserver.
"use client";

import { useEffect, useRef, useState } from "react";
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
  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const [hasGlided, setHasGlided] = useState(false);

  useEffect(() => {
    const node = svgWrapRef.current;
    if (!node) return;

    // Respect reduced motion: skip the glide entirely, leave message at rest.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasGlided(true);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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

        {/* Desktop SVG diagram — hidden < md, visible ≥ md */}
        <div ref={svgWrapRef} className="hidden md:block">
          <svg
            viewBox="0 0 880 220"
            className="mx-auto w-full max-w-5xl"
            role="img"
            aria-labelledby="security-journey-title security-journey-desc"
          >
            <title id="security-journey-title">
              How a message reaches you
            </title>
            <desc id="security-journey-desc">
              A four-step journey diagram. An incoming message moves left to
              right through four checkpoints — Identity (SPF, DKIM, DMARC,
              relay-hop trace), Path (reputation checks, spam &amp; phishing
              patterns), Contents (URL safe-browsing, virus stripping), and
              Handoff (TLS in flight, encrypted at rest) — before landing in
              the user&apos;s inbox.
            </desc>

            {/* Envelope (start) */}
            <g>
              <rect
                x="20"
                y="90"
                width="44"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-primary"
              />
              <path
                d="M 20 90 L 42 108 L 64 90"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-primary"
              />
              <text
                x="42"
                y="148"
                textAnchor="middle"
                fontSize="11"
                fontStyle="italic"
                fill="currentColor"
                className="text-slate-500"
                style={{ fontFamily: "var(--font-display)" }}
              >
                a message
              </text>
            </g>

            {/* Journey path */}
            <path
              d="M 70 106 L 820 106"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="3 3"
              opacity="0.5"
              className="text-primary"
            />

            {/* Animated message glyph that glides from envelope to inbox.
                Initially positioned at the envelope; receives the
                .is-gliding class once the section is in view. */}
            <g
              className={
                hasGlided
                  ? "security-journey-glide is-gliding"
                  : "security-journey-glide"
              }
            >
              <rect
                x="0"
                y="98"
                width="14"
                height="10"
                fill="var(--color-kuju)"
                opacity="0.85"
              />
            </g>

            {/* Four checkpoints, programmatically positioned */}
            {CHECKPOINTS.map((cp, i) => {
              const x = 100 + i * 170;
              const cx = x + 70;
              return (
                <g key={cp.label}>
                  <rect
                    x={x}
                    y="76"
                    width="140"
                    height="60"
                    fill="var(--color-surface)"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary"
                  />
                  <text
                    x={cx}
                    y="100"
                    textAnchor="middle"
                    fontSize="13"
                    fontStyle="italic"
                    fill="currentColor"
                    className="text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {cp.label}
                  </text>
                  <text
                    x={cx}
                    y="118"
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                    className="text-slate-500"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cp.question}
                  </text>
                  {cp.techniques.map((t, ti) => (
                    <a
                      key={t.glossaryId}
                      href={glossaryHref(t.glossaryId)}
                      className="text-kuju hover:text-kuju-dark"
                    >
                      <text
                        x={cx}
                        y={158 + ti * 12}
                        textAnchor="middle"
                        fontSize="8"
                        fill="currentColor"
                        textDecoration="underline"
                        fontFamily="ui-monospace, Menlo, monospace"
                        style={{ textDecorationStyle: "dotted" }}
                      >
                        {t.label}
                      </text>
                    </a>
                  ))}
                </g>
              );
            })}

            {/* Arrow into inbox */}
            <polygon
              points="820,106 812,101 812,111"
              fill="currentColor"
              className="text-primary"
            />

            {/* Inbox (end) */}
            <g>
              <rect
                x="820"
                y="90"
                width="36"
                height="32"
                fill="currentColor"
                className="text-primary"
              />
              <text
                x="838"
                y="148"
                textAnchor="middle"
                fontSize="11"
                fontStyle="italic"
                fill="currentColor"
                className="text-slate-500"
                style={{ fontFamily: "var(--font-display)" }}
              >
                your inbox
              </text>
            </g>
          </svg>
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
