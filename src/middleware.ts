import { NextResponse, type NextRequest } from "next/server";

/**
 * Serves a company-only holding page on the brand domain.
 *
 * Spec: docs/superpowers/specs/2026-09-01-kaimoku-holding-page-design.md
 *
 * INERT until kaimoku.tech is attached to the Vercel project and DNS records
 * exist: no request can arrive bearing that host until then.
 *
 * The rewrite is deliberately catch-all. holding.html has no /_next dependency,
 * so nothing breaks -- and it means the site's JS bundles are not fetchable on
 * the brand domain either.
 */
const HOLDING_HOSTS = new Set(["kaimoku.tech", "www.kaimoku.tech"]);

const HOLDING_FILE = "/holding.html";

/**
 * /robots.txt is excluded because a catch-all would return HTML where
 * robots.txt belongs, and crawlers treat an unparseable robots.txt as
 * ALLOW-ALL -- silently undoing the not-indexed decision. Serving the real
 * disallow-all is belt-and-braces with the noindex meta tag in the page.
 * /favicon.ico is excluded so the brand favicon renders in the tab.
 */
const PASSTHROUGH = new Set(["/robots.txt", "/favicon.ico", HOLDING_FILE]);

export function middleware(request: NextRequest) {
  // Strip any :port, then any single trailing dot, before comparing. A Host
  // header may carry a port, and a trailing dot is a legal root-anchored FQDN
  // form ("kaimoku.tech.") that browsers send verbatim. Omitting this strip
  // let that form fall through both the matcher (below) and this check, and
  // the FULL SITE was served on it.
  const host = (request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase()
    .replace(/\.$/, "");

  // The matcher and this check form an AND: both must pass to rewrite.
  //   matcher fires + this check passes -> holding page
  //   matcher fires + this check FAILS  -> FULL SITE
  //   matcher does NOT fire             -> FULL SITE (middleware never runs)
  // So this check is NOT the correctness guarantee for the stealth property --
  // it only protects the opposite, safe direction: the matcher OVER-matching
  // and leaking the holding page onto a host it shouldn't (e.g. vercel.app).
  // The matcher is what is LOAD-BEARING for "kaimoku.tech never serves the
  // full site" -- if it fails to fire, this code never runs at all.
  if (!HOLDING_HOSTS.has(host)) return NextResponse.next();
  if (PASSTHROUGH.has(request.nextUrl.pathname)) return NextResponse.next();

  return NextResponse.rewrite(new URL(HOLDING_FILE, request.url));
}

/**
 * Host-scoped so the middleware does not execute for other hosts AT ALL. With a
 * bare catch-all it would run on every vercel.app request merely to call next(),
 * and a runtime throw would then 500 the entire site.
 */
/**
 * NOTE: Next 16 deprecates `middleware.ts` in favour of `proxy.ts`. Both are
 * first-class in 16.1.7 and share one loader, so this still works. Kept as
 * `middleware.ts` deliberately: the spike that verified `has`-matcher host
 * evaluation was run against this convention. Migration is tracked in
 * bd github-tcg4g, which requires re-running scripts/verify-holding.sh —
 * INCLUDING its mutation step — because the rename invalidates that evidence.
 * If this file is ever renamed without re-verifying, kaimoku.tech can
 * silently begin serving the FULL site instead of the holding page.
 */
// Four literal entries, not two regex-style patterns like "kaimoku\\.tech\\.?".
// Next.js interpolates a matcher's `value` into a regex, so a trailing-dot
// alternation there would work locally -- but production runs in minimalMode,
// where Vercel's edge router (a DIFFERENT implementation) evaluates the
// matcher, and its handling of regex metacharacters in this position is
// unverified. Literal values are unambiguous under either implementation.
export const config = {
  matcher: [
    { source: "/:path*", has: [{ type: "host", value: "kaimoku.tech" }] },
    { source: "/:path*", has: [{ type: "host", value: "kaimoku.tech." }] },
    { source: "/:path*", has: [{ type: "host", value: "www.kaimoku.tech" }] },
    { source: "/:path*", has: [{ type: "host", value: "www.kaimoku.tech." }] },
  ],
};
