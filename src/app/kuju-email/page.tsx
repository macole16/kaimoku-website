import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kuju Email — Complete Email Platform | Kaimoku Technologies",
  description:
    "Kuju Email is a complete email platform with IMAP, webmail, calendar, contacts, AI-powered security, and full admin control.",
};

const features = [
  {
    category: "Email Access",
    items: [
      {
        title: "Full IMAP Server",
        desc: "RFC 3501 compliant with server-side SORT and THREAD. Works with Thunderbird, Apple Mail, Outlook, K-9 Mail, and any standard client. Push notifications via IMAP IDLE.",
      },
      {
        title: "Modern Webmail",
        desc: "Full-featured browser-based client with compose, reply, forward, attachments, drag-and-drop, folder management, full-text search, and draft auto-save.",
      },
      {
        title: "Plus Addressing",
        desc: "Create unlimited aliases on-the-fly with user+tag@domain. Messages are stored with the tag for easy filtering and organization.",
      },
    ],
  },
  {
    category: "Calendar & Contacts",
    items: [
      {
        title: "Native CalDAV Calendar",
        desc: "Full RFC 4791 support with month/week/day views, multi-calendar with color coding, and sync with Apple Calendar, Thunderbird, and any CalDAV client.",
      },
      {
        title: "Native CardDAV Contacts",
        desc: "RFC 6352 contact management with multi-value fields, address books, full-text search, and sync with Apple Contacts, Thunderbird, and any CardDAV client.",
      },
    ],
  },
  {
    category: "AI-Powered Security",
    items: [
      {
        title: "Message Intelligence Panel",
        desc: "On-demand email security inspection: SPF/DKIM/DMARC verification, sender identity checks, relay hop tracing, URL inspection with domain mismatch detection, and antivirus scanning.",
      },
      {
        title: "Two-Tier Spam & Phishing Detection",
        desc: "Tier 1 heuristics run on every message with zero API dependency. Tier 2 LLM analysis provides deep content evaluation with support for Claude, OpenAI, and other providers.",
      },
      {
        title: "Smart Inbox (AI Categorization)",
        desc: "Automatic intent classification — personal, newsletter, transactional, notification, calendar, task, financial, social — powered by a fast local model on delivery.",
      },
    ],
  },
  {
    category: "Security & Authentication",
    items: [
      {
        title: "Automatic DKIM Rotation",
        desc: "Zero-downtime DKIM key rotation with three-phase lifecycle: generate, switch, cleanup. Includes DNS propagation verification and configurable rotation intervals.",
      },
      {
        title: "Modern Auth Methods",
        desc: "TOTP two-factor authentication (Google Authenticator compatible) and WebAuthn/FIDO2 passkeys for passwordless login. Automatic JWT key rotation.",
      },
      {
        title: "Encrypted Secrets Storage",
        desc: "AES-256-GCM encryption with Argon2id key derivation. Supports internal store, HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, and Azure Key Vault.",
      },
    ],
  },
  {
    category: "Administration & Operations",
    items: [
      {
        title: "Multi-Domain Multi-Tenant",
        desc: "Full multi-domain support with per-domain configuration, admin delegation, account quotas, and domain-partitioned storage for clean data boundaries.",
      },
      {
        title: "Per-Domain Branding",
        desc: "Custom logos, themes, CSS, and branded webmail URLs (webmail.yourdomain.com). Pre-made themes modeled after popular email clients. User-level light/dark mode.",
      },
      {
        title: "Prometheus Monitoring",
        desc: "Standard /metrics endpoint with Kuju and KumoMTA metrics. Built-in admin dashboard with storage analytics, delivery trends, spam stats, and plugin cost tracking.",
      },
    ],
  },
  {
    category: "Extensibility",
    items: [
      {
        title: "Plugin System",
        desc: "gRPC subprocess architecture for plugins. Install and uninstall dynamically without restart. Built-in plugins for ClamAV antivirus, AI spam scanning, and AI inbox categorization.",
      },
      {
        title: "Full REST API",
        desc: "JWT-authenticated API for folders, messages, drafts, calendar, contacts, and admin operations. JMAP endpoints for modern clients. OpenAPI specification included.",
      },
    ],
  },
];

const standoutFeatures = [
  {
    title: "Single Binary, Complete Platform",
    desc: "Unlike email solutions that require assembling multiple services, Kuju Email is a single binary serving IMAP, webmail, REST API, CalDAV/CardDAV, background workers, and delivery handling — all in one.",
  },
  {
    title: "AI Security Built In, Not Bolted On",
    desc: "Two-tier threat detection with heuristics + LLM analysis, message intelligence panels, sender verification, and URL inspection are native features — not third-party add-ons with separate billing.",
  },
  {
    title: "No Phone-Home Licensing",
    desc: "Offline license validation using ECDSA signatures. No telemetry calls required, no activation servers, no kill switches. Your email works even if our servers don't.",
  },
  {
    title: "Flexible Deployment",
    desc: "Run embedded (everything included) or bolt-on to an existing KumoMTA installation. Store messages on filesystem or S3/MinIO. Manage secrets internally or through Vault, AWS, GCP, or Azure.",
  },
  {
    title: "True Multi-Tenant Isolation",
    desc: "Per-domain admin delegation, API key isolation, partitioned storage, branded hostnames, and separate configuration. Tenants can't see each other's data or settings.",
  },
  {
    title: "Zero-Downtime DKIM Rotation",
    desc: "Automatic DKIM key rotation with DNS propagation verification, three-phase lifecycle management, and support for standalone or API-managed DNS — a feature most providers lack entirely.",
  },
];

export default function KujuEmailPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-block rounded-full bg-kuju/20 px-4 py-1 text-sm font-medium text-kuju">
              Email Platform
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Kuju Email
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              A complete, modern email platform with IMAP, webmail, calendar,
              contacts, AI-powered security, and full administrative control.
              Available as managed SaaS or self-hosted.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/kuju-email/pricing"
                className="rounded-lg bg-kuju px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kuju-dark"
              >
                View Plans & Pricing
              </Link>
              <Link
                href="/kuju-email/guide"
                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Read the User Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
            What Sets Kuju Email Apart
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">
            Kuju Email isn&rsquo;t another email wrapper. It&rsquo;s a
            ground-up email platform designed for organizations that need
            control, security, and modern features.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {standoutFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-3 text-lg font-bold text-primary">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Feature List */}
      <section className="bg-surface px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
            Complete Feature Set
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-slate-600">
            Everything you need to run a production email platform.
          </p>

          <div className="space-y-16">
            {features.map((group) => (
              <div key={group.category}>
                <h3 className="mb-6 text-xl font-bold text-primary">
                  {group.category}
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg border border-slate-200 bg-white p-6"
                    >
                      <h4 className="mb-2 font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary-light px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Choose the plan that fits your organization. Start with the free
            Community tier and upgrade as you grow.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/kuju-email/pricing"
              className="rounded-lg bg-kuju px-8 py-3 font-semibold text-white transition-colors hover:bg-kuju-dark"
            >
              View Pricing
            </Link>
            <Link
              href="/kuju-email/guide"
              className="rounded-lg border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
