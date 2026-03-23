"use client";

import Link from "next/link";
import { useState } from "react";
import { URLS, isComingSoon } from "@/lib/constants";

const tiers = [
  {
    name: "Community",
    price: "Free",
    annualPrice: "Free",
    period: "",
    desc: "Perfect for personal use, small teams, and evaluation.",
    users: "10",
    domains: "1",
    domainAliases: "1",
    storage: "5 GB",
    highlight: false,
    ctaHref: URLS.KUJU_DEMO_SIGNUP,
    ctaLabel: "Start Free",
    overages: null as string[] | null,
    features: [
      "Full IMAP server",
      "Webmail with command palette",
      "Calendar & Contacts (CalDAV/CardDAV)",
      "Natural language search",
      "Auto-save drafts & drag-and-drop",
      "Browser push notifications",
      "Vacation responder with calendar detection",
      "RSPAMD spam filtering",
      "Heuristic phishing detection",
      "Message intelligence panel",
      "Tracking protection",
      "DKIM signing & rotation",
      "2FA & passkey authentication",
      "Community support",
    ],
  },
  {
    name: "Small Business",
    price: "$29",
    annualPrice: "$24",
    period: "/month",
    desc: "For growing organizations that need AI, API access, and extensibility.",
    users: "50",
    domains: "2",
    domainAliases: "Unlimited",
    storage: "25 GB",
    highlight: true,
    ctaHref: URLS.PADDLE_SMALL_BUSINESS,
    ctaLabel: "Get Started",
    overages: [
      "$1.50/extra user/mo",
      "$10/extra domain/mo",
      "$2/extra GB/mo",
      "75 user cap (upgrade for more)",
    ],
    features: [
      "Everything in Community, plus:",
      "AI Reply & AI Rewrite with tone control",
      "AI task extraction & calendar integration",
      "Attachment knowledge extraction & summarization",
      "Waiting-on-reply tracker with nudge",
      "Contact intelligence & People view",
      "Workspaces (project-based grouping)",
      "Inbox summary dashboard",
      "Thread views (3 designs)",
      "Activity feed",
      "Natural language commands",
      "REST API access",
      "Plugin installation & catalog",
      "Per-domain branding & hostnames",
      "Per-domain admin delegation",
      "Priority email support",
    ],
  },
  {
    name: "Professional",
    price: "$99",
    annualPrice: "$82",
    period: "/month",
    desc: "For large teams needing advanced security, archiving, and more domains.",
    users: "500",
    domains: "5",
    domainAliases: "Unlimited",
    storage: "100 GB",
    highlight: false,
    ctaHref: URLS.PADDLE_PROFESSIONAL,
    ctaLabel: "Get Started",
    overages: [
      "$0.75/extra user/mo",
      "$8/extra domain/mo",
      "$2/extra GB/mo",
      "750 user cap (upgrade for more)",
    ],
    features: [
      "Everything in Small Business, plus:",
      "AI spam & phishing scanner (LLM)",
      "AI Smart Inbox categorization",
      "Google Safe Browsing URL checks",
      "Virus attachment stripping",
      "Thread status indicators",
      "Message retention policies",
      "Configurable delivery thresholds",
      "Advanced analytics & reporting",
      "Message archiving",
      "Custom plugin development",
      "Dedicated storage scaling",
      "Priority support with SLA",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    annualPrice: "Custom",
    period: "",
    desc: "For organizations with compliance, audit, and SSO requirements.",
    users: "Unlimited",
    domains: "Unlimited",
    domainAliases: "Unlimited",
    storage: "Custom",
    highlight: false,
    ctaHref: URLS.PADDLE_ENTERPRISE_CONTACT,
    ctaLabel: "Contact Sales",
    overages: null,
    features: [
      "Everything in Professional, plus:",
      "Single sign-on (SSO)",
      "Audit logging",
      "Advanced secrets management",
      "Dedicated support engineer",
      "Custom onboarding assistance",
      "Future self-hosted deployment option",
      "SLA guarantees",
    ],
  },
];

const faqs = [
  {
    q: "Can I start with Community and upgrade later?",
    a: "Yes. The Community tier is fully functional with core features. When you need AI, API access, more users, or additional domains, you can upgrade at any time. Your data stays the same.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "Paid plans support overages — extra users, domains, and storage are billed at the rates shown on each plan. Overages are priced higher per-unit than upgrading, so if you're consistently over your limits, upgrading to the next tier is the better deal. The Community tier does not support overages — you'll need to upgrade.",
  },
  {
    q: "What's the difference between a domain alias and a separate domain?",
    a: "A domain alias shares the same users as your primary domain — mail sent to user@alias.com delivers to user@primary.com. It's free on all plans. A separate domain has its own user accounts and counts toward your domain quota.",
  },
  {
    q: "What counts toward my storage limit?",
    a: "Email messages and attachments stored on the server. Storage is pooled across all your domains. Calendar events and contacts use negligible space and are not metered.",
  },
  {
    q: "Is there a self-hosted option?",
    a: "Not yet, but it's on our roadmap. If you have strict compliance or data residency requirements, reach out — we'd love to hear about your needs.",
  },
  {
    q: "Do I need to set up my own mail server?",
    a: "No. Kuju Email is fully managed — we handle the mail server, spam filtering, DKIM, TLS, and everything else. You just add your domain and start using it.",
  },
  {
    q: "What happens if my subscription expires?",
    a: "Your email continues to work. The platform gracefully downgrades to the Community tier feature set. There are no kill switches. You get a 30-day grace period for over-capacity usage.",
  },
  {
    q: "Can I bring my own AI provider for spam scanning?",
    a: "Yes. The AI spam scanner supports Anthropic Claude, OpenAI, Together AI, Groq, Fireworks, Mistral, and any OpenAI-compatible endpoint. API keys are isolated per-domain.",
  },
];

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
            Start free. Scale when you&rsquo;re ready. No hidden fees, no
            per-seat surprises. All plans include the full email platform.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Demo banner */}
          <div className="mb-12 rounded-xl border border-kuju/20 bg-kuju/5 p-6 text-center">
            <p className="mb-3 text-lg font-semibold text-primary">
              Want to try before you buy?
            </p>
            <p className="mb-4 text-slate-600">
              Create a free demo account and experience Kuju Email with no
              commitment.
            </p>
            <a
              href={URLS.KUJU_DEMO_SIGNUP}
              className={`inline-block rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark ${
                isComingSoon(URLS.KUJU_DEMO_SIGNUP)
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
              title={
                isComingSoon(URLS.KUJU_DEMO_SIGNUP) ? "Coming soon" : undefined
              }
            >
              Try Kuju Email Free
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
                Save ~17%
              </span>
            )}
          </div>

          {/* Tier cards */}
          <div className="grid gap-6 lg:grid-cols-4">
            {tiers.map((tier) => {
              const displayPrice = annual ? tier.annualPrice : tier.price;
              const comingSoon = isComingSoon(tier.ctaHref);

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
                      {displayPrice}
                    </span>
                    {tier.period && (
                      <span className="text-slate-500">{tier.period}</span>
                    )}
                  </div>
                  {annual && tier.price !== "Free" && tier.price !== "Custom" && (
                    <p className="mt-1 text-xs text-slate-500">
                      Billed annually
                    </p>
                  )}
                  <p className="mt-3 text-sm text-slate-600">{tier.desc}</p>

                  {/* Plan limits */}
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {tier.users}
                      </div>
                      <div className="text-xs text-slate-500">users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {tier.domains}
                      </div>
                      <div className="text-xs text-slate-500">
                        {tier.domains === "Unlimited" ? "domains" : "domains"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {tier.storage}
                      </div>
                      <div className="text-xs text-slate-500">storage</div>
                    </div>
                  </div>

                  {/* Domain alias note */}
                  <p className="mt-3 text-center text-xs text-slate-500">
                    + {tier.domainAliases} free domain{" "}
                    {tier.domainAliases === "1" ? "alias" : "aliases"}
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

                  {/* Overages */}
                  {tier.overages && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">
                        Overages
                      </p>
                      {tier.overages.map((o) => (
                        <p key={o} className="text-xs text-slate-500">
                          {o}
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
