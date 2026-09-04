---
slug: troubleshooting-delivery
title: Troubleshoot mail delivery for a Kuju domain
order: 5
preconditions:
  - the domain is already delegated to Kuju (see dns-delegation) or its mail records were added externally
  - you can run dig and openssl
outcome: "The cause of missing or rejected mail is identified from observations, or the exact evidence for support is collected"
facts_used: [mx, customer_domain_records, wizard_labels]
prose_emphasis:
  - "HUMAN ACTION"
---

# Troubleshoot mail delivery for a Kuju domain

You are an agent helping a person troubleshoot mail delivery for `<domain>`, a
domain that already uses Kuju Email. Replace `<domain>` with the customer's
domain everywhere below (for example `example.com`). Never invent a value you
did not observe. Every command here is read-only.

Steps marked **HUMAN ACTION** are things you cannot do — for example clicking
through DNS or registrar control panels, reading a bounce message from the
person's own inbox, reading a value from the Kuju admin screen, or sending and
inspecting a test message from their own mailbox. Give the person exact
instructions, then wait for them to confirm.

Pick the section that matches the symptom the person reports. Collect every
observation you make; the last section tells you how to report them.

## A - "Mail sent TO my domain is not arriving"

### A1 - Where does the world think mail for this domain goes?

    dig MX <domain> +short

| Observation | Meaning | Next |
| --- | --- | --- |
| exactly `{{fact:mx.priority}} {{fact:mx.target}}.` | Kuju receives mail for the domain | A2 |
| empty | no MX; senders will try the domain's A record, which is not a mail server | the domain is not provisioned - run [dns-delegation](/kuju-email/agent/dns-delegation.md) from Step 1 |
| a different host | the OLD provider still receives the mail | the person's old mailbox has it; the change never landed - run A2 first to see which DNS model they use, then [dns-delegation](/kuju-email/agent/dns-delegation.md) Step 4 if delegated, or its Step 3b if they kept their own host |
| Kuju's host plus other hosts | split delivery; some senders reach the old provider | **HUMAN ACTION** - the extra MX records must be removed where the DNS lives |

### A2 - Is the delegation consistent?

    dig NS <domain> +short
    dig NS <domain> +short @1.1.1.1

| Observation | Next |
| --- | --- |
| both answers end in `.kuju.email.` | A3 |
| they differ | propagation is still in progress; wait 15 minutes and re-run A1 |
| neither is Kuju | the person chose "{{fact:wizard_labels.keep_current_dns}}", so the nameservers are not meant to be Kuju's; A1's result is what matters - if A1 passed, A3 |

### A3 - Does Kuju's mail server accept connections?

    openssl s_client -connect {{fact:mx.target}}:25 -starttls smtp -brief </dev/null

| Observation | Meaning | Next |
| --- | --- | --- |
| a line starting `250` or `CONNECTION ESTABLISHED` | the server is up and speaks TLS | A4 |
| `connect: Connection timed out` | almost always the NETWORK YOU ARE ON blocks outbound port 25, which is normal for home and office ISPs; it says nothing about Kuju | A4 |
| `Connection refused` | the server is not accepting mail right now | collect this for support (see Report) and try again in 15 minutes |

### A4 - Ask the sender for the bounce

> **HUMAN ACTION** - if a specific message did not arrive, ask the person to
> get the bounce message (the "Undelivered Mail" reply) from the SENDER. The
> bounce names the server that rejected the mail and why. Read it to them:
>
> | Bounce text contains | Meaning |
> | --- | --- |
> | `550` and `does not exist` or `unknown user` | the address is not set up in Kuju; **HUMAN ACTION** - the person needs to create the mailbox or alias in the Kuju admin |
> | `550` and `spam` or `blocked` or `rejected` | Kuju's filters rejected it; the sender's own domain probably fails SPF/DKIM; the sender should check their setup |
> | `quarantine` or `held` | the message is in the person's Kuju quarantine folder, not lost |
> | `450` or `try again later` | a temporary deferral; the sender's server will retry for days - wait |
> | no bounce at all after 24 hours | the sender's server may still be retrying; ask them to check their outbound queue |

## B - "Mail I send from my domain goes to spam or bounces"

### B1 - Is the domain authenticated?

    dig TXT <domain> +short
    dig TXT _dmarc.<domain> +short

| Record | Expected | If not |
| --- | --- | --- |
| SPF | a TXT equal to `{{fact:customer_domain_records.spf}}` | missing SPF is the most common cause of spam placement; the domain is not fully provisioned - B1a, then [dns-delegation](/kuju-email/agent/dns-delegation.md) Step 5 |
| DMARC | a TXT starting `v=DMARC1` | same |
| more than one SPF record | INVALID - SPF fails outright for every message (a PermError per RFC 7208), so neither record is used | **HUMAN ACTION** - the extra record must be deleted where the DNS lives |

DKIM's selector rotates, so ask for it:

> **HUMAN ACTION** - ask the person to read the DKIM selector from the domain's
> DNS section in the Kuju admin. A newly provisioned domain uses `default`;
> after a rotation it looks like `mail-20260901`.

    dig TXT <selector>._domainkey.<domain> +short

| Observation | Next |
| --- | --- |
| a record containing `v=DKIM1` | B2 |
| empty | B1a, then [dns-delegation](/kuju-email/agent/dns-delegation.md) Step 5 - on a delegated domain a re-check in the admin usually fixes it; on the "{{fact:wizard_labels.keep_current_dns}}" path the person must add the record themselves |

### B1a - Before routing back: rule out a cached answer

Rule out a cached answer before routing back to `dns-delegation`: a lookup
made before the record existed can be remembered by the resolver for an hour
or more, so ask the domain's own nameservers directly.

    dig NS <domain> +short

Ask EACH host it prints, and do not add `+short` below, because you need the
header:

    dig MX <domain> @<nameserver>
    dig TXT <domain> @<nameserver>
    dig TXT _dmarc.<domain> @<nameserver>
    dig TXT <selector>._domainkey.<domain> @<nameserver>

This check needs `dig`, and it is the one place in this runbook where
`nslookup` is not a substitute: it takes the server as a trailing argument
rather than `@server`, and prints no `status:` line, so the table below
cannot be read through it. With only `nslookup`, do not conclude anything is
missing - report the record UNVERIFIED and give the person the `dig` command
to run.

Read the `status:` line and the ANSWER SECTION:

| Observation | Meaning |
| --- | --- |
| `status: NOERROR` and the record is in the ANSWER SECTION | the record IS published and only your resolver's cache is stale - report it as PASS, and tell the person it will be visible everywhere shortly |
| `status: NOERROR` with no ANSWER SECTION, or `status: NXDOMAIN`, on every nameserver you asked | the record is genuinely not there - continue below. (A missing record at the domain itself, MX or SPF, answers NOERROR; a missing `_dmarc` or `._domainkey` name answers NXDOMAIN. Both mean absent) |
| the nameservers disagree with each other | the change is still publishing across their provider - wait 15 minutes and ask again |
| `status: REFUSED`, `status: SERVFAIL`, or `connection timed out` | this tells you NOTHING about the record - the server would not answer you. Do not treat it as missing; wait and re-check, or ask a different nameserver |

If the record really is absent on every nameserver, go to
[dns-delegation](/kuju-email/agent/dns-delegation.md) Step 5 to publish or
re-check it. If a record is still missing after two re-checks, stop here:
collect the evidence for support (see Report) rather than returning to the
DNS runbook a third time.

### B2 - What does a receiver actually see?

> **HUMAN ACTION** - ask the person to send a test message from their Kuju
> mailbox to a Gmail or Outlook address they control, open it there, and view
> the original message / headers. Ask them to read you the line that starts
> `Authentication-Results:`.

| The line contains | Meaning |
| --- | --- |
| `spf=pass`, `dkim=pass`, `dmarc=pass` | authentication is correct; spam placement is reputation or content, not setup - B3 |
| `spf=fail` or `spf=softfail` | the mail did not leave through Kuju's servers, or SPF is missing - re-run B1 |
| `dkim=fail` | the published key does not match; wait an hour (rotation) and re-test; still failing - report |
| `dmarc=fail` | follows from the two above |

### B3 - Reputation and content

Nothing here is a DNS problem. Tell the person: a new domain has no sending
history and lands in spam more often for the first weeks; sending to people who
have never written to them, or sending many identical messages, makes it worse.
Ask recipients to mark the message "not spam" once. If the volume is legitimate
and the problem persists, report it (below).

## C - "I hit a sending limit"

Kuju applies per-account sending limits. This runbook deliberately does not
state the numbers - they are configured per deployment and can change. The
error message the person sees names the limit that was hit.

> **HUMAN ACTION** - ask the person to read you the exact error text.

| Error text contains | Meaning | Next |
| --- | --- | --- |
| `daily` or `per day` | the daily cap; it resets at midnight UTC | wait, or contact support if the volume is legitimate |
| `rate` or `too many` or `slow down` | short-term rate limit | wait a few minutes and retry |
| `quota` or `storage` | the MAILBOX is full, not a sending limit | the person must delete mail or raise the quota with support |

## Report

When you cannot resolve it, give the person this block to send to Kuju support,
filled in with what you observed (paste the raw command output, not a summary):

    Domain: <domain>
    Symptom: <one sentence>
    dig MX <domain> +short        -> <output>
    dig NS <domain> +short        -> <output>
    dig TXT <domain> +short       -> <output>
    dig TXT _dmarc.<domain> +short -> <output>
    Authentication-Results line   -> <line, if collected>
    Bounce or error text          -> <text, if collected>
