import type { Metadata } from "next";
import { Spectral, Public_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Wordmark face for the brand lockup. Scoped to the Logo component via
// --font-wordmark; not promoted to a global tier so site typography stays
// Spectral/Public Sans.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaimoku Technologies",
  description:
    "Kaimoku Technologies builds software that pays attention to the things software has stopped paying attention to. Our first product is Kuju Email: secure, transparent business email.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spectral.variable} ${publicSans.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
