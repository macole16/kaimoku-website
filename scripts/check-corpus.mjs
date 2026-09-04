// Tier 1 build gate for the agent corpus. OFFLINE and structural: no network.
// Wired as `prebuild`, so `npm run build` (which Vercel runs) stops the deploy
// on any failure. Spec section 4, Tier 1.
//
//   node scripts/check-corpus.mjs [--content-dir D] [--facts F] [--app-dir A]
//
// Checks, each with a stable sentinel so scripts/verify-corpus.sh can score it:
//   front-matter / slug / order  every *.md loads (no silent orphans)
//   unknown fact                 every {{fact:...}} resolves
//   facts_used                   front-matter list == keys actually referenced
//   denylisted command           no write/credential/privilege command in code
//   single-brace token           no {x} survives into a rendered runbook
//   broken link                  every root-relative link is a real route
//   unknown flag                 a misspelled --flag is fatal, never a silent fallback to the real corpus
//   preconditions denylist       no denylisted command in a front-matter preconditions: list
//   preconditions single-brace   no {x} survives in the preconditions: block (served verbatim)
//   preconditions unresolved fact no {{fact:...}} token in preconditions: (never interpolated)
//   inlines UI copy              no fact value carrying a source: is typed out verbatim in a runbook
//   unclassified bold span       every **bold** span is a fact token or a declared prose_emphasis entry
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RUNBOOK_URL_PREFIX,
  SINGLE_BRACE_RE,
  extractInternalLinks,
  interpolate,
  loadFacts,
  loadRunbooks,
  renderPreconditions,
  scanDenylist,
  extractBoldSpans,
} from "../src/lib/agent-corpus-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
const CONTENT_DIR = arg("--content-dir", path.join(ROOT, "src/content/agent"));
const FACTS_PATH = arg("--facts", path.join(ROOT, "src/data/mail-facts.yaml"));
const APP_DIR = arg("--app-dir", path.join(ROOT, "src/app"));

/**
 * Every URL path the app serves, from the filesystem: page.tsx and route.ts
 * files under src/app. Route groups "(x)" are dropped. The one dynamic route
 * ([file] under the runbook prefix) expands to the runbook slugs; any OTHER
 * dynamic segment is an error, because this checker cannot evaluate its
 * generateStaticParams and must not silently treat it as matching everything.
 */
function enumerateRoutes(appDir, slugs) {
  const routes = new Set();
  const walk = (dir, segs) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        const seg = ent.name;
        if (/^\(.*\)$/.test(seg)) { walk(path.join(dir, seg), segs); continue; }
        walk(path.join(dir, seg), [...segs, seg]);
      } else if (/^(page|route)\.tsx?$/.test(ent.name)) {
        const url = "/" + segs.join("/");
        if (segs.some((s) => /^\[.*\]$/.test(s))) {
          if (url === `${RUNBOOK_URL_PREFIX}[file]`) {
            for (const s of slugs) routes.add(`${RUNBOOK_URL_PREFIX}${s}.md`);
          } else {
            throw new Error(`unknown dynamic route ${url}: extend enumerateRoutes() in scripts/check-corpus.mjs`);
          }
        } else {
          routes.add(url === "/" ? "/" : url);
        }
      }
    }
  };
  walk(appDir, []);
  return routes;
}

// --- UI-copy deny-list -------------------------------------------------------
// Every fact leaf carrying a `source:` is VERBATIM COPY FROM ANOTHER REPO (today
// that is wizard_labels, whose seven leaves quote kuju-mail templates). Keying on
// `source:` rather than on the literal name "wizard_labels" means a future family
// of borrowed copy is guarded the day it is added, with no edit here.
//
// This is what makes the check TIER 1. It needs kuju-mail at AUTHORING time --
// when a human copies a label in and records its source: -- and never at check
// time, so it survives the two places this checker actually runs: Vercel prebuild
// (no tailnet, cannot reach Forgejo) and the build host (whose two kuju-mail
// trees are not git checkouts and have been frozen since 2026-03-16, so a checker
// that grepped them would report PASS against a fossil forever).
function uiCopyStrings(node, trail = [], out = []) {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return out;
  if (typeof node.source === "string" && (typeof node.value === "string" || typeof node.value === "number")) {
    out.push({ path: trail.join("."), value: String(node.value) });
    return out;
  }
  for (const [k, v] of Object.entries(node)) uiCopyStrings(v, [...trail, k], out);
  return out;
}

const problems = [];
let factRefs = 0;
let linkCount = 0;
let runbooks = [];

try {
  const facts = loadFacts(FACTS_PATH);
  runbooks = loadRunbooks(CONTENT_DIR);
  const routes = enumerateRoutes(APP_DIR, runbooks.map((r) => r.slug));
  const uiCopy = uiCopyStrings(facts);

  for (const rb of runbooks) {
    const where = `${rb.filename}`;

    // 1. every {{fact:...}} resolves; collect the top-level keys used
    let rendered = "";
    let used = new Set();
    try {
      ({ text: rendered, used } = interpolate(rb.body, facts));
      factRefs += [...rb.body.matchAll(/\{\{fact:/g)].length;
    } catch (err) {
      problems.push(`${where}: ${err.message}`);   // carries "unknown fact: <path>"
      continue;
    }

    // 2. facts_used is honest in both directions
    const declared = new Set(rb.facts_used);
    for (const k of used) if (!declared.has(k)) problems.push(`${where}: facts_used is missing "${k}" (referenced in the body)`);
    for (const k of declared) if (!used.has(k)) problems.push(`${where}: facts_used lists "${k}" but the body never references it`);

    // 3. nothing an agent could run that writes, authenticates or escalates
    for (const hit of scanDenylist(rendered)) {
      problems.push(`${where}: rendered body line ${hit.line}: denylisted command (${hit.name}): ${hit.text}`);
    }

    // 3b. the preconditions block is SERVED (renderRunbook injects it), so it is scanned
    // like the body: "every string an agent could execute is scanned" stays true, not nearly true.
    const pre = renderPreconditions(rb.preconditions);
    for (const hit of scanDenylist(pre)) problems.push(`${where}: preconditions: denylisted command (${hit.name}): ${hit.text}`);
    for (const m of pre.matchAll(SINGLE_BRACE_RE)) problems.push(`${where}: preconditions: single-brace token ${m[0]} — use <name> for run-time placeholders`);

    // 3c. preconditions are served VERBATIM -- never interpolated, by deliberate decision --
    // so a stray {{fact:...}} token here reaches an agent as those literal characters and
    // is never caught by the interpolate() step above (that only runs over rb.body).
    if (pre.includes("{{fact:")) {
      problems.push(`${where}: preconditions: unresolved {{fact:...}} token — preconditions are served verbatim and are never interpolated`);
    }

    // 4. no single-brace token survives (the confusable third syntax)
    for (const m of rendered.matchAll(SINGLE_BRACE_RE)) {
      problems.push(`${where}: single-brace token ${m[0]} in rendered output — use <name> for run-time placeholders`);
    }

    // 5. every internal link is a real route
    for (const link of extractInternalLinks(rb.body)) {
      linkCount += 1;
      if (!routes.has(link)) problems.push(`${where}: broken link ${link} (not a page.tsx/route.ts under src/app)`);
    }

    // 6. no known UI label is inlined as literal prose.
    //
    // COLLAPSE NEWLINES FIRST. A per-line scan is precisely what made the
    // launch-1.26 hand sweep report 9 labels against a true 12: three were
    // line-wrapped in the markdown source, so no single line contained the whole
    // label. A version of this check that matched line-by-line would report
    // clean while leaking.
    //
    // Scanned against rb.body -- the SOURCE -- never against `rendered`. The
    // rendered text is SUPPOSED to contain every label value (that is what the
    // token resolves to), so scanning it would fire on every correct usage and
    // the gate would have to be deleted. The source contains the value only when
    // somebody typed it by hand instead of referencing the fact.
    const flatBody = rb.body.replace(/\s*\n\s*/g, " ");
    const hits = uiCopy.filter((c) => flatBody.includes(c.value));
    // Report only the LONGEST match. "Auto-Configure" is a substring of
    // "Auto-Configure Mail Records", so inlining the heading matched both and the
    // first line named auto_configure_BUTTON -- sending an author to fix a heading
    // by referencing the button's fact. A gate that names the wrong fact is worse
    // than one that stays quiet, because the wrong fix looks like it worked.
    for (const hit of hits) {
      if (hits.some((o) => o !== hit && o.value.includes(hit.value))) continue;
      problems.push(`${where}: inlines UI copy verbatim: ${JSON.stringify(hit.value)} — reference {{fact:${hit.path}}} instead (it is quoted from another repo and drifts silently)`);
    }

    // 7. every bold span is CLASSIFIED -- a fact token, or declared prose.
    //
    // Check 6 catches a label already in wizard_labels being typed out again. It
    // cannot catch a label that was NEVER facted, which is what actually happened
    // in launch-1.25/-1.26/-1.27 -- all three found by hand sweep, not by a gate.
    //
    // This classifies instead of guessing because no heuristic survives the real
    // data: "Keep your current DNS" is a label and "Keep the current DNS host."
    // is prose; "From Step 1b" and "Step 5" are prose that look exactly like
    // labels; and one genuine label is a full sentence ending in "?". Word count,
    // title case and terminal punctuation each produce false positives here, and
    // a gate that fires on prose is the shape that gets deleted.
    //
    // Checked in BOTH directions, exactly like facts_used above: an undeclared
    // span fails, and a declared entry the body no longer contains fails too.
    // Without the reverse check the list rots into a rubber stamp that no longer
    // describes the file.
    const declaredProse = new Set(rb.prose_emphasis);
    const spans = extractBoldSpans(rb.body);
    for (const span of spans) {
      if (span.includes("{{fact:") || declaredProse.has(span)) continue;
      problems.push(`${where}: bold span ${JSON.stringify(span)} is neither a fact token nor declared prose — if it is UI copy from kuju-mail, add it to wizard_labels with a source: and reference the token; otherwise declare it in prose_emphasis:`);
    }
    for (const declared of declaredProse) {
      if (!spans.includes(declared)) {
        problems.push(`${where}: declares prose_emphasis ${JSON.stringify(declared)} but the body has no such bold span`);
      }
    }
  }
} catch (err) {
  problems.push(err.message);   // front-matter / slug / order / no runbooks / unknown dynamic route
}

if (problems.length) {
  console.error("agent corpus check FAILED:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`corpus OK (${runbooks.length} runbooks, ${factRefs} fact refs, ${linkCount} internal links)`);
