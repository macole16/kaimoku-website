import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Guide — Kuju Email | Kaimoku Technologies",
  description:
    "Comprehensive user guide for Kuju Email. Learn how to set up, configure, and use every feature.",
};

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="mb-6 scroll-mt-24 text-2xl font-bold text-primary">
      {children}
    </h2>
  );
}

function SubHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="mb-4 mt-8 scroll-mt-24 text-xl font-semibold text-slate-900"
    >
      {children}
    </h3>
  );
}

const tocSections = [
  {
    title: "Getting Started",
    id: "getting-started",
    children: [
      { title: "Account Activation", id: "activation" },
      { title: "Logging In", id: "logging-in" },
      { title: "Two-Factor Authentication", id: "2fa" },
      { title: "Passkeys (WebAuthn)", id: "passkeys" },
    ],
  },
  {
    title: "Webmail",
    id: "webmail",
    children: [
      { title: "Reading Messages", id: "reading" },
      { title: "Composing Messages", id: "composing" },
      { title: "Attachments", id: "attachments" },
      { title: "Folders", id: "folders" },
      { title: "Search", id: "search" },
      { title: "Message Intelligence", id: "intelligence" },
    ],
  },
  {
    title: "Calendar",
    id: "calendar",
    children: [
      { title: "Creating Events", id: "creating-events" },
      { title: "Multiple Calendars", id: "multi-calendar" },
      { title: "CalDAV Sync", id: "caldav-sync" },
    ],
  },
  {
    title: "Contacts",
    id: "contacts",
    children: [
      { title: "Managing Contacts", id: "managing-contacts" },
      { title: "CardDAV Sync", id: "carddav-sync" },
    ],
  },
  {
    title: "Desktop & Mobile Clients",
    id: "clients",
    children: [
      { title: "Apple Mail", id: "apple-mail" },
      { title: "Thunderbird", id: "thunderbird" },
      { title: "Outlook", id: "outlook" },
      { title: "Mobile Apps", id: "mobile" },
    ],
  },
  {
    title: "Smart Inbox",
    id: "smart-inbox",
    children: [],
  },
  {
    title: "Account Settings",
    id: "account-settings",
    children: [
      { title: "Password & Security", id: "password" },
      { title: "Theme & Appearance", id: "theme" },
      { title: "Plus Addressing", id: "plus-addressing" },
    ],
  },
  {
    title: "Domain Administration",
    id: "domain-admin",
    children: [
      { title: "Managing Accounts", id: "managing-accounts" },
      { title: "Domain Branding", id: "domain-branding" },
      { title: "Custom Hostnames", id: "custom-hostnames" },
      { title: "DKIM Management", id: "dkim" },
      { title: "Catch-All Addresses", id: "catch-all" },
      { title: "Spam Training", id: "spam-training" },
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              User Guide
            </h2>
            <nav className="max-h-[calc(100vh-8rem)] space-y-1 overflow-y-auto pr-4">
              {tocSections.map((section) => (
                <div key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                  >
                    {section.title}
                  </a>
                  {section.children.length > 0 && (
                    <div className="ml-3 border-l border-slate-200 pl-3">
                      {section.children.map((child) => (
                        <a
                          key={child.id}
                          href={`#${child.id}`}
                          className="block py-1 text-sm text-slate-500 transition-colors hover:text-primary"
                        >
                          {child.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="prose-slate max-w-none">
          <h1 className="mb-2 text-4xl font-bold text-primary">
            Kuju Email User Guide
          </h1>
          <p className="mb-12 text-lg text-slate-600">
            Everything you need to know about using Kuju Email, from first login
            to advanced administration.
          </p>

          {/* Getting Started */}
          <section className="mb-16">
            <SectionHeading id="getting-started">
              Getting Started
            </SectionHeading>

            <SubHeading id="activation">Account Activation</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Your domain administrator will send you an invitation email. Click
              the activation link to set your password and complete account
              setup. Invitation links expire after 14 days — contact your admin
              if your link has expired.
            </p>

            <SubHeading id="logging-in">Logging In</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Navigate to your webmail URL (provided by your admin or accessible
              at your domain&rsquo;s custom hostname). Enter your full email
              address and password. If your domain has custom branding, you may
              see a branded login page.
            </p>

            <SubHeading id="2fa">Two-Factor Authentication</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email supports TOTP-based two-factor authentication,
              compatible with Google Authenticator, Authy, and similar apps.
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-3 font-semibold text-slate-900">
                Setting up 2FA:
              </h4>
              <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
                <li>
                  Go to <strong>Settings &rarr; Security</strong>
                </li>
                <li>
                  Click <strong>Enable Two-Factor Authentication</strong>
                </li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit code to verify and activate</li>
                <li>
                  Save your recovery codes in a secure location — these are your
                  backup if you lose access to your authenticator
                </li>
              </ol>
            </div>

            <SubHeading id="passkeys">Passkeys (WebAuthn)</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              For passwordless login, you can register FIDO2/WebAuthn security
              keys or platform authenticators (Face ID, Touch ID, Windows
              Hello). Go to{" "}
              <strong>Settings &rarr; Security &rarr; Passkeys</strong> to
              register a new passkey. Once registered, you can log in by
              touching your security key or using biometrics — no password
              needed.
            </p>
          </section>

          {/* Webmail */}
          <section className="mb-16">
            <SectionHeading id="webmail">Webmail</SectionHeading>

            <SubHeading id="reading">Reading Messages</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The inbox displays messages with sender, subject, date, and size.
              Click any message to open it in the reading pane. Use the toolbar
              to reply, reply all, forward, archive, delete, or move messages
              between folders. View full message headers or raw source via the
              menu.
            </p>

            <SubHeading id="composing">Composing Messages</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Click <strong>Compose</strong> to write a new message. The editor
              supports rich text formatting. Drafts are automatically saved as
              you type so you never lose your work. Use{" "}
              <strong>Reply All</strong> to respond to all recipients, or{" "}
              <strong>Forward</strong> to send a message to someone new
              (including as an EML attachment).
            </p>

            <SubHeading id="attachments">Attachments</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Drag and drop files directly into the compose window, or click the
              attachment button to browse. Attached files are shown with their
              name and size. When reading messages, click attachments to download
              them.
            </p>

            <SubHeading id="folders">Folders</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Standard folders (Inbox, Sent, Drafts, Junk, Trash) are created
              automatically. You can create custom folders for organization.
              Drag and drop messages between folders, or use the Move action.
              Folders support IMAP SPECIAL-USE attributes for compatibility with
              all clients.
            </p>

            <SubHeading id="search">Search</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Use the search bar to find messages by sender, subject, or
              content. Search operates across the current folder. Results are
              returned in relevance order with highlighted matches.
            </p>

            <SubHeading id="intelligence">Message Intelligence</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The Message Intelligence panel provides on-demand security
              analysis for any email. Click the shield icon on a message to see:
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <strong>Authentication:</strong> SPF, DKIM, and DMARC
                  pass/fail status
                </li>
                <li>
                  <strong>Sender Verification:</strong> From/Reply-To mismatch
                  detection and display name analysis
                </li>
                <li>
                  <strong>Hop Trace:</strong> Full relay chain with IP
                  addresses, timing delays, and reverse DNS lookups
                </li>
                <li>
                  <strong>URL Inspection:</strong> All extracted links with
                  domain mismatch detection (display text vs. actual URL)
                </li>
                <li>
                  <strong>Antivirus:</strong> On-demand ClamAV scanning of
                  attachments with cached results
                </li>
                <li>
                  <strong>AI Threat Assessment:</strong> LLM-powered evaluation
                  identifying social engineering tactics, urgency manipulation,
                  and other threat signals
                </li>
              </ul>
            </div>
          </section>

          {/* Calendar */}
          <section className="mb-16">
            <SectionHeading id="calendar">Calendar</SectionHeading>

            <SubHeading id="creating-events">Creating Events</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Click on any time slot in the calendar view to create a new event.
              Fill in the title, date, time, and optional description. Events
              can be viewed in month, week, or day layouts. Click an existing
              event to edit or delete it.
            </p>

            <SubHeading id="multi-calendar">Multiple Calendars</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Create multiple calendars for different purposes (Work, Personal,
              Shared). Each calendar has its own color for easy visual
              distinction. Toggle calendars on or off to control which events
              are visible. A default &ldquo;Personal&rdquo; calendar is
              automatically created for each account.
            </p>

            <SubHeading id="caldav-sync">CalDAV Sync</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Sync your calendars with external clients using CalDAV (RFC 4791).
              Your CalDAV URL is:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4">
              <code className="text-sm text-slate-200">
                https://your-server/.well-known/caldav
              </code>
            </div>
            <p className="mb-4 leading-relaxed text-slate-700">
              Use your full email address and password for authentication.
              Compatible with Apple Calendar, Thunderbird, GNOME Calendar,
              Nextcloud, and any CalDAV-compliant client.
            </p>
          </section>

          {/* Contacts */}
          <section className="mb-16">
            <SectionHeading id="contacts">Contacts</SectionHeading>

            <SubHeading id="managing-contacts">Managing Contacts</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The Contacts view provides a two-column layout: contact list on
              the left, details on the right. Add contacts with name, multiple
              email addresses, phone numbers (with type labels), and notes.
              Search across all fields to find contacts quickly.
            </p>

            <SubHeading id="carddav-sync">CardDAV Sync</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Sync contacts with external apps using CardDAV (RFC 6352). Your
              CardDAV URL is:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4">
              <code className="text-sm text-slate-200">
                https://your-server/.well-known/carddav
              </code>
            </div>
            <p className="mb-4 leading-relaxed text-slate-700">
              Authenticate with your full email address and password. Works with
              Apple Contacts, Thunderbird, and any CardDAV client.
            </p>
          </section>

          {/* Desktop & Mobile */}
          <section className="mb-16">
            <SectionHeading id="clients">
              Desktop &amp; Mobile Clients
            </SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              Kuju Email works with any standard IMAP email client. Here are
              setup instructions for popular apps.
            </p>

            <SubHeading id="apple-mail">Apple Mail</SubHeading>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
                <li>
                  Open <strong>System Settings &rarr; Internet Accounts</strong>
                </li>
                <li>
                  Select <strong>Add Other Account &rarr; Mail Account</strong>
                </li>
                <li>Enter your full email address and password</li>
                <li>
                  Set <strong>Incoming Mail Server (IMAP)</strong> to your
                  server hostname, port <strong>993</strong>, SSL enabled
                </li>
                <li>
                  Set <strong>Outgoing Mail Server (SMTP)</strong> to the same
                  hostname, port <strong>587</strong>, STARTTLS
                </li>
                <li>
                  For CalDAV/CardDAV, add a separate account using the
                  well-known URLs above
                </li>
              </ol>
            </div>

            <SubHeading id="thunderbird">Thunderbird</SubHeading>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
                <li>
                  Go to <strong>Account Settings &rarr; Account Actions &rarr;
                  Add Mail Account</strong>
                </li>
                <li>Enter your name, email address, and password</li>
                <li>
                  Thunderbird may auto-discover settings. If not, configure
                  manually:
                </li>
                <li>
                  IMAP: hostname, port <strong>993</strong>, SSL/TLS
                </li>
                <li>
                  SMTP: hostname, port <strong>587</strong>, STARTTLS
                </li>
                <li>
                  For CalDAV/CardDAV support, use the TbSync or CardBook
                  add-ons with the well-known URLs
                </li>
              </ol>
            </div>

            <SubHeading id="outlook">Outlook</SubHeading>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
                <li>
                  Go to <strong>File &rarr; Add Account</strong>
                </li>
                <li>
                  Select <strong>Manual setup</strong> and choose{" "}
                  <strong>IMAP</strong>
                </li>
                <li>
                  Incoming server: your hostname, port <strong>993</strong>,
                  SSL
                </li>
                <li>
                  Outgoing server: your hostname, port <strong>587</strong>,
                  TLS
                </li>
                <li>Enter your full email address as the username</li>
              </ol>
            </div>

            <SubHeading id="mobile">Mobile Apps</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email works with any IMAP-compatible mobile app:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>
                <strong>iOS Mail:</strong> Add as &ldquo;Other&rdquo; mail
                account with IMAP settings
              </li>
              <li>
                <strong>K-9 Mail / Thunderbird Mobile:</strong> Enter email and
                password — auto-discovery supported
              </li>
              <li>
                <strong>FairEmail:</strong> Manual IMAP/SMTP configuration with
                the server settings above
              </li>
            </ul>
          </section>

          {/* Smart Inbox */}
          <section className="mb-16">
            <SectionHeading id="smart-inbox">Smart Inbox</SectionHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              When enabled by your administrator, Smart Inbox automatically
              categorizes incoming messages by intent using a fast, local AI
              model. Messages are classified into categories:
            </p>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  cat: "Personal",
                  desc: "Direct person-to-person communication",
                },
                {
                  cat: "Newsletter",
                  desc: "Subscriptions and mailing lists",
                },
                {
                  cat: "Transactional",
                  desc: "Receipts, shipping updates, confirmations",
                },
                {
                  cat: "Notification",
                  desc: "Automated alerts from services",
                },
                { cat: "Calendar", desc: "Meeting invites and event updates" },
                {
                  cat: "Task",
                  desc: "Action items and requests from others",
                },
                {
                  cat: "Financial",
                  desc: "Bank statements, invoices, billing",
                },
                {
                  cat: "Social",
                  desc: "Social network notifications and messages",
                },
              ].map(({ cat, desc }) => (
                <div
                  key={cat}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="font-medium text-primary">{cat}:</span>{" "}
                  <span className="text-sm text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
            <p className="leading-relaxed text-slate-700">
              You can manually reclassify any message if the automatic
              categorization isn&rsquo;t right. Smart Inbox learns from your
              corrections over time.
            </p>
          </section>

          {/* Account Settings */}
          <section className="mb-16">
            <SectionHeading id="account-settings">
              Account Settings
            </SectionHeading>

            <SubHeading id="password">Password &amp; Security</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Change your password, manage 2FA settings, and register passkeys
              from <strong>Settings &rarr; Security</strong>. If you forget your
              password, use the recovery email address linked to your account to
              reset it.
            </p>

            <SubHeading id="theme">Theme &amp; Appearance</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Choose between Light, Dark, or System themes. Your domain admin
              may have configured a custom theme with branded colors and logos.
              Kuju Email includes pre-made themes inspired by popular email
              clients. Your theme preference syncs across sessions.
            </p>

            <SubHeading id="plus-addressing">Plus Addressing</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Use plus addressing to create unlimited aliases:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4">
              <code className="text-sm text-slate-200">
                you+newsletters@yourdomain.com
                <br />
                you+shopping@yourdomain.com
                <br />
                you+github@yourdomain.com
              </code>
            </div>
            <p className="leading-relaxed text-slate-700">
              All plus-addressed mail arrives in your inbox with the tag
              preserved. You can filter or search by tag to organize mail sent
              to specific addresses. This is especially useful for tracking
              which services share your email address.
            </p>
          </section>

          {/* Domain Administration */}
          <section className="mb-16">
            <SectionHeading id="domain-admin">
              Domain Administration
            </SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              Domain administrators have access to additional management
              features for their domain. These settings are available from the{" "}
              <strong>Admin</strong> section of the webmail interface.
            </p>

            <SubHeading id="managing-accounts">Managing Accounts</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Create new accounts by sending email invitations. New users
              receive an activation link to set their password. You can view
              account statuses (pending invite, active, inactive), manage
              quotas, and delegate admin privileges. Stale pending invitations
              are automatically cleaned up after 14 days.
            </p>

            <SubHeading id="domain-branding">Domain Branding</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Customize the look and feel of webmail for your domain:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>Upload a custom logo and set an app name</li>
              <li>
                Choose from pre-made themes (Outlook, Gmail, Apple Mail,
                Thunderbird, Yahoo, Proton Mail styles)
              </li>
              <li>Upload custom CSS for full control</li>
              <li>Upload files individually or as ZIP/tar.gz archives</li>
            </ul>

            <SubHeading id="custom-hostnames">Custom Hostnames</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Set up branded URLs for your webmail (e.g.,{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                webmail.yourdomain.com
              </code>
              ) and custom IMAP hostnames for client setup instructions. DNS
              verification is done via CNAME lookup. If you use PowerDNS or
              Cloudflare, one-click CNAME creation is available. TLS
              certificates for custom hostnames are provisioned automatically.
            </p>

            <SubHeading id="dkim">DKIM Management</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email automatically generates and manages DKIM keys for your
              domain. Automatic key rotation ensures your DKIM keys stay fresh
              with zero downtime:
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-3 font-semibold text-slate-900">
                DKIM Rotation Lifecycle:
              </h4>
              <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
                <li>
                  <strong>Generate:</strong> A new key is created and its DNS
                  record is published
                </li>
                <li>
                  <strong>Switch:</strong> After DNS propagation is verified,
                  signing switches to the new key
                </li>
                <li>
                  <strong>Cleanup:</strong> The old key is removed after a
                  configurable grace period
                </li>
              </ol>
              <p className="mt-3 text-sm text-slate-600">
                Default rotation interval is 30 days. The DKIM health dashboard
                shows current key status, age, and upcoming rotation.
              </p>
            </div>

            <SubHeading id="catch-all">Catch-All Addresses</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Enable a catch-all address for your domain to receive messages
              sent to any address that doesn&rsquo;t match an existing account.
              This is useful for small domains where you want to ensure no email
              is lost due to typos or unknown addresses.
            </p>

            <SubHeading id="spam-training">Spam Training</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Train the RSPAMD spam filter directly from webmail. Mark messages
              as spam (train as spam) or not spam (train as ham) to improve
              filtering accuracy for your domain. The admin dashboard shows
              per-module effectiveness statistics so you can see which detection
              methods are most effective.
            </p>
          </section>

          {/* Back to top */}
          <div className="border-t border-slate-200 pt-8 text-center">
            <Link
              href="/kuju-email"
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              &larr; Back to Kuju Email overview
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
