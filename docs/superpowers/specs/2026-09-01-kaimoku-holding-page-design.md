# kaimoku.tech Holding Page Design

**Date:** 2026-09-01
**Status:** Design approved; spec awaiting review
**Issue:** bd `github-wwkxc`
**Scope:** Serve a company-only holding page on `kaimoku.tech` and `www.kaimoku.tech` via
host-matching Next.js middleware in the existing `kaimoku-website` project, without
altering the stealth posture of the site itself.

## Overview

`kaimoku.tech` currently answers nothing on the web. The instinct is to read that as
neglect; it is not. **The darkness is surgical, and that is what makes this cheap.**

Measured 2026-09-01:

| Fact | Value |
| --- | --- |
| Registration | Squarespace Domains, expires 2029-03-13 |
| Delegation | Cloudflare (`ed`/`eva.ns.cloudflare.com`) — zone live, SOA answers |
| `MX` | `10 mail.kuju.email` — **present** |
| `TXT` | valid SPF — **present** |
| `A`/`AAAA`/`CNAME` on apex and `www` | **absent** |

So `info@kaimoku.tech` receives mail today, through Kuju Mail. Someone removed the web
records and deliberately kept mail up. **This design is therefore a records-level change,
not a re-delegation** — and going live is reversible by deleting one record.

## Decisions

Three settled with the user on 2026-09-01, before any design work:

- **Reveal: company only.** Mark, wordmark, one line, `info@kaimoku.tech`. The page does
  not name Kuju Email or say what Kaimoku builds. This is the tightest of the three
  options considered and preserves the stealth posture almost entirely.
- **Indexing: not indexed.** The page inherits the existing site-wide `noindex` and the
  disallow-all `robots.txt`. The domain becomes **reachable, not discoverable** — someone
  who types it or scans a business card sees the page; a search for the company name finds
  nothing. Chosen over an indexed carve-out, which would have required host-aware
  `robots.txt` and given the middleware a second way to be wrong.
- **Shipping: merge inert.** See Section 5.

### Approach: middleware rewrite to a static file

**The root layout is the whole problem.** `src/app/layout.tsx` renders `<Header />` and
`<Footer />` unconditionally, and `Header` links to `/kuju-email`. App Router root layouts
cannot be opted out of, so the obvious implementation — a `/holding` route — would render
the holding page **with navigation into the pre-launch product site**, directly defeating
the company-only decision. Any workable approach must escape that layout.

Three were considered:

| | Approach | Rejected because |
| --- | --- | --- |
| A | Route groups: delete the root layout, move every route into `(marketing)`, add `(holding)` | Correct Next.js idiom, but moves **every existing route** in a repo with zero tests and no CI, to serve one page |
| B | Host-aware root layout reading `headers()`, set by middleware | `headers()` is a Dynamic API; used in the **root** layout it opts the entire marketing site out of static rendering — a permanent site-wide cost for one page |
| **C** | **Middleware rewrites to a self-contained `public/holding.html`** | **Chosen** |

C wins on blast radius: **no existing file changes.** `layout.tsx`, `robots.ts` and every
route are untouched, and static rendering is preserved.

It also has a property the other two lack. A **fully self-contained** HTML file — inline
CSS, inline SVG, no `/_next/*` chunks — has no asset dependencies, so the matcher can be
genuinely catch-all without breaking the page. A and B must *exclude* `/_next/*` to
function, which leaves the site's JS bundles fetchable on the brand domain. Under C,
`kaimoku.tech/_next/static/chunks/*` returns the holding page, so the bundles cannot be
pulled to learn what is being built.

**Accepted duplication.** The Round-07 mark is expressed twice: in `src/components/Logo.tsx`
as React, and as inline SVG in `holding.html`. A build-time generator using
`renderToStaticMarkup` was considered and rejected — it adds a `prebuild` step and a
failure mode to protect against cosmetic drift in ~15 lines of geometry that has been
spec-locked since 2026-05-11.

**The pointer comment is ONE-WAY, deliberately.** `holding.html` names `Logo.tsx`;
`Logo.tsx` does **not** name `holding.html`, because adding it would modify an existing
tracked file and break the additions-only property that success criterion 1 rests on. That
property is worth more than a reciprocal comment: it makes "this change cannot have
affected the live site" checkable by `git diff --name-status` alone. The residual risk is
that someone editing `Logo.tsx` has no signal the mark is mirrored elsewhere — accepted,
and recorded here rather than silently.

---

## 1. Request flow

```
kaimoku.tech/<anything>      -> middleware -> rewrite -> public/holding.html  (200, URL preserved)
www.kaimoku.tech/<anything>  -> middleware -> rewrite -> public/holding.html  (200, URL preserved)
kaimoku.tech/robots.txt      -> NOT matched -> robots.ts  -> "Disallow: /"
kaimoku.tech/favicon.ico     -> NOT matched -> brand favicon
kaimoku-website.vercel.app/* -> middleware NEVER RUNS     -> full site, unchanged
```

A **rewrite**, not a redirect: the URL the visitor typed is preserved and the response is
200. Nothing about the site's path structure is probeable, because every path returns the
same page.

### The matcher must be host-scoped

```ts
export const config = {
  matcher: [
    { source: "/:path*", has: [{ type: "host", value: "kaimoku.tech" }] },
    { source: "/:path*", has: [{ type: "host", value: "www.kaimoku.tech" }] },
  ],
};
```

**This is a correctness requirement, not an optimisation.** With a bare catch-all
(`matcher: ["/:path*"]`) the middleware executes on **every `vercel.app` request** as
well, merely to call `next()` — and a runtime throw would then return 500 for the entire
site. Host-scoping means it does not run at all for other hosts.

The middleware **also checks the host in code** before rewriting. Correctness must not
depend on `has`-matcher semantics being what the author believed; the matcher is the
optimisation and the in-code check is the guarantee. Verify `has` behaves as documented on
Next 16.1.7 during implementation rather than assuming it.

### Two deliberate exclusions

- **`/robots.txt`.** A catch-all would return **HTML where `robots.txt` belongs**, and
  crawlers treat an unparseable `robots.txt` as **allow-all** — silently undoing the
  not-indexed decision. Excluding it serves the real disallow-all instead. This is
  belt-and-braces with the `noindex` meta tag in the page, the same two-mechanism argument
  `src/app/robots.ts` already makes in its own comment.
- **`/favicon.ico`.** The brand favicon renders in the tab. It reveals nothing beyond the
  company mark, which the page shows anyway.

---

## 2. The page

`public/holding.html`, self-contained by specification — inline `<style>`, inline `<svg>`,
no external stylesheet, no script.

- **Mark:** Round-07 geometry — 4:5 frame, orange `#B8421E` line at 1/3 height, ink
  `#0E0E0E` line at 2/3, stroke scaled to the frame. Matches `Logo.tsx`.
- **Wordmark:** `kai` + orange divider + `moku`, Cormorant Garamond 400.
- **Line:** "Something is coming."
- **Contact:** `info@kaimoku.tech` as a `mailto:` — a live mailbox, per the MX finding above.
- **Meta:** `<meta name="robots" content="noindex,nofollow">`.
- **Responsive** and legible from phone to desktop; centred, single column.

**Font delivery.** Cormorant Garamond comes from Google Fonts with a serif fallback stack.
The site's own copy is self-hosted by `next/font` under a content-hashed `/_next/static/media/`
path, which is both unavailable under the catch-all rewrite and not a stable filename to
reference. An inlined base64 subset of the six required glyphs (`k a i m o u`) would remove
the third-party request and keep the file truly self-contained; it is the noted upgrade if
the external request is unwanted.

---

## 3. Files

| File | Change |
| --- | --- |
| `src/middleware.ts` | new — host check and rewrite, pure and synchronous, no I/O |
| `public/holding.html` | new — self-contained |
| `scripts/verify-holding.sh` | new — both-arms verification |

No existing file is modified.

---

## 4. Verification

This repo has **zero test files, no test runner, and no CI** — `package.json` defines only
`build` and `lint`. Verification is therefore a script that is run and observed, not a
suite that runs itself. Adding a test framework and edge-runtime harness for one middleware
file is disproportionate; a script with real arms is not.

`scripts/verify-holding.sh` **starts its own `next dev` on an ephemeral port, waits for
readiness, runs every arm, and tears the server down** — so it is repeatable and does not
depend on a server someone remembered to start. It exits non-zero if any arm fails.

Arms are scored on **sentinel strings**, never on status code alone — a 200 is returned in
both the rewritten and non-rewritten cases, so status cannot distinguish them:

- `HOLDING_SENTINEL` = `Something is coming.` (present only in `holding.html`)
- `SITE_SENTINEL` = a string unique to the real pricing page, read from
  `src/app/kuju-email/pricing/page.tsx` at authoring time

| # | Request | Must contain | Must NOT contain |
| --- | --- | --- | --- |
| 1 | `Host: kaimoku.tech` → `/` | `HOLDING_SENTINEL` | — |
| 2 | `Host: kaimoku.tech` → `/kuju-email/pricing` | `HOLDING_SENTINEL` | `SITE_SENTINEL` |
| 3 | `Host: www.kaimoku.tech` → `/` | `HOLDING_SENTINEL` | — |
| 4 | **`Host: kaimoku-website.vercel.app` → `/kuju-email/pricing`** | **`SITE_SENTINEL`** | **`HOLDING_SENTINEL`** |
| 5 | `Host: kaimoku.tech` → `/robots.txt` | `Disallow: /` | `HOLDING_SENTINEL` |

Arm 4 is the one that catches the genuinely bad outcome — the full site leaking onto the
brand domain. Arms 2 and 4 are deliberate mirror images: each asserts both the presence of
what belongs and the **absence** of the other page, so a middleware that rewrote everything
or nothing fails in one direction or the other.

**Falsifiability is a separate, manual, observed step**, not an arm of the script — a check
nobody has watched fail is not evidence, and an unwired script is indistinguishable from a
passing one:

1. Change the host constant in `src/middleware.ts` to a bogus value.
2. Run `scripts/verify-holding.sh`. It **must exit non-zero**, failing arms 1-3.
3. Revert.

The observed non-zero exit is pasted into the issue on close. Demonstrated, not asserted.

**Verify in passing that `next dev` honours a spoofed `Host` header for `has`-matcher
evaluation.** If it does not, the whole local verification story is invalid and the arms
must move to a preview deployment instead — establish this early, not after writing the
script.

**Note for the implementation plan:** a worktree has no `node_modules` (gitignored), so
`npm install` is required there before `next dev` will run.

---

## 5. Go-live: out of scope, and deliberately so

**The middleware is inert until the domain is attached.** It branches on the `Host` header,
and while `kaimoku.tech` has no web records and is not attached to the Vercel project, no
request ever arrives bearing that host. The code can merge to `main`, deploy, and do
nothing.

That decouples the code from the posture change. Going live is then two manual actions,
neither of which this work performs:

1. Attach `kaimoku.tech` and `www.kaimoku.tech` to the Vercel project (`kaimoku-llc` scope).
2. Add the Cloudflare `A`/`CNAME` records.

**Neither can be automated from this workspace.** `providers/cloudflare/api-token` is
zone-scoped to `kuju.email` only; the token that would cover `kaimoku.tech` is
`providers/cloudflare/api`, an unpopulated placeholder (`github-5whtf`). That issue is
*related, not blocking* — the holding page ships without it.

**Revert** is deleting the DNS record. No deploy, no rollback, no code change.

### Stealth

Memory `feedback_kaimoku_stealth` (2026-05-11) instructs that pointing `kaimoku.tech` at
Vercel must not be *proposed*; its stated revisit trigger is explicit go-live language from
the user. The user requested this work directly on 2026-09-01, which is that trigger. The
memory is to be updated when this ships, so it reflects the narrowed posture — brand domain
serves a company-only holding page; the product site remains dark — rather than being
silently contradicted.

---

## 6. Out of scope

- Vercel domain attachment and Cloudflare records (Section 5).
- Flipping the crawl block (`launch-1.14`) or any change to `robots.ts` / `layout.tsx`.
- Any mention of Kuju Email, pricing, or product on the holding page.
- Redirecting `www` to apex, or vice versa — both serve the page directly; a hop buys
  nothing here.
- Full custom-domain mapping of the real site (`github-j3x`, deferred). This is a narrower
  slice, not that work.

## 7. Success criteria

1. The branch adds exactly four files — `src/middleware.ts`, `public/holding.html`,
   `scripts/verify-holding.sh` and this spec — and **modifies none**. Confirmed by
   `git diff --name-status main...HEAD`: every line must begin `A`, none `M` or `D`.
2. All **five** arms in Section 4 pass, and the **separate** falsifiability step has been
   **observed failing** under mutation — not asserted to. (Falsifiability is deliberately
   not an arm of the script: a script cannot assert its own ability to fail.)
3. `npm run build` and `npm run lint` both pass.
4. `public/holding.html` contains **no `<script>` and no `/_next/` reference** — the
   load-bearing property, since the `/_next/` independence is what permits a catch-all
   matcher. The **only** permitted external reference is the Google Fonts stylesheet for
   Cormorant Garamond (`fonts.googleapis.com` / `fonts.gstatic.com`), which does not touch
   the rewritten host and so does not weaken that property. Grep-checkable in both
   directions: zero matches for `<script` and `/_next/`; at most the two font hosts.
5. After merge, `https://kaimoku-website.vercel.app/` is functionally unaffected — the full
   site serves, `robots.txt` still returns `Disallow: /`, and the homepage still carries
   `noindex`. ("Byte-for-byte" is not the criterion: build output is content-hashed and
   moves on every deploy regardless of this change.)
6. `https://kaimoku-website.vercel.app/holding.html` is directly reachable (it is a public
   file) and this is accepted — it is unindexed and reveals only the company mark.
