// One-shot authoring aid for launch-1.33: seeds each runbook's prose_emphasis:
// list from the bold spans already in its body. Kept in the tree because the
// same command re-seeds a runbook after a large rewrite, which is otherwise a
// tedious hand transcription -- but it is NOT a fixer: it only fills a list that
// is absent, and never edits one that exists, so it can never silently rubber-
// stamp a newly-arrived UI label into "declared prose".
import fs from "node:fs";
import path from "node:path";
import { extractBoldSpans } from "../src/lib/agent-corpus-core.mjs";

const D = "src/content/agent";
for (const f of fs.readdirSync(D).filter((f) => f.endsWith(".md")).sort()) {
  const p = path.join(D, f);
  const raw = fs.readFileSync(p, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const [, fm, body] = m;
  if (/^prose_emphasis:/m.test(fm)) { console.log(`${f}: already declared, skipped`); continue; }
  const prose = extractBoldSpans(body).filter((s) => !s.includes("{{fact:"));
  const block = prose.length
    ? "prose_emphasis:\n" + prose.map((s) => `  - ${JSON.stringify(s)}`).join("\n")
    : "prose_emphasis: []";
  const newFm = fm.replace(/^(facts_used:.*)$/m, `$1\n${block}`);
  fs.writeFileSync(p, `---\n${newFm}\n---\n${body}`);
  console.log(`${f}: declared ${prose.length}`);
}
