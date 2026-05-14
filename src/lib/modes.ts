import fs from "fs";
import path from "path";
import yaml from "yaml";

/** A single kuju-mail UI mode. */
export interface Mode {
  id: string;
  name: string;
  tagline: string;
  audience: string;
  body: string;
  highlights: string[];
  shippedIn: string;
}

/**
 * Load the kuju-mail UI modes from src/data/kuju-mail-modes.yaml.
 *
 * Synchronous file read — safe for Next.js server components where this
 * executes at build / SSR time. Mirrors the loadApiDocs() pattern in
 * src/lib/api-docs.ts.
 */
export function loadModes(): Mode[] {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "kuju-mail-modes.yaml",
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(raw) as Mode[];
}
