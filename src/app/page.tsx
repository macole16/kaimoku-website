import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Email done right.
              <br />
              <span className="text-accent">Managed for you.</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Kaimoku Technologies builds modern, reliable software for
              organizations that value security, transparency, and a better
              email experience.
            </p>
            <div className="flex flex-wrap gap-4">
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
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
              Who We Are
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600">
              Kaimoku Technologies, LLC is a software company focused on
              building tools that make email better. We specialize in email
              and communications &mdash; delivering the security, features, and
              control that modern organizations deserve.
            </p>
            <p className="text-lg leading-relaxed text-slate-600">
              Our name,{" "}
              <span className="font-semibold text-primary">Kaimoku</span>{" "}
              (開目), means &ldquo;opening one&rsquo;s eyes&rdquo; in Japanese
              &mdash; reflecting our belief that organizations should have clear
              visibility into the systems they depend on.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-surface px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl">
            What We Build
          </h2>
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-kuju/10">
                  <svg
                    className="h-6 w-6 text-kuju-dark"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary">Kuju Email</h3>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                A complete email platform with IMAP, webmail, calendar, contacts,
                AI-powered productivity tools, and built-in security &mdash;
                delivered as a managed service so you can focus on what matters.
                Connect your existing Gmail, Outlook, or IMAP accounts to manage
                all your email in one place.
              </p>
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[
                  "Full IMAP & Webmail",
                  "Calendar & Contacts",
                  "Connect Gmail & Outlook",
                  "AI Reply & Compose",
                  "AI Threat Detection",
                  "Workspaces",
                  "Terminal Mode",
                  "Natural Language Search",
                  "Contact Intelligence",
                  "Smart Inbox & Tasks",
                  "Vacation Responder",
                  "14-Day Free Trial",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-kuju"
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
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/kuju-email"
                className="inline-flex items-center gap-2 rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
              >
                Learn about Kuju Email
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Move Your Domain */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
              Move Your Domain to Kuju
            </h2>
            <p className="mb-12 text-lg text-slate-600">
              Switch to Kuju Email in three steps. No downtime, no data loss.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Start Your Trial",
                desc: "Sign up for a 14-day free trial on demo.kuju.email. Full Professional-level access — all features, no restrictions.",
              },
              {
                step: "2",
                title: "Choose a Plan & Bring Your Domain",
                desc: "Pick the tier that fits. Point your MX, SPF, and DKIM records to Kuju — we provide the exact values to copy into your DNS provider.",
              },
              {
                step: "3",
                title: "You're Live",
                desc: "Email flows through Kuju immediately. Import your existing mail anytime. Invite your team and start using the full platform.",
              },
            ].map((s) => (
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
          <div className="mt-10 text-center">
            <Link
              href="/kuju-email/pricing"
              className="inline-block rounded-lg bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="bg-surface px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl">
            Our Values
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Ownership",
                desc: "Your email should work for you. We give organizations full control over their email experience — powerful admin tools, transparent operations, no surprises.",
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
                desc: "We believe in clear pricing, honest documentation, and visible operations. Kuju Email gives you full observability into what's happening with your email — delivery analytics, spam stats, and more.",
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
            Ready to take control of your email?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Sign up for Kuju Email and see how a modern email platform should work.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={URLS.KUJU_TRIAL_SIGNUP}
              className={`rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark ${
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
        </div>
      </section>
    </>
  );
}
