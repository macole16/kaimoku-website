# Agent-Friendly Docs Corpus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static, instruct-only markdown corpus on `kaimoku-website` that a customer's AI agent can execute to walk them through Kuju Email invite redemption, DNS delegation, mailbox migration and delivery troubleshooting, with a build gate that makes stale or unsafe content unshippable and a scheduled live check that reports drift.

**Architecture:** Five hand-authored runbooks in `src/content/agent/` share every volatile value with the site through one file, `src/data/mail-facts.yaml`, via `{{fact:...}}` placeholders resolved at build time. A plain-ESM core (`src/lib/agent-corpus-core.mjs`) does all parsing, interpolation and validation; a typed facade (`src/lib/agent-corpus.ts`) exposes it to Next.js route handlers (`dynamic = "force-static"`) that serve `/llms.txt`, `/llms-full.txt`, `/kuju-email/agent/<slug>.md` and two generated twins. The same core powers `scripts/check-corpus.mjs`, wired as `prebuild` so a bad corpus fails `npm run build` on Vercel; `scripts/check-facts-live.mjs` runs daily from a systemd timer on `build`, self-tests with two mutants before every real check, and reports over ntfy.

**Tech Stack:** Next.js 16.1.7 (App Router, route handlers), React 19.2.3, TypeScript 5 (`strict`, `allowJs`), `yaml@^2.8.3` (already a dependency), Node 22.11.0 via `mise exec --` on the laptop, `/usr/bin/node` v22.22.2 on `build`, bash + curl harnesses (no test framework). systemd oneshot + timer on `build`. ntfy at `https://ntfy.tail3558e0.ts.net`.

**Spec:** docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md

**Issue:** bd `launch-1.8`

## Global Constraints

- Corpus is **static and instruct-only**: no credentials, no auth, no write operations, no live API.
- Every command in the corpus is **read-only** (`dig`, `curl -sI`, `openssl s_client`), enforced mechanically by the Tier 1 denylist (Task 8), not by authorial discipline.
- **Two placeholder syntaxes, deliberately different:** `{{fact:...}}` resolves at BUILD time from `src/data/mail-facts.yaml`; `<domain>` stays literal for the agent to fill at RUN time. **An unknown `{{fact:...}}` MUST fail the build.** A third, confusable form exists upstream — `{domain}` (single braces) inside registrar URLs mirrored verbatim from `registrar.go` — and is rewritten to `<domain>` on emission; Tier 1 rejects any single-brace token that survives into a rendered runbook.
- **Absolute URLs come from `SITE_URL` = `https://kaimoku-website.vercel.app`**, lifted from `src/app/layout.tsx:32` into `src/lib/constants.ts` (Task 1). `kaimoku.tech` is NOT the base — it does not resolve at all as of 2026-09-01. No second constant is minted.
- **Document the promise, never the knob:** contractual claims are documented; operational knobs (`daily_send_limit`, `quota_bytes`, the DKIM selector, which rotates as `mail-YYYYMMDD`) are NOT. Runbooks teach the agent to interpret a limit when it is hit.
- **No `/kuju-email/guide.md`.** The guide stays human-only.
- `signup_url` ships `pending: true` and fails its own check by design until `launch-1.5`. The live checker must ALSO fail when a `pending` fact starts passing.
- **`signup-trial.md` documents INVITE REDEMPTION, never open self-serve signup:** one secret rendered two ways (clickable link + human-typeable code like `KUJU-7F3K-9QM2`, `beta-1.3`), then a flow choice between a demo-domain mailbox and bring-your-own-domain (`beta-1.4`). It neither states nor infers a plan tier (`beta-1.5`).
- **`migration.md` carries the estimator AND the cap together:** IMAP `RFC822.SIZE` dry run, metadata only (`beta-1.6`), with its two caveats (Gmail virtual folders double-count 2-3x unless counting `[Gmail]/All Mail` alone; `RFC822.SIZE` is WIRE size, not disk size); and the **2 GB per-account cap** (`beta-1.10`) framed as a **PAUSE, not a failure and not a restart** — checkpoints `last_folder`/`last_uid`, seeds `bytes_imported` on resume, dedupes on persisted content keys, so conversion RESUMES the same job. The worker imports newest-first, so the cap is described in TIME using the estimator ("your mailbox is 18 GB; the test brings your most recent 2 GB, roughly your last 5 months"), never as a bare byte count.
- The **registrar map is deliberately duplicated** from `kuju-mail/internal/api/registrar.go`. It has **11 keys, 10 with a panel URL** (the spec's "seven" is stale; see "Spec corrections applied"). Do NOT build cross-repo sharing.
- **Registrar matching is a SUBSTRING test on the FIRST nameserver host**, lowercased, trailing dot stripped (`registrar.go:39-42` uses `strings.Contains`). `awsdns` and `azure-dns` are infixes — a suffix match misses AWS and Azure.
- **The `NS kuju.email` check is deliberately NOT used.** `kuju.email`'s own zone is hosted at Cloudflare (`irma.ns.cloudflare.com.` / `james.ns.cloudflare.com.`); `ns1/ns2.kuju.email` are the delegation targets OFFERED TO CUSTOMERS. Asserting `NS kuju.email` contains `ns1.kuju.email` would be a permanent false failure. The live check is "A record of each nameserver is non-empty".
- **Stealth is in force**: the corpus ships DARK. `src/app/robots.ts` and the `noindex` metadata in `src/app/layout.tsx` are NOT touched (`launch-1.14`).
- **No test framework is added.** Verification is `scripts/corpus-selftest.mjs` (node:assert, exits non-zero) plus `scripts/verify-corpus.sh` (bash harness in the `scripts/verify-holding.sh` shape: `set -uo pipefail`, `arm()`, `FAILS` counter, PASS/FAIL per arm, scored on sentinel strings, non-zero exit when `FAILS > 0`).
- **Every node invocation a human runs on the laptop is `mise exec -- node ...` / `mise exec -- npx ...` / `mise exec -- npm ...`.** The shell's node is 26.7.0; `.mise.toml` pins 22.11.0. On `build` there is no mise: units use `/usr/bin/node` (v22.22.2).
- **Vercel runs `npm run build`**, not bare `next build` — Vercel's docs (configure-a-build, checked 2026-09-01): "Vercel checks for the `build` command in `scripts` and uses this to build the project." So the `prebuild` script fires on every deploy and no `vercel.json` change is needed.
- **Push `origin` (GitHub) only; pushing `main` triggers a Vercel production deploy.** Say "push to GitHub", never "push to Vercel". Verify at `https://kaimoku-website.vercel.app/` after ~60-90 s; poll before asserting.
- Use `git -C /Users/macole/github/kaimoku-website ...`, never ambient `cd`. Quote every glob-shaped argument (zsh `nomatch`).
- `bd` runs against `/Users/macole/github/.beads` only (`cd /Users/macole/github` or `export BEADS_DIR=/Users/macole/github/.beads`).

## Scope decision: Tiers 1-3 in this plan; Tier 4 is Phase 2

**In this plan:** Tier 1 (build gate), Tier 2 (systemd timer on `build`, canonical source in this repo at `deploy/systemd/`), Tier 3 (the two mutants, which run inside Tier 2's script). Tier 2 stays in scope because (a) its artifacts — `scripts/check-facts-live.mjs`, the unit files, the install README — live in *this* repo and are tested here; (b) success criterion 5 (mutants demonstrated) is the same script; (c) success criterion 6 (an observed timer run delivering via ntfy) is a stated acceptance for `launch-1.8`. The host install is a deploy step of this repo, exactly as `kuju-mail/deploy/systemd/` is for `kuju-cert-sync`.

**Phase 2, NOT in this plan:** Tier 4 (corpus freshness as an `audit-infra` check). Measured 2026-09-01: the audit sweep is a **Go program** in a different repo — `kaimoku-lens/internal/audit/check_*.go`, registered in `run.go:38-41`, with its own `_test.go` per check, driven unattended by `bin/audit-infra.sh` via launchd. Adding a check means Go code, Go tests, a Forgejo push and a different reviewer; and the only signal it can consume (the Tier 2 heartbeat topic) does not exist until Task 14 of this plan has had at least one observed run. Task 15 files it as a bd issue with the complete design (check id, object, fingerprint, poll URL, severity) so Phase 2 has zero design work left. **The executor is done when Task 15 closes `launch-1.8`; Tier 4 is tracked, not owed.**

## Checked non-issues (do not re-investigate)

- **`src/middleware.ts` will not intercept the new routes.** It is host-scoped by four literal `has` matchers to `kaimoku.tech` / `www.kaimoku.tech` (plus trailing-dot forms); on the `vercel.app` host the middleware never executes. Not modified.
- **`src/app/robots.ts`** returns disallow-all for `*`. Not modified (`launch-1.14`).
- **`next.config.ts`** only defines `redirects()` for `/privacy` and `/terms`. Not modified.
- **`vercel.json`** carries only host-based redirects for `kuju.email` → `www.kaimoku.tech`. Not modified; no `buildCommand` needed (see Global Constraints).
- **A folder literally named `llms.txt` or `glossary.md` is a static route segment**, the standard Next.js pattern for non-HTML routes (`app/rss.xml/route.ts` in the official docs). The `.md` runbooks use a dynamic segment whose *value* carries the suffix (`[file]` = `dns-delegation.md`).
- **`package-lock.json` exists**, so `npm ci` works in a worktree and `npm install --omit=dev` is deterministic on `build`.
- **`build` has `/usr/bin/node` v22.22.2, `/usr/bin/npm` 10.9.7, `git` 2.43, `curl`, `dig`; `/opt/<repo>` owned by `macole` is the convention** (`/opt/renovate`, `/opt/kuju-build-agent`, `/opt/kuju-mail`); units are root-owned in `/etc/systemd/system` with `User=macole`, `Type=oneshot`. `https://ntfy.tail3558e0.ts.net/v1/health` answers 200 from `build`; `git ls-remote https://github.com/macole16/kaimoku-website.git` works anonymously from `build` (the repo is public).

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/constants.ts` (modify) | Adds `export const SITE_URL`. The ONE absolute-URL base for the site and the corpus. |
| `src/app/layout.tsx` (modify `:32`) | Imports `SITE_URL` from constants instead of defining it. |
| `src/data/mail-facts.yaml` (create) | Single source for every volatile value; each entry carries its `verify:` intent; `pending:` marks known-divergent facts. |
| `src/lib/agent-corpus-core.mjs` (create) | ALL corpus logic, plain ESM, no Next imports: front-matter, fact resolution, interpolation, `{domain}`→`<domain>` normalisation, registrar table, denylist scan, link extraction, runbook loading, index, `llms.txt` / `llms-full.txt` rendering. Shared by the site build AND the check script so they cannot drift. |
| `src/lib/agent-corpus.ts` (create) | Typed facade over the core for Next.js: `buildCorpusIndex()`, `renderLlmsTxt()`, `renderLlmsFullTxt()`, plus the two TS-only generated twins `renderGlossaryMarkdown()` and `renderApiDocsMarkdown()`. |
| `src/content/agent/{dns-delegation,troubleshooting-delivery,migration,signup-trial,start-here}.md` (create) | The five runbooks. Markdown + YAML front-matter. |
| `src/app/kuju-email/agent/[file]/route.ts` (create) | Serves one runbook as `text/markdown`; prerendered via `generateStaticParams`; `dynamicParams = false`. |
| `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts` (create) | Generated index / flattened corpus, `text/plain`. |
| `src/app/kuju-email/glossary.md/route.ts`, `src/app/kuju-email/docs.md/route.ts` (create) | Generated twins of the glossary and API docs pages. |
| `src/app/kuju-email/agent/page.tsx` (create) | Human landing page: "hand this to your agent", copy buttons, links. |
| `src/components/agent/CopyButton.tsx` (create) | The only client component: copies a string to the clipboard. |
| `scripts/corpus-selftest.mjs` (create) | node:assert unit checks over the core; must-deny AND must-allow denylist rows. Exits non-zero on any failure. |
| `scripts/verify-corpus.sh` (create) | Bash harness: selftest arm, mutation arms against `check-corpus.mjs` on a scratch copy, server arms (build + start + curl headers). |
| `scripts/check-corpus.mjs` (create) | Tier 1 gate. Offline. Wired as `prebuild`. |
| `package.json` (modify) | Adds `"prebuild": "node scripts/check-corpus.mjs"` and `"verify:corpus"`. |
| `scripts/check-facts-live.mjs` (create) | Tier 2 live checker + Tier 3 self-test mutants + ntfy reporting. No dependency beyond `yaml`. |
| `deploy/systemd/kaimoku-website-facts-check.service`, `.timer`, `README.md` (create) | Canonical, repo-tracked unit files and install steps for `build`. |
| `SERVICES.md` (meta-workspace, modify) | Service Catalog row for the timer. Separate commit at the meta tier (commit-only, no remote). |

---

### Task 0: Workspace setup (no deliverable; do before Task 1)

- [ ] **Step 1: Find the branch that carries the spec**

```bash
git -C /Users/macole/github/kaimoku-website branch --show-current
git -C /Users/macole/github/kaimoku-website log --oneline -3
git -C /Users/macole/github/kaimoku-website branch --list 'docs/launch-1.8*'
```

**The spec branch is GONE — base on `main`.** `docs/launch-1.8-agent-docs-spec` was merged (merge commit `fe3e6cc`) and deleted after the plan's first draft was written; `git branch -a --list 'docs/launch-1.8*'` is empty both locally and on `origin`. Match on `docs/launch-1.8*`, NOT `*launch-1.8*`: the latter also matches this plan's own work branch `feat/launch-1.8-agent-docs` and turns the check into a false positive the moment Task 0 Step 2 has run. Verified 2026-09-01: `git merge-base --is-ancestor 8c08894 main` succeeds, so the spec (and this plan's source of truth) is already reachable from `main`. Branching from the deleted name fails with `fatal: invalid reference`. Expected output above: `main`, and an EMPTY `docs/launch-1.8*` list. If that list is NOT empty, someone recreated the spec branch — stop and reconcile before continuing. (Executed 2026-09-01: main was at `fc0ad23`, the merge that brought this plan onto main; `fe3e6cc` is its parent, the earlier spec merge.)

- [ ] **Step 2: Create the per-project worktree by hand, then enter it**

`EnterWorktree({name})` worktrees the *session root* (the meta-workspace), so a per-project worktree is created with git and entered by path:

```bash
git -C /Users/macole/github/kaimoku-website worktree add .claude/worktrees/agent-docs -b feat/launch-1.8-agent-docs main
```

Then `EnterWorktree({ path: "/Users/macole/github/kaimoku-website/.claude/worktrees/agent-docs" })`. Teardown at the end is by hand (`git worktree remove` + `branch -d`), never `ExitWorktree action: "remove"` — a path-entered worktree is not session-owned.

- [ ] **Step 3: Install dependencies in the worktree (node_modules is gitignored)**

```bash
mise exec -- npm ci --prefix /Users/macole/github/kaimoku-website/.claude/worktrees/agent-docs
```

- [ ] **Step 4: Claim the issue**

```bash
cd /Users/macole/github && bin/weft claim launch-1.8
```

Exit 3 means another session holds it — stop.

All paths below are relative to the worktree root `/Users/macole/github/kaimoku-website/.claude/worktrees/agent-docs`, written as `$WT`. Every `git` command below uses `git -C "$WT"`.

---
### Task 1: Lift `SITE_URL` into `src/lib/constants.ts`

**Files:**
- Modify: `src/lib/constants.ts` (append after the `URLS` block)
- Modify: `src/app/layout.tsx:32` (delete the local const; add an import)

**Interfaces:**
- Consumes: nothing
- Produces: `export const SITE_URL: "https://kaimoku-website.vercel.app"` in `src/lib/constants.ts`, imported by every later task that emits an absolute URL.

- [ ] **Step 1: Write the failing check**

The "test" for a constant lift is a grep pair: exactly one definition, in `constants.ts`.

```bash
cd "$WT" && grep -rn 'SITE_URL = ' src
```

Expected now: one hit, `src/app/layout.tsx:32`. The target state is one hit, `src/lib/constants.ts`.

- [ ] **Step 2: Add the export to `src/lib/constants.ts`**

Append after `} as const;` of `URLS` (before `isComingSoon`):

```ts
/**
 * Absolute base for every URL the site emits about itself: metadataBase in
 * layout.tsx, and the agent corpus (llms.txt links out by convention).
 *
 * Deliberately the vercel.app host. kaimoku.tech does NOT resolve at all as of
 * 2026-09-01 (launch-1.1 was closed by UNPOINTING the DNS; re-attaching the
 * branded domain is github-j3x, deferred). Switch this the day the domain is
 * attached and answers 200 — and nowhere else: this is the only definition.
 */
export const SITE_URL = "https://kaimoku-website.vercel.app";
```

- [ ] **Step 3: Replace the local const in `src/app/layout.tsx`**

Delete line 32 (`const SITE_URL = "https://kaimoku-website.vercel.app";`) and add to the imports at the top:

```ts
import { SITE_URL } from "@/lib/constants";
```

Leave the `metadataBase: new URL(SITE_URL)` line and its comment unchanged.

- [ ] **Step 4: Run the check and the type-check**

```bash
cd "$WT" && grep -rn 'SITE_URL = ' src
mise exec -- npx tsc --noEmit -p "$WT/tsconfig.json"
```

Expected: grep prints exactly `src/lib/constants.ts:<n>:export const SITE_URL = "https://kaimoku-website.vercel.app";`; tsc prints nothing and exits 0.

- [ ] **Step 5: Commit**

```bash
git -C "$WT" add src/lib/constants.ts src/app/layout.tsx
git -C "$WT" commit -m "constants: lift SITE_URL out of layout.tsx so the agent corpus reuses it (launch-1.8)"
```

---

### Task 2: `mail-facts.yaml` and the fact-resolution half of the core

**Files:**
- Create: `src/data/mail-facts.yaml`
- Create: `src/lib/agent-corpus-core.mjs` (fact half; Task 3 appends the runbook half)
- Create: `scripts/corpus-selftest.mjs`
- Create: `scripts/verify-corpus.sh` (arm 1 only; later tasks append arms)
- Modify: `package.json` (add `"verify:corpus": "bash scripts/verify-corpus.sh"`)

**Interfaces:**
- Consumes: nothing
- Produces (all from `src/lib/agent-corpus-core.mjs`):
  - `FACT_RE: RegExp` — `/\{\{fact:([^{}]*)\}\}/g`
  - `SINGLE_BRACE_RE: RegExp` — `/(?<!\{)\{[^{}\s]+\}(?!\})/g`
  - `loadFacts(factsPath: string): Facts` — parses YAML; throws if the file is missing
  - `resolveFact(facts: Facts, path: string): string` — scalar leaf or derived view; throws `Error("unknown fact: <path>")` or `Error("fact <path> resolves to a non-scalar; ...")`
  - `renderRegistrarTable(facts: Facts): string` — markdown table, 11 rows, `{domain}` already normalised
  - `normaliseRuntimePlaceholders(text: string): string` — `{domain}` → `<domain>`
  - `interpolate(body: string, facts: Facts): { text: string; used: Set<string> }` — `used` holds TOP-LEVEL fact keys

- [ ] **Step 1: Write the failing selftest**

Create `scripts/corpus-selftest.mjs`:

```js
// Unit checks over src/lib/agent-corpus-core.mjs. No test framework on purpose
// (the repo has none; see scripts/verify-holding.sh for the precedent). Uses
// node:assert; any thrown assertion exits non-zero. Run:
//   mise exec -- node scripts/corpus-selftest.mjs
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const core = await import(path.join(ROOT, "src/lib/agent-corpus-core.mjs"));

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS  ${name}`);
}

const facts = core.loadFacts(path.join(ROOT, "src/data/mail-facts.yaml"));

check("nameservers.0 resolves", () => {
  assert.equal(core.resolveFact(facts, "nameservers.0"), "ns1.kuju.email");
});
check("nameservers.1 resolves", () => {
  assert.equal(core.resolveFact(facts, "nameservers.1"), "ns2.kuju.email");
});
check("mx.priority is stringified", () => {
  assert.equal(core.resolveFact(facts, "mx.priority"), "10");
});
check("dmarc template is emitted with the RUN-time placeholder", () => {
  const v = core.resolveFact(facts, "customer_domain_records.dmarc");
  assert.ok(v.includes("<domain>"), v);
  assert.ok(!v.includes("{domain}"), v);
});
check("unknown fact throws", () => {
  assert.throws(() => core.resolveFact(facts, "nameserver.0"), /unknown fact: nameserver\.0/);
});
check("non-scalar fact throws", () => {
  assert.throws(() => core.resolveFact(facts, "nameservers"), /non-scalar/);
});
check("registrars.table has 11 data rows, the infix keys, and no single braces", () => {
  const t = core.resolveFact(facts, "registrars.table");
  const rows = t.split("\n").filter((l) => l.startsWith("| `"));
  assert.equal(rows.length, 11, t);
  assert.ok(t.includes("`awsdns`") && t.includes("`azure-dns`"), t);
  assert.ok(t.includes("Enom / Tucows") && t.includes("no panel link"), t);
  assert.ok(t.includes("<domain>") && !t.includes("{domain}"), t);
});
check("interpolate replaces and reports top-level keys", () => {
  const r = core.interpolate("a {{fact:nameservers.0}} b {{fact:registrars.table}}", facts);
  assert.ok(r.text.startsWith("a ns1.kuju.email b | "), r.text);
  assert.deepEqual([...r.used].sort(), ["nameservers", "registrars"]);
});
check("interpolate throws on an unknown fact", () => {
  assert.throws(() => core.interpolate("{{fact:mx.targe}}", facts), /unknown fact: mx\.targe/);
});
check("SINGLE_BRACE_RE matches {domain} and %{http_code} but not {{fact:x}}", () => {
  assert.ok("x {domain} y".match(core.SINGLE_BRACE_RE));
  assert.ok("curl -w '%{http_code}'".match(core.SINGLE_BRACE_RE));
  assert.equal("{{fact:nameservers.0}}".match(core.SINGLE_BRACE_RE), null);
});

console.log(`\ncorpus-selftest: ${passed} checks passed`);
```

- [ ] **Step 2: Run it and watch it fail**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: FAIL with `Error: Cannot find module '.../src/lib/agent-corpus-core.mjs'` (exit code 1).

- [ ] **Step 3: Write `src/data/mail-facts.yaml`**

Every value below was measured live on 2026-09-01 (`dig`, `curl`); registrar rows are verbatim from `kuju-mail/internal/api/registrar.go:15-27`.

```yaml
# Single source for every volatile value the agent corpus and the TSX pages
# share. Spec: docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md
# section 2. Every value was measured live on 2026-09-01.
#
# Three placeholder forms, deliberately different:
#   {{fact:path.to.leaf}}  BUILD time — resolved by src/lib/agent-corpus-core.mjs;
#                          an unknown path fails the build.
#   <domain>               RUN time — the customer's agent fills it in.
#   {domain}               UPSTREAM ONLY — mirrors registrar.go verbatim. It is
#                          rewritten to <domain> whenever a value is emitted into
#                          the corpus, and the Tier 1 check rejects any single-brace
#                          token that survives into a rendered runbook.
#
# `verify:` blocks are read by scripts/check-facts-live.mjs (Tier 2). A fact
# without one is unverifiable by this site (spec section 2, "our product config")
# and is reported as SKIP, never silently omitted.
# `pending: true` = known-divergent on purpose; the checker fails if it PASSES.

nameservers:
  value: [ns1.kuju.email, ns2.kuju.email]
  verify: {type: dns, record: A, expect: nonempty}
  # NOT `NS kuju.email contains ns1.kuju.email`. kuju.email's own zone is hosted
  # at Cloudflare (irma.ns.cloudflare.com / james.ns.cloudflare.com); ns1/ns2 are
  # the delegation targets OFFERED TO CUSTOMERS, not the nameservers of
  # kuju.email. That check would be a permanent false failure — the exact thing
  # that trains people to ignore red. Measured 2026-09-01: ns1 -> 96.126.108.161,
  # ns2 -> 172.235.42.202.

mx:
  target: mail.kuju.email
  priority: 10
  verify: {type: dns, name: kuju.email, record: MX, expect_contains: "10 mail.kuju.email."}

customer_domain_records:
  spf: "v=spf1 mx ~all"
  dmarc: "v=DMARC1; p=quarantine; rua=mailto:postmaster@{domain}"
  # The checker resolves TXT <name> for spf and TXT _dmarc.<name> for dmarc, with
  # {domain} substituted by <name>. Measured 2026-09-01 on demo.kuju.email: both exact.
  verify: {type: dns, name: demo.kuju.email, record: TXT}

signup_url:
  value: "https://mail.kuju.email/signup"
  pending: true    # 303 -> https://mail.kuju.email/login until launch-1.5 enables the demo
  verify: {type: http, expect_status: [200]}

test_migration_cap_gb:
  value: 2         # beta-1.10: per-account cap on a TEST migration; a PAUSE, not a failure
  # No verify block: this is product config the website cannot observe.

registrars:
  # Ported verbatim from kuju-mail/internal/api/registrar.go (11 keys, 10 with a
  # panel URL). Accepted duplication (spec section 2). Matching is
  # strings.Contains on the FIRST nameserver host, lowercased, trailing dot
  # stripped — `awsdns` and `azure-dns` are INFIXES, not suffixes.
  #
  # verify: third-party panels are bot-hostile (measured 2026-09-01 with a browser
  # UA: Cloudflare 403, Azure 403, GoDaddy deep link 504 at the Akamai edge,
  # Namecheap 405 on HEAD). So the check is "the URL is still routed": any HTTP
  # response EXCEPT 404/410 passes; a transport failure after one retry fails.
  # An entry with no dns_url is reported as SKIP by name, never dropped.
  verify: {type: http, reject_status: [404, 410], domain_placeholder: example.com}
  registrar-servers.com: {name: Namecheap, dns_url: "https://ap.www.namecheap.com/domains/domaincontrolpanel/{domain}/advancedns"}
  domaincontrol.com:     {name: GoDaddy, dns_url: "https://dcc.godaddy.com/dns/{domain}"}
  cloudflare.com:        {name: Cloudflare, dns_url: "https://dash.cloudflare.com"}
  google.com:            {name: "Google / Squarespace", dns_url: "https://domains.squarespace.com"}
  googledomains.com:     {name: "Google / Squarespace", dns_url: "https://domains.squarespace.com"}
  awsdns:                {name: "AWS Route 53", dns_url: "https://console.aws.amazon.com/route53"}
  azure-dns:             {name: "Microsoft Azure", dns_url: "https://portal.azure.com/#browse/Microsoft.Network%2FdnsZones"}
  digitalocean.com:      {name: DigitalOcean, dns_url: "https://cloud.digitalocean.com/networking/domains/{domain}"}
  linode.com:            {name: "Linode / Akamai", dns_url: "https://cloud.linode.com/domains"}
  hover.com:             {name: Hover, dns_url: "https://www.hover.com/control_panel/domain/{domain}"}
  name-services.com:     {name: "Enom / Tucows"}   # no dns_url upstream either
```

- [ ] **Step 4: Write the fact half of `src/lib/agent-corpus-core.mjs`**

```js
// Agent-corpus core. Plain ESM, no Next.js imports, so the SAME code runs inside
// `next build` (via src/lib/agent-corpus.ts) and inside scripts/check-corpus.mjs.
// One implementation is the point: a checker with its own fact regex is a
// checker that can pass while the site build fails, or the reverse.
//
// Spec: docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

/** BUILD-time placeholder. Braces are excluded from the capture so a stray
 *  `{{fact:a}}}` cannot swallow the next token. */
export const FACT_RE = /\{\{fact:([^{}]*)\}\}/g;

/** Any SINGLE-brace token that is not part of a `{{...}}` pair. Catches the
 *  upstream `{domain}` form and curl's `%{http_code}` — both would read as a
 *  placeholder to an agent and neither is one of ours. */
export const SINGLE_BRACE_RE = /(?<!\{)\{[^{}\s]+\}(?!\})/g;

/** Keys inside a fact object that are metadata, not data. */
const RESERVED_KEYS = new Set(["verify", "pending"]);

/**
 * @param {string} factsPath absolute path to mail-facts.yaml
 * @returns {Record<string, any>}
 */
export function loadFacts(factsPath) {
  const raw = fs.readFileSync(factsPath, "utf-8");
  const parsed = yaml.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`facts file ${factsPath} did not parse to a mapping`);
  }
  return parsed;
}

/** @param {string} text */
export function normaliseRuntimePlaceholders(text) {
  return text.replaceAll("{domain}", "<domain>");
}

/**
 * Registrar rows in insertion order, excluding reserved keys.
 * @param {Record<string, any>} facts
 * @returns {Array<{key: string, name: string, dns_url?: string}>}
 */
export function registrarEntries(facts) {
  const reg = facts.registrars ?? {};
  return Object.entries(reg)
    .filter(([k]) => !RESERVED_KEYS.has(k))
    .map(([key, v]) => ({ key, name: v.name, dns_url: v.dns_url }));
}

/**
 * Markdown table an agent can match against. The key column is the substring
 * to look for in the FIRST nameserver host (lowercased, trailing dot stripped).
 * @param {Record<string, any>} facts
 */
export function renderRegistrarTable(facts) {
  const lines = [
    "| If the first nameserver CONTAINS | Registrar / DNS host | DNS panel |",
    "| --- | --- | --- |",
  ];
  for (const e of registrarEntries(facts)) {
    const panel = e.dns_url
      ? normaliseRuntimePlaceholders(e.dns_url)
      : "no panel link — name the registrar and hand off (HUMAN ACTION)";
    lines.push(`| \`${e.key}\` | ${e.name} | ${panel} |`);
  }
  return lines.join("\n");
}

/** Derived views: paths that are not YAML leaves but are rendered from them. */
const DERIVED = {
  "registrars.table": renderRegistrarTable,
};

/**
 * Resolve `{{fact:path}}` to a string. A path is dot-separated; array indexes
 * are numeric segments (`nameservers.0`). Only scalar leaves and derived views
 * resolve; anything else is an authoring error and must fail the build.
 * @param {Record<string, any>} facts
 * @param {string} factPath
 * @returns {string}
 */
export function resolveFact(facts, factPath) {
  const trimmed = factPath.trim();
  if (Object.hasOwn(DERIVED, trimmed)) return DERIVED[trimmed](facts);
  let node = facts;
  for (const seg of trimmed.split(".")) {
    if (node === null || typeof node !== "object" || !Object.hasOwn(node, seg)) {
      throw new Error(`unknown fact: ${trimmed}`);
    }
    node = node[seg];
  }
  if (node === null || typeof node === "object") {
    throw new Error(
      `fact ${trimmed} resolves to a non-scalar; reference a leaf (e.g. ${trimmed}.0 or ${trimmed}.value) or a derived view (${Object.keys(DERIVED).join(", ")})`,
    );
  }
  return normaliseRuntimePlaceholders(String(node));
}

/**
 * Replace every {{fact:...}} in `body`. Throws on the first unknown fact.
 * `used` is the set of TOP-LEVEL keys touched, for the facts_used check.
 * @param {string} body
 * @param {Record<string, any>} facts
 * @returns {{text: string, used: Set<string>}}
 */
export function interpolate(body, facts) {
  const used = new Set();
  const text = body.replace(FACT_RE, (_m, p) => {
    const value = resolveFact(facts, p);
    used.add(p.trim().split(".")[0]);
    return value;
  });
  return { text, used };
}
```

- [ ] **Step 5: Run the selftest and watch it pass**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: ten `PASS` lines and `corpus-selftest: 10 checks passed`, exit 0.

- [ ] **Step 6: Create the harness skeleton and the npm script**

Create `scripts/verify-corpus.sh`:

```bash
#!/usr/bin/env bash
# Verifies the agent corpus: core selftest, Tier 1 mutation arms, and served
# routes. Spec: docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md
# section 4 (Tier 1) and section 7 (criteria 1-4).
#
# Same shape as scripts/verify-holding.sh: arms are scored on SENTINEL STRINGS,
# never on exit status alone, so an arm that fails to run cannot pass.
# SKIP_SERVER=1 skips the build+serve arms (they take ~90 s).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILS=0

# arm <name> <expected-exit: pass|fail> <must-contain> -- <command...>
# Runs the command, captures stdout+stderr, checks BOTH the exit-code class and
# the sentinel. A "fail" arm passes only when the command exits non-zero AND
# prints the sentinel: exit status without the sentinel could be any crash.
arm() {
  local name="$1" expect="$2" must="$3"; shift 3
  [[ "$1" == "--" ]] && shift
  local out rc
  out="$("$@" 2>&1)"; rc=$?
  if [[ "$expect" == "pass" && "$rc" -ne 0 ]]; then
    echo "FAIL  ${name}: expected exit 0, got ${rc}"; echo "$out" | tail -n 5; FAILS=$((FAILS + 1)); return
  fi
  if [[ "$expect" == "fail" && "$rc" -eq 0 ]]; then
    echo "FAIL  ${name}: expected non-zero exit, got 0"; FAILS=$((FAILS + 1)); return
  fi
  if [[ "$out" != *"$must"* ]]; then
    echo "FAIL  ${name}: expected output to contain: ${must}"; echo "$out" | tail -n 5; FAILS=$((FAILS + 1)); return
  fi
  echo "PASS  ${name}"
}

# mise exec, not a bare node: the shell's node is 26.7.0, .mise.toml pins 22.11.0.
NODE=(mise exec -- node)

arm "1 core selftest" pass "corpus-selftest:" -- "${NODE[@]}" "$ROOT/scripts/corpus-selftest.mjs"

echo
if [[ "$FAILS" -gt 0 ]]; then echo "${FAILS} arm(s) FAILED"; exit 1; fi
echo "all arms passed"
```

Make it executable and add the npm script:

```bash
chmod +x "$WT/scripts/verify-corpus.sh"
```

In `package.json` `scripts`, add after `"brand:generate"`:

```json
    "verify:corpus": "bash scripts/verify-corpus.sh"
```

- [ ] **Step 7: Run the harness**

Run: `cd "$WT" && bash scripts/verify-corpus.sh`
Expected: `PASS  1 core selftest` then `all arms passed`, exit 0.

- [ ] **Step 8: Commit**

```bash
git -C "$WT" add src/data/mail-facts.yaml src/lib/agent-corpus-core.mjs scripts/corpus-selftest.mjs scripts/verify-corpus.sh package.json
git -C "$WT" commit -m "agent corpus: facts layer (mail-facts.yaml) and fact resolution core with selftest (launch-1.8)"
```

---
### Task 3: The runbook half of the core (front-matter, denylist, links, index, llms.txt)

**Files:**
- Modify: `src/lib/agent-corpus-core.mjs` (append)
- Modify: `scripts/corpus-selftest.mjs` (append checks)

**Interfaces:**
- Consumes: `FACT_RE`, `SINGLE_BRACE_RE`, `interpolate`, `normaliseRuntimePlaceholders` (Task 2)
- Produces (all from `src/lib/agent-corpus-core.mjs`):
  - `RUNBOOK_URL_PREFIX = "/kuju-email/agent/"`
  - `REQUIRED_META = ["slug", "title", "order", "preconditions", "outcome", "facts_used"]`
  - `DENYLIST: Array<{ name: string; re: RegExp }>`
  - `parseFrontMatter(raw: string, filename: string): { meta: RunbookMeta; body: string }` — throws `Error("<filename>: missing front-matter ...")`
  - `extractCodeLines(body: string): Array<{ line: number; text: string }>` — fenced blocks, 4-space-indented lines, inline code spans
  - `scanDenylist(body: string): Array<{ line: number; name: string; text: string }>`
  - `extractInternalLinks(body: string): string[]` — root-relative targets, anchors stripped, deduped
  - `loadRunbooks(contentDir: string): Runbook[]` — sorted by `order`; throws on slug/filename mismatch or duplicate order
  - `absolutiseLinks(text: string, siteUrl: string): string`
  - `renderRunbook(runbook: Runbook, facts: Facts, siteUrl: string): RenderedRunbook` — `{ ...meta, markdown, url, used }`
  - `buildIndex(runbooks: Runbook[], facts: Facts, siteUrl: string, reference: ReferenceDoc[]): CorpusIndex` — `{ siteUrl, runbooks: RenderedRunbook[], reference }`
  - `renderLlmsTxt(index: CorpusIndex): string`
  - `renderLlmsFullTxt(index: CorpusIndex, referenceBodies: Record<string, string>): string`

  Shapes: `RunbookMeta = { slug, title, order, preconditions: string[], outcome, facts_used: string[] }`; `Runbook = RunbookMeta & { body, filename }`; `RenderedRunbook = RunbookMeta & { markdown, url, used: string[] }`; `ReferenceDoc = { title, url, description }`.

- [ ] **Step 1: Append the failing checks to `scripts/corpus-selftest.mjs`**

Insert before the final `console.log(...)` line:

```js
check("parseFrontMatter returns meta and body", () => {
  const raw = "---\nslug: x\ntitle: T\norder: 9\npreconditions: [a]\noutcome: o\nfacts_used: []\n---\n\n# body\n";
  const r = core.parseFrontMatter(raw, "x.md");
  assert.equal(r.meta.slug, "x");
  assert.equal(r.meta.order, 9);
  assert.equal(r.body.trim(), "# body");
});
check("parseFrontMatter throws on a missing block and on a missing key", () => {
  assert.throws(() => core.parseFrontMatter("# no front-matter\n", "y.md"), /y\.md: missing front-matter/);
  assert.throws(() => core.parseFrontMatter("---\nslug: y\n---\n", "y.md"), /y\.md: front-matter missing keys: title/);
});
check("extractCodeLines covers fences, indented lines and inline spans", () => {
  const body = "prose\n\n    dig NS <domain>\n\n```\ncurl -sI https://x\n```\n\nRun `openssl s_client` now.\n";
  const texts = core.extractCodeLines(body).map((c) => c.text);
  assert.deepEqual(texts, ["dig NS <domain>", "curl -sI https://x", "openssl s_client"]);
});
const MUST_DENY = [
  "rm -rf ~/.kuju",
  "curl -X POST https://mail.kuju.email/api/login",
  "curl -u me:pw https://mail.kuju.email/api/me",
  "curl --user me:pw https://x",
  "curl -d '{}' https://x",
  "curl --data-binary @- https://x",
  "nsupdate -k key",
  "sudo systemctl restart postfix",
  "echo nameserver > /etc/resolv.conf",
  "curl https://x | sh",
  "ssh admin@mail.kuju.email",
  "kubectl delete pod x",
  "curl -H 'Authorization: Bearer abc' https://x",
  "docker rm x",
];
const MUST_ALLOW = [
  "dig NS <domain> +short",
  "dig TXT _dmarc.<domain> +short @1.1.1.1",
  "nslookup -type=NS <domain>",
  "curl -sI https://mail.kuju.email/signup",
  "openssl s_client -connect imap.gmail.com:993 -brief </dev/null",
  "openssl s_client -connect mail.kuju.email:25 -starttls smtp -brief </dev/null",
  "dig MX <domain> +short 2>/dev/null",
  "dig +trace NS <domain>",
];
check("denylist: every must-deny row is caught", () => {
  for (const cmd of MUST_DENY) {
    const hits = core.scanDenylist("```\n" + cmd + "\n```\n");
    assert.ok(hits.length > 0, `NOT denied: ${cmd}`);
  }
});
check("denylist: every must-allow row is clean", () => {
  for (const cmd of MUST_ALLOW) {
    const hits = core.scanDenylist("```\n" + cmd + "\n```\n");
    assert.equal(hits.length, 0, `wrongly denied: ${cmd} -> ${JSON.stringify(hits)}`);
  }
});
check("denylist ignores prose (only code is executed)", () => {
  assert.equal(core.scanDenylist("Never run rm here; the kill switch is a metaphor.\n").length, 0);
});
check("extractInternalLinks keeps root-relative targets only, strips anchors", () => {
  const body = "[a](/kuju-email/agent/x.md#s1) [b](https://example.com/y) [c](/llms.txt) [a2](/kuju-email/agent/x.md)";
  assert.deepEqual(core.extractInternalLinks(body), ["/kuju-email/agent/x.md", "/llms.txt"]);
});
check("absolutiseLinks rewrites root-relative markdown links", () => {
  const out = core.absolutiseLinks("[a](/kuju-email/agent/x.md) [b](https://e.com/)", "https://site.test");
  assert.equal(out, "[a](https://site.test/kuju-email/agent/x.md) [b](https://e.com/)");
});
check("renderLlmsTxt lists every runbook and reference doc by absolute URL", () => {
  const rb = { slug: "x", title: "X", order: 1, preconditions: [], outcome: "done", facts_used: [], body: "# X\n", filename: "x.md" };
  const idx = core.buildIndex([rb], facts, "https://site.test", [{ title: "G", url: "https://site.test/g.md", description: "g" }]);
  const txt = core.renderLlmsTxt(idx);
  assert.ok(txt.startsWith("# Kuju Email"), txt);
  assert.ok(txt.includes("- [X](https://site.test/kuju-email/agent/x.md): done"), txt);
  assert.ok(txt.includes("- [G](https://site.test/g.md): g"), txt);
  assert.ok(txt.includes("https://site.test/llms-full.txt"), txt);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: the first ten checks PASS, then `TypeError: core.parseFrontMatter is not a function`, exit 1.

- [ ] **Step 3: Append the runbook half to `src/lib/agent-corpus-core.mjs`**

```js
// ---------------------------------------------------------------------------
// Runbooks
// ---------------------------------------------------------------------------

export const RUNBOOK_URL_PREFIX = "/kuju-email/agent/";
export const REQUIRED_META = ["slug", "title", "order", "preconditions", "outcome", "facts_used"];

/**
 * Commands the corpus may never contain. Scanned over CODE only (fences,
 * indented blocks, inline spans) — code is what an agent executes; prose is
 * where "never run rm" legitimately appears. Every row has a must-deny AND a
 * must-allow case in scripts/corpus-selftest.mjs; add both when you add a row.
 */
export const DENYLIST = [
  { name: "rm", re: /(^|[\s;&|(])rm(\s|$)/ },
  { name: "curl write verb", re: /\bcurl\b.*\s-X\s*(POST|PUT|PATCH|DELETE)\b/i },
  { name: "curl upload flag", re: /\bcurl\b.*\s(-d|--data(-\w+)?|-F|--form|-T|--upload-file)(\s|$)/ },
  { name: "credential flag", re: /\s(-u|--user|--password|--token|--api-key)(\s|=)/ },
  { name: "auth header", re: /Authorization:|\bBearer\s+\S+/ },
  { name: "nsupdate", re: /\bnsupdate\b/ },
  { name: "privileged or destructive tool", re: /(^|[\s;&|(])(sudo|doas|dd|mkfs\S*|chmod|chown|kill|killall|pkill|shutdown|reboot|systemctl|launchctl)(\s|$)/ },
  { name: "remote shell or package tool", re: /(^|[\s;&|(])(ssh|scp|sftp|rsync|kubectl|docker|helm|npm|npx|pip3?|brew|apt(-get)?|yum|dnf)(\s|$)/ },
  { name: "file write redirect", re: /(^|\s)[12&]?>>?\s*(?!&[12](\s|$))(?!\/dev\/null(\s|$))\S/ },
  { name: "pipe to shell", re: /\|\s*(sh|bash|zsh|dash|python3?|perl|node)(\s|$)/ },
];

/**
 * @param {string} raw
 * @param {string} filename
 * @returns {{meta: any, body: string}}
 */
export function parseFrontMatter(raw, filename) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${filename}: missing front-matter (expected a leading --- block)`);
  const meta = yaml.parse(m[1]) ?? {};
  const missing = REQUIRED_META.filter((k) => !Object.hasOwn(meta, k));
  if (missing.length) throw new Error(`${filename}: front-matter missing keys: ${missing.join(", ")}`);
  if (!Array.isArray(meta.facts_used) || !Array.isArray(meta.preconditions)) {
    throw new Error(`${filename}: facts_used and preconditions must be lists`);
  }
  if (!Number.isInteger(meta.order)) throw new Error(`${filename}: order must be an integer`);
  return { meta, body: m[2] };
}

/**
 * Every line an agent could execute: lines inside ``` fences, 4-space-indented
 * lines, and inline `code` spans (each span becomes its own entry).
 * @param {string} body
 * @returns {Array<{line: number, text: string}>}
 */
export function extractCodeLines(body) {
  const out = [];
  let inFence = false;
  body.split("\n").forEach((raw, i) => {
    const line = i + 1;
    if (/^\s*```/.test(raw)) { inFence = !inFence; return; }
    if (inFence) { if (raw.trim()) out.push({ line, text: raw.trim() }); return; }
    if (/^ {4,}\S/.test(raw) || /^\t/.test(raw)) { out.push({ line, text: raw.trim() }); return; }
    for (const span of raw.matchAll(/`([^`\n]+)`/g)) out.push({ line, text: span[1].trim() });
  });
  return out;
}

/**
 * @param {string} body
 * @returns {Array<{line: number, name: string, text: string}>}
 */
export function scanDenylist(body) {
  const hits = [];
  for (const c of extractCodeLines(body)) {
    for (const rule of DENYLIST) {
      if (rule.re.test(c.text)) hits.push({ line: c.line, name: rule.name, text: c.text });
    }
  }
  return hits;
}

/**
 * Root-relative link targets (`](/...)`), anchors stripped, deduped, in order.
 * External links are not checked offline.
 * @param {string} body
 * @returns {string[]}
 */
export function extractInternalLinks(body) {
  const seen = new Set();
  for (const m of body.matchAll(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g)) seen.add(m[1]);
  return [...seen];
}

/**
 * @param {string} text
 * @param {string} siteUrl
 */
export function absolutiseLinks(text, siteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  return text.replace(/\]\((\/[^)\s]*)\)/g, (_m, p) => `](${base}${p})`);
}

/**
 * Load every *.md in contentDir. Slug must equal the filename stem; orders must
 * be unique. Anything else is an authoring error that would otherwise vanish
 * from the index silently (the "no orphans" rule).
 * @param {string} contentDir
 */
export function loadRunbooks(contentDir) {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md")).sort();
  if (files.length === 0) throw new Error(`no runbooks found in ${contentDir}`);
  const runbooks = files.map((filename) => {
    const raw = fs.readFileSync(path.join(contentDir, filename), "utf-8");
    const { meta, body } = parseFrontMatter(raw, filename);
    const stem = filename.replace(/\.md$/, "");
    if (meta.slug !== stem) throw new Error(`${filename}: slug "${meta.slug}" must equal the filename stem "${stem}"`);
    return { ...meta, body, filename };
  });
  const orders = new Map();
  for (const r of runbooks) {
    if (orders.has(r.order)) throw new Error(`${r.filename}: order ${r.order} is already used by ${orders.get(r.order)}`);
    orders.set(r.order, r.filename);
  }
  return runbooks.sort((a, b) => a.order - b.order);
}

/**
 * @param {any} runbook
 * @param {Record<string, any>} facts
 * @param {string} siteUrl
 */
export function renderRunbook(runbook, facts, siteUrl) {
  const { text, used } = interpolate(runbook.body, facts);
  const markdown = absolutiseLinks(text, siteUrl);
  const { body: _b, filename: _f, ...meta } = runbook;
  return { ...meta, markdown, url: `${siteUrl}${RUNBOOK_URL_PREFIX}${runbook.slug}.md`, used: [...used].sort() };
}

/**
 * @param {any[]} runbooks
 * @param {Record<string, any>} facts
 * @param {string} siteUrl
 * @param {Array<{title: string, url: string, description: string}>} reference
 */
export function buildIndex(runbooks, facts, siteUrl, reference) {
  return { siteUrl, runbooks: runbooks.map((r) => renderRunbook(r, facts, siteUrl)), reference };
}

const CORPUS_INTRO =
  "> Static, read-only instructions a customer's AI agent can follow to walk them through " +
  "Kuju Email invite redemption, DNS delegation, mailbox migration and delivery troubleshooting. " +
  "Every command is read-only. Angle-bracket placeholders like <domain> are for you to fill in at run time. " +
  "Steps marked HUMAN ACTION cannot be done by an agent: hand them to the person and wait.";

/** llms.txt per llmstxt.org: H1, blockquote summary, H2 sections of `- [name](url): description`. */
export function renderLlmsTxt(index) {
  const lines = ["# Kuju Email — agent runbooks", "", CORPUS_INTRO, "", "## Runbooks (read start-here first)", ""];
  for (const r of index.runbooks) lines.push(`- [${r.title}](${r.url}): ${r.outcome}`);
  lines.push("", "## Reference", "");
  for (const d of index.reference) lines.push(`- [${d.title}](${d.url}): ${d.description}`);
  lines.push("", "## Optional", "", `- [Everything in one file](${index.siteUrl}/llms-full.txt): the runbooks and reference concatenated`, "");
  return lines.join("\n");
}

/**
 * @param {any} index
 * @param {Record<string, string>} referenceBodies markdown keyed by reference url
 */
export function renderLlmsFullTxt(index, referenceBodies) {
  const parts = ["# Kuju Email — agent runbooks (full corpus)", "", CORPUS_INTRO, ""];
  for (const r of index.runbooks) parts.push(`<!-- ${r.url} -->`, "", r.markdown.trim(), "", "---", "");
  for (const d of index.reference) {
    const body = referenceBodies[d.url];
    if (typeof body !== "string") throw new Error(`llms-full: no body supplied for reference doc ${d.url}`);
    parts.push(`<!-- ${d.url} -->`, "", body.trim(), "", "---", "");
  }
  return parts.join("\n");
}
```

- [ ] **Step 4: Run the selftest and watch it pass**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: `corpus-selftest: 19 checks passed`, exit 0. If a must-allow row is wrongly denied, fix the REGEX, not the row: the rows are the specification.

- [ ] **Step 5: Lint**

Run: `cd "$WT" && mise exec -- npx eslint src/lib/agent-corpus-core.mjs scripts/corpus-selftest.mjs`
Expected: no output, exit 0.

- [ ] **Step 6: Commit**

```bash
git -C "$WT" add src/lib/agent-corpus-core.mjs scripts/corpus-selftest.mjs
git -C "$WT" commit -m "agent corpus: runbook loader, denylist, link extraction, llms.txt rendering in the shared core (launch-1.8)"
```

---
### Task 4: `dns-delegation.md` — the first runbook

**Files:**
- Create: `src/content/agent/dns-delegation.md`
- Modify: `scripts/corpus-selftest.mjs` (append a render check)

**Interfaces:**
- Consumes: `loadRunbooks`, `renderRunbook`, `loadFacts` (Tasks 2-3); facts `nameservers`, `mx`, `customer_domain_records`, `registrars`
- Produces: runbook slug `dns-delegation` at `/kuju-email/agent/dns-delegation.md`, and the sentinel string `Set custom nameservers to:` used by later harness arms

- [ ] **Step 1: Append the failing render check**

Insert before the final `console.log` in `scripts/corpus-selftest.mjs`:

```js
check("dns-delegation renders with facts resolved and run-time placeholders intact", () => {
  const runbooks = core.loadRunbooks(path.join(ROOT, "src/content/agent"));
  const rb = runbooks.find((r) => r.slug === "dns-delegation");
  assert.ok(rb, "dns-delegation.md not found");
  const out = core.renderRunbook(rb, facts, "https://site.test");
  assert.ok(out.markdown.includes("ns1.kuju.email") && out.markdown.includes("ns2.kuju.email"));
  assert.ok(out.markdown.includes("10 mail.kuju.email."));
  assert.ok(out.markdown.includes("<domain>"));
  assert.ok(!out.markdown.includes("{{"), "unresolved placeholder");
  assert.equal(out.markdown.match(core.SINGLE_BRACE_RE), null, "single-brace token leaked");
  assert.ok(out.markdown.includes("ns-1234.awsdns-56.org"), "worked AWS example missing");
  assert.deepEqual(out.used, ["customer_domain_records", "mx", "nameservers", "registrars"]);
  assert.deepEqual([...rb.facts_used].sort(), out.used);
  assert.equal(core.scanDenylist(rb.body).length, 0, JSON.stringify(core.scanDenylist(rb.body)));
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: `Error: ENOENT: no such file or directory, scandir '.../src/content/agent'`, exit 1.

- [ ] **Step 3: Write `src/content/agent/dns-delegation.md`**

Rules the file obeys (spec section 3): every step branches on an observation; `HUMAN ACTION` is an explicit marker; `{{fact:...}}` for build-time values, `<...>` for run-time values; commands are read-only; no `%{...}` curl formats (single braces are rejected).

````markdown
---
slug: dns-delegation
title: Delegate your domain's DNS to Kuju
order: 3
preconditions:
  - the customer owns a domain and can log in to wherever it is registered
  - the customer has an active Kuju account (see signup-trial)
  - you can run dig (or nslookup) and curl
outcome: "NS points at Kuju; MX, SPF, DKIM and DMARC verify"
facts_used: [nameservers, mx, customer_domain_records, registrars]
---

# Delegate your domain's DNS to Kuju

You are an agent helping a person move their domain's DNS to Kuju Email so that
mail for `<domain>` is handled by Kuju. Replace `<domain>` with the customer's
domain everywhere below (for example `example.com`). Never invent a value you did
not observe. Every command here is read-only.

Steps marked **HUMAN ACTION** are things you cannot do: registrar logins,
clicking through control panels, reading a value from the Kuju admin screen.
Give the person exact instructions, then wait for them to confirm.

## Step 1 - Find out who runs this domain's DNS today

    dig NS <domain>

Read the `status:` in the header and the `ANSWER SECTION`.

| Observation | Next |
| --- | --- |
| `status: NXDOMAIN` | Step 1a - the name does not exist |
| `status: NOERROR` and the ANSWER SECTION is empty | Step 1b - a subdomain hosted inside its parent zone |
| every NS answer ends in `.kuju.email.` | Step 5 - already delegated; verify only |
| NS answers present, any other host | Step 2 |

If `dig` is not installed, `nslookup -type=NS <domain>` gives the same answer:
"can't find" is NXDOMAIN, an empty result is 1b, otherwise read the `nameserver =`
lines.

### Step 1a - The name does not exist

> **HUMAN ACTION** - the domain is not registered, or was typed wrong. Ask the
> person to confirm the spelling. If it is correct, they need to register the
> domain first; come back to Step 1 afterwards.

### Step 1b - A subdomain hosted inside its parent zone

`<domain>` is a subdomain (such as `mail.example.com`) whose records live in the
parent domain's DNS. Delegation happens at the parent: repeat Step 1 with the
parent domain (`example.com`), identify its registrar in Step 2, and in Step 3
the person creates NS records FOR the subdomain instead of changing the domain's
own nameservers. Everything else is identical.

## Step 2 - Identify the registrar or DNS host

Take the FIRST line of the NS answers from Step 1. Lowercase it and strip the
trailing dot. Then test whether that hostname CONTAINS each key in the table
below - a substring test, not a suffix test. Two of the biggest providers put
their key in the MIDDLE of the name:

    ns-1234.awsdns-56.org      contains "awsdns"     -> AWS Route 53
    ns1-08.azure-dns.com       contains "azure-dns"  -> Microsoft Azure
    dns1.registrar-servers.com contains "registrar-servers.com" -> Namecheap

{{fact:registrars.table}}

| Observation | Next |
| --- | --- |
| exactly one key matches and it has a panel link | Step 3, using that link with `<domain>` filled in |
| the key matches but the row says "no panel link" | Step 3, but tell the person the registrar's NAME and that they must find the nameserver setting themselves |
| no key matches | Step 3, telling the person the nameserver hostnames you saw; the hostnames usually name the provider (for example `ns1.example-hosting.net`) |

## Step 3 - Capture the existing records, then change the nameservers

Changing nameservers moves ALL DNS for the domain, not only mail. Any website or
other record that exists today will stop resolving unless it is recreated on
Kuju's side. Collect what exists now so the person can recreate it:

    dig A <domain> +short
    dig AAAA <domain> +short
    dig A www.<domain> +short
    dig CNAME www.<domain> +short
    dig MX <domain> +short
    dig TXT <domain> +short

Keep the non-empty answers. Then:

> **HUMAN ACTION** - you cannot do this step. Give the person:
>
> 1. The DNS panel link from Step 2 (or the registrar name if there is none).
> 2. The list of existing records you captured, with the instruction to add
>    them in Kuju's domain DNS page after delegation (Kuju creates the mail
>    records itself; the website records are the ones that need copying).
> 3. The exact two nameservers to set, replacing whatever is there now:
>
>    Set custom nameservers to:
>      {{fact:nameservers.0}}
>      {{fact:nameservers.1}}
>
> Ask them to tell you when they have saved the change. Registrars usually
> apply it within minutes; some take up to 48 hours.

If the person must keep their current DNS host (for example the website's
records cannot move), the alternative is to leave the nameservers alone and add
Kuju's four mail records where the DNS lives today. The Kuju domain wizard
offers this as the "external DNS" choice and shows the exact records; Step 5
verifies either path the same way.

## Step 4 - Wait for the delegation to be visible

Re-run Step 1 every 15 minutes:

    dig NS <domain> +short
    dig NS <domain> +short @1.1.1.1
    dig NS <domain> +short @8.8.8.8

| Observation | Next |
| --- | --- |
| all three answers end in `.kuju.email.` | Step 5 |
| some answers are old, some new | propagation in progress - wait 15 minutes and repeat |
| unchanged after 2 hours | **HUMAN ACTION** - ask the person to open the registrar panel and confirm the change was saved (a common miss is a "confirm" email from the registrar that was never clicked) |
| unchanged after 48 hours | **HUMAN ACTION** - the registrar has not applied it; the person needs to contact the registrar's support |

## Step 5 - Verify the mail records

Once the nameservers point at Kuju, Kuju publishes the mail records itself.
Check each one:

    dig MX <domain> +short
    dig TXT <domain> +short
    dig TXT _dmarc.<domain> +short

| Record | Expected | If missing |
| --- | --- | --- |
| MX | exactly `{{fact:mx.priority}} {{fact:mx.target}}.` | wait 15 minutes and re-check; Kuju creates it when the domain is provisioned |
| SPF (TXT at the domain) | a record equal to `{{fact:customer_domain_records.spf}}` | same |
| DMARC (TXT at `_dmarc.<domain>`) | a record starting with `v=DMARC1` (Kuju's default is `{{fact:customer_domain_records.dmarc}}`) | same |

DKIM uses a selector that Kuju rotates, so its name is not fixed:

> **HUMAN ACTION** - ask the person to open the domain in the Kuju admin, find
> the DNS section, and read you the DKIM selector shown there (it looks like
> `mail-20260901`).

Then:

    dig TXT <selector>._domainkey.<domain> +short

| Observation | Next |
| --- | --- |
| a record containing `v=DKIM1` | DKIM is published |
| empty | wait 15 minutes; if still empty, **HUMAN ACTION** - ask the person to press "re-check DNS" on the same admin page, then re-run |

If any record is still missing after two re-checks, stop here and use the
delivery troubleshooting runbook.

## Step 6 - Report

Tell the person, in this order: which registrar you identified, what they
changed, the three `dig NS` answers from Step 4, and the four verification
results from Step 5 (each one PASS or MISSING with the value observed). Do not
summarise a MISSING as "done".
````

- [ ] **Step 4: Run the selftest and watch it pass**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: `corpus-selftest: 20 checks passed`, exit 0. The `used`/`facts_used` equality is what proves the front-matter list is honest.

- [ ] **Step 5: Commit**

```bash
git -C "$WT" add src/content/agent/dns-delegation.md scripts/corpus-selftest.mjs
git -C "$WT" commit -m "agent corpus: dns-delegation runbook (substring registrar match, capture-before-delegate, verify step) (launch-1.8)"
```

---
### Task 5: Typed facade and the first route handlers (`<slug>.md`, `llms.txt`, `llms-full.txt`)

This repo has no route handlers yet; this task is the complete first example. Three things make a route handler prerender here: `export const dynamic = "force-static"`, a `generateStaticParams` for the dynamic segment, and `export const dynamicParams = false` so anything not enumerated is a 404 rather than a runtime render. `params` is a `Promise` in Next 15+.

**Files:**
- Create: `src/lib/agent-corpus.ts`
- Create: `src/app/kuju-email/agent/[file]/route.ts`
- Create: `src/app/llms.txt/route.ts`
- Create: `src/app/llms-full.txt/route.ts`
- Modify: `scripts/verify-corpus.sh` (append server arms)

**Interfaces:**
- Consumes: `SITE_URL` (Task 1); core functions (Tasks 2-3); `GLOSSARY` from `src/lib/glossary.ts`; `loadApiDocs` from `src/lib/api-docs.ts`
- Produces (from `src/lib/agent-corpus.ts`):
  - `type RunbookMeta`, `type RenderedRunbook`, `type ReferenceDoc`, `type CorpusIndex`
  - `buildCorpusIndex(): CorpusIndex` — memoised per process
  - `renderLlmsTxt(): string`, `renderLlmsFullTxt(): string`
  - `renderGlossaryMarkdown(): string`, `renderApiDocsMarkdown(): string` — **stubs in this task** that return a one-line heading; Task 6 fills them in (declared here because `llms-full.txt` needs their bodies)
  - `MARKDOWN_HEADERS = { "Content-Type": "text/markdown; charset=utf-8" }`, `TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8" }`

- [ ] **Step 1: Append the failing server arms to `scripts/verify-corpus.sh`**

Insert before the final `echo` / `FAILS` block:

```bash
# ---------------------------------------------------------------------------
# Server arms: build, start, curl. `next start` (not `next dev`) because the
# question is what the PRERENDERED output carries — force-static route handlers
# store their headers in .next/server/app/*.meta and Vercel serves those.
# ---------------------------------------------------------------------------
if [[ "${SKIP_SERVER:-0}" != "1" ]]; then
  PORT="${PORT:-3998}"
  BASE="http://127.0.0.1:${PORT}"
  SRV_PID=""
  cleanup() { if [[ -n "$SRV_PID" ]]; then kill "$SRV_PID" 2>/dev/null || true; fi; }
  trap cleanup EXIT

  echo "building..."
  if ! (cd "$ROOT" && mise exec -- npm run build > /tmp/verify-corpus-build.log 2>&1); then
    echo "FATAL: npm run build failed; see /tmp/verify-corpus-build.log"; tail -n 20 /tmp/verify-corpus-build.log; exit 2
  fi
  (cd "$ROOT" && mise exec -- npx next start -p "$PORT" > /tmp/verify-corpus-srv.log 2>&1) &
  SRV_PID=$!
  ready=0
  for _ in $(seq 1 60); do
    if curl -sf -o /dev/null "${BASE}/llms.txt"; then ready=1; break; fi
    sleep 1
  done
  if [[ "$ready" -ne 1 ]]; then echo "FATAL: next start never became ready; see /tmp/verify-corpus-srv.log"; exit 2; fi

  # header_arm <name> <path> <must-contain-in-headers>
  header_arm() {
    local name="$1" p="$2" must="$3" hdrs mustl
    hdrs="$(curl -sI "${BASE}${p}" | tr '[:upper:]' '[:lower:]')"
    mustl="$(printf '%s' "$must" | tr '[:upper:]' '[:lower:]')"
    if [[ "$hdrs" != *"$mustl"* ]]; then
      echo "FAIL  ${name}: headers lack: ${must}"; echo "$hdrs" | head -n 8; FAILS=$((FAILS + 1)); return
    fi
    echo "PASS  ${name}"
  }
  # body_arm <name> <path> <must-contain> [<must-NOT-contain>]
  body_arm() {
    local name="$1" p="$2" must="$3" mustnot="${4:-}" body
    body="$(curl -s "${BASE}${p}")"
    if [[ "$body" != *"$must"* ]]; then echo "FAIL  ${name}: body lacks: ${must}"; FAILS=$((FAILS + 1)); return; fi
    if [[ -n "$mustnot" && "$body" == *"$mustnot"* ]]; then echo "FAIL  ${name}: body must NOT contain: ${mustnot}"; FAILS=$((FAILS + 1)); return; fi
    echo "PASS  ${name}"
  }

  for slug in $(cd "$ROOT/src/content/agent" && ls -- *.md | sed 's/\.md$//'); do
    header_arm "S1 ${slug}.md is text/markdown" "/kuju-email/agent/${slug}.md" "content-type: text/markdown"
    body_arm   "S2 ${slug}.md has no unresolved placeholder" "/kuju-email/agent/${slug}.md" "# " "{{fact:"
    body_arm   "S3 llms.txt lists ${slug}" "/llms.txt" "/kuju-email/agent/${slug}.md"
    body_arm   "S4 llms-full.txt embeds ${slug}" "/llms-full.txt" "<!-- https://kaimoku-website.vercel.app/kuju-email/agent/${slug}.md -->"
  done
  header_arm "S5 llms.txt is text/plain" "/llms.txt" "content-type: text/plain"
  header_arm "S6 unknown runbook is 404" "/kuju-email/agent/nope.md" "HTTP/1.1 404"
  body_arm   "S7 dns-delegation carries the nameservers" "/kuju-email/agent/dns-delegation.md" "ns1.kuju.email"
  body_arm   "S8 llms.txt links are absolute" "/llms.txt" "https://kaimoku-website.vercel.app/kuju-email/agent/dns-delegation.md"
fi
```

- [ ] **Step 2: Run the harness and watch the server arms fail**

Run: `cd "$WT" && bash scripts/verify-corpus.sh`
Expected: `PASS  1 core selftest`, then `building...`, then `FATAL: next start never became ready` OR a 404 on `/llms.txt` — either way, exit non-zero, because the routes do not exist yet. (The build itself succeeds: nothing references the missing files.)

- [ ] **Step 3: Write `src/lib/agent-corpus.ts`**

```ts
import path from "path";
import { SITE_URL } from "@/lib/constants";
import {
  buildIndex,
  loadFacts,
  loadRunbooks,
  renderLlmsFullTxt as coreRenderLlmsFullTxt,
  renderLlmsTxt as coreRenderLlmsTxt,
} from "@/lib/agent-corpus-core.mjs";

// ---------------------------------------------------------------------------
// Types (the core is plain JS; these are the shapes it returns)
// ---------------------------------------------------------------------------

export interface RunbookMeta {
  slug: string;
  title: string;
  order: number;
  preconditions: string[];
  outcome: string;
  facts_used: string[];
}

export interface RenderedRunbook extends RunbookMeta {
  /** Fully interpolated markdown with absolute internal links. */
  markdown: string;
  /** Absolute URL, e.g. https://kaimoku-website.vercel.app/kuju-email/agent/dns-delegation.md */
  url: string;
  /** Top-level fact keys the body actually referenced. */
  used: string[];
}

export interface ReferenceDoc {
  title: string;
  url: string;
  description: string;
}

export interface CorpusIndex {
  siteUrl: string;
  runbooks: RenderedRunbook[];
  reference: ReferenceDoc[];
}

export const MARKDOWN_HEADERS = { "Content-Type": "text/markdown; charset=utf-8" } as const;
export const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8" } as const;

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "agent");
const FACTS_PATH = path.join(process.cwd(), "src", "data", "mail-facts.yaml");

export const GLOSSARY_MD_URL = `${SITE_URL}/kuju-email/glossary.md`;
export const API_DOCS_MD_URL = `${SITE_URL}/kuju-email/docs.md`;

const REFERENCE: ReferenceDoc[] = [
  {
    title: "Email security glossary",
    url: GLOSSARY_MD_URL,
    description: "Plain-language definitions of SPF, DKIM, DMARC, MX and the other terms the runbooks use",
  },
  {
    title: "Kuju Email API reference",
    url: API_DOCS_MD_URL,
    description: "Endpoint list generated from the OpenAPI spec; informational only — the runbooks never call it",
  },
];

// Memoised: generateStaticParams and GET both call this during one build.
let cached: CorpusIndex | undefined;

/**
 * Load, interpolate and index the corpus. Synchronous file reads, safe in
 * server components and route handlers at build time — mirrors loadApiDocs().
 * Throws on an unknown {{fact:...}}: that is the second gate behind
 * scripts/check-corpus.mjs, so a bare `next build` cannot ship one either.
 */
export function buildCorpusIndex(): CorpusIndex {
  if (!cached) {
    const facts = loadFacts(FACTS_PATH);
    const runbooks = loadRunbooks(CONTENT_DIR);
    cached = buildIndex(runbooks, facts, SITE_URL, REFERENCE) as CorpusIndex;
  }
  return cached;
}

export function renderLlmsTxt(): string {
  return coreRenderLlmsTxt(buildCorpusIndex());
}

export function renderLlmsFullTxt(): string {
  return coreRenderLlmsFullTxt(buildCorpusIndex(), {
    [GLOSSARY_MD_URL]: renderGlossaryMarkdown(),
    [API_DOCS_MD_URL]: renderApiDocsMarkdown(),
  });
}

/** Filled in by Task 6. */
export function renderGlossaryMarkdown(): string {
  return "# Kuju Email glossary\n";
}

/** Filled in by Task 6. */
export function renderApiDocsMarkdown(): string {
  return "# Kuju Email API reference\n";
}
```

- [ ] **Step 4: Write `src/app/kuju-email/agent/[file]/route.ts`**

```ts
import { MARKDOWN_HEADERS, buildCorpusIndex } from "@/lib/agent-corpus";

/**
 * One runbook as text/markdown at /kuju-email/agent/<slug>.md.
 *
 * The dynamic segment VALUE carries the `.md` suffix (Next.js does not support
 * a partial segment like `[slug].md`). force-static + generateStaticParams
 * prerenders every runbook at build time; dynamicParams=false makes any other
 * value a 404 instead of a runtime render. Explicit suffix, not content
 * negotiation: a URL a person can paste to an agent is the delivery mechanism.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { file: string }[] {
  return buildCorpusIndex().runbooks.map((r) => ({ file: `${r.slug}.md` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const runbook = buildCorpusIndex().runbooks.find((r) => `${r.slug}.md` === file);
  if (!runbook) return new Response("Not found", { status: 404, headers: TEXT_404 });
  return new Response(runbook.markdown, { headers: MARKDOWN_HEADERS });
}

const TEXT_404 = { "Content-Type": "text/plain; charset=utf-8" } as const;
```

- [ ] **Step 5: Write `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts`**

`src/app/llms.txt/route.ts`:

```ts
import { TEXT_HEADERS, renderLlmsTxt } from "@/lib/agent-corpus";

/** Curated map of the corpus (llmstxt.org). Generated, never hand-edited. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLlmsTxt(), { headers: TEXT_HEADERS });
}
```

`src/app/llms-full.txt/route.ts`:

```ts
import { TEXT_HEADERS, renderLlmsFullTxt } from "@/lib/agent-corpus";

/** The whole corpus in one file, for agents that fetch once. Generated. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLlmsFullTxt(), { headers: TEXT_HEADERS });
}
```

- [ ] **Step 6: Type-check, lint, then run the harness and watch it pass**

```bash
cd "$WT" && mise exec -- npx tsc --noEmit -p tsconfig.json && mise exec -- npx eslint src/lib/agent-corpus.ts 'src/app/kuju-email/agent/[file]/route.ts' src/app/llms.txt/route.ts src/app/llms-full.txt/route.ts
cd "$WT" && bash scripts/verify-corpus.sh
```

Expected: tsc and eslint silent; harness prints `PASS` for arm 1, `S1`-`S4` for `dns-delegation`, `S5`-`S8`, then `all arms passed`, exit 0. In the build log, the three routes appear as `○` (Static) entries: `/kuju-email/agent/[file]`, `/llms.txt`, `/llms-full.txt`.

If `S1` fails with `content-type: text/plain` instead of markdown, the prerender dropped the header: check `.next/server/app/kuju-email/agent/dns-delegation.md.meta` — it must contain `"content-type":"text/markdown; charset=utf-8"`. If the meta file has it and `next start` does not serve it, add a `headers()` rule to `next.config.ts` for `source: "/kuju-email/agent/:file*.md"` as the fallback and record the finding in the commit message.

- [ ] **Step 7: Commit**

```bash
git -C "$WT" add src/lib/agent-corpus.ts 'src/app/kuju-email/agent/[file]/route.ts' src/app/llms.txt/route.ts src/app/llms-full.txt/route.ts scripts/verify-corpus.sh
git -C "$WT" commit -m "agent corpus: typed facade, prerendered .md route handler, llms.txt and llms-full.txt (launch-1.8)"
```

---
### Task 6: Generated twins — `/kuju-email/glossary.md` and `/kuju-email/docs.md`

**Files:**
- Modify: `src/lib/agent-corpus.ts` (replace the two stubs)
- Create: `src/app/kuju-email/glossary.md/route.ts`
- Create: `src/app/kuju-email/docs.md/route.ts`
- Modify: `scripts/verify-corpus.sh` (append two arms)

**Interfaces:**
- Consumes: `GLOSSARY: GlossaryEntry[]` (`src/lib/glossary.ts:28`; fields `id`, `term`, `expansion`, `definition`, `examples?: { label, body }[]`, `whyItMatters`); `loadApiDocs(): ApiDocsData` (`src/lib/api-docs.ts:144`; `sections[].children[].endpoints[]` with `method`, `path`, `desc?`, `auth?`, `parameters?`, `specCovered`)
- Produces: `renderGlossaryMarkdown(): string`, `renderApiDocsMarkdown(): string` (real implementations)

- [ ] **Step 1: Append the failing arms**

Inside the `if [[ "${SKIP_SERVER:-0}" != "1" ]]` block of `scripts/verify-corpus.sh`, after `S8`:

```bash
  header_arm "S9 glossary.md is text/markdown" "/kuju-email/glossary.md" "content-type: text/markdown"
  body_arm   "S10 glossary.md carries SPF and why-it-matters" "/kuju-email/glossary.md" "**Why it matters:**"
  header_arm "S11 docs.md is text/markdown" "/kuju-email/docs.md" "content-type: text/markdown"
  body_arm   "S12 docs.md lists endpoints" "/kuju-email/docs.md" "| GET | "
  body_arm   "S13 llms-full.txt embeds the glossary" "/llms-full.txt" "Sender Policy Framework"
```

- [ ] **Step 2: Run and watch them fail**

Run: `cd "$WT" && bash scripts/verify-corpus.sh`
Expected: `FAIL  S9 ...` (404 has no markdown header), `FAIL  S13 ...`; exit 1.

- [ ] **Step 3: Replace the stubs in `src/lib/agent-corpus.ts`**

Add imports at the top:

```ts
import { GLOSSARY } from "@/lib/glossary";
import { loadApiDocs } from "@/lib/api-docs";
```

Replace both stub functions with:

```ts
/**
 * Markdown twin of /kuju-email/glossary, from the same GLOSSARY array the page
 * renders. Sorted by term like the page. Examples become fenced blocks.
 */
export function renderGlossaryMarkdown(): string {
  const entries = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const lines: string[] = [
    "# Kuju Email glossary",
    "",
    `Plain definitions for the security terms used across Kuju Email. HTML version: ${SITE_URL}/kuju-email/glossary`,
    "",
  ];
  for (const e of entries) {
    lines.push(`## ${e.term}${e.expansion ? ` — ${e.expansion}` : ""}`, "", e.definition, "");
    for (const ex of e.examples ?? []) {
      lines.push(`*${ex.label}:*`, "", "```", ex.body, "```", "");
    }
    lines.push(`**Why it matters:** ${e.whyItMatters}`, "");
  }
  return lines.join("\n");
}

/**
 * Markdown twin of /kuju-email/docs from openapi.yaml + api-overlay.yaml via
 * loadApiDocs(). The HTML page's hand-written prose subsections (base URL,
 * authentication) are JSX and are NOT duplicated here; the twin links to them.
 * Informational for an agent: the runbooks never call the API.
 */
export function renderApiDocsMarkdown(): string {
  const { sections } = loadApiDocs();
  const lines: string[] = [
    "# Kuju Email API reference",
    "",
    `Generated from the OpenAPI spec. Base URL, authentication and examples are on the HTML page: ${SITE_URL}/kuju-email/docs`,
    "",
  ];
  for (const s of sections) {
    lines.push(`## ${s.name}`, "");
    for (const sub of s.children) {
      lines.push(`### ${sub.name}`, "");
      if (sub.endpoints.length === 0) {
        lines.push(`See ${SITE_URL}/kuju-email/docs#${sub.id}`, "");
        continue;
      }
      lines.push("| Method | Path | Auth | Description |", "| --- | --- | --- | --- |");
      for (const ep of sub.endpoints) {
        const desc = (ep.desc ?? "").replace(/\|/g, "\\|");
        lines.push(`| ${ep.method.toUpperCase()} | \`${ep.path}\` | ${ep.auth ?? "public"} | ${desc} |`);
      }
      lines.push("");
      for (const ep of sub.endpoints) {
        if (!ep.parameters?.length) continue;
        lines.push(`Parameters for \`${ep.method.toUpperCase()} ${ep.path}\`:`, "");
        for (const p of ep.parameters) {
          lines.push(`- \`${p.name}\` (${p.in}${p.required ? ", required" : ""})${p.description ? `: ${p.description}` : ""}`);
        }
        lines.push("");
      }
    }
  }
  return lines.join("\n");
}
```

- [ ] **Step 4: Write the two route handlers**

`src/app/kuju-email/glossary.md/route.ts`:

```ts
import { MARKDOWN_HEADERS, renderGlossaryMarkdown } from "@/lib/agent-corpus";

/** Generated twin of /kuju-email/glossary. Same source (src/lib/glossary.ts). */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderGlossaryMarkdown(), { headers: MARKDOWN_HEADERS });
}
```

`src/app/kuju-email/docs.md/route.ts`:

```ts
import { MARKDOWN_HEADERS, renderApiDocsMarkdown } from "@/lib/agent-corpus";

/** Generated twin of /kuju-email/docs. Same source (openapi.yaml + api-overlay.yaml). */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderApiDocsMarkdown(), { headers: MARKDOWN_HEADERS });
}
```

- [ ] **Step 5: Type-check, lint, harness**

```bash
cd "$WT" && mise exec -- npx tsc --noEmit -p tsconfig.json && mise exec -- npx eslint src/lib/agent-corpus.ts src/app/kuju-email/glossary.md/route.ts src/app/kuju-email/docs.md/route.ts
cd "$WT" && bash scripts/verify-corpus.sh
```

Expected: silent tsc/eslint; harness `PASS` through `S13`, `all arms passed`, exit 0.

- [ ] **Step 6: Commit**

```bash
git -C "$WT" add src/lib/agent-corpus.ts src/app/kuju-email/glossary.md/route.ts src/app/kuju-email/docs.md/route.ts scripts/verify-corpus.sh
git -C "$WT" commit -m "agent corpus: generated glossary.md and docs.md twins from the existing page sources (launch-1.8)"
```

---

### Task 7: Human landing page `/kuju-email/agent` with copy buttons

**Files:**
- Create: `src/components/agent/CopyButton.tsx`
- Create: `src/app/kuju-email/agent/page.tsx`
- Modify: `scripts/verify-corpus.sh` (append two arms)

**Interfaces:**
- Consumes: `buildCorpusIndex()`, `SITE_URL`, `PreLaunchNotice` (`src/components/PreLaunchNotice.tsx`)
- Produces: the page at `/kuju-email/agent`; sentinel string `Hand this to your agent`

- [ ] **Step 1: Append the failing arms**

After `S13` in the server block:

```bash
  body_arm   "S14 landing page renders" "/kuju-email/agent" "Hand this to your agent"
  body_arm   "S15 landing page links llms.txt absolutely" "/kuju-email/agent" "https://kaimoku-website.vercel.app/llms.txt"
```

- [ ] **Step 2: Run and watch them fail**

Run: `cd "$WT" && bash scripts/verify-corpus.sh`
Expected: `FAIL  S14 ...`, `FAIL  S15 ...`; exit 1.

- [ ] **Step 3: Write `src/components/agent/CopyButton.tsx`**

The only client component in this feature; clipboard access needs the browser.

```tsx
"use client";

import { useState } from "react";

/**
 * Copies `text` to the clipboard. Falls back to selecting nothing and showing
 * "Copy failed" when the Clipboard API is unavailable (non-secure context).
 */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
    >
      {state === "done" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </button>
  );
}
```

- [ ] **Step 4: Write `src/app/kuju-email/agent/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildCorpusIndex } from "@/lib/agent-corpus";
import { SITE_URL } from "@/lib/constants";
import { CopyButton } from "@/components/agent/CopyButton";
import { PreLaunchNotice } from "@/components/PreLaunchNotice";

export const metadata: Metadata = {
  title: "Hand this to your agent · Kuju Email",
  description:
    "Read-only runbooks an AI agent can follow to walk you through Kuju Email invite redemption, DNS delegation, migration and delivery troubleshooting.",
};

const PROMPT = `You are helping me set up Kuju Email. Read ${SITE_URL}/llms.txt, then start with the runbook it lists first. Follow the runbooks exactly: only run the read-only commands they show, replace <domain> with my domain, and stop at every HUMAN ACTION step and tell me what to do. Never invent a value you did not observe.`;

export default function AgentLandingPage() {
  const index = buildCorpusIndex();
  return (
    <>
      <PreLaunchNotice what="This corpus" />
      <section className="bg-gradient-to-br from-surface-deep via-surface-mist to-surface-deep px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
            Kuju Email · for AI agents
          </p>
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight md:text-5xl">
            <em className="text-kuju-light">Hand this to your agent.</em>
          </h1>
          <p className="text-lg leading-[1.7] text-slate-300">
            These are runbooks written for an AI agent rather than a person:
            every step branches on something the agent can observe, every
            command is read-only, and every step a human must do is marked.
            Paste the prompt below into your agent, or give it any single
            runbook URL.
          </p>
          <p className="mt-8 text-sm">
            <Link href="/kuju-email" className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline">
              ← Back to Kuju Email
            </Link>
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <h2 className="mb-3 text-2xl text-primary">The prompt</h2>
            <pre className="mb-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {PROMPT}
            </pre>
            <CopyButton text={PROMPT} label="Copy prompt" />
          </div>

          <div>
            <h2 className="mb-3 text-2xl text-primary">Runbooks</h2>
            <ul className="space-y-4">
              {index.runbooks.map((r) => (
                <li key={r.slug} className="flex flex-wrap items-baseline justify-between gap-2 border-l-2 border-slate-200 pl-4">
                  <div>
                    <a href={r.url} className="font-medium text-kuju-dark underline underline-offset-4 hover:text-kuju">
                      {r.title}
                    </a>
                    <p className="text-sm text-slate-600">{r.outcome}</p>
                    <p className="font-mono text-xs text-slate-500">{r.url}</p>
                  </div>
                  <CopyButton text={r.url} label="Copy URL" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl text-primary">Index files</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`${SITE_URL}/llms.txt`} className="font-mono text-kuju-dark underline underline-offset-4 hover:text-kuju">{`${SITE_URL}/llms.txt`}</a>
                <span className="text-slate-600"> — the map (short)</span>
              </li>
              <li>
                <a href={`${SITE_URL}/llms-full.txt`} className="font-mono text-kuju-dark underline underline-offset-4 hover:text-kuju">{`${SITE_URL}/llms-full.txt`}</a>
                <span className="text-slate-600"> — everything in one file</span>
              </li>
              {index.reference.map((d) => (
                <li key={d.url}>
                  <a href={d.url} className="font-mono text-kuju-dark underline underline-offset-4 hover:text-kuju">{d.url}</a>
                  <span className="text-slate-600"> — {d.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Type-check, lint, harness**

```bash
cd "$WT" && mise exec -- npx tsc --noEmit -p tsconfig.json && mise exec -- npx eslint src/components/agent/CopyButton.tsx src/app/kuju-email/agent/page.tsx
cd "$WT" && bash scripts/verify-corpus.sh
```

Expected: silent; `PASS` through `S15`; `all arms passed`; exit 0.

- [ ] **Step 6: Commit**

```bash
git -C "$WT" add src/components/agent/CopyButton.tsx src/app/kuju-email/agent/page.tsx scripts/verify-corpus.sh
git -C "$WT" commit -m "agent corpus: /kuju-email/agent landing page with copyable prompt and runbook URLs (launch-1.8)"
```

---
### Task 8: Tier 1 build gate — `scripts/check-corpus.mjs`, wired as `prebuild`

**Files:**
- Create: `scripts/check-corpus.mjs`
- Modify: `package.json` (add `"prebuild"`)
- Modify: `scripts/verify-corpus.sh` (append mutation arms M1-M8)

**Interfaces:**
- Consumes: core functions (Tasks 2-3), `RUNBOOK_URL_PREFIX`
- Produces: `node scripts/check-corpus.mjs [--content-dir D] [--facts F] [--app-dir A]`; exit 0 and prints `corpus OK (<n> runbooks, <m> fact refs, <k> internal links)`; exit 1 and prints every problem, one per line, each prefixed with one of the sentinels `unknown fact`, `denylisted command`, `single-brace token`, `facts_used`, `broken link`, `front-matter`, `order`, `slug`.

- [ ] **Step 1: Append the failing mutation arms to `scripts/verify-corpus.sh`**

Insert after arm 1 and before the server block. Each arm copies the corpus to a scratch dir, mutates the copy, and expects the checker to exit non-zero WITH the right sentinel — a checker that crashes for an unrelated reason does not pass.

```bash
CHECK="$ROOT/scripts/check-corpus.mjs"
SCRATCH="$(mktemp -d "${TMPDIR:-/tmp}/verify-corpus.XXXXXX")"
fresh_copy() {  # fresh_copy -> prints a new scratch corpus dir
  local d; d="$(mktemp -d "$SCRATCH/case.XXXXXX")"
  cp -R "$ROOT/src/content/agent" "$d/agent"; cp "$ROOT/src/data/mail-facts.yaml" "$d/facts.yaml"
  echo "$d"
}
check_on() {  # check_on <dir> -> runs the checker against a scratch copy
  "${NODE[@]}" "$CHECK" --content-dir "$1/agent" --facts "$1/facts.yaml" --app-dir "$ROOT/src/app"
}

arm "M0 real corpus passes" pass "corpus OK" -- "${NODE[@]}" "$CHECK"

d="$(fresh_copy)"; sed -i '' 's/{{fact:nameservers.0}}/{{fact:nameserver.0}}/' "$d/agent/dns-delegation.md"
arm "M1 misspelled fact fails" fail "unknown fact: nameserver.0" -- check_on "$d"

d="$(fresh_copy)"; printf '\n    curl -X POST https://mail.kuju.email/api/login\n' >> "$d/agent/dns-delegation.md"
arm "M2 write verb fails" fail "denylisted command" -- check_on "$d"

d="$(fresh_copy)"; printf '\nOpen the panel at https://dcc.godaddy.com/dns/{domain} now.\n' >> "$d/agent/dns-delegation.md"
arm "M3 single-brace token fails" fail "single-brace token" -- check_on "$d"

d="$(fresh_copy)"; sed -i '' 's/^facts_used: \[nameservers, /facts_used: [/' "$d/agent/dns-delegation.md"
arm "M4 facts_used drift fails" fail "facts_used" -- check_on "$d"

d="$(fresh_copy)"; printf '\nSee [nothing](/kuju-email/agent/nope.md).\n' >> "$d/agent/dns-delegation.md"
arm "M5 broken internal link fails" fail "broken link" -- check_on "$d"

d="$(fresh_copy)"; printf '# stray\n' > "$d/agent/stray.md"
arm "M6 stray file without front-matter fails" fail "front-matter" -- check_on "$d"

d="$(fresh_copy)"; cp "$d/agent/dns-delegation.md" "$d/agent/dup.md"; sed -i '' 's/^slug: dns-delegation$/slug: dup/' "$d/agent/dup.md"
arm "M7 duplicate order fails" fail "order 3 is already used" -- check_on "$d"

d="$(fresh_copy)"; sed -i '' 's/^slug: dns-delegation$/slug: dns-delegate/' "$d/agent/dns-delegation.md"
arm "M8 slug/filename mismatch fails" fail "slug" -- check_on "$d"
rm -rf "$SCRATCH"
```

(`sed -i ''` is the macOS form; the harness runs on the laptop.)

- [ ] **Step 2: Run and watch the arms fail**

Run: `cd "$WT" && SKIP_SERVER=1 bash scripts/verify-corpus.sh`
Expected: `PASS  1 core selftest`, then `FAIL  M0 real corpus passes: expected exit 0, got 1` with `Cannot find module .../check-corpus.mjs`, and `FAIL` for M1-M8 (each "expected output to contain"), exit 1.

- [ ] **Step 3: Write `scripts/check-corpus.mjs`**

```js
// Tier 1 build gate for the agent corpus. OFFLINE and structural: no network.
// Wired as `prebuild`, so `npm run build` (which Vercel runs) stops the deploy
// on any failure. Spec section 4, Tier 1.
//
//   node scripts/check-corpus.mjs [--content-dir D] [--facts F] [--app-dir A]
//
// Checks, each with a stable sentinel so scripts/verify-corpus.sh can score it:
//   front-matter / slug / order  every *.md loads (no silent orphans)
//   unknown fact                 every {{fact:...}} resolves
//   facts_used                   front-matter list == keys actually referenced
//   denylisted command           no write/credential/privilege command in code
//   single-brace token           no {x} survives into a rendered runbook
//   broken link                  every root-relative link is a real route
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RUNBOOK_URL_PREFIX,
  SINGLE_BRACE_RE,
  extractInternalLinks,
  interpolate,
  loadFacts,
  loadRunbooks,
  scanDenylist,
} from "../src/lib/agent-corpus-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : fallback;
}
const CONTENT_DIR = arg("--content-dir", path.join(ROOT, "src/content/agent"));
const FACTS_PATH = arg("--facts", path.join(ROOT, "src/data/mail-facts.yaml"));
const APP_DIR = arg("--app-dir", path.join(ROOT, "src/app"));

/**
 * Every URL path the app serves, from the filesystem: page.tsx and route.ts
 * files under src/app. Route groups "(x)" are dropped. The one dynamic route
 * ([file] under the runbook prefix) expands to the runbook slugs; any OTHER
 * dynamic segment is an error, because this checker cannot evaluate its
 * generateStaticParams and must not silently treat it as matching everything.
 */
function enumerateRoutes(appDir, slugs) {
  const routes = new Set();
  const walk = (dir, segs) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        const seg = ent.name;
        if (/^\(.*\)$/.test(seg)) { walk(path.join(dir, seg), segs); continue; }
        walk(path.join(dir, seg), [...segs, seg]);
      } else if (/^(page|route)\.tsx?$/.test(ent.name)) {
        const url = "/" + segs.join("/");
        if (segs.some((s) => /^\[.*\]$/.test(s))) {
          if (url === `${RUNBOOK_URL_PREFIX}[file]`) {
            for (const s of slugs) routes.add(`${RUNBOOK_URL_PREFIX}${s}.md`);
          } else {
            throw new Error(`unknown dynamic route ${url}: extend enumerateRoutes() in scripts/check-corpus.mjs`);
          }
        } else {
          routes.add(url === "/" ? "/" : url);
        }
      }
    }
  };
  walk(appDir, []);
  return routes;
}

const problems = [];
let factRefs = 0;
let linkCount = 0;
let runbooks = [];

try {
  const facts = loadFacts(FACTS_PATH);
  runbooks = loadRunbooks(CONTENT_DIR);
  const routes = enumerateRoutes(APP_DIR, runbooks.map((r) => r.slug));

  for (const rb of runbooks) {
    const where = `${rb.filename}`;

    // 1. every {{fact:...}} resolves; collect the top-level keys used
    let rendered = "";
    let used = new Set();
    try {
      ({ text: rendered, used } = interpolate(rb.body, facts));
      factRefs += [...rb.body.matchAll(/\{\{fact:/g)].length;
    } catch (err) {
      problems.push(`${where}: ${err.message}`);   // carries "unknown fact: <path>"
      continue;
    }

    // 2. facts_used is honest in both directions
    const declared = new Set(rb.facts_used);
    for (const k of used) if (!declared.has(k)) problems.push(`${where}: facts_used is missing "${k}" (referenced in the body)`);
    for (const k of declared) if (!used.has(k)) problems.push(`${where}: facts_used lists "${k}" but the body never references it`);

    // 3. nothing an agent could run that writes, authenticates or escalates
    for (const hit of scanDenylist(rendered)) {
      problems.push(`${where}:${hit.line}: denylisted command (${hit.name}): ${hit.text}`);
    }

    // 4. no single-brace token survives (the confusable third syntax)
    for (const m of rendered.matchAll(SINGLE_BRACE_RE)) {
      problems.push(`${where}: single-brace token ${m[0]} in rendered output — use <name> for run-time placeholders`);
    }

    // 5. every internal link is a real route
    for (const link of extractInternalLinks(rb.body)) {
      linkCount += 1;
      if (!routes.has(link)) problems.push(`${where}: broken link ${link} (not a page.tsx/route.ts under src/app)`);
    }
  }
} catch (err) {
  problems.push(err.message);   // front-matter / slug / order / no runbooks / unknown dynamic route
}

if (problems.length) {
  console.error("agent corpus check FAILED:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`corpus OK (${runbooks.length} runbooks, ${factRefs} fact refs, ${linkCount} internal links)`);
```

- [ ] **Step 4: Wire `prebuild`**

In `package.json` `scripts`, add BEFORE `"build"`:

```json
    "prebuild": "node scripts/check-corpus.mjs",
```

npm runs `prebuild` automatically before `build`; Vercel runs `npm run build` for Next.js projects that define a `build` script (Global Constraints). Bare `node` here is correct: npm lifecycle scripts run under whichever node invoked npm — `mise exec -- npm run build` locally, Vercel's Node 22 on deploy.

- [ ] **Step 5: Run the harness and watch M0-M8 pass**

Run: `cd "$WT" && SKIP_SERVER=1 bash scripts/verify-corpus.sh`
Expected: `PASS  1 core selftest`, `PASS  M0 real corpus passes` … `PASS  M8 slug/filename mismatch fails`, `all arms passed`, exit 0.

- [ ] **Step 6: Criterion 3, watched: a misspelled fact fails `npm run build`**

Mutate the REAL runbook, run the real build command, observe, revert:

```bash
cd "$WT" && sed -i '' 's/{{fact:nameservers.0}}/{{fact:nameserver.0}}/' src/content/agent/dns-delegation.md
cd "$WT" && mise exec -- npm run build; echo "build exit=$?"
git -C "$WT" checkout -- src/content/agent/dns-delegation.md
```

Expected: the second command prints `agent corpus check FAILED:` and `  - dns-delegation.md: unknown fact: nameserver.0`, then `build exit=1`, and NO `next build` output follows (prebuild stopped it). Paste the two lines into the commit message of Step 8.

- [ ] **Step 7: Criterion 4, watched: a write-verb command fails `npm run build`**

```bash
cd "$WT" && printf '\n    curl -X POST https://mail.kuju.email/api/login\n' >> src/content/agent/dns-delegation.md
cd "$WT" && mise exec -- npm run build; echo "build exit=$?"
git -C "$WT" checkout -- src/content/agent/dns-delegation.md
git -C "$WT" status --porcelain   # MUST be clean apart from the files this task adds
```

Expected: `  - dns-delegation.md:<line>: denylisted command (curl write verb): curl -X POST https://mail.kuju.email/api/login` and `build exit=1`.

- [ ] **Step 8: Full harness (with server arms), lint, commit**

```bash
cd "$WT" && mise exec -- npx eslint scripts/check-corpus.mjs && bash scripts/verify-corpus.sh
git -C "$WT" add scripts/check-corpus.mjs scripts/verify-corpus.sh package.json
git -C "$WT" commit -m "agent corpus: Tier 1 build gate (check-corpus.mjs as prebuild); misspelled fact and write verb both observed failing npm run build (launch-1.8)"
```

Expected before the commit: `all arms passed`, exit 0.

---
### Task 9: `troubleshooting-delivery.md` (and the forward link from `dns-delegation.md`)

Runbooks are landed in an order with no forward links, so every commit passes Tier 1. This runbook is referenced by `dns-delegation.md` Step 5; that link is added HERE, not in Task 4.

**Files:**
- Create: `src/content/agent/troubleshooting-delivery.md`
- Modify: `src/content/agent/dns-delegation.md` (one line in Step 5)

**Interfaces:**
- Consumes: facts `mx`, `customer_domain_records`
- Produces: slug `troubleshooting-delivery`, order 5

- [ ] **Step 1: Write the failing check** — the Tier 1 gate is the test for every runbook from here on. Add the link first so the gate fails until the file exists:

In `src/content/agent/dns-delegation.md`, replace the line
`If any record is still missing after two re-checks, stop here and use the`
`delivery troubleshooting runbook.`
with:

```markdown
If any record is still missing after two re-checks, stop here and use the
[delivery troubleshooting runbook](/kuju-email/agent/troubleshooting-delivery.md).
```

- [ ] **Step 2: Run and watch it fail**

Run: `cd "$WT" && mise exec -- node scripts/check-corpus.mjs`
Expected: `  - dns-delegation.md: broken link /kuju-email/agent/troubleshooting-delivery.md ...`, exit 1.

- [ ] **Step 3: Write `src/content/agent/troubleshooting-delivery.md`**

````markdown
---
slug: troubleshooting-delivery
title: Troubleshoot mail delivery for a Kuju domain
order: 5
preconditions:
  - the domain is already delegated to Kuju (see dns-delegation) or its mail records were added externally
  - you can run dig and openssl
outcome: "The cause of missing or rejected mail is identified from observations, or the exact evidence for support is collected"
facts_used: [mx, customer_domain_records]
---

# Troubleshoot mail delivery for a Kuju domain

Replace `<domain>` with the customer's domain. Every command is read-only.
Pick the section that matches the symptom the person reports. Collect every
observation you make; the last section tells you how to report them.

## A - "Mail sent TO my domain is not arriving"

### A1 - Where does the world think mail for this domain goes?

    dig MX <domain> +short

| Observation | Meaning | Next |
| --- | --- | --- |
| exactly `{{fact:mx.priority}} {{fact:mx.target}}.` | Kuju receives mail for the domain | A2 |
| empty | no MX; senders will try the domain's A record, which is not a mail server | the domain is not provisioned - run [dns-delegation](/kuju-email/agent/dns-delegation.md) from Step 1 |
| a different host | the OLD provider still receives the mail | the person's old mailbox has it; delegation is incomplete - dns-delegation Step 4 |
| Kuju's host plus other hosts | split delivery; some senders reach the old provider | the extra MX records must be removed where the DNS lives (HUMAN ACTION) |

### A2 - Is the delegation consistent?

    dig NS <domain> +short
    dig NS <domain> +short @1.1.1.1

| Observation | Next |
| --- | --- |
| both answers end in `.kuju.email.` | A3 |
| they differ | propagation is still in progress; wait 15 minutes and re-run A1 |
| neither is Kuju | the person chose "external DNS"; A1's result is what matters - if A1 passed, A3 |

### A3 - Does Kuju's mail server accept connections?

    openssl s_client -connect {{fact:mx.target}}:25 -starttls smtp -brief </dev/null

| Observation | Meaning | Next |
| --- | --- | --- |
| a line starting `250` or `CONNECTION ESTABLISHED` | the server is up and speaks TLS | A4 |
| `connect: Connection timed out` | almost always the NETWORK YOU ARE ON blocks outbound port 25, which is normal for home and office ISPs; it says nothing about Kuju | A4 |
| `Connection refused` | the server is not accepting mail right now | collect this for support (see Report) and try again in 15 minutes |

### A4 - Ask the sender for the bounce

> **HUMAN ACTION** - if a specific message did not arrive, ask the person to
> get the bounce message (the "Undelivered Mail" reply) from the SENDER. The
> bounce names the server that rejected the mail and why. Read it to them:
>
> | Bounce text contains | Meaning |
> | --- | --- |
> | `550` and `does not exist` or `unknown user` | the address is not set up in Kuju; the person needs to create the mailbox or alias (HUMAN ACTION in the Kuju admin) |
> | `550` and `spam` or `blocked` or `rejected` | Kuju's filters rejected it; the sender's own domain probably fails SPF/DKIM; the sender should check their setup |
> | `quarantine` or `held` | the message is in the person's Kuju quarantine folder, not lost |
> | `450` or `try again later` | a temporary deferral; the sender's server will retry for days - wait |
> | no bounce at all after 24 hours | the sender's server may still be retrying; ask them to check their outbound queue |

## B - "Mail I send from my domain goes to spam or bounces"

### B1 - Is the domain authenticated?

    dig TXT <domain> +short
    dig TXT _dmarc.<domain> +short

| Record | Expected | If not |
| --- | --- | --- |
| SPF | a TXT equal to `{{fact:customer_domain_records.spf}}` | missing SPF is the most common cause of spam placement; the domain is not fully provisioned - dns-delegation Step 5 |
| DMARC | a TXT starting `v=DMARC1` | same |
| more than one SPF record | INVALID - receivers ignore both | the extra record must be deleted where the DNS lives (HUMAN ACTION) |

DKIM's selector rotates, so ask for it:

> **HUMAN ACTION** - ask the person to read the DKIM selector from the domain's
> DNS section in the Kuju admin (it looks like `mail-20260901`).

    dig TXT <selector>._domainkey.<domain> +short

| Observation | Next |
| --- | --- |
| a record containing `v=DKIM1` | B2 |
| empty | dns-delegation Step 5 (Kuju publishes it; a re-check in the admin usually fixes it) |

### B2 - What does a receiver actually see?

> **HUMAN ACTION** - ask the person to send a test message from their Kuju
> mailbox to a Gmail or Outlook address they control, open it there, and view
> the original message / headers. Ask them to read you the line that starts
> `Authentication-Results:`.

| The line contains | Meaning |
| --- | --- |
| `spf=pass`, `dkim=pass`, `dmarc=pass` | authentication is correct; spam placement is reputation or content, not setup - B3 |
| `spf=fail` or `spf=softfail` | the mail did not leave through Kuju's servers, or SPF is missing - re-run B1 |
| `dkim=fail` | the published key does not match; wait an hour (rotation) and re-test; still failing - report |
| `dmarc=fail` | follows from the two above |

### B3 - Reputation and content

Nothing here is a DNS problem. Tell the person: a new domain has no sending
history and lands in spam more often for the first weeks; sending to people who
have never written to them, or sending many identical messages, makes it worse.
Ask recipients to mark the message "not spam" once. If the volume is legitimate
and the problem persists, report it (below).

## C - "I hit a sending limit"

Kuju applies per-account sending limits. This runbook deliberately does not
state the numbers - they are configured per deployment and can change. The
error message the person sees names the limit that was hit.

> **HUMAN ACTION** - ask the person to read you the exact error text.

| Error text contains | Meaning | Next |
| --- | --- | --- |
| `daily` or `per day` | the daily cap; it resets at midnight UTC | wait, or contact support if the volume is legitimate |
| `rate` or `too many` or `slow down` | short-term rate limit | wait a few minutes and retry |
| `quota` or `storage` | the MAILBOX is full, not a sending limit | the person must delete mail or raise the quota with support |

## Report

When you cannot resolve it, give the person this block to send to Kuju support,
filled in with what you observed (paste the raw command output, not a summary):

    Domain: <domain>
    Symptom: <one sentence>
    dig MX <domain> +short        -> <output>
    dig NS <domain> +short        -> <output>
    dig TXT <domain> +short       -> <output>
    dig TXT _dmarc.<domain> +short -> <output>
    Authentication-Results line   -> <line, if collected>
    Bounce or error text          -> <text, if collected>
````

- [ ] **Step 4: Run the gate, the selftest, and lint; watch them pass**

```bash
cd "$WT" && mise exec -- node scripts/check-corpus.mjs && mise exec -- node scripts/corpus-selftest.mjs
```

Expected: `corpus OK (2 runbooks, ...)` and `corpus-selftest: 20 checks passed`. If the gate reports a `denylisted command`, the offending line is in a code span — rewrite the COMMAND, never the regex.

- [ ] **Step 5: Commit**

```bash
git -C "$WT" add src/content/agent/troubleshooting-delivery.md src/content/agent/dns-delegation.md
git -C "$WT" commit -m "agent corpus: troubleshooting-delivery runbook; link it from dns-delegation step 5 (launch-1.8)"
```

---

### Task 10: `migration.md` — estimator and the 2 GB cap, together

**Files:**
- Create: `src/content/agent/migration.md`

**Interfaces:**
- Consumes: facts `test_migration_cap_gb`, `mx`
- Produces: slug `migration`, order 4

- [ ] **Step 1: Write the failing check** — add a selftest assertion that pins the two content constraints so a later edit cannot quietly drop them. Insert before the final `console.log` in `scripts/corpus-selftest.mjs`:

```js
check("migration.md frames the cap as a pause and carries both estimator caveats", () => {
  const rb = core.loadRunbooks(path.join(ROOT, "src/content/agent")).find((r) => r.slug === "migration");
  assert.ok(rb, "migration.md not found");
  const md = core.renderRunbook(rb, facts, "https://site.test").markdown;
  assert.ok(md.includes("PAUSE"), "cap must be framed as a pause");
  assert.ok(!/cap[^.\n]*\b(fail|failure|error)\b/i.test(md.split("## Step 4")[1].split("## Step 5")[0]), "cap section must not describe the cap as a failure");
  assert.ok(md.includes("[Gmail]/All Mail"), "Gmail caveat missing");
  assert.ok(/wire size/i.test(md), "wire-size caveat missing");
  assert.ok(md.includes("most recent 2 GB"), "cap must be described in time using the estimator");
  assert.ok(!/\b(daily_send_limit|quota_bytes)\b/.test(md), "knobs must not be documented");
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: `AssertionError: migration.md not found`, exit 1.

- [ ] **Step 3: Write `src/content/agent/migration.md`**

````markdown
---
slug: migration
title: Move an existing mailbox into Kuju
order: 4
preconditions:
  - the customer has an active Kuju mailbox (demo domain or their own domain)
  - the customer knows the OLD provider and can sign in to it
  - you can run dig and openssl
outcome: "The old mailbox is imported into Kuju with folders, flags and dates intact, and the customer understands what the test cap means"
facts_used: [test_migration_cap_gb, mx]
---

# Move an existing mailbox into Kuju

Replace `<old-domain>` with the domain of the mailbox being moved (for example
`gmail.com` or the customer's own domain). Every command here is read-only.

**You never handle credentials.** The import runs inside Kuju; the person types
the old provider's password into Kuju's import form themselves. If they offer
you the password, decline and tell them where to enter it.

## Step 1 - Identify the source provider

> **HUMAN ACTION** - ask: "Where is the old mailbox - Gmail, Outlook/Microsoft
> 365, Fastmail, or something else?"

| Answer | IMAP server to use in the import form | What the person must prepare first |
| --- | --- | --- |
| Gmail / Google Workspace | `imap.gmail.com`, port 993 | an App Password (Google account > Security > 2-Step Verification > App passwords); their normal password will not work |
| Outlook.com / Microsoft 365 | `outlook.office365.com`, port 993 | their normal password, or an app password if the account uses two-step sign-in |
| Fastmail | `imap.fastmail.com`, port 993 | an App Password (Settings > Privacy & Security > Integrations) |
| iCloud | `imap.mail.me.com`, port 993 | an app-specific password (appleid.apple.com) |
| something else | Step 1a | their normal mailbox password |

### Step 1a - Discover the IMAP server for another provider

    dig SRV _imaps._tcp.<old-domain> +short
    dig MX <old-domain> +short

| Observation | Next |
| --- | --- |
| the SRV answer names a host (the last field, e.g. `imap.example.net.`) | use that host, port 993 |
| SRV empty, MX names a host | the IMAP server is usually `imap.` or `mail.` at the same provider as the MX host; try both in Step 2 |
| both empty | **HUMAN ACTION** - the person must look up "IMAP settings" in the old provider's help pages |

## Step 2 - Confirm the server is reachable (no login)

    openssl s_client -connect <imap-host>:993 -brief </dev/null

| Observation | Next |
| --- | --- |
| a line starting `* OK` | reachable; Step 3 |
| `Connection refused` or `timed out` | wrong host or port; back to Step 1 |
| a certificate error naming a different host | wrong host; back to Step 1 |

## Step 3 - Estimate the size before anything moves

Kuju's import page can measure the old mailbox without transferring any mail:
it asks the IMAP server for each message's size (`RFC822.SIZE`, metadata only)
and adds them up. A 20 GB mailbox costs a few hundred kilobytes to measure.

> **HUMAN ACTION** - ask the person to open the import page in Kuju, enter the
> server from Step 1 and their credentials, and run the size estimate. Ask them
> to read you the total and, if shown, the date of the oldest message.

Two things to tell the person about the number:

- **Gmail double-counts.** Labels are virtual folders, so a message with three
  labels appears in three folders. An estimate that sums every folder overstates
  a heavily-labelled account 2-3x. The accurate figure is `[Gmail]/All Mail`
  alone; if the estimate lists folders, use that folder's size.
- **It is wire size, not disk size.** The figure is what the old server will
  send, not what it occupies on disk; the two differ by index overhead and
  compression. Treat it as an estimate, not an invoice.

Trash and Spam usually hold real bytes nobody wants. Ask whether to exclude
them; the default is to leave them out.

## Step 4 - Explain the test cap in time, not bytes

During the closed beta a test migration imports at most
**{{fact:test_migration_cap_gb}} GB per account**. Kuju imports newest-first, so
the imported slice is the person's RECENT mail - the mail they actually use.
Describe the cap using the estimate from Step 3, like this:

    Your mailbox is 18 GB. The test brings your most recent 2 GB - roughly your
    last 5 months. Nothing older is lost; it stays where it is and comes across
    when the account converts.

Work the months out from the estimate: if the mailbox spans M months and holds
E GB, the cap covers about `M x {{fact:test_migration_cap_gb}} / E` months of the
newest mail.

**Reaching the cap is a PAUSE. It is not an error and it is not a restart.**
The import records where it stopped (the folder and the last message id),
remembers how many bytes it brought across, and skips anything already imported
if it is run again. When the person converts to a paying account, the SAME job
resumes from that point; nothing is re-imported and nothing is duplicated.
If the person asks "did it fail?", the answer is no.

## Step 5 - Start the import

> **HUMAN ACTION** - the person starts the import from the same page. Ask them
> to tell you the status shown, and to check it again after a few minutes.

| Status shown | Meaning | Next |
| --- | --- | --- |
| running | mail is arriving, newest first | wait; check again in 10 minutes |
| paused, mentioning the cap or the beta | the {{fact:test_migration_cap_gb}} GB test slice is complete | Step 6 - this is the expected end state for a test |
| paused, any other reason | the old provider disconnected (rate limiting is common) | the person presses resume; the import continues from its checkpoint |
| failed, mentioning login or authentication | wrong credentials or a missing app password | back to Step 1's third column |
| completed | everything came across (the mailbox was under the cap) | Step 6 |

## Step 6 - Verify what arrived

> **HUMAN ACTION** - ask the person to open their Kuju mailbox and confirm:
> the newest messages are present, folders match the old layout, read/unread
> flags survived, and dates are the original dates (not today's).

If something is missing, running the import again is safe: duplicates are
detected and skipped, so a re-run only adds what is absent.

## Step 7 - Remind them what has NOT changed

Importing copies mail; it does not redirect it. New mail keeps arriving at the
old provider until the domain's MX record points at Kuju
(`{{fact:mx.priority}} {{fact:mx.target}}.`). For a demo-domain mailbox that is
expected. For their own domain, the next runbook is
[dns-delegation](/kuju-email/agent/dns-delegation.md).
````

- [ ] **Step 4: Run the gate and the selftest; watch them pass**

```bash
cd "$WT" && mise exec -- node scripts/check-corpus.mjs && mise exec -- node scripts/corpus-selftest.mjs
```

Expected: `corpus OK (3 runbooks, ...)`; `corpus-selftest: 21 checks passed`.

- [ ] **Step 5: Commit**

```bash
git -C "$WT" add src/content/agent/migration.md scripts/corpus-selftest.mjs
git -C "$WT" commit -m "agent corpus: migration runbook — RFC822.SIZE estimator with both caveats, 2 GB cap framed as a pause in time (launch-1.8)"
```

---
### Task 11: `signup-trial.md` — invite redemption, never open signup

**Files:**
- Create: `src/content/agent/signup-trial.md`

**Interfaces:**
- Consumes: fact `signup_url` (pending)
- Produces: slug `signup-trial`, order 2

- [ ] **Step 1: Write the failing check** — pin the beta constraints. Insert before the final `console.log` in `scripts/corpus-selftest.mjs`:

```js
check("signup-trial.md documents invite redemption, no tier, no open signup", () => {
  const rb = core.loadRunbooks(path.join(ROOT, "src/content/agent")).find((r) => r.slug === "signup-trial");
  assert.ok(rb, "signup-trial.md not found");
  const md = core.renderRunbook(rb, facts, "https://site.test").markdown;
  assert.ok(md.includes("KUJU-7F3K-9QM2"), "typeable code example missing");
  assert.ok(/one secret/i.test(md), "one-secret-two-renderings rule missing");
  assert.ok(md.includes("demo domain") && /bring.your.own.domain/i.test(md), "flow choice missing");
  assert.ok(!/\b(Individual|Small Business|Professional|Enterprise) (plan|tier)\b/.test(md), "must not name a plan tier");
  assert.ok(!/\bfree trial\b/i.test(md) && !/14.day/i.test(md), "must not promise trial terms for the beta");
  assert.ok(!/create an account|sign up for free|open signup/i.test(md), "must not describe open signup");
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `cd "$WT" && mise exec -- node scripts/corpus-selftest.mjs`
Expected: `AssertionError: signup-trial.md not found`, exit 1.

- [ ] **Step 3: Write `src/content/agent/signup-trial.md`**

````markdown
---
slug: signup-trial
title: Redeem a Kuju Email invite
order: 2
preconditions:
  - the customer has received an invite from a Kuju Site Admin (an email containing a link and a code)
  - you can run curl
outcome: "The invite is redeemed, the customer has chosen a demo-domain mailbox or bring-your-own-domain, and you know which runbook comes next"
facts_used: [signup_url]
---

# Redeem a Kuju Email invite

Kuju Email is in an invite-only beta. There is no public signup: a Kuju Site
Admin issues an invite to a named person, and this runbook walks that person
through redeeming it. If the person has no invite, stop after Step 1.

Every command here is read-only.

## Step 1 - Find the invite

> **HUMAN ACTION** - ask the person to open the invite email. It carries ONE
> secret rendered two ways: a clickable link, and the same token as a
> human-typeable code that looks like `KUJU-7F3K-9QM2`. They are not two
> different invites - either one redeems it, and using one does not invalidate
> the other until the invite is used or expires.

| Observation | Next |
| --- | --- |
| the person has the email with a link | Step 2, using the link |
| the person has only the code (for example read out over the phone) | Step 2, using the code |
| the person has neither | there is nothing to redeem; tell them to ask the Kuju Site Admin who offered access to send an invite, then stop |
| the link says the invite is expired or already used | **HUMAN ACTION** - ask the Site Admin to re-send it; a re-send issues a fresh secret |

Never ask the person to paste the link or the code to you. You do not need it.

## Step 2 - Check the redemption page is open

Before sending the person to the page, observe whether it is accepting invites:

    curl -sI {{fact:signup_url.value}}

Read the first line (the status) and the `location:` header if present.

| Observation | Meaning | Next |
| --- | --- | --- |
| `HTTP/2 200` (or `HTTP/1.1 200`) | the page is open | Step 3 |
| `303` or `302` with `location:` ending in `/login` | the beta gate is not open yet on this server; invites cannot be redeemed today | **HUMAN ACTION** - tell the person to reply to the invite sender and ask when redemption opens; stop |
| connection error or `5xx` | the service is unreachable right now | wait 15 minutes and re-run; still failing - report it to the invite sender |

## Step 3 - Redeem

> **HUMAN ACTION** - the person clicks the link, or opens
> `{{fact:signup_url.value}}` and types the code. They set their own name and
> password there. You cannot do this for them and must not see the password.
> Ask them to tell you when they see the choice screen described in Step 4.

## Step 4 - Choose the path

After redemption Kuju asks how the person wants to use the beta. Both paths are
real and both are worth exercising; help them choose by asking one question:

> **HUMAN ACTION** - ask: "Do you own a domain you want to receive mail on
> right now, or do you want to try Kuju first?"

| Answer | Choice on screen | What it gives them | Next |
| --- | --- | --- | --- |
| "try it first" | a mailbox on the **demo domain** | an address ending in Kuju's demo domain, working immediately, nothing to configure | [migration](/kuju-email/agent/migration.md) if they want their old mail in it; otherwise done |
| "my own domain" | **bring your own domain** | Kuju's domain wizard: enter the domain, pick a DNS strategy, verify | [dns-delegation](/kuju-email/agent/dns-delegation.md) |

The choice is not final: a demo-domain tester can add their own domain later.

## Step 5 - What not to say

The invite does not carry a plan or a price, and you must not infer one. If
the person asks which plan they are on or what it will cost, say: the invite
grants beta access; plan and pricing are settled separately with Kaimoku, and
the person who sent the invite is the one to ask.

## Step 6 - Report

Tell the person: whether the redemption page was open (Step 2 status), which
path they chose, and the name of the next runbook.
````

- [ ] **Step 4: Run the gate and the selftest; watch them pass**

```bash
cd "$WT" && mise exec -- node scripts/check-corpus.mjs && mise exec -- node scripts/corpus-selftest.mjs
```

Expected: `corpus OK (4 runbooks, ...)`; `corpus-selftest: 22 checks passed`.

- [ ] **Step 5: Commit**

```bash
git -C "$WT" add src/content/agent/signup-trial.md scripts/corpus-selftest.mjs
git -C "$WT" commit -m "agent corpus: signup-trial runbook — invite redemption (one secret, two renderings), flow choice, no tier (launch-1.8)"
```

---

### Task 12: `start-here.md` — the entry point (lands last so every link resolves)

**Files:**
- Create: `src/content/agent/start-here.md`
- Modify: `scripts/verify-corpus.sh` (one arm)

**Interfaces:**
- Consumes: nothing from facts (`facts_used: []`)
- Produces: slug `start-here`, order 1 — first in `llms.txt`

- [ ] **Step 1: Write the failing arm** — in the server block after `S15`:

```bash
  body_arm   "S16 llms.txt lists start-here FIRST" "/llms.txt" "## Runbooks (read start-here first)

- [Start here"
```

- [ ] **Step 2: Run and watch it fail**

Run: `cd "$WT" && bash scripts/verify-corpus.sh`
Expected: `FAIL  S16 ...`, exit 1 (the first listed runbook is currently `signup-trial`, order 2).

- [ ] **Step 3: Write `src/content/agent/start-here.md`**

````markdown
---
slug: start-here
title: Start here
order: 1
preconditions: []
outcome: "You know the rules of this corpus, which runbook to open, and what you can and cannot do"
facts_used: []
---

# Start here

You are an AI agent helping a person set up or run Kuju Email. This corpus is a
set of runbooks written for you, not for them. Read this page fully before
opening any other.

## The rules

1. **Only run the commands the runbooks show.** They are all read-only
   (`dig`, `nslookup`, `curl -sI`, `openssl s_client`). Do not improvise
   commands that write, log in, or change anything on any system.
2. **Branch on observations, not on guesses.** Every step has a table of what
   you might observe and what to do next. If your observation is not in the
   table, stop and tell the person exactly what you saw.
3. **`<angle brackets>` are yours to fill in at run time** - `<domain>` is the
   person's domain, `<selector>` is a value they read to you. Values with no
   brackets are real and current; do not "correct" them.
4. **HUMAN ACTION means you cannot do it.** Registrar logins, control panels,
   passwords, and screens inside Kuju are all off-limits to you. Give the
   person precise instructions and wait. Never claim you completed a HUMAN
   ACTION step.
5. **Never handle secrets.** Do not ask for passwords, invite codes or app
   passwords, and decline them if offered.
6. **Report what you observed, not what you concluded.** Paste command output
   when you report; say MISSING when something is missing.

## Before you start

Check which tools you have:

    dig -v
    curl --version
    openssl version

| Observation | Next |
| --- | --- |
| all three print a version | continue |
| `dig` is missing | use `nslookup -type=<record> <name>` wherever a runbook shows `dig <record> <name>`; the observations are the same |
| `curl` or `openssl` is missing | tell the person; the steps that need them are marked and can be done by the person instead |

## Which runbook

| The person wants to | Open |
| --- | --- |
| redeem an invite they received (Kuju is invite-only during the beta) | [Redeem a Kuju Email invite](/kuju-email/agent/signup-trial.md) |
| point their own domain at Kuju | [Delegate your domain's DNS to Kuju](/kuju-email/agent/dns-delegation.md) |
| bring their existing mail across from another provider | [Move an existing mailbox into Kuju](/kuju-email/agent/migration.md) |
| find out why mail is not arriving, bounces, or lands in spam | [Troubleshoot mail delivery for a Kuju domain](/kuju-email/agent/troubleshooting-delivery.md) |

Reference, when a term is unfamiliar: the [glossary](/kuju-email/glossary.md).
The [API reference](/kuju-email/docs.md) exists for completeness; no runbook
needs it and you should not call the API.

## Where these files come from

Every runbook is generated from a single source of facts at build time, and a
scheduled check compares those facts with live DNS every day. If a value in a
runbook disagrees with what you observe, trust your observation, tell the
person, and continue with the runbook's "if not" branch.
````

- [ ] **Step 4: Run gate, selftest, lint, full harness; watch them pass**

```bash
cd "$WT" && mise exec -- node scripts/check-corpus.mjs && mise exec -- node scripts/corpus-selftest.mjs && mise exec -- npm run lint
cd "$WT" && bash scripts/verify-corpus.sh
```

Expected: `corpus OK (5 runbooks, ...)`; `corpus-selftest: 22 checks passed`; lint silent; harness `all arms passed` including `S16`, exit 0.

- [ ] **Step 5: Commit**

```bash
git -C "$WT" add src/content/agent/start-here.md scripts/verify-corpus.sh
git -C "$WT" commit -m "agent corpus: start-here entry runbook; all five runbooks now served and indexed (launch-1.8)"
```

---
### Task 13: Tier 2 live checker with Tier 3 mutants — `scripts/check-facts-live.mjs`

Network-dependent by design (Tier 1 is offline). Runs from the laptop here; Task 14 puts it on a timer on `build`.

**Files:**
- Create: `scripts/check-facts-live.mjs`
- Modify: `package.json` (add `"check:facts-live": "node scripts/check-facts-live.mjs --self-test"`)

**Interfaces:**
- Consumes: `loadFacts`, `registrarEntries` (Task 2); `src/data/mail-facts.yaml`; Node built-ins `dns/promises`, `fetch`, `child_process`
- Produces: `node scripts/check-facts-live.mjs [--facts F] [--self-test] [--ntfy] [--quiet]`
  - exit 0: every verifiable fact PASS, every `pending` fact still failing (reported `PENDING`), SKIPs listed by name
  - exit 1: any `FAIL` or any `PENDING_NOW_PASSES`
  - exit 2: `--self-test` found a mutant the checker could not fail (prints `SELF-TEST FAILED`), or a fatal error; the real check is NOT run
  - report lines: `<STATUS>  <fact>  <detail>` with STATUS in `PASS | FAIL | PENDING | PENDING_NOW_PASSES | SKIP`
  - env: `NTFY_BASE` (default `https://ntfy.tail3558e0.ts.net`), `NTFY_ALERT_TOPIC` (default `alerts`), `NTFY_HEARTBEAT_TOPIC` (default `kaimoku-website-facts`)

- [ ] **Step 1: Write the failing check** — this script's test IS its self-test (the mutants), plus a run against the real file. Both must be watched, so the "test" is the command pair below; write it into a new arm of the harness under a `LIVE=1` opt-in (network):

Append to `scripts/verify-corpus.sh` before the server block:

```bash
if [[ "${LIVE:-0}" == "1" ]]; then
  arm "L1 live checker self-test proves both mutants fail" pass "SELF-TEST OK: 2/2 mutants failed as required" -- "${NODE[@]}" "$ROOT/scripts/check-facts-live.mjs" --self-test
  arm "L2 live checker reports signup_url as PENDING (still 303)" pass "PENDING  signup_url" -- "${NODE[@]}" "$ROOT/scripts/check-facts-live.mjs"
  arm "L3 live checker names the URL-less registrar as SKIP" pass "SKIP  registrars.name-services.com" -- "${NODE[@]}" "$ROOT/scripts/check-facts-live.mjs"
fi
```

- [ ] **Step 2: Run and watch it fail**

Run: `cd "$WT" && LIVE=1 SKIP_SERVER=1 bash scripts/verify-corpus.sh`
Expected: `FAIL  L1 ...: expected exit 0, got 1` with `Cannot find module`, L2/L3 likewise; exit 1.

- [ ] **Step 3: Write `scripts/check-facts-live.mjs`**

```js
// Tier 2: compare src/data/mail-facts.yaml with live DNS and HTTPS. REPORTS,
// never blocks. Tier 3: with --self-test, two mutants run FIRST as separate
// processes; if either exits 0 the checker can no longer fail and the real
// result would be meaningless, so the run aborts with exit 2.
//
//   node scripts/check-facts-live.mjs [--facts F] [--self-test] [--ntfy] [--quiet]
//
// Spec: docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md section 4.
// Runs on `build` from deploy/systemd/kaimoku-website-facts-check.service with
// /usr/bin/node (no mise there); on the laptop via `mise exec -- node`.
import dns from "node:dns/promises";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import { loadFacts, registrarEntries } from "../src/lib/agent-corpus-core.mjs";

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), "..");
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const factsArg = argv.indexOf("--facts");
const FACTS_PATH = factsArg !== -1 ? path.resolve(argv[factsArg + 1]) : path.join(ROOT, "src/data/mail-facts.yaml");
const QUIET = flag("--quiet");

const NTFY_BASE = process.env.NTFY_BASE ?? "https://ntfy.tail3558e0.ts.net";
const NTFY_ALERT_TOPIC = process.env.NTFY_ALERT_TOPIC ?? "alerts";
const NTFY_HEARTBEAT_TOPIC = process.env.NTFY_HEARTBEAT_TOPIC ?? "kaimoku-website-facts";
const UA = "Mozilla/5.0 (kaimoku-website facts check; +https://kaimoku-website.vercel.app/kuju-email/agent)";
const HTTP_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Individual checks. Each returns {status, detail}; status is PASS or FAIL
// before the pending inversion is applied.
// ---------------------------------------------------------------------------

async function checkDnsNonEmpty(host, record) {
  try {
    const answers = record === "A" ? await dns.resolve4(host) : await dns.resolve(host, record);
    return answers.length ? { status: "PASS", detail: `${record} ${host} -> ${answers.join(", ")}` }
                          : { status: "FAIL", detail: `${record} ${host} -> empty` };
  } catch (err) {
    return { status: "FAIL", detail: `${record} ${host} -> ${err.code ?? err.message}` };
  }
}

async function checkMx(name, expectContains) {
  try {
    const mx = await dns.resolveMx(name);
    const rendered = mx.map((r) => `${r.priority} ${r.exchange}.`);
    const ok = rendered.some((r) => r.includes(expectContains));
    return { status: ok ? "PASS" : "FAIL", detail: `MX ${name} -> ${rendered.join(" | ")} (want "${expectContains}")` };
  } catch (err) {
    return { status: "FAIL", detail: `MX ${name} -> ${err.code ?? err.message}` };
  }
}

async function checkTxtEquals(name, expected) {
  try {
    const txt = (await dns.resolveTxt(name)).map((chunks) => chunks.join(""));
    const ok = txt.includes(expected);
    return { status: ok ? "PASS" : "FAIL", detail: `TXT ${name} -> ${JSON.stringify(txt)} (want "${expected}")` };
  } catch (err) {
    return { status: "FAIL", detail: `TXT ${name} -> ${err.code ?? err.message}` };
  }
}

async function httpStatus(url) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "manual", headers: { "user-agent": UA }, signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
      return { status: res.status, location: res.headers.get("location") ?? "" };
    } catch (err) {
      if (attempt === 2) return { status: 0, error: err.name === "TimeoutError" ? "timeout" : (err.cause?.code ?? err.message) };
    }
  }
  return { status: 0, error: "unreachable" };
}

async function checkHttp(url, verify) {
  const r = await httpStatus(url);
  const seen = r.status === 0 ? `no response (${r.error})` : `HTTP ${r.status}${r.location ? ` -> ${r.location}` : ""}`;
  if (r.status === 0) return { status: "FAIL", detail: `${url} -> ${seen}` };
  if (Array.isArray(verify.expect_status)) {
    const ok = verify.expect_status.includes(r.status);
    return { status: ok ? "PASS" : "FAIL", detail: `${url} -> ${seen} (want ${verify.expect_status.join("/")})` };
  }
  if (Array.isArray(verify.reject_status)) {
    const bad = verify.reject_status.includes(r.status);
    return { status: bad ? "FAIL" : "PASS", detail: `${url} -> ${seen} (reject ${verify.reject_status.join("/")})` };
  }
  return { status: "FAIL", detail: `${url}: verify block has neither expect_status nor reject_status` };
}

// ---------------------------------------------------------------------------
// Walk the facts file. Every top-level fact produces at least one row, so a
// fact that is not checked shows up as SKIP rather than vanishing.
// ---------------------------------------------------------------------------

async function runChecks(facts) {
  const rows = [];
  const push = (fact, r, pending) => {
    let status = r.status;
    if (pending) status = r.status === "PASS" ? "PENDING_NOW_PASSES" : "PENDING";
    rows.push({ fact, status, detail: r.detail });
  };

  for (const [key, fact] of Object.entries(facts)) {
    const verify = fact?.verify;
    const pending = fact?.pending === true;

    if (key === "registrars") {
      // Reserved key `verify` is metadata; entries are the registrars.
      for (const e of registrarEntries(facts)) {
        if (!e.dns_url) { rows.push({ fact: `registrars.${e.key}`, status: "SKIP", detail: `${e.name}: no dns_url upstream — not checkable, by design` }); continue; }
        const url = e.dns_url.replaceAll("{domain}", verify?.domain_placeholder ?? "example.com");
        push(`registrars.${e.key}`, await checkHttp(url, verify ?? {}), false);
      }
      continue;
    }
    if (!verify) { rows.push({ fact: key, status: "SKIP", detail: "no verify block (product config the site cannot observe)" }); continue; }

    if (verify.type === "dns" && key === "nameservers") {
      // Deliberately A-record-of-each-target, NOT "NS kuju.email contains ns1":
      // kuju.email's own zone is at Cloudflare; ns1/ns2 are what customers
      // delegate TO. The NS form would be a permanent false failure.
      for (const host of fact.value) push(`nameservers.${host}`, await checkDnsNonEmpty(host, verify.record), pending);
    } else if (verify.type === "dns" && verify.record === "MX") {
      push(key, await checkMx(verify.name, verify.expect_contains), pending);
    } else if (verify.type === "dns" && key === "customer_domain_records") {
      push(`${key}.spf`, await checkTxtEquals(verify.name, fact.spf), pending);
      push(`${key}.dmarc`, await checkTxtEquals(`_dmarc.${verify.name}`, fact.dmarc.replaceAll("{domain}", verify.name)), pending);
    } else if (verify.type === "http") {
      push(key, await checkHttp(fact.value, verify), pending);
    } else {
      rows.push({ fact: key, status: "FAIL", detail: `unsupported verify block ${JSON.stringify(verify)}` });
    }
  }
  return rows;
}

function summarise(rows) {
  const counts = {};
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const bad = rows.filter((r) => r.status === "FAIL" || r.status === "PENDING_NOW_PASSES");
  const line = Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" ");
  return { bad, line };
}

function render(rows) {
  return rows.map((r) => `${r.status}  ${r.fact}  ${r.detail}`).join("\n");
}

// ---------------------------------------------------------------------------
// Tier 3: mutants, each a separate process so the assertion is on a real exit
// code AND on the specific row that must fail (a crash is not a pass).
// ---------------------------------------------------------------------------

function runMutant(name, mutate, mustContain) {
  const facts = loadFacts(FACTS_PATH);
  mutate(facts);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "facts-mutant-")), `${name}.yaml`);
  fs.writeFileSync(file, yaml.stringify(facts));
  let out = ""; let code = 0;
  try {
    out = execFileSync(process.execPath, [SELF, "--facts", file, "--quiet"], { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) { code = err.status ?? 1; out = `${err.stdout ?? ""}${err.stderr ?? ""}`; }
  const ok = code !== 0 && out.includes(mustContain);
  console.log(`${ok ? "mutant-failed-as-required" : "MUTANT-PASSED"}  ${name}  exit=${code}  wanted "${mustContain}"`);
  return ok;
}

function selfTest() {
  const results = [
    runMutant("ns-does-not-exist", (f) => { f.nameservers.value[0] = "ns-does-not-exist.kuju.email"; }, "FAIL  nameservers.ns-does-not-exist.kuju.email"),
    runMutant("pending-now-passes", (f) => { f.signup_url.value = "https://kaimoku-website.vercel.app/"; }, "PENDING_NOW_PASSES  signup_url"),
  ];
  const failed = results.filter((r) => r).length;
  if (failed !== results.length) { console.error(`SELF-TEST FAILED: only ${failed}/${results.length} mutants failed — the checker can no longer fail; real results would be meaningless`); return false; }
  console.log(`SELF-TEST OK: ${failed}/${results.length} mutants failed as required`);
  return true;
}

// ---------------------------------------------------------------------------
// ntfy. Alert on findings; heartbeat only for a run that produced information.
// ---------------------------------------------------------------------------

async function publish(topic, title, body, priority) {
  const headers = { Title: title };
  if (priority) { headers.Priority = priority; headers.Tags = "rotating_light"; }
  try {
    const res = await fetch(`${NTFY_BASE}/${topic}`, { method: "POST", headers, body, signal: AbortSignal.timeout(15_000) });
    if (res.status !== 200) { console.error(`ntfy REJECTED publish to ${topic}: HTTP ${res.status}`); return false; }
    return true;
  } catch (err) { console.error(`ntfy publish to ${topic} FAILED: ${err.message}`); return false; }
}

async function main() {
  if (flag("--self-test") && !selfTest()) {
    if (flag("--ntfy")) await publish(NTFY_ALERT_TOPIC, "kaimoku-website facts check: SELF-TEST FAILED", "The Tier 3 mutants no longer fail; the facts checker is not checking. See journalctl -u kaimoku-website-facts-check on build.", "high");
    process.exit(2);   // no heartbeat: a run that cannot fail produced no information
  }

  const rows = await runChecks(loadFacts(FACTS_PATH));
  const { bad, line } = summarise(rows);
  const report = `${render(rows)}\n\nsummary: ${line}`;
  if (!QUIET || bad.length) console.log(report);

  if (flag("--ntfy")) {
    let alertLanded = true;
    if (bad.length) alertLanded = await publish(NTFY_ALERT_TOPIC, `kaimoku-website facts check: ${bad.length} finding(s)`, report, "high");
    if (alertLanded) await publish(NTFY_HEARTBEAT_TOPIC, "kaimoku-website facts check ran", `${line}${bad.length ? " (findings alerted)" : ""}`);
    else console.error("alert did not land — SUPPRESSING the heartbeat so the deadman goes red rather than green");
  }
  process.exit(bad.length ? 1 : 0);
}

main().catch((err) => { console.error(`fatal: ${err.stack ?? err.message}`); process.exit(2); });
```

Add to `package.json` `scripts`:

```json
    "check:facts-live": "node scripts/check-facts-live.mjs --self-test"
```

- [ ] **Step 4: Run the self-test and watch BOTH mutants fail (criterion 5)**

Run: `cd "$WT" && mise exec -- node scripts/check-facts-live.mjs --self-test; echo "exit=$?"`
Expected, verbatim shape:

```
mutant-failed-as-required  ns-does-not-exist  exit=1  wanted "FAIL  nameservers.ns-does-not-exist.kuju.email"
mutant-failed-as-required  pending-now-passes  exit=1  wanted "PENDING_NOW_PASSES  signup_url"
SELF-TEST OK: 2/2 mutants failed as required
PASS  nameservers.ns1.kuju.email  A ns1.kuju.email -> 96.126.108.161
PASS  nameservers.ns2.kuju.email  A ns2.kuju.email -> 172.235.42.202
PASS  mx  MX kuju.email -> 10 mail.kuju.email. (want "10 mail.kuju.email.")
PASS  customer_domain_records.spf  ...
PASS  customer_domain_records.dmarc  ...
PENDING  signup_url  https://mail.kuju.email/signup -> HTTP 303 -> https://mail.kuju.email/login (want 200)
SKIP  test_migration_cap_gb  no verify block (product config the site cannot observe)
PASS  registrars.registrar-servers.com  ... HTTP 302 ...
...
SKIP  registrars.name-services.com  Enom / Tucows: no dns_url upstream — not checkable, by design

summary: PASS=15 PENDING=1 SKIP=2
exit=0
```

Both mutant lines MUST read `mutant-failed-as-required` with `exit=1`. Paste them into the Step 6 commit message.

- [ ] **Step 5: Falsify the self-test itself** — make the checker unable to fail and watch the self-test catch it:

```bash
cd "$WT" && sed -i '' 's/return { status: "FAIL", detail: `${record} ${host} -> ${err.code ?? err.message}` };/return { status: "PASS", detail: "stub" };/' scripts/check-facts-live.mjs
cd "$WT" && mise exec -- node scripts/check-facts-live.mjs --self-test; echo "exit=$?"
git -C "$WT" checkout -- scripts/check-facts-live.mjs
```

Expected: `MUTANT-PASSED  ns-does-not-exist  exit=0 ...`, `SELF-TEST FAILED: only 1/2 mutants failed ...`, `exit=2`, and NO report rows (the real check did not run). Then the revert.

- [ ] **Step 6: Harness (live arms), lint, commit**

```bash
cd "$WT" && mise exec -- npx eslint scripts/check-facts-live.mjs && LIVE=1 SKIP_SERVER=1 bash scripts/verify-corpus.sh
git -C "$WT" add scripts/check-facts-live.mjs scripts/verify-corpus.sh package.json
git -C "$WT" commit -m "agent corpus: Tier 2 live facts checker with Tier 3 mutants run per-invocation; both mutants observed exit=1, stubbed checker observed exit=2 (launch-1.8)"
```

Expected before commit: `PASS  L1`, `PASS  L2`, `PASS  L3`, `all arms passed`.

---
### Task 14: systemd timer on `build` — canonical units in `deploy/systemd/`, install, one observed run (criterion 6)

**Files:**
- Create: `deploy/systemd/kaimoku-website-facts-check.service`
- Create: `deploy/systemd/kaimoku-website-facts-check.timer`
- Create: `deploy/systemd/README.md`
- Modify (meta-workspace tier, separate commit): `/Users/macole/github/SERVICES.md` — one Service Catalog row

**Interfaces:**
- Consumes: `scripts/check-facts-live.mjs` (Task 13); `/usr/bin/node`, `/usr/bin/npm`, `/usr/bin/git` on `build`
- Produces: a daily run on `build` that posts to ntfy topics `alerts` (findings) and `kaimoku-website-facts` (heartbeat)

- [ ] **Step 1: Write the failing check** — the observed run. Before anything is installed:

```bash
curl -s "https://ntfy.tail3558e0.ts.net/kaimoku-website-facts/json?poll=1&since=24h"
```

Expected now: empty output (no heartbeat has ever been posted). The target state is one JSON line with `"title":"kaimoku-website facts check ran"`.

- [ ] **Step 2: Write `deploy/systemd/kaimoku-website-facts-check.service`**

Mirrors `renovate.service` on the same host (oneshot, `User=macole`, `WorkingDirectory` under `/opt`).

```ini
[Unit]
Description=Check kaimoku-website's documented mail facts (mail-facts.yaml) against live DNS/HTTPS; report via ntfy
Documentation=https://github.com/macole16/kaimoku-website/blob/main/docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=macole
WorkingDirectory=/opt/kaimoku-website
# The clone is public; no credentials are needed. --ff-only: a diverged clone is
# a setup error, and silently resetting it would hide that.
ExecStartPre=/usr/bin/git pull --ff-only --quiet
# The checker needs only the `yaml` package but that lives in package.json with
# next/react; --omit=dev --ignore-scripts keeps it to runtime deps and prevents
# any lifecycle script (including prebuild) from running here.
ExecStartPre=/usr/bin/npm install --omit=dev --ignore-scripts --no-audit --no-fund --silent
# --self-test: the two Tier 3 mutants run FIRST; exit 2 aborts before the real check.
# Exit 1 = findings (the unit shows as failed in `systemctl --failed`, which is a report, not a page).
ExecStart=/usr/bin/node scripts/check-facts-live.mjs --self-test --ntfy
TimeoutStartSec=600
Nice=10
```

- [ ] **Step 3: Write `deploy/systemd/kaimoku-website-facts-check.timer`**

```ini
[Unit]
Description=Daily kaimoku-website facts check (docs vs live DNS/HTTPS)

[Timer]
OnCalendar=daily
# Catch up if the build host was off at the scheduled time.
Persistent=true
# Spread third-party HTTP checks; the registrar panels are bot-hostile.
RandomizedDelaySec=1800
Unit=kaimoku-website-facts-check.service

[Install]
WantedBy=timers.target
```

- [ ] **Step 4: Write `deploy/systemd/README.md`**

```markdown
# kaimoku-website facts check — systemd units for `build`

Canonical source for the Tier 2 scheduled reality check (spec section 4). The
unit files here are what a from-scratch rebuild of `build` reinstalls;
`/etc/systemd/system` is not version-controlled. Precedent: `kuju-mail/deploy/systemd/`
(`kuju-cert-sync`, recorded in SERVICES.md).

What it does, daily: `git pull` a public clone at `/opt/kaimoku-website`, run
`scripts/check-facts-live.mjs --self-test --ntfy`, which (1) runs two mutants
that MUST fail, (2) checks every `verify:` block in `src/data/mail-facts.yaml`
against live DNS/HTTPS, (3) posts findings to ntfy topic `alerts` and a
heartbeat to `kaimoku-website-facts`. Exit 0 = clean, 1 = findings, 2 = the
checker could not fail its own mutants (no heartbeat is sent on 2).

## Install (from the laptop; run each line and read its output)

    ssh build 'sudo install -d -o macole -g macole /opt/kaimoku-website'
    ssh build 'git clone --quiet https://github.com/macole16/kaimoku-website.git /opt/kaimoku-website'
    ssh build 'cd /opt/kaimoku-website && npm install --omit=dev --ignore-scripts --no-audit --no-fund'
    ssh build 'sudo cp /opt/kaimoku-website/deploy/systemd/kaimoku-website-facts-check.service /opt/kaimoku-website/deploy/systemd/kaimoku-website-facts-check.timer /etc/systemd/system/'
    ssh build 'sudo systemctl daemon-reload && sudo systemctl enable --now kaimoku-website-facts-check.timer'

## First run (do not wait a day)

    ssh build 'sudo systemctl start kaimoku-website-facts-check.service; systemctl status kaimoku-website-facts-check.service --no-pager | head -n 12'
    ssh build 'journalctl -u kaimoku-website-facts-check.service -n 40 --no-pager -o cat'
    curl -s "https://ntfy.tail3558e0.ts.net/kaimoku-website-facts/json?poll=1&since=1h"

The journal must show `SELF-TEST OK: 2/2 mutants failed as required` before any
report rows; the ntfy poll must return a line titled `kaimoku-website facts check ran`.

## Reading a red run

- `PENDING  signup_url` is expected until `launch-1.5`; it is not a finding.
- `PENDING_NOW_PASSES signup_url` IS a finding: remove `pending: true` from
  `src/data/mail-facts.yaml` and re-word `signup-trial.md` Step 2 in the same commit.
- `SKIP  registrars.name-services.com` is by design (no panel URL upstream).
- `SELF-TEST FAILED` means the checker is broken, not the facts. Fix the checker
  first; nothing it reports until then is evidence.

## Update

The unit pulls `main` on every run, so a merged change to the checker or the
facts is live at the next timer tick. Only a change to the unit files needs the
`cp` + `daemon-reload` lines again.

## Remove

    ssh build 'sudo systemctl disable --now kaimoku-website-facts-check.timer && sudo rm /etc/systemd/system/kaimoku-website-facts-check.{service,timer} && sudo systemctl daemon-reload'
```

- [ ] **Step 5: Lint the unit files locally, commit them, and push the BRANCH (not main) so `build` can clone it**

`systemd-analyze` is not on macOS; the check is that `build` accepts them (`daemon-reload` reports nothing). Commit first:

```bash
git -C "$WT" add deploy/systemd
git -C "$WT" commit -m "deploy: systemd timer + install README for the daily facts check on build (launch-1.8)"
git -C "$WT" push -u origin feat/launch-1.8-agent-docs
```

Pushing a feature branch does not deploy (only `main` does). The clone on `build` checks out this branch for the first run and is switched to `main` after the merge in Task 15.

- [ ] **Step 6: Install on `build` (every ssh wrapped in `timeout`)**

```bash
timeout 20 ssh build 'sudo install -d -o macole -g macole /opt/kaimoku-website && git clone --quiet --branch feat/launch-1.8-agent-docs https://github.com/macole16/kaimoku-website.git /opt/kaimoku-website && echo cloned'
timeout 300 ssh build 'cd /opt/kaimoku-website && npm install --omit=dev --ignore-scripts --no-audit --no-fund 2>&1 | tail -n 3'
timeout 20 ssh build 'sudo cp /opt/kaimoku-website/deploy/systemd/kaimoku-website-facts-check.service /opt/kaimoku-website/deploy/systemd/kaimoku-website-facts-check.timer /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now kaimoku-website-facts-check.timer && systemctl list-timers kaimoku-website-facts-check.timer --no-pager'
```

Expected: `cloned`; npm ends with `added N packages`; `list-timers` shows one row with a `NEXT` time within 24 h + 30 min.

- [ ] **Step 7: Trigger the first run and watch it (criterion 6)**

```bash
timeout 300 ssh build 'sudo systemctl start kaimoku-website-facts-check.service; echo "unit exit: $?"; systemctl show kaimoku-website-facts-check.service -p ExecMainStatus -p Result --no-pager'
timeout 20 ssh build 'journalctl -u kaimoku-website-facts-check.service -n 40 --no-pager -o cat'
curl -s "https://ntfy.tail3558e0.ts.net/kaimoku-website-facts/json?poll=1&since=1h"
```

Expected: `ExecMainStatus=0`, `Result=success`; the journal contains `SELF-TEST OK: 2/2 mutants failed as required`, the `PENDING  signup_url` row and `SKIP  registrars.name-services.com`; the curl prints one JSON line with `"topic":"kaimoku-website-facts"` and `"title":"kaimoku-website facts check ran"`. Save the three outputs — they are the close evidence for criterion 6.

If `ExecMainStatus=1`: read the `FAIL` rows. A registrar 404 is a real finding (the panel URL rotted — fix `mail-facts.yaml` AND `registrar.go` upstream). A transport failure from `build` that passes from the laptop is an egress difference; note it and re-run once before treating it as real.

- [ ] **Step 8: Register the service in `SERVICES.md` (meta-workspace tier)**

Add this row to the Service Catalog table in `/Users/macole/github/SERVICES.md`, directly after the `docker-housekeeping` row (line 52 at the time of writing; re-find it with `grep -n '^| docker-housekeeping' SERVICES.md`). Columns: Service | Env | Type | Host | Compose path | Container | Health endpoint | Status | Maturity | Notes.

```
| kaimoku-website-facts-check | prod | `systemd` | build | /etc/systemd/system/kaimoku-website-facts-check.{service,timer} | `(none — systemd timer)` | Out-of-band: `journalctl -u kaimoku-website-facts-check -o cat`; heartbeat topic `curl -s "https://ntfy.tail3558e0.ts.net/kaimoku-website-facts/json?poll=1&since=48h"` (empty = timer dead). | ✓ | alpha | Daily Tier 2 check that `kaimoku-website/src/data/mail-facts.yaml` (the agent corpus's single source of nameservers, MX, SPF/DMARC, signup URL, registrar panel URLs) still matches live DNS/HTTPS. Runs `scripts/check-facts-live.mjs --self-test --ntfy` from a public clone at `/opt/kaimoku-website` with `/usr/bin/node` (no mise on build). Two mutants run BEFORE every real check and must exit 1; exit 2 = self-test failed and NO heartbeat is sent. `pending: true` facts (signup_url until launch-1.5) report PENDING, and PENDING_NOW_PASSES is a finding so the marker cannot become furniture. Findings go to topic `alerts`; heartbeat to `kaimoku-website-facts`. Canonical units + install README: `kaimoku-website/deploy/systemd/`. Tier 4 (audit-infra dead-timer check) is a separate bd issue. launch-1.8, 2026-09-01. |
```

Commit at the meta tier (no push — there is no remote):

```bash
git -C /Users/macole/github add SERVICES.md
git -C /Users/macole/github commit -m "SERVICES.md: catalog row for kaimoku-website-facts-check timer on build (launch-1.8)"
```

The pre-commit beads guard may warn about a pending bd export; that is condition (C) and is expected after `bin/weft claim`.

---
### Task 15: Merge, push to GitHub, verify live, run the end-to-end (criterion 7), file Phase 2, close

**Files:**
- No new files. Merges `feat/launch-1.8-agent-docs` into `main`.

**Interfaces:**
- Consumes: everything above
- Produces: criteria 1, 2 and 7 verified live; bd issues updated

- [ ] **Step 1: Final gates in the worktree**

```bash
cd "$WT" && mise exec -- npm run lint && bash scripts/verify-corpus.sh && mise exec -- node scripts/corpus-selftest.mjs
git -C "$WT" status --porcelain    # MUST be empty
```

Expected: lint silent; `all arms passed`; `corpus-selftest: 22 checks passed`; empty status.

- [ ] **Step 2: Merge to `main` and push to GitHub**

```bash
git -C /Users/macole/github/kaimoku-website checkout main
git -C /Users/macole/github/kaimoku-website pull --rebase
git -C /Users/macole/github/kaimoku-website merge --no-ff feat/launch-1.8-agent-docs -m "Merge feat/launch-1.8-agent-docs: agent-friendly docs corpus (launch-1.8)"
git -C /Users/macole/github/kaimoku-website push origin main
```

This push triggers the Vercel production deploy (the `prebuild` gate runs there too). Say "pushed to GitHub".

- [ ] **Step 3: Poll the deploy, then verify criteria 1 and 2 live**

Vercel deploys are async (~60-90 s). Poll for the NEW content, not for a 200 — the old revision also answers 200:

```bash
for i in $(seq 1 12); do
  if curl -sf "https://kaimoku-website.vercel.app/llms.txt" | grep -q "start-here.md"; then echo "deployed after ~$((i*15))s"; break; fi
  sleep 15
done
```

Then, each of these is close evidence — capture the output:

```bash
for f in start-here signup-trial dns-delegation migration troubleshooting-delivery; do
  printf '%s  ' "$f"; curl -sI "https://kaimoku-website.vercel.app/kuju-email/agent/${f}.md" | grep -i -E '^(HTTP|content-type)' | tr '\n' ' '; echo
done
curl -sI https://kaimoku-website.vercel.app/kuju-email/glossary.md | grep -i content-type
curl -sI https://kaimoku-website.vercel.app/kuju-email/docs.md | grep -i content-type
curl -s https://kaimoku-website.vercel.app/llms.txt
curl -s https://kaimoku-website.vercel.app/llms-full.txt | grep -c '^<!-- https://'
curl -sI https://kaimoku-website.vercel.app/kuju-email/agent/nope.md | head -n 1
curl -s https://kaimoku-website.vercel.app/robots.txt
```

Expected: five lines each `HTTP/2 200 content-type: text/markdown; charset=utf-8`; the two twins `text/markdown`; `llms.txt` lists all five runbook URLs plus the two reference URLs; the `grep -c` prints `7` (5 runbooks + 2 reference docs); `nope.md` is `HTTP/2 404`; `robots.txt` still reads `Disallow: /` (stealth intact).

If a `.md` URL serves `text/plain` on Vercel but `text/markdown` locally, apply the `next.config.ts` `headers()` fallback named in Task 5 Step 6, push again, re-verify.

- [ ] **Step 4: Switch the clone on `build` to `main`**

```bash
timeout 60 ssh build 'cd /opt/kaimoku-website && git checkout --quiet main && git pull --ff-only --quiet && git branch --show-current'
```

Expected: `main`. (The unit's `git pull --ff-only` now tracks `main` for every future run.)

- [ ] **Step 5: Criterion 7 — an agent follows `dns-delegation.md` against real domains**

Dispatch a fresh subagent (any model) with ONLY this prompt, and score its transcript; do not coach it:

> You are a customer's AI assistant. Fetch https://kaimoku-website.vercel.app/kuju-email/agent/start-here.md and then https://kaimoku-website.vercel.app/kuju-email/agent/dns-delegation.md. Follow dns-delegation for the domain `kuju.email` through Step 2 only, then stop and tell me: the exact registrar you identified, the exact DNS panel URL you would give me, and the exact nameserver values you would ask me to set. Then, separately, run Step 5 of the same runbook for the domain `demo.kuju.email` and report each record as PASS or MISSING with the observed value. Run only the commands the runbook shows.

Score against these measured answers (2026-09-01):

| Item | Correct answer |
| --- | --- |
| `dig NS kuju.email` first host | `irma.ns.cloudflare.com` (or `james.ns.cloudflare.com`; either) |
| registrar identified | **Cloudflare** via substring `cloudflare.com` |
| panel URL given | `https://dash.cloudflare.com` |
| nameservers to set | `ns1.kuju.email`, `ns2.kuju.email` |
| Step 5 MX for `demo.kuju.email` | PASS, `10 mail.kuju.email.` |
| Step 5 SPF | PASS, `"v=spf1 mx ~all"` |
| Step 5 DMARC | PASS, starts `v=DMARC1; p=quarantine` |
| Step 5 DKIM | the agent must STOP at the HUMAN ACTION (ask for the selector), not invent one |
| commands run | only `dig` / `nslookup` / `curl -sI` / `openssl s_client` |

All nine must match. If the agent suffix-matched (e.g. reported "no registrar found" for a Cloudflare host) or invented a DKIM selector, the runbook wording is at fault: fix the wording in `src/content/agent/dns-delegation.md`, re-run Tasks 8-style gate + push, and repeat this step. Paste the agent's four answers into the close.

- [ ] **Step 6: File Phase 2 (Tier 4) with the complete design, and link it**

```bash
cd /Users/macole/github && bd create --parent launch-1 --force --type=task --title="Tier 4: audit-infra dead-timer check for kaimoku-website-facts-check (corpus freshness safety net)" --description="Phase 2 of launch-1.8 (spec section 4, Tier 4). A dead Tier 2 timer and a passing one are indistinguishable from outside; this check makes a dead one visible. DESIGN (no further design work needed): add kaimoku-lens/internal/audit/check_corpus_freshness.go, registered in run.go next to CheckCertExpirySanity. Evidence: GET https://ntfy.tail3558e0.ts.net/kaimoku-website-facts/json?poll=1&since=48h from the Mac (tailnet). Finding when the poll returns zero lines: CheckID corpus-freshness-timer-dead, Cluster prod, Object build:kaimoku-website-facts-check.timer, Severity warning, Title 'kaimoku-website facts check has not reported in 48h', Detail naming journalctl -u kaimoku-website-facts-check on build and deploy/systemd/README.md, Fingerprint Fingerprint(checkID, cluster, object). Also emit a finding when the most recent line's title is not 'kaimoku-website facts check ran' (the alert path posted but the heartbeat did not — self-test failure). A poll transport error is audit-collector-degraded, not a finding. Test: check_corpus_freshness_test.go with three fixtures (fresh heartbeat -> none; empty -> dead; transport error -> degraded). Gate: the Tier 2 timer must have >= 2 observed daily runs first (first run 2026-09-01, launch-1.8)."
```

Read the new id from the output (call it `<new-id>`), then:

```bash
cd /Users/macole/github && bd dep add <new-id> launch-1.8
cd /Users/macole/github && bd defer <new-id> --until="2026-09-04"
```

- [ ] **Step 7: Close `launch-1.8` with evidence, release, clean up**

```bash
cd /Users/macole/github && bd note launch-1.8 "CLOSE EVIDENCE (paste): (1) five curl -sI lines showing HTTP/2 200 + text/markdown; (2) llms.txt body; (3) Task 8 Step 6/7 build-fail output (unknown fact; denylisted command); (4) Task 13 Step 4 two mutant lines with exit=1 and Step 5 SELF-TEST FAILED exit=2; (5) build journal SELF-TEST OK + ntfy heartbeat JSON line; (6) Task 15 Step 5 agent answers: registrar/panel/nameservers/Step 5 rows. Tier 4 filed as <new-id> (Phase 2). Registrar map: 11 keys ported; spec said 7. Registrar verify: reject 404/410 (spec's expect [200,302] failed 3/9 live). Customer-observable impact: none — static routes added, no existing route changed, robots.txt still Disallow: /."
cd /Users/macole/github && bd close launch-1.8 --reason "Shipped: corpus live at kaimoku-website.vercel.app (5 runbooks + llms.txt/llms-full.txt + glossary.md/docs.md), Tier 1 prebuild gate observed failing on both mutations, Tier 2 timer on build observed running with ntfy heartbeat, Tier 3 mutants observed exit=1. See close-evidence note."
cd /Users/macole/github && bin/loom release launch-1.8
```

Worktree teardown (hand-managed for a per-project worktree):

```bash
git -C /Users/macole/github/kaimoku-website worktree remove .claude/worktrees/agent-docs
git -C /Users/macole/github/kaimoku-website branch -d feat/launch-1.8-agent-docs
git -C /Users/macole/github/kaimoku-website worktree list
git -C /Users/macole/github/kaimoku-website status   # MUST show "up to date with 'origin/main'"
```

Then commit the bd snapshot at the meta tier:

```bash
git -C /Users/macole/github add .beads/issues.jsonl
git -C /Users/macole/github commit -m "bd: close launch-1.8 (agent-friendly docs corpus shipped); file Tier 4 follow-up"
```

---

## Spec corrections applied (encoded in the plan; NOT silently adopted)

| # | Spec said | Measured 2026-09-01 | What the plan does |
| --- | --- | --- | --- |
| 1 | Registrar map has "seven URLs" (section 2); bd description names six registrars | `kuju-mail/internal/api/registrar.go:15-27` has **11 keys, 10 with a DNSLink**; `name-services.com` (Enom / Tucows) has none | `mail-facts.yaml` carries all 11 verbatim; `renderRegistrarTable` prints 11 rows; the live checker reports the URL-less entry as `SKIP registrars.name-services.com` by name; `dns-delegation.md` Step 2 has an explicit "no panel link" branch that names the registrar and hands off |
| 2 | "Match the NS suffix against the table" (section 3 example) | `registrar.go:42` is `strings.Contains(host, suffix)` on `nss[0].Host` only, lowercased, trailing dot stripped; `awsdns` and `azure-dns` are infixes | Step 2 instructs a substring test on the FIRST host with a worked `ns-1234.awsdns-56.org` example; the selftest asserts the example is present |
| 3 | Two placeholder syntaxes (section 3) | A third, `{domain}`, exists in registrar URLs and in the DMARC template — a single-brace prefix of `{{fact:...}}` | `{domain}` is kept verbatim ONLY inside `mail-facts.yaml`; `resolveFact` rewrites it to `<domain>` on emission; `check-corpus.mjs` rejects any single-brace token in a rendered runbook (`M3` arm); runbook authors must therefore avoid curl `-w '%{http_code}'` too |
| 4 | Registrar `verify: {type: http, expect_status: [200, 302]}` (section 2) | Live with a browser UA: Cloudflare **403**, Azure **403**, GoDaddy deep link **504** (Akamai edge; root 301), Namecheap 302, Squarespace 200, AWS 302, DO 302, Linode 200, Hover 302. The spec's rule fails 3 of 9 on day one — the exact "trains people to ignore red" pathology section 4 warns about | `reject_status: [404, 410]` (the URL is still routed) with one retry on transport failure; `signup_url` keeps `expect_status: [200]` |
| 5 | Section 1 URL table lists the twins only | `docs.md` legitimately contains `{id}`-style OpenAPI paths | The single-brace check applies to hand-authored runbooks only; generated twins are not subject to the denylist or brace check (they are not instructions) |
| 6 | Section 2 lists three kinds of fact and says kind 2 (product config) is "not documented"; section 3 (revised) REQUIRES documenting the 2 GB cap | Both stand: the cap is a beta promise the spec explicitly wants in `migration.md` | `test_migration_cap_gb: {value: 2}` with NO verify block, reported `SKIP` by the live checker; referenced once from `migration.md` so a cap change is a one-line edit |
| 7 | Front-matter fields: `slug, title, preconditions, outcome, facts_used` | `llms.txt` needs a stable runbook order; directory order is alphabetical (wrong) | Adds `order: <int>` (required, unique); everything else as specified |

## Open questions for the reviewer

**ALL FIVE RESOLVED 2026-09-01. The plan is APPROVED; the review gate is CLOSED.** Questions 1 and 5 were answered explicitly (stay silent on trial terms; Tier 4 as Phase 2). Questions 2-4 were put to the reviewer alongside the plan and accepted as written — `reject_status` for registrar panels, ~150 MB of `node_modules` on `build`, and a daily cadence. **Do not re-open any of these during execution.** Each remains a one-line change if reality later argues otherwise; the record below says what was decided and why, so a future change is a decision rather than a rediscovery.

1. **RESOLVED 2026-09-01 — stay silent. Trial length in `signup-trial.md`.** The spec names "14-day trial" as the model of a documentable promise, and the pricing FAQ says every signup "will get a 14-day trial" *when Kuju Email opens*. Whether an invite-redeemed beta account carries that trial is not established anywhere (`beta-1.3`/`beta-1.4` are open). The runbook therefore says nothing about trial terms and the selftest asserts it does not. If the beta DOES promise 14 days, add `trial_days: {value: 14}` to `mail-facts.yaml` and one sentence to Step 4 — one commit, gate-checked.
2. **RESOLVED 2026-09-01 — accepted as written. Registrar verification semantics.** Correction 4 above replaces the spec's `expect_status` with `reject_status`. The consequence is that a panel URL that starts returning a bot-wall 403 *forever* still passes. That is the honest limit of what an HTTP status can tell you about a third-party panel (spec section 2: "HTTP status only; changes without notice"); the alternative — per-registrar expected codes measured today — would page on every WAF change. Confirm this is the intended trade.
3. **RESOLVED 2026-09-01 — accepted as written. `node_modules` on `build`.** The unit runs `npm install --omit=dev --ignore-scripts` so the checker can import `yaml`; that pulls `next`/`react` too (~150 MB on a 243 GB disk with 135 GB free). The alternative, a dependency-free checker, would mean a hand-written YAML parser. Accepting the disk cost; flagging it because the spec says "the unit needs only node and a clone".
4. **RESOLVED 2026-09-01 — accepted as written (daily). Daily cadence.** `OnCalendar=daily` mirrors `renovate.timer`. If registrar-panel rot within a day matters more than the noise, `*-*-* 00,12:00:00` is a one-line change.
5. **RESOLVED 2026-09-01 — accepted. Tier 4 as Phase 2** (see the scope decision): the reviewer accepts closing `launch-1.8` with Tier 4 tracked in its own issue rather than shipped. Task 15 Step 6 files it with the design complete; do not re-open this question during execution.

## Self-review

**Spec coverage.** Section 1 source layout → Tasks 2-4, 8-12 (`src/content/agent/`, `mail-facts.yaml`, `agent-corpus.ts`, `check-corpus.mjs`); served URLs → Tasks 5-7 (`/llms.txt`, `/llms-full.txt`, `/kuju-email/agent`, `/kuju-email/agent/<slug>.md`, `glossary.md`, `docs.md`); mechanics (explicit `.md`, `force-static`, `generateStaticParams`, `SITE_URL`) → Tasks 1, 5. Section 2 schema and three kinds → Task 2; accepted duplication → Task 2 + correction 1. Section 3 format rules → Task 3 (`FACT_RE`, `SINGLE_BRACE_RE`, `<domain>`), Task 4 (observation tables, HUMAN ACTION); per-runbook constraints → Tasks 10-11 with selftest pins; read-only by construction → Task 3 `DENYLIST` + Task 8. Section 4 Tier 1 bullets: fact resolution, `facts_used`, denylist, internal links, orphans → Task 8 arms M0-M8; Tier 2 → Tasks 13-14 (units, README, ntfy, `pending` both halves); Tier 3 → Task 13 Steps 4-5 (mutants as separate processes, before every real check, exit 2 aborts); Tier 4 → Task 15 Step 6 (Phase 2 issue with design). Section 5 out-of-scope: no API/MCP, no MDX, no cross-repo sharing, no Probe CRs, no knobs — honoured. Section 6 gates: `launch-1.5` (`pending`), `beta-1.3/1.4/1.5` (Task 11), `beta-1.6/1.10` (Task 10), `launch-1.14` (robots untouched; verified in Task 15 Step 3). Section 7 criteria: 1-2 → Task 15 Step 3; 3-4 → Task 8 Steps 6-7 (watched); 5 → Task 13 Step 4 (watched) and Step 5 (the self-test itself falsified); 6 → Task 14 Step 7; 7 → Task 15 Step 5.

**Placeholder scan.** No "TBD"/"TODO"/"implement later"/"add validation"/"similar to Task N". The two functions declared as stubs in Task 5 are filled in Task 6 with full code. Every runbook is written in full. Every command is literal.

**Type consistency.** `buildCorpusIndex()`, `renderLlmsTxt()`, `renderLlmsFullTxt()`, `renderGlossaryMarkdown()`, `renderApiDocsMarkdown()`, `MARKDOWN_HEADERS`, `TEXT_HEADERS` are used with the same names in Tasks 5, 6, 7. Core names `loadFacts`, `resolveFact`, `interpolate`, `normaliseRuntimePlaceholders`, `registrarEntries`, `renderRegistrarTable`, `parseFrontMatter`, `extractCodeLines`, `scanDenylist`, `extractInternalLinks`, `loadRunbooks`, `renderRunbook`, `absolutiseLinks`, `buildIndex`, `RUNBOOK_URL_PREFIX`, `FACT_RE`, `SINGLE_BRACE_RE`, `DENYLIST`, `REQUIRED_META` are identical across Tasks 2, 3, 4, 8, 13. Harness helpers `arm`, `header_arm`, `body_arm`, `fresh_copy`, `check_on`, `NODE` are defined once (Tasks 2, 5, 8) and used unchanged after. Sentinels (`corpus OK`, `unknown fact`, `denylisted command`, `single-brace token`, `facts_used`, `broken link`, `front-matter`, `order`, `slug`, `SELF-TEST OK`, `PENDING`, `PENDING_NOW_PASSES`, `SKIP`, `mutant-failed-as-required`) are the same strings in the code and in the arms that score them.
