import Link from "next/link";
import type { Product } from "@/lib/products";

/**
 * Homepage products section. Renders each Kaimoku product as a typographic
 * block on the section's tinted surface — no card chrome.
 *
 * One product today (Kuju Email). /impeccable critique 2026-05-14
 * dropped the section H2 ("What we build") because plural framing
 * over a single entry under-promised while the visible singular
 * under-delivered. Section now reads as a quiet inline reference
 * between About and Values, not a labeled showcase.
 *
 * When a second product ships, entries stack with a hairline rule
 * between them. Re-introduce a section header at that point if the
 * stack reads as needing one.
 */
export function ProductsList({ products }: { products: Product[] }) {
  return (
    <section className="bg-paper px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl divide-y divide-slate-300">
        {products.map((p) => (
          <article key={p.id} className="space-y-4 py-8 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <h3
                className="text-3xl italic text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {p.name}
              </h3>
              <span className="text-xs text-slate-500">
                {p.status === "shipped"
                  ? `Shipped ${p.shippedIn}`
                  : p.status === "beta"
                    ? `Beta ${p.shippedIn}`
                    : "Coming soon"}
              </span>
            </div>
            <p className="text-base font-medium text-kuju-dark">{p.tagline}</p>
            <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
              {p.description}
            </p>
            <p>
              <Link
                href={p.href}
                className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary-light hover:underline"
              >
                Learn about {p.name}
              </Link>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
