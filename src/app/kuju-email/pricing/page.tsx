"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { URLS, isComingSoon } from "@/lib/constants";

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
    ctaHref: URLS.CHECKOUT_INDIVIDUAL,
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
    ctaHref: URLS.CHECKOUT_SMALL_BUSINESS,
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
    ctaHref: URLS.CHECKOUT_PROFESSIONAL,
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
    ctaHref: URLS.CHECKOUT_ENTERPRISE,
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

const faqs = [
  {
    q: "How does the 14-day trial work?",
    a: "Every new signup gets a 14-day trial with full Professional-level access — all features, no restrictions. You'll get an email address on demo.kuju.email to explore the platform. After the trial, pick a plan and bring your own domain to go live.",
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
  {
    q: "Is there a self-hosted option?",
    a: "Not yet, but it's on our roadmap. If you have strict compliance or data residency requirements, reach out — we'd love to hear about your needs.",
  },
];

function PricingPageInner() {
  const [annual, setAnnual] = useState(false);
  const searchParams = useSearchParams();
  // accountRef is the trial user's account ID, passed from the upgrade banner.
  // Will be included in Polar checkout metadata for conversion tracking.
  const accountRef = searchParams.get("ref") || "";

  return (
    <>
      <section className="bg-gradient-to-br from-surface-deep via-surface-mist to-surface-deep px-6 py-20 text-white">
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
              Full Professional-level access on demo.kuju.email. All features, no
              restrictions, no credit card required. Bring your own domain when
              you&rsquo;re ready to go live.
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

export default function PricingPage() {
  return (
    <Suspense>
      <PricingPageInner />
    </Suspense>
  );
}
