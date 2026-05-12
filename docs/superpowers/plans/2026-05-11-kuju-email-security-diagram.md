# Kuju Email — Security Diagram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "How a message reaches you" section on `/kuju-email` and a new `/kuju-email/glossary` page, per spec `docs/superpowers/specs/2026-05-11-kuju-email-security-diagram-design.md`.

**Architecture:** One React component (`SecurityJourney.tsx`) that renders the same checkpoint data twice — a desktop SVG with a scroll-triggered glide animation, and a mobile semantic-HTML stack that also serves as the screen-reader fallback. A new glossary route (`/kuju-email/glossary`) renders entries from a single typed array. Anchor IDs link the two surfaces — dotted links in the diagram jump straight into the matching glossary entry.

**Tech Stack:** Next.js 16, React 19, Tailwind 4 (no new deps). Verification via `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `npm run dev` manual check at the listed breakpoints and a11y conditions.

**Spec reference:** Throughout, "the spec" means `docs/superpowers/specs/2026-05-11-kuju-email-security-diagram-design.md`. The plan documents _how_ — design rationale lives in the spec.

---

## File Structure

| File                                           | Action | Responsibility                                                                                                                                                                                                                        |
| ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/glossary.ts`                          | Create | Typed array of 14 glossary entries — single source of truth for both the glossary page and the deep-link anchors used by the diagram.                                                                                                 |
| `src/app/kuju-email/glossary/page.tsx`         | Create | Glossary route. Renders entries from `GLOSSARY` alphabetically with kebab-cased anchor IDs.                                                                                                                                           |
| `src/components/marketing/SecurityJourney.tsx` | Create | The new product-page section. Contains the four-checkpoint data, renders desktop SVG + mobile semantic stack, owns the scroll-into-view animation.                                                                                    |
| `src/app/kuju-email/page.tsx`                  | Modify | Insert `<SecurityJourney />` between the standouts grid and the "Move your domain" section. Add `id="security"` to the section. Add a "See how a message reaches you →" anchor link to the existing "Defense in depth" standout card. |
| `src/components/Footer.tsx`                    | Modify | Add a "Security Glossary" link to the Products group, between "User Guide" and "Try Kuju Email".                                                                                                                                      |

No other files touched. No new dependencies.

---

## Task 1: Glossary data foundation

**Files:**

- Create: `src/lib/glossary.ts`

- [ ] **Step 1: Create `src/lib/glossary.ts` with the 14 entries**

```typescript
// Single source of truth for the /kuju-email/glossary page and the
// anchor IDs used by deep links from the SecurityJourney diagram.
// Adding a new term here adds it to the glossary page automatically.
// Changing the `id` field is a breaking change — diagram links use it.

export type GlossaryEntry = {
  /** kebab-cased anchor ID, e.g. "spf", "relay-hop-trace". Stable; used in URLs. */
  id: string;
  /** Display term, e.g. "SPF" or "Relay-hop trace". */
  term: string;
  /** Full expansion, e.g. "Sender Policy Framework". Empty string if N/A. */
  expansion: string;
  /** 1-2 plain-language sentences explaining the mechanic. */
  definition: string;
  /** 1 sentence connecting the mechanic back to the prospect's concern. */
  whyItMatters: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "spf",
    term: "SPF",
    expansion: "Sender Policy Framework",
    definition:
      "A DNS record listing which mail servers are allowed to send mail for your domain. Receivers check this list when a message arrives.",
    whyItMatters:
      "Without SPF, anyone can claim to send mail from your address. With it, fakes get caught at the door.",
  },
  {
    id: "dkim",
    term: "DKIM",
    expansion: "DomainKeys Identified Mail",
    definition:
      "A cryptographic signature attached to each outgoing message, verified by the recipient's mail server against a public key in your DNS.",
    whyItMatters:
      "It proves the message wasn't altered between the sender and you.",
  },
  {
    id: "dmarc",
    term: "DMARC",
    expansion:
      "Domain-based Message Authentication, Reporting, and Conformance",
    definition:
      "A DNS policy telling receiving servers what to do when a message claiming to be from your domain fails SPF or DKIM checks — reject it, quarantine it, or just report it.",
    whyItMatters:
      "SPF and DKIM detect impersonation; DMARC decides what to do about it.",
  },
  {
    id: "relay-hop-trace",
    term: "Relay-hop trace",
    expansion: "",
    definition:
      'Mail messages pass through a chain of servers ("hops") on the way to you, and each hop adds a Received header. Inspecting the chain reveals where a message really came from.',
    whyItMatters:
      'Some phishing attempts forge the visible "From" address but can\'t hide their true path. Tracing the hops surfaces those fakes.',
  },
  {
    id: "reputation-checks",
    term: "Reputation checks",
    expansion: "",
    definition:
      "External services maintain lists scoring the trustworthiness of sending mail servers, IP addresses, and domains based on historical behavior. Incoming mail is scored against those lists.",
    whyItMatters:
      "Known spammers and compromised servers get caught even when their individual messages look innocuous.",
  },
  {
    id: "spam-and-phishing-patterns",
    term: "Spam & phishing patterns",
    expansion: "",
    definition:
      "A library of structural signals — suspicious links, unusual formatting, common scam phrasing — that mail filters use to classify messages alongside the reputation score.",
    whyItMatters:
      "New scams get caught quickly when they reuse patterns from older scams, even when they come from new addresses.",
  },
  {
    id: "url-safe-browsing",
    term: "URL safe-browsing",
    expansion: "",
    definition:
      "Every link in a message is checked against Google Safe Browsing's continuously-updated list of known phishing, malware, and unwanted-software sites.",
    whyItMatters:
      "Even a message that passes every other check can carry a link to a malicious site. This is the last check before you click.",
  },
  {
    id: "virus-stripping",
    term: "Virus stripping",
    expansion: "",
    definition:
      "Attachments are scanned with anti-virus engines before the message is delivered. Confirmed malicious files are removed automatically; the message body still arrives so you don't miss what was sent.",
    whyItMatters:
      "Most malicious attachments arrive as ordinary-looking documents. Stripping them keeps the message useful without putting your machine at risk.",
  },
  {
    id: "tls-in-flight",
    term: "TLS in flight",
    expansion: "",
    definition:
      "Encryption applied to the connection between mail servers and between your mail client and the server, so messages can't be read mid-transit.",
    whyItMatters:
      "No one on the network in between can read what's passing through, even when the message contents aren't end-to-end encrypted.",
  },
  {
    id: "encrypted-at-rest",
    term: "Encrypted at rest",
    expansion: "",
    definition:
      "Messages stored on Kuju's servers are encrypted with keys held in a hardware-backed secret store. If a disk is stolen, the data is unreadable without the keys.",
    whyItMatters:
      "A server's physical security alone isn't enough — at-rest encryption is the second line of defense for stored mail.",
  },
  {
    id: "totp",
    term: "TOTP",
    expansion: "Time-based One-Time Password",
    definition:
      "A six-digit code that changes every 30 seconds, generated by an authenticator app on your phone, entered alongside your password when signing in.",
    whyItMatters:
      "A stolen password alone isn't enough to sign in as you. The attacker would also need physical access to your phone.",
  },
  {
    id: "passkeys",
    term: "Passkeys",
    expansion: "WebAuthn",
    definition:
      "A cryptographic key pair stored on your device (or in a password manager) that replaces the password entirely. Signing in is a tap of your fingerprint or a face unlock.",
    whyItMatters:
      "There is no shared secret to steal in a phishing attack. Passkeys cannot be intercepted, replayed, or guessed.",
  },
  {
    id: "mx-records",
    term: "MX records",
    expansion: "Mail Exchange records",
    definition:
      "DNS entries that tell sending mail servers which servers handle incoming mail for your domain. When you point MX records at Kuju, mail addressed to your domain comes to us.",
    whyItMatters:
      "This is the switch that moves your email to Kuju. Until your MX records change, your mail still flows to your old provider.",
  },
  {
    id: "end-to-end-encryption",
    term: "End-to-end encryption",
    expansion: "",
    definition:
      "A class of encryption in which only the sender and recipient hold the keys — no server in between (not even your mail provider) can read the message. Kuju Email does not implement end-to-end encryption today; we use TLS in transit and at-rest encryption instead.",
    whyItMatters:
      "End-to-end encryption is a stronger guarantee for specific use cases, but it breaks server-side spam filtering, search, and shared-mailbox workflows. We've prioritized strong transport and storage encryption with full feature support.",
  },
];
```

- [ ] **Step 2: Verify the file type-checks**

Run: `npx tsc --noEmit`
Expected: no errors. If TypeScript flags anything, fix inline before committing.

- [ ] **Step 3: Verify ESLint passes**

Run: `npm run lint`
Expected: no errors or warnings on `src/lib/glossary.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/glossary.ts
git commit -m "feat(glossary): add typed entries for /kuju-email/glossary"
```

---

## Task 2: Glossary page

**Files:**

- Create: `src/app/kuju-email/glossary/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
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
      <section className="bg-primary px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Kuju Email · reference
          </p>
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight md:text-5xl">
            <em className="text-kuju">Email security glossary.</em>
          </h1>
          <p
            className="text-lg leading-[1.7] text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
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
                style={{ fontFamily: "var(--font-body)" }}
              >
                {entry.definition}
              </p>
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
```

Notes for the engineer:

- `scroll-mt-24` ensures anchor-linked entries don't land flush against the sticky-ish header.
- The `<em>` in the h1 picks up Spectral italic (h1 is Spectral via `globals.css` base layer); the body prose explicitly sets `var(--font-body)` because the body default propagates correctly but the section feels safer with explicit Public Sans on paragraphs.
- `entriesSorted` builds a sorted copy at module load — no reactivity needed.

- [ ] **Step 2: Run the dev server and visit the page**

Run: `npm run dev`
Visit: `http://localhost:3000/kuju-email/glossary`
Expected: page renders, all 14 entries appear alphabetically, "Back to Kuju Email" links work.

- [ ] **Step 3: Verify anchor jumps work**

In a browser, visit `http://localhost:3000/kuju-email/glossary#spf` directly. The page should scroll so the SPF entry is near the top (not flush with the navigation), thanks to `scroll-mt-24`.

Repeat for `#dkim`, `#relay-hop-trace`, `#end-to-end-encryption`.

- [ ] **Step 4: Verify type-check + lint + build**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All three must succeed before commit. If `next build` errors on the new route, fix before commit.

- [ ] **Step 5: Commit**

```bash
git add src/app/kuju-email/glossary/page.tsx
git commit -m "feat(kuju-email): add /kuju-email/glossary page"
```

---

## Task 3: Footer link to glossary

**Files:**

- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Add Glossary link to the Products group**

In `src/components/Footer.tsx`, find the Products `<ul>` (around line 28). It currently contains four `<li>` items: Kuju Email, Pricing, User Guide, Try Kuju Email.

Insert a new `<li>` for the glossary **between "User Guide" and "Try Kuju Email"** (so reference docs cluster together before the trial CTA):

```tsx
              <li>
                <Link
                  href="/kuju-email/guide"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  User Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/kuju-email/glossary"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Security Glossary
                </Link>
              </li>
              <li>
                <a
                  href={URLS.KUJU_TRIAL_SIGNUP}
```

- [ ] **Step 2: Verify the dev server renders the new link**

`npm run dev`, scroll to footer on any page (e.g. `http://localhost:3000`), confirm "Security Glossary" appears in the Products column and links to `/kuju-email/glossary`.

- [ ] **Step 3: Lint + type-check + build**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All three must succeed.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat(footer): link to /kuju-email/glossary in Products group"
```

---

## Task 4: SecurityJourney component — data + mobile semantic stack

**Files:**

- Create: `src/components/marketing/SecurityJourney.tsx`

This task creates the component file with the checkpoint data and the **mobile/SR-fallback semantic HTML rendering only**. The desktop SVG rendering comes in Task 5. Building in two passes keeps each commit reviewable.

- [ ] **Step 1: Create the component file**

```tsx
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
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            How a message reaches you
          </p>
          <h2 className="mb-5 text-3xl leading-[1.2] tracking-tight text-primary md:text-4xl">
            <em>Every message passes through four checks</em>
            <br />
            before it reaches you.
          </h2>
          <p
            className="text-lg leading-[1.7] text-slate-600"
            style={{ fontFamily: "var(--font-body)" }}
          >
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
              <p
                className="mb-3 text-sm text-slate-500"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {cp.question}
              </p>
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
        <p
          className="mx-auto mt-12 max-w-2xl text-center text-sm italic text-slate-600"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Unfamiliar terms?{" "}
          <Link
            href="/kuju-email/glossary"
            className="not-italic text-kuju underline decoration-dotted underline-offset-4 hover:text-kuju-dark"
          >
            Email security glossary →
          </Link>
        </p>

        {/* Closer */}
        <p
          className="mx-auto mt-10 max-w-2xl border-t border-slate-200 pt-8 text-center text-sm italic leading-[1.7] text-slate-600"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Hidden detail isn&apos;t reassuring — visible, quiet detail is.
          We&apos;d rather teach you the words than hide them.
        </p>
      </div>
    </section>
  );
}
```

Notes:

- `"use client"` is at the top because Task 6 will add `IntersectionObserver`. Setting it now avoids a directive change later.
- `CHECKPOINTS` is `readonly` and `as const` to lock the four-checkpoint contract.
- The `<ol>` semantic structure with sequential `<li>`s (envelope → 4 checkpoints → inbox) reads cleanly for screen readers.
- This task wires the section to its eventual id (`id="security"`) so Task 7's "See how →" anchor link works as soon as both tasks are done. There is no separate placeholder — the section is fully linked from the moment it is inserted into the page in Task 7.

- [ ] **Step 2: Verify type-check + lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both pass. The component is not yet imported by any page, so there's nothing to render visually yet — that comes in Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/SecurityJourney.tsx
git commit -m "feat(security-journey): mobile semantic stack + checkpoint data"
```

---

## Task 5: SecurityJourney — desktop SVG diagram

**Files:**

- Modify: `src/components/marketing/SecurityJourney.tsx`

Add the desktop SVG rendering. Hidden on mobile (`<md`), visible on desktop (`≥md`). Mirrors the same `CHECKPOINTS` data, so updates can't drift between mobile and desktop.

- [ ] **Step 1: Add the desktop SVG just below the section heading and above the mobile `<ol>`**

Find the comment `{/* Mobile / SR semantic stack ... */}` and insert the SVG block immediately before it:

```tsx
{
  /* Desktop SVG diagram — hidden < md, visible ≥ md */
}
<div className="hidden md:block">
  <svg
    viewBox="0 0 880 220"
    className="mx-auto w-full max-w-5xl"
    role="img"
    aria-labelledby="security-journey-title security-journey-desc"
  >
    <title id="security-journey-title">How a message reaches you</title>
    <desc id="security-journey-desc">
      A four-step journey diagram. An incoming message moves left to right
      through four checkpoints — Identity (SPF, DKIM, DMARC, relay-hop trace),
      Path (reputation checks, spam &amp; phishing patterns), Contents (URL
      safe-browsing, virus stripping), and Handoff (TLS in flight, encrypted at
      rest) — before landing in the user&apos;s inbox.
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
</div>;
```

Notes:

- Each `<a href>` wraps the technique `<text>` element. SVG `<a>` with `href` is keyboard-focusable and screen-reader-readable in modern browsers (Safari, Firefox, Chrome, Edge).
- `<rect>` fills use `var(--color-surface)` directly because SVG `fill` doesn't read Tailwind utility classes. Stroke uses `currentColor` with Tailwind text-color classes, which DOES work because `currentColor` resolves through CSS.
- Checkpoint X-positions are programmatic (`100 + i * 170`) — adding/removing a checkpoint would require updating the viewBox width, but adding/removing checkpoints is a design change requiring a spec amendment, not a code task.
- The diagram has no animation yet — Task 6 adds it.

- [ ] **Step 2: Verify type-check + lint**

```bash
npx tsc --noEmit
npm run lint
```

Both pass.

- [ ] **Step 3: Spot-check desktop SVG renders standalone**

The component still isn't imported anywhere, so we can't see it on a page yet. Skip visual verification until Task 7. Type-check + lint is the gate.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/SecurityJourney.tsx
git commit -m "feat(security-journey): desktop SVG with glossary deep-links"
```

---

## Task 6: SecurityJourney — scroll-triggered glide animation

**Files:**

- Modify: `src/components/marketing/SecurityJourney.tsx`

Add a small message-glyph that glides from the envelope on the left to the inbox on the right when the diagram scrolls into view. Plays once. Respects `prefers-reduced-motion`.

- [ ] **Step 1: Add imports + the glide-state hook at the top of the component**

At the top of `SecurityJourney.tsx`, change the React import to bring in hooks:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
```

Inside the `SecurityJourney()` function, **immediately before the `return`**, add the IntersectionObserver hook:

```tsx
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
```

- [ ] **Step 2: Attach the ref to the desktop SVG wrapper and add the animated message-glyph**

Find the `<div className="hidden md:block">` wrapping the SVG. Change it to:

```tsx
        <div ref={svgWrapRef} className="hidden md:block">
```

Then, **inside the SVG, immediately after the journey-path `<path>`**, add the animated glyph:

```tsx
{
  /* Animated message glyph that glides from envelope to inbox.
                Initially positioned at the envelope; receives the
                .is-gliding class once the section is in view. */
}
<g
  className={
    hasGlided ? "security-journey-glide is-gliding" : "security-journey-glide"
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
</g>;
```

- [ ] **Step 3: Add the keyframes in `globals.css`**

In `src/app/globals.css`, append at the end of the file:

```css
/* SecurityJourney glide animation. The small glyph starts at the envelope
   (transform translateX(50px) ≈ envelope center) and slides to just before
   the inbox (transform translateX(810px)) when .is-gliding is added. */
@keyframes security-journey-glide {
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  10% {
    opacity: 0.85;
  }
  to {
    transform: translateX(810px);
    opacity: 0.85;
  }
}

.security-journey-glide {
  transform: translateX(50px);
  opacity: 0;
}

.security-journey-glide.is-gliding {
  animation: security-journey-glide 1.6s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .security-journey-glide {
    /* Render at rest, in final inbox position, with no animation. */
    transform: translateX(810px);
    opacity: 0.85;
    animation: none !important;
  }
}
```

Notes:

- The CSS `@media (prefers-reduced-motion)` rule belt-and-suspenders with the JS check: even if a user toggles reduced-motion mid-session, the CSS forces the final state. The JS check just prevents the observer from being set up at all.
- The reduced-motion rule renders the glyph at its end position (translateX(810px)) so users still see a complete diagram, not an envelope mid-journey.

- [ ] **Step 4: Verify type-check + lint**

```bash
npx tsc --noEmit
npm run lint
```

Both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/SecurityJourney.tsx src/app/globals.css
git commit -m "feat(security-journey): scroll-triggered glide with reduced-motion guard"
```

---

## Task 7: Insert into `/kuju-email` page + cross-link the Defense card

**Files:**

- Modify: `src/app/kuju-email/page.tsx`

- [ ] **Step 1: Import the new component**

At the top of `src/app/kuju-email/page.tsx`, alongside the other imports:

```tsx
import { ModesShowcase } from "@/components/marketing/ModesShowcase";
import { SecurityJourney } from "@/components/marketing/SecurityJourney";
```

- [ ] **Step 2: Add a "See how →" anchor link to the Defense-in-depth feature card**

The card body comes from the `standoutFeatures` array (lines 13–38 of `page.tsx`). The current entry for Defense in depth is:

```tsx
  {
    title: "Defense in depth, by default",
    desc: "Two-tier spam and phishing detection, Google Safe Browsing URL checks on every link, message intelligence with SPF/DKIM/DMARC and relay-hop tracing, and virus attachments stripped automatically while the message body still arrives.",
  },
```

The card render block (line ~120) currently produces card title + body only. The cleanest place to add the cross-link is in the render itself (so we don't touch the data shape).

In the standoutFeatures `.map(...)` block, change:

```tsx
{
  standoutFeatures.map((f) => (
    <div
      key={f.title}
      className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-3 text-lg font-bold text-primary">{f.title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
    </div>
  ));
}
```

to:

```tsx
{
  standoutFeatures.map((f) => (
    <div
      key={f.title}
      className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-3 text-lg font-bold text-primary">{f.title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
      {f.title === "Defense in depth, by default" && (
        <p className="mt-4 text-sm">
          <a
            href="#security"
            className="text-kuju underline-offset-4 hover:text-kuju-dark hover:underline"
          >
            See how a message reaches you →
          </a>
        </p>
      )}
    </div>
  ));
}
```

Notes:

- The title-match is intentional and minimally invasive — it adds the cross-link only to the Defense card without changing the `standoutFeatures` data shape or adding optional fields to every entry.
- Plain `<a href="#security">` (not Next.js `<Link>`) because the target is on the same page; `<Link>` would force a client-side navigation for an in-page anchor.
- Smooth scroll comes from `html { scroll-behavior: smooth }` in `globals.css` (already set), so no extra work needed.

- [ ] **Step 3: Insert `<SecurityJourney />` between the standouts section and the "Move your domain" section**

Find the closing `</section>` of the standouts block (right after the "Read the full user guide →" link, around line 143). The next section is "Move your domain". Insert `<SecurityJourney />` between them:

```tsx
          <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-slate-500">
            <Link
              href="/kuju-email/guide"
              className="underline-offset-4 hover:text-kuju hover:underline"
            >
              Read the full user guide →
            </Link>
          </p>
        </div>
      </section>

      {/* Security journey — added per spec 2026-05-11 (issue github-8y9) */}
      <SecurityJourney />

      {/* Move Your Domain - relocated from homepage in Pass 2 */}
      <section className="px-6 py-20 md:py-28">
```

- [ ] **Step 4: Dev-server verification — every checkpoint of the spec**

Run: `npm run dev`. Visit `http://localhost:3000/kuju-email`. Walk through this checklist:

| Check                             | Expected                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Standouts grid shows six cards    | "Defense in depth" card now has a "See how a message reaches you →" link at the bottom                  |
| Click "See how →" link            | Page smooth-scrolls to the new Security section below                                                   |
| Section eyebrow reads             | "How a message reaches you" (uppercase tracked)                                                         |
| Section headline reads            | "Every message passes through four checks" (italic) "before it reaches you." (regular) — Spectral serif |
| Subhead reads                     | "We watch each arrival in four passes..." in Public Sans                                                |
| Diagram appears at ≥720px         | SVG with four checkpoints, dashed path, envelope + inbox glyphs                                         |
| Animation plays once on scroll    | Small kuju-green glyph glides left-to-right ~1.6s, settles into inbox                                   |
| Hover a technique label           | Cursor becomes pointer, color shifts to kuju-dark                                                       |
| Click a technique label           | Navigates to `/kuju-email/glossary#<term>` and lands on the right entry                                 |
| Resize to <720px                  | SVG hides, vertical `<ol>` stack appears with same content                                              |
| Animation does NOT play on <720px | Vertical stack renders static                                                                           |
| Glossary link line appears        | "Unfamiliar terms? Email security glossary →" centered below diagram                                    |
| Closer line appears               | "Hidden detail isn't reassuring..." in italic Public Sans                                               |

If any row fails, fix before committing.

- [ ] **Step 5: Keyboard + screen-reader spot check**

- Tab through the page from the top. Every technique label (in either the SVG or the mobile stack) must be focusable in order. Each must show a visible focus ring (browser default is fine; explicit one is optional).
- With macOS VoiceOver (Cmd+F5) or equivalent, traverse the section. The mobile semantic stack is the canonical SR reading order on desktop too — VoiceOver should walk envelope → 4 checkpoints (each with label, question, two techniques) → inbox in linear order.

Notes:

- On desktop the SVG IS visible, but VoiceOver reads the SVG's `<title>` + `<desc>` and skips the body — and _also_ reads the `md:hidden` `<ol>` because `md:hidden` is `display: none` and is therefore correctly excluded from the SR tree.
- That means on desktop, SR users get the title + desc summary, plus they get to keyboard-focus the SVG `<a>` links. **If this turns out to be insufficient at verification time**, change `md:hidden` on the `<ol>` to `md:sr-only` (a Tailwind class that hides visually but keeps in the SR tree). This is the only place in the plan where a runtime call could go either way; pick the one that gives the best VoiceOver narrative.

- [ ] **Step 6: Build**

```bash
npm run build
```

Must succeed with no errors or warnings related to the new files.

- [ ] **Step 7: Commit**

```bash
git add src/app/kuju-email/page.tsx
git commit -m "feat(kuju-email): wire SecurityJourney + Defense card anchor link"
```

---

## Task 8: Final verification + push

**Files:** none (this task is gates + push)

- [ ] **Step 1: Full local verification one more time**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All three must pass cleanly.

- [ ] **Step 2: Dev server walk-through — repeat the Task 7 Step 4 checklist**

Run `npm run dev` fresh, walk through every row of the spec checklist from Task 7 Step 4 again. Catch anything that drifted between commits.

- [ ] **Step 3: Throttle network in DevTools to "Slow 4G" and re-verify**

- The section should render with prose first, SVG second (no layout shift waiting on JS).
- The animation must not block first paint — it's gated on IntersectionObserver and only fires after the section scrolls into view.

- [ ] **Step 4: Lighthouse pass on `/kuju-email`**

Run a Lighthouse audit on the production build (`npm run build && npm run start`, then audit `http://localhost:3000/kuju-email`):

- Performance: should not regress from the pre-change baseline (no new dependencies, the SVG inline is small).
- Accessibility: ≥95. If below, inspect violations — most likely candidates are missing alt text on the SVG (we have `<title>`/`<desc>`) or low contrast on the dotted-link kuju-green text (mitigate by darkening if Lighthouse flags it).
- SEO: ≥95. The glossary page needs valid metadata (Task 2 set this) and the security section needs no special SEO work — its heading is an h2 inside the existing `/kuju-email` page.

- [ ] **Step 5: Close the bd issue and push**

```bash
cd /Users/macole/github/kaimoku-website
git pull --rebase
git push
git status   # must show "up to date with origin"
```

Then update the beads issue:

```bash
cd /Users/macole/github
bd close github-8y9 --reason="Implemented per spec 2026-05-11; deployed via Vercel auto-deploy on push to main"
```

- [ ] **Step 6: Verify Vercel deploy succeeded**

Wait ~90s after `git push`, then `curl -sI https://kaimoku-website.vercel.app/kuju-email/glossary | head -1` — expect `HTTP/2 200`. Then visit `https://kaimoku-website.vercel.app/kuju-email` and walk the Task 7 Step 4 checklist on production one more time.

If the production check fails, do NOT roll back the deploy — investigate (Vercel build logs, CDN caching). The build passed locally; failure here is environment-specific.

---

## Open implementation calls

These are flagged in the spec as "settle at implementation time":

1. **IntersectionObserver threshold** — plan uses `0.4`. If the animation feels too eager (firing while the section is still mostly below the fold), bump to `0.5`. If too late, drop to `0.3`.

2. **Checkpoint questions placement** — plan renders questions inside each box at `y=118`. If the visual rhythm calls for them outside (above each box, or as a single sub-caption strip below the row), adjust during the Task 7 dev walkthrough.

3. **"Back to security section" anchor on glossary entries** — plan does NOT add this. Add only if the dev walkthrough reveals the round-trip is awkward (e.g., a user reads three entries in a row and the back-trip to the section needs a visible anchor on each). Default: trust the browser back button.
