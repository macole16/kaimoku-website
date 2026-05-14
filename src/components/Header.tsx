"use client";

import Link from "next/link";
import { useState } from "react";
import { Lockup } from "@/components/Logo";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Kaimoku — home"
          className="inline-flex items-center"
        >
          <Lockup fontSize={28} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {/*
            Parent-tier nav: one slot per Kaimoku product. Today's catalog
            is one product (Kuju Email); product-internal nav (pricing,
            guide, docs) lives on /kuju-email/* not at this tier — see
            src/data/products.yaml. When catalog reaches 3+ products,
            consider a "Products" dropdown.
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
          </nav>
        </div>
      )}
    </header>
  );
}
