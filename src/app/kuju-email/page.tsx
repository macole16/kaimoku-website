import type { Metadata } from "next";
import Link from "next/link";
import { URLS } from "@/lib/constants";
import { loadModes } from "@/lib/modes";
import { ModesShowcase } from "@/components/marketing/ModesShowcase";
import { SecurityJourney } from "@/components/marketing/SecurityJourney";

export const metadata: Metadata = {
  title: "Kuju Email",
  description:
    "Kuju Email is one inbox, many UI modes. IMAP and webmail, calendar and contacts, productivity and security woven into the workflow.",
};

const standoutFeatures = [
  {
    title: "Defense in depth, by default",
    desc: "rspamd scoring on every inbound message, Google Safe Browsing URL checks on every link, message intelligence with SPF/DKIM/DMARC and relay-hop tracing, and virus attachments stripped automatically while the message body still arrives.",
  },
  {
    title: "Quarantine, not silent rejection",
    desc: "Messages convicted of authentication laundering are held in a recoverable quarantine rather than bounced into the void. Per-domain junk, drop, and expiry thresholds decide what lands, what waits, and for how long.",
  },
  {
    title: "Multi-domain, multi-tenant",
    desc: "Per-domain admin delegation, branded webmail hostnames with automatic TLS, retention policies, partitioned storage, and per-domain spam thresholds. Tenants are fully isolated.",
  },
  {
    title: "Bring your existing mail",
    desc: "Import from any IMAP mailbox — Gmail, Outlook, or an old server you are leaving behind. Folder structure, flags, and dates survive the move, and duplicate detection means a re-run picks up where it stopped instead of doubling your inbox.",
  },
  {
    title: "Native CalDAV and CardDAV",
    desc: 'RFC 4791 calendar and RFC 6352 contacts that sync with Apple Calendar, Thunderbird, and any standard client. One-click "add to calendar" from detected dates in messages.',
  },
  {
    title: "Modern authentication",
    desc: "TOTP two-factor, WebAuthn passkeys for passwordless login, automatic JWT key rotation, CSRF double-submit cookies, and encrypted secrets storage backed by Vault, OpenBao, AWS, GCP, or Azure.",
  },
];

const onboardingSteps = [
  {
    step: "1",
    title: "Tell us you want in",
    desc: "Kuju Email is in private development. Send a note and we will add you to the launch list, with a working demo ahead of general availability.",
  },
  {
    step: "2",
    title: "Bring your domain",
    desc: "At launch you point your MX, SPF, and DKIM records at Kuju. We provide the exact values to copy into your DNS provider — no guesswork, no downtime window.",
  },
  {
    step: "3",
    title: "Import and go",
    desc: "Pull your existing mail across from any IMAP server. Folders, flags, and dates come with it, and duplicate detection makes the import safe to re-run.",
  },
];

export default function KujuEmailPage() {
  const modes = loadModes();
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-surface-deep via-surface-mist to-surface-deep px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-kuju-light">
              Coming soon
            </p>
            <h1
              className="mb-8 text-5xl font-light leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block text-kuju-light">Kuju Email.</span>
              <span className="mt-2 block italic text-white">
                One inbox. Many modes.
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-[1.7] text-slate-300 md:text-xl">
              Pick the one that fits the moment, or move between them as the
              work changes. Calendar, contacts, search, and security come along.
              We are still building; here is what it will be.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href={URLS.KUJU_NOTIFY}
                className="rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
              >
                Get notified at launch
              </a>
              <Link
                href="/kuju-email/pricing"
                className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-kuju-light hover:underline"
              >
                View pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modes - full-bleed per-mode sections (the structural spine) */}
      <ModesShowcase modes={modes} />

      {/* Six standouts (was 8 + 32 = 40 cards; distilled to 6 per Pass 2 spec) */}
      <section className="bg-surface px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
            What sets Kuju Email apart
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">
            Six things that will be there on day one. The full feature catalog
            lives in the User Guide and API Docs.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {standoutFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-3 text-lg font-bold text-primary">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
                {f.title === "Defense in depth, by default" && (
                  <p className="mt-4 text-sm">
                    <a
                      href="#security"
                      className="text-kuju underline-offset-4 hover:text-kuju-dark hover:underline"
                    >
                      See how a message reaches you →
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-slate-500">
            <Link
              href="/kuju-email/guide"
              className="underline-offset-4 hover:text-kuju hover:underline"
            >
              Read the full user guide →
            </Link>
          </p>
        </div>
      </section>

      {/* Security journey — added per spec 2026-05-11 (issue github-8y9) */}
      <SecurityJourney />

      {/* Move Your Domain - relocated from homepage in Pass 2 */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
              How moving will work
            </h2>
            <p className="mb-12 text-lg text-slate-600">
              Three steps, once Kuju Email opens up. No downtime, no data loss.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {onboardingSteps.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-slate-200 p-8"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-kuju/10 text-lg font-bold text-kuju-dark">
                  {s.step}
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary">
                  {s.title}
                </h3>
                <p className="leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - quiet outro on cream */}
      <section className="border-t border-slate-200 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-4 text-3xl font-light leading-tight tracking-tight text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Not open yet. Worth watching.
          </h2>
          <p className="mb-8 text-lg leading-[1.7] text-slate-600">
            Kuju Email is in private development. Tell us what your team needs
            from its email and we will come back to you before launch — the
            roadmap is still soft enough for that to matter.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={URLS.KUJU_NOTIFY}
              className="rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
            >
              Get notified at launch
            </a>
            <Link
              href="/kuju-email/pricing"
              className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-kuju hover:underline"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
