import type { Mode } from "@/lib/modes";

export function ModesShowcase({ modes }: { modes: Mode[] }) {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
          The Mode Follows the Moment
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">
          Four ways to work your inbox. Pick the one that fits the moment, or
          move between them as your attention shifts.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-bold text-primary">{mode.name}</h3>
                <span className="text-xs text-slate-500">
                  {mode.shipped_in}
                </span>
              </div>
              <p className="mb-1 text-sm font-medium text-kuju-dark">
                {mode.tagline}
              </p>
              <p className="mb-4 text-sm italic text-slate-500">
                {mode.audience}
              </p>
              <p className="mb-4 text-sm leading-relaxed text-slate-700">
                {mode.body}
              </p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {mode.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-kuju" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
