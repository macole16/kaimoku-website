"use client";

import { useState } from "react";
import { URLS, isComingSoon } from "@/lib/constants";
import {
  quote,
  hasVolumeCurve,
  marginalSeatRate,
  seatCap,
  formatMoney,
  type PricingModel,
} from "@/lib/pricing";

interface Tier {
  name: string;
  model: PricingModel;
  /** Seat counts shown as concrete anchor prices under the card. */
  anchors: number[];
  desc: string;
  storagePerAccount: string;
  /** Shown only where the fixed-cost story needs explaining. */
  costNote?: string;
  highlight: boolean;
  ctaHref: string;
  ctaLabel: string;
  extras: string[];
  features: string[];
}

const tiers: Tier[] = [
  {
    name: "Individual / Family",
    model: {
      kind: "base-plus-seat",
      base: 10,
      annualBase: 8.3,
      includedSeats: 5,
      seatRate: 5,
      annualSeatRate: 4.15,
      maxSeats: 10,
    },
    anchors: [5, 8, 10],
    desc: "For individuals and families. Full email platform with AI.",
    storagePerAccount: "5 GB",
    costNote:
      "A household plan, capped at 10 mailboxes. Past that you are a business, and Small Business is the tier with the API, workspaces and admin delegation to match.",
    highlight: false,
    ctaHref: URLS.CHECKOUT_INDIVIDUAL,
    ctaLabel: "Available at launch",
    extras: [
      "+$5/additional account (includes 5 GB), up to 10 total",
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
    model: {
      kind: "per-seat",
      seatRate: 5,
      annualSeatRate: 4.15,
      minSeats: 5,
    },
    anchors: [5, 10, 25],
    desc: "For growing teams. AI productivity, API access, and extensibility.",
    storagePerAccount: "10 GB",
    highlight: true,
    ctaHref: URLS.CHECKOUT_SMALL_BUSINESS,
    ctaLabel: "Available at launch",
    extras: ["+$1/GB/mo for extra storage", "Premium AI: +$5/account/mo"],
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
    model: {
      kind: "platform-plus-seat",
      platformFee: 75,
      annualPlatformFee: 62.5,
      seatRate: 5,
      annualSeatRate: 4.15,
      minSeats: 10,
    },
    anchors: [10, 25, 50],
    desc: "For compliance-conscious teams. Archiving, retention, and advanced security.",
    storagePerAccount: "10 GB",
    costNote:
      "The platform fee covers archiving, the retention engine, and analytics. It is fixed, so it does not grow with your team, and every seat you add costs less than the last.",
    highlight: false,
    ctaHref: URLS.CHECKOUT_PROFESSIONAL,
    ctaLabel: "Available at launch",
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
    model: {
      kind: "platform-plus-seat",
      platformFee: 250,
      annualPlatformFee: 208.3,
      seatRate: 5,
      annualSeatRate: 4.15,
      minSeats: 25,
    },
    anchors: [25, 100, 250],
    desc: "For organizations with identity, audit and residency requirements.",
    storagePerAccount: "10 GB default",
    costNote:
      "From its 25-account minimum upward, Enterprise is exactly $175/month more than Professional at the same account count, and stays $175 more however large you grow. SSO and audit logging cost us the same whether you have 30 mailboxes or 3,000, so we do not charge for them per seat.",
    highlight: false,
    ctaHref: URLS.CHECKOUT_ENTERPRISE,
    ctaLabel: "Available at launch",
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

/** Seat counts offered as one-tap presets on the seat control. */
const SEAT_PRESETS = [5, 10, 25, 50, 100];

const faqs = [
  {
    q: "How will the 14-day trial work?",
    a: "When Kuju Email opens, every new signup will get a 14-day trial with full Professional-level access — all features, no restrictions. You'll get an email address on demo.kuju.email to explore the platform. After the trial, pick a plan and bring your own domain to go live.",
  },
  {
    q: "What happens when my trial expires?",
    a: "Your account freezes — you can still log in and view your existing email, but sending and receiving is paused. Your data is preserved for 30 days, giving you time to choose a plan. Pick any tier and everything resumes instantly.",
  },
  {
    q: "How does per-account pricing work?",
    a: "Small Business, Professional, and Enterprise are billed per email account. You choose how many accounts you need and can add more at any time. Individual/Family includes 5 accounts in the base price, with additional accounts at $5 each up to a maximum of 10. It is a household plan, so it is capped there: above 10 mailboxes you are on Small Business, which is also where the API, workspaces and admin delegation live.",
  },
  {
    q: "What's the Professional platform fee?",
    a: "Professional is $75/month plus $5/account/month, so the smallest Professional plan (10 accounts) is $125/month. At that size the platform fee is most of the bill, which is why we show it rather than quote you a per-account rate. It covers archiving infrastructure, retention policies, advanced analytics and LLM-powered spam scanning: systems that cost us the same whether you have 10 accounts or 100. Because it does not grow with your team, your effective per-mailbox cost falls as you add people, from $12.50 at 10 accounts to $6.50 at 50.",
  },
  {
    q: "How does Enterprise pricing work?",
    a: "Enterprise is $250/month plus $5/account/month, with a 25-account minimum, so the smallest Enterprise plan is $375/month. It is deliberately the same shape as Professional and the same $5/account rate, which makes the upgrade a flat $175/month at any size from its 25-account minimum upward. We price it that way because SSO, audit logging and dedicated infrastructure cost us the same whether you have 30 mailboxes or 3,000. Charging for them per account would mean a 500-person organization paid roughly ten times a 50-person one for identical infrastructure. Add-ons such as managed backups and extended retention are still priced individually.",
  },
  {
    q: "What is Premium AI?",
    a: "Every plan includes base AI features powered by lightweight models. Premium AI ($5/account/month) upgrades to faster, more capable models for better reply drafting, smarter task extraction, and more accurate spam detection. Available on any tier.",
  },
  {
    q: "Do I need my own domain?",
    a: "Not during the trial — you'll use a demo.kuju.email address. When you convert to a paid plan, you'll bring your own domain and point your MX, SPF, and DKIM records to Kuju. We provide the exact values. All paid plans include unlimited custom domains at no extra charge.",
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
];

function PricingPageInner() {
  const [annual, setAnnual] = useState(false);
  const [seats, setSeats] = useState(10);

  return (
    <>
      <section className="bg-gradient-to-br from-surface-deep via-surface-mist to-surface-deep px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Kuju Email is not open yet. This is the pricing we intend to launch
            with, published early because you deserve to know the shape of the
            bill before you invest a migration in us. Set your team size below
            and every plan shows its real monthly total, platform fees included.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Trial banner */}
          <div className="mb-12 rounded-xl border border-kuju/20 bg-kuju/5 p-6 text-center">
            <p className="mb-3 text-lg font-semibold text-primary">
              A 14-day trial will open with the platform
            </p>
            <p className="mb-4 text-slate-600">
              Full Professional-level access, all features, no credit card. We
              are not taking signups yet — tell us you want one and you will
              hear from us before the doors open.
            </p>
            <a
              href={URLS.KUJU_NOTIFY}
              className="inline-block rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
            >
              Get notified at launch
            </a>
          </div>

          {/* Seat control — the page's primary input. Every price below is
              recomputed from it, so the headline figure is the real bill for
              THIS team rather than an abstract per-seat rate. */}
          <div className="mb-10 rounded-2xl border border-slate-200 bg-white px-6 py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              <label
                htmlFor="seat-count"
                className="text-sm font-medium text-slate-700"
              >
                How many mailboxes?
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {SEAT_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSeats(n)}
                    aria-pressed={seats === n}
                    className={`min-w-[3rem] rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      seats === n
                        ? "bg-kuju text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <input
                  id="seat-count"
                  type="number"
                  min={1}
                  max={5000}
                  value={seats}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) setSeats(Math.min(5000, Math.max(1, Math.round(n))));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-kuju focus:outline-none focus:ring-1 focus:ring-kuju"
                  aria-label="Exact number of mailboxes"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Every price below is the real monthly total at this team size,
              add-ons excluded.
            </p>
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
              const q = quote(tier.model, seats, annual);
              const showPerSeat = hasVolumeCurve(tier.model);
              const overflow = marginalSeatRate(tier.model, annual);
              const cap = seatCap(tier.model);

              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    tier.highlight
                      ? "border-primary-light bg-white shadow-lg shadow-primary-light/10 ring-2 ring-primary-light"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Absolutely positioned on purpose: in the flow this badge
                      pushed one card's price ~40px below the other three,
                      breaking the horizontal scan the whole layout exists for. */}
                  {tier.highlight && (
                    <div className="absolute right-6 top-6 rounded-full bg-primary-light/10 px-3 py-1 text-xs font-semibold text-primary-light">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-primary">
                    {tier.name}
                  </h3>
                  {/* True monthly total for the selected team size. This is
                      the headline on purpose: a per-seat rate understates the
                      Professional bill 2.5x at its own minimum.

                      A tier past its seat cap shows why instead of a price. It
                      must not render a number here: a capped tier's price at an
                      uncapped size is not a quote, it is a fiction. */}
                  {q.available ? (
                    <>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          {formatMoney(q.monthly)}
                        </span>
                        <span className="text-slate-500">/month</span>
                      </div>

                      {/* The sum, spelled out. Naming the platform fee here is
                          the whole point of this layout. */}
                      <p className="mt-1 text-sm font-medium text-kuju-dark">
                        {q.breakdown}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {q.billedSeats} {q.billedSeats === 1 ? "seat" : "seats"}
                        {showPerSeat && (
                          <> &middot; {formatMoney(q.perSeat)} per mailbox</>
                        )}
                        {annual && <> &middot; billed annually</>}
                      </p>

                      {q.floorNote && (
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {q.floorNote}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-2xl font-light leading-tight text-slate-400">
                        {q.reason}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        For {seats} mailboxes, see Small Business.
                      </p>
                    </>
                  )}

                  <p className="mt-3 text-sm text-slate-600">{tier.desc}</p>

                  {/* Anchor prices — three concrete monthly totals, so there
                      is something memorable to quote even after the seat
                      control moves. The effective per-seat column appears only
                      where the curve is real: it falls for the platform-fee
                      model, is flat for per-seat models, and RISES for
                      base-plus-seat, where showing it would punish the
                      cheapest tier for growing. */}
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      At a glance
                    </p>
                    <dl className="space-y-1">
                      {tier.anchors.map((n) => {
                        const a = quote(tier.model, n, annual);
                        if (!a.available) return null;
                        return (
                          <div
                            key={n}
                            className="flex items-baseline justify-between gap-2 text-sm"
                          >
                            <dt className="text-slate-500">{n} seats</dt>
                            <dd className="font-semibold text-slate-900">
                              {formatMoney(a.monthly)}
                              {showPerSeat && (
                                <span className="ml-1 font-normal text-slate-500">
                                  ({formatMoney(a.perSeat)}/seat)
                                </span>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                    <p className="mt-2 text-xs text-slate-500">
                      {cap === null
                        ? `+${formatMoney(overflow)} per additional seat`
                        : `+${formatMoney(overflow)} per additional seat, up to ${cap}`}
                    </p>
                  </div>

                  {/* Why the number looks like this. Present only where the
                      cost structure is genuinely counterintuitive. */}
                  {tier.costNote && (
                    <p className="mt-4 text-xs leading-relaxed text-slate-600">
                      {tier.costNote}
                    </p>
                  )}

                  <p className="mt-4 text-xs text-slate-500">
                    {tier.storagePerAccount} storage per account &middot;
                    unlimited domains &amp; aliases
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
                          ? "bg-primary-light text-white"
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
                          ? "bg-primary-light text-white hover:bg-kuju-dark"
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

export default function PricingPage() {
  return <PricingPageInner />;
}
