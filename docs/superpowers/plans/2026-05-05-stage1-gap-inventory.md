# Stage 1 — Gap Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a bd epic + per-gap children documenting which user-facing kuju-mail API capabilities lack UI surface today, plus a summary report that informs PR-A's marketing copy gating.

**Architecture:** Three-pass discovery (OpenAPI walk → frontend UI surface mapping → CHANGELOG sweep) dispatched to an Explore subagent for context efficiency, feeding a judgment-reviewed gap list filed as bd issues with `[ui-parity]` prefix and parented to a top-level epic. Working artifacts saved under `kaimoku-website/docs/superpowers/working/` for audit trail.

**Tech Stack:** bd (beads) for issue tracking, Read/Bash/Agent tools for code walks, git for working-artifact commits.

**Spec:** `kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md`

---

## Task 1: Verify bd command syntax and workspace state

bd is the only durable output of Stage 1, so syntax mistakes are expensive. This task confirms the exact `bd create`, `bd dep add`, and parent/child semantics before filing anything.

**Files:** None (verification only)

- [ ] **Step 1: Confirm we're using the shared bd workspace**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd doctor
```

Expected: workspace healthy, no errors. Note the message about git remote (CLAUDE.md says local-only is correct here).

- [ ] **Step 2: Check bd create flags and supported types**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd create --help 2>&1 | head -40
```

Expected: flag list includes `--title`, `--description`, `--type`, `--priority`. Note exact type values supported (the system reminder lists `task|bug|feature` — confirm and note any others like `epic`).

- [ ] **Step 3: Check bd dep add semantics**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd dep add --help 2>&1 | head -20
```

Expected: usage line clarifies whether `bd dep add A B` means "A depends on B" or "B blocks A". This determines argument order in Task 5.

- [ ] **Step 4: Check bd update for description editing**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd update --help 2>&1 | head -30
```

Expected: confirm `--description` flag is supported (we'll re-write the epic description in Task 6 with the final summary table).

- [ ] **Step 5: Confirm no prior `[ui-parity]` issues exist**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd search ui-parity
```

Expected: "No issues found" or empty result.

If results show prior `[ui-parity]` issues: STOP. Ask the user whether to extend an existing inventory or start fresh. Don't continue without resolution.

---

## Task 2: Dispatch Explore subagent for the 3-pass audit

Hand off the bulk research (reading openapi.yaml, walking the frontend, grepping the CHANGELOG) to an Explore subagent so the primary session doesn't spend its context budget on dozens of file reads.

**Files:**

- Create: `/Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-audit-raw.md`

- [ ] **Step 1: Verify the working directory exists**

Run:

```
ls /Users/macole/github/kaimoku-website/docs/superpowers/ 2>&1
```

Expected: `plans` and `specs` listed. Working dir doesn't exist yet — create it:

```
mkdir -p /Users/macole/github/kaimoku-website/docs/superpowers/working
```

- [ ] **Step 2: Dispatch the Explore subagent**

Use the Agent tool with `subagent_type=Explore` (foreground — we need its output before continuing). Use this prompt verbatim:

```
Audit task: produce a list of kuju-mail API capabilities that lack UI surface in the kuju-mail frontend. Output is a markdown file written directly to disk; do NOT summarize the file content in your return message — just confirm the file was written and report counts.

Inputs to walk:
1. /Users/macole/github/kuju-mail/docs/openapi.yaml — every endpoint
2. /Users/macole/github/kuju-mail/frontend/src/ — every UI component, route, fetch call (look for fetch(), axios, useQuery, useMutation, similar patterns)
3. /Users/macole/github/kuju-mail/CHANGELOG.md — search for markers: "API only", "UI deferred", "no UI yet", "TODO: UI", "deferred to UI", "not yet wired", "pending UI"

Method (3-pass):

Pass 1 — OpenAPI enumeration: parse openapi.yaml into a flat list of (method, path, summary). For each, classify:
- customer-facing: end-users invoke this from a logged-in app context (mail, folders, aliases, settings, search, AI features, etc.)
- admin-only: paths under /api/admin/* or summaries reference operator/SaaS-admin actions
- internal: webhooks, health, metrics, monitoring, deploy hooks, datastore probes
DROP everything not customer-facing.

Pass 2 — UI surface mapping: for each customer-facing endpoint from Pass 1, grep the frontend for invocations. Look for:
- string match on the path (with or without leading /api)
- fetch/axios calls that build the URL
- React Query keys or mutation hooks named after the resource
Mark each endpoint:
- "ui:<file:line>" if you find a real invocation
- "no-ui" if no frontend code touches it
- "ambiguous" if there's a possible match you can't confirm (note why)

Pass 3 — CHANGELOG sweep: grep CHANGELOG.md for the markers above. For each hit, capture: changelog line number + line text + capability name. Cross-reference Pass 2; flag anything CHANGELOG mentions but Pass 2 didn't catch.

Output format — write directly to /Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-audit-raw.md:

# Stage 1 Audit — Raw Findings (2026-05-05)

## Pass 1 — Customer-facing endpoint enumeration
(brief: how many endpoints total in openapi.yaml, how many customer-facing, how many dropped as admin/internal)

## Pass 2 — Endpoints with no UI invocation

| Endpoint(s) | Summary | UI status | Notes |
|---|---|---|---|
| GET/POST /api/aliases | Manage email aliases | no-ui | grep finds zero matches |
| ... | ... | ... | ... |

## Pass 3 — CHANGELOG-flagged deferrals

| CHANGELOG line | Marker phrase | Capability | API present? | UI status from Pass 2 |
|---|---|---|---|---|

## Admin/internal endpoints excluded (sanity check)

(short bullet list — for audit trail)

## Notes / ambiguous cases

(things that could go either way — flag for human judgment review)

Be thorough. The output of this audit is the input to filing bd issues, so completeness matters. Don't summarize broadly — list each gap candidate as its own row.
```

- [ ] **Step 3: Verify the audit artifact was written**

Run:

```
wc -l /Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-audit-raw.md
```

Expected: at least 30 lines.

Read the file. Sanity check: at least one row in "Pass 2 — Endpoints with no UI invocation" table. If zero candidate gaps, something's wrong with the audit — re-dispatch the subagent with sharper instructions.

---

## Task 3: Synthesize candidate gap list

The raw audit is endpoint-grain. The bd inventory is capability-grain (one issue per concept, not per endpoint). This task groups endpoints into capabilities and produces a reviewable list.

**Files:**

- Create: `/Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-candidates.md`

- [ ] **Step 1: Read the raw audit end-to-end**

Read `/Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-audit-raw.md` in full.

- [ ] **Step 2: Group endpoints into capability units**

Apply this rule: endpoints sharing a resource path or function merge into one capability. Examples:

- `POST/GET/PATCH/DELETE /api/aliases/*` → one capability "Aliases management"
- `GET /api/messages/export` standalone → one capability "Bulk message export"
- Split when the UI surface would be different: `/api/folders/create` and `/api/folders/move` belong together (folder management page); `/api/messages/export` and `/api/messages/import` are separate UIs.

Add CHANGELOG-flagged deferrals as candidates if they don't already match a Pass 2 row.

- [ ] **Step 3: Write the candidates file**

Write to `/Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-candidates.md`:

```markdown
# Stage 1 Candidate Gaps (2026-05-05)

Total candidates: N

## C1 — Aliases management

- **API endpoints:** `POST/GET/PATCH/DELETE /api/aliases/*`
- **What a UI surface would do:** A settings page where users list, create, edit, and delete email aliases.
- **Confidence:** high
- **Marketing impact:** Currently mentioned in [pricing tier benefits / product page line N] — must be gated until UI lands.
- **Suggested priority:** P1
- **Source:** Pass 2 row N (and CHANGELOG line N if applicable)

## C2 — Bulk message export

- ...

(continue for all candidates)

## Open questions for judgment review

- C5: ambiguous — `/api/foo` has no UI invocation but its purpose is unclear from the openapi summary. Real gap or internal endpoint mislabeled?
- ...
```

- [ ] **Step 4: Size-check the candidate list**

Count candidates. Spec guard rail: 8-15 expected; >25 means stop.

- If 0-7: smaller than expected — sanity check the audit was thorough, then proceed.
- If 8-25: proceed.
- If 25+: STOP. Ask the user whether to defer some to `priority=4` (backlog) before filing, or split into multiple inventory passes.

- [ ] **Step 5: Pause for judgment review (USER GATE)**

Stop. Print this message to the user:

> "Stage 1 audit produced N candidate gaps. Before filing bd issues, please review `kaimoku-website/docs/superpowers/working/2026-05-05-stage1-candidates.md` and tell me:
>
> - Any candidates that should be DROPPED (intentional admin-only, false positive)?
> - Any candidates that need to MERGE or SPLIT (capability boundary disagreements)?
> - Any priority adjustments?
>
> Once you say go, I'll file the epic + children."

Wait for explicit confirmation. Do not proceed to Task 4 without it.

---

## Task 4: File the parent epic

**Files:** None (creates one bd issue)

- [ ] **Step 1: Create the parent epic**

Replace `<EPIC_TYPE>` with whatever Task 1 step 2 confirmed (`task` if `epic` is unsupported).

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd create \
  --title="UI parity inventory: kuju-mail capabilities not in UI" \
  --type=<EPIC_TYPE> \
  --priority=2 \
  --description="$(cat <<'EOF'
Tracks user-facing API capabilities in kuju-mail that lack UI surface today.
Each child is one capability gap. Used as a marketing-gating reference for
kaimoku-website (anything gated must not be marketed) and a long-term roadmap
input for kuju-mail UI work.

**Source spec:** kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md

## Summary

(filled in by Task 6 once children are filed)

| Gap | Endpoint(s) | Marketing status | Priority | Issue |
|---|---|---|---|---|

EOF
)"
```

Capture the returned issue ID (e.g. `github-XXX`). Save it as `EPIC_ID` for subsequent steps.

- [ ] **Step 2: Verify the epic**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd show <EPIC_ID>
```

Expected: title matches, description body present, type matches, priority=2.

---

## Task 5: File per-gap children with parent dependency

For each candidate `Cn` from the reviewed candidates list, create a child issue and link it to the epic.

**Files:** None (creates N bd issues; N = candidate count after review)

- [ ] **Step 1: For each candidate, create a child issue**

Iterate manually through the candidates list. For each candidate, run:

```
BEADS_DIR=/Users/macole/github/.beads bd create \
  --title="[ui-parity] <Capability name>" \
  --type=feature \
  --priority=<P0-P3 from candidate> \
  --description="$(cat <<'EOF'
## API endpoints
- METHOD /path/here
- METHOD /path/here

## What a UI surface would do
[1-2 sentences from the candidate's "What a UI surface would do" field]

## Marketing impact
[gated | safe to mention as roadmap | already on site, must be removed]

## Source
- openapi.yaml: <endpoint references>
- CHANGELOG line N (if applicable)

## Tracked in spec
kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md
EOF
)"
```

Capture each returned ID into a running list. Save as `CHILD_IDS`.

- [ ] **Step 2: Add the parent dependency for each child**

Argument order depends on Task 1 step 3 finding. Most bd installations use `bd dep add <issue> <depends-on>` meaning "issue depends on depends-on" — for our parent/child relationship that's `bd dep add <child> <epic>` (child depends on epic existing). Verify before running:

For each child id in `CHILD_IDS`:

```
BEADS_DIR=/Users/macole/github/.beads bd dep add <child-id> <EPIC_ID>
```

- [ ] **Step 3: Verify children created and linked**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd search ui-parity
```

Expected: N+1 results (epic + N children).

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd show <EPIC_ID>
```

Expected: dependency list shows children (or "blocked by" / "blocks" depending on bd's vocabulary).

If counts don't match: stop, identify which children failed, retry just those.

---

## Task 6: Update epic with final summary table

**Files:** None (updates the epic's description)

- [ ] **Step 1: Build the summary table**

For each child in `CHILD_IDS`, compose one row:

```
| <Capability name> | <comma-sep endpoints> | <gated|live|remove> | P<n> | <child-id> |
```

- [ ] **Step 2: Update the epic description**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd update <EPIC_ID> --description="$(cat <<'EOF'
Tracks user-facing API capabilities in kuju-mail that lack UI surface today.
Each child is one capability gap. Used as a marketing-gating reference for
kaimoku-website (anything gated must not be marketed) and a long-term roadmap
input for kuju-mail UI work.

**Source spec:** kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md

## Summary

| Gap | Endpoint(s) | Marketing status | Priority | Issue |
|---|---|---|---|---|
| Aliases management | /api/aliases/* | gated | P1 | github-XXX |
| Bulk message export | /api/messages/export | gated | P2 | github-XXX |
| <fill in remaining rows> | ... | ... | ... | ... |

EOF
)"
```

If `bd update --description` is not supported, fall back to whatever flag Task 1 step 4 found (e.g., `--notes`). Document the substitution in the working artifacts.

- [ ] **Step 3: Verify update**

Run:

```
BEADS_DIR=/Users/macole/github/.beads bd show <EPIC_ID>
```

Expected: summary table appears in the description.

---

## Task 7: Write Stage 1 summary report

**Files:**

- Create: `/Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-summary.md`

- [ ] **Step 1: Cross-reference current marketing claims against gated capabilities**

For each child with `marketing status = remove` (the worst case — we're currently marketing something gated):

- Open `/Users/macole/github/kaimoku-website/src/app/kuju-email/page.tsx` and `/Users/macole/github/kaimoku-website/src/app/page.tsx`.
- Grep for the capability name or related terms.
- Note the exact line numbers where the false claim appears.

- [ ] **Step 2: Write the summary**

Write to `/Users/macole/github/kaimoku-website/docs/superpowers/working/2026-05-05-stage1-summary.md`:

```markdown
# Stage 1 Summary — Gap inventory

**Date:** 2026-05-05
**Spec:** kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md
**Epic:** github-XXX

## Filed

- 1 epic: github-XXX (UI parity inventory)
- N children: github-XXX through github-XXX

## Marketing gating recommendations for PR-A

### Must REMOVE from current site (gated capabilities currently marketed)

| Capability        | Current claim location           | Replacement                          |
| ----------------- | -------------------------------- | ------------------------------------ |
| <Capability name> | src/app/kuju-email/page.tsx:LINE | Drop entirely OR rephrase as roadmap |

### Must NOT add to PR-A copy (gated, not yet on site)

- <Capability name> (github-XXX, P1)
- ...

### Safe to add or keep in PR-A copy (UI shipped)

(features confirmed UI-real by audit Pass 2 — not gaps, but enumerated for completeness)

- Smart Inbox with intent classification
- AI Reply
- MessageAnalysis
- Activity Feed
- (etc.)

## Roadmap implications

- P0 gaps (blocking marketing): N
- P1 gaps (notable absence): N
- P2/P3 (backlog): N

## Next step

PR-A planning, informed by the gating recommendations above.
```

- [ ] **Step 3: Verify**

Read the file. Confirm three sections (filed, gating, roadmap implications) are populated.

---

## Task 8: Commit working artifacts

**Files:**

- `kaimoku-website/docs/superpowers/working/2026-05-05-stage1-audit-raw.md`
- `kaimoku-website/docs/superpowers/working/2026-05-05-stage1-candidates.md`
- `kaimoku-website/docs/superpowers/working/2026-05-05-stage1-summary.md`

- [ ] **Step 1: Stage the three working files**

```
cd /Users/macole/github/kaimoku-website
git add docs/superpowers/working/2026-05-05-stage1-audit-raw.md \
        docs/superpowers/working/2026-05-05-stage1-candidates.md \
        docs/superpowers/working/2026-05-05-stage1-summary.md
```

- [ ] **Step 2: Commit**

```
git commit -m "$(cat <<'EOF'
Add Stage 1 gap inventory artifacts (audit, candidates, summary)

Per spec docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md.
Filed N [ui-parity] issues parented to UI parity epic github-XXX. Summary report
identifies M gated capabilities currently marketed on the site that PR-A must
remove or rephrase.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify clean tree**

```
git status
```

Expected: `nothing to commit, working tree clean`. Branch ahead of origin by some number of commits (spec + this commit).

- [ ] **Step 4: Pause for push decision (USER GATE)**

Stop. Tell the user:

> "Stage 1 complete.
>
> - Epic: github-XXX
> - N children filed under `[ui-parity]` prefix
> - Working artifacts committed locally on `main`
> - kaimoku-website is ahead of origin/main by <count> commits
>
> Want me to `git push` now, or hold until PR-A planning produces more to ship together?"

Wait for explicit "push" or "hold" before doing anything else.

---

## Self-review notes

**Spec coverage:**

- Spec §Stage 1 Goal → Task 4 (epic) + Task 5 (children) + Task 7 (summary report)
- Spec §Discovery (3-pass) → Task 2 (subagent dispatch executes all three passes)
- Spec §Granularity (one issue = one gap) → Task 3 step 2 (group endpoints into capabilities)
- Spec §bd shape (epic + children with `[ui-parity]` prefix) → Tasks 4-5
- Spec §Workspace location (`/Users/macole/github/.beads/`) → every bd command uses `BEADS_DIR=` explicitly
- Spec §Estimated size (8-15, pause if >25) → Task 3 step 4
- Spec §Out of scope (admin/internal endpoints) → Task 2 subagent prompt drops them in Pass 1
- Spec §Output (epic + children + summary report) → Tasks 4-7

**Marketing-gating linkage:** Task 7 step 1 cross-references gated capabilities against current site copy — this is the artifact PR-A's plan needs as input. Without it, PR-A would have to redo the cross-reference work.

**Why subagent dispatch:** Reading openapi.yaml (likely 500+ lines), grepping the kuju-mail frontend (hundreds of files), and grepping CHANGELOG (~800 lines) is ~50-100 file ops. Doing it inline in the primary session burns context for downstream tasks. The Explore subagent does it fresh and writes only the digest back to disk.

**User gates:** two checkpoints (Task 3 step 5 and Task 8 step 4) require explicit user approval before continuing — judgment review of candidates, and push decision. These are deliberate; do not skip.
