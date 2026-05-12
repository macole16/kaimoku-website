# Kuju Email — security diagram (marketing surface)

**Status:** Design approved · ready for implementation plan
**Issue:** `bd github-8y9`
**Date:** 2026-05-11
**Surface:** `kaimoku-website` (Next.js, Vercel) — new section on `/kuju-email`
**Related artifact:** Operational diagram in `kaimoku-console` at `/products/kuju-mail/diagram` (spec: `kaimoku-console/docs/superpowers/specs/2026-05-11-kuju-mail-ecosystem-diagram-design.md`). The two are deliberately different: that one shows real services to operators; this one shows abstracted layers to prospects.

## Summary

A new "How a message reaches you" section on the `/kuju-email` product page, below the standouts grid. It's a quiet, literary-toned journey diagram showing the four checks every inbound message passes through (Identity, Path, Contents, Handoff) before landing in the user's inbox. Each technique label (SPF, DKIM, DMARC, etc.) deep-links into a new `/kuju-email/glossary` page that defines the term in plain language.

The artifact's job is to convert "we take security seriously" from claim into demonstration without resorting to trust theater — no concentric shields, no big numbers, no military-grade language. The diagram and surrounding prose match the rest of `/kuju-email`'s Curator's Reading Room voice.

## Audience and success criteria

**Audience:** prospects already on `/kuju-email` evaluating Kuju Email. They're either (a) security-conscious technical buyers comparing layered defense across vendors, or (b) less-technical buyers who want reassurance without being talked down to. The design serves both — the diagram structure satisfies the first; the prose, glossary, and "why it matters" lines serve the second.

**Success looks like:**

- A skimmer reading only the headline and the four checkpoint labels comes away with: "Kuju checks identity, path, contents, and handoff for every message."
- A reader who clicks a technique label lands on a glossary entry that respects their intelligence and teaches them the term in plain language.
- The page's voice stays coherent — no reader thinks "oh, they got a different copywriter for this section."

**Not the job:**

- Persuading a hostile reader who already decided we're insecure.
- Marketing copy for social posts or ads (those are separate artifacts that would draw from this).
- Detailed technical documentation (that's the user guide and API docs).

## Page placement

New full-width section on `/kuju-email`, inserted **between the standouts grid and the "Move your domain" section**.

```
Hero
ModesShowcase
Standouts grid (6 cards) ← existing
NEW: Security section ("How a message reaches you")
Move your domain ← existing
CTA ← existing
```

The existing **"Defense in depth, by default"** standout card stays in the grid unchanged in body copy, but gains a small **"See how a message reaches you →"** anchor link at the bottom of the card that scrolls to the new section. This gives grid skimmers a discovery path without disrupting the six-card rhythm.

## Tone and voice

- **Quiet literary**, matching `/kuju-email`'s existing "One inbox in four registers" register.
- **Type stack** (matches the page; mockups used Georgia as a stand-in because the visual companion can't load the page fonts):
  - **Section headline** ("Every message passes through four checks...") — `var(--font-display)` (**Spectral**), weight 300, with italic emphasis on the first clause. Mirrors the hero and CTA bookends, which are the only other display-font moments on the page.
  - **Sub-headline and closer prose** — `var(--font-body)` (**Public Sans**). Matches the existing standouts subtitle and the rest of the page's body copy.
  - **Diagram checkpoint labels** (*Identity*, *Path*, *Contents*, *Handoff*) — Spectral italic, ~13px. Gives the labels a literary register and distinguishes them from the questions and techniques below.
  - **Diagram questions** ("who sent this?", etc.) — Public Sans, ~9px.
  - **Diagram techniques** (SPF, DKIM, etc.) — `ui-monospace`/system mono stack, ~8px. Code-like terms stay code-like.
- **Palette** — match the existing `/kuju-email` Tailwind tokens. Diagram strokes and dark text use `text-primary` / equivalent CSS variable; secondary text uses `text-slate-600`; link color uses the page's existing `text-kuju` (kuju green) for the dotted-underline technique labels.
- **No iconography** beyond the diagram itself — no shield, lock, or check-mark glyphs.
- **No big numbers** — no "7 layers", no "99.9%". The narrative reads "four checks", and the surrounding prose carries the rest.

## Narrative shape: journey

**Sequence:** envelope → Identity → Path → Contents → Handoff → your inbox.

**Headline pattern:** *"Every message passes through four checks before it reaches you."* (Italic emphasis on the first clause, regular weight on the second; same display typography as the hero.)

**Sub-headline:** "We watch each arrival in four passes: the sender, the path, the contents, and the handoff. None of them ask you to think."

**Closer:** *"Hidden detail isn't reassuring — visible, quiet detail is. We'd rather teach you the words than hide them."* (Reinforces the page's commitment to transparency over performance.)

## Diagram structure

Four checkpoints laid out left-to-right between a simple envelope glyph (left) and a filled-in inbox glyph (right). A dashed horizontal line connects them, representing the message's path.

Each checkpoint is a stroked rectangle (no fill) containing:

1. **Label** — Spectral italic, ~13px (e.g., *Identity*)
2. **Question** — Public Sans, ~9px below the label (e.g., "who sent this?")
3. **Two technique lines** — ui-monospace, ~8px, in the page's kuju-green link color, **dotted-underlined** as deep links into `/kuju-email/glossary#<anchor>`

### Checkpoint copy (canonical)

| # | Label    | Question                  | Techniques (deep-linked)                  |
|---|----------|---------------------------|-------------------------------------------|
| 1 | Identity | who sent this?            | `SPF · DKIM · DMARC`<br/>`relay-hop trace`|
| 2 | Path     | where did it come from?   | `reputation checks`<br/>`spam & phishing patterns` |
| 3 | Contents | is it safe to open?       | `URL safe-browsing`<br/>`virus stripping` |
| 4 | Handoff  | does it arrive intact?    | `TLS in flight`<br/>`encrypted at rest`   |

### What labels deliberately omit

These would cross into "architectural detail competitors could use":

- No mention of Rspamd, ClamAV, or any other internal component name.
- No mention of two-tier classification (the standouts card says "two-tier" — we deliberately don't repeat it here; the diagram speaks in capabilities, not architecture).
- No mention of database, queue, or storage technology.
- No mention of self-hosted vs managed deployment topology.

Technique labels are the *capabilities a savvy buyer would ask about* (well-known protocols and industry-standard practices), not the *implementation details we use to deliver them*.

## Animation behavior

**Single glide on scroll-into-view.** When the diagram enters the viewport (intersection observer, threshold ~0.4), the envelope-on-the-left fades the message glyph along the dashed path from left to right over ~1.6s with `ease-out`, then settles into the filled-in inbox. **Does not loop.** Plays once per page load.

- Reduced-motion users (`prefers-reduced-motion: reduce`) see no animation; the diagram renders in final state on mount.
- Mobile (<720px): no animation at all. The vertical stack reveals itself naturally as the user scrolls; adding motion on top would be visual noise.

The animation is a small grace note, not the point. Removing it should not damage the section.

## Mobile fold (<720px)

The horizontal SVG hides; a **vertical stack** renders in its place. Same four checkpoints, same content, same dotted-link technique labels, but laid out top-to-bottom:

- Envelope glyph (center-aligned, small)
- Vertical dashed connector
- Four checkpoint cards stacked, each ~280px wide
- Inbox glyph (center-aligned, small)

The vertical version is **also the semantic fallback for screen readers** on desktop (see Accessibility).

## Glossary

### Location

New page at **`/kuju-email/glossary`**. Parallels existing `/kuju-email/guide`, `/kuju-email/docs`, `/kuju-email/pricing`. Linked from:

1. The new security section (dotted links on technique labels + a single "Email security glossary →" line below the diagram).
2. The site footer's `/kuju-email` link group (so it's discoverable without scrolling to the section).

### Entry style

Plain mechanic, no metaphors (decided 2026-05-11 — metaphors risk feeling condescending and don't fit Curator's Reading Room voice).

Each entry has:

- **Term + expansion** (bold; e.g., "SPF — Sender Policy Framework")
- **Definition** (1–2 sentences, plain language, Public Sans ~14px — matches the rest of the site's body copy)
- **Why it matters** (1 sentence in Spectral italic ~13px, ties the term back to the prospect's concern; the italic display-font shift signals "this is the human takeaway")

Example:

> **SPF — Sender Policy Framework**
> A DNS record listing which mail servers are allowed to send mail for your domain. Receivers check this list when a message arrives.
> *Why it matters:* without SPF, anyone can claim to send mail from your address. With it, fakes get caught at the door.

### Scope (initial 14 entries)

Every term appearing in the diagram, plus adjacent ones a prospect commonly asks about:

| # | Term | Source |
|---|------|--------|
| 1 | SPF | Identity checkpoint |
| 2 | DKIM | Identity checkpoint |
| 3 | DMARC | Identity checkpoint |
| 4 | Relay-hop trace | Identity checkpoint |
| 5 | Reputation checks | Path checkpoint |
| 6 | Spam & phishing patterns | Path checkpoint |
| 7 | URL safe-browsing | Contents checkpoint |
| 8 | Virus stripping | Contents checkpoint |
| 9 | TLS in flight | Handoff checkpoint |
| 10 | Encrypted at rest | Handoff checkpoint |
| 11 | TOTP | Adjacent (standouts mention) |
| 12 | Passkeys (WebAuthn) | Adjacent (standouts mention) |
| 13 | MX records | Adjacent (onboarding mentions) |
| 14 | End-to-end encryption (what we are and aren't) | Adjacent (prospect FAQ) |

Anchor IDs use kebab-cased term names (e.g., `#spf`, `#dkim`, `#relay-hop-trace`) so the dotted links in the diagram jump straight to the matching entry.

### Page structure

- Hero strip with brief intro ("Plain definitions for the security terms we use across Kuju Email.")
- Alphabetical list of entries
- "Back to product overview" link at top and bottom

No sidebar TOC; the page is short enough that browser find (⌘F) and anchor links carry navigation.

## Accessibility

- **SVG** marked `role="img"` with `<title>` ("How a message reaches you: a four-step journey from arrival through Identity, Path, Contents, and Handoff into your inbox") and `<desc>` (longer paragraph naming each checkpoint and its techniques).
- **Technique labels** are real SVG `<a href="/kuju-email/glossary#<term>">` elements wrapping the `<text>` glyphs, so they're keyboard-focusable and screen-readable.
- **Mobile vertical stack** is the canonical semantic markup — proper `<h3>`, `<p>`, `<ul>`, `<a>` elements. On desktop it's hidden via CSS (`@media (min-width: 720px) { display: none }`), but it stays in the DOM so screen readers have a clean linear narrative even when the SVG is the primary visual.
- **Single data source:** define the four checkpoints as one `const CHECKPOINTS = [...]` array in the React component, then render twice (SVG for ≥720px, semantic HTML for <720px). Prevents drift between the two surfaces.
- **Reduced motion:** the scroll-triggered glide is gated on `prefers-reduced-motion: no-preference`. Reduced-motion users see the final state on mount.
- **Colour contrast:** all text in the SVG and surrounding prose meets WCAG AA against the page's cream background (the `bg-surface` token used by the standouts section above it).

## Implementation notes

- **Repo:** `kaimoku-website` (Next.js 16 + React 19 + Tailwind 4).
- **Files (proposed):**
  - `src/components/marketing/SecurityJourney.tsx` — the new section component (SVG + mobile stack + animation).
  - `src/app/kuju-email/page.tsx` — insert `<SecurityJourney />` between the standouts grid and the "Move your domain" section; add the "See how →" anchor link to the existing Defense card.
  - `src/app/kuju-email/glossary/page.tsx` — new glossary page.
  - `src/lib/glossary.ts` — array of `{ term, expansion, definition, whyItMatters }` entries used by the glossary page (single source of truth; entries map 1:1 to anchor IDs).
- **Animation:** plain CSS `@keyframes` triggered by an `IntersectionObserver` (no Framer Motion or other animation library — keep dependencies thin).
- **Brand tokens:** reuse existing Tailwind config; no new tokens introduced.
- **No new dependencies.**

## Stealth posture

`kaimoku-website` is in stealth (per `feedback_kaimoku_stealth`). This artifact:

- Ships to `kaimoku-website.vercel.app/kuju-email` — does not change deployment posture.
- Does not trigger `kaimoku.tech` DNS mapping, public announcement, or any other go-public action.
- The "deploy" is the same as every other website change: push to GitHub main → Vercel auto-deploys. No separate gate.
- When/if the user decides to go public with `kaimoku.tech`, this artifact ships there too with no code change required.

## Out of scope (explicit non-goals)

- **No "outbound" journey** — we deliberately do not also diagram what happens when *you* send a message. That doubles the surface area and dilutes the "we protect what arrives" message. Possible future artifact.
- **No comparison table** with competitors (ProtonMail, Fastmail, etc.). Different artifact, different goal.
- **No animated checkpoint reveals** — the section uses one quiet glide animation and no other motion. Hover detail, expanding panels, etc. are explicitly out.
- **No video** or scroll-driven storytelling beyond the single glide on enter.
- **No glossary entries beyond the 14 listed.** Future entries get added as new terms enter Kuju Email's vocabulary, not pre-emptively.

## Open questions

None blocking. To be settled at implementation time:

1. Exact `IntersectionObserver` threshold (0.3 vs 0.4 vs 0.5) — pick what feels right when the section is rendered in the page rhythm.
2. Whether the four checkpoint questions ("who sent this?", "where did it come from?", "is it safe to open?", "does it arrive intact?") render *below* each label inside the SVG box, or alongside as floating prose. Mockup has them inside; revisit during implementation if visual rhythm calls for adjustment.
3. Whether the glossary page gets a small "Back to security section" anchor on each entry (could be over-engineering for 14 short entries — implementation judgement).

## Approvals

- Placement, tone, narrative shape, checkpoint structure, animation behaviour, mobile fold, glossary location, glossary entry style, cross-link from "Defense in depth" card — all approved during brainstorming session 2026-05-11.
- Accessibility plan and implementation notes drafted by Claude; user review pending.
