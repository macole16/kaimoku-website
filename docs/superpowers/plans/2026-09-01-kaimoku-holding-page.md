# kaimoku.tech Holding Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve a company-only holding page on `kaimoku.tech` and `www.kaimoku.tech` via host-matching Next.js middleware, without modifying any existing file.

**Architecture:** Middleware matches on the `Host` header and rewrites every path to a self-contained `public/holding.html`. Because that file has no `/_next/` dependency, the rewrite can be catch-all — so the site's JS bundles are not fetchable on the brand domain either. The matcher is host-scoped via `has` conditions so the middleware does not execute for other hosts at all. The middleware is **inert** until the domain is attached in Vercel and DNS records are added, neither of which is in scope.

**Tech Stack:** Next.js 16.1.7 (App Router), React 19.2.3, TypeScript (`strict: true`), Node 22.11.0 (pinned in `.mise.toml`), bash + curl for verification. No test framework — see Global Constraints.

**Spec:** `docs/superpowers/specs/2026-09-01-kaimoku-holding-page-design.md`

**Issue:** bd `github-wwkxc`

## Global Constraints

- **No existing tracked file may be modified.** The branch adds exactly four files (three below + the spec) and modifies none. `git diff --name-status main...HEAD` must show only `A` lines.
- **The page names no product.** No mention of Kuju Email, pricing, or what Kaimoku builds. Company only: mark, wordmark, one line, contact.
- **Not indexed.** `robots.ts` and `layout.tsx` are NOT touched. The page carries its own `<meta name="robots" content="noindex,nofollow">`.
- **Colours are exact:** ink `#0E0E0E`, orange `#B8421E`. From `src/components/Logo.tsx`, Round-07, spec-locked.
- **Font:** Cormorant Garamond 400 — matches `layout.tsx`, which loads `Cormorant_Garamond({ subsets: ["latin"], weight: ["400"], display: "swap" })`.
- **No test framework may be added.** `package.json` defines only `build` and `lint`; verification is `scripts/verify-holding.sh`.
- **Sentinels** used by the verification script:
  - `HOLDING_SENTINEL` = `Something is coming.`
  - `SITE_SENTINEL` = `For individuals and families. Full email platform with AI.` (verified 2026-09-01 to appear exactly once in the repo, in `src/app/kuju-email/pricing/page.tsx`)
- **Work happens in the worktree** `/Users/macole/github/kaimoku-website/.claude/worktrees/holding-page` on branch `feat/wwkxc-holding-page`. Run `bd` against `/Users/macole/github/.beads`, never a worktree copy.

## File Structure

| File | Responsibility |
| --- | --- |
| `public/holding.html` | The entire page. Self-contained: inline CSS, inline SVG, no script, no `/_next/`. Sole external reference is the Google Fonts stylesheet. |
| `src/middleware.ts` | Host check and rewrite. Pure, synchronous, no I/O. Holds the host list and the passthrough list. |
| `scripts/verify-holding.sh` | Boots its own dev server, runs six arms, tears down, exits non-zero on any failure. |

---

### Task 1: De-risk the Host-header assumption (GATE)

The whole verification strategy assumes `next dev` honours a spoofed `Host` header when evaluating `has`-matcher conditions. **This is unverified.** If it does not hold, the arms must move to a Vercel preview deployment and Tasks 3-5 change shape. Establish it before writing anything real.

**Files:**
- Create (throwaway, deleted in this task): `src/middleware.ts`

**Interfaces:**
- Consumes: nothing
- Produces: a recorded yes/no answer. No committed artifact.

- [ ] **Step 1: Install dependencies in the worktree**

A worktree has no `node_modules` — it is gitignored, so it does not come across.

```bash
cd /Users/macole/github/kaimoku-website/.claude/worktrees/holding-page
npm install
```

- [ ] **Step 2: Write a throwaway probe middleware**

Two questions in one file: does middleware run at all in dev, and is the `has` condition evaluated against the spoofed header?

```ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-probe-ran", "1");
  res.headers.set("x-probe-host", request.headers.get("host") ?? "none");
  return res;
}

export const config = {
  matcher: [{ source: "/:path*", has: [{ type: "host", value: "kaimoku.tech" }] }],
};
```

- [ ] **Step 3: Start the dev server**

```bash
npx next dev -p 3999 > /tmp/task1-probe-dev.log 2>&1 &
DEV_PID=$!
sleep 10
```

Background it. Run in the foreground it blocks, and Step 4 never executes.

- [ ] **Step 4: Run both arms and read the headers**

```bash
# MUST show x-probe-ran: 1
curl -sI -H "Host: kaimoku.tech" http://127.0.0.1:3999/ | grep -i "x-probe-"
# MUST NOT show x-probe-ran at all
curl -sI -H "Host: kaimoku-website.vercel.app" http://127.0.0.1:3999/ | grep -i "x-probe-"
```

Expected: the first prints `x-probe-ran: 1` and `x-probe-host: kaimoku.tech`; the second prints nothing.

- [ ] **Step 5: Decide the gate**

| Observed | Meaning | Action |
| --- | --- | --- |
| arm 1 has header, arm 2 does not | `has` works against the spoofed header | **Proceed to Task 2** |
| both arms have the header | matcher `has` is ignored in dev; middleware runs on everything | **STOP.** Local arms cannot prove host scoping. Re-plan Tasks 3-5 against a Vercel preview deployment and report to the user before continuing. |
| neither arm has the header | middleware not running at all in dev | **STOP.** Investigate file location (`src/middleware.ts` vs `middleware.ts` at repo root) before proceeding. |

- [ ] **Step 6: Delete the probe**

```bash
kill "$DEV_PID"
rm src/middleware.ts
git status --porcelain   # MUST be empty
```

Both matter: the port must be free for Task 2, and the probe file must be gone or Task 4 cannot create `src/middleware.ts` cleanly.

Nothing from this task is committed. It is a spike; its output is an answer.

---

### Task 2: The holding page

**Files:**
- Create: `public/holding.html`

**Interfaces:**
- Consumes: nothing
- Produces: the string `Something is coming.` (`HOLDING_SENTINEL`), relied on by Task 3. Served at path `/holding.html`.

- [ ] **Step 1: Write the page**

Geometry is derived from `src/components/Logo.tsx` at `size=64`: `w=64`, `h=80`, `stroke = max(2, round(80 * 0.044)) = 4`; rect inset by `stroke/2`; orange line at `h/3 = 26.667`; ink line at `2h/3 = 53.333`.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Kaimoku Technologies</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&display=swap">
<style>
  /* Round-07 brand. The mark geometry below is duplicated from
     src/components/Logo.tsx by deliberate choice -- see the spec,
     "Accepted duplication". Keep the two in step if the mark ever changes. */
  :root { --ink: #0E0E0E; --orange: #B8421E; --paper: #FAFAF8; }
  @media (prefers-color-scheme: dark) {
    :root { --ink: #F4F3EF; --paper: #0E0E0E; }
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem; text-align: center;
  }
  main { display: flex; flex-direction: column; align-items: center; gap: 1.75rem; }
  .wordmark {
    font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
    font-weight: 400;
    font-size: clamp(2.75rem, 12vw, 4.5rem);
    line-height: .85; letter-spacing: -.03em;
    margin: 0; display: inline-flex; align-items: flex-end;
  }
  .divider { width: 3px; height: .7em; background: var(--orange); margin: 0 .08em .18em; }
  .line { margin: 0; font-size: clamp(.95rem, 2.5vw, 1.05rem); letter-spacing: .02em; opacity: .75; }
  a { color: inherit; text-decoration: none; border-bottom: 1px solid var(--orange); padding-bottom: 2px; }
  a:hover { color: var(--orange); }
</style>
</head>
<body>
<main>
  <svg width="64" height="80" viewBox="0 0 64 80" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="60" height="76" stroke="currentColor" stroke-width="4"/>
    <line x1="4" y1="26.667" x2="60" y2="26.667" stroke="#B8421E" stroke-width="4"/>
    <line x1="4" y1="53.333" x2="60" y2="53.333" stroke="currentColor" stroke-width="4"/>
  </svg>
  <h1 class="wordmark" aria-label="Kaimoku"><span>kai</span><span class="divider" aria-hidden="true"></span><span>moku</span></h1>
  <p class="line">Something is coming.</p>
  <p class="line"><a href="mailto:info@kaimoku.tech">info@kaimoku.tech</a></p>
</main>
</body>
</html>
```

- [ ] **Step 2: Verify the constraints that make catch-all safe**

```bash
grep -c "<script" public/holding.html          # MUST print 0
grep -c "/_next/" public/holding.html          # MUST print 0
grep -oE 'https://[a-z.]+' public/holding.html | sort -u
```

Expected: first two print `0`; the third prints only `https://fonts.googleapis.com` and `https://fonts.gstatic.com`.

- [ ] **Step 3: Verify it renders and is reachable as a static file**

```bash
npx next dev -p 3999 > /tmp/task2-dev.log 2>&1 &
DEV_PID=$!
sleep 8
curl -s http://127.0.0.1:3999/holding.html | grep -c "Something is coming."   # MUST print 1
kill "$DEV_PID"
```

Kill the server before leaving this step — Task 3's script binds the same port and will fail to start if one is still listening.

- [ ] **Step 4: Confirm no existing file was touched**

`src/components/Logo.tsx` must **not** be modified — Global Constraints forbid touching existing files, and the diff must be additions only. The pointer comment lives only in `holding.html` (written in Step 1) and in the spec. Confirm:

```bash
git status --porcelain   # MUST show only ?? public/holding.html
```

- [ ] **Step 5: Commit**

```bash
git add public/holding.html
git commit -m "feat: company-only holding page for the brand domain (github-wwkxc)

Self-contained by specification: inline CSS and inline SVG, no script and
no /_next reference, so a catch-all middleware rewrite cannot break it.
Names no product. Carries its own noindex meta as belt-and-braces with the
site-wide robots.txt."
```

---

### Task 3: The verification script (must fail before the middleware exists)

**Files:**
- Create: `scripts/verify-holding.sh`

**Interfaces:**
- Consumes: `HOLDING_SENTINEL` from `public/holding.html` (Task 2); `SITE_SENTINEL` from the existing pricing page.
- Produces: exit 0 when all six arms pass, non-zero otherwise. Used by Tasks 4 and 5. (Arm 6 was added in Task 4's fix round; Task 3 as originally written creates five.)

- [ ] **Step 1: Write the script**

```bash
#!/usr/bin/env bash
# Verifies the kaimoku.tech holding-page middleware.
# Spec: docs/superpowers/specs/2026-09-01-kaimoku-holding-page-design.md section 4.
#
# Starts its own dev server on an ephemeral port and tears it down, so the check
# is repeatable and does not depend on a server someone remembered to start.
#
# Arms are scored on SENTINEL STRINGS, never status codes: both the rewritten and
# non-rewritten cases return 200, so status cannot distinguish them.
set -uo pipefail

HOLDING_SENTINEL="Something is coming."
SITE_SENTINEL="For individuals and families. Full email platform with AI."
PORT="${PORT:-3999}"
BASE="http://127.0.0.1:${PORT}"
FAILS=0
DEV_PID=""

cleanup() {
  if [[ -n "$DEV_PID" ]]; then kill "$DEV_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

echo "starting dev server on ${PORT}..."
npx next dev -p "$PORT" > /tmp/verify-holding-dev.log 2>&1 &
DEV_PID=$!

ready=0
for _ in $(seq 1 90); do
  if curl -sf -o /dev/null "${BASE}/holding.html"; then ready=1; break; fi
  sleep 1
done
if [[ "$ready" -ne 1 ]]; then
  echo "FATAL: dev server never became ready; see /tmp/verify-holding-dev.log"
  exit 2
fi

# arm <name> <host> <path> <must-contain> [<must-NOT-contain>]
arm() {
  local name="$1" host="$2" path="$3" must="$4" mustnot="${5:-}"
  local body
  body="$(curl -s -H "Host: ${host}" "${BASE}${path}")"
  if [[ "$body" != *"$must"* ]]; then
    echo "FAIL  ${name}: expected to contain: ${must}"
    FAILS=$((FAILS + 1)); return
  fi
  if [[ -n "$mustnot" && "$body" == *"$mustnot"* ]]; then
    echo "FAIL  ${name}: expected NOT to contain: ${mustnot}"
    FAILS=$((FAILS + 1)); return
  fi
  echo "PASS  ${name}"
}

arm "1 apex rewrites"       kaimoku.tech               /                     "$HOLDING_SENTINEL"
arm "2 deep path rewrites"  kaimoku.tech               /kuju-email/pricing   "$HOLDING_SENTINEL" "$SITE_SENTINEL"
arm "3 www rewrites"        www.kaimoku.tech           /                     "$HOLDING_SENTINEL"
arm "4 vercel.app UNTOUCHED" kaimoku-website.vercel.app /kuju-email/pricing  "$SITE_SENTINEL"    "$HOLDING_SENTINEL"
arm "5 robots passthrough"  kaimoku.tech               /robots.txt           "Disallow: /"       "$HOLDING_SENTINEL"

echo
if [[ "$FAILS" -gt 0 ]]; then
  echo "${FAILS} arm(s) FAILED"
  exit 1
fi
echo "all 5 arms passed"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/verify-holding.sh
```

- [ ] **Step 3: Run it — it MUST fail**

```bash
./scripts/verify-holding.sh; echo "exit=$?"
```

Expected: arms **1, 2 and 3 FAIL** (no middleware exists, so every host gets the real site). Arms **4 and 5 PASS**: arm 4 because the site is untouched and serves pricing normally, and arm 5 because `robots.ts` already returns `Disallow: /` for every host — it is a **regression guard**, not a discriminating arm, and it is expected to pass both before and after Task 4. Overall `exit=1`.

This is the failing-test state, and arm 4 passing here is meaningful: it shows the script can already tell the two pages apart, so the later all-pass result is not vacuous.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-holding.sh
git commit -m "test: five-arm verification for the holding-page middleware (github-wwkxc)

Scored on sentinel strings rather than status codes, because both the
rewritten and non-rewritten cases return 200. Arms 2 and 4 are mirror
images -- each asserts the presence of one page and the ABSENCE of the
other -- so a middleware that rewrote everything, or nothing, fails in one
direction or the other. Currently fails 4 of 5 by design: the middleware
does not exist yet."
```

---

### Task 4: The middleware

**Files:**
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `/holding.html` served from `public/` (Task 2); `scripts/verify-holding.sh` (Task 3) as its test.
- Produces: `middleware(request: NextRequest): NextResponse` and a `config` export. No other module imports it — Next.js discovers it by convention.

- [ ] **Step 1: Write the middleware**

```ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * Serves a company-only holding page on the brand domain.
 *
 * Spec: docs/superpowers/specs/2026-09-01-kaimoku-holding-page-design.md
 *
 * INERT until kaimoku.tech is attached to the Vercel project and DNS records
 * exist: no request can arrive bearing that host until then.
 *
 * The rewrite is deliberately catch-all. holding.html has no /_next dependency,
 * so nothing breaks -- and it means the site's JS bundles are not fetchable on
 * the brand domain either.
 */
const HOLDING_HOSTS = new Set(["kaimoku.tech", "www.kaimoku.tech"]);

const HOLDING_FILE = "/holding.html";

/**
 * /robots.txt is excluded because a catch-all would return HTML where
 * robots.txt belongs, and crawlers treat an unparseable robots.txt as
 * ALLOW-ALL -- silently undoing the not-indexed decision. Serving the real
 * disallow-all is belt-and-braces with the noindex meta tag in the page.
 * /favicon.ico is excluded so the brand favicon renders in the tab.
 */
const PASSTHROUGH = new Set(["/robots.txt", "/favicon.ico", HOLDING_FILE]);

export function middleware(request: NextRequest) {
  // Strip any :port before comparing; a Host header may carry one.
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // The matcher below should already have excluded other hosts. This check is
  // the guarantee; the matcher is the optimisation. Correctness must not depend
  // on `has`-matcher semantics being what the author believed.
  if (!HOLDING_HOSTS.has(host)) return NextResponse.next();
  if (PASSTHROUGH.has(request.nextUrl.pathname)) return NextResponse.next();

  return NextResponse.rewrite(new URL(HOLDING_FILE, request.url));
}

/**
 * Host-scoped so the middleware does not execute for other hosts AT ALL. With a
 * bare catch-all it would run on every vercel.app request merely to call next(),
 * and a runtime throw would then 500 the entire site.
 */
export const config = {
  matcher: [
    { source: "/:path*", has: [{ type: "host", value: "kaimoku.tech" }] },
    { source: "/:path*", has: [{ type: "host", value: "www.kaimoku.tech" }] },
  ],
};
```

- [ ] **Step 2: Run the verification — all six arms MUST pass**

```bash
./scripts/verify-holding.sh; echo "exit=$?"
```

Expected: `PASS` on all six, `all 6 arms passed`, `exit=0`.

- [ ] **Step 3: Confirm no existing file was touched**

```bash
git diff --name-status main...HEAD
git status --porcelain
```

Expected: every line of the first command begins with `A`; none begins with `M` or `D`. Second command shows only `?? src/middleware.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: host-matching middleware serving the holding page (github-wwkxc)

Rewrites every path on kaimoku.tech and www to public/holding.html. Inert
until the domain is attached in Vercel and DNS records exist.

The matcher is host-scoped via has-conditions so this does not execute for
other hosts at all; an in-code host check backs it, so correctness does not
depend on matcher semantics. /robots.txt is passed through because a
catch-all would return HTML where robots.txt belongs, and crawlers read an
unparseable robots.txt as allow-all.

All five verification arms pass."
```

---

### Task 5: Falsifiability, lint, and build

A green check nobody has watched fail is not evidence. An unwired script and a passing one are indistinguishable from outside.

**Files:**
- Modify (temporarily, reverted within this task): `src/middleware.ts`

**Interfaces:**
- Consumes: everything from Tasks 2-4.
- Produces: observed evidence pasted into the bd issue. No committed code change.

- [ ] **Step 1: Mutate the host constant**

```bash
sed -i '' 's/"kaimoku\.tech", "www\.kaimoku\.tech"/"mutant.invalid", "www.mutant.invalid"/' src/middleware.ts
grep -n "mutant.invalid" src/middleware.ts   # confirm the mutation landed
```

- [ ] **Step 2: Run the verification — it MUST fail**

```bash
./scripts/verify-holding.sh; echo "exit=$?"
```

Expected: arms 1, 2, 3 **and 6 FAIL**; `exit=1`. Arm 6 is a rewrite arm like 1-3, so mutating the host constant must break it too — if arm 6 still passes while 1-3 fail, something is wrong and you should stop. Arms 4 and 5 still pass (arm 4 asserts the untouched site; arm 5's robots.txt is host-independent). **Capture this output verbatim** — it is the evidence that the script can fail, and it goes into the issue on close.

If it exits 0, **STOP**: the script is not testing what it claims and must be fixed before anything merges.

- [ ] **Step 3: Revert the mutation and re-confirm green**

```bash
git checkout -- src/middleware.ts
grep -c "mutant.invalid" src/middleware.ts   # MUST print 0
./scripts/verify-holding.sh; echo "exit=$?"  # MUST be exit=0, all 5 pass
```

Note `git checkout --` reverts from the index, so this is only safe because Task 4 Step 4 committed the file.

- [ ] **Step 4: Lint and build**

```bash
npm run lint
npm run build
```

Both must pass. The build is the deploy gate on Vercel, so a failure here would block the deploy.

- [ ] **Step 5: Record the evidence on the issue**

```bash
cd /Users/macole/github
bd note github-wwkxc "VERIFICATION OBSERVED <date>: all 5 arms pass; mutation of the host constant produced exit=1 failing arms 1-3 (paste output); revert restored exit=0; npm run lint and npm run build both pass."
```

Nothing is committed in this task.

---

### Task 6: Merge and hand off

**Files:** none created or modified.

**Interfaces:**
- Consumes: the completed branch.
- Produces: `feat/wwkxc-holding-page` merged to `main` and pushed; worktree removed.

- [ ] **Step 1: Merge to main from the MAIN checkout**

The worktree cannot check out `main` (it is checked out elsewhere).

```bash
cd /Users/macole/github/kaimoku-website
git checkout main
git merge --no-ff feat/wwkxc-holding-page
```

- [ ] **Step 2: Push to GitHub — this triggers a Vercel production deploy**

Say "push to GitHub", never "push to Vercel". `origin` for this repo is GitHub directly; the deploy is a downstream consequence.

```bash
git push origin main
git status   # MUST show "up to date with origin/main"
```

- [ ] **Step 3: Verify the deploy changed nothing user-visible**

Vercel deploys are async; wait 60-90s before asserting anything.

```bash
sleep 90
curl -s https://kaimoku-website.vercel.app/ | grep -c "Kaimoku"          # site still serves
curl -s https://kaimoku-website.vercel.app/robots.txt                     # MUST still be Disallow: /
curl -s https://kaimoku-website.vercel.app/holding.html | grep -c "Something is coming."  # 1
curl -sI https://kaimoku-website.vercel.app/kuju-email/pricing | head -1  # MUST be 200
```

The middleware is inert: `kaimoku.tech` still does not resolve, so nothing on the live site changes.

- [ ] **Step 4: Tear down the worktree by hand**

`ExitWorktree` cannot remove a per-project worktree entered by path — it refuses on ownership. Use git directly.

```bash
git -C /Users/macole/github/kaimoku-website worktree remove .claude/worktrees/holding-page
git -C /Users/macole/github/kaimoku-website branch -d feat/wwkxc-holding-page
git -C /Users/macole/github/kaimoku-website worktree list   # only the main checkout remains
```

`branch -d` (not `-D`) is the safety net: it refuses if the branch is not merged.

- [ ] **Step 5: Update the stealth memory**

`feedback_kaimoku_stealth` currently says never to propose pointing `kaimoku.tech` at Vercel. That is now partly superseded: the user requested this directly. Update it to record the narrowed posture — brand domain may serve a company-only holding page; the product site stays dark and unindexed — rather than leaving it silently contradicted.

- [ ] **Step 6: Hand the go-live steps to the user and close**

These are the user's to perform, whenever they choose:

1. Vercel dashboard (`kaimoku-llc` scope) -> `kaimoku-website` -> Domains -> add `kaimoku.tech` and `www.kaimoku.tech`.
2. Cloudflare -> `kaimoku.tech` zone -> add the `A`/`CNAME` records Vercel specifies. **Do not touch `MX` or the SPF `TXT` record** — `info@kaimoku.tech` receives mail through them.
3. Verify: `dig +short kaimoku.tech` returns records, then `curl -s https://kaimoku.tech/ | grep "Something is coming."` and `curl -sI https://kaimoku.tech/kuju-email/pricing` returns the holding page, not pricing.

Revert at any time by deleting the DNS record. No deploy needed.

```bash
cd /Users/macole/github
bd close github-wwkxc --reason="Middleware and holding page merged and deployed inert. Go-live handed to the user: Vercel domain attach + Cloudflare records."
bin/loom release github-wwkxc
```
