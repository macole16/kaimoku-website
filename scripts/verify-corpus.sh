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

echo
if [[ "$FAILS" -gt 0 ]]; then echo "${FAILS} arm(s) FAILED"; exit 1; fi
echo "all arms passed"
