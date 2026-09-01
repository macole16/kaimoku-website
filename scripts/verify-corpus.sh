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
