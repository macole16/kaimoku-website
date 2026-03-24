// External URLs — single source of truth for all CTA targets.
// Update these when Polar and kuju.email portal go live.

export const URLS = {
  // Trial signup on kuju.email customer portal
  KUJU_TRIAL_SIGNUP: "#coming-soon", // → https://kuju.email/signup

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

export function isComingSoon(url: string): boolean {
  return url === "#coming-soon";
}
