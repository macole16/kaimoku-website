import type { Metadata } from "next";
import { Spectral, Public_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

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

const SITE_DESCRIPTION =
  "Kaimoku Technologies builds software that pays attention to the things software has stopped paying attention to. Our first product is Kuju Email: secure, transparent business email.";

export const metadata: Metadata = {
  // Resolves relative URLs in openGraph, twitter and alternates below.
  // The host and the reasoning for it live with the constant — see SITE_URL
  // in src/lib/constants.ts. Do not restate the rationale here: two copies
  // are how this comment came to contradict that one.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kaimoku Technologies",
    template: "%s · Kaimoku",
  },
  description: SITE_DESCRIPTION,
  // "./" resolves per-route against metadataBase, so every page gets its own
  // canonical rather than all of them claiming to be the homepage.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "Kaimoku Technologies",
    title: "Kaimoku Technologies",
    description: SITE_DESCRIPTION,
    url: "./",
    locale: "en_US",
  },
  twitter: {
    // No twitter:image is set on purpose. X falls back to og:image, which
    // app/opengraph-image.tsx generates, so a second declaration would only be
    // another thing to keep in sync.
    card: "summary_large_image",
    title: "Kaimoku Technologies",
    description: SITE_DESCRIPTION,
  },
  // DELIBERATELY NOINDEX. Kaimoku is pre-launch and the site is meant to stay
  // undiscoverable until it opens. Vercel sends no X-Robots-Tag on production
  // aliases, so without this the vercel.app host would be fully open to search
  // engines. See github-bhri4 for details.
  //
  // This does NOT disable link sharing. The openGraph and twitter blocks above
  // still render a card when someone is sent the URL directly; noindex governs
  // crawling and search listings, which is the separate thing being withheld.
  //
  // AT LAUNCH: flip both flags to true, delete the noindex in src/app/robots.ts,
  // and only then point metadataBase at the real domain.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
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
