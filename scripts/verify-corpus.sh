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
  body_arm   "S11 glossary.md carries SPF and why-it-matters" "/kuju-email/glossary.md" "**Why it matters:**"
  header_arm "S12 docs.md is text/markdown" "/kuju-email/docs.md" "content-type: text/markdown"
  body_arm   "S13 docs.md lists endpoints" "/kuju-email/docs.md" "| GET | "
  body_arm   "S14 llms-full.txt embeds the glossary" "/llms-full.txt" "Sender Policy Framework"

  # S15-S18: count arms (Task 6 review finding 1). S11/S13 above are
  # substring sentinels and cannot distinguish "the renderer emitted 1
  # entry/endpoint" from "it emitted all of them" -- e.g. an accidental
  # .slice(0,1) in renderGlossaryMarkdown() still emits one
  # "**Why it matters:**" line and S11 still passes. corpus-selftest.mjs
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

  # S19-S20: the human-facing landing page (Task 7).
  body_arm   "S19 landing page renders" "/kuju-email/agent" "Hand this to your agent"
  body_arm   "S20 landing page links llms.txt absolutely" "/kuju-email/agent" "https://kaimoku-website.vercel.app/llms.txt"
fi

echo
if [[ "$FAILS" -gt 0 ]]; then echo "${FAILS} arm(s) FAILED"; exit 1; fi
echo "all arms passed"
