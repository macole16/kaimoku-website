# PR-B — Strategic re-pitch: brand + modes + multi-product spine

**Date:** 2026-05-06
**Status:** Approved (brainstorm), ready for plan
**Target repo:** `kaimoku-website`
**Branch:** `marketing-redesign`

---

## Goal

Bring kuju-mail's brand voice and design language to the kaimoku-website marketing surface, restructure the information architecture so the homepage is Kaimoku-brand and `/kuju-email` is product-driven, and establish a multi-product data spine that scales as Kaimoku adds products.

PR-B is the strategic re-pitch following PR-A's text-only catch-up. It operates on the surface that PR-A made truthful, addressing the seven `[ui-marketing]` issues filed by the 2026-05-05 `/impeccable critique` (epic `github-x57`).

## Background

The 2026-05-05 critique scored the marketing site **23/40** (Acceptable, low end). The deterministic detector returned zero findings — meaning the issues are strategic, not tactical. The critique surfaced seven priority issues:

| Priority | Issue                                                  | bd ID        |
| -------- | ------------------------------------------------------ | ------------ |
| P0       | No brand identity has reached the marketing site       | github-x57.1 |
| P0       | Geist Sans typography reflex-rejection                 | github-x57.2 |
| P1       | /kuju-email is a feature dump (40 cards)               | github-x57.3 |
| P1       | Modes thesis is told, not shown                        | github-x57.4 |
| P1       | Hero CTA stack has no primary action                   | github-x57.5 |
| P2       | No imagery (defensible in theory, painful in practice) | github-x57.6 |
| P3       | Em dashes throughout copy                              | github-x57.7 |

Plus a multi-product future to design for: kuju-mail is one product today; Kaimoku is the parent brand and may have other products tomorrow (e.g., Kuju Bridge as a separate tier or product). Architecture should accommodate without rework.

## Program shape

Two-pass PR on `marketing-redesign` branch.

```
Pass 1 — Foundation + tactical hygiene
   ↓ (squash-merge to main)
Pass 2 — IA reframe + modes restructure + multi-product spine
   ↓ (squash-merge to main)
Critique re-run — verify score progression toward 32+/40
```

**Pass 1 closes:** github-x57.1, .2, .5, .7 (4 issues)
**Pass 2 closes:** github-x57.3, .4, .6 (3 issues)

**End condition:** all 7 critique issues closed + `/impeccable critique` re-run shows score progression. Target band 32+/40 (matches kuju-mail Standard mode's post-pass-arc band).

**Out of scope for PR-B (deferred):**

- `capabilities.yaml` — YAGNI; the 32-card feature dump gets cut, not extracted. Revisit if/when warranted.
- Real product screenshots — typography-only treatments per Pass 2 strategy. Add only if typography fails to carry mode distinctiveness.
- `/kuju-email/guide` content audit — design tokens propagate automatically; content audit is its own cycle later.
- `/kuju-email/pricing` and `/kuju-email/docs` — only Pass 1's token swap touches them.
- Multi-product page templates / shared `<ProductPage>` abstraction — build when product 2 ships, not before.
- `PRODUCT.md` and `DESIGN.md` at kaimoku-website root — Pass 2 establishes enough design language inline; formal docs are a follow-up.

---

## Pass 1 — Foundation + tactical hygiene

**Goal:** replace the generic SaaS-template visual register with Kaimoku brand (Sumi Green + Stone palette in OKLCH, editorial typography), collapse three-CTA stacks to one primary + one text link, sweep em dashes from copy. No structural / layout / IA changes.

### Files touched

| Action | Path                          | What                                                                                               |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| EDIT   | `src/app/globals.css`         | OKLCH token values; `h1,h2,h3,h4 { font-family: var(--font-display) }` base rule                   |
| EDIT   | `src/app/layout.tsx`          | Swap `Geist` + `Geist_Mono` for `Spectral` (display) + `Public_Sans` (body) via `next/font/google` |
| EDIT   | `src/app/page.tsx`            | Hero + closing CTA collapse 3→1+1; em-dash sweep                                                   |
| EDIT   | `src/app/kuju-email/page.tsx` | Same: hero + closing CTA collapse + em-dash sweep                                                  |
| EDIT   | `src/components/Header.tsx`   | Drop the trailing "Get Started" CTA in desktop + mobile nav                                        |
| EDIT   | `src/components/Footer.tsx`   | Fix duplicate "Try Kuju Email" link (currently identical href to "Pricing")                        |

`/kuju-email/pricing`, `/guide`, `/docs` inherit the new tokens via CSS automatically.

### Color tokens

Existing token names (`--color-primary`, `--color-accent`, `--color-kuju`) keep their names but change values to Sumi Green family — preserves all component class references; no mass rename. The three blues collapse to one Sumi Green (Restrained color strategy):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-display: var(--font-display);

  /* Brand — Sumi Green (墨), kuju-mail's accent */
  --color-primary: oklch(0.36 0.06 158); /* Sumi Green dark */
  --color-primary-light: oklch(0.46 0.07 158); /* Sumi Green base */
  --color-accent: oklch(0.46 0.07 158);
  --color-accent-dark: oklch(0.36 0.06 158);
  --color-kuju: oklch(0.46 0.07 158);
  --color-kuju-dark: oklch(0.36 0.06 158);

  /* Stone — warm tinted neutrals */
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
```

### Typography

Editorial pairing via `next/font/google` (no licensing complexity):

- **Display: Spectral** (Production Type) — refined editorial serif, italics, multiple weights. Not on the impeccable reflex-reject list.
- **Body: Public Sans** (USWDS-derived) — humanist sans, very legible, low-reflex.

```tsx
import { Spectral, Public_Sans } from "next/font/google";

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

// body className uses both variables
<body className={`${spectral.variable} ${publicSans.variable} antialiased`}>
```

The `@layer base` rule in globals.css makes all `h1-h4` use Spectral automatically. No per-component classname changes for typography.

The implementer may run `/impeccable typeset` to validate the picks during Pass 1 and swap fonts if a stronger pair appears.

### CTA collapse pattern

Applies to 4 sites (homepage hero, homepage closing CTA, product page hero, product page closing CTA). Pattern:

```tsx
// Before — 3 buttons of similar weight
<div className="flex flex-wrap gap-4">
  <a href={URLS.KUJU_TRIAL_SIGNUP} className="rounded-lg bg-kuju ...">Start 14-Day Trial</a>
  <Link href="/kuju-email/pricing" className="rounded-lg bg-accent ...">View Plans & Pricing</Link>
  <Link href="/kuju-email/guide" className="rounded-lg border border-white/30 ...">Read the User Guide</Link>
</div>

// After — 1 primary + 1 text link
<div className="flex flex-wrap items-center gap-6">
  <a href={URLS.KUJU_TRIAL_SIGNUP} className="rounded-lg bg-kuju ...">Start 14-Day Trial</a>
  <Link href="/kuju-email/pricing" className="text-sm font-medium text-white hover:text-kuju underline-offset-4 hover:underline">
    View plans & pricing →
  </Link>
</div>
```

Third button (User Guide / Learn More) drops in all four sites.

### Em-dash sweep

Find/replace `&mdash;` with appropriate punctuation per occurrence. Default substitute: comma. Use sentence break where the em dash separated two complete thoughts. Affected lines from the critique: `page.tsx:64`, `:71`, `:108`; `kuju-email/page.tsx` multiple feature `desc` strings.

### Verification (Pass 1)

- `npm run build` clean
- `npx tsc --noEmit` clean
- `npx eslint` clean on every touched file
- Dev server visual: Sumi Green primary, warm Stone neutrals, Spectral display headings, Public Sans body, single primary CTA per hero/footer

### Estimated commits (Pass 1)

1. **Tokens** — globals.css OKLCH + h1-h4 base rule
2. **Typography** — layout.tsx font swap
3. **CTA collapse + em-dash sweep — homepage** (page.tsx)
4. **CTA collapse + em-dash sweep — product page** (kuju-email/page.tsx)
5. **Header + Footer cleanup** (drop duplicate CTAs/links)

5 commits, single PR, squash-merge.

---

## Pass 2 — IA reframe + modes restructure + multi-product spine

**Goal:** Homepage becomes Kaimoku brand surface (philosophy + product list). `/kuju-email` becomes pure product, with the four modes as the structural pivot, full-bleed per-mode sections, distilled feature set. Multi-product spine baked in.

### Files touched

| Action  | Path                                                    | What                                                                                                              |
| ------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| NEW     | `src/data/products.yaml`                                | Kaimoku product catalog, 1 entry today (kuju-mail)                                                                |
| NEW     | `src/lib/products.ts`                                   | Typed loader, mirrors `src/lib/modes.ts`                                                                          |
| NEW     | `src/components/marketing/ProductsList.tsx`             | Homepage products section renderer                                                                                |
| RENAME  | `src/data/modes.yaml` → `src/data/kuju-mail-modes.yaml` | Multi-product naming hygiene                                                                                      |
| EDIT    | `src/lib/modes.ts`                                      | Read from new path                                                                                                |
| REWRITE | `src/components/marketing/ModesShowcase.tsx`            | Full-bleed per-mode sections; mode-id-keyed typography variants                                                   |
| REWRITE | `src/app/page.tsx`                                      | IA reframe: brand hero, About expanded, ProductsList replaces "What We Build", Move-Your-Domain section relocated |
| REWRITE | `src/app/kuju-email/page.tsx`                           | Cut "What Sets Us Apart" + "Complete Feature Set"; replace with ≤6 standouts; modes section becomes the spine     |
| EDIT    | `src/components/Header.tsx`                             | Inline comment about multi-product pattern; minimal structural change                                             |

### Homepage IA — `src/app/page.tsx`

**New structure:**

1. Hero — Kaimoku brand statement (Curator's Reading Room voice; 開目 elevated)
2. About — what Kaimoku believes about software
3. ProductsList — list of products (1 entry today: Kuju Email; designed to scale)
4. Values — Kaimoku company values (refresh copy if needed)
5. CTA — "Try Kuju Email →" (single primary; while we have one product. Flips to "Explore our products →" when product 2 ships.)

**Removed from homepage:**

- "Move Your Domain in three steps" — kuju-mail-specific; relocates to `/kuju-email`
- 12-cell feature checklist inside "What We Build" — folds into the kuju-mail entry's `description` in products.yaml

**Hero tone shift (one version; implementer can refine):**

Before:

```
Email done right.
Managed for you.

Kaimoku Technologies builds modern, reliable software for organizations
that value security, transparency, and a better email experience.
```

After (Curator's Reading Room voice):

```
開目  Opening one's eyes.

Kaimoku Technologies builds software that pays attention to the things
software has stopped paying attention to. We start with email.

[Explore Kuju Email →]
```

Voice: declarative, slightly bookish; no "modern" or "AI-powered" register; 開目 surfaced as the lede instead of the footnote.

### `products.yaml` schema

```yaml
- id: kuju-mail
  name: Kuju Email
  tagline: A complete email platform with four UI modes.
  description: |
    Email infrastructure that pays attention. AI-powered productivity and
    security, calendar and contacts, four selectable UI modes for the way
    you work. Managed service or self-host (coming soon).
  href: /kuju-email
  status: shipped
  shipped_in: "0.13-beta"
```

`ProductsList.tsx` renders one full-width card per product (single column at 1 entry — no `grid-cols-3` skeleton waiting for products that don't exist), with name, tagline, description, primary link. Designed to lay out cleanly with 2-3 entries when products are added.

### Product page IA — `src/app/kuju-email/page.tsx`

**New structure:**

1. Hero — Kuju Email; CTA: Start 14-Day Trial → · View pricing →
2. Modes — full-bleed, four sections (replaces current ModesShowcase grid)
3. Standouts — ≤6 distilled feature cards (replaces both 8-card "What Sets Us Apart" AND 32-card "Complete Feature Set")
4. Move Your Domain — relocated from homepage; kuju-mail-specific 3-step section
5. CTA — Start 14-Day Trial → · View pricing →

**Six standout features (distilled from the 40 currently on the page):**

1. **AI security stack** — two-tier spam/phishing detection, Google Safe Browsing URL checks, message intelligence, virus attachment stripping
2. **Multi-domain, multi-tenant** — per-domain admin delegation, branding, retention policies, partitioned storage
3. **Connect existing accounts** — Gmail/Outlook/IMAP via Kuju Bridge
4. **Native CalDAV + CardDAV** — calendar and contacts that sync with any client
5. **Self-hosted option (coming soon)** — pulled from buried bullet 6 of 8 to a featured slot; persona-magnet for power users
6. **Modern auth** — TOTP, WebAuthn passkeys, automatic JWT rotation, encrypted secrets storage

The remaining 34 cards (Plugin System, Plus Addressing, Vacation Responder, Inbox Summary Dashboard, etc.) are deleted from the marketing page. They live in `/kuju-email/docs` and `/kuju-email/guide`. Implementer may swap one of the six during craft if a stronger differentiator surfaces, but holds the cap at 6.

### Modes restructure — full-bleed per-mode

`src/components/marketing/ModesShowcase.tsx` is rewritten. Each mode gets its own typography-led section (no shared template). Switch keyed on `mode.id`:

- **Standard** — the considered default. Spectral display + Public Sans body, generous whitespace, single column. Calm editorial register.
- **Magazine** — editorial maximalism. Spectral italic display, larger column measure, drop cap on body lede, hairline rules between paragraphs. Sumi Green for emphasis.
- **Timeline** — dense, hairline-driven. Tighter Public Sans body in 2-col layout, time markers (HH:MM) flush left in Spectral, hairlines between rows. Compressed vertical rhythm. Renders a small inbox preview through type alone.
- **Terminal** — monospace overlay. Stone-900 background section, Sumi Green text, system monospace (`ui-monospace` — no extra font load). Renders a stylized command-mode snippet showing how the keyboard interface looks. Only section with a dark background; intentional inversion.

Each section is full viewport width, generous `py-24 md:py-32`, with the mode name in oversize Spectral display + tagline + body + a small product surface preview (typographic, not a screenshot). Total: 4 sections, ~250-400 lines of new JSX in ModesShowcase.

**Why typography-only carries this:** Pass 1's editorial pairing does the heavy lifting. Each mode reuses the same two fonts in radically different treatments — italic vs roman, drop cap vs body, mono fallback for Terminal. The fonts ARE the differentiation. No screenshots needed; no licensing for new fonts beyond Pass 1.

### Multi-product spine

- **Header.tsx:** keep "Kuju Email" as a literal nav item today; add new product nav items when products ship. Mechanical extension. Inline comment notes the pattern.
- **Footer.tsx:** already has a "Products" column; works as-is once Pass 1's duplicate-link fix lands.
- **Data layer:** `products.yaml` at brand level + `kuju-mail-modes.yaml` at product level. Future product 2 with modes gets `<product-id>-modes.yaml`.

### Verification (Pass 2)

- `npm run build` clean
- `npx tsc --noEmit` clean
- `npx eslint` clean
- Dev server visual: each of the four modes feels like a different world distinguishable at a glance through type alone; homepage reads as Kaimoku brand without competing with `/kuju-email`; `/kuju-email` standout count is ≤6
- `/impeccable critique` re-run target: 32+/40

### Estimated commits (Pass 2)

1. **Data layer** — add `products.yaml`, `products.ts` loader, rename `modes.yaml` → `kuju-mail-modes.yaml`, update `modes.ts`
2. **ProductsList component** — `ProductsList.tsx`, no page wiring yet
3. **Homepage restructure** — page.tsx hero rewrite, About expansion, ProductsList wired, Move-Your-Domain removed
4. **Modes rewrite** — `ModesShowcase.tsx` becomes full-bleed per-mode sections
5. **Product page distillation** — kuju-email/page.tsx: cut feature dump to ≤6 standouts, add Move-Your-Domain section
6. **Header/Footer adjustments** — minimal
7. **Critique re-run polish** — last commit if any tactical issues surfaced

7 commits, single PR, multi-commit review-then-squash-merge.

---

## Risks

- **Spectral + Public Sans pairing might feel timid.** Mitigation: implementer can run `/impeccable typeset` against the locked brief during Pass 1 and swap if a stronger pair appears. Critique re-run surfaces this objectively.
- **Six standouts might be too few.** Mitigation: critique re-run names this if real. Expand to 8 or move 2-3 cards into a tabbed/accordion pattern in a follow-up. Don't pre-empt.
- **Typography-only mode treatments might fail to differentiate.** Mitigation: agreed in brainstorm to ship typography-only and add screenshots later if it falls short. Critique re-run is the failure detector.
- **Curator's Reading Room hero copy is hard to write under time pressure.** Mitigation: the spec gives a draft to anchor against; implementer can run `/impeccable clarify` on the homepage hero specifically.
- **Tailwind v4 `@theme` + `font-display` token may not auto-generate utility class.** Mitigation: plan should include verification step. Fallback: inline `style={{ fontFamily: 'var(--font-display)' }}` on mode-section h2/h3 elements that need explicit display treatment outside the base h1-h4 rule.

## Open question (post-PR-B, not blocking)

When does kuju-mail's `DESIGN.md` officially adopt OKLCH ramps for marketing too? Pass 1 reuses the Sumi Green hex but adds OKLCH-tuned variants for marketing register. If/when a Kaimoku-level design token system is formalized, it'd unify product + marketing token files. Not blocking PR-B; flagging for the long arc.

---

## Out of scope for the entire program

(Restated for clarity at the end.)

- Capabilities catalog (`capabilities.yaml`)
- Real product screenshots
- `/kuju-email/guide` content audit
- `/kuju-email/pricing` redesign (recently rewritten)
- `/kuju-email/docs` redesign (auto-generated)
- Multi-product page templates / shared `<ProductPage>`
- `PRODUCT.md` / `DESIGN.md` at kaimoku-website root
- Any changes to kuju-mail or other repos
