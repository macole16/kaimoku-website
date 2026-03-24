# Pricing Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Kuju Email website to reflect the new pricing model — replacing the freemium Community tier with a 14-day trial and four paid tiers (Individual/Family, Small Business, Professional, Enterprise a la carte).

**Architecture:** This is a frontend-only change across the marketing website. The pricing page (`pricing/page.tsx`) is the primary file — it contains all tier data, FAQ content, and the pricing card UI. Supporting pages (homepage, product page, legal) reference the old model in CTA copy and legal terms. Constants define checkout URLs.

**Tech Stack:** Next.js 16 / React 19 / TypeScript / Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-24-pricing-restructure-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/constants.ts` | Add Individual/Family and Enterprise Paddle URL placeholders, rename demo signup to trial signup |
| Modify | `src/app/kuju-email/pricing/page.tsx` | Replace all tier data, update FAQ, rewrite pricing card UI for new per-account model |
| Modify | `src/app/kuju-email/pricing/layout.tsx` | Update metadata description |
| Modify | `src/app/page.tsx` | Update CTA copy from "free" to "trial" |
| Modify | `src/app/kuju-email/page.tsx` | Update CTA copy from "free Community tier" to trial |
| Modify | `src/app/legal/terms/page.tsx` | Replace Section 4 (subscriptions) and Section 5 (free tier → trial) |
| Modify | `src/app/legal/acceptable-use/page.tsx` | Update resource limits section for per-account model |

---

## Task 1: Update constants with new URL structure

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Update URLS object**

Replace the entire URLS object to reflect the new tier structure:

```typescript
export const URLS = {
  // Trial signup on kuju.email customer portal
  KUJU_TRIAL_SIGNUP: "#coming-soon", // → https://kuju.email/signup

  // Paddle checkout links (replace with real Paddle URLs after approval)
  PADDLE_INDIVIDUAL_FAMILY: "#coming-soon",
  PADDLE_SMALL_BUSINESS: "#coming-soon",
  PADDLE_PROFESSIONAL: "#coming-soon",
  PADDLE_ENTERPRISE: "#coming-soon",
  PADDLE_ENTERPRISE_CONTACT:
    "mailto:info@kaimoku.tech?subject=Enterprise%20Inquiry",

  // General
  CONTACT_EMAIL: "mailto:info@kaimoku.tech",
} as const;
```

Note: `KUJU_DEMO_SIGNUP` is renamed to `KUJU_TRIAL_SIGNUP`. `PADDLE_INDIVIDUAL_FAMILY` and `PADDLE_ENTERPRISE` are new. The `isComingSoon` function stays unchanged.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: Errors about `KUJU_DEMO_SIGNUP` being referenced in `src/app/page.tsx`, `src/app/kuju-email/page.tsx`, and `src/app/kuju-email/pricing/page.tsx`. These will be fixed in subsequent tasks. Note the files listed. (`PADDLE_ENTERPRISE_CONTACT` is retained for general enterprise inquiry use and will not cause errors.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts
git commit -m "refactor: update URL constants for new pricing tiers

Rename KUJU_DEMO_SIGNUP to KUJU_TRIAL_SIGNUP. Add PADDLE_INDIVIDUAL_FAMILY
and PADDLE_ENTERPRISE checkout URL placeholders."
```

---

## Task 2: Rewrite the pricing page — tier data and FAQ

This is the largest task. Replace all tier definitions, the FAQ content, and update the pricing card rendering for the new per-account model.

**Files:**
- Modify: `src/app/kuju-email/pricing/page.tsx`

- [ ] **Step 0: Remove unused `Link` import**

The current file imports `Link` from `next/link` (line 3), but the rewritten component uses only `<a>` tags. Remove line 3:

```diff
-import Link from "next/link";
```

- [ ] **Step 1: Replace the `tiers` array (lines 7-137)**

Replace the entire `tiers` array with the new four-tier structure. The data shape changes significantly — the old model had flat `users`/`domains`/`storage` fields; the new model uses `accounts`, `storagePerAccount`, and a new `pricingModel` field to distinguish base-price tiers from per-account and platform-fee tiers.

```typescript
const tiers = [
  {
    name: "Individual / Family",
    pricingModel: "base" as const,
    price: "$10",
    annualPrice: "$8.30",
    period: "/month",
    desc: "For individuals and families. Full email platform with AI.",
    accounts: "5 included",
    storagePerAccount: "5 GB",
    extraAccountPrice: "$5/account/mo",
    highlight: false,
    ctaHref: URLS.PADDLE_INDIVIDUAL_FAMILY,
    ctaLabel: "Start 14-Day Trial",
    extras: [
      "+$5/additional account (includes 5 GB)",
      "+$1/GB/mo for extra storage",
      "Premium AI: +$5/account/mo",
    ],
    features: [
      "Full IMAP server (RFC 3501)",
      "Webmail with command palette",
      "Calendar & Contacts (CalDAV/CardDAV)",
      "Natural language search",
      "Spam filtering & heuristic phishing detection",
      "DKIM signing & automatic rotation",
      "2FA & passkey authentication",
      "Base AI: reply drafting, rewrite, task extraction",
      "Vacation responder",
      "Unlimited domains",
    ],
  },
  {
    name: "Small Business",
    pricingModel: "per-account" as const,
    price: "$5",
    annualPrice: "$4.15",
    period: "/account/month",
    desc: "For growing teams. AI productivity, API access, and extensibility.",
    accounts: "5 minimum",
    storagePerAccount: "10 GB",
    extraAccountPrice: null,
    highlight: true,
    ctaHref: URLS.PADDLE_SMALL_BUSINESS,
    ctaLabel: "Start 14-Day Trial",
    extras: [
      "+$1/GB/mo for extra storage",
      "Premium AI: +$5/account/mo",
    ],
    features: [
      "Everything in Individual / Family, plus:",
      "AI attachment summarization",
      "Waiting-on-reply tracker with nudge",
      "Contact intelligence & People view",
      "Workspaces (project-based grouping)",
      "Inbox summary dashboard",
      "REST API access (80+ endpoints)",
      "Plugin installation & catalog",
      "Per-domain branding & admin delegation",
      "Priority email support",
    ],
  },
  {
    name: "Professional",
    pricingModel: "platform-fee" as const,
    price: "$5",
    annualPrice: "$4.15",
    period: "/account/month",
    platformFee: "$75",
    annualPlatformFee: "$62.50",
    desc: "For compliance-conscious teams. Archiving, retention, and advanced security.",
    accounts: "10 minimum",
    storagePerAccount: "10 GB",
    extraAccountPrice: null,
    highlight: false,
    ctaHref: URLS.PADDLE_PROFESSIONAL,
    ctaLabel: "Start 14-Day Trial",
    extras: [
      "+$1/GB/mo for extra storage",
      "3-year archiving included",
      "Extended retention: +$0.50/GB/mo",
      "Premium AI: +$5/account/mo",
    ],
    features: [
      "Everything in Small Business, plus:",
      "AI spam & phishing scanner (LLM)",
      "Smart Inbox categorization",
      "Google Safe Browsing URL checks",
      "Virus attachment stripping",
      "Message archiving (3-year retention included)",
      "Configurable retention policies",
      "Advanced analytics & reporting",
      "Custom plugin development",
      "Priority support with SLA",
    ],
  },
  {
    name: "Enterprise",
    pricingModel: "alacarte" as const,
    price: "$7",
    annualPrice: "$5.80",
    period: "/account/month",
    desc: "Self-serve a la carte. Build the plan your organization needs.",
    accounts: "Custom",
    storagePerAccount: "10 GB default",
    minimumSpend: "$300/mo minimum spend",
    extraAccountPrice: null,
    highlight: false,
    ctaHref: URLS.PADDLE_ENTERPRISE,
    ctaLabel: "Start 14-Day Trial",
    extras: [
      "+$1/GB/mo for extra storage",
      "Managed backups: +$7/account/mo",
      "Extended retention: +$0.50/GB/mo",
      "Premium AI: +$5/account/mo",
    ],
    features: [
      "Everything in Professional, plus:",
      "SSO (SAML/OIDC)",
      "Audit logging",
      "Self-serve component builder",
      "Managed backup option",
      "Dedicated infrastructure (coming soon)",
    ],
  },
];
```

- [ ] **Step 2: Replace the `faqs` array (lines 139-172)**

```typescript
const faqs = [
  {
    q: "How does the 14-day trial work?",
    a: "Every new signup gets a 14-day trial with full Professional-level access — all features, no restrictions. After the trial, pick the plan that fits and you're up and running.",
  },
  {
    q: "What happens when my trial expires?",
    a: "Your account freezes — you can still log in and view your existing email, but sending and receiving is paused. Your data is preserved for 30 days, giving you time to choose a plan. Pick any tier and everything resumes instantly.",
  },
  {
    q: "How does per-account pricing work?",
    a: "Small Business, Professional, and Enterprise are billed per email account. You choose how many accounts you need and can add more at any time. Individual/Family includes 5 accounts in the base price with additional accounts at $5 each.",
  },
  {
    q: "What's the Professional platform fee?",
    a: "Professional has a $75/month platform fee plus $5/account/month. The platform fee covers archiving infrastructure, retention policies, advanced analytics, and LLM-powered spam scanning — systems that cost the same whether you have 10 or 100 users.",
  },
  {
    q: "How does Enterprise a la carte work?",
    a: "Enterprise is fully self-serve — pick the components you need from the menu. There's a $300/month minimum spend. Accounts are $7/month each, and you can add managed backups, extended retention, and Premium AI as needed.",
  },
  {
    q: "What is Premium AI?",
    a: "Every plan includes base AI features powered by lightweight models. Premium AI ($5/account/month) upgrades to faster, more capable models for better reply drafting, smarter task extraction, and more accurate spam detection. Available on any tier.",
  },
  {
    q: "Are there limits on domains?",
    a: "No. All plans include unlimited custom domains at no extra charge. Domain aliases are always free. Per-domain branding and admin delegation are available on Small Business and above.",
  },
  {
    q: "What counts toward my storage limit?",
    a: "Email messages and attachments stored on the server. Storage is measured per account. Calendar events and contacts use negligible space and are not metered. You can add extra storage at $1/GB/month on any plan.",
  },
  {
    q: "What happens if I exceed my storage?",
    a: "First, you get a warning and a 14-day grace period to clean up or upgrade. You can opt in to automatic overage billing at $1/GB/month. If you take no action, we'll throttle large attachments but your email keeps working — we never cut you off.",
  },
  {
    q: "Is there an annual discount?",
    a: "Yes — all plans offer a 17% discount (2 months free) when billed annually.",
  },
  {
    q: "Can I bring my own AI provider?",
    a: "Yes. The AI features support Anthropic Claude, OpenAI, Together AI, Groq, Fireworks, Mistral, and any OpenAI-compatible endpoint. API keys are isolated per-domain.",
  },
  {
    q: "Is there a self-hosted option?",
    a: "Not yet, but it's on our roadmap. If you have strict compliance or data residency requirements, reach out — we'd love to hear about your needs.",
  },
];
```

- [ ] **Step 3: Rewrite the PricingPage component (lines 174-402)**

Replace the entire `PricingPage` component. Key changes:
- Trial banner replaces demo banner (copy and CTA text)
- Tier cards adapt to different pricing models (base, per-account, platform-fee, alacarte)
- "Overages" section replaced with "Add-ons & Extras" section
- Plan limits section shows accounts + storage/account instead of users/domains/storage

```tsx
export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Start with a 14-day free trial. Pick the plan that fits when
            you&rsquo;re ready. No hidden fees.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Trial banner */}
          <div className="mb-12 rounded-xl border border-kuju/20 bg-kuju/5 p-6 text-center">
            <p className="mb-3 text-lg font-semibold text-primary">
              Try everything free for 14 days
            </p>
            <p className="mb-4 text-slate-600">
              Full Professional-level access. All features, no restrictions, no
              credit card required.
            </p>
            <a
              href={URLS.KUJU_TRIAL_SIGNUP}
              className={`inline-block rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
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
          </div>

          {/* Billing toggle */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${!annual ? "text-primary" : "text-slate-400"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                annual ? "bg-kuju" : "bg-slate-300"
              }`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${annual ? "text-primary" : "text-slate-400"}`}
            >
              Annual
            </span>
            {annual && (
              <span className="rounded-full bg-kuju/10 px-2 py-0.5 text-xs font-semibold text-kuju-dark">
                Save 17% (2 months free)
              </span>
            )}
          </div>

          {/* Tier cards */}
          <div className="grid gap-6 lg:grid-cols-4">
            {tiers.map((tier) => {
              const comingSoon = isComingSoon(tier.ctaHref);

              /* Build price display based on pricing model */
              let priceDisplay: string;
              let priceSubtext: string | null = null;

              if (tier.pricingModel === "base") {
                priceDisplay = annual ? tier.annualPrice : tier.price;
              } else if (tier.pricingModel === "platform-fee") {
                priceDisplay = annual ? tier.annualPrice : tier.price;
                const fee = annual
                  ? (tier as typeof tiers[2]).annualPlatformFee
                  : (tier as typeof tiers[2]).platformFee;
                priceSubtext = `+ ${fee}/mo platform fee`;
              } else {
                priceDisplay = annual ? tier.annualPrice : tier.price;
              }

              return (
                <div
                  key={tier.name}
                  className={`flex flex-col rounded-2xl border p-8 ${
                    tier.highlight
                      ? "border-accent bg-white shadow-lg shadow-accent/10 ring-2 ring-accent"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {tier.highlight && (
                    <div className="mb-4 inline-block self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-primary">
                    {tier.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {priceDisplay}
                    </span>
                    {tier.period && (
                      <span className="text-slate-500">{tier.period}</span>
                    )}
                  </div>
                  {priceSubtext && (
                    <p className="mt-1 text-sm font-medium text-kuju-dark">
                      {priceSubtext}
                    </p>
                  )}
                  {annual && (
                    <p className="mt-1 text-xs text-slate-500">
                      Billed annually
                    </p>
                  )}
                  <p className="mt-3 text-sm text-slate-600">{tier.desc}</p>

                  {/* Plan limits */}
                  <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {tier.accounts}
                      </div>
                      <div className="text-xs text-slate-500">accounts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {tier.storagePerAccount}
                      </div>
                      <div className="text-xs text-slate-500">per account</div>
                    </div>
                  </div>

                  {/* Minimum spend note (Enterprise) */}
                  {"minimumSpend" in tier && (tier as any).minimumSpend && (
                    <p className="mt-2 text-center text-xs font-medium text-kuju-dark">
                      {(tier as any).minimumSpend}
                    </p>
                  )}

                  {/* Unlimited domains note */}
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Unlimited domains &amp; aliases included
                  </p>

                  {/* Features */}
                  <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-kuju"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Add-ons & Extras */}
                  {tier.extras && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">
                        Add-ons &amp; Extras
                      </p>
                      {tier.extras.map((e) => (
                        <p key={e} className="text-xs text-slate-500">
                          {e}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  {comingSoon ? (
                    <span
                      className={`mt-8 block cursor-not-allowed rounded-lg py-3 text-center text-sm font-semibold opacity-60 ${
                        tier.highlight
                          ? "bg-accent text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                      title="Coming soon"
                    >
                      {tier.ctaLabel}
                    </span>
                  ) : (
                    <a
                      href={tier.ctaHref}
                      className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                        tier.highlight
                          ? "bg-accent text-white hover:bg-accent-dark"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      {tier.ctaLabel}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <h3 className="mb-2 text-lg font-semibold text-primary">{q}</h3>
                <p className="leading-relaxed text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Verify the page compiles**

Run: `npx tsc --noEmit 2>&1 | grep "pricing"`

Expected: No errors in pricing/page.tsx. There may still be errors in other files referencing old URL constants.

- [ ] **Step 5: Commit**

```bash
git add src/app/kuju-email/pricing/page.tsx
git commit -m "feat: rewrite pricing page for new tier structure

Replace Community/SB/Pro/Enterprise with Individual-Family/SB/Pro/Enterprise.
New per-account pricing model, trial-first CTA, updated FAQ section."
```

---

## Task 3: Update pricing page metadata

**Files:**
- Modify: `src/app/kuju-email/pricing/layout.tsx`

- [ ] **Step 1: Update the metadata description**

Change the description from:
```
"Kuju Email pricing plans. Start free with the Community tier and scale to Enterprise."
```
to:
```
"Kuju Email pricing plans. Start with a 14-day free trial. Individual, Small Business, Professional, and Enterprise tiers."
```

- [ ] **Step 2: Commit**

```bash
git add src/app/kuju-email/pricing/layout.tsx
git commit -m "chore: update pricing page metadata for new tier names"
```

---

## Task 4: Update homepage CTAs

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update all `URLS.KUJU_DEMO_SIGNUP` references to `URLS.KUJU_TRIAL_SIGNUP`**

There are two CTA blocks referencing `URLS.KUJU_DEMO_SIGNUP`:
1. Hero section (~line 23): button text "Try Kuju Email Free"
2. Bottom CTA section (~line 300): button text "Try Free"

For each one:
- Replace `URLS.KUJU_DEMO_SIGNUP` with `URLS.KUJU_TRIAL_SIGNUP` (all occurrences in the comparison and href)
- Also replace direct string comparisons (`URLS.KUJU_DEMO_SIGNUP === "#coming-soon"`) with `isComingSoon(URLS.KUJU_TRIAL_SIGNUP)` for consistency. Add `isComingSoon` to the import: `import { URLS, isComingSoon } from "@/lib/constants";`
- Change button text from "Try Kuju Email Free" / "Try Free" to "Start 14-Day Trial"

- [ ] **Step 2: Update "Choose Your Plan" step copy (~line 182)**

Change:
```
"Pick the tier that fits your organization. Start with the free Community tier or go straight to a paid plan with AI features and more domains."
```
to:
```
"Start a 14-day free trial with full access. Then pick the tier that fits — from Individual plans to Enterprise."
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep "page.tsx"`

Expected: No errors in `src/app/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "chore: update homepage CTAs from free tier to 14-day trial"
```

---

## Task 5: Update product page CTAs

**Files:**
- Modify: `src/app/kuju-email/page.tsx`

- [ ] **Step 1: Update all `URLS.KUJU_DEMO_SIGNUP` references to `URLS.KUJU_TRIAL_SIGNUP`**

Two CTA blocks:
1. Hero section (~line 237): button text "Try Kuju Email Free"
2. Bottom CTA section (~line 345): button text "Try Free"

For each:
- Replace `URLS.KUJU_DEMO_SIGNUP` with `URLS.KUJU_TRIAL_SIGNUP` (all occurrences)
- Also replace direct string comparisons (`URLS.KUJU_DEMO_SIGNUP === "#coming-soon"`) with `isComingSoon(URLS.KUJU_TRIAL_SIGNUP)` for consistency. Add `isComingSoon` to the import: `import { URLS, isComingSoon } from "@/lib/constants";`
- Change button text to "Start 14-Day Trial"

- [ ] **Step 2: Update bottom CTA copy (~lines 341-342)**

Change:
```
Choose the plan that fits your organization. Start with the free
Community tier and upgrade as you grow.
```
to:
```
Start with a 14-day free trial. Then choose the plan that fits
your organization.
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep "kuju-email/page.tsx"`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/kuju-email/page.tsx
git commit -m "chore: update product page CTAs from free tier to 14-day trial"
```

---

## Task 6: Update Terms of Service

**Files:**
- Modify: `src/app/legal/terms/page.tsx`

- [ ] **Step 1: Update Section 4 (Subscriptions and Payment, ~line 49-65)**

Replace the `<p>` for "Plans." (line 51):

From:
```
The Service is offered under multiple subscription tiers, including a free Community tier. Paid plans are billed monthly or annually, as selected at the time of purchase.
```
To:
```
The Service is offered under multiple subscription tiers billed monthly or annually, as selected at the time of purchase. All plans require a paid subscription after the trial period ends.
```

- [ ] **Step 2: Replace Section 5 (Free Tier → Trial, ~lines 67-72)**

Replace the entire Section 5 content:

From:
```html
<section>
  <h2>5. Free Tier</h2>
  <p>
    The Community tier is provided at no charge and is subject to the usage limits described on our pricing page. We reserve the right to modify the limits or features of the free tier at any time with reasonable notice. The free tier is provided "as is" without any service level commitments.
  </p>
</section>
```

To:
```html
<section>
  <h2>5. Free Trial</h2>
  <p>
    New accounts receive a 14-day free trial with full access to all platform features. Near the end of the trial period, you may request a one-time 14-day extension. After the trial period (including any extension), you must select a paid subscription to continue using the Service.
  </p>
  <p>
    If no paid plan is selected when the trial expires, your account will be frozen: you may log in and view existing data, but sending and receiving email will be suspended. Your data will be preserved for 30 days following trial expiration. After 30 days without conversion to a paid plan, your account and its data will be permanently deleted with prior notice.
  </p>
  <p>
    The trial is provided &ldquo;as is&rdquo; without any service level commitments.
  </p>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/legal/terms/page.tsx
git commit -m "legal: update Terms of Service for trial model

Replace free Community tier language with 14-day trial terms including
extension, account freeze, and data retention policies."
```

---

## Task 7: Update Acceptable Use Policy

**Files:**
- Modify: `src/app/legal/acceptable-use/page.tsx`

- [ ] **Step 1: Update "abusing free tier limits" (~line 60)**

Change:
```
Create accounts for the purpose of abusing free tier limits
```
To:
```
Create accounts for the purpose of abusing trial periods or plan limits
```

- [ ] **Step 2: Update Section 5 resource limits (~line 93)**

Change:
```
Each subscription tier includes defined limits for users, domains, storage, and sending volume. Usage that consistently exceeds your plan's limits may result in a request to upgrade, temporary throttling, or suspension of the account.
```
To:
```
Each subscription tier includes defined per-account limits for storage and sending volume. Usage that consistently exceeds your plan&rsquo;s limits will trigger a notification and grace period, followed by automatic overage billing (if opted in) or temporary throttling of large attachments.
```

- [ ] **Step 3: Commit**

```bash
git add src/app/legal/acceptable-use/page.tsx
git commit -m "legal: update Acceptable Use for trial model and per-account limits"
```

---

## Task 8: Full build verification and visual check

- [ ] **Step 1: Run TypeScript compilation**

Run: `npx tsc --noEmit`

Expected: Clean — no errors.

- [ ] **Step 2: Run the dev server and verify pages load**

Run: `npm run dev` (or `npx next dev`)

Check these URLs manually:
- `http://localhost:3000` — homepage, verify trial CTAs
- `http://localhost:3000/kuju-email` — product page, verify trial CTAs
- `http://localhost:3000/kuju-email/pricing` — pricing page, verify all 4 tiers render correctly, billing toggle works, FAQ displays
- `http://localhost:3000/legal/terms` — verify updated Section 4 & 5
- `http://localhost:3000/legal/acceptable-use` — verify updated Section 5

- [ ] **Step 3: Verify annual billing toggle**

On the pricing page, toggle to Annual and verify:
- Individual/Family shows $8.30/month
- Small Business shows $4.15/account/month
- Professional shows $4.15/account/month + $62.50/mo platform fee
- Enterprise shows $5.80/account/month
- Badge shows "Save 17% (2 months free)"

- [ ] **Step 4: Final commit if any fixes needed**

If any visual or compilation issues were found and fixed, commit them.

```bash
git add -A
git commit -m "fix: address visual/compilation issues from pricing restructure"
```
