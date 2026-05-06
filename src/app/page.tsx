import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
import { loadProducts } from "@/lib/products";
import { ProductsList } from "@/components/marketing/ProductsList";

export default function Home() {
  const products = loadProducts();
  return (
    <>
      {/* Hero - Kaimoku brand statement (Curator's Reading Room voice) */}
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
              <span lang="ja" className="block text-kuju">
                開目
              </span>
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

      {/* About - what Kaimoku believes about software */}
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
                <span lang="ja" className="italic text-primary">
                  (開目)
                </span>
                , means &ldquo;opening one&rsquo;s eyes.&rdquo; It is both an
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
            14 days, full Professional access, no credit card.
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
