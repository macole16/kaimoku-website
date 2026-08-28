import type { MetadataRoute } from "next";

/**
 * Site-wide crawl block while Kaimoku is pre-launch.
 *
 * Belt and braces with the `robots: { index: false }` metadata in layout.tsx,
 * and the two do different jobs: the meta tag is only seen by a crawler that
 * has already fetched a page, whereas robots.txt is checked before any fetch.
 * Neither alone is a complete answer, and a crawler reaching a page through an
 * inbound link rather than the root will only ever see the meta tag.
 *
 * No sitemap is declared on purpose: publishing one would advertise every URL
 * to precisely the crawlers being turned away.
 *
 * AT LAUNCH: delete this file (or return an allow rule) and flip the metadata
 * flags in layout.tsx together. Doing one without the other leaves the site
 * half-blocked in a way that is easy to miss.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
