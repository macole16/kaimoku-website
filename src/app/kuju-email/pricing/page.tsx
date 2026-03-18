import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Kuju Email | Kaimoku Technologies",
  description:
    "Kuju Email pricing plans. Start free with the Community tier and scale to Enterprise.",
};

const tiers = [
  {
    name: "Community",
    price: "Free",
    period: "",
    desc: "Perfect for personal use, small teams, and evaluation.",
    users: "10 users",
    domains: "1 domain",
    highlight: false,
    features: [
      "Full IMAP server",
      "Webmail UI",
      "Calendar & Contacts (CalDAV/CardDAV)",
      "RSPAMD spam filtering",
      "Heuristic phishing detection",
      "Message intelligence panel",
      "DKIM signing & rotation",
      "2FA & passkey authentication",
      "Prometheus metrics",
      "Community support",
    ],
  },
  {
    name: "Small Business",
    price: "$29",
    period: "/month",
    desc: "For growing organizations that need API access and extensibility.",
    users: "50 users",
    domains: "5 domains",
    highlight: true,
    features: [
      "Everything in Community, plus:",
      "REST API access",
      "Plugin installation",
      "Plugin catalog access",
      "Per-domain branding",
      "Per-domain admin delegation",
      "Custom hostnames",
      "Priority email support",
    ],
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    desc: "For large teams needing advanced security and archiving.",
    users: "500 users",
    domains: "Unlimited",
    highlight: false,
    features: [
      "Everything in Small Business, plus:",
      "AI spam & phishing scanner (LLM)",
      "AI Smart Inbox categorization",
      "Message archiving",
      "Custom plugin development",
      "Advanced analytics & reporting",
      "Dedicated storage scaling",
      "Priority support with SLA",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For organizations with compliance, audit, and SSO requirements.",
    users: "Unlimited",
    domains: "Unlimited",
    highlight: false,
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

export default function PricingPage() {
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
          <div className="grid gap-6 lg:grid-cols-4">
            {tiers.map((tier) => (
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
                <h3 className="text-xl font-bold text-primary">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-slate-500">{tier.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600">{tier.desc}</p>

                <div className="mt-6 flex gap-4 border-t border-slate-100 pt-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {tier.users}
                    </div>
                    <div className="text-xs text-slate-500">max</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {tier.domains}
                    </div>
                    <div className="text-xs text-slate-500">
                      {tier.domains === "Unlimited" ? "" : "max"}
                    </div>
                  </div>
                </div>

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

                <Link
                  href={
                    tier.name === "Enterprise"
                      ? "mailto:info@kaimoku.tech?subject=Enterprise%20Inquiry"
                      : "mailto:info@kaimoku.tech?subject=Kuju%20Email%20Interest"
                  }
                  className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? "bg-accent text-white hover:bg-accent-dark"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Link>
              </div>
            ))}
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
            {[
              {
                q: "Can I start with Community and upgrade later?",
                a: "Yes. The Community tier is fully functional with core features. When you need API access, more users, or advanced features, you can upgrade at any time. Your data stays the same.",
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
                q: "What happens if my license expires?",
                a: "Your email continues to work. The platform gracefully downgrades to the Community tier feature set. There are no kill switches or phone-home requirements. You get a 30-day grace period for over-capacity usage.",
              },
              {
                q: "Can I bring my own AI provider for spam scanning?",
                a: "Yes. The AI spam scanner supports Anthropic Claude, OpenAI, Together AI, Groq, Fireworks, Mistral, and any OpenAI-compatible endpoint. API keys are isolated per-domain.",
              },
            ].map(({ q, a }) => (
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
