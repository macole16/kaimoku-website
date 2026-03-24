import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Kuju Email | Kaimoku Technologies",
  description:
    "Kuju Email pricing plans. Start with a 14-day free trial. Individual, Small Business, Professional, and Enterprise tiers.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
