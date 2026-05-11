// Round 07 brand spec, extracted from Figma Make file App.tsx.
// Figma is source-of-truth at design time; this file is source-of-truth at code time.
// To verify/update against Figma, see scripts/brand/sync-from-figma.md.

export const SPEC = {
  round: 7,
  figmaFileKey: 'DcxgH5TovNJbvWC7penAxp',
  figmaUrl: 'https://www.figma.com/make/DcxgH5TovNJbvWC7penAxp/Design-logo-with-negative-space',
  ink: '#0E0E0E',
  orange: '#B8421E',
  paper: '#F4F1EA',
  mark: {
    // 4:5 frame, equal interior thirds, integer-aligned 4px stroke (≈4% of height).
    viewBoxW: 80,
    viewBoxH: 100,
    strokeWidth: 4,
  },
  // At or below this pixel size, render the favicon variant (drop bottom INK line).
  faviconVariantBreakpoint: 24,
};
