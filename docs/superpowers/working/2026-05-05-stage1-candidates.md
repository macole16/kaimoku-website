# Stage 1 (pivoted) — `[api-doc-parity]` Candidate Gaps (2026-05-05)

**Pivot rationale:** The audit found zero traditional UI-vs-API gaps. Every customer-facing endpoint has UI surface. The real gap is **documentation parity**: ~45 endpoints exist in code + UI but are NOT in `kuju-mail/docs/openapi.yaml`. Since `/kuju-email/docs` on the marketing site auto-renders from openapi.yaml, these features are invisible to anyone reading the public API docs.

**Source:** `2026-05-05-stage1-audit-raw.md` Pass 2, Tier 2 table.

**Total candidates:** 15 capability families.

---

## Filing pattern

- One epic: `[api-doc-parity] kuju-mail: undocumented frontend-used endpoints` (parent)
- One child per capability family: `[api-doc-parity] <family>: add to openapi.yaml`
- Each child's "definition of done": the endpoints are documented in `kuju-mail/docs/openapi.yaml` and the marketing site's `/kuju-email/docs` page renders them.

---

## Candidates

### C1 — Smart Inbox sections

- **Endpoints:** `GET /api/inbox/sections`
- **UI surface:** Webmail Smart Inbox view
- **Marketing impact:** HIGH — Smart Inbox is a centerpiece of the four-mode thesis. PR-A will market this. Its absence from /kuju-email/docs makes the marketing claim unverifiable to API-savvy prospects.
- **Suggested priority:** P1
- **Source:** Audit Tier 2 row "Inbox Sections"

### C2 — Activity Feed

- **Endpoints:** `GET /api/feed`
- **UI surface:** Webmail Activity Feed view
- **Marketing impact:** HIGH — Activity Feed is part of Standard mode's marketing story.
- **Suggested priority:** P1
- **Source:** Audit Tier 2 row "Feed"

### C3 — Message Analysis (AI features)

- **Endpoints (8+):** `GET /api/messages/{id}/analysis`, `POST /api/analysis/rewrite`, `GET /api/messages/{id}/analysis/{type}` (where type ∈ {ai-reply, instant, av-rescan, url-safety, thread-document, thread-summary, thread-graph})
- **UI surface:** Webmail message detail panel, MessageAnalysis component
- **Marketing impact:** HIGH — AI Reply, MessageAnalysis (key points / decisions / action items), thread graphs, URL safety are major marketing claims. The most consequential undocumented family.
- **Suggested priority:** P0
- **Source:** Audit Tier 2 row "Analysis"

### C4 — NL command palette + commands

- **Endpoints (3):** `POST /api/messages/search/natural`, `POST /api/commands/interpret`, `POST /api/commands/execute`
- **UI surface:** Webmail command palette
- **Marketing impact:** MEDIUM — Terminal mode mentions the command palette. NL search is a differentiator worth documenting.
- **Suggested priority:** P1
- **Source:** Audit Tier 2 rows "Search" + "Commands"

### C5 — Tasks

- **Endpoints:** `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/{id}`
- **UI surface:** Webmail tasks sidebar
- **Marketing impact:** MEDIUM — Tasks are a real feature; not currently a centerpiece marketing claim but worth documenting for completeness.
- **Suggested priority:** P2
- **Source:** Audit Tier 2 row "Tasks"

### C6 — Workspaces

- **Endpoints (3):** `GET/POST /api/workspaces`, `GET/PUT/DELETE /api/workspaces/{id}`, `GET /api/workspaces/{id}/messages`
- **UI surface:** Webmail sidebar (custom message groupings)
- **Marketing impact:** MEDIUM — Power-user feature, supports the "modes" story (workspaces are how you carve up the inbox).
- **Suggested priority:** P2
- **Source:** Audit Tier 2 row "Workspaces"

### C7 — Calendars (CalDAV)

- **Endpoints (4+):** `GET/POST /api/calendars`, `GET/PUT/DELETE /api/calendars/{id}`, `GET/POST /api/calendars/{id}/events`, `GET/PUT/DELETE /api/calendars/{calId}/events/{id}`
- **UI surface:** Calendar React island
- **Marketing impact:** MEDIUM — Calendar is mentioned in the existing /kuju-email page; documenting closes a marketing-vs-docs gap.
- **Suggested priority:** P1
- **Source:** Audit Tier 2 row "Calendars (CalDAV)"

### C8 — Address Books (CardDAV)

- **Endpoints (4+):** `GET/POST /api/address-books`, `GET/POST /api/address-books/{abId}/contacts`, `GET/PUT/DELETE /api/address-books/{abId}/contacts/{id}`, `GET /api/address-books/{abId}/contacts/{id}/photo`
- **UI surface:** Contacts React island
- **Marketing impact:** MEDIUM — Same reasoning as Calendars.
- **Suggested priority:** P1
- **Source:** Audit Tier 2 row "Address Books (CardDAV)"

### C9 — Contacts Intelligence (separate from CardDAV)

- **Endpoints (5):** `GET /api/contacts/autocomplete`, `GET /api/contacts/exists`, `GET /api/contacts/photos/lookup`, `POST /api/contacts/quick-add`, `GET /api/contacts/intelligence/{type}`
- **UI surface:** Webmail compose typeahead, read-pane contact IQ
- **Marketing impact:** LOW-MEDIUM — Autocomplete is a quality-of-life feature; "contact IQ" is more interesting but not a centerpiece claim.
- **Suggested priority:** P2
- **Source:** Audit Tier 2 row "Contacts Intelligence"

### C10 — IMAP Import wizard

- **Endpoints (7):** `POST /api/import/start`, `GET /api/import/status`, `POST /api/import/{pause,resume,cancel}`, `GET/POST /api/import/profiles`, `POST /api/import/test-connection`
- **UI surface:** Settings → Import wizard (multi-step)
- **Marketing impact:** HIGH — Import is mentioned in `/kuju-email/guide` and is part of the trial-onboarding story. Recently highlighted in marketing per the commit log ("Highlight trial, domain aliases, onboarding wizard, and DNS guide").
- **Suggested priority:** P1
- **Source:** Audit Tier 2 row "Import (IMAP)"

### C11 — Account preferences

- **Endpoints (4):** `GET/PUT /api/account/preferences`, `GET/PUT /api/account/profile`, `GET/PUT /api/account/identities`, `POST /api/account/dismiss-hint`
- **UI surface:** Settings → Account panel
- **Marketing impact:** LOW — Standard account-management endpoints; expected to exist; marketing doesn't lean on these.
- **Suggested priority:** P3
- **Source:** Audit Tier 2 row "Account/Preferences"

### C12 — Vacation responder

- **Endpoints (1):** `GET/PUT /api/vacation`
- **UI surface:** Settings → Integrations → Vacation
- **Marketing impact:** LOW — Standard out-of-office feature; expected.
- **Suggested priority:** P3
- **Source:** Audit Tier 2 row "Vacation/Autoreply"

### C13 — Drafts auto-recovery (already in openapi.yaml — VERIFY before filing)

- **Note:** Pass 2 confirmed all 5 documented draft endpoints are wired. This is NOT a candidate — listed here only to ensure it's not double-filed. **DROP.**

### C14 — Intent Categories

- **Endpoints (3):** `GET/POST /api/intent-categories`, `GET/PUT/DELETE /api/intent-categories/{id}`, `POST /api/intent-categories/reorder`
- **UI surface:** Settings + Message detail (custom taxonomy)
- **Marketing impact:** MEDIUM — Smart Inbox depends on intent classification; the user-customizable taxonomy is a differentiator.
- **Suggested priority:** P2
- **Source:** Audit Tier 2 row "Intent Categories"

### C15 — Slack integration plugin (FLAG FOR JUDGMENT)

- **Endpoints (6+):** `/api/plugins/kuju-slack/{conversations,messages,unread,ai-suggestions,disconnect,filters}`
- **UI surface:** Webmail Slack view
- **Marketing impact:** Plugin-licensed; may be intentionally undocumented in the main openapi.yaml because plugin endpoints are documented per-plugin (see audit notes: "canonical endpoints are gated by license feature and documented via each plugin's metadata").
- **Suggested priority:** Flagged — likely DROP or split out as plugin-doc-parity instead of api-doc-parity.

---

## Open questions for judgment review

- **C15 (Slack plugin):** Should plugin endpoints be in openapi.yaml at all? The audit suggests no (plugin-managed). Recommend dropping from this inventory; if plugin documentation is its own concern, file separately as `[plugin-doc-parity]`.
- **C11 + C12 (account prefs, vacation):** Low marketing impact but quick wins to document. Keep as P3 or drop?
- **C13:** Verified DROP (already in openapi.yaml).
- **Granularity of C3 (Message Analysis):** 8+ endpoints in one issue, or split (e.g., AI Reply separate from URL safety)? My take: keep together — the work is "document the analysis API surface," logically one task.

## Filing proposal (after judgment review)

Default plan: file 13 children (drop C13 + C15), parent under one epic. Adjust based on review.

| Child | Family                  | Priority |
| ----- | ----------------------- | -------- |
| C1    | Smart Inbox sections    | P1       |
| C2    | Activity Feed           | P1       |
| C3    | Message Analysis (AI)   | P0       |
| C4    | NL command palette      | P1       |
| C5    | Tasks                   | P2       |
| C6    | Workspaces              | P2       |
| C7    | Calendars (CalDAV)      | P1       |
| C8    | Address Books (CardDAV) | P1       |
| C9    | Contacts Intelligence   | P2       |
| C10   | IMAP Import wizard      | P1       |
| C11   | Account preferences     | P3       |
| C12   | Vacation responder      | P3       |
| C14   | Intent Categories       | P2       |
