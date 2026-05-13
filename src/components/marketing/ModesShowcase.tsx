import type { Mode } from "@/lib/modes";

const DISPLAY_FONT = { fontFamily: "var(--font-display)" } as const;

function ModeKicker({ label }: { label: string }) {
  return (
    <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-kuju-dark">
      {label}
    </p>
  );
}

function HighlightList({
  highlights,
  className,
}: {
  highlights: string[];
  className?: string;
}) {
  return (
    <ul
      className={`mt-8 space-y-2 text-base text-slate-600 ${className ?? ""}`}
    >
      {highlights.map((h) => (
        <li key={h} className="border-l-2 border-kuju/40 pl-4 leading-relaxed">
          {h}
        </li>
      ))}
    </ul>
  );
}

/* Standard - the considered default. Calm editorial register. */
function StandardMode({ mode }: { mode: Mode }) {
  return (
    <section className="border-t border-slate-200 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <ModeKicker label="Standard mode · the default workhorse" />
        <h2 className="mb-6 text-5xl font-normal leading-[1.1] tracking-tight text-foreground md:text-6xl">
          {mode.tagline}
        </h2>
        <p className="mb-8 text-lg italic leading-relaxed text-slate-500">
          {mode.audience}
        </p>
        <p className="whitespace-pre-line text-lg leading-[1.7] text-slate-700">
          {mode.body}
        </p>
        <HighlightList highlights={mode.highlights} />
      </div>
    </section>
  );
}

/* Magazine - editorial maximalism. Italic display, drop cap, hairline rules. */
function MagazineMode({ mode }: { mode: Mode }) {
  const trimmed = mode.body.trim();
  const dropCap = trimmed.charAt(0);
  const restBody = trimmed.slice(1);
  return (
    <section className="border-t border-slate-200 bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <ModeKicker label="Magazine mode · an editorial reading room" />
        <h2
          className="mb-6 italic font-light leading-[1.05] tracking-tight text-foreground"
          style={{ ...DISPLAY_FONT, fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
        >
          {mode.tagline}
        </h2>
        <p className="mb-8 text-lg italic leading-relaxed text-slate-500">
          {mode.audience}
        </p>
        <p className="whitespace-pre-line text-xl leading-[1.7] text-slate-700">
          <span
            className="float-left mr-3 text-7xl font-semibold leading-[0.85] text-kuju"
            style={DISPLAY_FONT}
          >
            {dropCap}
          </span>
          {restBody}
        </p>
        <hr className="my-10 border-t border-slate-200" />
        <ul className="space-y-3 text-base text-slate-600">
          {mode.highlights.map((h, i) => (
            <li key={h} className="flex gap-4">
              <span
                className="text-xs italic text-slate-400"
                style={DISPLAY_FONT}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Timeline - dense, hairline-driven. Per-row preview through type alone. */
function TimelineMode({ mode }: { mode: Mode }) {
  const inboxPreview = [
    { time: "09:14", who: "GitHub", subject: "Pull request review requested" },
    { time: "09:32", who: "Anthropic", subject: "Claude release notes" },
    { time: "10:08", who: "Operations", subject: "Quarterly metrics digest" },
    { time: "10:41", who: "Linear", subject: "M-2204 marked done" },
    { time: "11:15", who: "Stripe", subject: "Invoice 4582 paid" },
  ];
  return (
    <section className="border-t border-slate-200 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <ModeKicker label="Timeline mode · scan and glance" />
        <h2
          className="mb-6 font-light leading-[1.1] tracking-tight text-foreground"
          style={{ ...DISPLAY_FONT, fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          {mode.tagline}
        </h2>
        <p className="mb-12 text-lg italic leading-relaxed text-slate-500">
          {mode.audience}
        </p>
        <div className="grid gap-12 md:grid-cols-2">
          <p className="whitespace-pre-line text-base leading-[1.7] text-slate-700">
            {mode.body}
          </p>
          <div aria-hidden="true" className="text-xs">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Tuesday, before lunch
            </p>
            {inboxPreview.map((row, idx) => (
              <div
                key={row.time}
                className={`flex py-2 ${
                  idx === 0
                    ? "border-t-2 border-foreground"
                    : "border-t border-slate-200"
                }`}
              >
                <span className="w-16 text-foreground" style={DISPLAY_FONT}>
                  {row.time}
                </span>
                <span className="w-32 truncate text-slate-600">{row.who}</span>
                <span className="flex-1 truncate text-slate-700">
                  {row.subject}
                </span>
              </div>
            ))}
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Caught up · 11:42
            </p>
          </div>
        </div>
        <HighlightList highlights={mode.highlights} />
      </div>
    </section>
  );
}

/* Terminal - monospace overlay. Stone-900 background; only dark band. */
function TerminalMode({ mode }: { mode: Mode }) {
  return (
    <section className="border-t border-slate-200 bg-stone-900 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-kuju-light">
          terminal mode · for the keyboard
        </p>
        <h2 className="mb-6 font-mono text-4xl font-normal leading-tight tracking-tight text-kuju-light md:text-5xl">
          {mode.tagline}
        </h2>
        <p className="mb-8 font-mono text-sm italic leading-relaxed text-stone-400">
          {mode.audience}
        </p>
        <p className="whitespace-pre-line font-mono text-sm leading-[1.7] text-stone-300">
          {mode.body}
        </p>
        <pre className="mt-8 overflow-x-auto rounded-md border border-stone-700 bg-stone-950 p-4 font-mono text-xs leading-[1.6] text-stone-300">
          {`:open inbox
:filter from:operations status:unread
   12  ops@kuju.email      Quarterly metrics
    7  alerts@kuju.email   RuleHighDeliveryQueue
    3  signups@kuju.email  Trial activation
:reply 1     -- opens compose buffer
:save        -- draft saved`}
        </pre>
        <ul className="mt-8 space-y-2 font-mono text-sm text-stone-400">
          {mode.highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span className="text-kuju-light">›</span>
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const MODE_RENDERERS: Record<
  string,
  (props: { mode: Mode }) => React.ReactNode
> = {
  standard: StandardMode,
  magazine: MagazineMode,
  timeline: TimelineMode,
  terminal: TerminalMode,
};

/**
 * Four full-bleed typography-led sections (one per mode).
 *
 * Each mode-id maps to its own renderer (no shared template) so type, layout,
 * and rhythm can differ radically while reusing Pass 1's Spectral + Public
 * Sans pairing. Modes outside the four known ids render nothing - guards
 * against a yaml typo silently breaking the page.
 */
export function ModesShowcase({ modes }: { modes: Mode[] }) {
  return (
    <>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-light leading-tight tracking-tight text-foreground md:text-5xl">
            The mode follows the moment.
          </h2>
          <p className="text-lg italic leading-relaxed text-slate-500">
            Four worlds. The same inbox. Pick the one that fits, or move between
            them as the work changes.
          </p>
        </div>
      </section>
      {modes.map((mode) => {
        const Renderer = MODE_RENDERERS[mode.id];
        if (!Renderer) return null;
        return <Renderer key={mode.id} mode={mode} />;
      })}
    </>
  );
}
