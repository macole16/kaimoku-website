# PR-B Pass 2 — IA reframe + modes restructure + multi-product spine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage a Kaimoku brand surface (philosophy + product list) and `/kuju-email` a pure product page with the four UI modes as the structural spine. Bake in a multi-product data spine (`products.yaml` + `kuju-mail-modes.yaml` naming) so a second product can ship without rework.

**Architecture:** Three structural changes layered on Pass 1's token + typography foundation. (1) Data: introduce `src/data/products.yaml` + `src/lib/products.ts`; rename `modes.yaml` → `kuju-mail-modes.yaml` for multi-product naming hygiene. (2) Components: rewrite `ModesShowcase` from a four-card grid into four full-bleed typography-led sections keyed on `mode.id`; add `ProductsList` for the homepage. (3) Pages: rewrite homepage with Curator's Reading Room voice (開目 lede), drop the 12-cell feature checklist and Move-Your-Domain section; rewrite `/kuju-email` distilling the 40-card feature dump (8 standout + 32 catalog) to ≤6 standouts and relocating Move-Your-Domain. Mode treatments rely on Pass 1's Spectral + Public Sans pairing for differentiation — typography-only, no screenshots. All work on a `marketing-redesign-pass-2` branch off `main`; squash-merge at the end.

**Tech Stack:** Next.js 16 (App Router, server components), React 19, TypeScript (strict), Tailwind v4 (`@theme inline`, `@layer base`), `next/font/google` (Spectral, Public Sans — already loaded by Pass 1), `yaml` package for YAML parsing. No tests in this repo — verification = `npx eslint` + `npx tsc --noEmit` + `npm run build` + dev-server visual + `/impeccable critique` re-run.

**Spec:** `kaimoku-website/docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md` (Pass 2 section, lines 194–327)

**Pass 1 baseline:** squash-merged to main at `82d920d`. Pass 1 closed github-x57.1, .2, .5, .7. This plan closes the remaining three.

**Closes (on merge to main):** github-x57.3 (feature dump → ≤6 standouts), github-x57.4 (modes told not shown → full-bleed per-mode typography), github-x57.6 (no imagery — resolved indirectly by typography-only mode treatments).

**End condition:** `/impeccable critique` re-run on `/` and `/kuju-email` scores ≥ 32/40 (current baseline 23/40, kuju-mail Standard mode's post-pass-arc band).

---

## Files touched

| Action  | Path                                                    | Responsibility                                                                                                   |
| ------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| NEW     | `src/data/products.yaml`                                | Kaimoku product catalog (1 entry today: Kuju Email)                                                              |
| NEW     | `src/lib/products.ts`                                   | Typed `Product` interface + `loadProducts()` synchronous YAML loader; mirrors `modes.ts`                         |
| NEW     | `src/components/marketing/ProductsList.tsx`             | Homepage products section — full-width card-per-product (single column today; lays out cleanly at 2–3)           |
| RENAME  | `src/data/modes.yaml` → `src/data/kuju-mail-modes.yaml` | Multi-product naming hygiene; future products with modes get `<product-id>-modes.yaml`                           |
| EDIT    | `src/lib/modes.ts`                                      | Update file path constant to new yaml name                                                                       |
| REWRITE | `src/components/marketing/ModesShowcase.tsx`            | Four full-bleed typography-led sections with mode-id-keyed renderer switch (Standard/Magazine/Timeline/Terminal) |
| REWRITE | `src/app/page.tsx`                                      | IA reframe: brand hero (開目 lede), expanded About, ProductsList replaces "What We Build", drop Move-Your-Domain |
| REWRITE | `src/app/kuju-email/page.tsx`                           | Cut `features` (32 cards) and `standoutFeatures` (8) arrays to one 6-item array; add Move-Your-Domain section    |
| EDIT    | `src/components/Header.tsx`                             | Inline comment near nav about the multi-product extension pattern                                                |

---

## Task 1: Create the feature branch

**Files:** none (branch operation)

- [ ] **Step 1: Verify clean working tree and on main**

```
cd /Users/macole/github/kaimoku-website && git status && git log --oneline -1
```

Expected:

- `On branch main`, `Your branch is up to date with 'origin/main'`, `nothing to commit, working tree clean`
- Last commit: `82d920d PR-B Pass 1: foundation + tactical hygiene`

If working tree is dirty, STOP and ask the user how to proceed.

- [ ] **Step 2: Create the branch**

```
cd /Users/macole/github/kaimoku-website && git checkout -b marketing-redesign-pass-2 main
```

Expected: `Switched to a new branch 'marketing-redesign-pass-2'`.

- [ ] **Step 3: Verify branch state**

```
git status && git log --oneline -1
```

Expected: `On branch marketing-redesign-pass-2`, `nothing to commit, working tree clean`, last commit still `82d920d`.

---

## Task 2: Data layer — products.yaml, products.ts, modes.yaml rename

**Files:**

- Create: `/Users/macole/github/kaimoku-website/src/data/products.yaml`
- Create: `/Users/macole/github/kaimoku-website/src/lib/products.ts`
- Rename (git mv): `src/data/modes.yaml` → `src/data/kuju-mail-modes.yaml`
- Modify: `/Users/macole/github/kaimoku-website/src/lib/modes.ts:24`

The Pass 2 spec specifies `shipped_in: "0.13-beta"` (snake_case) in the products.yaml schema, but the existing repo convention from commit `8215d68` is camelCase (`shippedIn` in `modes.yaml` and `Mode.shippedIn` in `modes.ts`). This plan honors the camelCase repo convention to keep one rule across the data layer.

- [ ] **Step 1: Create `src/data/products.yaml`**

Write `/Users/macole/github/kaimoku-website/src/data/products.yaml` with exactly this content:

```yaml
# Source of truth for Kaimoku Technologies' product catalog.
# Schema: { id, name, tagline, description, href, status, shippedIn }.
# Status values: shipped | beta | coming_soon.
# When a product evolves, edit this file — the renderer picks it up at next build.
# Designed to scale: add a new product as a new top-level entry. The
# ProductsList component lays out cleanly at 1, 2, or 3+ entries.

- id: kuju-mail
  name: Kuju Email
  tagline: A complete email platform with four UI modes.
  description: |
    Email infrastructure that pays attention. AI-powered productivity and
    security, calendar and contacts, four selectable UI modes for the way
    you work. Managed service or self-host (coming soon).
  href: /kuju-email
  status: shipped
  shippedIn: "0.13-beta"
```

- [ ] **Step 2: Create `src/lib/products.ts`**

Write `/Users/macole/github/kaimoku-website/src/lib/products.ts` with exactly this content:

```typescript
import fs from "fs";
import path from "path";
import yaml from "yaml";

/** A single Kaimoku product entry from src/data/products.yaml. */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: "shipped" | "beta" | "coming_soon";
  shippedIn: string;
}

/**
 * Load the Kaimoku product catalog from src/data/products.yaml.
 *
 * Synchronous file read — safe for Next.js server components where this
 * executes at build / SSR time. Mirrors loadModes() in src/lib/modes.ts.
 */
export function loadProducts(): Product[] {
  const filePath = path.join(process.cwd(), "src", "data", "products.yaml");
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(raw) as Product[];
}
```

- [ ] **Step 3: Rename modes.yaml via `git mv`**

```
cd /Users/macole/github/kaimoku-website && git mv src/data/modes.yaml src/data/kuju-mail-modes.yaml
```

Expected: silent success. `git status` should show:

```
renamed:    src/data/modes.yaml -> src/data/kuju-mail-modes.yaml
```

Using `git mv` (not raw `mv`) preserves blame/log history for the file.

- [ ] **Step 4: Update path in `src/lib/modes.ts`**

Edit `/Users/macole/github/kaimoku-website/src/lib/modes.ts`. Two changes:

The docstring on line 17 currently reads:

```typescript
 * Load the 4 kuju-mail UI modes from src/data/modes.yaml.
```

Change to:

```typescript
 * Load the 4 kuju-mail UI modes from src/data/kuju-mail-modes.yaml.
```

The path on line 24 currently reads:

```typescript
const filePath = path.join(process.cwd(), "src", "data", "modes.yaml");
```

Change to:

```typescript
const filePath = path.join(
  process.cwd(),
  "src",
  "data",
  "kuju-mail-modes.yaml",
);
```

- [ ] **Step 5: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/lib/modes.ts src/lib/products.ts && npx tsc --noEmit
```

Expected: both clean. The `Product` interface compiles; the renamed yaml is reachable from the updated path.

```
npm run build 2>&1 | tail -20
```

Expected: build succeeds. `/kuju-email` route still pre-renders (it consumes `loadModes()`); `loadProducts()` is defined but not yet wired into any page (that lands in Task 4) — Next will tree-shake or simply not call it. Build passes either way.

If build fails with "ENOENT: src/data/modes.yaml", the rename or path update didn't land — recheck Steps 3 and 4. If build fails with "yaml.parse" errors on products.yaml, recheck the YAML in Step 1 for indentation.

- [ ] **Step 6: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/data/products.yaml src/data/kuju-mail-modes.yaml src/lib/products.ts src/lib/modes.ts
git commit -m "$(cat <<'EOF'
Data layer: products.yaml + multi-product modes naming

Adds src/data/products.yaml as the Kaimoku product catalog (1 entry
today: Kuju Email; designed to scale). New src/lib/products.ts loader
mirrors loadModes() — synchronous read, typed Product interface.

Renames src/data/modes.yaml → src/data/kuju-mail-modes.yaml so the
naming makes the product association explicit and a future product
with modes (e.g. <product-id>-modes.yaml) can coexist. src/lib/modes.ts
updated to read from the new path.

shippedIn (camelCase) per existing repo convention; spec wrote
snake_case but commit 8215d68 standardized on camelCase.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, data layer).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: ProductsList component (no page wiring yet)

**Files:**

- Create: `/Users/macole/github/kaimoku-website/src/components/marketing/ProductsList.tsx`

Spec calls for "one full-width card per product (single column at 1 entry — no `grid-cols-3` skeleton waiting for products that don't exist), with name, tagline, description, primary link." Designed to lay out cleanly with 2–3 entries. We use a single-column max-w-3xl flow with `space-y-8`; this generalizes to N entries without changing the container.

- [ ] **Step 1: Write the component**

Write `/Users/macole/github/kaimoku-website/src/components/marketing/ProductsList.tsx` with exactly this content:

```tsx
import Link from "next/link";
import type { Product } from "@/lib/products";

/**
 * Homepage products section. Renders one full-width card per Kaimoku product.
 *
 * One product today (Kuju Email) — the layout is single-column max-w-3xl, so
 * 1 entry doesn't read as "the grid is missing two products." Future entries
 * stack underneath naturally; switch to a multi-column layout only when
 * adding the third product (YAGNI until then).
 */
export function ProductsList({ products }: { products: Product[] }) {
  return (
    <section className="bg-surface px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
          What we build
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">
          Software that pays attention to the small things. We start with email.
        </p>
        <div className="mx-auto max-w-3xl space-y-8">
          {products.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-2xl font-bold text-primary">{p.name}</h3>
                <span className="text-xs text-slate-500">
                  {p.status === "shipped"
                    ? `Shipped ${p.shippedIn}`
                    : p.status === "beta"
                      ? `Beta ${p.shippedIn}`
                      : "Coming soon"}
                </span>
              </div>
              <p className="mb-4 text-base font-medium text-kuju-dark">
                {p.tagline}
              </p>
              <p className="mb-6 whitespace-pre-line text-base leading-relaxed text-slate-600">
                {p.description}
              </p>
              <Link
                href={p.href}
                className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-kuju hover:underline"
              >
                Learn about {p.name} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Notes for the implementer:

- `whitespace-pre-line` on the description preserves the newlines from the YAML `|` block scalar.
- The status badge handles all three `Product["status"]` values without an `as never` escape hatch.
- The h3 is plain bold sans by default (Pass 1's `@layer base` rule applies the display font to h1–h4 — that's intentional and consistent with the rest of the site).

- [ ] **Step 2: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/components/marketing/ProductsList.tsx && npx tsc --noEmit
```

Expected: both clean.

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds. `ProductsList` is defined but not yet imported by any page; it'll show up as an unused export. Next will not warn about that — the component is just sitting in the tree.

- [ ] **Step 3: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/components/marketing/ProductsList.tsx
git commit -m "$(cat <<'EOF'
ProductsList component (homepage product catalog renderer)

Mirrors ModesShowcase as a marketing-folder component. Renders one
full-width card per product (single column max-w-3xl; scales to 2–3
entries without changing the container). Status badge handles
shipped / beta / coming_soon.

No page wiring in this commit — the homepage rewrite that imports
this component lands in the next commit, keeping the diff atomic.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, ProductsList component).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Homepage IA reframe — brand hero, About, ProductsList, drop Move-Your-Domain

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/page.tsx`

The current homepage has 6 sections (Hero, About, "What We Build" with Kuju Email card + 12-cell feature checklist, Move-Your-Domain, Values, CTA). The new structure is 5 sections (Hero, About expanded, ProductsList, Values, CTA). Move-Your-Domain relocates to `/kuju-email` in Task 6; the 12-cell feature checklist gets dropped (the kuju-mail entry's description in `products.yaml` carries the high-level pitch, with full features on `/kuju-email`).

The closing CTA preserves Pass 1's collapsed pattern (1 primary button + 1 text link) — spec line 220 says "single primary"; we read that as a single primary action choice, with the secondary text link as the calmer companion that Pass 1 standardized.

- [ ] **Step 1: Read the file**

Read `/Users/macole/github/kaimoku-website/src/app/page.tsx` end-to-end (it currently sits at 320 lines) so the Edit operations target exact text.

- [ ] **Step 2: Replace the whole file**

The IA reframe rewrites every section except Values and CTA. Surgical edits would touch the majority of lines anyway, so a full rewrite is cleaner.

Replace the entire content of `/Users/macole/github/kaimoku-website/src/app/page.tsx` with:

```tsx
import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
import { loadProducts } from "@/lib/products";
import { ProductsList } from "@/components/marketing/ProductsList";

export default function Home() {
  const products = loadProducts();
  return (
    <>
      {/* Hero — Kaimoku brand statement (Curator's Reading Room voice) */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-kuju">
              Kaimoku Technologies
            </p>
            <h1
              className="mb-8 text-5xl font-light leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block text-kuju">開目</span>
              <span className="mt-2 block italic text-white">
                Opening one&rsquo;s eyes.
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-[1.7] text-slate-300 md:text-xl">
              Kaimoku Technologies builds software that pays attention to the
              things software has stopped paying attention to. We start with
              email.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/kuju-email"
                className="rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
              >
                Explore Kuju Email →
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-kuju hover:underline"
              >
                What we believe ↓
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About — what Kaimoku believes about software */}
      <section id="about" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-primary md:text-4xl">
              What we believe
            </h2>
            <div className="space-y-6 text-lg leading-[1.7] text-slate-700">
              <p>
                Kaimoku Technologies builds software for the parts of work
                software has forgotten: the email thread that matters, the
                calendar entry that should have been pulled from the message
                above it, the contact who hasn&rsquo;t been heard from in seven
                months. We treat the small things as the work.
              </p>
              <p>
                Our name,{" "}
                <span className="font-semibold text-primary">Kaimoku</span>{" "}
                <span className="italic text-primary">(開目)</span>, means
                &ldquo;opening one&rsquo;s eyes.&rdquo; It is both an
                instruction and a promise: the tools we build should let you see
                what is actually in front of you, not what a generic interface
                assumes you would want to see.
              </p>
              <p>
                We start with email because email is where most attention goes.
                We do not plan to stop there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <ProductsList products={products} />

      {/* Values */}
      <section id="values" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl">
            Our values
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Ownership",
                desc: "Your email should work for you. We give organizations full control over their email experience: powerful admin tools, transparent operations, no surprises.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                ),
              },
              {
                title: "Transparency",
                desc: "We believe in clear pricing, honest documentation, and visible operations. Kuju Email gives you full observability into what's happening with your email: delivery analytics, spam stats, and more.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ),
              },
              {
                title: "Security",
                desc: "Email is a high-value target. We integrate AI-powered threat detection, automatic DKIM rotation, encrypted secrets storage, and multi-layer spam filtering as standard features.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                ),
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-slate-200 p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {v.icon}
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary">
                  {v.title}
                </h3>
                <p className="leading-relaxed text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary-light px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Try Kuju Email
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Fourteen days, full Professional access, no credit card.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={URLS.KUJU_TRIAL_SIGNUP}
              className={`rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark ${
                isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
              title={
                isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined
              }
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
        </div>
      </section>
    </>
  );
}
```

Key changes vs the previous file:

- **Hero rewritten** — "Email done right. Managed for you." replaced with the 開目 lede in oversize Spectral display, an italic English gloss ("Opening one's eyes."), and the spec's three-sentence brand body. The hero CTA flips from `Start 14-Day Trial` to `Explore Kuju Email →` because this is now the brand surface, not the product surface; the trial CTA still appears in the closing section.
- **About expanded** — three paragraphs (vs two short ones), with the 開目 etymology kept as the second paragraph and a "We do not plan to stop there" line that earns the multi-product spine.
- **`<ProductsList products={products} />` replaces the entire "What We Build" section** including the 12-cell feature checklist (which was the only place the four mode names appeared on the homepage; that thesis now belongs entirely to `/kuju-email`).
- **Move Your Domain section deleted** — it relocates to `/kuju-email` in Task 6.
- **Closing CTA copy tightened** — "Ready to take control of your email?" → "Try Kuju Email" / "Sign up for Kuju Email and see..." → "Fourteen days, full Professional access, no credit card." (em-dash-free already from Pass 1; copy register tightened to match the brand voice).
- **Imports** add `loadProducts` and `ProductsList`.

If the implementer wants to refine the hero copy or the About prose, run `/impeccable clarify` against the homepage hero specifically (per spec Risk line 336).

- [ ] **Step 3: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/page.tsx && npx tsc --noEmit && grep -c '&mdash;\|—' src/app/page.tsx
```

Expected:

- ESLint: clean
- tsc: clean
- grep count: `0` (no em dashes)

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds; `/` route prerenders. `loadProducts()` runs at build time and reads `src/data/products.yaml`. If the build fails with "Module not found: @/lib/products" or "@/components/marketing/ProductsList", recheck Tasks 2 and 3 — the new files weren't created or saved.

If the build succeeds but the dev server shows the page rendering blank, check the browser console for the `whitespace-pre-line` class compiling correctly (Tailwind v4 generates it from `white-space: pre-line` — should be fine).

- [ ] **Step 4: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
Homepage: brand surface (開目 hero, expanded About, ProductsList)

Five sections (was six): Hero, About, ProductsList, Values, CTA.
Move-Your-Domain dropped — relocates to /kuju-email in a follow-up
commit. The 12-cell feature checklist dropped — high-level pitch
lives in products.yaml, full features on /kuju-email.

Hero is now Curator's Reading Room voice: 開目 in oversize Spectral
display + italic English gloss "Opening one's eyes." + the spec's
three-sentence brand body. Hero CTA changes from "Start 14-Day Trial"
to "Explore Kuju Email →" since this is the brand surface, not the
product surface; the trial CTA still anchors the closing section.

About expanded to three paragraphs ending with "We do not plan to
stop there" — earns the multi-product spine.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, homepage IA + hero tone shift).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: ModesShowcase rewrite — four full-bleed typography-led sections

**Files:**

- Rewrite: `/Users/macole/github/kaimoku-website/src/components/marketing/ModesShowcase.tsx`

The current `ModesShowcase` is 47 lines: a single shared template rendering four identical cards in a grid. The new version is one renderer per mode, keyed on `mode.id`, with the four sections each occupying its own full-bleed band. Pass 1's Spectral + Public Sans pairing carries the mode differentiation; no screenshots, no extra fonts.

**Tailwind v4 token risk (per spec line 337):** the `--font-display` token in `@theme inline` may not auto-generate a `font-display` utility. To stay safe across Tailwind v4 minor versions, this component uses inline `style={{ fontFamily: "var(--font-display)" }}` whenever it needs the display font on a non-h2 element. The Pass 1 `@layer base` rule still applies the display font to bare `h2`s automatically.

- [ ] **Step 1: Replace the file**

Replace the entire content of `/Users/macole/github/kaimoku-website/src/components/marketing/ModesShowcase.tsx` with:

```tsx
import type { Mode } from "@/lib/modes";

const DISPLAY_FONT = { fontFamily: "var(--font-display)" } as const;

function ModeKicker({ label }: { label: string }) {
  return (
    <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-kuju-dark">
      {label}
    </p>
  );
}

function HighlightList({
  highlights,
  className,
}: {
  highlights: string[];
  className?: string;
}) {
  return (
    <ul
      className={`mt-8 space-y-2 text-base text-slate-600 ${className ?? ""}`}
    >
      {highlights.map((h) => (
        <li key={h} className="border-l-2 border-kuju/40 pl-4 leading-relaxed">
          {h}
        </li>
      ))}
    </ul>
  );
}

/* Standard — the considered default. Calm editorial register. */
function StandardMode({ mode }: { mode: Mode }) {
  return (
    <section className="border-t border-slate-200 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <ModeKicker label="Standard mode · the default workhorse" />
        <h2 className="mb-6 text-5xl font-normal leading-[1.1] tracking-tight text-foreground md:text-6xl">
          {mode.tagline}
        </h2>
        <p className="mb-8 text-lg italic leading-relaxed text-slate-500">
          {mode.audience}
        </p>
        <p className="whitespace-pre-line text-lg leading-[1.7] text-slate-700">
          {mode.body}
        </p>
        <HighlightList highlights={mode.highlights} />
      </div>
    </section>
  );
}

/* Magazine — editorial maximalism. Italic display, drop cap, hairline rules. */
function MagazineMode({ mode }: { mode: Mode }) {
  const trimmed = mode.body.trim();
  const dropCap = trimmed.charAt(0);
  const restBody = trimmed.slice(1);
  return (
    <section className="border-t border-slate-200 bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <ModeKicker label="Magazine mode · an editorial reading room" />
        <h2
          className="mb-6 italic font-light leading-[1.05] tracking-tight text-foreground"
          style={{ ...DISPLAY_FONT, fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
        >
          {mode.tagline}
        </h2>
        <p className="mb-8 text-lg italic leading-relaxed text-slate-500">
          {mode.audience}
        </p>
        <p className="whitespace-pre-line text-xl leading-[1.7] text-slate-700">
          <span
            className="float-left mr-2 mt-2 text-7xl font-bold leading-none text-kuju"
            style={DISPLAY_FONT}
          >
            {dropCap}
          </span>
          {restBody}
        </p>
        <hr className="my-10 border-t border-slate-200" />
        <ul className="space-y-3 text-base text-slate-600">
          {mode.highlights.map((h, i) => (
            <li key={h} className="flex gap-4">
              <span
                className="text-xs italic text-slate-400"
                style={DISPLAY_FONT}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Timeline — dense, hairline-driven. Per-row preview through type alone. */
function TimelineMode({ mode }: { mode: Mode }) {
  const inboxPreview = [
    { time: "09:14", who: "GitHub", subject: "Pull request review requested" },
    { time: "09:32", who: "Anthropic", subject: "Claude release notes" },
    { time: "10:08", who: "Operations", subject: "Quarterly metrics digest" },
    { time: "10:41", who: "Linear", subject: "M-2204 marked done" },
    { time: "11:15", who: "Stripe", subject: "Invoice 4582 paid" },
  ];
  return (
    <section className="border-t border-slate-200 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <ModeKicker label="Timeline mode · scan and glance" />
        <h2
          className="mb-6 font-light leading-[1.1] tracking-tight text-foreground"
          style={{ ...DISPLAY_FONT, fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          {mode.tagline}
        </h2>
        <p className="mb-12 text-lg italic leading-relaxed text-slate-500">
          {mode.audience}
        </p>
        <div className="grid gap-12 md:grid-cols-2">
          <p className="whitespace-pre-line text-base leading-[1.7] text-slate-700">
            {mode.body}
          </p>
          <div className="text-xs">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Tuesday, before lunch
            </p>
            {inboxPreview.map((row, idx) => (
              <div
                key={row.time}
                className={`flex border-t border-slate-200 py-2 ${
                  idx === 0 ? "border-t-2 border-foreground" : ""
                }`}
              >
                <span className="w-16 text-foreground" style={DISPLAY_FONT}>
                  {row.time}
                </span>
                <span className="w-32 truncate text-slate-600">{row.who}</span>
                <span className="flex-1 truncate text-slate-700">
                  {row.subject}
                </span>
              </div>
            ))}
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Caught up · 11:42
            </p>
          </div>
        </div>
        <HighlightList highlights={mode.highlights} />
      </div>
    </section>
  );
}

/* Terminal — monospace overlay. Stone-900 background; only dark band. */
function TerminalMode({ mode }: { mode: Mode }) {
  return (
    <section className="border-t border-slate-200 bg-stone-900 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-kuju">
          terminal mode · for the keyboard
        </p>
        <h2 className="mb-6 font-mono text-4xl font-normal leading-tight tracking-tight text-kuju md:text-5xl">
          {mode.tagline}
        </h2>
        <p className="mb-8 font-mono text-sm italic leading-relaxed text-stone-400">
          {mode.audience}
        </p>
        <p className="whitespace-pre-line font-mono text-sm leading-[1.7] text-stone-300">
          {mode.body}
        </p>
        <pre className="mt-8 overflow-x-auto rounded-md border border-stone-700 bg-stone-950 p-4 font-mono text-xs leading-[1.6] text-stone-300">
          {`:open inbox
:filter from:operations status:unread
   12  ops@kuju.email      Quarterly metrics
    7  alerts@kuju.email   RuleHighDeliveryQueue
    3  signups@kuju.email  Trial activation
:reply 1     ── opens compose buffer
:save        ── draft saved`}
        </pre>
        <ul className="mt-8 space-y-2 font-mono text-sm text-stone-400">
          {mode.highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span className="text-kuju">›</span>
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const MODE_RENDERERS: Record<
  string,
  (props: { mode: Mode }) => React.ReactNode
> = {
  standard: StandardMode,
  magazine: MagazineMode,
  timeline: TimelineMode,
  terminal: TerminalMode,
};

/**
 * Four full-bleed typography-led sections (one per mode).
 *
 * Each mode-id maps to its own renderer (no shared template) so type, layout,
 * and rhythm can differ radically while reusing Pass 1's Spectral + Public
 * Sans pairing. Modes outside the four known ids render nothing — guards
 * against a yaml typo silently breaking the page.
 */
export function ModesShowcase({ modes }: { modes: Mode[] }) {
  return (
    <>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-light leading-tight tracking-tight text-foreground md:text-5xl">
            The mode follows the moment.
          </h2>
          <p className="text-lg italic leading-relaxed text-slate-500">
            Four worlds. The same inbox. Pick the one that fits, or move between
            them as the work changes.
          </p>
        </div>
      </section>
      {modes.map((mode) => {
        const Renderer = MODE_RENDERERS[mode.id];
        if (!Renderer) return null;
        return <Renderer key={mode.id} mode={mode} />;
      })}
    </>
  );
}
```

Implementation notes:

- The `Mode.body` field is a YAML `|` block scalar (multi-line). The `whitespace-pre-line` class preserves its line breaks. The Magazine drop cap takes `body.trim().charAt(0)` to handle any leading whitespace from YAML.
- `font-mono` uses Tailwind v4's built-in `--default-font-mono-family` (no `--font-mono` token defined in Pass 1's `@theme inline`; that's intentional — Tailwind defaults still apply).
- The terminal section's text color uses `text-kuju` (Sumi Green base, OKLCH 0.46/0.07/158). On a `bg-stone-900` (warm dark stone) the contrast is intentional — kuju-green-on-stone is the same palette pairing kuju-mail's terminal mode uses in product.
- Each section starts with `border-t border-slate-200` so the four sections read as a stacked sequence rather than four floating cards. The Terminal section keeps the same border-top to preserve the rhythm even though its background flips dark.
- The `MODE_RENDERERS` switch returns `null` for unknown ids — defensive guard against a yaml typo.

- [ ] **Step 2: Verify build and that h2 elements pick up the display font**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/components/marketing/ModesShowcase.tsx && npx tsc --noEmit
```

Expected: both clean.

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds. `/kuju-email` route prerenders.

```
npm run dev
```

Open http://localhost:3000/kuju-email and verify by eye that:

1. The four mode sections each occupy a full vertical band (not a 2×2 grid).
2. Standard's tagline ("The default workhorse.") renders in Spectral serif (the `@layer base h2` rule is firing).
3. Magazine has a visible drop cap at the start of the body paragraph.
4. Timeline has the right-hand inbox preview rows with monospace-feeling time markers.
5. Terminal has a dark `bg-stone-900` background with green-on-stone text and a code-like preview block.

If Standard's h2 renders in body sans (Public Sans) instead of Spectral, the `@layer base` rule from `globals.css` isn't applying. Quick fix: add `style={DISPLAY_FONT}` directly to that `<h2>` (the same fallback already used elsewhere in the file).

Stop the dev server before the next step.

- [ ] **Step 3: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/components/marketing/ModesShowcase.tsx
git commit -m "$(cat <<'EOF'
ModesShowcase: full-bleed per-mode typography-led sections

Replaces the 4-card grid with one renderer per mode, keyed on mode.id.
Each mode is its own full-bleed section with distinctive typography:

  Standard   — the default workhorse; calm editorial register.
  Magazine   — italic display, drop cap, numbered hairline list.
  Timeline   — dense 2-col with a typographic inbox preview (rows of
               time/sender/subject) on the right.
  Terminal   — bg-stone-900, kuju-green text, monospace, command-mode
               preview block. Only dark band on the page.

Pass 1's Spectral + Public Sans pairing carries the differentiation.
No screenshots, no extra font loads. Inline DISPLAY_FONT style used on
non-h2 elements that need the display face (defensive against the
Tailwind v4 @theme + font-display utility-generation risk called out
in the spec).

Closes the "modes told not shown" critique finding (github-x57.4).

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, modes restructure).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Product page distillation — six standouts + Move Your Domain relocated

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx`

The current file has 381 lines. Two huge data arrays (`features` 7 categories × 32+ items at lines 13–193, and `standoutFeatures` 8 items at lines 195–228) account for ~215 lines. After this task, both are replaced by a single 6-item `standoutFeatures` array; the 32-card "Complete Feature Set" section is deleted entirely. Move Your Domain (relocated from homepage Task 4) gets a new section between Standouts and the closing CTA.

The six standouts come straight from spec lines 281–287. The implementer may swap one of the six during craft if a stronger differentiator surfaces, but holds the cap at 6.

- [ ] **Step 1: Read the file**

Read `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx` end-to-end.

- [ ] **Step 2: Replace the whole file**

Replace the entire content of `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx` with:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
import { loadModes } from "@/lib/modes";
import { ModesShowcase } from "@/components/marketing/ModesShowcase";

export const metadata: Metadata = {
  title: "Kuju Email: Complete Email Platform | Kaimoku Technologies",
  description:
    "Kuju Email is a complete email platform with IMAP, webmail, calendar, contacts, AI-powered productivity and security, and full admin control.",
};

const standoutFeatures = [
  {
    title: "AI security stack",
    desc: "Two-tier spam and phishing detection, Google Safe Browsing URL checks on every link, message intelligence with SPF/DKIM/DMARC and relay-hop tracing, and virus attachments stripped automatically while the message body still arrives.",
  },
  {
    title: "Multi-domain, multi-tenant",
    desc: "Per-domain admin delegation, branded webmail hostnames with automatic TLS, retention policies, partitioned storage, and per-domain spam thresholds. Tenants are fully isolated.",
  },
  {
    title: "Connect existing accounts",
    desc: "Bring Gmail, Outlook, or any IMAP mailbox into one inbox via Kuju Bridge. Send and receive without changing addresses. Use Kuju as the front-end for the email you already have.",
  },
  {
    title: "Native CalDAV and CardDAV",
    desc: 'RFC 4791 calendar and RFC 6352 contacts that sync with Apple Calendar, Thunderbird, and any standard client. AI one-click "add to calendar" from detected dates in messages.',
  },
  {
    title: "Self-hosted option (coming soon)",
    desc: "Run Kuju Email on your own infrastructure when compliance or data residency rules ask for it. The same managed platform, deployed where you choose.",
  },
  {
    title: "Modern authentication",
    desc: "TOTP two-factor, WebAuthn passkeys for passwordless login, automatic JWT key rotation, CSRF double-submit cookies, and encrypted secrets storage backed by Vault, OpenBao, AWS, GCP, or Azure.",
  },
];

const onboardingSteps = [
  {
    step: "1",
    title: "Start your trial",
    desc: "Sign up for a 14-day free trial on demo.kuju.email. Full Professional-level access. All features, no restrictions.",
  },
  {
    step: "2",
    title: "Choose a plan and bring your domain",
    desc: "Pick the tier that fits. Point your MX, SPF, and DKIM records to Kuju. We provide the exact values to copy into your DNS provider.",
  },
  {
    step: "3",
    title: "You're live",
    desc: "Email flows through Kuju immediately. Import your existing mail anytime. Invite your team and start using the full platform.",
  },
];

export default function KujuEmailPage() {
  const modes = loadModes();
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-block rounded-full bg-kuju/20 px-4 py-1 text-sm font-medium text-kuju">
              Email Platform
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Kuju Email
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              A complete, modern email platform with IMAP, webmail, calendar,
              contacts, AI-powered productivity and security, and full
              administrative control. Fully managed so you can focus on your
              business.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href={URLS.KUJU_TRIAL_SIGNUP}
                className={`rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
                  isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
                title={
                  isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
                    ? "Coming soon"
                    : undefined
                }
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
          </div>
        </div>
      </section>

      {/* Four Modes — full-bleed per-mode sections (the structural spine) */}
      <ModesShowcase modes={modes} />

      {/* Six standouts (was 8 + 32 = 40 cards; distilled to 6 per Pass 2 spec) */}
      <section className="bg-surface px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
            What sets Kuju Email apart
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">
            Six things you get from day one. The full feature catalog lives in
            the User Guide and API Docs.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {standoutFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-3 text-lg font-bold text-primary">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
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

      {/* Move Your Domain — relocated from homepage in Pass 2 */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
              Move your domain to Kuju
            </h2>
            <p className="mb-12 text-lg text-slate-600">
              Switch to Kuju Email in three steps. No downtime, no data loss.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {onboardingSteps.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-slate-200 p-8"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-kuju/10 text-lg font-bold text-kuju-dark">
                  {s.step}
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary">
                  {s.title}
                </h3>
                <p className="leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary-light px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Start with a 14-day free trial on demo.kuju.email. Then choose a
            plan and bring your own domain.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={URLS.KUJU_TRIAL_SIGNUP}
              className={`rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark ${
                isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
              title={
                isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined
              }
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
        </div>
      </section>
    </>
  );
}
```

Key changes vs the previous file:

- **`features` array deleted** (was 7 categories × 32+ items). The "Complete Feature Set" section it rendered is also deleted.
- **`standoutFeatures` shrunk from 8 → 6** with new copy taken straight from the spec. The four dropped entries (`AI That Actually Helps You Work`, `Complete Platform, One Service`, `Knows Your Documents Too`, `14-Day Free Trial`, `Domain Onboarding Wizard`) get folded — their concepts surface in the six standouts (AI in "AI security stack" via the Kuju AI workflow context, Knowledge in modes Section's body, Trial in the closing CTA, Onboarding in Move Your Domain).
- **New `onboardingSteps` array** holds the relocated three steps (verbatim copy from the previous homepage's Move-Your-Domain section, with title-case → sentence-case adjustments).
- **Page sequence reordered** to spec line 271–278: Hero → Modes (full-bleed, four sections) → Standouts → Move Your Domain → CTA.
- **Section copy tightened** (no em dashes, no "isn't another email wrapper" defensive register).

- [ ] **Step 3: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/kuju-email/page.tsx && npx tsc --noEmit && grep -c '&mdash;\|—' src/app/kuju-email/page.tsx
```

Expected:

- ESLint: clean
- tsc: clean
- grep count: `0`

```
npm run build 2>&1 | tail -10
```

Expected: build succeeds. `/kuju-email` prerenders.

Visual spot-check (run `npm run dev`, open http://localhost:3000/kuju-email):

1. Hero unchanged — same Kuju Email title, same trial + pricing CTA pair.
2. Right after the hero: the Modes spine (four full-bleed sections from Task 5).
3. Six standout cards in a 3-column grid (lg) / 2-column (md) / 1-column (mobile).
4. Move Your Domain three-step grid below Standouts.
5. Closing CTA unchanged.

Stop the dev server.

- [ ] **Step 4: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/kuju-email/page.tsx
git commit -m "$(cat <<'EOF'
/kuju-email: distill 40 cards to 6; relocate Move Your Domain

Drops the 32-card "Complete Feature Set" catalog and shrinks the
standout grid from 8 cards to 6. The six are taken straight from
spec Section 3 (AI security stack, multi-tenant, connect existing
accounts, CalDAV/CardDAV, self-hosted, modern auth). The full
feature catalog lives in /kuju-email/guide and /kuju-email/docs.

Page sequence is now:
  Hero → Modes (full-bleed spine) → 6 standouts → Move Your Domain
  → CTA.

Move Your Domain relocates from the homepage (it was kuju-mail-
specific; doesn't belong on the Kaimoku brand surface).

Closes the "feature dump, not a story" critique finding (github-x57.3).
Indirectly resolves the "no imagery" finding (github-x57.6) by leaning
on Pass 1's typography pair through the modes spine.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, product page IA + six standout features).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Header inline comment (multi-product extension pattern)

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/components/Header.tsx`

The header is otherwise fine after Pass 1. Spec line 305 calls for "an inline comment about the multi-product pattern." This is the smallest commit in the pass — one comment block; no behavior changes.

- [ ] **Step 1: Add the comment to the desktop nav**

Open `/Users/macole/github/kaimoku-website/src/components/Header.tsx`. Find the desktop nav opening tag (line 19):

```tsx
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
```

Replace with (insert a comment block between the `<nav>` and the first `<Link>`):

```tsx
        <nav className="hidden items-center gap-8 md:flex">
          {/*
            Product nav items: extend this list when new Kaimoku products
            ship. Today's catalog is one product (Kuju Email). Future
            products follow the same href pattern (/<product-id>) and
            should appear here in catalog order — see src/data/products.yaml.
            When the catalog reaches 3+, consider a "Products" dropdown
            instead of flat links.
          */}
          <Link
            href="/"
```

- [ ] **Step 2: Verify**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/components/Header.tsx && npx tsc --noEmit && npm run build 2>&1 | tail -5
```

Expected: all clean. The comment is JSX-syntax (`{/* ... */}`) — passes through cleanly.

- [ ] **Step 3: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/components/Header.tsx
git commit -m "$(cat <<'EOF'
Header: inline note on the multi-product nav extension pattern

No behavior change. Adds a JSX comment in the desktop nav explaining
how to extend the product-link list as the Kaimoku catalog grows
(see src/data/products.yaml). Flags the 3+-products threshold as
the time to consider a dropdown rather than flat links.

Mechanical extension is the spec's stated pattern for the multi-
product spine (vs a more elaborate <ProductNav> abstraction, which
is YAGNI until product 2 actually ships).

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, multi-product spine).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Final verification, /impeccable critique re-run, USER GATE for merge

**Files:** none (verification + user decision + bd close)

This task collects the verification gates, runs the critique-re-run that PR-B's success condition is anchored on, and gives the user the merge choice. If the critique surfaces tactical issues, we add a 7th polish commit before merging (per spec line 325, "last commit if any tactical issues surfaced").

- [ ] **Step 1: Full project build**

```
cd /Users/macole/github/kaimoku-website && npm run build
```

Expected: build succeeds; route summary lists `/`, `/kuju-email`, `/kuju-email/guide`, `/kuju-email/docs`, `/kuju-email/pricing`, `/legal/*` — all prerendered.

- [ ] **Step 2: Lint pass on every touched / created file**

```
cd /Users/macole/github/kaimoku-website && npx eslint \
  src/data/products.yaml \
  src/data/kuju-mail-modes.yaml \
  src/lib/products.ts \
  src/lib/modes.ts \
  src/components/marketing/ProductsList.tsx \
  src/components/marketing/ModesShowcase.tsx \
  src/app/page.tsx \
  src/app/kuju-email/page.tsx \
  src/components/Header.tsx
```

Expected: clean. ESLint may not lint `.yaml` — that's fine; both yaml files were validated indirectly by the build (which calls `yaml.parse`).

- [ ] **Step 3: TypeScript check**

```
cd /Users/macole/github/kaimoku-website && npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Em-dash sweep verification (regression check from Pass 1)**

```
cd /Users/macole/github/kaimoku-website && grep -c '&mdash;\|—' src/app/page.tsx src/app/kuju-email/page.tsx src/components/marketing/ModesShowcase.tsx src/components/marketing/ProductsList.tsx
```

Expected: `0` for all four files. Pass 1 swept page.tsx and kuju-email/page.tsx; Pass 2 should not have re-introduced any.

- [ ] **Step 5: Branch state check**

```
cd /Users/macole/github/kaimoku-website && git status && git log --oneline main..HEAD
```

Expected:

- `On branch marketing-redesign-pass-2`, `nothing to commit, working tree clean`
- 6 commits ahead of `main`: data layer, ProductsList, homepage, ModesShowcase, kuju-email, Header

- [ ] **Step 6: Visual spot-check (manual, dev server)**

```
cd /Users/macole/github/kaimoku-website && npm run dev
```

Open http://localhost:3000 and confirm:

- Hero shows 開目 in oversize Spectral display (not "Email done right.")
- About section is three paragraphs, ending with "We do not plan to stop there."
- ProductsList renders one full-width Kuju Email card with shipped badge ("Shipped 0.13-beta")
- No "Move Your Domain in three steps" section between ProductsList and Values
- Closing CTA is "Try Kuju Email" with one solid trial button + "View pricing →" text link

Open http://localhost:3000/kuju-email and confirm:

- Hero unchanged from Pass 1 (Kuju Email title + trial + pricing pair)
- Right after the hero: "The mode follows the moment." intro section, then four full-bleed sections (Standard light, Magazine white with drop cap, Timeline with right-side inbox preview, Terminal dark with green-on-stone monospace)
- Standouts section has exactly 6 cards (count them)
- Move Your Domain three-step section appears between Standouts and CTA
- Page no longer has the 32-card "Complete Feature Set" section

Stop the dev server when satisfied.

- [ ] **Step 7: Run `/impeccable critique` re-run**

The user runs `/impeccable critique` against the kaimoku-website. Pass the targets explicitly:

> "Run `/impeccable critique` against the kaimoku-website surfaces. Targets: `/` (homepage) and `/kuju-email`. Compare against the 2026-05-05 baseline of 23/40 (filed as bd issue github-x57). End condition for PR-B Pass 2: ≥ 32/40 across both pages. Critique-loop output goes to `docs/superpowers/critiques/2026-05-06-pr-b-pass-2.md` (or wherever `/impeccable` defaults to)."

Wait for the score. Three branches:

- **Score ≥ 32/40 on both pages** — PR-B's success condition is met. Proceed to Step 8.
- **Score < 32/40 but the critique flags tactical, non-structural issues** (typography weight, copy, contrast) — apply a 7th "critique re-run polish" commit before proceeding. Re-run critique to confirm the score moved into the target band.
- **Score < 32/40 and the critique flags structural issues** — STOP and report to the user. Do not paper over a structural failure with a single polish commit. Open a new bd issue describing the structural finding and ask the user how to proceed (extend Pass 2, defer to a Pass 3, or accept and merge with the gap noted).

Document the score in the commit message of any polish commit, e.g.:

```
git add <touched files>
git commit -m "$(cat <<'EOF'
Pass 2 polish: critique-driven tactical fixes

/impeccable critique re-run scored <X>/40 on / and <Y>/40 on
/kuju-email. This commit addresses: <bullet list of fixes>.

Re-run after this commit: <X+>/40 and <Y+>/40 — both ≥ 32/40, the
PR-B success target.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md
(Pass 2, estimated commits #7).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Pause for merge decision (USER GATE)**

Stop. Tell the user:

> "PR-B Pass 2 complete on `marketing-redesign-pass-2` branch.
>
> - 6 commits ahead of `main` (data layer, ProductsList, homepage, ModesShowcase, /kuju-email, Header)\
>   `[+ 1 polish commit if /impeccable surfaced tactical issues]`
> - Build clean, lint clean, tsc clean, em-dash sweep verified zero, dev visual confirmed
> - `/impeccable critique` re-run: `<homepage score>/40` and `<kuju-email score>/40` (vs 23/40 baseline; target 32+)
> - Closes github-x57.3, .4, .6 once merged
>
> Three options:
>
> 1. **Squash-merge to `main`** (per spec) — `git checkout main && git pull --rebase && git merge --squash marketing-redesign-pass-2 && git commit && git push`
> 2. **Multi-commit merge to `main`** (preserves the 6–7 commits as history; also acceptable since the spec describes Pass 2 as 'multi-commit review-then-squash-merge' at line 327) — `git checkout main && git pull --rebase && git merge --no-ff marketing-redesign-pass-2 && git push`
> 3. **Push the branch first** as `marketing-redesign-pass-2` for review on GitHub before merging — `git push -u origin marketing-redesign-pass-2`
>
> Which would you like?"

Wait for the user's explicit choice before proceeding.

- [ ] **Step 9: Execute the chosen merge path**

Based on user's choice:

- **(1) squash-merge:**

```
cd /Users/macole/github/kaimoku-website
git checkout main && git pull --rebase
git merge --squash marketing-redesign-pass-2
git commit -m "$(cat <<'EOF'
PR-B Pass 2: IA reframe + modes restructure + multi-product spine

Closes github-x57.3 (feature dump → 6 standouts), github-x57.4
(modes told not shown → full-bleed per-mode typography), and
github-x57.6 (no imagery — resolved via typography-only treatments).

/impeccable critique re-run: <homepage>/40 and <kuju-email>/40
(vs 23/40 baseline). End condition met.

Per spec docs/superpowers/specs/2026-05-06-pr-b-strategic-repitch-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
git status
```

- **(2) multi-commit merge:**

```
cd /Users/macole/github/kaimoku-website
git checkout main && git pull --rebase
git merge --no-ff marketing-redesign-pass-2 -m "PR-B Pass 2: IA reframe + modes restructure + multi-product spine

Closes github-x57.3, .4, .6."
git push
git status
```

- **(3) push branch only:**

```
cd /Users/macole/github/kaimoku-website
git push -u origin marketing-redesign-pass-2
```

Then wait for further instruction (review on GitHub, then user decides whether to merge from the UI or via option 1/2 above).

For options (1) and (2), expected after `git status`: `On branch main`, `Your branch is up to date with 'origin/main'`, `nothing to commit, working tree clean`.

- [ ] **Step 10: Close the bd issues (only if the branch actually merged in Step 9)**

```
BEADS_DIR=/Users/macole/github/.beads bd close github-x57.3 github-x57.4 github-x57.6 --reason="PR-B Pass 2 merged: IA reframe + modes restructure + multi-product spine"
```

Verify:

```
BEADS_DIR=/Users/macole/github/.beads bd show github-x57
```

Expected: epic shows all 7 children closed (.1 .2 .3 .4 .5 .6 .7). The `github-x57` epic itself can also be closed at this point if all children are closed:

```
BEADS_DIR=/Users/macole/github/.beads bd close github-x57 --reason="All 7 critique children closed; PR-B (Pass 1 + Pass 2) shipped"
```

If the user chose option (3) in Step 9, defer this whole step until the branch actually merges.

- [ ] **Step 11: Update the kaimoku-website memory**

Update the `kaimoku-website-pr-b-progress` bd memory to reflect the completed pass:

```
BEADS_DIR=/Users/macole/github/.beads bd remember --key kaimoku-website-pr-b-progress "Kaimoku-website strategic re-pitch (PR-B) — COMPLETE.

Pass 1 SHIPPED (squash-merge 82d920d): foundation + tactical hygiene. Sumi Green + Stone OKLCH, Spectral display + Public Sans body, single primary CTA per hero/closing, em dashes swept. Closed github-x57.1, .2, .5, .7.

Pass 2 SHIPPED (<commit hash>): IA reframe + modes restructure + multi-product spine. New src/data/products.yaml + src/lib/products.ts; modes.yaml renamed to kuju-mail-modes.yaml; ModesShowcase rewritten as four full-bleed typography-led sections (mode-id-keyed switch); homepage rewritten as Kaimoku brand surface (開目 lede, Curator's Reading Room voice, ProductsList replaces 'What We Build'); /kuju-email distilled from 40 feature cards to 6 standouts; Move Your Domain relocated to /kuju-email; Header inline comment for multi-product extension pattern. Closed github-x57.3, .4, .6 (and github-x57 epic).

/impeccable critique re-run: <homepage>/40 + <kuju-email>/40 (vs 23/40 baseline). PR-B target ≥ 32/40 met.

DEFERRED follow-ups (NOT in PR-B scope):
- Real product screenshots (typography-only mode treatments held; revisit if critique falls)
- /kuju-email/guide content audit
- Multi-product page templates / shared <ProductPage> (build when product 2 ships)
- PRODUCT.md / DESIGN.md at kaimoku-website root (formal docs follow-up)
- capabilities.yaml (YAGNI — feature dump cut, not extracted)

RELATED INVENTORY (separate concern, do not bundle):
- github-2u4 epic + 13 children = [api-doc-parity] kuju-mail capabilities not in openapi.yaml. These are kuju-mail's roadmap, not kaimoku-website's."
```

---

## Self-review notes

**Spec coverage (Pass 2 section, lines 194–327):**

- §Files touched (9 entries) → all present in the file table at the top of this plan; each has a dedicated task.
- §Homepage IA → Task 4: hero rewrite per spec lines 241–249, About expansion, ProductsList wired, Move-Your-Domain dropped, 12-cell feature checklist dropped.
- §products.yaml schema → Task 2 step 1 has the YAML verbatim (with the camelCase `shippedIn` reconciliation noted).
- §Product page IA → Task 6: page sequence (Hero → Modes → Standouts ≤6 → Move Your Domain → CTA) implemented; six standouts copied from spec lines 281–287.
- §Modes restructure (full-bleed per-mode) → Task 5: four mode renderers keyed on `mode.id`; typography-only differentiation per spec line 301; inline `style={DISPLAY_FONT}` fallback per the Tailwind-v4 `@theme` risk in spec line 337.
- §Multi-product spine → Task 2 (data files), Task 7 (Header comment), spec line 304–308 — Footer already works post-Pass-1.
- §Verification → Task 8 covers build, lint, tsc, grep counts, dev visual, and the `/impeccable critique` re-run with explicit fork conditions for ≥32/40, <32/40 tactical, <32/40 structural.
- §Estimated commits (7) → Tasks 2–7 produce 6 commits; Task 8 step 7 conditionally produces the 7th (critique polish) only if the re-run flagged tactical issues, exactly matching spec line 325.

**Placeholder scan:** every code block contains complete content. No "TBD" / "TODO" / "Similar to Task N" patterns. Two intentional exceptions:

- The `<homepage score>/40` / `<kuju-email score>/40` placeholders in Task 8 step 7's commit message and Step 11's memory update — these are populated at execution time from the actual critique output. Marked clearly with angle brackets so the implementer doesn't ship them as literal text.
- The seventh ("polish") commit in Task 8 step 7 has a bullet placeholder `<bullet list of fixes>` because the fixes are determined by the critique output. The commit only happens if the critique surfaces tactical findings, so the placeholder can't be pre-filled.

**Type consistency:**

- `Mode` interface (defined in `src/lib/modes.ts`, unchanged in this plan) — fields `id, name, tagline, audience, body, highlights[], shippedIn` are referenced consistently across `ModesShowcase.tsx` and `kuju-email/page.tsx`.
- `Product` interface (defined in Task 2 step 2) — fields `id, name, tagline, description, href, status, shippedIn` referenced consistently in `ProductsList.tsx` (Task 3) and the YAML in Task 2 step 1.
- `URLS.KUJU_TRIAL_SIGNUP` and `isComingSoon()` from `src/lib/constants.ts` — match the existing imports in the post-Pass-1 codebase (verified by reading `src/lib/constants.ts` during plan-writing).
- `loadModes()` and `loadProducts()` — both exported from their respective modules, both synchronous, both safe inside Next.js server components.

**Why this is in scope for one plan:** every change is on a single branch, all 6–7 commits are reviewable independently, end state is one merged PR. The spec explicitly describes Pass 2 as a single PR (line 327: "single PR, multi-commit review-then-squash-merge").

**User gates:** one explicit gate at Task 8 step 8 (merge / push decision). The `/impeccable critique` step at Task 8 step 7 is structurally a fork (≥32 → proceed; <32 tactical → polish commit; <32 structural → STOP and report). bd close fires only after the branch actually merges in Step 9.

**Risks called out in the spec → mitigations in this plan:**

- **Spectral + Public Sans pairing might feel timid** (spec Risk 1) → critique re-run in Step 7 surfaces this; polish commit applies if needed.
- **Six standouts might be too few** (Risk 2) → critique re-run names this; mitigation is to add 1–2 more or split into accordion in a follow-up; not pre-empted.
- **Typography-only mode treatments might fail to differentiate** (Risk 3) → critique re-run is the failure detector; spec accepts shipping typography-only first.
- **Curator's Reading Room hero copy is hard to write under time pressure** (Risk 4) → Task 4 step 2 provides a complete draft; Task 4 prose explicitly invites `/impeccable clarify` if the implementer wants refinement.
- **Tailwind v4 `@theme` + font-display utility may not auto-generate** (Risk 5) → ModesShowcase uses inline `style={DISPLAY_FONT}` on every non-h2 element that needs the display face; fallback is already baked in. Visual check in Step 6 catches the case where even h2 doesn't pick up the display font.
