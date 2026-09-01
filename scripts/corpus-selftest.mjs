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
check("wrapped scalar resolves BARE (terminal position), not only via .value: test_migration_cap_gb", () => {
  assert.equal(core.resolveFact(facts, "test_migration_cap_gb"), "2");
});
check("bare wrapped scalar is identical to its explicit .value form: signup_url", () => {
  assert.equal(core.resolveFact(facts, "signup_url"), core.resolveFact(facts, "signup_url.value"));
  assert.equal(core.resolveFact(facts, "signup_url"), "https://mail.kuju.email/signup");
});
check("negative control: nameservers bare STILL throws (its value is an ARRAY; unwrap must not comma-join it)", () => {
  assert.throws(() => core.resolveFact(facts, "nameservers"), /non-scalar/);
});
check("negative control: mx bare STILL throws (no value wrapper to unwrap through; needs .target)", () => {
  assert.throws(() => core.resolveFact(facts, "mx"), /non-scalar/);
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
