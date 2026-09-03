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

# evidence <text>: first 5 and last 5 lines, with a marker when anything was cut.
# tail alone truncated the real "Cannot find module" line out of a RED transcript.
evidence() {
  local n; n="$(printf '%s\n' "$1" | wc -l | tr -d ' ')"
  if [[ "$n" -le 10 ]]; then printf '%s\n' "$1"; return; fi
  printf '%s\n' "$1" | head -n 5
  echo "  ... ($((n - 10)) lines omitted) ..."
  printf '%s\n' "$1" | tail -n 5
}

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
    echo "FAIL  ${name}: expected exit 0, got ${rc}"; evidence "$out"; FAILS=$((FAILS + 1)); return
  fi
  if [[ "$expect" == "fail" && "$rc" -eq 0 ]]; then
    echo "FAIL  ${name}: expected non-zero exit, got 0"; evidence "$out"; FAILS=$((FAILS + 1)); return
  fi
  if [[ "$out" != *"$must"* ]]; then
    echo "FAIL  ${name}: expected output to contain: ${must}"; evidence "$out"; FAILS=$((FAILS + 1)); return
  fi
  echo "PASS  ${name}"
}

# mise exec, not a bare node: the shell's node is 26.7.0, .mise.toml pins 22.11.0.
NODE=(mise exec -- node)

arm "1 core selftest" pass "corpus-selftest:" -- "${NODE[@]}" "$ROOT/scripts/corpus-selftest.mjs"

# ---------------------------------------------------------------------------
# Tier 1 mutation arms (M0-M14) for scripts/check-corpus.mjs. Each M1-M14 arm
# copies the corpus to a scratch dir, mutates the copy in exactly ONE way,
# and asserts the checker fails WITH THE SENTINEL SPECIFIC TO THAT MUTATION
# -- never just a non-zero exit, since a checker that crashed for an
# unrelated reason (a typo in the checker itself, a missing module) would
# also exit non-zero and could satisfy a naive "expects failure" arm.
#
# M0 is a deliberate addition beyond M1-M14: an UNMUTATED-BASELINE arm that
# runs the checker against a pristine copy of the real corpus and asserts
# exit 0 plus the success sentinel "corpus OK". Without it, every M1-M14
# "PASS" could be passing for the wrong reason -- e.g. a checker that always
# exits 1 regardless of input would pass all fourteen failure arms and never
# be caught, because none of them alone proves the checker can ALSO recognize
# a clean corpus. M0 is the negative control that gives M1-M14 meaning.
#
# KEEP THE COUNTS CURRENT when you add an arm. This block said "M0-M8" and
# "all eight failure arms" while fourteen were running -- caught by the
# launch-1.26 simplify pass, which noted that every OTHER count in that branch
# (check-facts-live's "seven mutants", EXPECTED_MUTANT_COUNT, the L1 sentinel)
# had been updated in the same commit and only this block was missed. A comment
# that undercounts its own family by six is the exact drift this file exists
# to prevent, one level up.
# ---------------------------------------------------------------------------
CHECK="$ROOT/scripts/check-corpus.mjs"
SCRATCH="$(mktemp -d "${TMPDIR:-/tmp}/verify-corpus.XXXXXX")"
trap 'rm -rf "$SCRATCH"' EXIT
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
arm "M2 write verb fails" fail "denylisted command (curl write verb)" -- check_on "$d"

d="$(fresh_copy)"; printf '\nOpen the panel at https://dcc.godaddy.com/dns/{domain} now.\n' >> "$d/agent/dns-delegation.md"
arm "M3 single-brace token fails" fail "single-brace token" -- check_on "$d"

d="$(fresh_copy)"; sed -i '' 's/^facts_used: \[nameservers, /facts_used: [/' "$d/agent/dns-delegation.md"
arm "M4 facts_used drift fails" fail 'facts_used is missing "nameservers"' -- check_on "$d"

d="$(fresh_copy)"; printf '\nSee [nothing](/kuju-email/agent/nope.md).\n' >> "$d/agent/dns-delegation.md"
arm "M5 broken internal link fails" fail "broken link" -- check_on "$d"

d="$(fresh_copy)"; printf '# stray\n' > "$d/agent/stray.md"
arm "M6 stray file without front-matter fails" fail "missing front-matter (expected a leading --- block)" -- check_on "$d"

d="$(fresh_copy)"; cp "$d/agent/dns-delegation.md" "$d/agent/dup.md"; sed -i '' 's/^slug: dns-delegation$/slug: dup/' "$d/agent/dup.md"
arm "M7 duplicate order fails" fail "order 3 is already used" -- check_on "$d"

d="$(fresh_copy)"; sed -i '' 's/^slug: dns-delegation$/slug: dns-delegate/' "$d/agent/dns-delegation.md"
arm "M8 slug/filename mismatch fails" fail "must equal the filename stem" -- check_on "$d"

arm "M9 unknown flag dies (does not fall back to the real corpus)" fail "unknown flag --content-dr" -- "${NODE[@]}" "$CHECK" --content-dr /nonexistent

d="$(fresh_copy)"; sed -i '' 's/^slug: dns-delegation$/slug: a: b/' "$d/agent/dns-delegation.md"
arm "M10 malformed front-matter YAML names its file" fail "dns-delegation.md: front-matter is not valid YAML" -- check_on "$d"
d="$(fresh_copy)"; printf 'zz: a: b\n' >> "$d/facts.yaml"
arm "M11 malformed facts YAML names its file" fail "facts.yaml is not valid YAML" -- check_on "$d"

# M12/M13 (Task 19, B1): the preconditions block is SERVED (renderRunbook
# injects it into the .md route, llms-full.txt, llms.txt and the landing
# page), so it needs the same scans as the body -- a denylisted command or an
# unresolved {{fact:...}} token in front-matter preconditions: would reach an
# agent verbatim otherwise.
d="$(fresh_copy)"; sed -i '' 's/^  - you can run dig (or nslookup)$/  - run `sudo dig` first/' "$d/agent/dns-delegation.md"
arm "M12 denylisted command inside a precondition fails" fail "preconditions: denylisted command (privileged or destructive tool)" -- check_on "$d"

d="$(fresh_copy)"; sed -i '' 's/^  - the customer has an active Kuju account (see signup-trial) — redeem the invite first; do not start this runbook without one$/  - the customer has an active Kuju account (see signup-trial) — redeem the invite first; do not start this runbook without one {{fact:nameservers.0}}/' "$d/agent/dns-delegation.md"
arm "M13 unresolved {{fact:...}} token inside a precondition fails" fail "preconditions: unresolved {{fact:...}} token" -- check_on "$d"

# M14 (launch-1.26 fix wave): b89ef20 added THREE precondition scans -- denylist
# (M12), single-brace (this one) and unresolved {{fact:...}} (M13) -- but only
# two ever got an arm. This closes the gap with its own RED observation before
# the fix: see the final fix report for the pre-fix transcript.
d="$(fresh_copy)"; sed -i '' 's/^  - the customer owns a domain and can log in to wherever it is registered$/  - the customer owns a domain and can log in to wherever it is registered {domain}/' "$d/agent/dns-delegation.md"
arm "M14 single-brace token inside a precondition fails" fail "preconditions: single-brace token" -- check_on "$d"

# ---------------------------------------------------------------------------
# F-arms (scripts/check-facts-live.mjs): each of these is a fact-shape check,
# not a network check -- --only scopes the walk to one fact, and the guards
# they exercise (unverifiable, the verify+unverifiable contradiction, the
# stray expect_contains guard) all return before any network call, so all
# four stay OFFLINE, unlike the L-arms below.
# ---------------------------------------------------------------------------
FACTS_LIVE="$ROOT/scripts/check-facts-live.mjs"
arm "F1 unverifiable fact is SKIP by name (offline: --only scopes to a fact with no verify block)" pass "SKIP  test_migration_cap_gb  unverifiable: true" -- "${NODE[@]}" "$FACTS_LIVE" --only test_migration_cap_gb
d="$(fresh_copy)"; printf '\nzz_probe_fact:\n  value: 1\n' >> "$d/facts.yaml"
arm "F2 fact with neither verify nor unverifiable FAILS (no silent SKIP)" fail "FAIL  zz_probe_fact  no verify block and no unverifiable: true" -- "${NODE[@]}" "$FACTS_LIVE" --facts "$d/facts.yaml" --only zz_probe_fact

# F3: give test_migration_cap_gb (unverifiable: true) a verify: block too, so
# it carries both -- the contradiction guard must FAIL it, not silently
# prefer either flag. Inserted via awk (not sed) because this is a two-line
# INSERT after a matched line, which BSD sed's `-i ''` cannot do inline the
# way the single-line M-arm substitutions above do.
d="$(fresh_copy)"
awk '{print} /^  unverifiable: true/{print "  verify: {type: http, expect_status: [200]}"}' "$d/facts.yaml" > "$d/facts.yaml.tmp" && mv "$d/facts.yaml.tmp" "$d/facts.yaml"
arm "F3 fact with BOTH verify and unverifiable: true FAILS (contradiction, not a silent preference)" fail "FAIL  test_migration_cap_gb  contradictory: has a verify block AND unverifiable: true" -- "${NODE[@]}" "$FACTS_LIVE" --facts "$d/facts.yaml" --only test_migration_cap_gb

# F4: re-add expect_contains to mx.verify (task 6 deleted it in favour of the
# derived mxExpectation) -- the guard must FAIL loudly rather than let a
# stray key silently coexist with the derived value.
d="$(fresh_copy)"; sed -i '' 's/verify: {type: dns, name: kuju.email, record: MX}/verify: {type: dns, name: kuju.email, record: MX, expect_contains: "10 mail.kuju.email."}/' "$d/facts.yaml"
arm "F4 stray expect_contains on mx.verify FAILS (derived value, not a leftover key)" fail "FAIL  mx  expect_contains is derived from target/priority now — remove it from mail-facts.yaml" -- "${NODE[@]}" "$FACTS_LIVE" --facts "$d/facts.yaml" --only mx

rm -rf "$SCRATCH"

# ---------------------------------------------------------------------------
# Tier 2/3 live arms (scripts/check-facts-live.mjs). Network-dependent, so
# gated behind LIVE=1 -- the default offline harness run stays deterministic.
# ---------------------------------------------------------------------------
if [[ "${LIVE:-0}" == "1" ]]; then
  arm "L1 live checker self-test proves all seven mutants fail" pass "SELF-TEST OK: 7/7 mutants failed as required" -- "${NODE[@]}" "$ROOT/scripts/check-facts-live.mjs" --self-test
  arm "L2 live checker reports signup_url as PENDING (still 303)" pass "PENDING  signup_url" -- "${NODE[@]}" "$ROOT/scripts/check-facts-live.mjs"
  arm "L3 live checker names the URL-less registrar as SKIP" pass "SKIP  registrars.name-services.com" -- "${NODE[@]}" "$ROOT/scripts/check-facts-live.mjs"
fi

# ---------------------------------------------------------------------------
# Server arms: build, start, curl. `next start` (not `next dev`) because the
# question is what the PRERENDERED output carries — force-static route handlers
# store their headers in .next/server/app/*.meta and Vercel serves those.
# ---------------------------------------------------------------------------
if [[ "${SKIP_SERVER:-0}" != "1" ]]; then
  PORT="${PORT:-3998}"
  BASE="http://127.0.0.1:${PORT}"

  # PIDs of anything currently bound to $PORT, in any state lsof reports.
  port_pids() { lsof -ti "tcp:${PORT}" 2>/dev/null || true; }

  # Polls (1s granularity, matching the readiness loop below) until the port
  # is free or <timeout> seconds pass. Returns 1 on timeout. We poll the
  # socket itself rather than trusting that a `kill` call returning means the
  # listener is gone — a signalled process can hold the socket open briefly
  # while it unwinds.
  wait_port_free() {
    local timeout="$1" waited=0
    while [[ -n "$(port_pids)" ]]; do
      if [[ "$waited" -ge "$timeout" ]]; then return 1; fi
      sleep 1
      waited=$((waited + 1))
    done
    return 0
  }

  # A stale listener from a PRIOR run would serve the OLD build, and every
  # arm below would then pass against content nobody just built — a silent,
  # green false positive, which is worse than refusing to start. Fail loudly
  # and name the port instead of proceeding.
  if [[ -n "$(port_pids)" ]]; then
    echo "FATAL: port ${PORT} is already in use before this run started (PID(s): $(port_pids | tr '\n' ' '))."
    echo "       Proceeding would risk testing a STALE server left by a previous run."
    echo "       Free it first, e.g.: kill $(port_pids | tr '\n' ' ')"
    exit 2
  fi

  # Recursively signals a PID and every descendant, deepest first, so a
  # child cannot be re-parented to init and orphaned mid-teardown.
  # `mise exec -- npx next start` is at least THREE processes deep (the
  # backgrounded subshell, npm/npx's own process, and the actual next-server
  # node process that binds the port) — measured live: killing only the
  # top-level PID left the bottom two running, holding the port, which is
  # exactly the EADDRINUSE this fix exists for.
  kill_tree() {
    local pid="$1" sig="$2" child
    for child in $(pgrep -P "$pid" 2>/dev/null || true); do
      kill_tree "$child" "$sig"
    done
    kill -"$sig" "$pid" 2>/dev/null || true
  }

  SRV_PID=""
  CLEANED_UP=0
  cleanup() {
    # Idempotent: harmless if the EXIT trap were ever invoked more than once.
    [[ "$CLEANED_UP" -eq 1 ]] && return
    CLEANED_UP=1
    [[ -n "$SRV_PID" ]] && kill_tree "$SRV_PID" TERM
    # Defense in depth alongside kill_tree, in case something detached from
    # $SRV_PID's tree still holds the port.
    local p
    for p in $(port_pids); do kill -TERM "$p" 2>/dev/null || true; done
    if ! wait_port_free 10; then
      [[ -n "$SRV_PID" ]] && kill_tree "$SRV_PID" KILL
      for p in $(port_pids); do kill -KILL "$p" 2>/dev/null || true; done
      if ! wait_port_free 10; then
        echo "WARN: port ${PORT} still occupied after SIGKILL teardown (PID(s): $(port_pids | tr '\n' ' '))" >&2
      fi
    fi
  }
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
  # count_arm <name> <path> <ERE-pattern> <expected-count>
  # A body_arm substring check can only tell "present" from "absent" -- it
  # cannot tell 1 rendered entry from 14, so a renderer that silently
  # truncates (e.g. an accidental .slice(0,1)) still passes every body_arm
  # sentinel. This counts how many lines in the SERVED body match an ERE
  # pattern and fails unless it equals the expected count exactly. The
  # expected counts are hardcoded, not derived, matching the precedent at
  # scripts/corpus-selftest.mjs:57-64 (registrars.table's 11 rows) -- a
  # hardcoded count fails loudly when an entry is legitimately added, which
  # is correct behaviour for a drift-detection corpus.
  count_arm() {
    local name="$1" p="$2" pattern="$3" expected="$4" body n
    body="$(curl -s "${BASE}${p}")"
    n="$(printf '%s' "$body" | grep -cE -- "$pattern")"
    if [[ "$n" -ne "$expected" ]]; then
      echo "FAIL  ${name}: expected ${expected}, got ${n}"; FAILS=$((FAILS + 1)); return
    fi
    echo "PASS  ${name}"
  }
  # occurrence_arm <name> <path> <fixed-string> <expected-count>
  # Like count_arm, but counts every OCCURRENCE (grep -o | wc -l), not every
  # matching LINE (count_arm's grep -cE). Needed whenever the served body can
  # legitimately pack more than one match onto a single line -- which
  # count_arm's callers (S15-S18: one heading/row per markdown line) never
  # do, but S27 does, since Next's SSR emits the whole HTML document as ONE
  # line. See the comment above S27 below for why this is the right tool
  # there specifically, and why it is not just count_arm with a different
  # regex engine.
  occurrence_arm() {
    local name="$1" p="$2" needle="$3" expected="$4" body n
    body="$(curl -s "${BASE}${p}")"
    n="$(printf '%s' "$body" | grep -oF -- "$needle" | wc -l | tr -d ' ')"
    if [[ "$n" -ne "$expected" ]]; then
      echo "FAIL  ${name}: expected ${expected}, got ${n}"; FAILS=$((FAILS + 1)); return
    fi
    echo "PASS  ${name}"
  }

  for slug in $(cd "$ROOT/src/content/agent" && ls -- *.md | sed 's/\.md$//'); do
    header_arm "S1 ${slug}.md is text/markdown" "/kuju-email/agent/${slug}.md" "content-type: text/markdown"
    body_arm   "S2 ${slug}.md has no unresolved placeholder" "/kuju-email/agent/${slug}.md" "# " "{{fact:"
    body_arm   "S3 llms.txt lists ${slug}" "/llms.txt" "/kuju-email/agent/${slug}.md"
    body_arm   "S4 llms-full.txt embeds ${slug}" "/llms-full.txt" "<!-- https://kaimoku-website.vercel.app/kuju-email/agent/${slug}.md -->"
  done
  header_arm "S5 llms.txt is text/plain" "/llms.txt" "content-type: text/plain"
  header_arm "S6a unknown runbook is 404" "/kuju-email/agent/nope.md" "HTTP/1.1 404"
  # S6a alone is vacuous against dropping dynamicParams=false: the route
  # handler's OWN "if (!runbook)" guard also returns 404 for an unenumerated
  # slug, so S6a would still pass even if Next fell through to on-demand
  # rendering instead of refusing the param outright. x-nextjs-prerender is
  # attached only when Next serves its own prerendered not-found shell (the
  # dynamicParams=false path); the handler's manual `new Response(...)` never
  # carries it. That is the header this arm needs to distinguish the two.
  header_arm "S6b unknown runbook hits Next's static not-found shell, not the handler's own 404 (dynamicParams=false)" "/kuju-email/agent/nope.md" "x-nextjs-prerender: 1"
  body_arm   "S7 dns-delegation carries the nameservers" "/kuju-email/agent/dns-delegation.md" "ns1.kuju.email"
  body_arm   "S8 llms.txt links are absolute" "/llms.txt" "https://kaimoku-website.vercel.app/kuju-email/agent/dns-delegation.md"
  # S1-S8 all pass even when the route is rendered ON DEMAND instead of from
  # the prerendered artifact: the handler computes and returns the same bytes
  # either way. x-nextjs-cache is present only on a request served FROM that
  # artifact, so this arm is the one signal that prerendering actually happened.
  #
  # Measured 2026-09-01, and worth knowing before you edit route.ts: deleting
  # `export const dynamic = "force-static"` does NOT trip this arm, because
  # generateStaticParams alone (with no dynamic-API use in the handler) already
  # makes the route fully static under the default dynamic:"auto" -- so
  # force-static is redundant in this configuration, not load-bearing.
  # dynamicParams=false is NOT part of that: it governs only what happens to a
  # slug that is NOT in generateStaticParams' list (404 vs render on demand),
  # and removing it leaves this arm green, which is exactly what the matrix
  # below shows. Do not read it as contributing to the caching behaviour.
  # What DOES trip it is a route that is genuinely dynamic (verified with
  # dynamic = "force-dynamic", which fails both this arm and S6b). So do not
  # read a green S9 as proof that force-static is present; read it as proof the
  # route is being served prerendered.
  header_arm "S9 dns-delegation.md is served from the prerendered cache (not rendered on demand)" "/kuju-email/agent/dns-delegation.md" "x-nextjs-cache: hit"

  # S10-S14: the generated glossary.md/docs.md twins (Task 6). Numbered from
  # S10, not S9 — S9 above is already taken by the prerendered-cache arm,
  # which is named and explained in the inline comment block immediately
  # above it (the "S1-S8 all pass even when..." paragraph through "do not
  # read a green S9 as proof force-static is present", currently just above
  # this line in this file), so reusing "S9" here would collide with that
  # label rather than extend it. (This file's own header comment, :1-8,
  # names neither arm — a prior draft of this comment claimed otherwise;
  # that claim was wrong and has been corrected. See the Task 6 report's
  # correction note.)
  header_arm "S10 glossary.md is text/markdown" "/kuju-email/glossary.md" "content-type: text/markdown"
  # S11 checked only "**Why it matters:**", which every entry emits; it never proved SPF.
  body_arm   "S11a glossary.md carries the SPF entry (term + expansion heading)" "/kuju-email/glossary.md" "## SPF — Sender Policy Framework"
  body_arm   "S11b glossary.md carries why-it-matters" "/kuju-email/glossary.md" "**Why it matters:**"
  header_arm "S12 docs.md is text/markdown" "/kuju-email/docs.md" "content-type: text/markdown"
  body_arm   "S13 docs.md lists endpoints" "/kuju-email/docs.md" "| GET | "
  body_arm   "S14 llms-full.txt embeds the glossary" "/llms-full.txt" "Sender Policy Framework"
  # S23: S4 pins only the <!-- url --> marker; renderLlmsFullTxt pushes the marker THEN
  # the body, so a renderer emitting markers with empty bodies passes S4 five times over
  # and S14 pins only a REFERENCE body. This pins a heading that exists only inside the
  # dns-delegation runbook body (llms.txt carries title/outcome/Assumes, never headings).
  body_arm   "S23 llms-full.txt embeds a runbook BODY, not only its marker" "/llms-full.txt" "## Step 1 - Find out who runs this domain's DNS today"

  # S24-S26 (Task 20, group B1): the served preconditions block, across all
  # three paths it reaches -- the landing page (Task 18), llms.txt's
  # "Assumes:" clause, and the runbook .md route's "Before you start." block
  # (Task 17, already shipped). Sentinel uniqueness for each was checked
  # against PROMPT (page.tsx:14), metadata (page.tsx:8-12) and the
  # Index-files section, per the audit S19-S21's comments above record:
  # `grep -n` for each of the three strings below in page.tsx returns no
  # match outside the runbook-list section that Task 18 adds.
  body_arm   "S24 landing page renders a runbook's preconditions under its outcome" "/kuju-email/agent" "the customer has an active Kuju account (see signup-trial)"
  body_arm   "S25 llms.txt carries the routing-time Assumes: gate" "/llms.txt" "Assumes: the customer owns a domain and can log in to wherever it is registered;"
  body_arm   "S26 dns-delegation.md serves the preconditions block" "/kuju-email/agent/dns-delegation.md" "**Before you start.** This runbook assumes:"

  # S27 (Task 21, permanent arm -- the plan's "one-off curl" was overridden
  # in favour of this): every CopyButton on the landing page must carry a
  # live region so its label swap ("Copy" -> "Copied"/"Copy failed") is
  # announced to screen readers. The page renders six buttons (one prompt
  # button + one per runbook, and there are five runbooks).
  #
  # This is an occurrence_arm (grep -o | wc -l), not count_arm (grep -cE),
  # and that distinction was checked, not assumed -- three things had to be
  # true for it to be safe, and all three were measured against the actual
  # served body rather than reasoned about in the abstract:
  #   1. count_arm's grep -cE counts matching LINES, and Next's SSR emits
  #      the ENTIRE served document as a single line (measured:
  #      `curl -s .../kuju-email/agent | wc -l` is 0, i.e. no newline in the
  #      body at all). So count_arm here can only ever report 0 or 1 -- it
  #      cannot distinguish "every button carries it" from "one line of the
  #      page happens to mention it once" from "one out of six buttons has
  #      it". That is why an earlier draft of this arm, scored via
  #      count_arm with an expected value of 1, was renamed rather than kept
  #      -- its name said "every" and its check could not tell one button
  #      from six. occurrence_arm's grep -o counts each match regardless of
  #      line breaks, so it can and does assert all 6.
  #   2. Before switching to a per-occurrence count, the risk considered was
  #      that Next's RSC hydration "flight" payload re-serialises some
  #      server-rendered content for the client (confirmed separately: S24's
  #      precondition-text sentinel appears 3x in the raw bytes -- 1 real
  #      render + 2 inside the flight payload's `["$","li",key,{"children":
  #      ...}]` entries), which would make a occurrence count fragile against
  #      a framework upgrade for no real reason. MEASURED for this attribute
  #      specifically, on the actual served body, and found NOT to apply:
  #      `aria-live` and `polite` each appear exactly 6 times total, one per
  #      real `<button>` element, with zero additional occurrences inside any
  #      `self.__next_f.push(...)` flight chunk. The difference from S24:
  #      preconditions text is server-rendered `.map()` content the flight
  #      payload must describe to hydrate around; `aria-live`/`aria-atomic`
  #      are hardcoded directly in CopyButton's own ("use client") JSX, not
  #      props the server passes it, so they never enter the serialized tree
  #      the way server-rendered children do. This is specific to this
  #      attribute on this component, not a general exemption from the S24
  #      risk -- re-measure before reusing this pattern elsewhere.
  #   3. All six buttons render from ONE shared CopyButton component
  #      (src/components/agent/CopyButton.tsx), so the attribute is present
  #      on all of them or none -- a partial regression (present on some
  #      buttons, absent on others) is not reachable, which is part of why
  #      "every" is a stable, true claim for this arm's name.
  occurrence_arm "S27 every CopyButton carries a live region" "/kuju-email/agent" 'aria-live="polite"' 6

  # S15-S18: count arms (Task 6 review finding 1). S11b/S13 above are
  # substring sentinels and cannot distinguish "the renderer emitted 1
  # entry/endpoint" from "it emitted all of them" -- e.g. an accidental
  # .slice(0,1) in renderGlossaryMarkdown() still emits one
  # "**Why it matters:**" line and S11b still passes. corpus-selftest.mjs
  # cannot carry this assertion instead: it is plain ESM importing only
  # agent-corpus-core.mjs (node:assert against .mjs), while the renderers
  # live in src/lib/agent-corpus.ts and pull in src/lib/glossary.ts and
  # src/lib/api-docs.ts, which are TypeScript -- confirmed node 22.11.0
  # cannot import a .ts file directly ("Unknown file extension \".ts\"").
  # So this harness, against the SERVED routes, is these counts' only home.
  # Expected counts measured directly against the built site, not carried
  # over from any prior report: `grep -c '^    id: "' src/lib/glossary.ts`
  # gives 14 GLOSSARY entries; loadApiDocs() renders 7 `## ` sections, 39
  # `### ` subsections and 147 endpoint table rows (counted via curl against
  # a `next start`, since api-docs.ts is equally unreachable from plain node).
  count_arm "S15 glossary.md has one heading per GLOSSARY entry (14)" "/kuju-email/glossary.md" '^## ' 14
  count_arm "S16 docs.md has one heading per API doc section (7)" "/kuju-email/docs.md" '^## ' 7
  count_arm "S17 docs.md has one heading per API doc subsection (39)" "/kuju-email/docs.md" '^### ' 39
  count_arm "S18 docs.md has one table row per endpoint (147)" "/kuju-email/docs.md" '^\| (GET|POST|PUT|PATCH|DELETE) \| ' 147

  # S19-S21: the human-facing landing page (Task 7).
  #
  # S19 was originally sentinel "Hand this to your agent" (no trailing
  # period). That string is NOT unique to the body: page.tsx:9 also emits it
  # verbatim inside metadata.title ("Hand this to your agent · Kuju Email"),
  # which Next renders into <head><title>...</title></head>. So the old S19
  # passed even if the page BODY never rendered at all -- it was really
  # testing <title>. (The trailing-period form at page.tsx:27, "Hand this to
  # your agent.", is technically unique, but a one-character distinction from
  # the title is fragile.) Fixed by pointing at a phrase that exists only in
  # the body copy (page.tsx:30-31, the intro <p> under the hero <h1>) and
  # nowhere in <head> -- confirmed via
  # `grep -n "Hand this to your agent" src/app/kuju-email/agent/page.tsx`,
  # which returns exactly the two lines above (:9 title, :27 <em>), neither
  # of which contains this arm's new sentinel.
  body_arm   "S19 landing page's intro paragraph renders (BODY, not just <title>)" "/kuju-email/agent" "written for an AI agent rather than a person"
  #
  # S20 was originally "S20 landing page links llms.txt absolutely", sentinel
  # "https://kaimoku-website.vercel.app/llms.txt" (review finding, Task 7
  # follow-up). That sentinel is NOT unique to the Index-files section it was
  # meant to test: page.tsx:14 defines PROMPT, which contains the literal
  # text "Read ${SITE_URL}/llms.txt" and renders in "The prompt" section well
  # before the Index-files list at page.tsx:76-80. So the old arm passed even
  # if the Index-files section never rendered -- it was really testing the
  # prompt. Fixed by re-pointing at "llms-full.txt", which page.tsx uses only
  # once, at line 80, inside the Index-files list (PROMPT never mentions
  # llms-full.txt) -- confirmed via `grep -n llms-full src/app/kuju-email/agent/page.tsx`
  # returning exactly that one line.
  body_arm   "S20 landing page's Index-files list links llms-full.txt absolutely" "/kuju-email/agent" "https://kaimoku-website.vercel.app/llms-full.txt"
  # S21: the Runbooks section (page.tsx:56-69, index.runbooks.map) had NO
  # coverage at all -- the runbook URLs a person actually copies for their
  # agent, i.e. the page's functional payload. Neither S19 (checks the hero
  # sentinel) nor the old S20 (checks PROMPT, see above) touches it, so a
  # wrong prop, an empty array, or a .map typo would ship green. This arm
  # asserts a known runbook's absolute URL, as rendered by
  # index.runbooks.map at page.tsx:60/64/66, actually appears in the served
  # body. That URL string appears nowhere else on the page (PROMPT never
  # mentions runbook paths; the Index-files section links only llms.txt,
  # llms-full.txt and the glossary/docs reference docs via d.url at
  # page.tsx:84-85) -- confirmed by building+serving and grepping the
  # rendered body for the sentinel outside this one region.
  body_arm   "S21 landing page's Runbooks section renders the dns-delegation runbook URL" "/kuju-email/agent" "https://kaimoku-website.vercel.app/kuju-email/agent/dns-delegation.md"

  # S22: start-here.md (Task 12) is order 1 and must sort FIRST in llms.txt,
  # ahead of signup-trial (order 2, the runbook that used to render first).
  # renderLlmsTxt() (src/lib/agent-corpus-core.mjs:339-346) emits the section
  # header, a blank line, then one "- [title](url): outcome" line per runbook
  # in index.runbooks order -- and loadRunbooks() sorts that array by the
  # order: front-matter field, not by filename (see the "orders by the
  # order: field" selftest check). So the sentinel below -- the section
  # header immediately followed (across exactly one blank line) by
  # "- [Start here" -- is true only when start-here really is the first
  # runbook rendered, not merely present somewhere in the list.
  body_arm   "S22 llms.txt lists start-here FIRST" "/llms.txt" "## Runbooks (read start-here first)

- [Start here"
fi

echo
if [[ "$FAILS" -gt 0 ]]; then echo "${FAILS} arm(s) FAILED"; exit 1; fi
echo "all arms passed"
