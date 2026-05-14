import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
import { loadProducts } from "@/lib/products";
import { Mark } from "@/components/Logo";
import { ProductsList } from "@/components/marketing/ProductsList";

export default function Home() {
  const products = loadProducts();
  return (
    <>
      {/* Hero — paper + watermark Mark (Curator's Reading Room).
          Kaimoku-tier brand identity leads; Sumi Green is reserved for
          the brand mark and CTA. Mark watermark bleeds off the right
          edge as ornament; type does the work. */}
      <section className="relative overflow-hidden bg-paper px-6 py-24 text-foreground md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-7%] top-1/2 hidden -translate-y-1/2 opacity-[0.15] md:block"
        >
          <Mark size={560} />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Kaimoku Technologies
            </p>
            <h1
              className="mb-8 text-5xl font-light leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span lang="ja" className="block text-primary">
                開目
              </span>
              <span className="mt-2 block italic text-foreground">
                Opening one&rsquo;s eyes.
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-[1.7] text-slate-700 md:text-xl">
              Kaimoku Technologies builds software that pays attention to the
              things software has stopped paying attention to. We start with{" "}
              <span className="font-semibold text-primary">Kuju Email</span>:
              secure, transparent business email.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/kuju-email"
                className="rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
              >
                Explore Kuju Email
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-kuju hover:underline"
              >
                What we believe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About - what Kaimoku believes about software */}
      <section id="about" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-prose">
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

      {/* Values — asymmetric left-rail label, narrow prose body */}
      <section id="values" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-primary md:text-4xl">
            Our values
          </h2>
          <dl className="space-y-12 md:space-y-16">
            {[
              {
                label: "Ownership.",
                body: "Your email should work for you. We give organizations full control over their email experience: powerful admin tools, transparent operations, no surprises.",
              },
              {
                label: "Transparency.",
                body: "Clear pricing, honest documentation, and visible operations. Kuju Email surfaces what is happening with your mail in plain sight: delivery analytics, spam statistics, audit logs.",
              },
              {
                label: "Security.",
                body: "Email is a high-value target. Two-tier threat detection, automatic DKIM rotation, encrypted secrets storage, and multi-layer spam filtering, as standard.",
              },
            ].map(({ label, body }) => (
              <div
                key={label}
                className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-12"
              >
                <dt
                  className="text-2xl italic text-primary md:text-right"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {label}
                </dt>
                <dd className="max-w-prose text-lg leading-[1.7] text-slate-700">
                  {body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA - quiet outro on cream */}
      <section className="border-t border-slate-200 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-4 text-3xl font-light leading-tight tracking-tight text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Try Kuju Email.
          </h2>
          <p className="mb-8 text-lg leading-[1.7] text-slate-600">
            14 days, full Professional access, no credit card.
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
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
