# Agent corpus hygiene — implementation plan

> **For agentic workers:** execute task-by-task, in the order given. Every task is
> independently understandable; you should not need the spec to carry one out, but the
> spec is the authority if this plan and it ever disagree on *intent*:
> `docs/superpowers/specs/2026-09-02-agent-corpus-hygiene-design.md` (spec items are
> referenced as A1–A7, B1–B2, C1–C8, D1). Checkboxes (`- [ ]`) are for tracking.

**Issue:** bd `launch-1.26` (child of `launch-1`)
**Worktree (the ONLY checkout you touch):**
`/Users/macole/github/kaimoku-website/.claude/worktrees/launch-1-26`, branch
`feat/launch-1.26-corpus-hygiene`, clean at `677bdea` (spec commit on top of `d682dad`).
**Line numbers below were read from that tree on 2026-09-02** and will shift as you edit;
they are given so you can find the symbol, not so you can `sed` by number.

---

## 0. Ground rules for every task

- [ ] **Setup first — the worktree has NO `node_modules`** (gitignored inputs are absent in
  a worktree). From the worktree root run `mise exec -- npm ci` (a `package-lock.json`
  exists). Until you do, `mise exec -- node scripts/corpus-selftest.mjs` dies on
  `import "yaml"` and *that* failure looks like a broken selftest.
- [ ] **Baseline before touching anything** — record the green state so you can tell a
  regression from a pre-existing failure:
  - `mise exec -- node scripts/corpus-selftest.mjs` → ends `corpus-selftest: N checks passed`
    (note N).
  - `mise exec -- node scripts/check-corpus.mjs` → `corpus OK (5 runbooks, … fact refs, … internal links)`.
  - `SKIP_SERVER=1 bash scripts/verify-corpus.sh` → `all arms passed` (arms 1, M0–M8).
- **Every node/npm/npx invocation is `mise exec -- …`** (shell node is 26.x; `.mise.toml`
  pins 22.11.0). Use `git -C <worktree>` and absolute paths; never rely on ambient cwd.
- **Verification commands** (named per task as V-selftest / V-check / V-offline / V-full /
  V-live):
  | tag | command | what it runs | cost |
  | --- | --- | --- | --- |
  | V-selftest | `mise exec -- node scripts/corpus-selftest.mjs` | Tier 1 unit assertions over the core | 1 s |
  | V-check | `mise exec -- node scripts/check-corpus.mjs` | Tier 1 build gate (same thing `prebuild` runs) | 1 s |
  | V-offline | `SKIP_SERVER=1 bash scripts/verify-corpus.sh` | arm 1 + M-arms (+ the new F-arms) | 5 s |
  | V-full | `bash scripts/verify-corpus.sh` | V-offline + `npm run build` + `next start` + S-arms | ~90 s |
  | V-live | `LIVE=1 SKIP_SERVER=1 bash scripts/verify-corpus.sh` | adds L1–L3: Tier 2 live checks + the Tier 3 mutants (network) | ~30 s |
  A stale `next start` on port 3998 makes V-full exit 2 by design ("port … already in use");
  free it, do not change the port.
- **Falsifiability protocol (non-negotiable — a check never seen red is indistinguishable
  from one that is unwired).** For every new assertion, arm or mutant: (1) write the check;
  (2) run it against the *unfixed* code or with the named mutation applied and confirm the
  **specific** failure message named in the task — not merely "non-zero"; (3) implement /
  revert the mutation; (4) run again and confirm green. Never commit a mutation: after each
  one, `git -C <worktree> diff --stat` must list only the files the task intends to change.
- **Docs travel with the code.** There is no `CHANGELOG.md` or `CLAUDE.md` in this repo;
  the only doc change is D1, which goes in its own commit as the spec says.

---

## 1. Commit order and the three dependency call-outs

The spec names four commits (A content, B serve paths, C harness, D spec wording). They
land in this order, for the reasons in the table. Tasks are numbered globally so a
subagent can be handed "task 12" without ambiguity.

| # | commit | tasks | why here |
| --- | --- | --- | --- |
| 1 | **C — harness** | 1–9 | C3 must precede A6 (call-out 1). C6 first inside the commit because it improves the evidence every later arm prints. |
| 2 | **A — corpus content** | 10–16 | A6 is atomic (call-out 2). Needs C3's `unverifiable` flag to exist. |
| 3 | **B — serve paths** | 17–21 | Changes what `renderRunbook` returns (call-out 3); all preconditions assertions/arms belong here so no commit boundary has a red gate. |
| 4 | **D — spec wording** | 22 | Doc-only. |
| — | close-out | 23 | full runs, push, evidence for the bd close. |

**Call-out 1 — C3 before or with A6.** After C3, `check-facts-live.mjs` turns a fact with no
`verify:` block into a `FAIL` row unless the fact carries `unverifiable: true`. A6's new
`wizard_labels` fact has no verify block, so it must be born with the flag, and the flag must
already be a recognised key (`RESERVED_KEYS` in `agent-corpus-core.mjs`, task 6). Landing A6
before C3 *with* the flag also works, but then C3's "sweep for a third unflagged fact" has to
be done twice. Do C first.

**Call-out 2 — A6 is one commit or the build breaks.** The Tier 1 gate enforces `facts_used`
in both directions. The moment `{{fact:wizard_labels.*}}` appears in a body, that runbook's
front-matter must list `wizard_labels`; the moment it is listed, the body must reference it;
and `corpus-selftest.mjs`'s `deepEqual(out.used, [...])` on `dns-delegation` (currently line
278) must list it too. Front-matter for two runbooks + body edits in two runbooks +
`mail-facts.yaml` + the selftest line land together (task 15) or `npm run build` fails at
`prebuild`.

**Call-out 3 — B1 changes `renderRunbook`'s `markdown`.** Every selftest assertion and every
served-body arm that reads a runbook's markdown sees the injected block from task 17
onward. The existing assertions are all `includes`/regex checks and survive (audited: the
`migration` check splits on `## Step 4`, the `signup-trial` check greps phrases — neither
depends on what precedes the H1). Two traps for *new* assertions: `start-here` has its own
`## Before you start` H2 at line 37, so an *absence* check must use the bold sentinel
`**Before you start.** This runbook assumes:` and never the bare phrase; and S2's `"# "`
sentinel is unaffected because the H1 stays first.

---

## 2. Commit 1 — Group C (harness)

### Task 1 — C6: `arm()` shows the head AND the tail of failing output

- [ ] **File:** `scripts/verify-corpus.sh` — `arm()` at lines 18–33; the two
  `echo "$out" | tail -n 5` calls at lines 24 and 30.
- [ ] **Change:** add a helper above `arm()` and call it from both sites:
  ```bash
  # evidence <text>: first 5 and last 5 lines, with a marker when anything was cut.
  # tail alone truncated the real "Cannot find module" line out of a RED transcript.
  evidence() {
    local n; n="$(printf '%s\n' "$1" | wc -l | tr -d ' ')"
    if [[ "$n" -le 10 ]]; then printf '%s\n' "$1"; return; fi
    printf '%s\n' "$1" | head -n 5
    echo "  ... ($((n - 10)) lines omitted) ..."
    printf '%s\n' "$1" | tail -n 5
  }
  ```
  Leave `header_arm`'s `head -n 8` (line 198) alone — that one already shows the top.
- [ ] **Falsifiability:** temporarily add, right after the `arm()` definition,
  `arm "C6 probe" pass "zz-never-present" -- seq 1 30`, then run V-offline. **Before** the
  change the FAIL block shows only `26..30`; **after** it shows `1..5`, the
  `... (20 lines omitted) ...` marker and `26..30`. Delete the probe line.
- [ ] **Verify:** V-offline → `all arms passed`; `git diff` shows only `verify-corpus.sh`.

### Task 2 — C4: `arg()` dies on an unknown flag instead of falling back to the real corpus

- [ ] **File:** `scripts/check-corpus.mjs` — `arg()` at lines 29–32, its three call sites at 33–35.
- [ ] **Change:** validate `process.argv` before any `arg()` call, and make a flag with a
  missing value fatal too (today `process.argv[i + 1]` being falsy also falls back):
  ```js
  const KNOWN_FLAGS = new Set(["--content-dir", "--facts", "--app-dir"]);
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--") && !KNOWN_FLAGS.has(a)) {
      console.error(`check-corpus: unknown flag ${a} (known: ${[...KNOWN_FLAGS].join(", ")})`);
      process.exit(2);
    }
  }
  function arg(name, fallback) {
    const i = process.argv.indexOf(name);
    if (i === -1) return fallback;
    const v = process.argv[i + 1];
    if (!v || v.startsWith("--")) { console.error(`check-corpus: ${name} needs a value`); process.exit(2); }
    return path.resolve(v);
  }
  ```
  Add one line to the header comment's check list (lines 7–13): `unknown flag  a misspelled --flag is fatal, never a silent fallback to the real corpus`.
- [ ] **New arm (offline), placed with the M-arms and BEFORE the `rm -rf "$SCRATCH"` at line 93:**
  ```bash
  arm "M9 unknown flag dies (does not fall back to the real corpus)" fail "unknown flag --content-dr" -- "${NODE[@]}" "$CHECK" --content-dr /nonexistent
  ```
- [ ] **Falsifiability:** add M9 **before** editing `check-corpus.mjs` and run V-offline: it
  must print `FAIL  M9 …: expected non-zero exit, got 0` — that is the fail-open bug,
  observed. Then implement; M9 must PASS and M0 must still PASS (M0 is what M9 protects:
  with a typo'd flag the "negative control" was silently the real corpus).
- [ ] **Verify:** V-check (bare invocation still `corpus OK`), V-offline.

### Task 3 — C7: a malformed YAML error names its file

- [ ] **Files:** `src/lib/agent-corpus-core.mjs` — `loadFacts` line 29 (`yaml.parse(raw)`),
  `parseFrontMatter` line 220 (`yaml.parse(m[1])`); `scripts/corpus-selftest.mjs`;
  `scripts/verify-corpus.sh`.
- [ ] **Change (core):** wrap each parse:
  ```js
  // parseFrontMatter
  let meta;
  try { meta = yaml.parse(m[1]) ?? {}; }
  catch (err) { throw new Error(`${filename}: front-matter is not valid YAML: ${err.message}`); }
  // loadFacts
  let parsed;
  try { parsed = yaml.parse(raw); }
  catch (err) { throw new Error(`facts file ${factsPath} is not valid YAML: ${err.message}`); }
  ```
- [ ] **Selftest assertions** (place AFTER `withTempDir` is defined, currently line 229).
  Fixture measured 2026-09-02: `yaml@2.8.x` throws
  `YAMLParseError: Nested mappings are not allowed in compact mappings` on `slug: a: b`.
  ```js
  check("parseFrontMatter names the file when the front-matter YAML is malformed", () => {
    assert.throws(() => core.parseFrontMatter("---\nslug: a: b\n---\n", "z.md"), /z\.md: front-matter is not valid YAML: Nested mappings/);
  });
  check("loadFacts names the file when the facts YAML is malformed", () => {
    withTempDir("corpus-selftest-badfacts-", (dir) => {
      const f = path.join(dir, "facts.yaml");
      fs.writeFileSync(f, "zz: a: b\n");
      assert.throws(() => core.loadFacts(f), /facts\.yaml is not valid YAML: Nested mappings/);
    });
  });
  ```
- [ ] **New arms (offline, before the `rm -rf "$SCRATCH"`):**
  ```bash
  d="$(fresh_copy)"; sed -i '' 's/^slug: dns-delegation$/slug: a: b/' "$d/agent/dns-delegation.md"
  arm "M10 malformed front-matter YAML names its file" fail "dns-delegation.md: front-matter is not valid YAML" -- check_on "$d"
  d="$(fresh_copy)"; printf 'zz: a: b\n' >> "$d/facts.yaml"
  arm "M11 malformed facts YAML names its file" fail "facts.yaml is not valid YAML" -- check_on "$d"
  ```
- [ ] **Falsifiability:** with the assertions and arms added but the core untouched, V-selftest
  must fail the first new check with an `AssertionError` whose actual message starts
  `Nested mappings…` (no `z.md:` prefix — the bug), and V-offline must show M10/M11
  `expected output to contain`. Then implement; all green.
- [ ] **Verify:** V-selftest, V-check, V-offline.

### Task 4 — C5: the denylist message stops impersonating a file line number

- [ ] **File:** `scripts/check-corpus.mjs` line 101.
- [ ] **Change:** `${where}:${hit.line}: denylisted command …` →
  `${where}: body line ${hit.line}: denylisted command (${hit.name}): ${hit.text}`.
  `hit.line` is a line of the *interpolated* body (`scanDenylist(rendered)` at line 100), so
  it is offset by every fact expansion above it — the 11-row registrar table alone shifts
  everything below it by ten. (See open question 5 on the label's wording.)
- [ ] **Falsifiability:** none needed beyond observation — M2's mutation still fires
  (`denylisted command (curl write verb)` is unchanged as its sentinel); run the M2 mutation
  by hand once and read the message: it must now read `dns-delegation.md: body line NNN: …`.
- [ ] **Verify:** V-offline (M2 still PASS).

### Task 5 — C3 (part 1): `unverifiable: true` — an absent `verify:` block is an error unless declared

- [ ] **Files:** `src/lib/agent-corpus-core.mjs` line 21 (`RESERVED_KEYS`);
  `src/data/mail-facts.yaml` lines 14–16 (header comment) and 46–48 (`test_migration_cap_gb`);
  `scripts/check-facts-live.mjs` line 150 (the `if (!verify)` SKIP); `scripts/verify-corpus.sh`.
- [ ] **Change (core):** `const RESERVED_KEYS = new Set(["verify", "pending", "unverifiable"]);`
  — required: `registrarEntries` uses this set to skip metadata keys, so an unregistered
  reserved key would surface as a phantom registrar row if anyone ever flagged `registrars`.
- [ ] **Change (facts):** under `test_migration_cap_gb:` add `unverifiable: true` on its own
  line with the comment `# product config the website cannot observe; declared, not defaulted`.
  Rewrite the header comment: a fact with neither `verify:` nor `unverifiable: true` is now a
  FAIL, so a mistyped `verify:` key can no longer silently downgrade a fact to SKIP.
- [ ] **Change (checker):** replace line 150 with
  ```js
  if (!verify) {
    if (fact?.unverifiable === true) { rows.push({ fact: key, status: "SKIP", detail: "unverifiable: true — product config the site cannot observe" }); continue; }
    rows.push({ fact: key, status: "FAIL", detail: "no verify block and no unverifiable: true — a mistyped verify: key would otherwise silently downgrade this fact to SKIP" });
    continue;
  }
  ```
  `registrars` is handled and `continue`d before this line (130–149) and is unaffected.
- [ ] **Sweep for a third unflagged fact:** every top-level key in `mail-facts.yaml` today is
  `nameservers`, `mx`, `customer_domain_records`, `signup_url` (all with `verify:`),
  `test_migration_cap_gb` (flag added here), `registrars` (special-cased). After task 15
  adds `wizard_labels` (flagged), there is no third. Confirm rather than trust: the F1 arm
  below plus a bare `mise exec -- node scripts/check-facts-live.mjs` under V-live must show
  **zero** `FAIL … no verify block` rows.
- [ ] **New arms (OFFLINE — `--only` on a fact with no verify block makes no network call, so
  these are NOT `LIVE=1`-gated; place them after the M-arms and before `rm -rf "$SCRATCH"`):**
  ```bash
  FACTS_LIVE="$ROOT/scripts/check-facts-live.mjs"
  arm "F1 unverifiable fact is SKIP by name (offline: --only scopes to a fact with no verify block)" pass "SKIP  test_migration_cap_gb  unverifiable: true" -- "${NODE[@]}" "$FACTS_LIVE" --only test_migration_cap_gb
  d="$(fresh_copy)"; printf '\nzz_probe_fact:\n  value: 1\n' >> "$d/facts.yaml"
  arm "F2 fact with neither verify nor unverifiable FAILS (no silent SKIP)" fail "FAIL  zz_probe_fact  no verify block and no unverifiable: true" -- "${NODE[@]}" "$FACTS_LIVE" --facts "$d/facts.yaml" --only zz_probe_fact
  ```
  (Two spaces between status, fact and detail — that is `render()`'s format at line 180.)
- [ ] **Falsifiability:** add F2 **before** the checker change: it must FAIL with
  `expected non-zero exit, got 0` (the checker prints `SKIP  zz_probe_fact  no verify block …`
  and exits 0 — the silent downgrade, observed). Implement; F1 and F2 PASS.
- [ ] **Verify:** V-selftest (the `test_migration_cap_gb` bare-resolve check at line 44 must
  still pass — the extra key does not disturb the one-hop `value` unwrap), V-offline.

### Task 6 — C3 (part 2): derive the MX expectation; rewrite the mutant that would otherwise go blind

- [ ] **Files:** `src/lib/agent-corpus-core.mjs`; `src/data/mail-facts.yaml` line 32;
  `scripts/check-facts-live.mjs` line 27 (import), 157–158 (MX branch), 233–238 (mutant);
  `scripts/corpus-selftest.mjs` line 273 and a new check.
- [ ] **Change (core):** export the derivation so the corpus renderer, the live checker and
  the selftest all read the same two leaves (this is the only way the spec's §7.1 "derived
  mx expectation" assertion can live in the selftest, which imports the core alone):
  ```js
  /** Live MX expectation, derived from the SAME leaves the runbooks render. */
  export function mxExpectation(mx) { return `${mx.priority} ${mx.target}.`; }
  ```
- [ ] **Change (facts):** `mx.verify` → `{type: dns, name: kuju.email, record: MX}` — delete
  `expect_contains`. (Open question 3: whether a leftover `expect_contains` should be a FAIL.)
- [ ] **Change (checker):** import `mxExpectation`; line 158 →
  `push(key, await checkMx(verify.name, mxExpectation(fact)), pending);`.
- [ ] **Change (mutant — REQUIRED, not optional):** the existing `mx-expect-mismatch` mutant
  mutates `f.mx.verify.expect_contains`, which nothing reads after this task. Left alone it
  becomes a no-op → `MUTANT-PASSED` → `SELF-TEST FAILED` → exit 2, and the nightly checker
  goes dark. Replace it (this is also the spec's "corrupt the derived mx target" step):
  ```js
  runMutant(
    "mx-target-mismatch",
    (f) => { f.mx.target = "MUTANT-MX-TOKEN-not-a-real-target"; },
    ["FAIL  mx  MX kuju.email -> ", '(want "10 MUTANT-MX-TOKEN-not-a-real-target.")'],
    "mx",
  ),
  ```
- [ ] **Selftest:** new check, and keep line 273's literal while adding the derived form:
  ```js
  check("mxExpectation derives the live expectation from the leaves the corpus renders", () => {
    assert.equal(core.mxExpectation(facts.mx), "10 mail.kuju.email.");
    assert.equal(core.mxExpectation({ target: "x.test", priority: 20 }), "20 x.test.");
  });
  // in the dns-delegation check, after line 273:
  assert.ok(out.markdown.includes(core.mxExpectation(facts.mx)), "rendered MX and live expectation must be the same string");
  ```
- [ ] **Falsifiability:** (a) temporarily set `priority: 20` in `mail-facts.yaml`; V-selftest
  must fail the new check *and* line 273; revert. (b) Under V-live, L1 must report the
  `mx-target-mismatch` row as `mutant-failed-as-required`; to see the guard itself bite,
  temporarily restore the old `expect_contains` mutant body and watch L1 print
  `MUTANT-PASSED  mx-expect-mismatch` then `SELF-TEST FAILED` — that is the failure this
  task prevents. Revert.
- [ ] **Verify:** V-selftest, V-check, V-offline, V-live (L1 line count is updated in task 7 —
  run V-live after task 7, or expect L1 to report `5/5` here and again `N/N` there).

### Task 7 — C8: mutants for the unmutated branches; bump `EXPECTED_MUTANT_COUNT`

- [ ] **Files:** `scripts/check-facts-live.mjs` lines 2 (header "five mutants"), 191
  (comment "5 mutants x …"), 222 (`EXPECTED_MUTANT_COUNT = 5`), `selfTest()` list 225–267;
  `scripts/verify-corpus.sh` line 100 (L1 sentinel `SELF-TEST OK: 5/5 …`).
- [ ] **Read open question 1 first.** Measured 2026-09-02: Node's resolver **throws
  `ENODATA`** for A, MX and CNAME on names with no such record; it never resolves to an
  empty array. So `checkDnsNonEmpty`'s `answers.length ? PASS : FAIL` FAIL arm (line 54)
  is unreachable by any facts mutation, and the spec's third mutant cannot be written as a
  facts mutant. The two reachable branches get mutants regardless:
  ```js
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
  ```
  Do NOT write the http mutant against `signup_url`: it is `pending: true`, and `push()`
  remaps its FAIL to `PENDING`, which is not "bad", so the child exits 0 → `MUTANT-PASSED`.
- [ ] **Then, per the answer to open question 1:** either (recommended) delete the dead
  `FAIL … -> empty` arm in `checkDnsNonEmpty` with a comment citing the ENODATA
  measurement, and set `EXPECTED_MUTANT_COUNT = 7`; or add the fault-injection hook
  described there and a third mutant, and set it to `8`. Update line 2, the line-191
  comment, and the L1 sentinel in `verify-corpus.sh` to the same number in the **same
  commit** — L1 is scored on the literal `SELF-TEST OK: N/N` string.
- [ ] **Falsifiability:** the constant is its own guard — bump `EXPECTED_MUTANT_COUNT` by one
  more than the list and watch `SELF-TEST FAILED: expected … found …`; revert. For each new
  mutant, temporarily change its `mustContain` to a string that cannot appear and watch
  `MUTANT-PASSED  <name>`; revert.
- [ ] **Verify:** V-live → `L1 … SELF-TEST OK: N/N mutants failed as required` PASS, L2, L3 PASS.

### Task 8 — C2: pin a runbook BODY inside `llms-full.txt`; make S11 check what its name says

- [ ] **File:** `scripts/verify-corpus.sh` — S4 loop line 234 (unchanged), S11 line 279, and a
  new S23 next to S14 (line 282).
- [ ] **Change:**
  ```bash
  # S11 checked only "**Why it matters:**", which every entry emits; it never proved SPF.
  body_arm   "S11a glossary.md carries the SPF entry (term + expansion heading)" "/kuju-email/glossary.md" "## SPF — Sender Policy Framework"
  body_arm   "S11b glossary.md carries why-it-matters" "/kuju-email/glossary.md" "**Why it matters:**"
  …
  # S23: S4 pins only the <!-- url --> marker; renderLlmsFullTxt pushes the marker THEN
  # the body, so a renderer emitting markers with empty bodies passes S4 five times over
  # and S14 pins only a REFERENCE body. This pins a heading that exists only inside the
  # dns-delegation runbook body (llms.txt carries title/outcome/Assumes, never headings).
  body_arm   "S23 llms-full.txt embeds a runbook BODY, not only its marker" "/llms-full.txt" "## Step 1 - Find out who runs this domain's DNS today"
  ```
  The S11a sentinel is what `renderGlossaryMarkdown` (`src/lib/agent-corpus.ts:111`) emits
  for `glossary.ts:31-32` (`term: "SPF"`, `expansion: "Sender Policy Framework"`) — an em
  dash, not a hyphen.
- [ ] **Falsifiability (one extra build):** apply BOTH mutations at once — in
  `agent-corpus-core.mjs:354` replace `r.markdown.trim()` with `""`, and in `glossary.ts:32`
  change the expansion to `Sender Policy Frameworx`. Run V-full. Required result: S4 ×5
  **PASS** (the blindness, demonstrated), S23 **FAIL** `body lacks`, S11a **FAIL**, S14
  FAIL. Revert both, `git diff --stat` shows only `verify-corpus.sh`, V-full green.
- [ ] **Verify:** V-full → `all arms passed`.

### Task 9 — C1: correct the `SITE_URL` docstring (enumerate, do not refactor)

- [ ] **File:** `src/lib/constants.ts` lines 29–37.
- [ ] **Change:** replace "and nowhere else: this is the only definition" with the truth. It
  is the only definition the *site* imports; two harness scripts cannot import a `.ts`
  file from plain node and carry the host as a literal — name the files, not counts or line
  numbers, so the comment does not rot:
  ```
   * Switch this the day the domain is attached and answers 200. This is the only
   * definition the SITE imports — but NOT the only copy. Two harness scripts run under
   * plain node, cannot import a .ts file, and hardcode the host; update them by hand in
   * the same change, and grep for it before claiming you are done:
   *   scripts/verify-corpus.sh      served-route sentinels (S4, S8, S20, S21, S23)
   *   scripts/check-facts-live.mjs  the User-Agent string and the mutant targets
   * Both fail loudly on drift, which is why they are duplicated rather than derived.
  ```
  (`check-facts-live.mjs` has the host in the UA at :42 and in mutants at :229, :263 and
  task 7's new one — "twice" in the spec is already stale; do not put a number in the comment.)
- [ ] **Verify:** `grep -n 'kaimoku-website.vercel.app' scripts/verify-corpus.sh scripts/check-facts-live.mjs`
  — every file listed must appear in the docstring and vice versa. `mise exec -- npm run lint`.

### Commit 1 gate

- [ ] V-selftest (N grows by 3), V-check, V-offline (arms 1, M0–M11, F1–F2), V-full, V-live all green.
- [ ] `git -C <worktree> add` the exact files, then commit:
  `harness: unverifiable facts, derived mx, unknown-flag guard, YAML errors name their file, llms-full body arm (launch-1.26 C1-C8)`.

---

## 3. Commit 2 — Group A (corpus content)

All content tasks share one verification: V-selftest + V-check + V-offline must stay green
after each. Denylist reminder: inline `` `code` `` spans in prose ARE scanned, so a rule that
mentions `sudo` in backticks will fail the build — mention such words in plain text.

### Task 10 — A2: HUMAN ACTION preamble, non-exhaustive form, applied backwards

- [ ] **Files/lines:** `src/content/agent/dns-delegation.md:21`
  (`are things you cannot do: registrar logins,`) and
  `src/content/agent/troubleshooting-delivery.md:19` (`are things you cannot do: clicking through DNS`).
- [ ] **Change:** `things you cannot do:` → `things you cannot do — for example` in both
  (em dash, matching `migration.md:24`, `signup-trial.md:20`).
- [ ] **Verify:** `grep -n 'things you cannot do' src/content/agent/*.md` → all five say
  `— for example`.

### Task 11 — A3: `start-here` rules 1 and 3 teach the real model

- [ ] **File:** `src/content/agent/start-here.md` — rule 1 at lines 19–21, rule 3 at 25–27.
- [ ] **Change (rule 1):** keep the read-only sentence; add that a 4-space-indented block
  means one of three things and the surrounding sentence says which: something to **run**,
  something to **say to the person** (a script, e.g. migration's cap explanation), or a
  **template to fill in** (e.g. the support report). Only the first kind is executed.
- [ ] **Change (rule 3):** three categories, not two: (1) `<angle brackets>` — yours to fill
  in at run time; (2) values with no brackets — real and current, do not "correct" them;
  (3) **illustrative examples** — always marked locally where they appear ("looks like
  `KUJU-7F3K-9QM2`", the worked `ns-1234.awsdns-56.org` table, "after a rotation it looks
  like `mail-20260901`", the "18 GB … 5 months" script) — never treat one as the person's
  value and never report one as observed.
- [ ] **Verify:** V-check (the backticked examples above contain nothing denylisted —
  confirm rather than assume: the build must say `corpus OK`).

### Task 12 — A4: routing table gains the sending-limit row

- [ ] **File:** `src/content/agent/start-here.md` "Which runbook" table, lines 53–58.
- [ ] **Change:** add a row after line 58:
  `| understand a sending-limit, rate-limit or quota error they hit while sending | [Troubleshoot mail delivery for a Kuju domain](/kuju-email/agent/troubleshooting-delivery.md), section C |`
- [ ] **Verify:** V-check (link resolves — the route exists).

### Task 13 — A5: scope the `nslookup` equivalence to what was measured

- [ ] **File:** `src/content/agent/start-here.md:48` (the `dig is missing` row).
- [ ] **Premise correction (measured 2026-09-02, see §7):** `nslookup -type=SRV` DOES exist and
  prints the same four fields as `dig +short` behind a `service =` label
  (`_imaps._tcp.fastmail.com  service = 0 1 993 imap.fastmail.com.`); `-type=TXT` prints the
  value with the **same** quotes behind a `text =` label
  (`demo.kuju.email  text = "v=spf1 mx ~all"`). Write the row to that, not to the spec's
  "no nslookup form for SRV" wording.
- [ ] **Change:** the row says: for NS and MX the observations are the same — read the
  `nameserver =` / `mail exchanger =` lines, "can't find" is an empty answer. For TXT and
  SRV `nslookup` prefixes the name and a `text =` / `service =` label, so compare the
  **value** on the right of `=`, not the whole line. The only thing `nslookup` cannot do
  is a `dig … @server` query; the runbook that uses one says what to do instead.
- [ ] **Verify:** V-check; re-read `dns-delegation.md:402-406` — its `@server` caveat still
  matches the sentence you wrote.

### Task 14 — A1 (content half): the routing row stops contradicting `dns-delegation`'s gate

- [ ] **File:** `src/content/agent/start-here.md:56`.
- [ ] **Change:** `| point their own domain at Kuju |` →
  `| point their own domain at Kuju (needs an active Kuju account — [redeem the invite](/kuju-email/agent/signup-trial.md) first) |`
  keeping the `Open` cell as is.
- [ ] **Verify:** V-check (two internal links in one cell both resolve).

### Task 15 — A6: wizard labels become a fact — ATOMIC (see call-out 2)

- [ ] **Files:** `src/data/mail-facts.yaml`; `src/content/agent/dns-delegation.md`;
  `src/content/agent/troubleshooting-delivery.md`; `scripts/corpus-selftest.mjs:278`.
- [ ] **Facts:** add, after `test_migration_cap_gb`:
  ```yaml
  wizard_labels:
    # Verbatim UI copy from kuju-mail's domain wizard (_wizard.html:49,56) and the
    # domain DNS page banner (_dns.html). The runbooks quote these so a copy change
    # is one edit here, not a hunt across two files (launch-1.25 missed one on the
    # first pass). Product config the site cannot observe: no verify block.
    use_kuju_dns: "Use Kuju DNS"
    keep_current_dns: "Keep your current DNS"
    nameservers_not_pointed: "Nameservers Not Pointed at Kuju"
    unverifiable: true
  ```
- [ ] **Bodies — TWELVE occurrences, not the spec's nine.** A literal grep misses three
  because the bold label is line-wrapped; re-flow those lines when you substitute.
  `dns-delegation.md`: **70–71** (`**Use Kuju\n>    DNS**`), **121–122** (`"Use Kuju DNS" or "Keep your\ncurrent DNS"`),
  151, 152, **171–172** (wrapped), **225–226** (`**Keep your\n>    current DNS**`), 229, 307, 308,
  366 (`"Nameservers Not Pointed at Kuju"`). `troubleshooting-delivery.md`: 50, 100.
  Forms: `**{{fact:wizard_labels.use_kuju_dns}}**`, `"{{fact:wizard_labels.keep_current_dns}}"`,
  `"{{fact:wizard_labels.nameservers_not_pointed}}"`. Leave the prose paraphrases alone
  (`:137` "keep your current DNS host", `:145`/`:199` "Keep the current DNS host") — they
  are not UI labels.
- [ ] **Front-matter:** `dns-delegation` →
  `facts_used: [nameservers, mx, customer_domain_records, registrars, wizard_labels]`
  (**keep `nameservers` first** — M4's `sed` anchors on `facts_used: [nameservers, `);
  `troubleshooting-delivery` → `facts_used: [mx, customer_domain_records, wizard_labels]`.
- [ ] **Selftest:** line 278 →
  `assert.deepEqual(out.used, ["customer_domain_records", "mx", "nameservers", "registrars", "wizard_labels"]);`
  and add two cheap checks near the other `resolveFact` ones:
  `resolveFact(facts, "wizard_labels.use_kuju_dns") === "Use Kuju DNS"` and
  `assert.throws(() => core.resolveFact(facts, "wizard_labels"), /non-scalar/)`.
- [ ] **Falsifiability (comes free from the both-direction gate — observe it, do not skip
  it):** run V-check after editing the facts and front-matter but before the bodies: it must
  print `facts_used lists "wizard_labels" but the body never references it` for both files.
  After the bodies and before the selftest edit, V-selftest must fail at the `deepEqual`.
  Then finish; both green.
- [ ] **Verify:** `grep -n -e 'Use Kuju DNS' -e 'Keep your current DNS' -e 'Nameservers Not Pointed' -e 'Use Kuju$' -e 'Keep your$' src/content/agent/*.md`
  → **0 lines**; `grep -c 'wizard_labels\.' src/content/agent/dns-delegation.md` → 10,
  `…/troubleshooting-delivery.md` → 2; V-selftest, V-check, V-offline (M4 still PASS);
  F1-style probe `mise exec -- node scripts/check-facts-live.mjs --only wizard_labels` →
  `SKIP  wizard_labels  unverifiable: true …`, exit 0.

### Task 16 — A7: bound the return edge; copy the authoritative-nameserver check

- [ ] **File:** `src/content/agent/troubleshooting-delivery.md` — B1 table rows at lines 85
  and 100 (both route to `dns-delegation` Step 5 unbounded); insert a new `### B1a` between
  the DKIM table (line 100) and `### B2` (line 102).
- [ ] **Change:**
  1. New `### B1a - Before routing back: rule out a cached answer`. Copy — do not move —
     `dns-delegation.md:396-427`'s check (the four `dig … @<nameserver>` lines, the
     status/ANSWER table, and the `nslookup`-cannot-do-this caveat at 402–406). This
     runbook has no Step 1 that captured nameservers, so B1a opens with
     `dig NS <domain> +short` and says "ask EACH host it prints". Keep the copy's wording
     close to the original so a later edit to one is easy to mirror in the other.
  2. Rows 85 and 100: route through B1a first (`… - B1a, then dns-delegation Step 5`).
  3. The bound, mirroring `dns-delegation.md:432`: *If a record is still missing after two
     re-checks, stop here: collect the evidence for support (see Report) rather than
     returning to the DNS runbook a third time.* Each file now bounds its own escalation.
- [ ] **Verify:** V-check (the copied `dig` lines contain `@<nameserver …>` placeholders,
  no single braces, nothing denylisted); V-selftest.

### Commit 2 gate

- [ ] V-selftest, V-check, V-offline green. V-full green (S7's `ns1.kuju.email` and S2's
  `{{fact:` absence cover the rendered wizard labels on the served route).
- [ ] Commit: `agent corpus: preamble/rule/routing fixes, wizard labels as a fact, bounded troubleshooting loop (launch-1.26 A1-A7)`.

---

## 4. Commit 3 — Group B (serve paths)

### Task 17 — B1 core: render preconditions in `renderRunbook` and `renderLlmsTxt` (+ selftest)

- [ ] **Files:** `src/lib/agent-corpus-core.mjs` (`renderRunbook` 313–320, `renderLlmsTxt`
  339–346); `scripts/corpus-selftest.mjs`.
- [ ] **Change (core):**
  ```js
  /** The "Before you start" block. Empty list → empty string (start-here). */
  export function renderPreconditions(preconditions) {
    if (!preconditions?.length) return "";
    return [
      "**Before you start.** This runbook assumes:",
      "",
      ...preconditions.map((p) => `- ${p}`),
      "",
      "If one of these is not true, stop and resolve it first.",
    ].join("\n");
  }
  /** Insert after the first H1 line; a body with no H1 gets the block prepended. */
  function injectAfterH1(text, block) {
    if (!block) return text;
    const m = text.match(/^# .*$/m);
    if (!m) return `${block}\n\n${text}`;
    const at = m.index + m[0].length;
    return `${text.slice(0, at)}\n\n${block}\n${text.slice(at)}`;
  }
  ```
  In `renderRunbook`: `const markdown = absolutiseLinks(injectAfterH1(text, renderPreconditions(runbook.preconditions)), siteUrl);`
  — this single change covers the `.md` route (`[file]/route.ts:26` returns
  `runbook.markdown`) and `llms-full.txt` (`renderLlmsFullTxt` pushes `r.markdown`).
  In `renderLlmsTxt`, line 341 →
  `lines.push(`- [${r.title}](${r.url}): ${r.outcome}${r.preconditions?.length ? ` Assumes: ${r.preconditions.join("; ")}.` : ""}`);`
  (literal spec format; open question 2 on punctuation). Preconditions are **not**
  interpolated and not link-rewritten — they are front-matter prose (open question 6).
- [ ] **Selftest (new checks; place after `withTempDir`):**
  ```js
  check("renderRunbook injects the preconditions block after the H1 when the list is non-empty", () => {
    const rb = { slug: "p", title: "P", order: 1, preconditions: ["alpha is true", "beta is true"], outcome: "o", facts_used: [], body: "\n# P\n\nIntro.\n", filename: "p.md" };
    const md = core.renderRunbook(rb, facts, "https://site.test").markdown;
    const h1 = md.indexOf("# P"), blk = md.indexOf("**Before you start.** This runbook assumes:"), intro = md.indexOf("Intro.");
    assert.ok(h1 !== -1 && blk > h1 && intro > blk, md);
    assert.ok(md.includes("- alpha is true\n- beta is true"), md);
    assert.ok(md.includes("If one of these is not true, stop and resolve it first."), md);
  });
  check("renderRunbook prepends the block when the body has no H1", () => {
    const rb = { slug: "q", title: "Q", order: 1, preconditions: ["x"], outcome: "o", facts_used: [], body: "No heading.\n", filename: "q.md" };
    assert.ok(core.renderRunbook(rb, facts, "https://site.test").markdown.startsWith("**Before you start.**"));
  });
  check("renderRunbook emits NO block for an empty list — start-here (note: it has its own '## Before you start' H2, so the BOLD sentinel is what must be absent)", () => {
    const sh = core.loadRunbooks(path.join(ROOT, "src/content/agent")).find((r) => r.slug === "start-here");
    assert.deepEqual(sh.preconditions, []);
    assert.ok(!core.renderRunbook(sh, facts, "https://site.test").markdown.includes("**Before you start.** This runbook assumes:"));
  });
  check("dns-delegation's SERVED body states the signup-trial gate it declares", () => {
    const rb = core.loadRunbooks(path.join(ROOT, "src/content/agent")).find((r) => r.slug === "dns-delegation");
    assert.ok(core.renderRunbook(rb, facts, "https://site.test").markdown.includes("- the customer has an active Kuju account (see signup-trial)"));
  });
  check("renderLlmsTxt appends Assumes: only for a runbook with preconditions", () => {
    const x = { slug: "x", title: "X", order: 1, preconditions: [], outcome: "done", facts_used: [], body: "# X\n", filename: "x.md" };
    const y = { slug: "y", title: "Y", order: 2, preconditions: ["a", "b"], outcome: "done", facts_used: [], body: "# Y\n", filename: "y.md" };
    const txt = core.renderLlmsTxt(core.buildIndex([x, y], facts, "https://site.test", []));
    assert.ok(txt.includes("- [X](https://site.test/kuju-email/agent/x.md): done\n"), txt);
    assert.ok(txt.includes("- [Y](https://site.test/kuju-email/agent/y.md): done Assumes: a; b.\n"), txt);
  });
  ```
- [ ] **Falsifiability (spec §7.3 "empty the preconditions block"):** temporarily make
  `renderPreconditions` return `""` unconditionally → the first, second, fourth and (Y half
  of the) fifth checks fail; the third still passes (negative control must not flip). Revert.
  Then temporarily set `preconditions: []` in `dns-delegation.md` → only the fourth fails.
  Revert; `git diff --stat` lists only core + selftest.
- [ ] **Verify:** V-selftest, V-check (unchanged: it scans `rb.body`), V-offline.

### Task 18 — B1 landing page: render the list under each outcome

- [ ] **File:** `src/app/kuju-email/agent/page.tsx` — the runbook `<li>` at lines 58–67;
  `r.outcome` is at line 63. `RenderedRunbook` already types `preconditions: string[]`.
- [ ] **Change:** after the outcome `<p>`:
  ```tsx
  {r.preconditions.length > 0 && (
    <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">
      <li className="list-none -ml-4 font-medium">Assumes:</li>
      {r.preconditions.map((p) => <li key={p}>{p}</li>)}
    </ul>
  )}
  ```
  (Shape is the implementer's call — a list, per the spec; class names follow the file's
  existing slate palette.)
- [ ] **Verify:** `mise exec -- npm run lint`; S24 in task 20.

### Task 19 — B1 gate: the preconditions block gets the same scans as the body (+ M12)

- [ ] **Files:** `scripts/check-corpus.mjs` (import list 17–25, after the denylist loop at
  100–102); `scripts/verify-corpus.sh`.
- [ ] **Change:** import `renderPreconditions`; after check 3 add
  ```js
  // 3b. the preconditions block is SERVED (renderRunbook injects it), so it is scanned
  // like the body: "every string an agent could execute is scanned" stays true, not nearly true.
  const pre = renderPreconditions(rb.preconditions);
  for (const hit of scanDenylist(pre)) problems.push(`${where}: preconditions: denylisted command (${hit.name}): ${hit.text}`);
  for (const m of pre.matchAll(SINGLE_BRACE_RE)) problems.push(`${where}: preconditions: single-brace token ${m[0]} — use <name> for run-time placeholders`);
  ```
  (The single-brace half is one line beyond the spec's "denylist" wording, same rationale.)
- [ ] **New arm (offline, before `rm -rf "$SCRATCH"`):**
  ```bash
  d="$(fresh_copy)"; sed -i '' 's/^  - you can run dig (or nslookup)$/  - run `sudo dig` first/' "$d/agent/dns-delegation.md"
  arm "M12 denylisted command inside a precondition fails" fail "preconditions: denylisted command (privileged or destructive tool)" -- check_on "$d"
  ```
  (Inline span → `extractCodeLines` picks it up → the `sudo` rule fires at command position.)
- [ ] **Falsifiability:** add M12 **before** the checker change → `expected non-zero exit,
  got 0` (the hole, observed). Implement → PASS. Confirm the `sed` actually landed
  (`grep -c 'sudo dig' "$d/agent/dns-delegation.md"` = 1) — a no-op sed would make M12 fail
  for the wrong reason.
- [ ] **Verify:** V-check, V-offline.

### Task 20 — B1 served arms (beyond §7's minimum; cheap, and the spec's thesis is "the served output is the thing under test")

- [ ] **File:** `scripts/verify-corpus.sh`, next to S23.
  ```bash
  body_arm "S24 landing page renders a runbook's preconditions under its outcome" "/kuju-email/agent" "the customer has an active Kuju account (see signup-trial)"
  body_arm "S25 llms.txt carries the routing-time Assumes: gate" "/llms.txt" "Assumes: the customer owns a domain and can log in to wherever it is registered;"
  body_arm "S26 dns-delegation.md serves the preconditions block" "/kuju-email/agent/dns-delegation.md" "**Before you start.** This runbook assumes:"
  ```
  Sentinel uniqueness: none of the three strings appears in `PROMPT` (`page.tsx:14`),
  `metadata` (`:8-12`) or the Index-files section — the same audit S19–S21's comments record.
- [ ] **Falsifiability:** add S24–S26 to the harness **before** tasks 17–18 are applied
  (or with them stashed) and run V-full: all three must FAIL `body lacks`. Apply; V-full green.
  One extra build, deliberately paid.
- [ ] **Verify:** V-full.

### Task 21 — B2: `CopyButton` announces its result

- [ ] **File:** `src/components/agent/CopyButton.tsx` — the `<button>` at lines 23–27.
- [ ] **Change:** add `aria-live="polite"` and `aria-atomic="true"` to the button (the spec's
  chosen shape; open question 8). Update the docstring at lines 5–8 to say the label swap
  is announced.
- [ ] **Verify:** `mise exec -- npm run lint`; after V-full's build, while `next start` is up
  (or spin one up on 3998): `curl -s http://127.0.0.1:3998/kuju-email/agent | grep -o 'aria-live="polite"' | wc -l`
  → **6** (one prompt button + five runbook buttons; React SSR emits client-component
  attributes in the initial HTML). No permanent arm (open question 9).

### Commit 3 gate

- [ ] V-selftest (N grows by 5), V-check, V-offline (M12), V-full (S23–S26, S11a/b) green.
- [ ] Commit: `agent corpus: serve preconditions on all four paths; CopyButton live region (launch-1.26 A1/B1/B2)`.

---

## 5. Commit 4 — Group D (spec correction)

### Task 22 — D1: narrow the old spec's read-only claim to the runbooks

- [ ] **File:** `docs/superpowers/specs/2026-08-31-agent-friendly-docs-design.md`, lines
  **270** (`Every command in the corpus is read-only: …`) and **287**
  (`- no write-verb commands anywhere in the corpus (denylist: …`).
- [ ] **Change:** both say "the runbooks", and 270's paragraph states the exclusion: Tier 1
  scans `src/content/agent/*.md` only; the generated twins (`glossary.md` from
  `src/lib/glossary.ts`, `docs.md` from `src/lib/api-docs.ts`) are TypeScript and
  unreachable from plain node 22.11.0 (`Unknown file extension ".ts"`); their example
  bodies are DNS-record and mail-header specimens, not commands — confirmed by reading every
  `body:` field on 2026-09-02. Line 287 gets a parenthetical pointing at that paragraph.
- [ ] **Verify:** `grep -n 'in the corpus' <spec>` no longer lists either line;
  `grep -n 'in the runbooks' <spec>` lists both.
- [ ] Commit: `spec: read-only enforcement covers the runbooks, not the TS twins (launch-1.26 D1)`.

---

## 6. Task 23 — close-out

- [ ] V-selftest, V-check, V-offline, V-full, V-live — all green on the final tree; paste
  the summary lines (`corpus-selftest: N checks passed`, `corpus OK (…)`, `all arms passed`
  twice, `SELF-TEST OK: N/N`) into the bd close.
- [ ] `git -C <worktree> log --oneline 677bdea..HEAD` shows exactly four commits.
- [ ] Push the branch to `origin` (GitHub for this repo). **Merging to `main` triggers the
  Vercel production deploy** — that decision belongs to the dispatcher / the `launch-1`
  epic flow, not to this plan. If/when it deploys: poll
  `https://kaimoku-website.vercel.app/llms-full.txt` (60–90 s) and paste the served
  `**Before you start.** This runbook assumes:` block plus an `Assumes:` line from
  `/llms.txt` as the live evidence. Say "push to GitHub", never "push to Vercel".
- [ ] `bd close launch-1.26` with the evidence; `bin/loom release launch-1.26`. The worktree
  is per-project, so teardown is by hand
  (`git -C /Users/macole/github/kaimoku-website worktree remove …`, `branch -d`) after merge.

---

## 7. Premise corrections found while planning (spec vs tree, 2026-09-02)

1. **A5 — `nslookup` DOES have SRV and TXT forms.** Measured: `nslookup -type=SRV
   _imaps._tcp.fastmail.com` → `service = 0 1 993 imap.fastmail.com.` (same four fields as
   `dig +short`); `nslookup -type=TXT demo.kuju.email` → `text = "v=spf1 mx ~all"` (same
   quoting as `dig`). The difference is a `name  label =` prefix, not quoting and not
   absence. Task 13 is written to the measurement.
2. **A6 — twelve occurrences, not nine.** Three bold labels are line-wrapped
   (`dns-delegation.md:70-71`, `171-172`, `225-226`) and invisible to a literal grep; task 15
   lists all twelve.
3. **C1 — "twice in `check-facts-live.mjs`" is three code sites** (`:42` UA, `:229`, `:263`)
   plus a comment, and task 7 adds a fourth. The docstring names files, not counts.
4. **C8 — the "resolved but empty answer array" branch is unreachable.** Node throws
   `ENODATA` (measured for A, MX, CNAME); no facts mutation can reach `FAIL … -> empty`.
   The spec's 5 → 8 count depends on how open question 1 is answered.
5. **C3 has an unstated consequence:** deriving the MX expectation makes the existing
   `mx-expect-mismatch` mutant a no-op, which would fail the self-test (exit 2) on the first
   nightly run. Task 6 rewrites it.
6. **The L1 arm is scored on the literal `SELF-TEST OK: 5/5`** (`verify-corpus.sh:100`), so
   any change to the mutant count must update it in the same commit (task 7).

## 8. Decisions — RESOLVED by the dispatcher, 2026-09-02. Do not re-open.

These were the plan's open questions. Every one is now settled; treat each as binding plan
text. If implementation shows a decision is wrong, report it — do not silently deviate.

1. **C8, the unreachable DNS-empty branch → KEEP IT, DOCUMENTED. Ship 7.** Do NOT delete the
   branch and do NOT add a fault-injection hook (an env var that can make the nightly deadman
   lie is a worse trade than an uncovered defensive branch). Leave
   `checkDnsNonEmpty`'s `answers.length ? PASS : FAIL` intact and put this above it:
   ```js
   // Defensive only. Measured 2026-09-02 across A/TXT/MX on six no-data names
   // (kuju.email/_dmarc.demo.kuju.email/ns1.kuju.email/kaimoku-website.vercel.app):
   // node ALWAYS rejects with ENODATA and never resolves to []. Deliberately NOT
   // mutant-covered — no facts mutation can reach it through the public DNS path.
   ```
   Ship the two reachable mutants from task 7, `EXPECTED_MUTANT_COUNT = 7`, and update the
   L1 sentinel in `verify-corpus.sh` to `SELF-TEST OK: 7/7 mutants failed as required` in the
   SAME commit. The spec's "5 → 8" is superseded; its premise (a reachable branch) was false.

2. **`llms.txt` punctuation → use an em dash, NOT the spec's bare append.** Outcomes carry no
   terminal period, so the spec's literal form renders `…: outcome Assumes: a; b.` with no
   separator. Emit instead:
   ```js
   lines.push(`- [${r.title}](${r.url}): ${r.outcome}${r.preconditions?.length ? ` — Assumes: ${r.preconditions.join("; ")}.` : ""}`);
   ```
   Task 17's selftest sentinel becomes `": done — Assumes: a; b.\n"`, and task 20's S25
   sentinel becomes `"— Assumes: the customer owns a domain and can log in to wherever it is registered;"`.

3. **A leftover `expect_contains` on `mx.verify` → delete it AND guard against its return.**
   Both halves. Delete the key from `mail-facts.yaml`, and in the MX branch of
   `check-facts-live.mjs` emit a FAIL row when a `verify.expect_contains` is still present:
   `FAIL  <key>  expect_contains is derived from target/priority now — remove it from mail-facts.yaml`.
   A stale literal silently coexisting with its derived replacement is this issue's own
   failure class; the guard costs two lines. Give it a falsifiability step (re-add the key,
   watch the FAIL row, revert).

4. **A fact with BOTH `verify:` and `unverifiable: true` → FAIL.** Contradiction, not a
   preference. Emit
   `FAIL  <key>  contradictory: has a verify block AND unverifiable: true`. Add it in task 5
   with the other `unverifiable` logic, with a falsifiability step.

5. **C5 label → `rendered body line N`, not `body line N`.** The whole finding is that the
   number misleads after fact expansion; `body line N` still reads as jump-to-line. Task 4's
   message becomes
   `${where}: rendered body line ${hit.line}: denylisted command (${hit.name}): ${hit.text}`.

6. **Preconditions are served verbatim** — not interpolated, not link-rewritten. Accepted as
   the plan describes. `(see signup-trial)` stays plain text on every path.

7. **Landing-page shape → the `<ul>` in task 18.** Accepted as written.

8. **B2 placement → the spec's shape**: `aria-live="polite"` and `aria-atomic="true"` on the
   button itself. Two attributes, as the finding says.

9. **`aria-live` DOES get a permanent arm** — this overrides the plan's "one-off curl".
   Add to `verify-corpus.sh` beside S24–S26:
   ```bash
   count_arm "S27 every CopyButton carries a live region" "/kuju-email/agent" 'aria-live="polite"' <MEASURED>
   ```
   Cheap, permanent, and consistent with this change's own thesis that the served output is
   the thing under test. Falsifiability: remove the attribute, watch S27 report
   `expected N, got 0`; restore. NOTE `count_arm` uses `grep -cE`, so it counts matching
   **lines**, not occurrences — if the served HTML puts several buttons on one line the
   number is lower than six. MEASURE it against the built site and use the measured value,
   recording what you measured in a comment beside the arm.

10. **Deploy → YES.** Merge to `main` (which is the Vercel production deploy) and live-verify
    per task 23. Push to GitHub; never say "push to Vercel". The dispatcher owns the merge —
    an implementer subagent must NOT push, merge, or touch `bd`/`loom`.

## 9. Dispatcher corrections to §0 and the tasks

- **§0's first ground rule is WRONG — do NOT run `npm ci`.** Measured 2026-09-02 in this
  worktree: `mise exec -- node -e 'console.log(require.resolve("yaml"))'` prints
  `/Users/macole/github/kaimoku-website/node_modules/yaml/dist/index.js`. Node's module
  resolution walks UP the directory tree and finds the MAIN checkout's `node_modules`, so the
  worktree needs no install of its own. The full baseline below was captured that way,
  `npm run build` included. Skip that step.
- **Baseline measured on `677bdea` before any task ran** (use it to tell a regression from a
  pre-existing failure):

  | command | result |
  | --- | --- |
  | V-selftest | `corpus-selftest: 29 checks passed` |
  | V-check | `corpus OK (5 runbooks, 26 fact refs, 11 internal links)` |
  | V-offline | `all arms passed` (10 arms) |
  | V-full | `all arms passed` (49 arms, exit 0) |
  | V-live | `SELF-TEST OK: 5/5`; `summary: PASS=15 PENDING=1 SKIP=2` |

- **Task 15's `grep -c 'wizard_labels\.'` expectation of 10 is a LINE count, not an
  occurrence count**, and line 121–122 carries two labels. After re-flowing, 10 lines /
  11 references is the expected shape. Verify by reading, and report the actual numbers
  rather than forcing them to match.
- **Task 20's falsifiability ordering.** Its S24–S26 arms must be seen RED before tasks 17–18
  are in place. Since all four land in commit 3, add the arms to `verify-corpus.sh` FIRST,
  run V-full and observe the three `body lacks` failures, then implement 17–18 and re-run.
  Do not skip the red observation because the tasks share a commit.
