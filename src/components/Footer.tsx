import Link from "next/link";
import { URLS, isComingSoon } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-primary text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white">
                K
              </div>
              <span className="text-lg font-bold text-white">
                Kaimoku Technologies
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Building modern, reliable software for organizations that value
              security, transparency, and a better email experience.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/kuju-email"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Kuju Email
                </Link>
              </li>
              <li>
                <Link
                  href="/kuju-email/pricing"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/kuju-email/guide"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  User Guide
                </Link>
              </li>
              <li>
                <a
                  href={URLS.KUJU_TRIAL_SIGNUP}
                  className={`text-sm text-slate-400 transition-colors hover:text-white ${
                    isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                  title={
                    isComingSoon(URLS.KUJU_TRIAL_SIGNUP)
                      ? "Coming soon"
                      : undefined
                  }
                >
                  Try Kuju Email
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#about"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/#values"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Values
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/acceptable-use"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-700 pt-8 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Kaimoku Technologies, LLC. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/legal/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/legal/acceptable-use"
              className="transition-colors hover:text-white"
            >
              Acceptable Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
