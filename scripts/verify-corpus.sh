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
  # generateStaticParams + dynamicParams=false already make the route fully
  # static -- force-static is redundant in this configuration, not load-bearing.
  # What DOES trip it is a route that is genuinely dynamic (verified with
  # dynamic = "force-dynamic", which fails both this arm and S6b). So do not
  # read a green S9 as proof that force-static is present; read it as proof the
  # route is being served prerendered.
  header_arm "S9 dns-delegation.md is served from the prerendered cache (not rendered on demand)" "/kuju-email/agent/dns-delegation.md" "x-nextjs-cache: hit"
fi

echo
if [[ "$FAILS" -gt 0 ]]; then echo "${FAILS} arm(s) FAILED"; exit 1; fi
echo "all arms passed"
