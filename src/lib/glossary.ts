// Single source of truth for the /kuju-email/glossary page and the
// anchor IDs used by deep links from the SecurityJourney diagram.
// Adding a new term here adds it to the glossary page automatically.
// Changing the `id` field is a breaking change — diagram links use it.

export type GlossaryExample = {
  /** Short context label, e.g. "In your message headers" or "DNS record (for domain admins)". */
  label: string;
  /** The literal sample. Rendered as monospace with preserved whitespace. */
  body: string;
};

export type GlossaryEntry = {
  /** kebab-cased anchor ID, e.g. "spf", "relay-hop-trace". Stable; used in URLs. */
  id: string;
  /** Display term, e.g. "SPF" or "Relay-hop trace". */
  term: string;
  /** Full expansion, e.g. "Sender Policy Framework". Empty string if N/A. */
  expansion: string;
  /** 1-2 plain-language sentences explaining the mechanic. */
  definition: string;
  /** Zero or more concrete examples. Recipient-facing first when both apply. */
  examples?: GlossaryExample[];
  /** 1 sentence connecting the mechanic back to the prospect's concern. */
  whyItMatters: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "spf",
    term: "SPF",
    expansion: "Sender Policy Framework",
    definition:
      "A DNS record listing which mail servers are allowed to send mail for your domain. Receivers check this list when a message arrives.",
    examples: [
      {
        label: "In your message headers",
        body: `Authentication-Results: mx.kuju.email;
  spf=pass smtp.mailfrom=sender@example.com`,
      },
      {
        label: "DNS record (for domain admins)",
        body: `example.com.  IN TXT  "v=spf1 include:_spf.kuju.email -all"`,
      },
    ],
    whyItMatters:
      "Without SPF, anyone can claim to send mail from your address. With it, fakes get caught at the door.",
  },
  {
    id: "dkim",
    term: "DKIM",
    expansion: "DomainKeys Identified Mail",
    definition:
      "A cryptographic signature attached to each outgoing message, verified by the recipient's mail server against a public key in your DNS.",
    examples: [
      {
        label: "In your message headers",
        body: `Authentication-Results: mx.kuju.email;
  dkim=pass header.d=example.com header.s=mail`,
      },
      {
        label: "DNS record (for domain admins)",
        body: `mail._domainkey.example.com.  IN TXT  "v=DKIM1; k=rsa; p=MIGfMA0G..."`,
      },
    ],
    whyItMatters:
      "It proves the message wasn't altered between the sender and you.",
  },
  {
    id: "dmarc",
    term: "DMARC",
    expansion:
      "Domain-based Message Authentication, Reporting, and Conformance",
    definition:
      "A DNS policy telling receiving servers what to do when a message claiming to be from your domain fails SPF or DKIM checks — reject it, quarantine it, or just report it.",
    examples: [
      {
        label: "In your message headers",
        body: `Authentication-Results: mx.kuju.email;
  dmarc=pass action=none header.from=example.com`,
      },
      {
        label: "DNS record (for domain admins)",
        body: `_dmarc.example.com.  IN TXT
  "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"`,
      },
    ],
    whyItMatters:
      "SPF and DKIM detect impersonation; DMARC decides what to do about it.",
  },
  {
    id: "relay-hop-trace",
    term: "Relay-hop trace",
    expansion: "",
    definition:
      'Mail messages pass through a chain of servers ("hops") on the way to you, and each hop adds a Received header. Inspecting the chain reveals where a message really came from.',
    examples: [
      {
        label: "In your message headers (read bottom-up)",
        body: `Received: from mx-out.example.com (198.51.100.42)
  by mx.kuju.email; Mon, 12 May 2026 09:14:22 +0000
Received: from internal.example.com by mx-out.example.com;
  Mon, 12 May 2026 09:14:20 +0000`,
      },
    ],
    whyItMatters:
      'Some phishing attempts forge the visible "From" address but can\'t hide their true path. Tracing the hops surfaces those fakes.',
  },
  {
    id: "reputation-checks",
    term: "Reputation checks",
    expansion: "",
    definition:
      "External services maintain lists scoring the trustworthiness of sending mail servers, IP addresses, and domains based on historical behavior. Incoming mail is scored against those lists.",
    whyItMatters:
      "Known spammers and compromised servers get caught even when their individual messages look innocuous.",
  },
  {
    id: "spam-and-phishing-patterns",
    term: "Spam & phishing patterns",
    expansion: "",
    definition:
      "A library of structural signals — suspicious links, unusual formatting, common scam phrasing — that mail filters use to classify messages alongside the reputation score.",
    whyItMatters:
      "New scams get caught quickly when they reuse patterns from older scams, even when they come from new addresses.",
  },
  {
    id: "url-safe-browsing",
    term: "URL safe-browsing",
    expansion: "",
    definition:
      "Every link in a message is checked against Google Safe Browsing's continuously-updated list of known phishing, malware, and unwanted-software sites.",
    whyItMatters:
      "Even a message that passes every other check can carry a link to a malicious site. This is the last check before you click.",
  },
  {
    id: "virus-stripping",
    term: "Virus stripping",
    expansion: "",
    definition:
      "Attachments are scanned with anti-virus engines before the message is delivered. Confirmed malicious files are removed automatically; the message body still arrives so you don't miss what was sent.",
    whyItMatters:
      "Most malicious attachments arrive as ordinary-looking documents. Stripping them keeps the message useful without putting your machine at risk.",
  },
  {
    id: "tls-in-flight",
    term: "TLS in flight",
    expansion: "",
    definition:
      "Encryption applied to the connection between mail servers and between your mail client and the server, so messages can't be read mid-transit.",
    whyItMatters:
      "No one on the network in between can read what's passing through, even when the message contents aren't end-to-end encrypted.",
  },
  {
    id: "encrypted-at-rest",
    term: "Encrypted at rest",
    expansion: "",
    definition:
      "Messages stored on Kuju's servers are encrypted with keys held in a hardware-backed secret store. If a disk is stolen, the data is unreadable without the keys.",
    whyItMatters:
      "A server's physical security alone isn't enough — at-rest encryption is the second line of defense for stored mail.",
  },
  {
    id: "totp",
    term: "TOTP",
    expansion: "Time-based One-Time Password",
    definition:
      "A six-digit code that changes every 30 seconds, generated by an authenticator app on your phone, entered alongside your password when signing in.",
    examples: [
      {
        label: "In your authenticator app",
        body: `123 456    (expires in 22 seconds)`,
      },
    ],
    whyItMatters:
      "A stolen password alone isn't enough to sign in as you. The attacker would also need physical access to your phone.",
  },
  {
    id: "passkeys",
    term: "Passkeys",
    expansion: "WebAuthn",
    definition:
      "A cryptographic key pair stored on your device (or in a password manager) that replaces the password entirely. Signing in is a tap of your fingerprint or a face unlock.",
    whyItMatters:
      "There is no shared secret to steal in a phishing attack. Passkeys cannot be intercepted, replayed, or guessed.",
  },
  {
    id: "mx-records",
    term: "MX records",
    expansion: "Mail Exchange records",
    definition:
      "DNS entries that tell sending mail servers which servers handle incoming mail for your domain. When you point MX records at Kuju, mail addressed to your domain comes to us.",
    examples: [
      {
        label: "DNS record (for domain admins)",
        body: `kuju.email.  IN MX 10  mx1.kuju.email.
kuju.email.  IN MX 20  mx2.kuju.email.`,
      },
    ],
    whyItMatters:
      "This is the switch that moves your email to Kuju. Until your MX records change, your mail still flows to your old provider.",
  },
  {
    id: "end-to-end-encryption",
    term: "End-to-end encryption",
    expansion: "",
    definition:
      "A class of encryption in which only the sender and recipient hold the keys — no server in between (not even your mail provider) can read the message. Kuju Email does not implement end-to-end encryption today; we use TLS in transit and at-rest encryption instead.",
    whyItMatters:
      "End-to-end encryption is a stronger guarantee for specific use cases, but it breaks server-side spam filtering, search, and shared-mailbox workflows. We've prioritized strong transport and storage encryption with full feature support.",
  },
];
