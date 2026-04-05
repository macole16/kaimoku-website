import fs from "fs";
import path from "path";
import yaml from "yaml";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single parameter from the OpenAPI spec (inline or resolved). */
export interface SpecParameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: Record<string, unknown>;
  description?: string;
}

/** Merged data for one API endpoint. */
export interface EndpointData {
  method: string;
  path: string;
  desc?: string;
  auth?: string;
  parameters?: SpecParameter[];
  /** true when the OpenAPI spec covers this endpoint */
  specCovered: boolean;
}

/** A subsection (e.g. "Folders", "Messages") within a section. */
export interface SubsectionData {
  name: string;
  id: string;
  endpoints: EndpointData[];
}

/** A top-level section (e.g. "Public API", "Account API"). */
export interface SectionData {
  name: string;
  id: string;
  children: SubsectionData[];
}

/** Table-of-contents entry for sidebar / jump-nav. */
export interface TocEntry {
  title: string;
  id: string;
  children: { title: string; id: string }[];
}

// ---------------------------------------------------------------------------
// Internal YAML shapes
// ---------------------------------------------------------------------------

interface CategoriesYaml {
  categories: {
    name: string;
    id: string;
    children: {
      name: string;
      id: string;
      endpoints?: { method: string; path: string }[];
    }[];
  }[];
}

/** Overlay keyed by path, then method. */
type OverlayYaml = Record<string, Record<string, { marketing_summary?: string }>>;

interface OpenApiOperation {
  summary?: string;
  description?: string;
  security?: Record<string, string[]>[];
  parameters?: (SpecParameter | { $ref: string })[];
}

interface OpenApiPath {
  [method: string]: OpenApiOperation;
}

interface OpenApiSpec {
  security?: Record<string, string[]>[];
  paths: Record<string, OpenApiPath>;
  components?: {
    parameters?: Record<string, SpecParameter>;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read and parse a YAML file relative to src/data/. */
function loadYaml<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(raw) as T;
}

/**
 * Normalise a category path to match OpenAPI spec paths.
 *
 * Categories use Express-style params (:id, :calId) + query decorations
 * like "?q=..." or "?start=...&end=...".
 *
 * OpenAPI uses {id}, {calId} and plain paths (no query strings).
 */
function normalisePath(p: string): string {
  // Strip query string portion
  const noQuery = p.replace(/\?.*$/, "");
  // Convert :param to {param}
  return noQuery.replace(/:(\w+)/g, "{$1}");
}

/**
 * Resolve a $ref parameter to an inline SpecParameter.
 * Only handles local "#/components/parameters/..." refs.
 */
function resolveParam(
  param: SpecParameter | { $ref: string },
  componentParams: Record<string, SpecParameter>,
): SpecParameter | undefined {
  if ("$ref" in param && typeof param.$ref === "string") {
    const refName = param.$ref.replace("#/components/parameters/", "");
    return componentParams[refName];
  }
  return param as SpecParameter;
}

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

export interface ApiDocsData {
  sections: SectionData[];
  toc: TocEntry[];
}

/**
 * Load all three YAML files, merge them, and return structured docs data.
 *
 * Runs synchronously via readFileSync — safe for Next.js server components
 * where this executes at build / SSR time.
 */
export function loadApiDocs(): ApiDocsData {
  const categories = loadYaml<CategoriesYaml>("api-categories.yaml");
  const overlay = loadYaml<OverlayYaml>("api-overlay.yaml");
  const spec = loadYaml<OpenApiSpec>("openapi.yaml");

  const componentParams = spec.components?.parameters ?? {};
  const globalSecurity = spec.security; // top-level security (bearerAuth)

  // Build lookup: "METHOD /normalised/path" → operation
  const specLookup = new Map<string, OpenApiOperation>();
  for (const [specPath, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (method.startsWith("x-") || method === "parameters") continue;
      const key = `${method.toUpperCase()} ${specPath}`;
      specLookup.set(key, operation);
    }
  }

  const sections: SectionData[] = [];
  const toc: TocEntry[] = [];

  for (const section of categories.categories) {
    const children: SubsectionData[] = [];
    const tocChildren: { title: string; id: string }[] = [];

    for (const child of section.children) {
      const endpoints: EndpointData[] = [];

      if (child.endpoints) {
        for (const ep of child.endpoints) {
          const normalised = normalisePath(ep.path);
          const lookupKey = `${ep.method.toUpperCase()} ${normalised}`;
          const specOp = specLookup.get(lookupKey);

          // Overlay lookup: use original path (with :params) first, then normalised
          const overlayEntry =
            overlay[ep.path]?.[ep.method.toUpperCase()] ??
            overlay[normalised]?.[ep.method.toUpperCase()];

          // Description priority: overlay marketing_summary > spec summary
          const desc =
            overlayEntry?.marketing_summary ?? specOp?.summary ?? undefined;

          // Auth: if the endpoint explicitly sets security: [] it's public.
          // Otherwise inherit global security. If any security requirement
          // exists, label as "JWT".
          let auth: string | undefined;
          if (specOp) {
            const effectiveSecurity =
              specOp.security !== undefined ? specOp.security : globalSecurity;
            if (effectiveSecurity && effectiveSecurity.length > 0) {
              auth = "JWT";
            }
          }

          // Resolve parameters
          let parameters: SpecParameter[] | undefined;
          if (specOp?.parameters && specOp.parameters.length > 0) {
            const resolved = specOp.parameters
              .map((p) => resolveParam(p, componentParams))
              .filter((p): p is SpecParameter => p !== undefined);
            if (resolved.length > 0) {
              parameters = resolved;
            }
          }

          endpoints.push({
            method: ep.method,
            path: ep.path,
            desc,
            auth,
            parameters,
            specCovered: !!specOp,
          });
        }
      }

      children.push({
        name: child.name,
        id: child.id,
        endpoints,
      });

      tocChildren.push({
        title: child.name,
        id: child.id,
      });
    }

    sections.push({
      name: section.name,
      id: section.id,
      children,
    });

    toc.push({
      title: section.name,
      id: section.id,
      children: tocChildren,
    });
  }

  return { sections, toc };
}
