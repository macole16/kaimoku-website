# Agent corpus hygiene — design

**Issue:** `launch-1.26` (child of `launch-1`, Kuju Mail public launch readiness)
**Date:** 2026-09-02
**Status:** approved, ready for implementation

Bundles the remaining FILE-verdict findings from the `launch-1.8` whole-branch review
and the deferred minors from the `launch-1.25` review. Seventeen changes across four
groups. The reviewer's DROP verdicts are deliberately not carried here.

Every premise below was re-verified against the tree at `d682dad` before this document
was written; the "verified" column names the evidence, not the ticket.

---

## 1. Why these are one change and not fifteen

Three of them share a single root cause, which is the reason for grouping rather than
filing them separately:

- **A field can be authored, validated and typed, and still reach nobody.**
  `preconditions` is in `REQUIRED_META`, is a `RunbookMeta` field in TypeScript, and is
  emitted by no serve path (item 1).
- **A convention can be adopted forward-only.** The Task 9 amendment requiring
  non-exhaustive HUMAN ACTION examples was applied to three files and not the two that
  already existed (item 2).
- **A check can pin a marker and be read as pinning the content behind it.** `llms-full.txt`
  is asserted only by its `<!-- url -->` comments (item 7).

All three are the same failure: *the artifact exists, so the job looks done.* The fix in
each case is to make the served output the thing under test.

---

## 2. Group A — corpus content

### A1. Serve the preconditions (item 1)

**Verified:** `renderLlmsTxt` emits `- [title](url): outcome`; `renderLlmsFullTxt` emits
`r.markdown`; `[file]/route.ts` returns `runbook.markdown`; `page.tsx` renders
`r.outcome`. `parseFrontMatter` strips front-matter before any of them see it. No path
emits `preconditions`.

**Load-bearing instance:** `dns-delegation` declares "the customer has an active Kuju
account (see signup-trial)" and the served body never says so, while `start-here`'s
routing table sends "point their own domain at Kuju" straight there with no gate — and
that runbook's Step 3 has a human replace their nameservers, an action the same runbook
warns "moves ALL DNS for the domain, not only mail".

**Decision: render on all four paths.** Two of them come free:

```
renderRunbook()  ──> markdown ──┬──> [file]/route.ts        (.md route)
                                └──> renderLlmsFullTxt()    (llms-full.txt)
```

so injecting the block inside `renderRunbook` covers both. `renderLlmsTxt` and
`page.tsx` each need their own.

- **Body.** After the H1 line, insert:

  ```
  **Before you start.** This runbook assumes:

  - <precondition>
  - <precondition>

  If one of these is not true, stop and resolve it first.
  ```

  An empty `preconditions` list emits nothing (this is `start-here`, which has none).
  Insertion is after the first `/^# /m` line so it is deterministic; a body with no H1
  gets the block prepended.

- **`llms.txt`.** Append ` Assumes: a; b; c.` to the runbook's line when the list is
  non-empty. This is the routing-time signal — an agent picking a runbook off the map
  sees the gate before it opens the file. The llmstxt.org shape (one
  `- [name](url): description` line per entry) is preserved.

- **Landing page.** Render the list under each runbook's outcome.

- **Content gate.** Add the signup-trial dependency to `start-here`'s
  "point their own domain at Kuju" row, so the routing table stops contradicting
  `dns-delegation`'s own precondition.

**Scanning note.** `check-corpus.mjs` scans `interpolate(rb.body, facts)` — the body,
not the rendered block. Preconditions are front-matter prose and are not a plausible
home for an executable command, but the denylist scan is extended to cover them so the
new surface is not a hole. This is cheap and keeps "every string an agent could execute
is scanned" true rather than nearly true.

### A2. HUMAN ACTION preamble, applied backwards (item 2)

**Verified:** `migration`, `signup-trial` and `start-here` say "— for example";
`dns-delegation:21` and `troubleshooting-delivery:19` use a bare colon-list.

The colon form reads as an exhaustive category list, and both files tag steps their own
list omits: `troubleshooting-delivery:70` tags *creating* a mailbox where the list says
only "reading a value", and `dns-delegation:314` hands off to *registrar support*, which
is in neither list. Two words per file: `things you cannot do:` →
`things you cannot do — for example`.

Low risk on its own — every tagged line carries its own imperative — but the standing
rule exists and half the corpus does not follow it.

### A3. `start-here` rule 3's category model (item 3)

**Verified:** rule 3 teaches exactly two categories ("`<angle brackets>` are yours to
fill in… Values with no brackets are real and current"). Four earlier values are neither:

| value | file | hedge present |
| --- | --- | --- |
| `KUJU-7F3K-9QM2` | `signup-trial:30` | "looks like" |
| `ns-1234.awsdns-56.org` | `dns-delegation:102` | worked-example table |
| DKIM selector `default` | `dns-delegation:356` | "confirm… rather than trusting this" |
| "18 GB… last 5 months" | `migration:93` | say-this block |

The layered defence held (criterion 7), and the DKIM one is HUMAN-ACTION-tagged. But the
rule as written licenses an agent to treat an illustrative value as current. Rewrite to a
**three**-category model: fill-in placeholders, real current values, and illustrative
examples (always locally marked).

Rule 1 gets the companion fix: 4-space-indented blocks mean three different things in
this corpus — *run this*, *say this to the person*, *fill this in* — and rule 1 currently
teaches only the first.

### A4. Routing table omits Section C (item 4)

**Verified:** four rows, none matching `troubleshooting-delivery`'s "I hit a sending
limit". A symptom router that omits a symptom fails at its only job. One row.

### A5. Scope the nslookup claim (item 5)

**Verified:** `start-here:47` generalises "the observations are the same" from the single
NS precedent to every `dig` in the corpus. Untrue for TXT (`nslookup` quotes and labels
differently from `dig +short`) and there is no `nslookup` form at all for `migration`'s
SRV lookup. Scope the equivalence to NS/MX and say plainly that TXT and SRV differ.

### A6. Wizard labels become a fact (notes item 1)

**Verified:** "Use Kuju DNS" / "Keep your current DNS" appear across `dns-delegation`
(:121, :151, :152, :229, :307, :308) and `troubleshooting-delivery` (:50, :100); the
admin banner "Nameservers Not Pointed at Kuju" is quoted at `dns-delegation:366`. All are
kuju-mail UI copy (`_wizard.html:49,56`, `_dns.html`) with no fact and no registry entry.

The cost is already demonstrated: `launch-1.25` renamed
`troubleshooting-delivery.md:50` and missed `:99` on the first pass. Worse,
`dns-delegation` instructs the agent to describe the banner *before* the person reads it
out, so a UI copy change surfaces as the agent confidently predicting something the
customer cannot find.

Add a `wizard_labels` fact with three scalar leaves — `use_kuju_dns`,
`keep_current_dns`, `nameservers_not_pointed` — referenced as
`{{fact:wizard_labels.use_kuju_dns}}`. No verify block: product config the site cannot
observe, the same shape as `test_migration_cap_gb`, so it carries `unverifiable: true`
per C3. Consequences:

- both runbooks' `facts_used` front-matter gains the key;
- `corpus-selftest.mjs:278`'s `deepEqual(out.used, [...])` on `dns-delegation` must be
  updated in the same commit — this is precisely why the item was held out of
  `launch-1.25`, which was a bugfix.

### A7. Bound the routing cycle (notes item 2)

**Verified:** `dns-delegation:432` bounds re-checks at two and then escalates to
`troubleshooting-delivery`; `troubleshooting-delivery:100` routes a missing SPF/DMARC/DKIM
back to `dns-delegation` Step 5 with no bound. Each lap costs roughly two customer
round-trips (the DKIM selector is re-asked at `troubleshooting:91` after `dns-delegation`
already obtained it) and about six digs that were just run.

Add the matching bound on the troubleshooting side: **two** re-checks, mirroring
`dns-delegation`'s wording, after which the agent stops and collects the evidence for
support rather than routing back a third time. The bound belongs on the *return* edge —
each file bounds its own escalation, so neither can loop even if the other is opened
first.

Also **copy** `launch-1.25`'s authoritative-nameserver cache check into
`troubleshooting` (`dns-delegation` keeps its own; this is duplication of a check, not a
move). `troubleshooting` currently runs cache-blind recursive lookups, which is what
makes a "still missing" answer untrustworthy enough to justify another lap.

---

## 3. Group B — serve paths

### B1. Preconditions rendering

Implementation of A1 in `agent-corpus-core.mjs` (`renderRunbook`, `renderLlmsTxt`) and
`page.tsx`.

### B2. `CopyButton` announces its result (item 14)

**Verified:** the component's only feedback is a label swap between "Copy"/"Copied"/
"Copy failed", with no live region, so a screen reader announces nothing. Add
`aria-live="polite"` and `aria-atomic="true"`.

---

## 4. Group C — harness

The unifying theme: **five checks that pass for reasons other than the thing they name.**

### C1. `SITE_URL` docstring is wrong (item 6)

**Verified:** the docstring says "this is the only definition"; the host is also hardcoded
in four `verify-corpus.sh` arms (S4, S8, S20, S21) and twice in `check-facts-live.mjs`.

Both consumers genuinely cannot import a `.ts` constant, so **the fix is to correct the
comment to enumerate them, not to refactor.** The harness copies fail loudly and are
fine. The `check-facts-live.mjs` `pending-now-passes` mutant target is a real latent
problem — if that URL stops returning 200 the mutant scores `MUTANT-PASSED` →
`SELF-TEST FAILED` → exit 2 and the nightly checker goes dark announcing that *it* is
broken — but that belongs to `launch-1.22` and is explicitly **out of scope here**.

### C2. Pin a runbook body inside `llms-full.txt` (item 7)

**Verified:** S4 asserts only `<!-- url -->`. `renderLlmsFullTxt` pushes the marker then
the body, so a renderer emitting markers with empty bodies passes S4 five times over.
S14 pins one *reference* body; no arm pins any *runbook* body — the single-fetch path the
file exists for. This is the eighth instance of the plan's recurring
pins-less-than-it-claims class and the one that survived to production.

Add an arm pinning a runbook body inside `llms-full.txt`. Fix `S11` in the same pass: its
name says "carries SPF and why-it-matters" while its sentinel checks only
`**Why it matters:**`.

### C3. Derive the mx expectation; make an absent verify block explicit (item 8)

**Verified:** Tier 2 imports only `loadFacts` and `registrarEntries`, then re-implements
the `{domain}` contract twice (`dns_url.replaceAll`, `dmarc.replaceAll`) against the
core's `normaliseRuntimePlaceholders`. Two consequences:

- `mx` is the only fact whose live expectation is a hand-duplicated literal
  (`expect_contains: "10 mail.kuju.email."` beside `target:` and `priority:`). Nothing
  asserts the two agree. **Derive it** from `target`/`priority`.
- A mistyped `verify:` key silently downgrades a fact to `SKIP  … no verify block
  (product config the site cannot observe)` — indistinguishable from
  `test_migration_cap_gb`'s one legitimate opt-out. **Add `unverifiable: true`**, make an
  absent block an error unless the flag is set, and set it on `test_migration_cap_gb` and
  the new `wizard_labels`.

**`unverifiable` must be added to `RESERVED_KEYS` in `agent-corpus-core.mjs`.** That set
(`["verify","pending"]`) is what `registrarEntries` uses to skip metadata keys; a new
reserved key that is not registered there becomes a phantom registrar row.

### C4. `arg()` fails open on a typo (item 9)

**Verified:** `process.argv.indexOf(name)` returns `-1` for a misspelled flag and `arg()`
falls back to the real corpus path. In arms M1–M8 a typo fails safe; in **M0** — the
unmutated baseline that gives the other eight their meaning — it makes the negative
control vacuous. Validate flags and die on an unknown one.

### C5. The denylist message's line number is not a line number (item 10)

**Verified:** `scanDenylist(rendered)` runs post-interpolation and its `line` is
body-relative, yet the message renders as `file:NN`, which reads as a jump-to-line
reference. One fact expands to an 11-row table, so the number is wrong by however much
expansion preceded it. It misleads at the exact moment someone reads it — a red build.
Label it `body line N`.

### C6. `arm()` truncates the evidence it exists to produce (item 11)

**Verified:** `arm()` pipes captured output through `tail -n 5`, which truncated the real
`Cannot find module` line out of a RED transcript. `head -n 5` plus `tail -n 5`.

### C7. One Tier 1 message does not name its source (item 12)

**Verified:** a malformed front-matter YAML surfaces a bare `yaml.parse` error with no
`${filename}:` prefix — the only such message across five files. One try/catch in
`parseFrontMatter`, and the same treatment for `loadFacts`.

### C8. Three unmutated branches (item 13)

**Verified:** `checkDnsNonEmpty`'s "resolved but empty answer array", `checkHttp`'s
neither-`expect_status`-nor-`reject_status` fallback, and the generic
unsupported-`verify`-block fallback have no mutant. Narrow and hard to reach — but
`SELF-TEST OK` is the only thing the nightly timer says. Add three mutants and bump
`EXPECTED_MUTANT_COUNT` 5 → 8 as the deliberate edit that constant exists to force.

---

## 5. Group D — spec correction

### D1. Narrow the read-only claim (item 15)

**Verified:** the design doc claims read-only enforcement over "the corpus" at lines 270
and 287, but Tier 1 scans only `src/content/agent/*.md`. `glossary.ts` and `api-docs.ts`
are structurally unreachable from plain node (node 22.11.0 cannot import `.ts`).

Latent, not live: `glossary.ts`'s examples are DNS-record and mail-header specimens, not
commands — confirmed by reading every `body:` field. Narrow the wording to
"the runbooks" in both places and state the exclusion, rather than implying a scan that
does not happen.

---

## 6. Out of scope (recorded so it is not re-derived)

- The `pending-now-passes` mutant's dependence on a live 200 — belongs to `launch-1.22`.
- Refactoring the `SITE_URL` duplication away. Both consumers are non-TypeScript by
  necessity; the comment is the defect.
- The reviewer's DROP verdicts from the `launch-1.8` review.
- Notes item 3 (title/H1 already fixed in `launch-1.25`) — informational only.

---

## 7. Verification

The change is mostly *to* the verification harness, so the harness cannot be the only
oracle. Three levels:

1. **`scripts/corpus-selftest.mjs`** — new assertions for the preconditions block
   (rendered when present, absent when the list is empty), the derived mx expectation,
   and the updated `facts_used` deepEqual.
2. **`scripts/verify-corpus.sh`** — the new llms-full runbook-body arm, the fixed S11,
   and a green M0.
3. **Falsifiability of the new checks themselves.** Per
   `feedback_verify_signal_can_fail`: every new assertion is watched failing before it is
   trusted. Specifically — empty the preconditions block and watch the new selftest
   assertion fail; corrupt the derived mx target and watch it fail; delete a runbook body
   from `llms-full.txt` and watch the new arm fail. A new check that has never been seen
   red is indistinguishable from one that is unwired.

`LIVE=1` arms and the three new mutants require network and run against the real facts.

---

## 8. Risk

Low, with two exceptions worth naming:

- **A6 changes `facts_used` for two runbooks**, which the Tier 1 checker enforces in both
  directions. A partial edit fails the build rather than shipping — the correct failure
  mode, but it means A6 is atomic: front-matter, body, facts file and selftest assertion
  land together.
- **C3 makes an absent `verify:` block an error.** Any fact without one and without
  `unverifiable: true` will now fail. Two facts need the flag
  (`test_migration_cap_gb`, `wizard_labels`); the sweep must confirm there is no third.
