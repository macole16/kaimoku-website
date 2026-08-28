import Link from "next/link";
import { URLS } from "@/lib/constants";

/**
 * Status banner for the reference pages.
 *
 * The guide and API docs are written in live-product present tense ("your
 * domain administrator will send you an invitation email"), which is correct
 * for what they document but leaves a visitor arriving from search with no
 * signal that Kuju Email is not open yet. The marketing pages say so plainly;
 * these did not, which quietly undid that honesty for anyone who never passed
 * through them.
 *
 * Deliberately not dismissible and not sticky: it is read once at the top of a
 * long document, and a banner that can be dismissed is one a search visitor
 * will never see again on their next landing.
 */
export function PreLaunchNotice({ what }: { what: string }) {
  return (
    <div className="border-b border-kuju/20 bg-kuju/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-kuju-dark">
          Coming soon
        </span>
        <p className="text-sm text-slate-700">
          Kuju Email is in private development. {what} describes the platform as
          it will ship, so you can evaluate it before we open.{" "}
          <a
            href={URLS.KUJU_NOTIFY}
            className="font-medium text-kuju-dark underline underline-offset-4 hover:text-kuju"
          >
            Get notified at launch
          </a>
          {" or "}
          <Link
            href="/kuju-email"
            className="font-medium text-kuju-dark underline underline-offset-4 hover:text-kuju"
          >
            read the overview
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
