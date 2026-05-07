import type { Metadata } from "next";
import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
import { loadModes } from "@/lib/modes";
import { ModesShowcase } from "@/components/marketing/ModesShowcase";

export const metadata: Metadata = {
  title: "Kuju Email: Complete Email Platform | Kaimoku Technologies",
  description:
    "Kuju Email is one inbox in four UI modes (Standard, Magazine, Timeline, Terminal). IMAP and webmail, calendar and contacts, productivity and security woven into the workflow.",
};

const standoutFeatures = [
  {
    title: "Defense in depth, by default",
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
    desc: 'RFC 4791 calendar and RFC 6352 contacts that sync with Apple Calendar, Thunderbird, and any standard client. One-click "add to calendar" from detected dates in messages.',
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
            <h1
              className="mb-8 text-5xl font-light leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block text-kuju">Kuju Email.</span>
              <span className="mt-2 block italic text-white">
                One inbox in four registers.
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-[1.7] text-slate-300 md:text-xl">
              Pick the one that fits the moment, or move between them as the
              work changes. Calendar, contacts, search, and security come along.
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

      {/* Four Modes - full-bleed per-mode sections (the structural spine) */}
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

      {/* Move Your Domain - relocated from homepage in Pass 2 */}
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

      {/* CTA — quiet outro on cream */}
      <section className="border-t border-slate-200 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-4 text-3xl font-light leading-tight tracking-tight text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Start where it makes sense.
          </h2>
          <p className="mb-8 text-lg leading-[1.7] text-slate-600">
            14 days, full Professional access, on demo.kuju.email. Bring your
            domain when you choose a plan.
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
                isComingSoon(URLS.KUJU_TRIAL_SIGNUP) ? "Coming soon" : undefined
              }
            >
              Start 14-Day Trial
            </a>
            <Link
              href="/kuju-email/pricing"
              className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-kuju hover:underline"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
