// Kaimoku Round-07 brand mark + wordmark.
// Source spec: Figma Make export, "Spec locked · Round 07".
// Mark: 4:5 frame (#0E0E0E), orange line at 1/3 height (#B8421E), ink line at 2/3
//       (full variant). Favicon variant (≤24px) drops the bottom ink line.
// Wordmark: kai | moku in Cormorant Garamond 400, orange vertical divider.

const INK = "#0E0E0E";
const ORANGE = "#B8421E";

type MarkVariant = "full" | "favicon";

export function Mark({
  size = 100,
  stroke,
  ink = INK,
  orange = ORANGE,
  variant = "full",
}: {
  size?: number;
  stroke?: number;
  ink?: string;
  orange?: string;
  variant?: MarkVariant;
}) {
  const w = size;
  const h = size * 1.25;
  const sw = stroke ?? Math.max(2, Math.round(h * 0.044));
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ display: "block" }}
      aria-hidden
    >
      <rect
        x={sw / 2}
        y={sw / 2}
        width={w - sw}
        height={h - sw}
        stroke={ink}
        strokeWidth={sw}
      />
      <line
        x1={sw}
        y1={h / 3}
        x2={w - sw}
        y2={h / 3}
        stroke={orange}
        strokeWidth={sw}
      />
      {variant === "full" && (
        <line
          x1={sw}
          y1={(h / 3) * 2}
          x2={w - sw}
          y2={(h / 3) * 2}
          stroke={ink}
          strokeWidth={sw}
        />
      )}
    </svg>
  );
}

export function Wordmark({
  fontSize = 96,
  ink = INK,
  orange = ORANGE,
  dividerPx,
}: {
  fontSize?: number;
  ink?: string;
  orange?: string;
  dividerPx?: number;
}) {
  const divider = dividerPx ?? Math.max(2, Math.round((fontSize / 96) * 3));
  return (
    <span
      style={{
        fontFamily: "var(--font-wordmark), 'Cormorant Garamond', serif",
        fontSize,
        fontWeight: 400,
        color: ink,
        letterSpacing: "-0.03em",
        lineHeight: 0.85,
        display: "inline-flex",
        alignItems: "flex-end",
      }}
    >
      <span>kai</span>
      <span
        aria-hidden
        style={{
          width: divider,
          background: orange,
          height: "0.7em",
          marginBottom: "0.18em",
          marginLeft: "0.08em",
          marginRight: "0.08em",
        }}
      />
      <span>moku</span>
    </span>
  );
}

export function Lockup({
  fontSize = 28,
  ink = INK,
  orange = ORANGE,
  ariaLabel = "Kaimoku",
}: {
  fontSize?: number;
  ink?: string;
  orange?: string;
  ariaLabel?: string;
}) {
  const markHeight = fontSize * 0.66;
  const markWidth = markHeight / 1.25;
  const dividerPx =
    fontSize <= 32 ? 2 : Math.max(2, Math.round((fontSize / 96) * 3));
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: Math.max(6, fontSize * 0.36),
      }}
    >
      <span style={{ alignSelf: "flex-end", display: "inline-flex" }}>
        <Mark size={markWidth} ink={ink} orange={orange} />
      </span>
      <Wordmark
        fontSize={fontSize}
        ink={ink}
        orange={orange}
        dividerPx={dividerPx}
      />
    </span>
  );
}
