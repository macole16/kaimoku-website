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
