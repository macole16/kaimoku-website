# Stage 1 Summary — Pivoted: API Documentation Parity Inventory

**Date:** 2026-05-05
**Spec:** kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md
**Epic:** github-2u4 — `[api-doc-parity] kuju-mail: undocumented frontend-used endpoints`

---

## Pivot context

The spec assumed a **UI-vs-API gap** ("API capabilities not yet wired to UI"). The audit found that pattern doesn't exist in kuju-mail today: every customer-facing OpenAPI endpoint has UI surface, and an additional ~45 endpoints exist in code + UI but aren't in `openapi.yaml`. The real gap is **documentation**, not wiring.

This inverted the inventory's purpose. The original goal was marketing gating ("don't market what's API-only"). With zero gating risks, that goal evaporated. The pivoted inventory tracks the documentation gap: the audit's `Tier 2` family of features that are real but invisible to anyone reading `/kuju-email/docs`.

Per user direction at the judgment-review checkpoint (option C in the brainstorm), the original Stage 1 framing was abandoned and this `[api-doc-parity]` inventory was filed instead.

---

## Filed

- **1 epic:** `github-2u4` (UI parity → API doc parity, pivoted)
- **13 children:** `github-2u4.1` through `github-2u4.13`

| Family                         | Endpoints | Priority | Issue         |
| ------------------------------ | --------- | -------- | ------------- |
| Message Analysis (AI features) | 8+        | P0       | github-2u4.1  |
| Smart Inbox sections           | 1         | P1       | github-2u4.2  |
| Activity Feed                  | 1         | P1       | github-2u4.3  |
| NL command palette + commands  | 3         | P1       | github-2u4.4  |
| Calendars (CalDAV)             | 4+        | P1       | github-2u4.5  |
| Address Books (CardDAV)        | 4+        | P1       | github-2u4.6  |
| IMAP Import wizard             | 7         | P1       | github-2u4.7  |
| Tasks                          | 2         | P2       | github-2u4.8  |
| Workspaces                     | 3         | P2       | github-2u4.9  |
| Contacts Intelligence          | 5         | P2       | github-2u4.10 |
| Intent Categories              | 3         | P2       | github-2u4.11 |
| Account preferences            | 4         | P3       | github-2u4.12 |
| Vacation responder             | 1         | P3       | github-2u4.13 |

**Dropped from inventory:** Slack plugin endpoints (audit notes plugin endpoints are documented per-plugin metadata, not in main openapi.yaml — different documentation mechanism by design). Drafts (already in openapi.yaml; verified).

---

## Implications for PR-A (next stage)

**No marketing gating required.** With zero UI-vs-API gaps, every kuju-mail capability is fair game for marketing copy. PR-A doesn't need the "what NOT to market" reference the original spec assumed.

**PR-A's source of truth becomes the audit's "Confirmed UI-shipped capabilities" list.** Twenty-two major features, all production-tested:

| Feature category                                                 | Marketing-ready |
| ---------------------------------------------------------------- | --------------- |
| Login & Auth (TOTP, passkeys)                                    | ✓               |
| Webmail core (folders, messages, compose)                        | ✓               |
| Drafts (auto-recovery)                                           | ✓               |
| Search (full-text + NL)                                          | ✓               |
| Settings & Security (recovery email, 2FA, passkeys)              | ✓               |
| Branding (whitelabel)                                            | ✓               |
| Smart Inbox                                                      | ✓               |
| Activity Feed                                                    | ✓               |
| Tasks                                                            | ✓               |
| Workspaces                                                       | ✓               |
| Timeline mode (Briefing Strip)                                   | ✓               |
| Magazine mode (editorial reader)                                 | ✓               |
| Terminal mode (keyboard-first)                                   | ✓               |
| Contacts (CardDAV)                                               | ✓               |
| Calendar (CalDAV)                                                | ✓               |
| IMAP Import wizard                                               | ✓               |
| Slack Integration (plugin)                                       | ✓               |
| Intent Categories (custom taxonomy)                              | ✓               |
| AI Reply suggestions                                             | ✓               |
| Message Analysis (spam, URL safety, thread graphs)               | ✓               |
| Vacation/Autoreply                                               | ✓               |
| Magazine + Standard + Timeline + Terminal (the four-mode thesis) | ✓               |

---

## Cross-reference: current marketing site claims vs reality

A spot-check of `kaimoku-website/src/app/kuju-email/page.tsx` against the audit findings:

- **"Three selectable conversation designs"** — STALE. Reality is four UI modes (Standard, Magazine, Timeline, Terminal). PR-A replaces this section.
- **Intent classification** mentioned (line ~112) — reality: ✓ shipped end-to-end. Keep.
- **Document-Centric (key points, decisions, action items)** mentioned (line ~29) — reality: ✓ shipped (MessageAnalysis). Will be re-framed under the Standard mode entry.
- **Modern Auth Methods** — reality: ✓ TOTP + passkeys + recovery email all wired. Keep.
- **Branding** — reality: ✓ shipped. Keep.
- **Calendar / Contacts** — reality: ✓ shipped (CalDAV/CardDAV). Already mentioned; can stay.

**Capabilities NOT currently on site that PR-A should add:**

- Smart Inbox (lanes — Pinned, Waiting, CC'd, Other)
- Activity Feed
- AI Reply (drafting assistant) as a named feature
- MessageAnalysis (key points / decisions / action items) as a named feature distinct from "Document-Centric"
- The four-mode thesis ("the mode follows the moment")
- Magazine mode (editorial reader)
- Timeline mode rewrite as Briefing Strip
- IMAP Import wizard (already on site as part of trial onboarding; reinforce)
- Tasks
- Workspaces
- Intent Categories (user-customizable)
- NL command palette (Terminal mode story)

---

## Roadmap implications (for kuju-mail)

The 13 `[api-doc-parity]` children are real backlog work, surfaced as a side-effect of this audit. They don't block PR-A — but they're worth flagging:

- **P0 (1):** Message Analysis. Documenting the AI feature surface is high-leverage for both marketing trust and developer ergonomics.
- **P1 (6):** Smart Inbox sections, Activity Feed, NL commands, CalDAV, CardDAV, IMAP Import wizard.
- **P2 (4):** Tasks, Workspaces, Contacts Intelligence, Intent Categories.
- **P3 (2):** Account preferences, Vacation responder.

Discoverable via `bd search api-doc-parity` or `bd show github-2u4`.

---

## Next step

PR-A planning. New brainstorm + writing-plans cycle. The capability list above (the 22 confirmed features + the "should add" list) is PR-A's content scope; no gating layer needed.
