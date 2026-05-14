import Link from "next/link";
import type { Product } from "@/lib/products";

/**
 * Homepage products section. Renders one full-width card per Kaimoku product.
 *
 * One product today (Kuju Email) — the layout is single-column max-w-3xl, so
 * 1 entry doesn't read as "the grid is missing two products." Future entries
 * stack underneath naturally; switch to a multi-column layout only when
 * adding the third product (YAGNI until then).
 */
export function ProductsList({ products }: { products: Product[] }) {
  return (
    <section className="bg-surface px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
          What we build
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">
          Software that pays attention to the small things. We start with email.
        </p>
        <div className="mx-auto max-w-3xl space-y-8">
          {products.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-2xl font-bold text-primary">{p.name}</h3>
                <span className="text-xs text-slate-500">
                  {p.status === "shipped"
                    ? `Shipped ${p.shippedIn}`
                    : p.status === "beta"
                      ? `Beta ${p.shippedIn}`
                      : "Coming soon"}
                </span>
              </div>
              <p className="mb-4 text-base font-medium text-kuju-dark">
                {p.tagline}
              </p>
              <p className="mb-6 whitespace-pre-line text-base leading-relaxed text-slate-600">
                {p.description}
              </p>
              <Link
                href={p.href}
                className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-kuju hover:underline"
              >
                Learn about {p.name}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
