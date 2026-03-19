import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kuju Email — Complete Email Platform | Kaimoku Technologies",
  description:
    "Kuju Email is a complete email platform with IMAP, webmail, calendar, contacts, AI-powered productivity and security, and full admin control.",
};

const features = [
  {
    category: "Email Access",
    items: [
      {
        title: "Full IMAP Server",
        desc: "RFC 3501 compliant with server-side SORT, THREAD, and full-text SEARCH. Works with Thunderbird, Apple Mail, Outlook, K-9 Mail, and any standard client. Push notifications via IMAP IDLE.",
      },
      {
        title: "Modern Webmail",
        desc: "Full-featured browser-based client with compose, reply, forward, attachments with drag-and-drop, folder management, auto-save drafts (configurable intervals), and forward-as-attachment (.eml).",
      },
      {
        title: "Command Palette",
        desc: "Press Cmd+K to access 17+ fuzzy-searchable commands instantly. Navigate folders, compose messages, toggle features, and access settings without leaving the keyboard.",
      },
      {
        title: "Thread Views",
        desc: "Three selectable conversation designs: Command-Centric (summary + actions), Document-Centric (structured AI sections with key points, decisions, and action items), or Timeline + Context Stream.",
      },
    ],
  },
  {
    category: "AI Productivity",
    items: [
      {
        title: "AI Reply",
        desc: "Generate contextual reply drafts with one click. The AI reads the conversation and drafts a relevant response — review, edit, and send.",
      },
      {
        title: "AI Rewrite & Compose",
        desc: "Rewrite messages with tone control — Professional, Friendly, Concise, or Formal. Full version history (v1, v2, v3...) with instant restore. Quoted text is preserved automatically.",
      },
      {
        title: "Natural Language Search",
        desc: "Search your inbox the way you think. Type queries like \"invoices from last month\" or \"unread emails with attachments\" and the AI interprets them into precise searches with timezone-aware date resolution.",
      },
      {
        title: "AI Task Extraction",
        desc: "Automatically extract action items, deadlines, and follow-ups from emails. Tasks appear in a dedicated sidebar view with pending/completed filters and one-click \"Add to Calendar\" for detected dates.",
      },
      {
        title: "Waiting-On-Reply Tracker",
        desc: "Automatically detects sent messages expecting a reply using heuristic classification. Tracks aging with green/yellow/red indicators and offers a \"Nudge\" button to generate follow-up drafts.",
      },
      {
        title: "Inbox Summary Dashboard",
        desc: "At-a-glance view of your inbox health: mail volume stats (today/week/month), security counts (spam/viruses/quarantine), productivity metrics (waiting on reply, pending tasks), and AI classification breakdown.",
      },
    ],
  },
  {
    category: "Calendar & Contacts",
    items: [
      {
        title: "Native CalDAV Calendar",
        desc: "Full RFC 4791 support with month/week/day views, multi-calendar with color coding, all-day events, and sync with Apple Calendar, Thunderbird, and any CalDAV client. AI-powered one-click \"Add to Calendar\" from detected dates in emails.",
      },
      {
        title: "Native CardDAV Contacts",
        desc: "RFC 6352 contact management with multi-value email and phone fields (with type labels), address fields, organization and job title, notes, multiple address books, and full-text search across all fields.",
      },
      {
        title: "Activity Feed",
        desc: "A unified chronological stream combining messages, calendar events, and tasks in one view. Filter by type to focus on what matters. Available as a dedicated view in the sidebar.",
      },
    ],
  },
  {
    category: "AI-Powered Security",
    items: [
      {
        title: "Message Intelligence Panel",
        desc: "On-demand email security inspection: SPF/DKIM/DMARC verification, sender identity checks, relay hop tracing with rDNS, URL inspection with domain mismatch detection, ClamAV antivirus scanning, and AI threat assessment with evidence-based reasoning.",
      },
      {
        title: "Two-Tier Spam & Phishing Detection",
        desc: "Tier 1 heuristics run on every message with zero API dependency — catching impersonation, auth failures, and suspicious patterns. Tier 2 LLM analysis provides deep content evaluation with support for Claude, OpenAI, Groq, Fireworks, Mistral, and more.",
      },
      {
        title: "Smart Inbox (AI Categorization)",
        desc: "Automatic intent classification — personal, newsletter, transactional, notification, calendar, task, financial, social — powered by a fast AI model on delivery. Manual reclassification with colored badge indicators.",
      },
      {
        title: "Tracking Protection",
        desc: "Detects tracking pixels from services like Mailchimp, ConvertKit, and GitHub. Toggle to strip trackers from displayed messages with sender domain identification so you control what gets tracked.",
      },
      {
        title: "Thread Status Indicators",
        desc: "AI-powered labels like \"No reply needed\" or \"Suspicious\" on conversation threads. Classification reconciliation automatically updates intent when threat analysis reveals new information.",
      },
    ],
  },
  {
    category: "Security & Authentication",
    items: [
      {
        title: "Automatic DKIM Rotation",
        desc: "Zero-downtime DKIM key rotation with three-phase lifecycle: generate, switch, cleanup. DNS propagation verification, configurable intervals (default 30 days), and support for PowerDNS and Cloudflare with auto-detection.",
      },
      {
        title: "Modern Auth Methods",
        desc: "TOTP two-factor authentication (Google Authenticator compatible), WebAuthn/FIDO2 passkeys for passwordless login, automatic JWT key rotation on configurable schedule, and CSRF protection with double-submit cookies.",
      },
      {
        title: "Encrypted Secrets Storage",
        desc: "AES-256-GCM encryption with Argon2id key derivation. Supports internal store, HashiCorp Vault/OpenBao, AWS Secrets Manager, GCP Secret Manager, and Azure Key Vault.",
      },
    ],
  },
  {
    category: "Administration & Operations",
    items: [
      {
        title: "Multi-Domain Multi-Tenant",
        desc: "Full multi-domain support with per-domain configuration, admin delegation, account quotas, domain-partitioned storage, and per-domain API key isolation. Tenants are fully isolated.",
      },
      {
        title: "Per-Domain Branding",
        desc: "Custom logos, favicons, themes, CSS, and branded webmail URLs (webmail.yourdomain.com). Pre-made themes modeled after popular email clients. User-level light/dark/system mode.",
      },
      {
        title: "Analytics Dashboard",
        desc: "Delivery volume charts, status breakdown, spam score distribution, scan verdict breakdown, top senders and source IPs, and plugin token usage tracking with cost estimation. Time range selectors for 24h/7d/30d views.",
      },
      {
        title: "Prometheus Monitoring",
        desc: "Standard /metrics endpoint with application metrics (domains, accounts, messages, storage), compression stats, and Go runtime metrics. Grafana compatible.",
      },
    ],
  },
  {
    category: "Extensibility",
    items: [
      {
        title: "Plugin System",
        desc: "gRPC subprocess architecture for plugins. Install and uninstall dynamically without restart. Built-in plugins for ClamAV antivirus, AI spam scanning, AI inbox categorization, webhook forwarding, and RSPAMD spam training.",
      },
      {
        title: "Full REST API",
        desc: "JWT-authenticated API for folders, messages, drafts, calendar, contacts, analysis, tasks, feed, branding, and admin operations. JMAP endpoints for modern clients. Over 60 endpoints with OpenAPI specification.",
      },
      {
        title: "Plus Addressing",
        desc: "Create unlimited aliases on-the-fly with user+tag@domain. Messages are stored with the tag for easy filtering and organization. Catch-all delivery available per domain.",
      },
    ],
  },
];

const standoutFeatures = [
  {
    title: "AI That Actually Helps You Work",
    desc: "One-click AI replies, tone-controlled rewrites with version history, task extraction from emails, natural language search, waiting-on-reply tracking with nudge, and an inbox summary dashboard. AI isn't a gimmick here — it's woven into every workflow.",
  },
  {
    title: "Complete Platform, One Service",
    desc: "IMAP, webmail, REST API, CalDAV/CardDAV, activity feed, AI productivity tools, and delivery handling — all fully integrated. No bolting together separate services or managing multiple vendors.",
  },
  {
    title: "AI Security Built In, Not Bolted On",
    desc: "Two-tier threat detection, message intelligence panels, tracking pixel detection, thread status indicators, and sender verification are native features — not third-party add-ons with separate billing.",
  },
  {
    title: "No Surprises",
    desc: "Transparent pricing, no hidden fees, no per-seat gotchas. Start with the free Community tier and upgrade when you're ready. Downgrade gracefully with a 30-day grace period — your email never stops working.",
  },
  {
    title: "True Multi-Tenant Isolation",
    desc: "Per-domain admin delegation, API key isolation, partitioned storage, branded hostnames with automatic TLS, and separate configuration. Tenants can't see each other's data or settings.",
  },
  {
    title: "Self-Hosted Option Coming Soon",
    desc: "Love the platform but need to run it on your own infrastructure? A self-hosted deployment option is on the roadmap for organizations with strict compliance or data residency requirements.",
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
              contacts, AI-powered productivity and security, and full
              administrative control. Fully managed so you can focus on your
              business.
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
            productivity, security, and modern features.
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
