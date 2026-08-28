import { ImageResponse } from "next/og";

export const alt =
  "Kaimoku Technologies. Secure, transparent business email.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f4f1ea";
const INK = "#0E0E0E";
const ORANGE = "#B8421E";
const GREEN = "#23593d";

/**
 * Fetch Spectral as a TTF for Satori.
 *
 * Two things here are counterintuitive and were measured, not assumed:
 *
 *  - The MODERN user agent is the one that yields a TTF. The widespread trick
 *    of sending an archaic UA to avoid woff2 routes to Google's `/l/font`
 *    endpoint, which answers with a proprietary container (first bytes
 *    8e 82 02 00) that Satori rejects as "Unsupported OpenType signature".
 *  - The `text=` subsetting parameter routes to that same `/l/font` endpoint
 *    regardless of UA, so it must be omitted even though subsetting would be
 *    cheaper.
 *
 * The signature check is the load-bearing part. Fetches that SUCCEED but
 * return a non-font are exactly what broke the build here, so validating the
 * magic number is what makes the null-fallback real rather than decorative.
 * Returns null on any doubt: a share card in a fallback face is cosmetic, a
 * broken production build is not.
 */
async function loadSpectral(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Spectral:wght@400",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => (r.ok ? r.text() : ""));
    const url = css.match(/https:\/\/fonts\.gstatic\.com[^)]+/)?.[0];
    if (!url) return null;

    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();

    // TTF (00 01 00 00), Apple "true", or OTF "OTTO". Anything else is not
    // something Satori can parse.
    const m = new DataView(buf).getUint32(0);
    const OK = [0x00010000, 0x74727565, 0x4f54544f];
    return OK.includes(m) ? buf : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const wordmark = "kaimoku";
  const line = "Secure, transparent business email.";
  const font = await loadSpectral();

  // The Mark is a 4:5 frame with a rule at 1/3 (orange) and 2/3 (ink).
  // Composed from divs because Satori's SVG support is partial.
  const markW = 200;
  const markH = markW * 1.25;
  const sw = Math.round(markH * 0.044);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "0 96px",
          background: PAPER,
          fontFamily: font ? "Spectral" : "sans-serif",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: markW,
            height: markH,
            border: `${sw}px solid ${INK}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: markH / 3 - sw * 1.5,
              height: sw,
              background: ORANGE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: (markH / 3) * 2 - sw * 1.5,
              height: sw,
              background: INK,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 128,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {wordmark}
          </div>
          <div
            style={{
              width: 120,
              height: 3,
              background: ORANGE,
              margin: "36px 0 32px",
            }}
          />
          <div style={{ fontSize: 40, color: "#3f4a45", lineHeight: 1.3 }}>
            {line}
          </div>
          <div style={{ fontSize: 28, color: GREEN, marginTop: 28 }}>
            Kuju Email · Coming soon
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Spectral", data: font, weight: 400, style: "normal" }]
        : [],
    },
  );
}
