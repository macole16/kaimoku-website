// Tier 2: compare src/data/mail-facts.yaml with live DNS and HTTPS. REPORTS,
// never blocks. Tier 3: with --self-test, seven mutants run FIRST as separate
// processes, each scoped to the ONE fact it mutates via --only (so the mutant
// sweep does not multiply the registrar/DNS network footprint); if any exits 0
// the checker can no longer fail and the real result would be meaningless, so
// the run aborts with exit 2. The mutant count is pinned (EXPECTED_MUTANT_COUNT)
// so a shrunk mutant list -- including an empty one -- fails loudly rather than
// printing a vacuous "SELF-TEST OK: 0/0".
//
//   node scripts/check-facts-live.mjs [--facts F] [--only FACT] [--self-test] [--ntfy] [--quiet]
//
// --only restricts runChecks to the single top-level fact named -- used
// internally by the Tier 3 mutant runner; an operator may also pass it to
// probe one fact without hitting the rest. A bare "--only registrars" checks
// every registrar row; "--only registrars.<key>" narrows to one row.
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
import { loadFacts, registrarEntries, mxExpectation, formatMx } from "../src/lib/agent-corpus-core.mjs";

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), "..");
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const factsArg = argv.indexOf("--facts");
const FACTS_PATH = factsArg !== -1 ? path.resolve(argv[factsArg + 1]) : path.join(ROOT, "src/data/mail-facts.yaml");
const onlyArg = argv.indexOf("--only");
const ONLY = onlyArg !== -1 ? argv[onlyArg + 1] : undefined;
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
    // Defensive only. Measured 2026-09-02: five no-data lookups across three
    // names, spanning all three record types -- MX and TXT on
    // kaimoku-website.vercel.app, A on _dmarc.demo.kuju.email, and TXT and MX
    // on ns1.kuju.email.
    // node ALWAYS rejects with ENODATA and never resolves to []. Deliberately NOT
    // mutant-covered — no facts mutation can reach it through the public DNS path.
    return answers.length ? { status: "PASS", detail: `${record} ${host} -> ${answers.join(", ")}` }
                          : { status: "FAIL", detail: `${record} ${host} -> empty` };
  } catch (err) {
    return { status: "FAIL", detail: `${record} ${host} -> ${err.code ?? err.message}` };
  }
}

async function checkMx(name, expectContains) {
  try {
    const mx = await dns.resolveMx(name);
    // formatMx, not a local template literal: this is the OBSERVED side of the
    // comparison and mxExpectation() builds the EXPECTED side, so both must
    // render identically or every MX check fails for a formatting reason
    // rather than a DNS one. DNS calls the host `exchange`; the fact calls it
    // `target`, which is why no grep would ever pair these two call sites.
    const rendered = mx.map((r) => formatMx(r.priority, r.exchange));
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

async function runChecks(facts, only) {
  const rows = [];
  const push = (fact, r, pending) => {
    let status = r.status;
    if (pending) status = r.status === "PASS" ? "PENDING_NOW_PASSES" : "PENDING";
    rows.push({ fact, status, detail: r.detail });
  };

  for (const [key, fact] of Object.entries(facts)) {
    const verify = fact?.verify;
    const pending = fact?.pending === true;
    // --only scopes the walk to one fact (or one "registrars.<key>" row) so a
    // Tier 3 mutant proves its own check function can fail without re-running
    // the other fourteen rows -- see runMutant below.
    const isRegistrarTarget = key === "registrars" && typeof only === "string" && only.startsWith("registrars.");
    if (only && key !== only && !isRegistrarTarget) continue;

    if (key === "registrars") {
      // Reserved key `verify` is metadata; entries are the registrars.
      for (const e of registrarEntries(facts)) {
        const rowName = `registrars.${e.key}`;
        // A bare `--only registrars` (no ".<key>" suffix) checks every
        // registrar row -- the same "whole top-level fact" behaviour --only
        // gives every other fact above. Without this carve-out every row
        // fails the `rowName !== only` test (rowName is always
        // "registrars.<key>", never bare "registrars"), so the section
        // would silently print zero rows and no error -- exactly the
        // "checking nothing without saying so" failure this script exists
        // to prevent. A qualified `--only registrars.<key>` still narrows
        // to that one row, unchanged.
        if (only && only !== "registrars" && rowName !== only) continue;
        if (!e.dns_url) { rows.push({ fact: rowName, status: "SKIP", detail: `${e.name}: no dns_url upstream — not checkable, by design` }); continue; }
        const url = e.dns_url.replaceAll("{domain}", verify?.domain_placeholder ?? "example.com");
        push(rowName, await checkHttp(url, verify ?? {}), false);
      }
      continue;
    }
    if (verify && fact?.unverifiable === true) {
      rows.push({ fact: key, status: "FAIL", detail: "contradictory: has a verify block AND unverifiable: true" });
      continue;
    }
    if (!verify) {
      if (fact?.unverifiable === true) { rows.push({ fact: key, status: "SKIP", detail: "unverifiable: true — product config the site cannot observe" }); continue; }
      rows.push({ fact: key, status: "FAIL", detail: "no verify block and no unverifiable: true — a mistyped verify: key would otherwise silently downgrade this fact to SKIP" });
      continue;
    }

    if (verify.type === "dns" && key === "nameservers") {
      // Deliberately A-record-of-each-target, NOT "NS kuju.email contains ns1":
      // kuju.email's own zone is at Cloudflare; ns1/ns2 are what customers
      // delegate TO. The NS form would be a permanent false failure.
      for (const host of fact.value) push(`nameservers.${host}`, await checkDnsNonEmpty(host, verify.record), pending);
    } else if (verify.type === "dns" && verify.record === "MX") {
      if (verify.expect_contains !== undefined) {
        rows.push({ fact: key, status: "FAIL", detail: "expect_contains is derived from target/priority now — remove it from mail-facts.yaml" });
      } else {
        push(key, await checkMx(verify.name, mxExpectation(fact)), pending);
      }
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

// `only`, when given, is passed through as --only so the child process scopes
// its network calls to the single fact this mutant touches instead of
// re-running the full ~18-row check (7 mutants x a full run would multiply
// the ~30 registrar GETs and DNS lookups a bare full run already makes; see
// selfTest() below for the measured before/after). `mustContain` is one
// string or an array of strings that must ALL appear (ANDed) -- splitting a
// mutant's assertion across the row's fixed prefix and the injected token
// lets each half do a different job: the prefix pins status+fact (rules out
// an unrelated failure elsewhere), the injected token proves mutate()
// actually landed (a no-op mutate() would leave the real value in place and
// the token would never appear) -- see selfTest()'s mx/spf mutants.
function runMutant(name, mutate, mustContain, only) {
  const facts = loadFacts(FACTS_PATH);
  mutate(facts);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "facts-mutant-")), `${name}.yaml`);
  fs.writeFileSync(file, yaml.stringify(facts));
  const musts = Array.isArray(mustContain) ? mustContain : [mustContain];
  const args = [SELF, "--facts", file, "--quiet"];
  if (only) args.push("--only", only);
  let out = ""; let code = 0;
  try {
    out = execFileSync(process.execPath, args, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) { code = err.status ?? 1; out = `${err.stdout ?? ""}${err.stderr ?? ""}`; }
  const ok = code !== 0 && musts.every((m) => out.includes(m));
  console.log(`${ok ? "mutant-failed-as-required" : "MUTANT-PASSED"}  ${name}  exit=${code}  wanted ${JSON.stringify(musts)}`);
  return ok;
}

// Pinned deliberately (matching this plan's precedent for hardcoded expected
// counts, e.g. registrars.table's 11 rows): a mutant list that has shrunk --
// down to and including an empty list -- must fail the self-test loudly
// rather than silently reporting "SELF-TEST OK: 0/0 mutants failed as
// required" and letting a checker that has stopped checking pass forever.
// Bump this ONLY as a deliberate edit alongside adding/removing a mutant.
const EXPECTED_MUTANT_COUNT = 7;

function selfTest() {
  const results = [
    // Exercises checkDnsNonEmpty's catch branch.
    runMutant("ns-does-not-exist", (f) => { f.nameservers.value[0] = "ns-does-not-exist.kuju.email"; }, "FAIL  nameservers.ns-does-not-exist.kuju.email", "nameservers"),
    // Exercises checkHttp's expect_status branch.
    runMutant("pending-now-passes", (f) => { f.signup_url.value = "https://kaimoku-website.vercel.app/"; }, "PENDING_NOW_PASSES  signup_url", "signup_url"),
    // Exercises checkMx's `ok` comparison (the `rendered.some((r) =>
    // r.includes(expectContains))` line) -- previously the only way to
    // defeat it (e.g. `const ok = true;`) was to be invisible to self-test.
    // Corrupts the derived mx target (task 6): mx.verify.expect_contains is
    // no longer read by anything, so mutating it would be a no-op mutant --
    // this mutates the leaf mxExpectation() actually derives from instead.
    runMutant(
      "mx-target-mismatch",
      (f) => { f.mx.target = "MUTANT-MX-TOKEN-not-a-real-target"; },
      ["FAIL  mx  MX kuju.email -> ", '(want "10 MUTANT-MX-TOKEN-not-a-real-target.")'],
      "mx",
    ),
    // Exercises checkTxtEquals's `ok = txt.includes(expected)` comparison --
    // backs both spf and dmarc; corrupting spf alone is enough to reach the
    // function.
    runMutant(
      "spf-mismatch",
      (f) => { f.customer_domain_records.spf = "v=spf1 MUTANT-SPF-TOKEN ~all"; },
      ["FAIL  customer_domain_records.spf  TXT demo.kuju.email -> ", '(want "v=spf1 MUTANT-SPF-TOKEN ~all")'],
      "customer_domain_records",
    ),
    // Exercises checkHttp's `bad = verify.reject_status.includes(r.status)`
    // comparison -- previously undefeatable-and-uncaught (`const bad =
    // false;` would have silenced all ten registrar rows at once). Points at
    // a path on OUR OWN site (kaimoku-website.vercel.app -- the same host
    // SITE_URL already targets), verified live to 404, rather than at a
    // third-party registrar's site: this mutant exists to catch OUR
    // reject_status comparison going blind, not to probe Squarespace's
    // routing, so a future soft-404 or catch-all-200 on the registrar's real
    // site can never flip this mutant to MUTANT-PASSED and falsely announce
    // that OUR checker has stopped checking (that false alarm is the one
    // Tier 3 exists to prevent). The injected path is also the proof the
    // mutation landed -- a no-op mutate() would leave the real dns_url in
    // place and this literal path would never appear in the row's detail.
    runMutant(
      "reject-status-self-404",
      (f) => { f.registrars["google.com"].dns_url = "https://kaimoku-website.vercel.app/zz-mutant-probe-does-not-exist"; },
      "FAIL  registrars.google.com  https://kaimoku-website.vercel.app/zz-mutant-probe-does-not-exist -> HTTP 404 (reject 404/410)",
      "registrars.google.com",
    ),
    // Exercises checkHttp's neither-expect_status-nor-reject_status fallback (line 105).
    // Re-pointed at OUR site first, same reasoning as reject-status-self-404: a
    // third-party outage must not be able to flip this mutant.
    runMutant(
      "http-verify-neither-status",
      (f) => { delete f.registrars.verify.reject_status; f.registrars["google.com"].dns_url = "https://kaimoku-website.vercel.app/"; },
      "FAIL  registrars.google.com  https://kaimoku-website.vercel.app/: verify block has neither expect_status nor reject_status",
      "registrars.google.com",
    ),
    // Exercises the generic unsupported-verify-block fallback (line 165). Reaches no
    // network: no check function runs for an unknown type.
    runMutant(
      "unsupported-verify-type",
      (f) => { f.mx.verify = { type: "smtp-banner" }; },
      'FAIL  mx  unsupported verify block {"type":"smtp-banner"}',
      "mx",
    ),
  ];
  if (results.length !== EXPECTED_MUTANT_COUNT) {
    console.error(`SELF-TEST FAILED: expected ${EXPECTED_MUTANT_COUNT} mutants, found ${results.length} — the mutant list changed size; update EXPECTED_MUTANT_COUNT deliberately if this is intended`);
    return false;
  }
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

  const rows = await runChecks(loadFacts(FACTS_PATH), ONLY);
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
