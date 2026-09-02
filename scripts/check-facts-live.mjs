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
