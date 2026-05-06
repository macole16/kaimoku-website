# Stage 3 — `/impeccable critique` of kaimoku-website

**Date:** 2026-05-05
**Spec:** kaimoku-website/docs/superpowers/specs/2026-05-05-kaimoku-website-marketing-sync-design.md (Section 4 Stage 3)
**Target:** `/` and `/kuju-email` post-PR-A merge (commits `edd205f` through `9c20e22` on `origin/main`)
**Tracking:** bd epic `github-x57` + 7 children

---

## Anti-patterns verdict

**LLM assessment:** Yes, reads as AI-generated within five seconds. Navy-to-cyan gradient hero, three identical icon-card grids, Tailwind `slate-*` neutrals, Heroicons in colored chip backgrounds, closing CTA banner that mirrors the hero. Indistinguishable from generic "modern email infra" SaaS landings of the last three years. **The kuju-mail product itself has voice (Sumi Green, Curator's Reading Room, four-mode "the mode follows the moment" thesis) and none of it has reached the marketing site.**

**Deterministic detector:** `npx impeccable --json` returned `[]` — zero findings across all 5 source files. Notable: this confirms the issues are **higher-order brand/design problems**, not mechanical anti-pattern violations. The detector targets tactical tells (gradient text, glassmorphism, side-stripe borders, hero-metric templates) that this site avoids — it's clean of tactical mistakes but fails on strategic distinctiveness.

**Visual overlays:** skipped (no live URL captured for browser injection).

---

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                     |
| --------- | ------------------------------- | --------- | ----------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 2         | No active-page indicator in header; trial CTA's disabled state invisible      |
| 2         | Match System / Real World       | 2         | Four-mode thesis named without preview; abstract names without visuals        |
| 3         | User Control and Freedom        | 3         | Standard nav, no traps                                                        |
| 4         | Consistency and Standards       | 3         | Internally consistent, but to the wrong template                              |
| 5         | Error Prevention                | 2         | `pointer-events-none opacity-60` trial state is invisible                     |
| 6         | Recognition Rather Than Recall  | 2         | Modes mentioned in 12-cell checklist; user must hold abstract names in memory |
| 7         | Flexibility and Efficiency      | 2         | No anchor TOC on 393-line product page, no skip links, no shortcuts           |
| 8         | Aesthetic and Minimalist Design | **1**     | ~40 identical feature cards on /kuju-email; heart of the problem              |
| 9         | Error Recovery                  | 3         | N/A in any meaningful sense                                                   |
| 10        | Help and Documentation          | 3         | "User Guide" + "API Docs" plainly available                                   |
| **Total** |                                 | **23/40** | **Acceptable (low end of band)**                                              |

**Cognitive load:** 3/8 fail (moderate) — single focus, visual hierarchy, minimal choices, progressive disclosure.

---

## What's working

1. **`開目` etymology paragraph** (`page.tsx:67-73`) is the single piece of distinctive brand voice on the site. Move it earlier and harder.
2. **ModesShowcase headline** ("The Mode Follows the Moment") is the actual kuju-mail thesis lifted correctly. Section IA is right; execution is generic.
3. **"Move Your Domain" three-step section** (`page.tsx:179-210`) has clear job-to-be-done framing; copy is concrete (MX/SPF/DKIM named); functional.

---

## Priority issues (filed in bd as github-x57.1 through .7)

| bd ID        | Priority | Issue                                                  | Suggested impeccable command                    |
| ------------ | -------- | ------------------------------------------------------ | ----------------------------------------------- |
| github-x57.1 | P0       | No brand identity has reached the marketing site       | `/impeccable colorize` + `/impeccable document` |
| github-x57.2 | P0       | Geist Sans typography reflex-rejection                 | `/impeccable typeset`                           |
| github-x57.3 | P1       | /kuju-email is a feature dump, not a story             | `/impeccable distill` + `/impeccable layout`    |
| github-x57.4 | P1       | Modes thesis is told, not shown                        | `/impeccable shape` (creative restructure)      |
| github-x57.5 | P1       | Hero CTA stack has no primary action                   | `/impeccable distill`                           |
| github-x57.6 | P2       | No imagery — defensible in theory, painful in practice | `/impeccable shape` (folds into modes)          |
| github-x57.7 | P3       | Em dashes throughout copy                              | `/impeccable clarify`                           |

Full detail per issue lives in each bd issue body.

---

## Persona red flags

**IT decision-maker** (Director of Engineering, 40-person company):

- 3 CTAs of similar weight, no clear "evaluate this for my org" path
- Zero trust signals — no SOC 2, ISO, GDPR, customer logos, uptime numbers
- 40-card feature wall buries SAML/SCIM answer (and SAML/SCIM aren't even mentioned)
- No pricing visible from /kuju-email

**Self-hosted / power-user** (developer, runs own mail server):

- "Self-Hosted Option Coming Soon" buried as bullet 6 of 8 in standoutFeatures
- Terminal Mode appears as ONE bullet on homepage; persona-magnet feature gets no treatment
- No GitHub link, no architecture diagram in hero
- Generic "AI-powered" framing for someone who'd appreciate technical specifics

**Solo founder / small-team founder:**

- Page speaks to "organizations" — 3-person team doesn't read it that way
- Domain onboarding described in two places with different framings
- Seven separate AI features named on /kuju-email read as "bolted AI everywhere"
- Trial CTA may be `pointer-events-none opacity-60` — they tap, nothing happens, they bounce

---

## Minor observations

(Captured in epic body for reference; not filed as separate issues.)

- Footer "Pricing" and "Try Kuju Email" both link to `/kuju-email/pricing`
- Hero ribbon `bg-kuju/20 text-kuju` poor contrast on navy gradient
- `max-w-7xl` + `px-6` repeats on every section — removes layout rhythm
- Header logo is generic single-letter "K"; `開目` character pair more distinctive
- Body line length on /kuju-email `max-w-2xl` paragraphs ≈85ch (target 65–75)
- Every heading uses `font-bold` — type scale exists in size only
- `bg-white/95 backdrop-blur-sm` header is light glassmorphism
- 12-cell homepage feature checklist has no apparent ordering principle
- External trial link missing `target="_blank" rel="noopener"`

---

## Provocative questions

1. **What if the homepage didn't sell Kuju Email at all?** Both `/` and `/kuju-email` currently compete for the same job. Splitting by horizon — homepage = Kaimoku brand & philosophy (`開目`, Curator's Reading Room voice); product page = product specifics — would let each surface have a real point of view.

2. **What if the four modes were the entire `/kuju-email` page?** The product's central, defensible, undeniable differentiator is _four visually distinct experiences_. What if the page were structured as four full-bleed sections — one per mode — each with its own typography, color palette, product visual, and the feature catalog became a final compact appendix or `/features` subpage?

3. **What's the story you'd tell if you couldn't use the words "AI-powered" or "modern"?** Both phrases dominate the copy (8+ uses of "AI-powered," 6+ of "modern") — the two most depleted words in 2026 SaaS marketing. The "Curator's Reading Room" voice from kuju-mail is the answer.

---

## Methodology note

- Two parallel assessments dispatched as isolated subagents (per the impeccable critique skill's anti-anchoring discipline).
- Assessment A: LLM design review (read source files, scored heuristics, evaluated AI slop, applied cognitive load checklist, identified personas).
- Assessment B: Automated detection (`npx impeccable --json` against 5 source files; returned `[]`).
- The detector's zero-findings result is itself an important data point: this site fails on _strategy_, not on _tactics_.

## Next step

Brainstorming + writing-plans cycle for PR-B's shape brief, using `github-x57.1` through `.7` as the structural input.
