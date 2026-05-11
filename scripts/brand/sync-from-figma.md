# Sync workflow: Figma → spec.mjs

When the user asks **"sync brand spec from Figma"**, follow these steps exactly.

## 1. Verify Figma MCP is available

Call `mcp__plugin_figma_figma__whoami`. If it fails, tell the user to set up
Figma MCP first and stop.

## 2. Pull the latest App.tsx

```
mcp__plugin_figma_figma__get_design_context
  fileKey: "DcxgH5TovNJbvWC7penAxp"
  nodeId: ""
```

This returns resource links. Read `src/app/App.tsx` via
`ReadMcpResourceTool` with `server="plugin:figma:figma"` and the
`file://figma/make/source/DcxgH5TovNJbvWC7penAxp/src/app/App.tsx` URI.

## 3. Extract spec constants from App.tsx

Look for these patterns:

| App.tsx pattern                                    | spec.mjs field                  |
|----------------------------------------------------|----------------------------------|
| `const INK = "#XXXXXX"`                            | `SPEC.ink`                       |
| `const ORANGE = "#XXXXXX"`                         | `SPEC.orange`                    |
| `const PAPER = "#XXXXXX"`                          | `SPEC.paper`                     |
| In `Mark()`: `const h = size * <N>`                | `SPEC.mark.viewBoxH / viewBoxW = N` |
| In `Mark()`: `Math.max(2, Math.round(h * <X>))`    | `SPEC.mark.strokeWidth ≈ X * h`  |
| In `FaviconTile` calls: `variant="favicon"` cutoff | `SPEC.faviconVariantBreakpoint`  |
| Header "Spec locked · Round NN"                    | `SPEC.round = NN`                |

Note: `Mark()` uses `Math.max(2, Math.round(h * 0.044))` for the stroke. The
generator uses an integer-aligned `strokeWidth: 4` (which matches `h=100` ×
`0.044 = 4.4 → round → 4`). If `App.tsx` changes the multiplier or
`viewBoxH`, recompute.

## 4. Compare and propose a diff

Read `scripts/brand/spec.mjs`. Present a before/after table to the user
showing only the fields that changed. Do NOT auto-apply.

If `App.tsx` introduces new components or variants the spec doesn't cover
(e.g., a new wordmark face is now hardcoded somewhere), flag this — it likely
needs a new spec field rather than a constant update.

## 5. On user confirmation

1. Update `spec.mjs`.
2. Run `npm run brand:generate`.
3. Show `git diff --stat`.
4. Stage and commit only after the user reviews the generated diff.

Use a commit message in the form:

```
feat(brand): sync spec.mjs to Figma Round NN

Updated from Figma Make file DcxgH5TovNJbvWC7penAxp.
Changes: <one-line summary of changed fields>.
```

## 6. Edge cases

- **Round number unchanged but constants drifted** → flag loudly. Either the
  Figma file changed mid-round (suspicious) or the round number should bump.
- **App.tsx structure changed** → spec.mjs may need new fields. Discuss with
  the user before extending the schema.
- **Multiple wordmark faces in App.tsx** → wordmark face is out of scope for
  the mark-only generator. Note it for a separate plan; don't fail.
