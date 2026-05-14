import Link from "next/link";
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
            <h1
              className="mb-8 text-5xl font-light leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span lang="ja" className="block text-primary">
                開目
              </span>
              <span className="mt-2 block font-normal italic text-foreground">
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
                className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                See Kuju Email &rarr;
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                What we believe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About — extends the hero's paper warmth one section deeper. With
          the trial outro removed (github-6ck — pure reading room IA), the
          page now reads warm paper (hero + about) → cool surface (products)
          → unfilled close (values). No funnel coda. */}
      <section id="about" className="bg-paper px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-prose">
            <h2 className="mb-8 text-center text-3xl font-light italic text-primary md:text-4xl">
              What we believe
            </h2>
            <div className="space-y-6 text-lg leading-[1.7] text-slate-700">
              <p>Kaimoku Technologies builds software.</p>
              <p>
                Our name,{" "}
                <span className="font-semibold text-primary">Kaimoku</span>, is
                made from the character to open,{" "}
                <span lang="ja" className="text-primary">
                  開く
                </span>
                , and the character for eye,{" "}
                <span lang="ja" className="text-primary">
                  目
                </span>
                . It reflects both an instruction and a promise: the tools we
                build should let you see what is actually in front of you, not
                what a generic interface assumes you would want to see.
              </p>
              <p>
                We start with email because email is where most attention goes.
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
          <h2 className="mb-16 text-center text-3xl font-light italic text-primary md:text-4xl">
            Our values
          </h2>
          <dl className="space-y-12 md:space-y-16">
            {[
              {
                label: "Yours.",
                body: "Your email should work for you. We give organizations full control over their email experience: powerful admin tools, transparent operations, no surprises.",
              },
              {
                label: "In plain sight.",
                body: "Clear pricing, honest documentation, visible operations. Kuju Email surfaces what is happening with your mail: delivery analytics, spam statistics, audit logs.",
              },
              {
                label: "Defended.",
                body: "Email is a high-value target. We treat it that way: layered threat detection, automatic key rotation, encrypted storage, spam filtering at every hop. Quietly, as standard.",
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
    </>
  );
}
