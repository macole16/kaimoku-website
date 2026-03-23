// External URLs — single source of truth for all CTA targets.
// Update these when Paddle and kuju.email portal go live.

export const URLS = {
  // Demo signup on kuju.email customer portal
  KUJU_DEMO_SIGNUP: "#coming-soon", // → https://kuju.email/signup

  // Paddle checkout links (replace with real Paddle URLs after approval)
  PADDLE_SMALL_BUSINESS: "#coming-soon",
  PADDLE_PROFESSIONAL: "#coming-soon",
  PADDLE_ENTERPRISE_CONTACT:
    "mailto:info@kaimoku.tech?subject=Enterprise%20Inquiry",

  // General
  CONTACT_EMAIL: "mailto:info@kaimoku.tech",
} as const;

export function isComingSoon(url: string): boolean {
  return url === "#coming-soon";
}
