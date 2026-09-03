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
  scanDenylist,
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

const problems = [];
let factRefs = 0;
let linkCount = 0;
let runbooks = [];

try {
  const facts = loadFacts(FACTS_PATH);
  runbooks = loadRunbooks(CONTENT_DIR);
  const routes = enumerateRoutes(APP_DIR, runbooks.map((r) => r.slug));

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

    // 4. no single-brace token survives (the confusable third syntax)
    for (const m of rendered.matchAll(SINGLE_BRACE_RE)) {
      problems.push(`${where}: single-brace token ${m[0]} in rendered output — use <name> for run-time placeholders`);
    }

    // 5. every internal link is a real route
    for (const link of extractInternalLinks(rb.body)) {
      linkCount += 1;
      if (!routes.has(link)) problems.push(`${where}: broken link ${link} (not a page.tsx/route.ts under src/app)`);
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
