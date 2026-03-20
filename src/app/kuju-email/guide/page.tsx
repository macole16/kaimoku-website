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
      { title: "AI Rewrite & Tone Control", id: "ai-rewrite" },
      { title: "Attachments", id: "attachments" },
      { title: "Folders & Drag-and-Drop", id: "folders" },
      { title: "Search & Natural Language", id: "search" },
      { title: "Command Palette", id: "command-palette" },
      { title: "Thread Views", id: "thread-views" },
      { title: "Auto-Save Drafts", id: "auto-save" },
      { title: "Workspaces", id: "workspaces" },
      { title: "Browser Notifications", id: "notifications" },
      { title: "Message Intelligence", id: "intelligence" },
      { title: "Tracking Protection", id: "tracking" },
    ],
  },
  {
    title: "AI Productivity",
    id: "ai-productivity",
    children: [
      { title: "AI Reply", id: "ai-reply" },
      { title: "Task Extraction", id: "task-extraction" },
      { title: "Attachment Summarization", id: "attachment-knowledge" },
      { title: "Waiting-On-Reply Tracker", id: "waiting-tracker" },
      { title: "Contact Intelligence", id: "contact-intelligence" },
      { title: "Inbox Summary Dashboard", id: "inbox-dashboard" },
      { title: "Activity Feed", id: "activity-feed" },
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
      { title: "Vacation Responder", id: "vacation" },
      { title: "Plus Addressing", id: "plus-addressing" },
    ],
  },
  {
    title: "Domain Administration",
    id: "domain-admin",
    children: [
      { title: "Managing Accounts", id: "managing-accounts" },
      { title: "Pending Approvals", id: "pending-approvals" },
      { title: "Domain Branding", id: "domain-branding" },
      { title: "Custom Hostnames", id: "custom-hostnames" },
      { title: "DKIM Management", id: "dkim" },
      { title: "DNS Health Checks", id: "dns-health" },
      { title: "Retention Policies", id: "retention" },
      { title: "Delivery Thresholds", id: "delivery-thresholds" },
      { title: "Catch-All Addresses", id: "catch-all" },
      { title: "Spam Training", id: "spam-training" },
      { title: "Analytics", id: "analytics" },
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
              address and password. If your domain has a custom hostname (e.g.,{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                webmail.yourdomain.com
              </code>
              ), you may see a branded login page where only your username is
              required.
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
              menu. Messages display flags (read, starred) that sync across all
              your devices via IMAP.
            </p>

            <SubHeading id="composing">Composing Messages</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Click <strong>Compose</strong> to write a new message. The editor
              supports rich text formatting with auto-save drafts. Use{" "}
              <strong>Reply All</strong> to respond to all recipients, or{" "}
              <strong>Forward</strong> to send a message to someone new
              (including as an EML attachment). Proper In-Reply-To and
              References headers are maintained for threading.
            </p>

            <SubHeading id="ai-rewrite">
              AI Rewrite &amp; Tone Control
            </SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              While composing, use the AI Rewrite feature to adjust your
              message&rsquo;s tone. Choose from four styles:
            </p>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  tone: "Professional",
                  desc: "Polished and business-appropriate",
                },
                { tone: "Friendly", desc: "Warm and approachable" },
                { tone: "Concise", desc: "Shortened and to the point" },
                { tone: "Formal", desc: "Structured and official" },
              ].map(({ tone, desc }) => (
                <div
                  key={tone}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="font-medium text-primary">{tone}:</span>{" "}
                  <span className="text-sm text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
            <p className="mb-4 leading-relaxed text-slate-700">
              Each rewrite is saved as a version (v1, v2, v3...) so you can
              compare and restore any previous version instantly. Quoted text
              from the original message is preserved automatically.
            </p>

            <SubHeading id="attachments">Attachments</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Drag and drop files directly into the compose window, or click the
              attachment button to browse. Attached files are shown with their
              name and size. When reading messages, click attachments to download
              them.
            </p>

            <SubHeading id="folders">Folders &amp; Drag-and-Drop</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Standard folders (Inbox, Sent, Drafts, Junk, Trash) are created
              automatically. You can create custom folders for organization.
              Drag and drop messages directly from the message list onto
              folders in the sidebar — the target folder highlights on hover
              and folder counts update automatically. The Trash folder includes
              an Empty Trash button for one-click permanent deletion with a
              confirmation dialog. Folders display unread counts (red badge)
              and total counts (gray), and support IMAP SPECIAL-USE attributes
              for compatibility with all clients.
            </p>

            <SubHeading id="search">Search &amp; Natural Language</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Use the search bar to find messages by sender, subject, or body
              content. Full-text search is powered by server-side indexing for
              fast results.
            </p>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email also supports{" "}
              <strong>natural language search</strong> — type queries the way you
              think and the AI interprets them:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4">
              <code className="text-sm text-slate-200">
                &quot;invoices from last month&quot;
                <br />
                &quot;unread emails with attachments&quot;
                <br />
                &quot;messages from Sarah about the Q2 report&quot;
              </code>
            </div>
            <p className="mb-4 leading-relaxed text-slate-700">
              Date references are resolved with timezone awareness, so
              &ldquo;last week&rdquo; always means the right dates for you.
            </p>

            <SubHeading id="command-palette">Command Palette</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Press <strong>Cmd+K</strong> (or Ctrl+K) to open the Command
              Palette — a fuzzy-searchable list of 17+ commands. Navigate to
              folders, compose new messages, toggle Smart Inbox, access
              settings, switch themes, assign workspaces, and more.
            </p>
            <p className="mb-4 leading-relaxed text-slate-700">
              The Command Palette also supports{" "}
              <strong>natural language commands</strong> — type instructions
              like &ldquo;move this to archive&rdquo;, &ldquo;flag for
              follow-up&rdquo;, or &ldquo;assign to Project Alpha
              workspace&rdquo; and the AI interprets and executes the action.
            </p>

            <SubHeading id="thread-views">Thread Views</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              When viewing a conversation thread, choose from three display
              designs:
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ul className="space-y-3 text-sm text-slate-700">
                <li>
                  <strong>Command-Centric:</strong> Summary and quick actions
                  first — ideal for triage and fast responses.
                </li>
                <li>
                  <strong>Document-Centric:</strong> Structured AI sections
                  including Summary, Key Points, Open Questions, Decisions, and
                  Action Items — great for complex threads.
                </li>
                <li>
                  <strong>Timeline + Context Stream:</strong> Chronological
                  message flow with AI events interspersed — best for following
                  conversation history.
                </li>
              </ul>
            </div>

            <SubHeading id="auto-save">Auto-Save Drafts</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Drafts are automatically saved at configurable intervals (5s, 10s,
              15s, 30s, or 60s). Saved drafts are stored in the IMAP Drafts
              folder so they&rsquo;re accessible from any email client — not
              just the webmail.
            </p>

            <SubHeading id="workspaces">Workspaces</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Workspaces let you organize email by project. Messages can belong
              to multiple workspaces while staying in their original folders —
              think of them as tags, not folders.
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-3 font-semibold text-slate-900">
                Using Workspaces:
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <strong>Create:</strong> Create a workspace from the sidebar
                  or via the Command Palette
                </li>
                <li>
                  <strong>Assign:</strong> Drag and drop messages onto a
                  workspace, or use the Command Palette to assign
                </li>
                <li>
                  <strong>Auto-assign rules:</strong> Set rules to
                  automatically assign messages by sender domain, participant
                  email, or subject keyword
                </li>
                <li>
                  <strong>View:</strong> Click a workspace to see all messages
                  grouped together regardless of their folder
                </li>
                <li>
                  <strong>Remove:</strong> Remove messages from a workspace
                  without affecting the original message or other workspaces
                </li>
              </ul>
            </div>

            <SubHeading id="notifications">Browser Notifications</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Enable desktop notifications to be alerted when new messages
              arrive. Click the bell icon in the toolbar to toggle
              notifications on or off. Your browser will ask for permission the
              first time. Click a notification to jump directly to the webmail
              tab. Notifications work in Chrome, Firefox, Safari, and Edge
              while the webmail tab is open.
            </p>

            <SubHeading id="intelligence">Message Intelligence</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The Message Intelligence panel provides on-demand security
              analysis organized into two tabs: <strong>AI Insights</strong>{" "}
              (intent classification, thread summary, tracking, quick stats) and{" "}
              <strong>Security</strong> (authentication, threats, URLs, virus
              scanning). Click the shield icon on a message to see:
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
                  <strong>Google Safe Browsing:</strong> Real-time URL threat
                  checking against Google&rsquo;s malware, social engineering,
                  unwanted software, and harmful app databases. Results are
                  cached for 24 hours with a refresh button for re-checking.
                  Threat level badges show safe (green) or specific threat
                  types (red)
                </li>
                <li>
                  <strong>Antivirus:</strong> On-demand ClamAV scanning of
                  attachments with cached results. Infected attachments are
                  automatically stripped while preserving the message body
                </li>
                <li>
                  <strong>AI Threat Assessment:</strong> Evidence-based
                  evaluation identifying social engineering tactics, urgency
                  manipulation, and other threat signals with confidence levels
                </li>
              </ul>
            </div>

            <SubHeading id="tracking">Tracking Protection</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email detects tracking pixels embedded in emails from services
              like Mailchimp, ConvertKit, GitHub, and others. When trackers are
              detected, you&rsquo;ll see a notification showing which service is
              tracking. Toggle the protection on to strip tracking pixels from
              displayed messages — you control whether senders can track your
              opens.
            </p>
          </section>

          {/* AI Productivity */}
          <section className="mb-16">
            <SectionHeading id="ai-productivity">
              AI Productivity
            </SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              Kuju Email includes AI-powered tools designed to help you work
              faster and stay organized. These features use AI models to analyze
              your email content and provide actionable assistance.
            </p>

            <SubHeading id="ai-reply">AI Reply</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Generate a contextual reply draft with one click. The AI reads the
              conversation thread and drafts a relevant response. Review, edit,
              and send — or discard and write your own. AI Reply is available on
              any message via the toolbar or context menu.
            </p>

            <SubHeading id="task-extraction">Task Extraction</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The AI automatically scans emails for action items, deadlines, and
              follow-ups. Extracted tasks appear in a dedicated{" "}
              <strong>Tasks</strong> view in the sidebar with pending and
              completed filters. When a date is detected in a task, you can add
              it directly to your calendar with one click.
            </p>
            <p className="mb-4 leading-relaxed text-slate-700">
              Dates mentioned in email bodies are highlighted inline, so you can
              spot deadlines and meeting times at a glance.
            </p>

            <SubHeading id="attachment-knowledge">
              Attachment Summarization
            </SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Click <strong>Extract &amp; Summarize</strong> next to any
              supported attachment to extract its text content and generate an
              AI summary with key facts. Supported formats include:
            </p>
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              {[
                "PDF",
                "DOCX",
                "XLSX",
                "CSV",
                "Plain Text",
                "HTML",
                "Markdown",
                "JSON",
                "XML",
              ].map((fmt) => (
                <div
                  key={fmt}
                  className="rounded border border-slate-200 bg-white px-3 py-1.5 text-center text-sm text-slate-700"
                >
                  {fmt}
                </div>
              ))}
            </div>
            <p className="mb-4 leading-relaxed text-slate-700">
              Attachments up to 10 MB are supported. Extracted text is indexed
              for search, so you can find content inside attachments — not just
              email bodies. Results are cached per message, and an AI badge
              appears on the attachment after extraction.
            </p>

            <SubHeading id="waiting-tracker">
              Waiting-On-Reply Tracker
            </SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email automatically detects sent messages that are waiting for
              a reply using heuristic classification. When a reply comes in,
              it&rsquo;s auto-matched and the tracker updates.
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <strong className="text-green-600">Green:</strong> Recently
                  sent — still within normal response time
                </li>
                <li>
                  <strong className="text-yellow-600">Yellow:</strong> Aging —
                  it&rsquo;s been a while without a reply
                </li>
                <li>
                  <strong className="text-red-600">Red:</strong> Overdue —
                  consider following up
                </li>
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                Click the <strong>Nudge</strong> button to auto-generate a
                polite follow-up draft based on the original message.
              </p>
            </div>

            <SubHeading id="contact-intelligence">
              Contact Intelligence
            </SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The <strong>People</strong> view provides AI-powered
              communication pattern analysis:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>
                <strong>Top Contacts:</strong> Your most frequent
                correspondents, ranked by communication frequency
              </li>
              <li>
                <strong>Dormant Contacts:</strong> People you haven&rsquo;t
                emailed in a while, with last communication dates
              </li>
              <li>
                <strong>Per-Contact Stats:</strong> Emails sent and received,
                last contact date for any person
              </li>
              <li>
                <strong>Quick-Add:</strong> One-click add to your address book
                from the People view, with display names enriched from your
                contacts
              </li>
            </ul>

            <SubHeading id="inbox-dashboard">
              Inbox Summary Dashboard
            </SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Get an at-a-glance view of your inbox health:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>
                <strong>Mail volume:</strong> Messages received today, this
                week, and this month
              </li>
              <li>
                <strong>Security:</strong> Spam, virus, and quarantine counts
              </li>
              <li>
                <strong>Productivity:</strong> Number of messages waiting on
                reply and pending tasks
              </li>
              <li>
                <strong>AI breakdown:</strong> Classification distribution with
                bar chart visualization
              </li>
              <li>
                <strong>Top senders:</strong> Your top 10 correspondents with
                display names from your address book
              </li>
              <li>
                <strong>Response rate:</strong> Your reply rate and average
                messages per day
              </li>
              <li>
                <strong>Recent quarantine:</strong> Quick list of recently
                quarantined messages
              </li>
            </ul>

            <SubHeading id="activity-feed">Activity Feed</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The Activity Feed is a unified chronological stream that combines
              messages, calendar events, and tasks in one view. Filter by type
              to focus on what matters. Access it from the{" "}
              <strong>Activity</strong> view in the sidebar.
            </p>
          </section>

          {/* Calendar */}
          <section className="mb-16">
            <SectionHeading id="calendar">Calendar</SectionHeading>

            <SubHeading id="creating-events">Creating Events</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Click on any time slot in the calendar view to create a new event.
              Fill in the title, date, time, location, and optional description.
              Events support all-day mode and can be viewed in month, week, or
              day layouts. Click an existing event to edit or delete it.
            </p>
            <p className="mb-4 leading-relaxed text-slate-700">
              When AI Task Extraction detects a date in an email, you can add it
              to your calendar with one click — the event is created directly
              via CalDAV.
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
              email addresses and phone numbers (with type labels like Work,
              Home, Mobile), organization, job title, full address fields
              (street, city, state, postal code, country), and notes. Search
              across all fields to find contacts quickly.
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
              Apple Contacts, Thunderbird, and any CardDAV client. Multiple
              address books are supported.
            </p>
          </section>

          {/* Desktop & Mobile */}
          <section className="mb-16">
            <SectionHeading id="clients">
              Desktop &amp; Mobile Clients
            </SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              Kuju Email works with any standard IMAP email client. Here are
              setup instructions for popular apps. If your domain has a custom
              hostname configured, your admin may have a Connection Instructions
              card showing the exact IMAP/SMTP settings for your domain.
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
              categorizes incoming messages by intent using a fast AI model on
              delivery. Toggle Smart Inbox on or off with the brain icon in the
              webmail toolbar. Messages are grouped into collapsible sections
              with message counts:
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
            <p className="mb-4 leading-relaxed text-slate-700">
              You can manually reclassify any message using the dropdown in the
              AI Insights panel. Each category is shown with a colored badge
              indicator. AI classification is also reconciled automatically when
              threat analysis reveals new information about a message.
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
              request a reset.
            </p>

            <SubHeading id="theme">Theme &amp; Appearance</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Choose between Light, Dark, or System themes. Your domain admin
              may have configured a custom theme with branded colors, logos, and
              favicon. Kuju Email includes pre-made themes inspired by popular
              email clients (Outlook, Gmail, Apple Mail, Thunderbird, Yahoo,
              Proton Mail). Your theme preference syncs across sessions.
            </p>

            <SubHeading id="vacation">Vacation Responder</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Set up an automatic out-of-office reply from the{" "}
              <strong>Vacation</strong> entry in the sidebar. Configure a
              custom subject and message, and optionally set a date range.
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-3 font-semibold text-slate-900">
                Smart features:
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <strong>AI calendar detection:</strong> Automatically
                  detects vacation-related all-day events on your calendar
                  and suggests enabling the responder
                </li>
                <li>
                  <strong>Per-sender deduplication:</strong> Each sender
                  receives only one auto-reply per vacation period
                </li>
                <li>
                  <strong>Smart filtering:</strong> Does not reply to mailing
                  lists, spam, or messages where you were BCC&rsquo;d
                </li>
              </ul>
            </div>

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
              Create new accounts in two ways: <strong>invite-based</strong>{" "}
              (send an invitation email — the user sets their own password) or{" "}
              <strong>direct</strong> (admin sets the password, account is
              immediately active). You can view account statuses (pending
              invite, active, inactive), manage quotas, delegate admin
              privileges, and resend invitation links. Stale pending invitations
              are automatically cleaned up after 14 days.
            </p>

            <SubHeading id="pending-approvals">Pending Approvals</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              When new users request access to your domain, their requests
              appear in <strong>Admin &rarr; Pending Approvals</strong>. Review
              each request and approve or reject it. Approved users receive
              their account credentials; rejected requests are removed.
            </p>

            <SubHeading id="domain-branding">Domain Branding</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Customize the look and feel of webmail for your domain:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>Upload a custom logo (SVG, PNG, JPEG) and favicon (SVG, ICO)</li>
              <li>Set a custom app name that replaces &ldquo;Kuju Email&rdquo;</li>
              <li>
                Choose from pre-made themes (Outlook, Gmail, Apple Mail,
                Thunderbird, Yahoo, Proton Mail styles)
              </li>
              <li>Upload custom CSS with CSS variable overrides for full control</li>
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
              certificates for custom hostnames are provisioned automatically
              via on-demand TLS. Users accessing a custom hostname see a
              domain-scoped login with pre-auth branding.
            </p>

            <SubHeading id="dkim">DKIM Management</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Kuju Email automatically generates and manages DKIM keys for your
              domain with automatic key rotation on a configurable schedule
              (default 30 days):
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
                  <strong>Switch:</strong> After DNS propagation is verified
                  (1h default verification window), signing switches to the new
                  key
                </li>
                <li>
                  <strong>Cleanup:</strong> The old key is removed after a
                  configurable grace period (72h default)
                </li>
              </ol>
              <p className="mt-3 text-sm text-slate-600">
                The DKIM health dashboard shows current key status, age, and
                upcoming rotation. Both PowerDNS and Cloudflare DNS backends are
                supported with auto-detection.
              </p>
            </div>

            <SubHeading id="dns-health">DNS Health Checks</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The admin dashboard includes DNS health checks that verify your
              MX, SPF, DKIM, and DMARC records are correctly configured. DNS
              records are validated before any updates are applied. The system
              auto-detects whether you&rsquo;re using PowerDNS or Cloudflare and
              adapts accordingly.
            </p>

            <SubHeading id="retention">Retention Policies</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Configure automatic message deletion based on age to manage
              storage and comply with data retention requirements. Set policies
              at the domain level with optional per-folder overrides (e.g.,
              keep Inbox messages for 365 days but Trash for 30 days).
              Individual accounts can also have their own overrides.
            </p>
            <p className="mb-4 leading-relaxed text-slate-700">
              A background cleanup worker runs on a configurable schedule
              (default hourly), processing batch deletions with automatic
              storage reclamation and folder count updates.
            </p>

            <SubHeading id="delivery-thresholds">
              Delivery Thresholds
            </SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Fine-tune spam handling per domain with configurable thresholds:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>
                <strong>Junk threshold</strong> (default 5.0): Messages
                scoring above this are routed to the Junk folder
              </li>
              <li>
                <strong>Drop threshold</strong> (default 15.0): Messages
                scoring above this are hard-rejected and never delivered
              </li>
              <li>
                <strong>Quarantine expiry</strong> (default 30 days):
                Quarantined messages are automatically purged after this period
              </li>
            </ul>
            <p className="mb-4 leading-relaxed text-slate-700">
              Drop statistics are available via the admin API for monitoring
              rejected message volume.
            </p>

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

            <SubHeading id="analytics">Analytics</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              The admin Analytics tab provides comprehensive delivery and
              security insights with selectable time ranges (24h, 7d, 30d):
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700">
              <li>
                <strong>Delivery metrics:</strong> Volume, delivery rate, reject
                rate, bounce rate, and spam scores
              </li>
              <li>
                <strong>Visualizations:</strong> Stacked bar charts for delivery
                volume, doughnut charts for status breakdown, horizontal bar
                charts for spam score distribution
              </li>
              <li>
                <strong>Top senders and source IPs</strong> for identifying
                patterns
              </li>
              <li>
                <strong>Plugin scan analytics:</strong> Heuristic vs. AI
                detection breakdown with token usage and cost tracking
              </li>
              <li>
                <strong>Per-domain delivery statistics</strong> for
                multi-tenant environments
              </li>
            </ul>
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
