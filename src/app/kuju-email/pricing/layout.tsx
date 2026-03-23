import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Kuju Email | Kaimoku Technologies",
  description:
    "Kuju Email pricing plans. Start free with the Community tier and scale to Enterprise.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
