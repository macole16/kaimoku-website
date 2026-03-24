# Kuju Email Pricing Restructure Design

**Date:** 2026-03-24
**Status:** Draft
**Author:** Kaimoku Technologies

## Overview

Restructure Kuju Email pricing from a freemium model (with a free Community tier) to a paid-only model with a time-limited trial. This change is driven by:

- **Infrastructure cost sustainability** — free users consume storage, compute, and AI resources without contributing revenue
- **Support burden** — free users generate support requests without offsetting cost
- **Simplicity** — a straightforward "pay to use" model is easier to operate and communicate
- **Perceived value** — users invest more attention and effort when they have financial skin in the game

## Trial Model

### Structure

- **14-day full-featured trial** for all new signups
  - Full Professional-level access during trial
  - Users experience the complete platform before choosing a tier
- **1 automatic extension** of 14 additional days
  - Extension is offered only when the trial is about to expire (creates urgency)
  - Users are not informed of the extension option upfront
- **Maximum trial duration:** 28 days
- After trial expiration, users must select a paid plan to continue

### Trial Flow

1. User signs up on the pricing page by selecting "Start 14-day trial"
2. Full Professional-level access for 14 days
3. As trial nears expiry, user is offered a one-time 14-day extension
4. At end of trial (14 or 28 days), user must convert to a paid tier

## Pricing Tiers

### Tier 1: Individual/Family — $10/month

| Detail | Value |
|---|---|
| Base price | $10/mo |
| Included accounts | 5 |
| Storage per account | 5 GB (25 GB total included) |
| Extra accounts | $5/account/mo (includes 5 GB storage) |
| Extra storage | $1/GB/mo per account |
| Account cap | None |
| AI | Base models included |
| Premium AI add-on | $5/account/mo |
| Annual discount | ~17% |

**Target audience:** Individuals, families, personal use.

**Features included:**
- Full IMAP (RFC 3501 compliant) with SORT, THREAD, full-text SEARCH, IDLE
- Modern webmail with compose, drag-and-drop, auto-save drafts, browser notifications
- Command palette (Cmd+K)
- Native CalDAV calendar (RFC 4791)
- Native CardDAV contacts (RFC 6352)
- Spam filtering with heuristic phishing detection
- DKIM signing with automatic rotation
- 2FA (TOTP) and WebAuthn/FIDO2 passkeys
- Base AI features: reply drafting, rewrite with tone control, task extraction
- Vacation responder

**Account expansion:** Users can add unlimited accounts at $5/account/mo. There is no hard cap — if a user wants 20 accounts on the Family plan, that is supported. The differentiator between Family and Small Business is features, not account limits.

### Tier 2: Small Business — $5/account/month

| Detail | Value |
|---|---|
| Pricing model | Per-account |
| Per-account rate | $5/account/mo |
| Minimum accounts | 5 ($25/mo minimum) |
| Storage per account | 10 GB |
| Extra storage | $1/GB/mo per account |
| Premium AI add-on | $5/account/mo |
| Annual discount | ~17% |

**Target audience:** Small businesses, startups, small teams.

**Features included (everything in Individual/Family, plus):**
- AI attachment summarization (PDF, DOCX, XLSX, CSV, etc.)
- Waiting-on-reply tracker with nudge suggestions
- Contact intelligence and People view
- Workspaces for project-based organization
- Inbox summary dashboard (volume, security, productivity metrics)
- REST API access (80+ endpoints, JWT-authenticated)
- Plugin support (gRPC subprocess architecture)
- Per-domain branding, themes, custom CSS
- Per-domain admin delegation

### Tier 3: Professional — $75/month platform fee + $5/account/month

| Detail | Value |
|---|---|
| Platform fee | $75/mo |
| Per-account rate | $5/account/mo |
| Minimum accounts | 10 ($125/mo minimum) |
| Storage per account | 10 GB |
| Extra storage | $1/GB/mo per account |
| Archiving | 3-year retention included in platform fee |
| Extended retention | $0.50/GB/mo for retention beyond 3 years |
| Premium AI add-on | $5/account/mo |
| Annual discount | ~17% |

**Target audience:** Compliance-conscious businesses, regulated industries, larger teams.

**Platform fee justification:** The $75/mo platform fee covers archiving infrastructure, retention policy engine, advanced analytics systems, and LLM-powered spam scanning — infrastructure that has a fixed cost regardless of user count.

**Features included (everything in Small Business, plus):**
- AI-powered spam scanner (LLM-based, two-tier detection)
- Smart Inbox categorization (personal, newsletter, transactional, etc.)
- Google Safe Browsing URL checking
- ClamAV antivirus with auto-stripping of infected attachments
- Message archiving with 3-year retention included
- Configurable retention policies
- Advanced analytics dashboard
- Custom plugin development

**Archiving and retention:**
- 3-year retention is included in the platform fee, covering the most common compliance requirements (SEC Rule 17a-4, FINRA, general best practice)
- Extended retention beyond 3 years is available at $0.50/GB/mo for organizations needing to meet SOX (7 years), HIPAA (6 years), or other extended requirements

### Tier 4: Enterprise — A La Carte (Self-Serve)

| Component | Price |
|---|---|
| Minimum monthly spend | $300/mo |
| Per account | $7/account/mo |
| Storage per account | Configurable |
| Extra storage | $1/GB/mo |
| Premium AI | $5/account/mo |
| Managed backups | +$7/account/mo |
| Archiving (3-year) | Included |
| Extended retention | $0.50/GB/mo |
| SSO + Audit logging | Available (included in account rate) |
| Dedicated infrastructure | Coming soon |

**Target audience:** Large organizations, enterprises requiring custom configurations.

**Self-serve model:** Enterprise is fully self-serve. Customers build their own plan by selecting components from the menu. There is no sales team gating — the a la carte menu is published on the website for full transparency.

**Minimum monthly spend:** $300/mo ensures every Enterprise customer represents meaningful revenue. At $7/account, this is approximately 43 accounts before add-ons.

**Managed backups:** +$7/account/mo provides full backup coverage of emails, accounts, and configurations. This effectively doubles the per-account rate, reflecting the approximately doubled storage and infrastructure footprint of maintaining comprehensive backups.

**Dedicated infrastructure:** Isolated compute and storage for organizations requiring tenant isolation (finance, healthcare, government). Flagged as "coming soon" — pricing to be determined based on infrastructure costing.

**Features included (everything in Professional, plus):**
- SSO (SAML/OIDC)
- Audit logging
- Self-serve component builder
- Managed backup option
- Dedicated infrastructure option (coming soon)

## Cross-Cutting Pricing Components

### Premium AI Add-On — $5/account/month

Available to all tiers. Unlocks access to faster, more capable AI models for:
- Reply drafting and rewrite
- Task extraction
- Attachment summarization
- Spam/phishing analysis
- Natural language search and commands

**AI model tiering (without Premium AI):**
- Individual/Family: Lightweight models (fast, cost-effective)
- Small Business / Professional: Mid-tier models
- Enterprise: Mid-tier models (Premium AI unlocks top-tier)

**Fair-use policy:** No hard caps on AI usage. Kuju reserves the right to throttle or charge users who are clearly abusing the system. This keeps the experience simple for normal users (no "AI actions remaining" counters).

### Annual Billing Discount

- ~17% discount on all tiers for annual billing commitment
- Applied to base prices, per-account rates, and add-ons
- Publicly displayed on pricing page

### Custom Discounts

- Admin portal supports per-customer discount overrides
- Use cases: friends & family, strategic partnerships, early adopters, volume deals
- Adjustable on a per-business and per-family-plan basis

### Storage Overage Escalation

Three-stage escalation to protect against cost overruns while never cutting someone off from their email:

1. **Soft warning + grace period (14 days):** User is notified they've exceeded their storage limit. They can clean up, upgrade storage, or add accounts.
2. **Auto-charge (opt-in):** If the user opts in, overages are automatically billed at $1/GB/mo. Seamless, no disruption.
3. **Throttle (if no action):** If the user takes no action after the grace period and hasn't opted into auto-charge, service is degraded — e.g., attachments over 1 MB are rejected — but email continues to function.

## Competitive Positioning

### Individual/Family vs. Market

| Service | Price (5 users) | Storage |
|---|---|---|
| Google One Family | $20/mo | 200 GB shared |
| Microsoft 365 Family | $13/mo | 600 GB shared |
| Fastmail Family | $14/mo | 50 GB/user |
| Proton Mail Family | $20/mo | 3 TB shared |
| **Kuju Individual/Family** | **$10/mo** | **25 GB (5 GB/user)** |

**Positioning:** Lowest base price. Less storage than competitors, but includes AI features none of them offer. Storage is expandable at $1/GB/mo.

### Small Business vs. Market

| Service | Price (25 users) | Per-user |
|---|---|---|
| Google Workspace | $175/mo | $7/user |
| Microsoft 365 Business | $150/mo | $6/user |
| Fastmail Business | $125/mo | $5/user |
| **Kuju Small Business** | **$125/mo** | **$5/user** |

**Positioning:** Matches Fastmail, undercuts Google and Microsoft, with AI features as a differentiator.

### Professional vs. Market

| Service | Price (50 users) |
|---|---|
| Google Workspace Business Plus | $900/mo |
| Microsoft 365 Business Premium | $1,100/mo |
| **Kuju Professional** | **$325/mo** |

**Positioning:** Significantly undercuts incumbents for compliance-grade email, and the gap widens with scale.

## Migration from Current Pricing

The current pricing page has a free Community tier that will be eliminated. Key changes:

| Current | New |
|---|---|
| Community (Free, 10 users, 5 GB) | Eliminated — replaced by 14-day trial |
| Small Business ($29/mo, 50 users, 25 GB) | $5/account/mo, 5 account minimum, 10 GB/account |
| Professional ($99/mo, 500 users, 100 GB) | $75 platform + $5/account/mo, 10 account minimum |
| Enterprise (Custom) | $300/mo minimum, $7/account, self-serve a la carte |
| New: Individual/Family | $10/mo, 5 accounts, 5 GB/account |

## Future Considerations

- **Cost accounting system:** Monitor storage, usage, and relative costs to refine pricing with real data
- **Dedicated infrastructure pricing:** Requires infrastructure costing before setting rates
- **Premium AI pricing refinement:** $5/account/mo is a placeholder — refine based on actual AI model usage data
- **Self-hosted option:** On roadmap, pricing TBD
- **Managed backup costing:** $7/account/mo is based on estimated 2x storage footprint — refine with real data
