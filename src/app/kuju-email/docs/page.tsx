import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — Kuju Email | Kaimoku Technologies",
  description:
    "Complete REST API reference for Kuju Email. Authentication, endpoints, request/response formats, and examples.",
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

function Endpoint({
  method,
  path,
  desc,
  auth,
}: {
  method: string;
  path: string;
  desc?: string;
  auth?: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-800",
    POST: "bg-blue-100 text-blue-800",
    PUT: "bg-amber-100 text-amber-800",
    PATCH: "bg-orange-100 text-orange-800",
    DELETE: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <span
        className={`inline-block w-16 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${methodColors[method] ?? "bg-slate-100 text-slate-700"}`}
      >
        {method}
      </span>
      <div className="min-w-0">
        <code className="break-all text-sm text-slate-800">{path}</code>
        {desc && (
          <span className="ml-2 text-sm text-slate-500">— {desc}</span>
        )}
        {auth && (
          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
            {auth}
          </span>
        )}
      </div>
    </div>
  );
}

function EndpointGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white">
      {title && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        </div>
      )}
      <div className="px-4">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mb-6 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

const tocSections = [
  {
    title: "Overview",
    id: "overview",
    children: [
      { title: "Base URL", id: "base-url" },
      { title: "Authentication", id: "authentication" },
    ],
  },
  {
    title: "Public API",
    id: "public-api",
    children: [
      { title: "Auth", id: "auth" },
      { title: "Two-Factor (TOTP)", id: "totp" },
      { title: "Folders", id: "folders" },
      { title: "Messages", id: "messages" },
      { title: "Message Analysis", id: "message-analysis" },
      { title: "Attachment Knowledge", id: "attachment-knowledge" },
      { title: "Drafts", id: "drafts" },
      { title: "Calendars & Events", id: "calendars" },
      { title: "Address Books & Contacts", id: "contacts" },
      { title: "CalDAV / CardDAV", id: "dav" },
      { title: "Branding", id: "branding" },
    ],
  },
  {
    title: "Account API",
    id: "account-api",
    children: [
      { title: "Preferences", id: "preferences" },
      { title: "AI & Intelligence", id: "ai-intelligence" },
      { title: "Thread Graph", id: "thread-graph" },
      { title: "Vacation", id: "vacation" },
      { title: "Waiting On Reply", id: "waiting" },
      { title: "Tasks", id: "tasks" },
      { title: "Activity Feed", id: "feed" },
      { title: "Contact Intelligence", id: "contact-intel" },
      { title: "Inbox Summary", id: "inbox-summary" },
      { title: "Workspaces", id: "workspaces" },
      { title: "NL Commands", id: "nl-commands" },
    ],
  },
  {
    title: "Domain Admin API",
    id: "domain-admin-api",
    children: [
      { title: "Accounts & Stats", id: "domain-accounts" },
      { title: "Retention Policies", id: "domain-retention" },
      { title: "Account Creation", id: "account-creation" },
    ],
  },
  {
    title: "Site Admin API",
    id: "admin-api",
    children: [
      { title: "Domains", id: "admin-domains" },
      { title: "Accounts", id: "admin-accounts" },
      { title: "Branding (Admin)", id: "admin-branding" },
      { title: "System & Licensing", id: "admin-system" },
      { title: "Delivery Thresholds", id: "admin-thresholds" },
      { title: "Retention Policies", id: "admin-retention" },
      { title: "KumoMTA Proxy", id: "admin-kumomta" },
      { title: "Plugins", id: "admin-plugins" },
    ],
  },
  {
    title: "Concepts",
    id: "concepts",
    children: [
      { title: "Account Status", id: "account-status" },
      { title: "Domain Fields", id: "domain-fields" },
      { title: "Plus Addressing", id: "plus-addressing" },
      { title: "Branding Files", id: "branding-files" },
    ],
  },
  {
    title: "Examples",
    id: "examples",
    children: [],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              API Reference
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
            Kuju Email API Reference
          </h1>
          <p className="mb-12 text-lg text-slate-600">
            Complete REST API documentation for integrating with Kuju Email.
            All endpoints return JSON and accept JSON request bodies.
          </p>

          {/* Overview */}
          <section className="mb-16">
            <SectionHeading id="overview">Overview</SectionHeading>

            <SubHeading id="base-url">Base URL</SubHeading>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-semibold text-slate-700">
                    Public API (JWT):
                  </span>
                  <code className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-sm">
                    http(s)://&lt;host&gt;:8080
                  </code>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700">
                    Internal API:
                  </span>
                  <code className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-sm">
                    http(s)://&lt;host&gt;:2525
                  </code>
                </div>
              </div>
            </div>

            <SubHeading id="authentication">Authentication</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Public endpoints require a JWT in the{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                Authorization
              </code>{" "}
              header:
            </p>
            <CodeBlock>{"Authorization: Bearer <token>"}</CodeBlock>
            <p className="mb-4 leading-relaxed text-slate-700">
              Admin endpoints require{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                is_admin=true
              </code>{" "}
              in the JWT claims. Domain admin endpoints require{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                is_domain_admin=true
              </code>{" "}
              or site admin privileges.
            </p>
          </section>

          {/* Public API */}
          <section className="mb-16">
            <SectionHeading id="public-api">Public API</SectionHeading>

            <SubHeading id="auth">Auth</SubHeading>
            <EndpointGroup>
              <Endpoint method="POST" path="/api/auth/login" />
              <Endpoint method="POST" path="/api/auth/logout" />
              <Endpoint method="POST" path="/api/auth/refresh" />
              <Endpoint
                method="POST"
                path="/api/invite"
                desc="accept invite and set password (public, token-based)"
              />
              <Endpoint
                method="POST"
                path="/api/forgot-password"
                desc="request password reset email"
              />
              <Endpoint
                method="POST"
                path="/api/reset-password"
                desc="reset password with token"
              />
            </EndpointGroup>

            <SubHeading id="totp">Two-Factor Authentication (TOTP)</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/auth/totp/status"
                desc="check if TOTP is enabled"
                auth="JWT"
              />
              <Endpoint
                method="POST"
                path="/api/auth/totp/setup"
                desc="generate secret + QR code"
                auth="JWT"
              />
              <Endpoint
                method="POST"
                path="/api/auth/totp/confirm?session_id=..."
                desc="verify code, enable TOTP, return backup codes"
                auth="JWT"
              />
              <Endpoint
                method="POST"
                path="/api/auth/totp/verify"
                desc="verify TOTP code during login, issue JWT"
              />
              <Endpoint
                method="DELETE"
                path="/api/auth/totp"
                desc="disable TOTP (requires current code)"
                auth="JWT"
              />
            </EndpointGroup>

            <SubHeading id="folders">Folders</SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/folders" />
              <Endpoint method="POST" path="/api/folders" />
              <Endpoint method="PUT" path="/api/folders/:id" />
              <Endpoint method="DELETE" path="/api/folders/:id" />
              <Endpoint
                method="GET"
                path="/api/folders/:id/messages"
              />
            </EndpointGroup>

            <SubHeading id="messages">Messages</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="POST"
                path="/api/messages"
                desc="compose / send"
              />
              <Endpoint method="GET" path="/api/messages/:id" />
              <Endpoint
                method="GET"
                path="/api/messages/:id/raw"
                desc="raw RFC 822 source"
              />
              <Endpoint
                method="GET"
                path="/api/messages/:id/body"
                desc="rendered body"
              />
              <Endpoint
                method="GET"
                path="/api/messages/:id/attachments/:aid"
                desc="download attachment"
              />
              <Endpoint
                method="PATCH"
                path="/api/messages/:id/flags"
                desc="update flags (read, starred, etc.)"
              />
              <Endpoint method="PATCH" path="/api/messages/:id/move" />
              <Endpoint method="PATCH" path="/api/messages/:id/copy" />
              <Endpoint method="DELETE" path="/api/messages/:id" />
              <Endpoint
                method="POST"
                path="/api/messages/search"
                desc="advanced search"
              />
              <Endpoint
                method="GET"
                path="/api/messages/search?q=..."
                desc="quick search"
              />
            </EndpointGroup>

            <SubHeading id="message-analysis">Message Analysis</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/messages/:id/analysis"
                desc="cached results + feature availability"
              />
              <Endpoint
                method="GET"
                path="/api/messages/:id/analysis/instant"
                desc="header analysis (auth, sender, hops, URLs)"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/analysis/ai"
                desc="AI threat assessment (?force=true to re-analyze)"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/analysis/av-rescan"
                desc="ClamAV attachment scan"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/analysis/url-safety"
                desc="Google Safe Browsing URL check"
              />
            </EndpointGroup>

            <SubHeading id="attachment-knowledge">
              Attachment Knowledge
            </SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/messages/:id/attachments/:aid/knowledge"
                desc="cached extraction result"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/attachments/:aid/knowledge"
                desc="extract text + AI summarize"
              />
            </EndpointGroup>

            <SubHeading id="drafts">Drafts</SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/drafts" />
              <Endpoint method="POST" path="/api/drafts" />
              <Endpoint method="GET" path="/api/drafts/:id" />
              <Endpoint method="PUT" path="/api/drafts/:id" />
              <Endpoint method="DELETE" path="/api/drafts/:id" />
              <Endpoint
                method="POST"
                path="/api/drafts/:id/send"
                desc="send a saved draft"
              />
            </EndpointGroup>

            <SubHeading id="calendars">Calendars &amp; Events</SubHeading>
            <EndpointGroup title="Calendars">
              <Endpoint method="GET" path="/api/calendars" desc="list calendars" />
              <Endpoint method="POST" path="/api/calendars" desc="create calendar" />
              <Endpoint method="PUT" path="/api/calendars/:id" desc="update calendar" />
              <Endpoint method="DELETE" path="/api/calendars/:id" desc="delete calendar" />
            </EndpointGroup>
            <EndpointGroup title="Events">
              <Endpoint
                method="GET"
                path="/api/calendars/:calId/events?start=...&end=..."
                desc="list events (optional RFC 3339 range filter)"
              />
              <Endpoint
                method="GET"
                path="/api/calendars/:calId/events/:id"
                desc="get event"
              />
              <Endpoint
                method="POST"
                path="/api/calendars/:calId/events"
                desc="create event"
              />
              <Endpoint
                method="PUT"
                path="/api/calendars/:calId/events/:id"
                desc="update event"
              />
              <Endpoint
                method="DELETE"
                path="/api/calendars/:calId/events/:id"
                desc="delete event"
              />
            </EndpointGroup>

            <SubHeading id="contacts">
              Address Books &amp; Contacts
            </SubHeading>
            <EndpointGroup title="Address Books">
              <Endpoint method="GET" path="/api/address-books" desc="list address books" />
              <Endpoint method="POST" path="/api/address-books" desc="create address book" />
              <Endpoint method="PUT" path="/api/address-books/:id" desc="update address book" />
              <Endpoint method="DELETE" path="/api/address-books/:id" desc="delete address book" />
            </EndpointGroup>
            <EndpointGroup title="Contacts">
              <Endpoint
                method="GET"
                path="/api/address-books/:abId/contacts?q=..."
                desc="list contacts (optional search)"
              />
              <Endpoint
                method="GET"
                path="/api/address-books/:abId/contacts/:id"
                desc="get contact"
              />
              <Endpoint
                method="POST"
                path="/api/address-books/:abId/contacts"
                desc="create contact"
              />
              <Endpoint
                method="PUT"
                path="/api/address-books/:abId/contacts/:id"
                desc="update contact"
              />
              <Endpoint
                method="DELETE"
                path="/api/address-books/:abId/contacts/:id"
                desc="delete contact"
              />
            </EndpointGroup>

            <SubHeading id="dav">CalDAV / CardDAV</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Standard CalDAV and CardDAV endpoints are available for syncing
              calendars and contacts with third-party clients. Authentication
              uses HTTP Basic Auth with your email and password.
            </p>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/.well-known/caldav"
                desc="redirects to /caldav/"
              />
              <Endpoint
                method="GET"
                path="/.well-known/carddav"
                desc="redirects to /carddav/"
              />
              <Endpoint
                method="GET"
                path="/caldav/{accountId}/{calendarName}/"
                desc="CalDAV endpoint"
                auth="Basic"
              />
              <Endpoint
                method="GET"
                path="/carddav/{accountId}/{addressBookName}/"
                desc="CardDAV endpoint"
                auth="Basic"
              />
            </EndpointGroup>

            <SubHeading id="branding">Branding</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/branding"
                desc="branding config for the authenticated user's domain"
              />
              <Endpoint
                method="GET"
                path="/api/branding/assets/:filename"
                desc="branding asset file (logo, favicon, CSS)"
              />
            </EndpointGroup>
          </section>

          {/* Account API */}
          <section className="mb-16">
            <SectionHeading id="account-api">
              Account API
            </SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              All account API endpoints require a valid JWT.
            </p>

            <SubHeading id="preferences">Preferences</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="PUT"
                path="/api/account/preferences"
                desc="update account preferences (spam_folder, plus_tag_filing, etc.)"
              />
            </EndpointGroup>

            <SubHeading id="ai-intelligence">AI &amp; Intelligence</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/messages/:id/thread-ai-state"
                desc="get AI triage state for a thread"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/ai-reply"
                desc="generate AI reply draft"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/rewrite-draft"
                desc="rewrite compose draft with tone control"
              />
              <Endpoint
                method="POST"
                path="/api/messages/:id/thread-document"
                desc="generate document-centric thread analysis"
              />
              <Endpoint
                method="POST"
                path="/api/analysis/natural-search"
                desc="interpret natural language search query"
              />
              <Endpoint
                method="POST"
                path="/api/analysis/backfill-body-search"
                desc="backfill body search index"
              />
            </EndpointGroup>

            <SubHeading id="thread-graph">Thread Graph</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/messages/:id/thread-graph"
                desc="get conversation graph (nodes + edges)"
              />
            </EndpointGroup>

            <SubHeading id="vacation">Vacation</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/vacation"
                desc="get vacation responder settings"
              />
              <Endpoint
                method="PUT"
                path="/api/vacation"
                desc="update vacation responder (enabled, subject, body, start/end dates)"
              />
            </EndpointGroup>

            <SubHeading id="waiting">Waiting On Reply</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/waiting"
                desc="list sent messages awaiting reply"
              />
              <Endpoint
                method="PUT"
                path="/api/waiting/:id"
                desc="update waiting status (resolved, snoozed)"
              />
              <Endpoint
                method="POST"
                path="/api/waiting/:id/nudge"
                desc="send follow-up nudge"
              />
            </EndpointGroup>

            <SubHeading id="tasks">Tasks</SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/tasks" desc="list tasks" />
              <Endpoint method="POST" path="/api/tasks" desc="create task" />
              <Endpoint method="PUT" path="/api/tasks/:id" desc="update task" />
              <Endpoint method="DELETE" path="/api/tasks/:id" desc="delete task" />
              <Endpoint
                method="POST"
                path="/api/tasks/:id/to-calendar"
                desc="convert task to calendar event"
              />
            </EndpointGroup>

            <SubHeading id="feed">Activity Feed</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/feed?limit=..."
                desc="merged chronological feed (messages, events, tasks)"
              />
            </EndpointGroup>

            <SubHeading id="contact-intel">Contact Intelligence</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/contacts/intelligence/top"
                desc="top contacts by email frequency"
              />
              <Endpoint
                method="GET"
                path="/api/contacts/intelligence/dormant"
                desc="contacts with no recent communication"
              />
              <Endpoint
                method="GET"
                path="/api/contacts/intelligence/:email"
                desc="per-email communication stats"
              />
              <Endpoint
                method="POST"
                path="/api/contacts/quick-add"
                desc="quick-add sender to address book"
              />
            </EndpointGroup>

            <SubHeading id="inbox-summary">Inbox Summary</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/inbox-summary"
                desc="dashboard stats (volume, security, productivity, classifications)"
              />
            </EndpointGroup>

            <SubHeading id="workspaces">Workspaces</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/workspaces"
                desc="list workspaces with message counts"
              />
              <Endpoint
                method="POST"
                path="/api/workspaces"
                desc="create workspace"
              />
              <Endpoint
                method="PUT"
                path="/api/workspaces/:id"
                desc="update workspace (name, color, rules, etc.)"
              />
              <Endpoint
                method="DELETE"
                path="/api/workspaces/:id"
                desc="delete workspace (messages preserved)"
              />
              <Endpoint
                method="GET"
                path="/api/workspaces/:id/messages?page=1&per_page=50"
                desc="paginated messages"
              />
              <Endpoint
                method="POST"
                path="/api/workspaces/:id/messages"
                desc="assign message"
              />
              <Endpoint
                method="DELETE"
                path="/api/workspaces/:id/messages/:messageId"
                desc="remove message from workspace"
              />
              <Endpoint
                method="GET"
                path="/api/messages/:id/workspaces"
                desc="get workspaces a message belongs to"
              />
            </EndpointGroup>

            <SubHeading id="nl-commands">NL Commands</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="POST"
                path="/api/commands/interpret"
                desc="AI interprets natural language command"
              />
              <Endpoint
                method="POST"
                path="/api/commands/execute"
                desc="execute a command plan (move, archive, delete, flag)"
              />
            </EndpointGroup>
          </section>

          {/* Domain Admin API */}
          <section className="mb-16">
            <SectionHeading id="domain-admin-api">
              Domain Admin API
            </SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              Requires a JWT with{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                is_domain_admin
              </code>{" "}
              or{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                is_admin
              </code>{" "}
              claims.
            </p>

            <SubHeading id="domain-accounts">
              Accounts &amp; Stats
            </SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/domain-admin/stats" />
              <Endpoint method="GET" path="/api/domain-admin/accounts" />
              <Endpoint
                method="POST"
                path="/api/domain-admin/accounts"
                desc="create account (see Account Creation below)"
              />
              <Endpoint method="PUT" path="/api/domain-admin/accounts/:id" />
              <Endpoint method="DELETE" path="/api/domain-admin/accounts/:id" />
              <Endpoint
                method="POST"
                path="/api/domain-admin/accounts/:id/resend-invite"
                desc="resend invite email (pending accounts only)"
              />
              <Endpoint
                method="POST"
                path="/api/domain-admin/accounts/:id/recover"
                desc="send password reset to recovery email"
              />
              <Endpoint method="GET" path="/api/domain-admin/delivery-log" />
              <Endpoint
                method="GET"
                path="/api/domain-admin/dns/check-records"
                desc="verify DNS records for the admin's domain"
              />
            </EndpointGroup>

            <SubHeading id="domain-retention">Retention Policies</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/domain-admin/retention"
                desc="get effective retention (domain + account policies)"
              />
              <Endpoint
                method="PUT"
                path="/api/domain-admin/retention/domain"
                desc="upsert retention for own domain"
              />
              <Endpoint
                method="GET"
                path="/api/domain-admin/accounts/:id/retention"
                desc="get account retention override"
              />
              <Endpoint
                method="PUT"
                path="/api/domain-admin/accounts/:id/retention"
                desc="upsert account retention override"
              />
              <Endpoint
                method="DELETE"
                path="/api/domain-admin/accounts/:id/retention"
                desc="remove account retention override"
              />
            </EndpointGroup>

            <SubHeading id="account-creation">Account Creation</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                POST /api/domain-admin/accounts
              </code>{" "}
              accepts a{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                mode
              </code>{" "}
              field:
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <ul className="space-y-3 text-sm text-slate-700">
                <li>
                  <strong className="text-slate-900">&quot;password&quot; (default):</strong>{" "}
                  Admin sets the password. Account is immediately active.
                </li>
                <li>
                  <strong className="text-slate-900">&quot;invite&quot;:</strong>{" "}
                  Requires{" "}
                  <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">
                    invite_email
                  </code>{" "}
                  (external address). Account starts as{" "}
                  <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">
                    pending_invite
                  </code>
                  . An invite email is sent; the recipient sets their own password.
                </li>
              </ul>
            </div>
            <CodeBlock>
              {`// Invite mode example
POST /api/domain-admin/accounts
{
  "local_part": "alice",
  "mode": "invite",
  "invite_email": "alice@gmail.com",
  "display_name": "Alice",
  "quota_bytes": 1073741824
}`}
            </CodeBlock>
          </section>

          {/* Site Admin API */}
          <section className="mb-16">
            <SectionHeading id="admin-api">Site Admin API</SectionHeading>
            <p className="mb-6 leading-relaxed text-slate-700">
              Requires a JWT with{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                is_admin=true
              </code>
              .
            </p>

            <SubHeading id="admin-domains">Domains</SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/admin/domains" />
              <Endpoint method="POST" path="/api/admin/domains" />
              <Endpoint method="PUT" path="/api/admin/domains/:id" />
              <Endpoint method="DELETE" path="/api/admin/domains/:id" />
            </EndpointGroup>

            <SubHeading id="admin-accounts">Accounts</SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/admin/accounts" />
              <Endpoint method="POST" path="/api/admin/accounts" />
              <Endpoint
                method="PUT"
                path="/api/admin/accounts/:id"
                desc="update account; set is_admin to promote/demote"
              />
              <Endpoint method="DELETE" path="/api/admin/accounts/:id" />
            </EndpointGroup>

            <SubHeading id="admin-branding">Branding (Admin)</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/admin/branding/:domain"
                desc="branding config"
              />
              <Endpoint
                method="GET"
                path="/api/admin/branding/:domain/files"
                desc="list branding files"
              />
              <Endpoint
                method="POST"
                path="/api/admin/branding/:domain/archive"
                desc="upload tar.gz/zip archive"
              />
              <Endpoint
                method="GET"
                path="/api/admin/branding/:domain/:filename"
                desc="download/preview asset"
              />
              <Endpoint
                method="POST"
                path="/api/admin/branding/:domain/:filename"
                desc="upload single asset"
              />
              <Endpoint
                method="DELETE"
                path="/api/admin/branding/:domain/:filename"
                desc="delete asset"
              />
            </EndpointGroup>

            <SubHeading id="admin-system">System &amp; Licensing</SubHeading>
            <EndpointGroup>
              <Endpoint method="GET" path="/api/admin/stats" />
              <Endpoint method="GET" path="/api/admin/delivery-log" />
              <Endpoint method="GET" path="/api/admin/license" />
              <Endpoint method="PUT" path="/api/admin/license" />
              <Endpoint method="GET" path="/api/admin/system-info" />
              <Endpoint
                method="GET"
                path="/api/admin/settings"
                desc="system settings (key-value)"
              />
              <Endpoint
                method="PUT"
                path="/api/admin/settings/corporate-domain"
                desc="update corporate domain"
              />
              <Endpoint
                method="PUT"
                path="/api/admin/settings/safe-browsing-key"
                desc="save Google Safe Browsing API key"
              />
              <Endpoint
                method="GET"
                path="/api/admin/dns/check-records?domain=..."
                desc="verify DNS records (MX, SPF, DKIM, DMARC)"
              />
              <Endpoint method="GET" path="/api/admin/openapi.yaml" />
            </EndpointGroup>

            <SubHeading id="admin-thresholds">
              Delivery Thresholds
            </SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/admin/domains/:domainId/thresholds"
                desc="get spam score thresholds"
              />
              <Endpoint
                method="PUT"
                path="/api/admin/domains/:domainId/thresholds"
                desc="update junk/drop thresholds and quarantine expiry"
              />
              <Endpoint
                method="GET"
                path="/api/admin/delivery/drops"
                desc="hard drop statistics"
              />
            </EndpointGroup>

            <SubHeading id="admin-retention">Retention Policies</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/admin/domains/:domainId/retention"
                desc="get domain retention policy"
              />
              <Endpoint
                method="PUT"
                path="/api/admin/domains/:domainId/retention"
                desc="upsert domain retention policy"
              />
              <Endpoint
                method="DELETE"
                path="/api/admin/domains/:domainId/retention"
                desc="remove domain retention policy"
              />
            </EndpointGroup>

            <SubHeading id="admin-kumomta">KumoMTA Proxy</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Proxy endpoints for managing the embedded KumoMTA instance.
            </p>
            <EndpointGroup>
              <Endpoint
                method="GET"
                path="/api/admin/kumomta/metrics"
                desc="raw KumoMTA metrics (includes uptime, version)"
              />
              <Endpoint
                method="GET"
                path="/api/admin/kumomta/{endpoint}"
                desc="proxy GET (bounces, suspensions, ready-q-suspensions)"
              />
              <Endpoint
                method="POST"
                path="/api/admin/kumomta/{endpoint}"
                desc="create bounce/suspend rules"
              />
              <Endpoint
                method="DELETE"
                path="/api/admin/kumomta/{endpoint}"
                desc="delete bounce/suspend rules"
              />
            </EndpointGroup>

            <SubHeading id="admin-plugins">Plugins</SubHeading>
            <EndpointGroup>
              <Endpoint
                method="POST"
                path="/api/admin/plugins/{id}/enable-all"
                desc="enable a plugin for all domains"
              />
            </EndpointGroup>
          </section>

          {/* Concepts */}
          <section className="mb-16">
            <SectionHeading id="concepts">Concepts</SectionHeading>

            <SubHeading id="account-status">Account Status</SubHeading>
            <div className="mb-6 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3">
                      <code className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                        active
                      </code>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Normal account — can login and receive mail
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                        pending_invite
                      </code>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Awaiting invite acceptance — can receive mail but cannot
                      login
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                        inactive
                      </code>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Disabled — cannot login or receive mail
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Pending accounts that are not activated within 14 days are
              automatically deleted by the cleanup worker.
            </p>

            <SubHeading id="domain-fields">Domain Fields</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Domains support a{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                catch_all_account_id
              </code>{" "}
              field. When set, mail to unknown addresses at the domain is
              delivered to the designated account.
            </p>
            <CodeBlock>
              {`PUT /api/admin/domains/:id
{"catch_all_account_id": 5}     // enable catch-all → account 5
{"catch_all_account_id": null}  // disable catch-all`}
            </CodeBlock>

            <SubHeading id="plus-addressing">Plus Addressing</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Mail sent to{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                user+tag@domain
              </code>{" "}
              delivers to{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                user@domain
              </code>
              . The tag is stored in{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                messages.plus_tag
              </code>{" "}
              for filtering. No configuration needed — always active.
            </p>
            <p className="mb-6 leading-relaxed text-slate-700">
              <strong>Auto-filing:</strong> Users can enable{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                plus_tag_filing
              </code>{" "}
              in their preferences. When enabled, emails to{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                user+tag@domain
              </code>{" "}
              are automatically placed in a folder named after the tag (created
              if needed). Spam routing takes priority.
            </p>

            <SubHeading id="branding-files">Branding Files</SubHeading>
            <p className="mb-4 leading-relaxed text-slate-700">
              Per-domain branding lets you customize the webmail UI for each
              domain: logo, favicon, colors, app name, and custom CSS.
            </p>
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-3 font-semibold text-slate-900">
                Allowed files:
              </h4>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "branding.json",
                  "logo.svg",
                  "logo.png",
                  "favicon.ico",
                  "favicon.svg",
                  "custom.css",
                ].map((f) => (
                  <code
                    key={f}
                    className="rounded bg-slate-200 px-2 py-0.5 text-sm"
                  >
                    {f}
                  </code>
                ))}
              </div>
              <h4 className="mb-2 font-semibold text-slate-900">
                Size limits:
              </h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Images: 512 KB</li>
                <li>CSS / JSON: 64 KB</li>
                <li>Archives: 2 MB</li>
              </ul>
            </div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              branding.json format:
            </p>
            <CodeBlock>
              {`{
  "app_name": "My Mail",
  "primary_color": "#667eea",
  "accent_color": "#764ba2"
}`}
            </CodeBlock>
          </section>

          {/* Examples */}
          <section className="mb-16">
            <SectionHeading id="examples">Examples</SectionHeading>

            <p className="mb-2 text-sm font-semibold text-slate-700">
              Login:
            </p>
            <CodeBlock>
              {`curl -s -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"secret"}'`}
            </CodeBlock>

            <p className="mb-2 text-sm font-semibold text-slate-700">
              List folders:
            </p>
            <CodeBlock>
              {`curl -s http://localhost:8080/api/folders \\
  -H "Authorization: Bearer $TOKEN"`}
            </CodeBlock>

            <p className="mb-2 text-sm font-semibold text-slate-700">
              Compose and send:
            </p>
            <CodeBlock>
              {`curl -s -X POST http://localhost:8080/api/messages \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"from":"admin@example.com","to":["user@example.com"],"subject":"Hello","text":"Hi"}'`}
            </CodeBlock>

            <p className="mb-2 text-sm font-semibold text-slate-700">
              List admin domains:
            </p>
            <CodeBlock>
              {`curl -s http://localhost:8080/api/admin/domains \\
  -H "Authorization: Bearer $ADMIN_TOKEN"`}
            </CodeBlock>
          </section>
        </article>
      </div>
    </div>
  );
}
