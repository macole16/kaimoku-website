# PR-A — Text-only Marketing Catch-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring kaimoku-website's `/kuju-email` and `/` marketing copy into truth with current kuju-mail capabilities, replacing the stale "three conversation designs" framing with the canonical four-mode showcase, and establish a YAML-driven modes catalog + ongoing-sync runbook so future capability changes can be made with minimal context cost.

**Architecture:** Three new files form a data-driven slice mirroring the existing `api-docs.ts` + `components/docs/` pattern: `src/data/modes.yaml` holds the 4 modes as structured data, `src/lib/modes.ts` is the typed loader (synchronous file read, server-side), `src/components/marketing/ModesShowcase.tsx` is the renderer. The product page wires the showcase between hero and "What Sets Us Apart"; the homepage gets a small feature-list refresh; a 30-line runbook documents the steady-state sync process.

**Tech Stack:** Next.js 16 (App Router, server components), React 19, TypeScript (strict), Tailwind v4, `yaml` v2 for parsing. No test framework — verification is `npm run lint` + `npm run build` + dev-server spot check.

**Spec:** `kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md` (Section 4 — PR-A)

**Inputs from Stage 1:**

- Capability list confirmed UI-shipped: see `docs/superpowers/working/2026-05-05-stage1-summary.md`
- No marketing gating required — every claim about a real feature is safe to ship.

---

## Files touched

| Action | Path                                         | Purpose                                                         |
| ------ | -------------------------------------------- | --------------------------------------------------------------- |
| NEW    | `src/data/modes.yaml`                        | The 4 UI modes as structured data                               |
| NEW    | `src/lib/modes.ts`                           | Typed loader (mirrors `src/lib/api-docs.ts`)                    |
| NEW    | `src/components/marketing/ModesShowcase.tsx` | Renderer component                                              |
| EDIT   | `src/app/kuju-email/page.tsx`                | Wire showcase, retire "Thread Views" item, refresh stale claims |
| EDIT   | `src/app/page.tsx`                           | Refresh feature checklist with mode framing                     |
| NEW    | `docs/marketing-sync.md`                     | 30-line runbook for ongoing catalog updates                     |

---

## Task 1: Create the modes data file

**Files:**

- Create: `/Users/macole/github/kaimoku-website/src/data/modes.yaml`

- [ ] **Step 1: Verify the data directory state**

Run:

```
ls /Users/macole/github/kaimoku-website/src/data/ 2>&1
```

Expected: existing files include `api-categories.yaml`, `api-overlay.yaml`, `openapi.yaml` (the api-docs precedent). The directory exists; new file goes in here.

- [ ] **Step 2: Write `modes.yaml` with the 4 modes**

Create `/Users/macole/github/kaimoku-website/src/data/modes.yaml` with exactly this content:

```yaml
# Source of truth for the four kuju-mail UI modes shown on /kuju-email.
# Schema: { id, name, tagline, audience, body, highlights[], shipped_in }.
# When a mode evolves, edit this file — the renderer picks it up at next build.
# See docs/marketing-sync.md for the runbook.

- id: standard
  name: Standard
  tagline: The default workhorse.
  audience: Triage, reply, file. The mode you live in.
  body: |
    Smart Inbox lanes group messages by intent — Pinned, Waiting, CC'd,
    Other. AI Reply drafts contextual responses you can edit and send.
    MessageAnalysis extracts key points, decisions, and action items.
    Activity Feed tracks what changed across your inbox.
  highlights:
    - Smart Inbox with intent-classified lanes
    - AI Reply (drafting assistant)
    - MessageAnalysis — key points, decisions, action items
    - Activity Feed
  shipped_in: "0.12-beta"

- id: magazine
  name: Magazine
  tagline: An editorial reading room.
  audience: Newsletters and long-form correspondence.
  body: |
    Sender-grouped layout. Each newsletter's most-recent issue gets a
    featured headline and lede; older issues collapse into a quiet entries
    list. A full-replacement reading lane opens in place — j/k to move
    within a sender, J/K across senders, Esc to return.
  highlights:
    - Featured + entries layout per sender
    - Full-replacement reading lane
    - Keyboard navigation (j/k, J/K, Esc)
  shipped_in: "0.13-beta"

- id: timeline
  name: Timeline
  tagline: Scan and glance.
  audience: When you want to see what's there, not act on it.
  body: |
    Dense single-line rows: time, sender, subject. Per-day grouping ends
    at a quiet "Caught up" line. Hover a row to lazy-fetch a subject
    preview. Smart routing sends newsletter taps to Magazine; everything
    else opens in Standard.
  highlights:
    - Briefing-strip layout
    - Per-day grouping with caught-up termination
    - Smart routing across modes
  shipped_in: "0.13-beta"

- id: terminal
  name: Terminal
  tagline: For the keyboard.
  audience: Power users. No pointer required.
  body: |
    A keyboard-driven interface inspired by Mutt and Pine. Vim-style
    keybindings, command palette, structured monospace output, and
    configurable color schemes. A full inbox without ever touching the
    mouse.
  highlights:
    - Vim-style keybindings
    - Command palette
    - Configurable color schemes
  shipped_in: "0.12-beta"
```

- [ ] **Step 3: Verify YAML parses**

Run:

```
cd /Users/macole/github/kaimoku-website && node -e "console.log(require('yaml').parse(require('fs').readFileSync('src/data/modes.yaml','utf-8')).length)"
```

Expected: `4` (four modes parsed).

If a parse error appears, fix indentation/quoting and re-run.

---

## Task 2: Create the typed loader

**Files:**

- Create: `/Users/macole/github/kaimoku-website/src/lib/modes.ts`

The loader mirrors `src/lib/api-docs.ts` literally — same `fs.readFileSync` + `yaml.parse` pattern, same `path.join(process.cwd(), "src", "data", ...)` shape. Server-side only.

- [ ] **Step 1: Write the loader**

Create `/Users/macole/github/kaimoku-website/src/lib/modes.ts` with exactly this content:

```typescript
import fs from "fs";
import path from "path";
import yaml from "yaml";

/** A single kuju-mail UI mode. */
export interface Mode {
  id: string;
  name: string;
  tagline: string;
  audience: string;
  body: string;
  highlights: string[];
  shipped_in: string;
}

/**
 * Load the 4 kuju-mail UI modes from src/data/modes.yaml.
 *
 * Synchronous file read — safe for Next.js server components where this
 * executes at build / SSR time. Mirrors the loadApiDocs() pattern in
 * src/lib/api-docs.ts.
 */
export function loadModes(): Mode[] {
  const filePath = path.join(process.cwd(), "src", "data", "modes.yaml");
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(raw) as Mode[];
}
```

- [ ] **Step 2: Lint the file**

Run:

```
cd /Users/macole/github/kaimoku-website && npx eslint src/lib/modes.ts
```

Expected: no output (clean).

If errors appear: fix and re-run.

- [ ] **Step 3: TypeScript check**

Run:

```
cd /Users/macole/github/kaimoku-website && npx tsc --noEmit
```

Expected: no output (clean). This compiles the entire project; an unrelated pre-existing error would also surface here. Don't fix unrelated errors — only worry about ones in `src/lib/modes.ts`.

---

## Task 3: Create the renderer component

**Files:**

- Create: `/Users/macole/github/kaimoku-website/src/components/marketing/ModesShowcase.tsx`

The component uses the same visual vocabulary as the existing card grids on `/kuju-email` (rounded border, white bg, shadow-sm, slate text colors, kuju accent). 2-column grid because there are exactly 4 modes — 2x2 reads cleaner than 3 or 4 columns for that count.

- [ ] **Step 1: Verify the marketing components dir doesn't already exist**

Run:

```
ls /Users/macole/github/kaimoku-website/src/components/ 2>&1
```

Expected: `Footer.tsx`, `Header.tsx`, `docs/`. No `marketing/` yet — we'll create it.

- [ ] **Step 2: Create the directory and write the component**

Run:

```
mkdir -p /Users/macole/github/kaimoku-website/src/components/marketing
```

Then create `/Users/macole/github/kaimoku-website/src/components/marketing/ModesShowcase.tsx` with exactly this content:

```typescript
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
```

- [ ] **Step 3: Lint and type-check**

Run:

```
cd /Users/macole/github/kaimoku-website && npx eslint src/components/marketing/ModesShowcase.tsx && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 4: Commit the new data slice**

```
cd /Users/macole/github/kaimoku-website
git add src/data/modes.yaml src/lib/modes.ts src/components/marketing/ModesShowcase.tsx
git commit -m "$(cat <<'EOF'
Add modes.yaml + loader + ModesShowcase renderer

Data-driven slice for the four kuju-mail UI modes (Standard, Magazine,
Timeline, Terminal). Mirrors the existing api-docs.ts pattern: YAML in
src/data/, typed loader in src/lib/, renderer in src/components/marketing/.

Not yet wired into any page — that ships in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Wire the showcase into the product page + refresh stale claims

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx`

Three concrete changes:

1. **Import the loader and renderer at the top of the file.**
2. **Refresh stale items in the `features` array:**
   - **`features[0].items[3]`** ("Thread Views" / "Three selectable conversation designs"): DELETE entirely. Modes get their own section now.
   - **`features[0].items[1]`** ("Modern Webmail" desc): refresh blurb to mention the four modes.
3. **Drop "Terminal Mode" from `standoutFeatures`** (now part of the modes section; redundant to feature it twice).
4. **Render `<ModesShowcase modes={modes} />`** as a new section between hero and "What Sets Us Apart".
5. **Make the page component async-ready** (it's a server component; `loadModes()` is sync but called in the function body).

- [ ] **Step 1: Read current file end-to-end**

Run:

```
wc -l /Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx
```

Expected: ~396 lines.

Read the file via the Read tool — you'll be making surgical edits and need to know exact text for the Edit tool's `old_string`.

- [ ] **Step 2: Add imports**

Edit the import block at the top of the file. Replace:

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
```

with:

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";
import { loadModes } from "@/lib/modes";
import { ModesShowcase } from "@/components/marketing/ModesShowcase";
```

- [ ] **Step 3: Refresh the "Modern Webmail" item**

In the `features` array, find the "Modern Webmail" item. Replace:

```typescript
      {
        title: "Modern Webmail",
        desc: "Full-featured browser-based client with compose, reply, forward, drag-and-drop attachments and message movement, folder management, auto-save drafts, forward-as-attachment (.eml), and browser push notifications.",
      },
```

with:

```typescript
      {
        title: "Modern Webmail",
        desc: "Full-featured browser-based client with four selectable UI modes — Standard, Magazine, Timeline, and Terminal. Compose, reply, forward, drag-and-drop attachments, folder management, auto-save drafts, forward-as-attachment (.eml), and browser push notifications.",
      },
```

- [ ] **Step 4: Delete the "Thread Views" item**

In the `features` array, find and DELETE this entire object (including the comma — it's the 4th item in `features[0].items`):

```typescript
      {
        title: "Thread Views",
        desc: "Three selectable conversation designs: Command-Centric (summary + actions), Document-Centric (structured AI sections with key points, decisions, and action items), or Timeline + Context Stream.",
      },
```

The "Email Access" category will now have 5 items instead of 6 — that's fine.

- [ ] **Step 5: Drop "Terminal Mode" from standoutFeatures**

In the `standoutFeatures` array, find and DELETE this entire object (the first item in the array):

```typescript
  {
    title: "Terminal Mode",
    desc: "A keyboard-driven interface inspired by Mutt and Pine. Monospace layout, vim-style keybindings, command prompt, and customizable color schemes. For people who think email clients peaked in 1995.",
  },
```

The standoutFeatures array goes from 9 to 8 items.

- [ ] **Step 6: Wire the showcase into the page**

Find the page component:

```typescript
export default function KujuEmailPage() {
  return (
    <>
      {/* Hero */}
```

Replace with:

```typescript
export default function KujuEmailPage() {
  const modes = loadModes();
  return (
    <>
      {/* Hero */}
```

Then find the closing `</section>` of the Hero section and the start of the "What Sets Us Apart" section. The current code is:

```tsx
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="px-6 py-20 md:py-28">
```

Insert a `<ModesShowcase>` between them. Replace with:

```tsx
        </div>
      </section>

      {/* Four Modes */}
      <ModesShowcase modes={modes} />

      {/* What Sets Us Apart */}
      <section className="px-6 py-20 md:py-28">
```

- [ ] **Step 7: Lint, type-check, build**

Run all three:

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/kuju-email/page.tsx && npx tsc --noEmit && npm run build
```

Expected:

- ESLint: clean
- tsc: clean
- `npm run build`: succeeds, prints route summary including `/kuju-email`

If build fails on a different page (unrelated), fix only what's needed for /kuju-email and report unrelated failures.

- [ ] **Step 8: Visual spot-check**

Run dev server in background:

```
cd /Users/macole/github/kaimoku-website && npm run dev
```

Open http://localhost:3000/kuju-email and confirm:

- Hero section unchanged.
- New "The Mode Follows the Moment" section appears with 4 cards (Standard, Magazine, Timeline, Terminal).
- "What Sets Us Apart" section appears below modes; Terminal Mode card is gone, 8 cards remain.
- "Complete Feature Set" section: "Email Access" group has 5 items (no Thread Views); "Modern Webmail" mentions four modes.

Stop the dev server when done.

- [ ] **Step 9: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/kuju-email/page.tsx
git commit -m "$(cat <<'EOF'
Wire ModesShowcase into /kuju-email; retire stale Thread Views claim

Replaces the stale "Three selectable conversation designs" framing with
the canonical four-mode (Standard, Magazine, Timeline, Terminal) showcase
rendered from modes.yaml. "Modern Webmail" blurb now names the four modes;
Terminal Mode dropped from standoutFeatures (now part of the showcase).

Per spec docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Refresh homepage feature blurbs

**Files:**

- Modify: `/Users/macole/github/kaimoku-website/src/app/page.tsx`

The homepage has a 12-item feature checklist (lines 113-124) inside the "What We Build" section. Most items are current. The single replacement: swap "Terminal Mode" for "Standard, Magazine, Timeline + Terminal modes" so the homepage reflects the four-mode framing.

- [ ] **Step 1: Read current file**

Read `/Users/macole/github/kaimoku-website/src/app/page.tsx` so you know the exact text.

- [ ] **Step 2: Update the feature checklist**

Find this block in the homepage:

```typescript
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[
                  "Full IMAP & Webmail",
                  "Calendar & Contacts",
                  "Connect Gmail & Outlook",
                  "AI Reply & Compose",
                  "AI Threat Detection",
                  "Workspaces",
                  "Terminal Mode",
                  "Natural Language Search",
                  "Contact Intelligence",
                  "Smart Inbox & Tasks",
                  "Vacation Responder",
                  "14-Day Free Trial",
                ].map((feature) => (
```

Replace `"Terminal Mode"` with `"Standard, Magazine, Timeline + Terminal modes"`.

The full updated block:

```typescript
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[
                  "Full IMAP & Webmail",
                  "Calendar & Contacts",
                  "Connect Gmail & Outlook",
                  "AI Reply & Compose",
                  "AI Threat Detection",
                  "Workspaces",
                  "Standard, Magazine, Timeline + Terminal modes",
                  "Natural Language Search",
                  "Contact Intelligence",
                  "Smart Inbox & Tasks",
                  "Vacation Responder",
                  "14-Day Free Trial",
                ].map((feature) => (
```

- [ ] **Step 3: Lint, type-check, build**

```
cd /Users/macole/github/kaimoku-website && npx eslint src/app/page.tsx && npx tsc --noEmit && npm run build
```

Expected: all clean; build succeeds.

- [ ] **Step 4: Visual spot-check**

```
cd /Users/macole/github/kaimoku-website && npm run dev
```

Open http://localhost:3000/ and confirm: the "What We Build" section's checklist shows "Standard, Magazine, Timeline + Terminal modes" in row 7 (3-column grid; row 7 lands in the third column of the third row at sm/md+, or wherever the grid flow places it). Stop the dev server.

- [ ] **Step 5: Commit**

```
cd /Users/macole/github/kaimoku-website
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
Homepage: name all four UI modes in feature checklist

Replace "Terminal Mode" with "Standard, Magazine, Timeline + Terminal modes"
so the homepage reflects the four-mode framing. Other 11 items unchanged.

Per spec docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add the marketing-sync runbook

**Files:**

- Create: `/Users/macole/github/kaimoku-website/docs/marketing-sync.md`

This runbook documents the steady-state shape — how to keep the marketing site in sync as kuju-mail capabilities evolve. It references `capabilities.yaml`, which doesn't ship until PR-B; that's intentional per the spec ("the runbook ships in PR-A even though `capabilities.yaml` doesn't land until PR-B — it documents the steady-state shape").

- [ ] **Step 1: Verify the docs directory**

```
ls /Users/macole/github/kaimoku-website/docs/ 2>&1
```

Expected: `superpowers/` and possibly other docs. The runbook is a top-level file in `docs/`.

- [ ] **Step 2: Write the runbook**

Create `/Users/macole/github/kaimoku-website/docs/marketing-sync.md` with exactly this content:

```markdown
# Marketing sync

When kuju-mail capabilities change, sync the marketing site. The marketing
copy on `/kuju-email` and `/` is partially data-driven (the four modes via
`src/data/modes.yaml`) and partially inline (other feature blurbs). This
runbook covers both.

## Trigger 1 — A mode evolves (Standard, Magazine, Timeline, Terminal)

1. Edit the relevant entry in `src/data/modes.yaml`. Update `body`,
   `highlights`, or `shipped_in` as needed. Don't add new modes here unless
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
   - `id`, `title`, `blurb`, `api_status: shipped`, `ui_status: shipped`,
     `shipped_in: <version>`, `marketing_status: live`.
2. `npm run build` to confirm.
3. Commit, PR, merge.

## Trigger 3 — API shipped, UI deferred (gating)

PR-A's audit found zero gating risks. If a future capability ships
API-first:

1. File a bd issue: `[ui-parity] <gap title>`, parent under the
   `[ui-parity]` epic (create the epic if it doesn't exist yet).
2. After PR-B: add the capability to `capabilities.yaml` with
   `marketing_status: gated`. The renderer skips gated entries.
3. The marketing site is unchanged from a user's view; the entry sits
   inert until the bd issue closes.

## Trigger 4 — A `[ui-parity]` bd issue closes (UI just shipped)

After PR-B:

1. Find the capabilities.yaml entry by `bd_issue` id.
2. Flip `marketing_status: gated → live`; set `shipped_in: <version>`.
3. Close the bd issue.
4. Commit, PR, merge.

## Where things live

- `src/data/modes.yaml` — the four UI modes (Standard / Magazine /
  Timeline / Terminal)
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
```

- [ ] **Step 3: Commit**

```
cd /Users/macole/github/kaimoku-website
git add docs/marketing-sync.md
git commit -m "$(cat <<'EOF'
Add docs/marketing-sync.md runbook

Documents the steady-state sync process: when a mode evolves, when a new
feature ships, when API ships ahead of UI (gating), and when a [ui-parity]
bd issue closes. References capabilities.yaml (lands in PR-B); modes.yaml
already shipped in this PR.

Per spec docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

```
cd /Users/macole/github/kaimoku-website && npm run build
```

Expected: build succeeds; route summary shows both `/` and `/kuju-email` rendered.

- [ ] **Step 2: Final lint pass over all touched files**

```
cd /Users/macole/github/kaimoku-website && npx eslint \
  src/data/modes.yaml \
  src/lib/modes.ts \
  src/components/marketing/ModesShowcase.tsx \
  src/app/kuju-email/page.tsx \
  src/app/page.tsx
```

Expected: clean. Note: ESLint may not lint .yaml files directly — that's fine, the parse check in Task 1 step 3 covered that file.

- [ ] **Step 3: Visual end-to-end spot check**

```
cd /Users/macole/github/kaimoku-website && npm run dev
```

Walk both pages:

- `/` — feature checklist row 7 reads "Standard, Magazine, Timeline + Terminal modes"
- `/kuju-email` — modes section appears below hero with 4 cards; "Modern Webmail" feature card mentions four modes; no "Thread Views" item; no "Terminal Mode" in standoutFeatures
- Visual style of the modes cards matches the rest of the page (no jarring color/spacing differences)

Stop the dev server.

- [ ] **Step 4: Verify clean tree**

```
cd /Users/macole/github/kaimoku-website && git status
```

Expected: `nothing to commit, working tree clean`. Branch ahead of origin by 4 commits (Task 3 + 4 + 5 + 6 commits).

---

## Task 8: Push (USER GATE)

**Files:** none

- [ ] **Step 1: Pause for push decision**

Stop. Tell the user:

> "PR-A complete locally.
>
> - 4 commits on `main`:
>   - Modes data slice (yaml + loader + renderer)
>   - /kuju-email wired to ModesShowcase + stale claims retired
>   - Homepage feature checklist updated
>   - docs/marketing-sync.md runbook
> - kaimoku-website is ahead of origin/main by 4 commits
> - Build clean, lint clean, dev-server visual check passed
>
> Want me to `git push` now? Per the spec, after this lands, Stage 3 is `/impeccable critique` against the merged surface, which kicks off PR-B."

Wait for explicit "push" or "hold" before proceeding.

- [ ] **Step 2: Push (only if user said push)**

```
cd /Users/macole/github/kaimoku-website && git pull --rebase && git push && git status
```

Expected: rebase clean (or no rebase needed), push succeeds, `git status` shows "up to date with origin/main".

If push fails (rejected, conflict): stop, report the failure, do not force-push.

---

## Self-review notes

**Spec coverage (Section 4 of the spec):**

- "NEW src/data/modes.yaml" → Task 1
- "NEW src/lib/modes.ts mirrors src/lib/api-docs.ts" → Task 2
- "NEW src/components/marketing/ModesShowcase.tsx" → Task 3
- "EDIT src/app/kuju-email/page.tsx — replace Three Designs section, refresh stale claims" → Task 4 (steps 3-6)
- "EDIT src/app/page.tsx — refresh homepage feature blurbs" → Task 5
- "NEW docs/marketing-sync.md — 30-line runbook" → Task 6
- "Verification: npm run build clean, dev-server spot check" → Task 7
- "Cross-reference capability claims against Stage 1 inventory" → handled implicitly: zero gaps means all current claims are safe to keep; only "Thread Views" was a stale framing (not a gating issue) and gets retired in Task 4 step 4.
- "Tone consistency: four mode taglines feel of-a-piece" → modes.yaml content in Task 1 was tightened during planning to match site voice (declarative, professional, ~30-50 words per body).

**Out-of-scope per spec, confirmed not touched:**

- Visual treatment / Sumi Green tokens / typography (PR-B)
- Screenshots (PR-B)
- New IA / hero rewrite / page restructure (PR-B)
- `/kuju-email/guide` (1177 lines; PR-B audit territory)
- `/kuju-email/pricing` (recently rewritten; out of scope)
- The `capabilities.yaml` catalog (PR-B); the runbook references it as future-tense.

**Type consistency:** `Mode` interface defined in Task 2; consumed in Task 3 (`ModesShowcase` props) and Task 4 (`loadModes()` call site); name and shape consistent.

**Placeholder scan:** every code block contains complete file content or complete diff blocks. Commands have expected outputs. No "TBD" / "TODO" / "Similar to Task N" patterns.

**Why subagent-driven works here despite earlier concern:** Stage 1 was bd CLI sequences (mechanical) — subagent overhead didn't pay off. PR-A is real TypeScript/JSX edits where fresh-context subagents shine: each task touches a focused file, has clear acceptance, and benefits from spec-compliance review. Task 4 specifically (multiple surgical edits to a 396-line file) is the kind of work where subagent isolation reduces error rate.

**User gates:** one (Task 8 step 1, push decision). Spec compliance + code quality reviews handled per-task by the subagent-driven runner.
