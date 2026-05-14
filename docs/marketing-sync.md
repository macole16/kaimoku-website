# Marketing sync

When kuju-mail capabilities change, sync the marketing site. The marketing
copy on `/kuju-email` and `/` is partially data-driven (the modes via
`src/data/kuju-mail-modes.yaml`) and partially inline (other feature blurbs). This
runbook covers both.

## Trigger 1 — A mode evolves (Standard, Magazine, Timeline, Terminal)

1. Edit the relevant entry in `src/data/kuju-mail-modes.yaml`. Update `body`,
   `highlights`, or `shippedIn` as needed. Don't add new modes here unless
   one ships in kuju-mail.
2. `npm run build` to confirm the renderer picks it up.
3. `npm run dev` and spot-check `/kuju-email` (the modes section).
4. Commit, PR, merge.

## Trigger 2 — A new top-level feature shipped (API + UI both live)

PR-B introduces `src/data/capabilities.yaml` for non-mode capability
catalog entries. Until then, edit the `features` array inline in
`src/app/kuju-email/page.tsx` — find the right category, add an item with
title + desc.

After PR-B:

1. Add an entry to `src/data/capabilities.yaml`:
   - `id`, `title`, `blurb`, `apiStatus: shipped`, `uiStatus: shipped`,
     `shippedIn: <version>`, `marketingStatus: live`.
2. `npm run build` to confirm.
3. Commit, PR, merge.

## Trigger 3 — API shipped, UI deferred (gating)

PR-A's audit found zero gating risks. If a future capability ships
API-first:

1. File a bd issue: `[ui-parity] <gap title>`, parent under the
   `[ui-parity]` epic (create the epic if it doesn't exist yet).
2. After PR-B: add the capability to `capabilities.yaml` with
   `marketingStatus: gated`. The renderer skips gated entries.
3. The marketing site is unchanged from a user's view; the entry sits
   inert until the bd issue closes.

## Trigger 4 — A `[ui-parity]` bd issue closes (UI just shipped)

After PR-B:

1. Find the capabilities.yaml entry by `bd_issue` id.
2. Flip `marketingStatus: gated → live`; set `shippedIn: <version>`.
3. Close the bd issue.
4. Commit, PR, merge.

## Where things live

- `src/data/kuju-mail-modes.yaml` — the kuju-mail UI modes (Standard /
  Magazine / Timeline / Terminal today)
- `src/data/capabilities.yaml` — feature catalog (lands in PR-B)
- `src/lib/modes.ts` — modes loader
- `src/components/marketing/ModesShowcase.tsx` — modes renderer
- `src/app/kuju-email/page.tsx` — product page, wires the showcase + has
  inline feature blurbs (until PR-B extracts them)
- `src/app/page.tsx` — homepage, has a 12-item checklist of marketing
  highlights

## Spec & related plans

- Spec: `docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md`
- PR-A plan: `docs/superpowers/plans/2026-05-05-pr-a-marketing-catchup.md`
- Stage 1 inventory summary:
  `docs/superpowers/working/2026-05-05-stage1-summary.md`
