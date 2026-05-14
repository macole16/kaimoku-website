import type { Metadata } from "next";
import { loadApiDocs, type EndpointData } from "@/lib/api-docs";
import { SectionHeading } from "@/components/docs/SectionHeading";
import { SubHeading } from "@/components/docs/SubHeading";
import { Endpoint } from "@/components/docs/Endpoint";
import { EndpointGroup } from "@/components/docs/EndpointGroup";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
  title: "API Documentation · Kuju Email",
  description:
    "Complete REST API reference for Kuju Email. Authentication, endpoints, request/response formats, and examples.",
};

// ---------------------------------------------------------------------------
// Prose content for sections that are not purely endpoint-driven
// ---------------------------------------------------------------------------

/** Prose rendered before a section's children (keyed by section id). */
const sectionIntro: Record<string, React.ReactNode> = {
  "account-api": (
    <p className="mb-6 leading-relaxed text-slate-700">
      All account API endpoints require a valid JWT.
    </p>
  ),
  "domain-admin-api": (
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
  ),
  "admin-api": (
    <p className="mb-6 leading-relaxed text-slate-700">
      Requires a JWT with{" "}
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
        is_admin=true
      </code>
      .
    </p>
  ),
};

/** Prose rendered before a subsection's endpoints (keyed by subsection id). */
const subsectionProse: Record<string, React.ReactNode> = {
  dav: (
    <p className="mb-4 leading-relaxed text-slate-700">
      Standard CalDAV and CardDAV endpoints are available for syncing calendars
      and contacts with third-party clients. Authentication uses HTTP Basic Auth
      with your email and password.
    </p>
  ),
  "admin-kumomta": (
    <p className="mb-4 leading-relaxed text-slate-700">
      Proxy endpoints for managing the embedded KumoMTA instance.
    </p>
  ),
};

/**
 * Subsections whose endpoints should be split into titled EndpointGroups.
 * Each rule maps a subsection id to a list of { title, predicate } pairs.
 * Endpoints are tested in order; the first matching group wins.
 */
const endpointGroupSplits: Record<
  string,
  { title: string; match: (path: string) => boolean }[]
> = {
  calendars: [
    { title: "Calendars", match: (p) => !p.includes("/events") },
    { title: "Events", match: () => true },
  ],
  contacts: [
    { title: "Address Books", match: (p) => !p.includes("/contacts") },
    { title: "Contacts", match: () => true },
  ],
};

/** Fully-prose subsections (keyed by subsection id). */
function ProseSubsection({ id }: { id: string }) {
  switch (id) {
    // ---- Overview ----
    case "base-url":
      return (
        <>
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
        </>
      );

    case "authentication":
      return (
        <>
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
        </>
      );

    // ---- Concepts ----
    case "account-status":
      return (
        <>
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
        </>
      );

    case "domain-fields":
      return (
        <>
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
        </>
      );

    case "plus-addressing":
      return (
        <>
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
            are automatically placed in a folder named after the tag (created if
            needed). Spam routing takes priority.
          </p>
        </>
      );

    case "branding-files":
      return (
        <>
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
            <h4 className="mb-2 font-semibold text-slate-900">Size limits:</h4>
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
        </>
      );

    // ---- Domain Admin: Account Creation ----
    case "account-creation":
      return (
        <>
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
                <strong className="text-slate-900">
                  &quot;password&quot; (default):
                </strong>{" "}
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
                . An invite email is sent; the recipient sets their own
                password.
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
        </>
      );

    default:
      return null;
  }
}

/** Full-section prose (keyed by section id). */
function ProseSectionBody({ id }: { id: string }) {
  if (id !== "examples") return null;
  return (
    <>
      <p className="mb-2 text-sm font-semibold text-slate-700">Login:</p>
      <CodeBlock>
        {`curl -s -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"secret"}'`}
      </CodeBlock>

      <p className="mb-2 text-sm font-semibold text-slate-700">List folders:</p>
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Endpoint rendering helper
// ---------------------------------------------------------------------------

function renderEndpoints(subId: string, endpoints: EndpointData[]) {
  const splits = endpointGroupSplits[subId];
  if (!splits) {
    return (
      <EndpointGroup>
        {endpoints.map((ep, i) => (
          <Endpoint
            key={`${ep.method}-${ep.path}-${i}`}
            method={ep.method}
            path={ep.path}
            desc={ep.desc}
            auth={ep.auth}
          />
        ))}
      </EndpointGroup>
    );
  }

  // Split endpoints into titled groups. Each endpoint goes to the first
  // matching group, preserving order and avoiding duplicates.
  const assigned = new Set<number>();
  return splits.map((group) => {
    const grouped: { ep: EndpointData; idx: number }[] = [];
    endpoints.forEach((ep, idx) => {
      if (!assigned.has(idx) && group.match(ep.path)) {
        assigned.add(idx);
        grouped.push({ ep, idx });
      }
    });
    if (grouped.length === 0) return null;
    return (
      <EndpointGroup key={group.title} title={group.title}>
        {grouped.map(({ ep, idx }) => (
          <Endpoint
            key={`${ep.method}-${ep.path}-${idx}`}
            method={ep.method}
            path={ep.path}
            desc={ep.desc}
            auth={ep.auth}
          />
        ))}
      </EndpointGroup>
    );
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsPage() {
  const { sections, toc } = loadApiDocs();

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
              {toc.map((section) => (
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
            Complete REST API documentation for integrating with Kuju Email. All
            endpoints return JSON and accept JSON request bodies.
          </p>

          {sections.map((section) => (
            <section key={section.id} className="mb-16">
              <SectionHeading id={section.id}>{section.name}</SectionHeading>

              {/* Optional section intro prose */}
              {sectionIntro[section.id]}

              {/* Section-level prose (e.g. Examples) */}
              <ProseSectionBody id={section.id} />

              {section.children.map((sub) => {
                const hasEndpoints = sub.endpoints.length > 0;
                const hasProse = !hasEndpoints;

                return (
                  <div key={sub.id}>
                    <SubHeading id={sub.id}>{sub.name}</SubHeading>

                    {/* Pre-endpoint prose (e.g. CalDAV intro paragraph) */}
                    {subsectionProse[sub.id]}

                    {/* Prose-only subsection */}
                    {hasProse && <ProseSubsection id={sub.id} />}

                    {/* Endpoint listing */}
                    {hasEndpoints && renderEndpoints(sub.id, sub.endpoints)}
                  </div>
                );
              })}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
