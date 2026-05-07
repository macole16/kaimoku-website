import fs from "fs";
import path from "path";
import yaml from "yaml";

/** A single Kaimoku product entry from src/data/products.yaml. */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: "shipped" | "beta" | "coming_soon";
  shippedIn: string;
}

/**
 * Load the Kaimoku product catalog from src/data/products.yaml.
 *
 * Synchronous file read — safe for Next.js server components where this
 * executes at build / SSR time. Mirrors loadModes() in src/lib/modes.ts.
 */
export function loadProducts(): Product[] {
  const filePath = path.join(process.cwd(), "src", "data", "products.yaml");
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(raw) as Product[];
}
