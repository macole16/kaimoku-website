# PR-B Pass 1 — Foundation + tactical hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the kaimoku-website's generic SaaS-template visual register with Kaimoku brand: Sumi Green + Stone palette in OKLCH, editorial typography (Spectral display + Public Sans body), three-CTA stacks collapsed to one primary + one text link, em dashes swept from copy. No structural / layout / IA changes — that's Pass 2.

**Architecture:** Pure token + typography swap on `src/app/globals.css` and `src/app/layout.tsx` (no per-component class renames thanks to keeping existing token names like `--color-primary` and changing only their values). CTA pattern collapses 4 sites (homepage hero, homepage closing, product page hero, product page closing). Header drops a duplicate "Get Started" CTA; Footer fixes a duplicate-href bug. All work on a `marketing-redesign` branch off `main`; squash-merge at the end.

**Tech Stack:** Next.js 16 (App Router, server components), React 19, TypeScript (strict), Tailwind v4 (`@theme inline`), `next/font/google` for typography. No tests in this repo — verification = `npx eslint` + `npx tsc --noEmit` + `npm run build` + dev-server visual.

**Spec:** `kaimoku-website/docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md` (Pass 1 section)

**Closes (on merge to main):** github-x57.1, github-x57.2, github-x57.5, github-x57.7

---

## Files touched

| Action | Path                          | Purpose                                                                                                          |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| EDIT   | `src/app/globals.css`         | Replace token values with Sumi Green + Stone (OKLCH); add `h1-h4 { font-family: var(--font-display) }` base rule |
| EDIT   | `src/app/layout.tsx`          | Swap `Geist` + `Geist_Mono` for `Spectral` (display) + `Public_Sans` (body)                                      |
| EDIT   | `src/app/page.tsx`            | Hero + closing CTA collapse; em-dash sweep (7 occurrences)                                                       |
| EDIT   | `src/app/kuju-email/page.tsx` | Hero + closing CTA collapse; em-dash sweep (13 occurrences in copy strings; 1 in metadata)                       |
| EDIT   | `src/components/Header.tsx`   | Drop "Get Started" CTA in desktop + mobile nav                                                                   |
| EDIT   | `src/components/Footer.tsx`   | Fix duplicate "Try Kuju Email" href (currently identical to "Pricing")                                           |

---

## Task 1: Create the feature branch

**Files:** none (branch operation)

- [ ] **Step 1: Verify clean working tree**

```
cd /Users/macole/github/kaimoku-website && git status
```

Expected: `On branch main`, `Your branch is up to date with 'origin/main'`, `nothing to commit, working tree clean`.

If working tree dirty, STOP and ask user how to proceed.

- [ ] **Step 2: Create the branch**

```
cd /Users/macole/github/kaimoku-website && git checkout -b marketing-redesign main
```

Expected: `Switched to a new branch 'marketing-redesign'`.

- [ ] **Step 3: Verify branch state**

```
git status && git log --oneline -1
```

Expected: `On branch marketing-redesign`, last commit matches the spec commit `1ebf62d` (the PR-B design spec).

---

## Task 2: Replace tokens in globals.css

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/globals.css`

The current file is 30 lines. Full rewrite is cleaner than surgical edits given the scope of changes.

- [ ] **Step 1: Write the new globals.css**

Replace the entire content of `/Users/macole/github/kaimoku-website/src/app/globals.css` with:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-display: var(--font-display);

  /* Brand — Sumi Green (墨), kuju-mail's accent (Restrained color strategy: one accent ≤10%) */
  --color-primary: oklch(0.36 0.06 158);
  --color-primary-light: oklch(0.46 0.07 158);
  --color-accent: oklch(0.46 0.07 158);
  --color-accent-dark: oklch(0.36 0.06 158);
  --color-kuju: oklch(0.46 0.07 158);
  --color-kuju-dark: oklch(0.36 0.06 158);

  /* Stone — warm tinted neutrals (chroma 0.005, hue 158 toward Sumi Green) */
  --color-surface: oklch(0.97 0.005 158);
}

:root {
  --background: oklch(0.99 0.005 158);
  --foreground: oklch(0.22 0.005 158);
}

@layer base {
  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-display);
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}
```

Key changes from the previous file:

- All hex values (`#0f2b46`, `#06b6d4`, `#ffffff`, `#0f172a`, `#f8fafc`) replaced with `oklch(...)` values.
- `--font-mono` removed (not used on the marketing site).
- `--font-sans` now points to `--font-body` (was `--font-geist-sans`).
- New `--font-display` token (Tailwind v4 will auto-generate a `font-display` utility from this).
- New `@layer base` rule applies the display font to all `h1-h4` automatically — no per-component classname changes needed.

- [ ] **Step 2: Verify**

```
cd /Users/macole/github/kaimoku-website && npx tsc --noEmit
```

Expected: clean (no output). TypeScript doesn't lint CSS but checks the project compiles.

```
npx eslint src/app/globals.css
```

Expected: clean OR an ESLint error saying it doesn't lint CSS — both fine. Move on.

```
npm run build 2>&1 | tail -20
```

Expected: build succeeds; route summary printed. Note: at this step, fonts referenced by `--font-display` and `--font-body` are NOT YET DEFINED (layout.tsx still uses Geist). The CSS variables resolve to undefined and the h1-h4 rule will silently fall back to the body font. That's intentional — it's a temporary state until Task 3 lands.

If `npm run build` fails with a token error (e.g., Tailwind v4 doesn't allow OKLCH in `@theme inline`), STOP and report — the OKLCH syntax may need adaptation.

- [ ] **Step 3: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
Sumi Green + Stone tokens (OKLCH) + h1-h4 display-font base rule

Replaces #0f2b46 navy, #0ea5e9 sky, #06b6d4 cyan with one Sumi Green family
in OKLCH (the Restrained color strategy from impeccable laws). Surface and
background neutrals warm-tinted toward Sumi Green hue at chroma 0.005.

New @layer base rule applies var(--font-display) to all h1-h4. Display font
isn't loaded yet — that ships in the next commit (typography swap). Until
then, h1-h4 fall back to the body font silently.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 1, color tokens section).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Swap fonts in layout.tsx

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx with the new font setup**

Replace the entire content of `/Users/macole/github/kaimoku-website/src/app/layout.tsx` with:

```typescript
import type { Metadata } from "next";
import { Spectral, Public_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaimoku Technologies",
  description:
    "Kaimoku Technologies builds modern, reliable software. Our flagship product Kuju Email is a complete email platform with AI-powered security, calendar, contacts, and full admin control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spectral.variable} ${publicSans.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

Key changes:

- Import: `Geist, Geist_Mono` → `Spectral, Public_Sans`
- `geistSans` const → `spectral` const (CSS variable: `--font-display`, weights `400/500/600`, italic styles enabled)
- `geistMono` const → `publicSans` const (CSS variable: `--font-body`, weights `400/500/600/700`)
- `body` className uses both new variables; `metadata` is unchanged.

- [ ] **Step 2: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/layout.tsx && npx tsc --noEmit
```

Expected: both clean.

```
npm run build 2>&1 | tail -25
```

Expected: build succeeds. New fonts (Spectral, Public Sans) downloaded by `next/font/google` during build. Route summary printed including `/` and `/kuju-email`. The h1-h4 base rule now resolves the display font correctly.

If build fails with "font not found" or similar, STOP and report — `next/font/google` may have rejected Spectral or Public Sans (unlikely; both are standard Google Fonts).

- [ ] **Step 3: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/layout.tsx
git commit -m "$(cat <<'EOF'
Editorial typography: Spectral display + Public Sans body

Replaces Geist + Geist Mono (Vercel default; impeccable reflex-rejection
font) with Spectral (Production Type editorial serif) for display and
Public Sans (USWDS-derived humanist sans) for body. Both via
next/font/google; no licensing complexity, no local woff2 files.

The globals.css h1-h4 base rule (previous commit) now resolves
var(--font-display) to Spectral. Body inherits Public Sans via
--font-sans.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 1, typography section).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Homepage CTA collapse + em-dash sweep

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/page.tsx`

The homepage has two CTA stacks (hero, closing) of three buttons each. Both collapse to one primary + one secondary text link. Plus seven em-dash occurrences across copy strings.

- [ ] **Step 1: Read the file**

Read `/Users/macole/github/kaimoku-website/src/app/page.tsx` end-to-end so the surgical Edit operations match exact text.

- [ ] **Step 2: Collapse the hero CTA stack (3 buttons → 1 primary + 1 text link)**

Find the hero CTA block (around line 21 — `<div className="flex flex-wrap gap-4">` followed by trial / explore / "Learn More" buttons). Replace this block:

```tsx
<div className="flex flex-wrap gap-4">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email"
    className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
  >
    Explore Kuju Email
  </Link>
  <Link
    href="#about"
    className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
  >
    Learn More
  </Link>
</div>
```

with:

```tsx
<div className="flex flex-wrap items-center gap-6">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email"
    className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-kuju hover:underline"
  >
    Explore Kuju Email →
  </Link>
</div>
```

Changes: drop the third "Learn More" link entirely; demote "Explore Kuju Email" from solid `bg-accent` button to a text link with arrow; switch container `gap-4` → `gap-6` and add `items-center` for vertical alignment of pill + link.

- [ ] **Step 3: Collapse the closing CTA stack**

Find the closing CTA block (around line 313 — same pattern but `justify-center`, with "View Pricing" as the third button). Replace this block:

```tsx
<div className="flex flex-wrap justify-center gap-4">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email"
    className="rounded-lg bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-dark"
  >
    Explore Kuju Email
  </Link>
  <Link
    href="/kuju-email/pricing"
    className="rounded-lg border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
  >
    View Pricing
  </Link>
</div>
```

with:

```tsx
<div className="flex flex-wrap items-center justify-center gap-6">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email/pricing"
    className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-kuju hover:underline"
  >
    View pricing →
  </Link>
</div>
```

Changes: drop "Explore Kuju Email" (the second of three; redundant with what's already on the homepage); keep "View pricing →" as the secondary text link (commitment-stage adjacent for someone who's read the page); container `gap-4` → `gap-6` + `items-center`.

- [ ] **Step 4: Em-dash sweep — 7 occurrences in `src/app/page.tsx`**

Run grep to locate (line numbers may shift after Steps 2-3):

```
cd /Users/macole/github/kaimoku-website && grep -n '&mdash;\|—' src/app/page.tsx
```

You'll see entries similar to:

| #   | Approximate line | Current text                                                                                                       | Replacement                                                                                                  |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | ~64              | `email and communications &mdash; delivering the security, features, and`                                          | `email and communications, delivering the security, features, and`                                           |
| 2   | ~71              | `(開目) means &ldquo;opening one&rsquo;s eyes&rdquo; in Japanese &mdash; reflecting our belief that organizations` | `(開目) means &ldquo;opening one&rsquo;s eyes&rdquo; in Japanese. It reflects our belief that organizations` |
| 3   | ~107             | `built-in security &mdash; delivered as a managed service so you can focus on what matters.`                       | `built-in security, delivered as a managed service so you can focus on what matters.`                        |
| 4   | ~184             | `Full Professional-level access — all features, no restrictions.`                                                  | `Full Professional-level access. All features, no restrictions.`                                             |
| 5   | ~189             | `Point your MX, SPF, and DKIM records to Kuju — we provide the exact values to copy into your DNS provider.`       | `Point your MX, SPF, and DKIM records to Kuju. We provide the exact values to copy into your DNS provider.`  |
| 6   | ~232             | `full control over their email experience — powerful admin tools, transparent operations, no surprises.`           | `full control over their email experience: powerful admin tools, transparent operations, no surprises.`      |
| 7   | ~244             | `into what's happening with your email — delivery analytics, spam stats, and more.`                                | `into what's happening with your email: delivery analytics, spam stats, and more.`                           |

Apply each replacement with the Edit tool. Default rule: comma if the em dash separated a parenthetical or appositive; period (sentence break) if it separated two complete thoughts; colon if introducing a list. Preserve all surrounding markup (`&rsquo;`, `&ldquo;`, etc.).

- [ ] **Step 5: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/page.tsx && npx tsc --noEmit && grep -c '&mdash;\|—' src/app/page.tsx
```

Expected:

- ESLint: clean
- tsc: clean
- grep count: `0` (no remaining em dashes in page.tsx)

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds with `/` in the route summary.

- [ ] **Step 6: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
Homepage: collapse 3-CTA stacks to 1+1 + sweep em dashes

Hero and closing CTA stacks each go from 3 solid buttons to 1 primary
button (Start 14-Day Trial) + 1 text link with arrow (Explore Kuju Email
→ in hero, View pricing → in closing). The page now has one clear
primary action per surface.

Em-dash sweep: 7 occurrences replaced with commas, periods, or colons
per the impeccable copy law (no em dashes — top-3 AI-wrote-this tell).

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 1, CTA collapse + em-dash sweep).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Product page CTA collapse + em-dash sweep

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx`

Same pattern as Task 4 but on `/kuju-email` and the em-dash sweep is larger (13 in copy strings + 1 in metadata).

- [ ] **Step 1: Read the file**

Read `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx` end-to-end.

- [ ] **Step 2: Collapse the hero CTA stack**

Find the hero CTA block (around line 255 area — `<div className="flex flex-wrap gap-4">` containing trial / "View Plans & Pricing" / "Read the User Guide"). Replace:

```tsx
<div className="flex flex-wrap gap-4">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email/pricing"
    className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
  >
    View Plans & Pricing
  </Link>
  <Link
    href="/kuju-email/guide"
    className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
  >
    Read the User Guide
  </Link>
</div>
```

with:

```tsx
<div className="flex flex-wrap items-center gap-6">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email/pricing"
    className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-kuju hover:underline"
  >
    View pricing →
  </Link>
</div>
```

- [ ] **Step 3: Collapse the closing CTA stack**

Find the closing CTA block (toward the bottom of the file). The current state may have 2 or 3 buttons depending on how PR-A's edits left it. Run:

```
grep -n 'View Pricing\|Read the Guide\|Start 14-Day Trial' src/app/kuju-email/page.tsx
```

To see the exact buttons present in the closing CTA. Read the surrounding JSX (~30 lines around the highest matching line) to find the `<div className="flex flex-wrap justify-center gap-4">` container.

If 3 buttons (trial / pricing / guide), apply the same collapse: keep trial as primary + "View pricing →" text link, drop the guide link.

If 2 buttons already (trial / pricing), still apply the visual treatment: keep trial as primary, demote pricing to text link.

The target final state is exactly:

```tsx
<div className="flex flex-wrap items-center justify-center gap-6">
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Start 14-Day Trial
  </a>
  <Link
    href="/kuju-email/pricing"
    className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-kuju hover:underline"
  >
    View pricing →
  </Link>
</div>
```

- [ ] **Step 4: Em-dash sweep — 13 occurrences in copy + 1 in metadata title**

Run grep:

```
cd /Users/macole/github/kaimoku-website && grep -n '—' src/app/kuju-email/page.tsx
```

Apply substitutions per the same rule as Task 4. Notable:

- `metadata.title: "Kuju Email — Complete Email Platform | Kaimoku Technologies"` → `"Kuju Email: Complete Email Platform | Kaimoku Technologies"` (colon for title)
- Most `desc:` strings have em dashes mid-sentence — substitute with comma (default), or split into two sentences if the em dash separates two complete thoughts

The 13 occurrences (line numbers may shift):

| Line | Context                                                | Approach                                                              |
| ---- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| 8    | metadata title                                         | colon                                                                 |
| 23   | "four UI modes — Standard, Magazine, Timeline"         | colon: `"four UI modes: Standard, Magazine, Timeline, and Terminal."` |
| 27   | "natural language commands — type"                     | period: split into two sentences                                      |
| 44   | "drafts a relevant response — review, edit"            | comma                                                                 |
| 48   | "tone control — Professional, Friendly"                | colon                                                                 |
| 110  | `intent classification — personal, ... — powered by`   | First → colon, second → comma (or period)                             |
| 118  | "preserving the email body — so you receive"           | comma                                                                 |
| 156  | "spam score thresholds per domain — set junk routing"  | colon                                                                 |
| 202  | "delivery handling — all fully integrated"             | period: `"... delivery handling. All fully integrated."`              |
| 206  | "verification are native — not third-party"            | comma                                                                 |
| 210  | "PDF, DOCX, XLSX, CSV, and more — directly from email" | comma                                                                 |
| 222  | "during the trial — if you decide"                     | period                                                                |
| 226  | "Come back anytime to finish — your progress is saved" | period                                                                |

Apply each via the Edit tool. The exact wording around each em dash may differ slightly from the table — use the actual file text.

- [ ] **Step 5: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/kuju-email/page.tsx && npx tsc --noEmit && grep -c '&mdash;\|—' src/app/kuju-email/page.tsx
```

Expected:

- ESLint: clean
- tsc: clean
- grep count: `0` (no remaining em dashes)

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds with `/kuju-email` in route summary.

- [ ] **Step 6: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/kuju-email/page.tsx
git commit -m "$(cat <<'EOF'
Product page: collapse 3-CTA stacks to 1+1 + sweep em dashes

Hero and closing CTA stacks collapse to 1 primary (Start 14-Day Trial)
plus 1 text link (View pricing →). Drops the redundant secondary buttons.

Em-dash sweep: 13 occurrences in copy strings + 1 in metadata title
replaced with appropriate punctuation per the impeccable copy law.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 1, CTA collapse + em-dash sweep).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Header + Footer cleanup

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/components/Header.tsx`
- Modify: `/Users/macole/github/kaimoku-website/src/components/Footer.tsx`

Two small fixes flagged by the critique:

1. Header has a trailing "Get Started" CTA in nav that's redundant (the third nav action — drops to align with the CTA-collapse principle).
2. Footer's "Try Kuju Email" link goes to `/kuju-email/pricing` (same href as the "Pricing" link above it) — duplicate; should either link to the trial signup or be removed.

- [ ] **Step 1: Drop "Get Started" from Header desktop nav**

In `/Users/macole/github/kaimoku-website/src/components/Header.tsx`, find the desktop nav block ending with the "Get Started" Link, around lines 50-55:

```tsx
          <Link
            href="/kuju-email/pricing"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Get Started
          </Link>
        </nav>
```

Replace with (just remove the Link, keep `</nav>`):

```tsx
        </nav>
```

- [ ] **Step 2: Drop "Get Started" from Header mobile nav**

In the same file, find the mobile nav block (around lines 126-132):

```tsx
            <Link
              href="/kuju-email/pricing"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </nav>
```

Replace with (remove the Link, keep `</nav>`):

```tsx
          </nav>
```

- [ ] **Step 3: Fix Footer duplicate-href bug**

In `/Users/macole/github/kaimoku-website/src/components/Footer.tsx`, find the "Try Kuju Email" list item (lines 52-58):

```tsx
<li>
  <Link
    href="/kuju-email/pricing"
    className="text-sm text-slate-400 transition-colors hover:text-white"
  >
    Try Kuju Email
  </Link>
</li>
```

The "Pricing" link directly above it already points to `/kuju-email/pricing`. Two options:

- (a) Remove this `<li>` entirely (Products column drops to 3 entries: Kuju Email, Pricing, User Guide)
- (b) Change href to point to the trial signup: `URLS.KUJU_TRIAL_SIGNUP`

Apply option (b) — keep the link but point it to the actual trial signup. Replace the `<li>` block above with:

```tsx
<li>
  <a
    href={URLS.KUJU_TRIAL_SIGNUP}
    className={`text-sm text-slate-400 transition-colors hover:text-white ${
      isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
        ? "pointer-events-none opacity-60"
        : ""
    }`}
    title={isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined}
  >
    Try Kuju Email
  </a>
</li>
```

This requires importing `URLS` and `isComingSoon` at the top of `Footer.tsx`. Find the current import block at the top:

```tsx
import Link from "next/link";
```

Replace with:

```tsx
import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
```

- [ ] **Step 4: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/components/Header.tsx src/components/Footer.tsx && npx tsc --noEmit
```

Expected: both clean. tsc resolves the new Footer import.

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/components/Header.tsx src/components/Footer.tsx
git commit -m "$(cat <<'EOF'
Header + Footer hygiene

Header: drop the trailing "Get Started" CTA from desktop and mobile nav.
The pricing link in nav already provides commit-stage navigation; the
extra solid-button CTA is the third action that violates the CTA-collapse
principle.

Footer: "Try Kuju Email" was a duplicate href (same /kuju-email/pricing
as the "Pricing" link above it). Repointed to the actual trial signup
URL via URLS.KUJU_TRIAL_SIGNUP, with the same coming-soon guard the hero
CTAs use.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 1, Header + Footer hygiene).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Final verification + merge gate (USER GATE)

**Files:** none (verification + user decision)

- [ ] **Step 1: Full project build**

```
cd /Users/macole/github/kaimoku-website && npm run build
```

Expected: build succeeds; route summary shows all routes (`/`, `/kuju-email`, `/kuju-email/docs`, etc.) prerendered.

- [ ] **Step 2: Lint pass on every touched file**

```
cd /Users/macole/github/kaimoku-website && npx eslint \
  src/app/globals.css \
  src/app/layout.tsx \
  src/app/page.tsx \
  src/app/kuju-email/page.tsx \
  src/components/Header.tsx \
  src/components/Footer.tsx
```

Expected: clean (note: ESLint may not lint .css; that's fine).

- [ ] **Step 3: TypeScript check**

```
cd /Users/macole/github/kaimoku-website && npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Em-dash sweep verification**

```
cd /Users/macole/github/kaimoku-website && grep -c '&mdash;\|—' src/app/page.tsx src/app/kuju-email/page.tsx
```

Expected: `0` for both files (no remaining em dashes).

- [ ] **Step 5: Branch state check**

```
cd /Users/macole/github/kaimoku-website && git status && git log --oneline main..HEAD
```

Expected:

- `On branch marketing-redesign`, `working tree clean`
- 5 commits on the branch ahead of `main`: tokens, typography, homepage, product page, header+footer

- [ ] **Step 6: Visual spot-check (manual)**

Run:

```
cd /Users/macole/github/kaimoku-website && npm run dev
```

Open http://localhost:3000 and confirm:

- Background is warm white (not pure white); foreground is warm dark (not slate)
- Hero text uses Spectral (serif) for h1; body uses Public Sans (humanist sans)
- Hero shows ONE solid trial button + ONE text link with arrow ("Explore Kuju Email →")
- About section's 開目 paragraph reads cleanly without em dashes
- Closing CTA shows ONE solid trial button + "View pricing →" text link
- Header nav has no trailing "Get Started" CTA

Open http://localhost:3000/kuju-email and confirm:

- Same visual register as homepage (warm tones, Spectral headings)
- Modes section (added in PR-A) renders with the new typography
- Hero has 1 primary + 1 text link
- Closing CTA same
- No em dashes in any feature card desc strings

Stop the dev server when done.

- [ ] **Step 7: Pause for merge / push decision (USER GATE)**

Stop. Tell the user:

> "Pass 1 complete on `marketing-redesign` branch.
>
> - 5 commits ahead of `main` (tokens, typography, homepage, product page, header+footer)
> - Build clean, lint clean, tsc clean, em-dash sweep verified zero, dev visual confirmed
> - Closes github-x57.1, .2, .5, .7 once merged
>
> Three options:
>
> 1. Squash-merge to `main` (per spec) — `git checkout main && git merge --squash marketing-redesign && git commit && git push`
> 2. Fast-forward merge to `main` (preserves the 5 commits as separate history) — `git checkout main && git merge marketing-redesign && git push`
> 3. Push the branch first as `marketing-redesign` and review changes on GitHub before merging
>
> Which would you like?"

Wait for the user's explicit choice before proceeding.

- [ ] **Step 8: Execute the chosen merge path**

Based on user's choice:

- **(1) squash-merge:** `git checkout main && git pull --rebase && git merge --squash marketing-redesign && git commit -m "PR-B Pass 1: foundation + tactical hygiene\n\nCloses github-x57.1, .2, .5, .7" && git push && git status`
- **(2) fast-forward:** `git checkout main && git pull --rebase && git merge marketing-redesign && git push && git status`
- **(3) push branch only:** `git push -u origin marketing-redesign` (then user reviews; you wait for further instruction)

For options (1) and (2), expected after `git status`: `On branch main`, `Your branch is up to date with 'origin/main'`, `nothing to commit, working tree clean`.

For option (3), expected: branch is on origin; main is unchanged.

- [ ] **Step 9: Close the bd issues (only if (1) or (2) — branch merged)**

After successful merge to main:

```
BEADS_DIR=/Users/macole/github/.beads bd close github-x57.1 github-x57.2 github-x57.5 github-x57.7 --reason="PR-B Pass 1 merged: foundation + tactical hygiene"
```

Verify:

```
BEADS_DIR=/Users/macole/github/.beads bd show github-x57
```

Expected: epic shows 4 of 7 children closed; remaining open are .3, .4, .6.

If user chose option (3), defer this step until the branch actually merges.

---

## Self-review notes

**Spec coverage (Pass 1 section):**

- Spec §Files touched (6 files) → all present in the file table above; each has a dedicated task
- Spec §Color tokens → Task 2 step 1 has the exact CSS verbatim
- Spec §Typography → Task 3 step 1 has the exact tsx verbatim
- Spec §CTA collapse pattern → Tasks 4 + 5 implement the pattern at all 4 sites with full before/after JSX
- Spec §Em-dash sweep → Tasks 4 + 5 enumerate 7 + 13 occurrences with exact substitution rules
- Spec §Header + Footer → Task 6 covers both files with the dropdown + duplicate-href fixes
- Spec §Verification → Task 7 covers build, lint, tsc, grep counts, and visual spot-check
- Spec §Estimated commits (5) → Tasks 2-6 produce exactly 5 commits

**Placeholder scan:** every code block contains complete content; no "TBD" / "TODO" / "Similar to Task N" patterns. The 13 em-dash occurrences in Task 5 use line numbers as approximate guides ("~64") because line numbers shift between edits — the implementer's grep step gives them exact locations.

**Type consistency:** the `Mode` type isn't referenced in this plan (Pass 1 doesn't touch the modes data). All file paths are absolute and consistent throughout. `URLS.KUJU_TRIAL_SIGNUP` and `isComingSoon()` references match what's already imported in the existing files.

**Why this is in scope for one plan:** every change is on a single branch, all commits are reviewable independently, end state is one merged PR. No coupling to Pass 2 work.

**User gates:** one explicit gate at Task 7 step 7 (merge / push decision). bd close only fires after merge.
