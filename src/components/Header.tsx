"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            K
          </div>
          <span className="text-xl font-bold text-primary">Kaimoku</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {/*
            Product nav items: extend this list when new Kaimoku products
            ship. Today's catalog is one product (Kuju Email). Future
            products follow the same href pattern (/<product-id>) and
            should appear here in catalog order - see src/data/products.yaml.
            When the catalog reaches 3+, consider a "Products" dropdown
            instead of flat links.
          */}
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/kuju-email"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            Kuju Email
          </Link>
          <Link
            href="/kuju-email/pricing"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            Pricing
          </Link>
          <Link
            href="/kuju-email/guide"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            User Guide
          </Link>
          <Link
            href="/kuju-email/docs"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            API Docs
          </Link>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/kuju-email"
              className="text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              Kuju Email
            </Link>
            <Link
              href="/kuju-email/pricing"
              className="text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/kuju-email/guide"
              className="text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              User Guide
            </Link>
            <Link
              href="/kuju-email/docs"
              className="text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              API Docs
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
