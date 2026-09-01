# Agent-Friendly Docs Design

**Date:** 2026-08-31
**Revised:** 2026-09-01 — Sections 1, 3 and 6, for the closed-beta decision (`beta-1`)
and the `launch-1.1` resolution. See the revision note at the end.
**Status:** Design approved; spec awaiting review
**Issue:** bd `launch-1.8` (child of `launch-1`, Kuju Mail public launch readiness)
**Scope:** A static, instruct-only documentation corpus on `kaimoku-website` that a customer's AI agent can consume to walk them through Kuju Email signup, DNS delegation, migration, and delivery troubleshooting.

## Overview

Kuju Email's hardest onboarding step is DNS delegation, and it is hard in a way that
suits an LLM better than a screenshot guide: the correct instructions depend on the
customer's registrar, and the current state is readable with one `dig`. This design
adds a parallel, agent-native documentation corpus — markdown written to be executed
by an agent rather than read by a person — alongside the existing human docs.

The corpus is **static and instruct-only**. It contains no credentials, no
authentication, no write operations, and no live API. An agent reads it, tells the
human what to do, and verifies the result with read-only commands. This was a
deliberate choice over a read-only API and over a Kuju MCP server; see Design
Decisions.

The design's central problem is **drift**: a documentation file that confidently
asserts a stale nameserver is worse than no file, because an automated consumer will
act on it without the scepticism a human reader would apply. Everything in Section 2
and Section 4 exists to address that.

## Design Decisions

- **Instruct-only, not an API or an MCP server.** A read-only API would let the agent
  report real verification status instead of inferring it, and an MCP server could
  provision domains directly. Both were rejected for launch: they need an authz model,
  rate limiting and a public API contract, and an MCP server puts destructive
  operations behind a non-deterministic caller before there is a single paying
  customer. The static corpus solves the actual bottleneck (DNS delegation) with zero
  new attack surface and can ship before launch.

- **Agent docs and human docs are different documents, not two renderings of one.**
  A human guide reassures; an agent runbook commands and verifies. Converting
  `guide/page.tsx` to MDX so both render from one source was considered and rejected:
  it is a ~1,700-line refactor across `guide/page.tsx` and `docs/page.tsx`, those pages
  carry bespoke design that a generic markdown renderer loses, and — more importantly —
  it would force the two audiences to share prose, making both worse.

- **Share the facts, not the prose.** The prose diverges freely; every volatile *value*
  lives once, in `src/data/mail-facts.yaml`, imported by both the TSX pages and the
  agent runbooks. This is the seam that makes independent prose safe.

- **Document the promise, never the knob.** Contractual claims (14-day trial) are
  documented. Operational knobs (`daily_send_limit`, `quota_bytes`) are not, because
  they live in a different repo as env-var defaults that can be overridden at deploy
  time, and the website cannot observe them. Runbooks teach the agent to *interpret a
  limit when it is hit* rather than assert a number.

- **No `/kuju-email/guide.md`.** The guide stays human-only. Its agent counterpart is
  the four runbooks — a purpose-built rewrite, not a lossy conversion. This is the
  direct consequence of the second decision and is stated explicitly so no future
  reader expects parity.

- **Verification is time-triggered, not commit-triggered.** Docs go stale because the
  world changed, not because someone edited a file. A pre-commit or PR check fires
  exactly when the docs are freshest. See Section 4.

---

## 1. Corpus structure and URL scheme

### Source layout

All new files. No refactor of existing pages.

```
src/content/agent/           markdown-first runbooks, hand-authored
  start-here.md
  dns-delegation.md
  signup-trial.md
  migration.md
  troubleshooting-delivery.md
src/data/mail-facts.yaml     single source for volatile values
src/lib/agent-corpus.ts      loads, interpolates facts, builds the index
scripts/check-corpus.mjs     build gate (Section 4, Tier 1)
```

### Served URLs

| URL | Content | Derived from |
| --- | --- | --- |
| `/llms.txt` | Curated map; short, links out | corpus index |
| `/llms-full.txt` | Entire corpus flattened into one file | corpus index |
| `/kuju-email/agent` | Human landing page: "hand this to your agent", copy buttons | TSX |
| `/kuju-email/agent/<slug>.md` | One runbook, `text/markdown` | `src/content/agent/` |
| `/kuju-email/glossary.md` | Generated twin | `src/lib/glossary.ts` |
| `/kuju-email/docs.md` | Generated twin | `openapi.yaml` + `api-overlay.yaml` |

### Mechanics

- **Explicit `.md` suffixes, not content negotiation.** Serving markdown on
  `Accept: text/markdown` is more elegant and wrong here: it is invisible, untestable
  from a browser, and fails silently when a client sends `*/*` (most do). A suffix is
  a URL a human can paste to an agent, which is the actual delivery mechanism.
- **Next.js route handlers with `dynamic = 'force-static'`**, not files in `public/`.
  Both serve identical bytes; only the route handler *derives* them from source at
  build time. Anything hand-copied into `public/` is a second copy of the facts, which
  is what this design exists to prevent.
- `generateStaticParams` enumerates runbook slugs so every `.md` route is prerendered.
- **Absolute URLs come from one constant, and that constant is the `vercel.app` host.**
  `llms.txt` links out by convention, so the corpus needs an absolute base.
  `src/app/layout.tsx` already defines `SITE_URL = "https://kaimoku-website.vercel.app"`
  and points `metadataBase` at it; the corpus reuses that constant rather than minting a
  second one. `kaimoku.tech` is **not** the base — as of 2026-09-01 it does not resolve
  at all (Section 6). Hardcoding the branded host would ship a corpus of dead links to
  the one class of consumer least equipped to be sceptical about them.

---

## 2. The facts layer

### Three kinds of fact

The distinction determines what can be verified and how:

| Kind | Example | Verifiable by |
| --- | --- | --- |
| Our infrastructure | nameservers, MX target | live DNS query |
| Our product config | trial length, send caps | nothing the website can observe (different repo, env-overridable) |
| Third-party | registrar DNS-panel URLs | HTTP status only; changes without notice |

Kind 2 is the trap. It is handled by **not documenting it** (see Design Decisions),
which deletes the drift class rather than building machinery to manage it.

### Schema

`src/data/mail-facts.yaml`. Every entry carries its verification intent inline, so the
checker in Section 4 reads the same file the docs do.

```yaml
nameservers:
  value: [ns1.kuju.email, ns2.kuju.email]
  verify: {type: dns, record: A, expect: nonempty}

mx:
  target: mail.kuju.email
  priority: 10
  verify: {type: dns, name: kuju.email, record: MX,
           expect_contains: "10 mail.kuju.email."}

customer_domain_records:
  spf:   "v=spf1 mx ~all"
  dmarc: "v=DMARC1; p=quarantine; rua=mailto:postmaster@{domain}"
  verify: {type: dns, name: demo.kuju.email, record: TXT}

signup_url:
  value: "https://mail.kuju.email/signup"
  pending: true    # returns 303 -> /login until launch-1.5 enables the demo
  verify: {type: http, expect_status: 200}

registrars:        # ported from kuju-mail internal/api/registrar.go
  registrar-servers.com: {name: Namecheap, dns_url: "..."}
  domaincontrol.com:     {name: GoDaddy,   dns_url: "..."}
  verify: {type: http, expect_status: [200, 302]}
```

Every value above was measured live on 2026-08-31, not assumed.

### Accepted duplication

The registrar map duplicates `kuju-mail/internal/api/registrar.go`. Building cross-repo
sharing for seven URLs is not worth it; the scheduled check in Section 4 catches rot.
This is recorded as a deliberate choice, not an oversight.

---

## 3. Runbook format

Markdown with YAML front-matter. Structured so an agent never advances on assumption.

```markdown
---
slug: dns-delegation
title: Delegate your domain's DNS to Kuju
preconditions: [owns a domain, can log in to their registrar]
outcome: NS points at Kuju; MX/SPF/DKIM/DMARC verify
facts_used: [nameservers, mx, customer_domain_records, registrars]
---

## Step 1 - Find who runs this domain's DNS

    dig NS <domain> +short

| Observation | Next |
| --- | --- |
| empty | Step 1a - domain may be unregistered |
| ends in `.kuju.email` | Step 5 - already delegated, verify only |
| anything else | Step 2 |

## Step 2 - Identify the registrar

Match the NS suffix against the table below.

> **HUMAN ACTION** - you cannot do this step. Give the customer the exact URL
> and the exact two values, then wait for them to confirm.
> Set custom nameservers to:
>   {{fact:nameservers.0}}
>   {{fact:nameservers.1}}
```

### Three format rules, each load-bearing

1. **Two placeholder syntaxes, deliberately different.** `{{fact:...}}` resolves at
   **build** time from `mail-facts.yaml`. `<domain>` is left literal for the agent to
   fill at **run** time. If they shared one syntax, a misspelled fact name would
   silently degrade into a runtime placeholder and the agent would invent a plausible
   value. **An unknown `{{fact:...}}` fails the build.**

2. **Every step branches on an observation, never on narrative.** "If output is empty"
   is checkable. "If you haven't set up DNS yet" invites the agent to guess.

3. **An explicit `HUMAN ACTION` marker.** An agent cannot click through a registrar UI,
   and the failure mode when it tries is not an error — it is the agent *claiming* it
   did. The marker makes handoff structural rather than a thing an author must remember.

### Per-runbook content constraints

Two runbooks are constrained by decisions taken after this spec's first draft — the
closed-beta shape agreed 2026-09-01. Both are *content* requirements rather than format
ones, and both are wrong-by-default if left unstated.

**`signup-trial.md` documents invite redemption, not open self-serve signup.** The beta
is invite-gated (`beta-1`): a Site Admin issues an invite carrying **one secret rendered
two ways** — a clickable link and a human-typeable code such as `KUJU-7F3K-9QM2`
(`beta-1.3`) — and redemption is followed by a flow choice between a mailbox on the demo
domain and bring-your-own-domain (`beta-1.4`). A runbook describing an open signup page
would instruct the agent to walk a customer to a door that is not there. It must also
neither state nor infer a plan tier: the invite deliberately does not encode one
(`beta-1.5`).

**`migration.md` documents the estimator and the per-account cap together.** Neither is
complete without the other:

- The estimator (`beta-1.6`) is an IMAP `RFC822.SIZE` dry run — metadata only, no bodies
  transferred — so the agent can answer "how big is my mailbox and how long will this
  take" before anything starts. The runbook carries its two caveats: Gmail's virtual
  folders double-count a heavily-labelled account 2-3x unless counting `[Gmail]/All Mail`
  alone, and `RFC822.SIZE` is **wire** size, not disk size.
- The cap (`beta-1.10`) is **2 GB per account**, and the single most important thing the
  runbook can say about it is that **hitting the cap is a PAUSE — not a failure, and not
  a restart.** The import checkpoints `last_folder`/`last_uid`, seeds `bytes_imported`
  from the job on resume, and dedupes on persisted content keys, so converting to a
  paying customer *resumes* the same job rather than re-importing. An agent that reads a
  cap-stop as an error will tell the customer their migration failed — wrong, and exactly
  the anxiety this corpus exists to reduce.
- Because the worker imports newest-first, the capped slice is the customer's *recent*
  mail. Describe the cap in time using the estimator ("your mailbox is 18 GB; the test
  brings your most recent 2 GB, roughly your last 5 months") rather than as a bare byte
  count.

### Read-only by construction

Every command in the corpus is read-only: `dig`, `curl -sI`, `openssl s_client`.
Nothing writes, authenticates, or destroys. Because a customer's agent may execute
these autonomously on a machine we never see, this is enforced mechanically rather
than by authorial discipline — see Tier 1.

---

## 4. Verification

### Tier 1 - build gate (blocks the deploy)

`scripts/check-corpus.mjs`, wired as `prebuild` so Vercel's `npm run build` runs it and
a failure stops the deploy. Purely structural; no network. This repo currently has **no
CI at all**, so the build is the only gate available and the cheapest place to add one.

- every `{{fact:...}}` resolves to a real key in `mail-facts.yaml`
- each runbook's `facts_used` front-matter matches what it actually references
- no write-verb commands anywhere in the corpus (denylist: `rm`, `curl -X POST`,
  `-u`/`--user`, `nsupdate`, anything with a credential flag)
- every internal link resolves to a real route
- `llms.txt` covers every runbook; no orphans

### Tier 2 - scheduled reality check (reports, never blocks)

A **systemd timer on the `build` host**. Precedent exists there:
`docker-housekeeping.timer` and `renovate.timer`. The unit pulls the repo, reads
`mail-facts.yaml`, and runs each `verify:` block against live DNS and HTTPS, reporting
via ntfy.

**Canonical source is repo-tracked at `kaimoku-website/deploy/systemd/`** — the
`.service`, the `.timer`, and an install README — following the `kuju-cert-sync`
precedent recorded in `SERVICES.md`, where keeping the unit in the repo is what lets a
from-scratch host rebuild reprovision it. `.git/hooks` and `/etc/systemd/system` are
not version-controlled; a unit that exists only on the box is one reinstall from gone.
The check script itself is `scripts/check-facts-live.mjs` in the same repo, so the unit
needs only node and a clone.

GitHub Actions was considered and rejected — this is the estate's only repo whose
`origin` is GitHub, and introducing a second CI system for one scheduled job is not
worth it. Prometheus blackbox probes were also considered: the estate already runs
blackbox with `Probe` CRs, `PrometheusRule` alerts and promtool tests, and a `dns`
module supports `validate_answer_rrs`. It was rejected as the *primary* mechanism
because a Probe CR checks **reality**, not **the documented facts** — it never reads
`mail-facts.yaml`, so a wrong edit to that file would leave the probe green. Blackbox
remains a reasonable future addition as an independent second oracle.

**The `pending:` escape hatch is required, not optional.** `signup_url` fails its own
check today by design. A check that ships red for a known reason trains people to
ignore red, at which point it stops catching the real thing. So:

- `pending: true` means known-divergent, deliberately; do not alarm.
- **The checker also fails when a `pending` fact starts passing**, forcing the marker
  to be removed rather than becoming permanent furniture. This second half is the part
  usually forgotten, and it is what stops `pending` from becoming a way to switch
  checks off silently.

### Tier 3 - falsifiability

A green check nobody has watched fail is not evidence. The failure mode specific to a
staleness checker is that it silently stops checking.

- A mutant fixture substitutes `ns-does-not-exist.kuju.email` into a copy of
  `mail-facts.yaml`; the checker must exit non-zero.
- A second mutant flips a `pending` fact to a passing value; the checker must exit
  non-zero on the "pending fact now passes" rule.
- Both mutants run **immediately before the real check on every Tier 2 run**, not in
  Tier 1 — Tier 1 is offline by specification, and a mutant asserting that
  `ns-does-not-exist.kuju.email` fails resolution requires a DNS lookup.

Running them per-scheduled-run rather than once at build is the stronger choice: the
checker proves it can still fail *every time it runs*. If the mutant pass ever comes
back green, the run aborts and reports, because at that point the real check's green is
meaningless.

### Tier 4 - safety net

Corpus freshness is added as a check in the existing `audit-infra` sweep, which already
files deduped bd issues keyed by fingerprint. This covers the case where the Tier 2
timer itself dies — a dead timer and a passing timer are indistinguishable from outside.

---

## 5. Out of scope

- Any live API, MCP server, or authenticated agent access.
- Converting `guide/page.tsx` or `docs/page.tsx` to MDX.
- Cross-repo sharing of the registrar map with `kuju-mail`.
- Blackbox `Probe` CRs (deferred; noted above as a future second oracle).
- Documenting operational knobs (send caps, quotas).

## 6. Gates and dependencies

| Gate | State | Effect |
| --- | --- | --- |
| `launch-1.1` (kaimoku.tech publicly broken) | **CLOSED** — resolved by *unpointing* the DNS, not by repairing the Vercel mapping | `kaimoku.tech` and `www.kaimoku.tech` no longer resolve at all (measured 2026-09-01: both NXDOMAIN; `kaimoku-website.vercel.app` answers 200). The corpus's only host is the `vercel.app` one. Re-attaching the branded domain is `github-j3x`, **deferred**, so this is the steady state rather than a short wait — which is why Section 1 pins absolute URLs to `SITE_URL`. |
| `launch-1.5` (demo signup enabled) | OPEN | `signup_url` 303s to `/login` today. Ships with `pending: true`; the runbook is authored but must not claim a working signup until this closes. |
| `beta-1.3` / `beta-1.4` (invite issuance; post-redemption flow choice) | OPEN | Govern what `signup-trial.md` may say — redemption of an issued invite, never open signup. See Section 3. |
| `beta-1.6` / `beta-1.10` (size estimator; 2 GB cap) | OPEN | Govern what `migration.md` may say. Authored against the agreed behaviour; its facts must be re-verified against the shipped implementation before any of them drop `pending`. |
| `launch-1.14` (crawl block flipped) | OPEN | `robots.ts` disallows everything, so well-behaved `llms.txt` consumers are blocked. The corpus ships dark and lights up at launch. The download-and-hand-to-your-agent path works before then; agent *discovery* does not. |

Stealth is in force. Nothing in this design authorizes a go-public action.

## 7. Success criteria

1. All five markdown files exist and are served at their `.md` URLs with
   `Content-Type: text/markdown`.
2. `/llms.txt` and `/llms-full.txt` are generated, not hand-maintained, and cover every
   runbook.
3. A deliberately misspelled `{{fact:...}}` fails `npm run build`.
4. A write-verb command added to any runbook fails `npm run build`.
5. Both Tier 3 mutants produce a non-zero exit; this is demonstrated, not asserted.
6. The Tier 2 timer runs on `build` and delivers a report via ntfy, with at least one
   observed run.
7. `dns-delegation.md` end-to-end: given a real domain on a registrar in the map, an
   agent following it produces correct, registrar-specific instructions and correctly
   verifies delegation afterward.

---

## Revision note — 2026-09-01

Four corrections, all made *before* the spec's first review so the review is spent on
the design rather than on known-stale content. Each premise was re-verified rather than
carried forward from the ticket text.

| # | Change | Why | Verified by |
| --- | --- | --- | --- |
| 1 | Section 6: `launch-1.1` row rewritten | Closed by unpointing DNS, not by repairing the mapping — the opposite resolution to the one the row assumed | `dig +short kaimoku.tech` and `www` both empty; `curl` exits 6 (could not resolve); `kaimoku-website.vercel.app` returns 200 |
| 2 | Section 1: absolute URLs pinned to `SITE_URL` | Follows from #1 — `llms.txt` uses absolute URLs and the branded host is gone | `src/app/layout.tsx:32` already defines the constant and `metadataBase` uses it |
| 3 | Section 3: `signup-trial.md` documents invite redemption | The beta is invite-gated; an open-signup runbook would be wrong | `beta-1.3` (one secret, two renderings), `beta-1.4` (flow choice), `beta-1.5` (no tier in the invite) |
| 4 | Section 3: `migration.md` carries estimator + 2 GB cap, cap framed as a pause | A cap-stop read as an error is a worse outcome than no runbook | `beta-1.6` (`RFC822.SIZE` dry run + Gmail/wire-size caveats), `beta-1.10` (resumability verified in `worker.go` / `dedupe.go` on 2026-09-01) |

Unchanged: every design decision, the facts-layer schema, the runbook format rules, and
all four verification tiers. The four verify-first facts this design rests on were
re-measured on 2026-09-01 and all still hold — checkout URLs are still `#coming-soon`,
`guide/page.tsx` is still 1,186 lines of hand-written JSX with no markdown source, the
repo still has no CI at all, and `origin` is still GitHub directly.
