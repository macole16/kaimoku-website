// External URLs — single source of truth for all CTA targets.
// Update these when Polar and kuju.email portal go live.

export const URLS = {
  // Trial signup on kuju.email customer portal.
  // Currently UNREFERENCED: every "start" CTA points at KUJU_NOTIFY while
  // Kuju Email is pre-launch. Kept as the hook to re-wire at launch — point
  // it at the real portal and swap the CTAs back.
  KUJU_TRIAL_SIGNUP: "#coming-soon", // → https://kuju.email/signup

  // Pre-launch interest capture. Kuju Email is not yet generally
  // available, so every "start" CTA routes here rather than to a dead
  // anchor — an unlaunched product can still take an introduction.
  KUJU_NOTIFY:
    "mailto:info@kaimoku.tech?subject=Notify%20me%20when%20Kuju%20Email%20launches",

  // Checkout links (Polar)
  CHECKOUT_INDIVIDUAL: "#coming-soon",
  CHECKOUT_SMALL_BUSINESS: "#coming-soon",
  CHECKOUT_PROFESSIONAL: "#coming-soon",
  CHECKOUT_ENTERPRISE: "#coming-soon",
  CHECKOUT_ENTERPRISE_CONTACT:
    "mailto:info@kaimoku.tech?subject=Enterprise%20Inquiry",

  // General
  CONTACT_EMAIL: "mailto:info@kaimoku.tech",
} as const;

/**
 * Absolute base for every URL the site emits about itself: metadataBase in
 * layout.tsx, and the agent corpus (llms.txt links out by convention).
 *
 * Deliberately the vercel.app host. kaimoku.tech does NOT resolve at all as of
 * 2026-09-01 (launch-1.1 was closed by UNPOINTING the DNS; re-attaching the
 * branded domain is github-j3x, deferred). Switch this the day the domain is
 * attached and answers 200. This is the only definition the SITE imports — but
 * NOT the only copy. Two harness scripts run under plain node, cannot import a
 * .ts file, and hardcode the host; update them by hand in the same change, and
 * grep for it before claiming you are done:
 *   scripts/verify-corpus.sh      served-route sentinels
 *   scripts/check-facts-live.mjs  the User-Agent string and the mutant targets
 * Both fail loudly on drift, which is why they are duplicated rather than derived.
 */
export const SITE_URL = "https://kaimoku-website.vercel.app";

export function isComingSoon(url: string): boolean {
  return url === "#coming-soon";
}
