# kaimoku-website marketing sync — design

**Date:** 2026-05-05
**Status:** Approved (brainstorm), ready for plan
**Target repo:** `kaimoku-website` (primary), shared bd workspace (Stage 1)

---

## Goal

Bring the kaimoku-website marketing surface into truth with current kuju-mail capabilities, and establish a sustainable, low-context-cost process for keeping it in sync as kuju-mail evolves.

Three deliverables, sequenced as a pipeline:

1. A bd-tracked inventory of API capabilities that lack UI surface today (gates marketing claims; informs roadmap).
2. A text-only catch-up PR (PR-A) that ships marketing truth fast.
3. A strategic re-pitch (PR-B) — design language, mode showcase, screenshots — sequenced through `/impeccable critique → shape → craft`.

Plus a steady-state runbook for ongoing capability sync.

---

## Background

The marketing surface has drifted from the product. Recent kaimoku-website commits absorbed Terminal Mode, the trial model, pricing rewrite, Bridge OAuth, and the onboarding wizard — but everything from 2026-04-27 onward (PRODUCT.md / DESIGN.md, Standard mode 25→37/40, Magazine editorial rewrite, Timeline Briefing Strip, the four-mode thesis) is not reflected in marketing copy. The product page still markets "three selectable conversation designs"; the actual product story is "the mode follows the moment" with four modes (Standard, Magazine, Timeline, Terminal) as the centerpiece.

The marketing site itself uses generic Tailwind colors and shows no echo of kuju-mail's Sumi Green / Stone palette / typographic hierarchy. The visual gap is as significant as the copy gap.

Recent work on the docs page (`Extract API endpoint data into structured YAML for docs generation` → `replace hardcoded docs page with data-driven renderer`) established a data-driven precedent. Capability marketing extends the same pattern.

---

## Program shape

```
Stage 0 — Catalog scaffolding (modes.yaml + renderer)   ──┐
                                                           ├── bundled into PR-A
Stage 2 — PR-A: copy catch-up                            ──┘
       ↑
Stage 1 — Gap inventory (precondition; informs PR-A's gating)
       ↓
Stage 3 — /impeccable critique (kickoff for PR-B)
       ↓
Stage 4 — PR-B: strategic re-pitch (multi-pass; capabilities catalog folded in here)
       └─ ongoing maintenance via marketing-sync.md runbook
```

| Stage         | Repo                          | Output                                                                               |
| ------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| 1 — Inventory | shared bd workspace           | bd epic + per-gap children                                                           |
| 0+2 — PR-A    | `kaimoku-website`             | PR with `modes.yaml` + renderer + truth-only copy                                    |
| 3 — Critique  | `kaimoku-website` (read-only) | bd issues filed; heuristic score                                                     |
| 4 — PR-B      | `kaimoku-website`             | multi-pass critique-loop branch; capabilities catalog; visual treatment; screenshots |

**Checkpoints:** stop after Stage 1 (review filed gaps before PR-A starts), after PR-A merges (before kicking off the critique), and after the critique (re-enter `brainstorming → writing-plans` for PR-B's actual design).

---

## Stage 1 — Gap inventory

**Goal:** ship a bd epic + per-gap children answering "what user-facing API capabilities don't have UI surface today?"

**Discovery (3-pass):**

1. **OpenAPI walk.** Read `kuju-mail/docs/openapi.yaml`. Classify each endpoint: customer-facing / admin-only / internal. Drop non-customer-facing.
2. **UI surface walk.** Walk `kuju-mail/frontend/src/components/` (especially `Webmail.js`, `webmail/views/*`, `magazine/*`, `timeline/*`, settings/folders/aliases components). Mark which customer-facing endpoints have UI invocations.
3. **CHANGELOG sweep.** Grep CHANGELOG for explicit "API only / UI deferred / no UI yet / TODO: UI" markers — catches gaps that opt out of openapi.yaml.

A judgment review precedes filing. Some "gaps" are correctly server-only; some are UI-real via non-obvious surfaces (command palette, etc.).

**Granularity (one bd issue = one gap):**

A gap = "API exposes capability X, but no user-reachable UI surface exists to use it."

- ✅ `[ui-parity] Aliases management: API has full CRUD at /api/aliases/*, UI has no settings page` — one issue
- ✅ `[ui-parity] Bulk message export: GET /api/messages/export exists, no UI invocation` — one issue
- ❌ NOT one-per-endpoint: `aliases POST/GET/PATCH/DELETE` lacking UI = one gap (the missing aliases page).
- ❌ NOT internal/admin: `/api/admin/datastores` is intentionally server-only.

**bd shape:**

```
[Epic] github-XXX  UI parity inventory: kuju-mail capabilities not in UI
  ├─ description body holds summary table (refreshed as children close)
  ├─ child github-XXX  [ui-parity] Aliases management page
  ├─ child github-XXX  [ui-parity] Bulk message export
  └─ child github-XXX  [ui-parity] <gap N>
```

- Title prefix `[ui-parity]` for filtering with `bd search ui-parity`.
- Each child carries: API endpoints, what a UI surface would do, marketing impact ("can we mention this in PR-A? — No, gate until UI lands").
- Parent epic body has a markdown table: gap | endpoints | marketing status | priority. At-a-glance reference for PR-A.

**Workspace:** `/Users/macole/github/.beads/`. Existing `github-XXX` ID pattern.

**Estimated size:** 8-15 child issues. If it balloons past 25, pause and ask whether to defer some to `priority=4` (backlog).

**Out of scope:** admin/operations endpoints, internal infrastructure endpoints, capabilities with both API+UI today, pure-frontend features.

**Output:** epic + N children filed; short summary report ("Filed N gaps. Flagged M as marketing risks. Recommend gating these in PR-A.").

---

## Stage 2 — PR-A: text-only catch-up

**Scope:** product page (`/kuju-email`) + homepage (`/`) feature blurbs. Text-only — no visual treatment, no screenshots, no IA changes.

**Files touched:**

| Action | Path                                         | Notes                                                  |
| ------ | -------------------------------------------- | ------------------------------------------------------ |
| NEW    | `src/data/modes.yaml`                        | The 4 modes, structured                                |
| NEW    | `src/lib/modes.ts`                           | Loader (mirrors `src/lib/api-docs.ts`)                 |
| NEW    | `src/components/marketing/ModesShowcase.tsx` | Renderer                                               |
| EDIT   | `src/app/kuju-email/page.tsx`                | Replace "three designs" section + refresh stale claims |
| EDIT   | `src/app/page.tsx`                           | Refresh homepage feature blurbs                        |
| NEW    | `docs/marketing-sync.md`                     | The 30-line runbook                                    |

**`modes.yaml` schema:**

```yaml
- id: standard
  name: Standard
  tagline: An inbox you read.
  audience: The default. Triage, reply, file.
  body: |
    Smart Inbox lanes group by intent (personal / newsletter / transactional / ...).
    Activity Feed surfaces what changed. AI Reply drafts replies tuned to the
    conversation. MessageAnalysis extracts key points, decisions, and action items.
  highlights:
    - Smart Inbox with intent classification
    - Activity Feed
    - AI Reply
    - MessageAnalysis
  shipped_in: "0.12-beta"

- id: magazine
  name: Magazine
  tagline: An editorial reading room.
  audience: For the day's newsletters and long-form correspondence.
  body: |
    Sender-grouped: each newsletter's most-recent issue gets a featured headline
    and lede; older issues collapse into a quiet list. Full-replacement reading
    lane — j/k within a sender, J/K across senders, Esc back to the list.
  highlights:
    - Featured + entries layout
    - Cross-fade reading lane
    - Keyboard-first navigation
  shipped_in: "0.13-beta"

- id: timeline
  name: Timeline (Briefing Strip)
  tagline: Scan and glance.
  audience: When you want to see what's there, not act on it.
  body: |
    Dense single-line rows, three-column grid (time / sender / subject), 32px
    row height, no card chrome. Per-day grouping; finite-by-default — ends at
    a quiet "Caught up" line. Hover lazy-fetches a subject preview; smart-route
    sends newsletter taps to Magazine.
  highlights:
    - Briefing Strip layout
    - Per-day grouping
    - Smart routing
    - Caught-up termination
  shipped_in: "0.13-beta"

- id: terminal
  name: Terminal
  tagline: For the keyboard.
  audience: Power use, command-driven.
  body: |
    Command-palette-first, keyboard-only navigation, structured output, no
    pointer required.
  highlights:
    - Command palette
    - Keyboard-first
    - Structured output
  shipped_in: "0.12-beta"
```

Final copy will be tightened during PR-A; this is the schema-and-substance shape.

**Other inline edits to `/kuju-email`:**

- The current "Three selectable conversation designs" section becomes `<ModesShowcase modes={modes} />`.
- "Modern Webmail" section: refresh blurb to mention the four modes by name.
- Add Smart Inbox / Activity Feed / AI Reply / MessageAnalysis to the feature grid (only if Stage 1 confirms each is UI-shipped, not gated).
- Sweep for any other claim contradicted by the inventory.

**Inline edits to `/` (homepage):**

- Hero feature blurbs that mirror the product page — bring them in line.
- No hero/H1 rewrite — that's PR-B territory.

**Verification before merging PR-A:**

- `npm run build` clean.
- Spot-check rendered modes section in `npm run dev`.
- Cross-reference every capability claim on `/kuju-email` and `/` against the Stage 1 inventory: anything `marketing_status != live` must be gated/removed.
- Tone consistency: the four mode taglines feel of-a-piece.

**Explicitly OUT of scope for PR-A:**

- Visual treatment, Sumi Green tokens, typography (PR-B)
- Screenshots (PR-B)
- New IA / hero rewrite / page restructure (PR-B)
- Guide page (`/kuju-email/guide`) or pricing (`/kuju-email/pricing`)
- The capabilities.yaml catalog (folded into PR-B)
- Anything kuju-mail-side

**Estimated size:** ~6 files, ~200-350 lines added/changed (most is YAML content + the renderer component). Single PR, single review pass.

---

## Stage 3 — `/impeccable critique`

**Trigger:** PR-A merged, deployed, surface stabilized.

**Target surface:** `/` and `/kuju-email` (same scope as PR-A).

**What runs:** standard `/impeccable critique` — Nielsen 10 × 4 heuristic score, cognitive-load failures, named-rule scan, deterministic + judgment findings, P0-P3 classification.

**Output:**

- Heuristic score (no prior baseline; first measurement).
- N issues filed in bd with `[ui-marketing]` prefix to distinguish from `[ui-parity]` inventory issues.
- Short report: "Site scored X/40. Filed N issues — M P0, K P1, ..."

**No code changes from this stage.** Read + measure + file.

---

## Stage 4 — PR-B (sketch only)

**This stage is sketched, not designed.** The actual brief comes from `/impeccable shape` after the critique. What follows is structural framing only.

**Shape:** branch off main (`marketing-redesign` or similar), critique-loop posture (multi-pass on one branch like kuju-mail's `critique-postmerge`). Each pass = 1 PR or 1 commit-stack.

**Likely scope (subject to revision):**

- Visual language: bring Sumi Green / Stone / typographic hierarchy from `kuju-mail/DESIGN.md` to the marketing site.
- Mode showcase: centerpiece — each mode gets visual treatment, real screenshots, distinct typographic personality.
- Capabilities catalog: extract `capabilities.yaml`; refactor feature-grid to render from it; link to `[ui-parity]` bd issues for marketing-status gating.
- Headline / hero rewrite around "the mode follows the moment".
- Screenshots: full strategy settled here — capture source (likely demo trial domain with synthetic data; to be confirmed), light/dark parity, mobile.
- Feature blurb sweep across both pages, reading from the capabilities catalog.
- Whatever else the critique surfaces (typography, accessibility, color, micro-interactions, CTAs, IA).

**Estimated time/size:** unknown until critique. Likely 3-6 PRs across 1-2 weeks if treated as a critique loop.

**Re-entry:** before PR-B starts, re-run `brainstorming → writing-plans` on the critique findings.

---

## Ongoing maintenance — `docs/marketing-sync.md`

A short runbook (~30 lines), shipped with PR-A. Three trigger scenarios:

```markdown
# Marketing sync

When kuju-mail capabilities change, sync the marketing site.

## Trigger 1 — New feature shipped (API + UI both live)

1. Add an entry to src/data/capabilities.yaml (or modes.yaml if it's a new mode):
   - id, title, blurb, api_status: shipped, ui_status: shipped,
     shipped_in: <version>, marketing_status: live
2. npm run build to confirm the renderer picks it up.
3. Commit, PR, merge.

## Trigger 2 — API shipped, UI deferred

1. File a bd issue: `[ui-parity] <gap title>`, parent it to the UI parity epic.
2. Add an entry to capabilities.yaml: marketing_status: gated, link bd_issue.
3. The renderer skips it. No marketing surface change visible to users.

## Trigger 3 — A [ui-parity] bd issue closes

1. Find the capabilities.yaml entry by bd_issue id.
2. Flip marketing_status: gated → live; set shipped_in: <version>.
3. Close the bd issue.
4. PR, merge.

## Where things live

- modes.yaml — the four UI modes (Standard / Magazine / Timeline / Terminal)
- capabilities.yaml — feature catalog
- ModesShowcase.tsx, CapabilitiesGrid.tsx — renderers
- /kuju-email and / read from these data files
```

The runbook ships in PR-A even though `capabilities.yaml` doesn't land until PR-B — it documents the steady-state shape.

---

## Risks & open questions

- **Some inventory gaps may turn out to be intentional, not deferred.** Mitigated by the Stage 1 judgment review checkpoint before filing.
- **kuju-mail keeps shipping during PR-B.** capabilities.yaml may need re-sync before merge. Acceptable churn; the YAML structure makes the re-sync cheap.
- **PR-B's expected multi-pass shape means the program ends fuzzy.** That's correct — "PR-B done" is when critique re-runs and the score plateaus, not a fixed deliverable list.
- **Screenshot source domain is unresolved.** Settled inside PR-B. Likely candidates: synthetic data on demo trial domain, anonymized prod data, or a dedicated screenshots-only kuju-mail instance.
- **Marketing site has no design tokens today.** PR-B will need to introduce a token layer — this is non-trivial and may itself be a multi-pass effort. Calling it out so it isn't surprising in PR-B's brief.

---

## Out of scope for the entire program

- `kuju-email/guide` page (1177 lines; setup walkthrough; needs its own audit later)
- `kuju-email/pricing` page (recently rewritten; should not need touching)
- `legal/*` pages (no capability claims)
- Auto-generated `/kuju-email/docs` (already data-driven from openapi.yaml)
- Any change to kuju-mail itself
- Any other repo
