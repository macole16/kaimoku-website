---
slug: dns-delegation
title: Delegate your domain's DNS to Kuju
order: 3
preconditions:
  - the customer owns a domain and can log in to wherever it is registered
  - the customer has an active Kuju account (see signup-trial)
  - you can run dig (or nslookup)
outcome: "NS points at Kuju; MX, SPF, DKIM and DMARC verify"
facts_used: [nameservers, mx, customer_domain_records, registrars]
---

# Delegate your domain's DNS to Kuju

You are an agent helping a person move their domain's DNS to Kuju Email so that
mail for `<domain>` is handled by Kuju. Replace `<domain>` with the customer's
domain everywhere below (for example `example.com`). Never invent a value you did
not observe. Every command here is read-only.

Steps marked **HUMAN ACTION** are things you cannot do: registrar logins,
clicking through control panels, reading a value from the Kuju admin screen.
Give the person exact instructions, then wait for them to confirm.

## Step 1 - Find out who runs this domain's DNS today

    dig NS <domain>

Read the `status:` in the header and the `ANSWER SECTION`.

| Observation | Next |
| --- | --- |
| `status: NXDOMAIN` | Step 1a - the name does not exist |
| `status: NOERROR` and the ANSWER SECTION is empty | Step 1b - a subdomain hosted inside its parent zone |
| every NS answer ends in `.kuju.email.` | Step 5 - already delegated; verify only |
| NS answers present, any other host | Step 2 |
| `status: SERVFAIL`, `status: REFUSED`, or no response (timeout) | retry the lookup once; if it still fails, stop and tell the person the lookup itself is failing — do not guess a registrar from absent data |

If `dig` is not installed, `nslookup -type=NS <domain>` gives the same answer:
"can't find" is NXDOMAIN, an empty result is 1b, otherwise read the `nameserver =`
lines.

### Step 1a - The name does not exist

> **HUMAN ACTION** - the domain is not registered, or was typed wrong. Ask the
> person to confirm the spelling. If it is correct, they need to register the
> domain first; come back to Step 1 afterwards.

### Step 1b - A subdomain hosted inside its parent zone

`<domain>` is a subdomain (such as `mail.example.com`) whose records live in the
parent domain's DNS (`example.com` in that example). **Do not follow Step 3's
script on this path.** "Set custom nameservers" is a registrar-level control
that replaces the PARENT domain's own top-level NS records — applying it here
would delegate all of `example.com`, not just the subdomain, and would very
likely take the parent domain's entire DNS offline. That is worse than the
delegation never happening, so treat this branch as its own procedure:

1. Repeat Step 1 with the parent domain to see who hosts ITS DNS.
2. Identify that host with Step 2's substring table, exactly as for a normal
   domain.
3. Then, instead of Step 3's nameserver-replacement script, use this one:

> **HUMAN ACTION** - you cannot do this step. Give the person:
>
> 1. The DNS panel link from Step 2 (the registrar name if there is none, or
>    the nameserver hostnames you observed if no key matched).
> 2. The instruction to open the parent zone's DNS RECORDS section — not the
>    "nameservers" / "custom nameservers" setting, which controls the parent
>    domain's own top-level NS and must be left exactly as it is — and add two
>    NS records scoped to the subdomain label only:
>
>    Add NS records for `<domain>` pointing at:
>      {{fact:nameservers.0}}
>      {{fact:nameservers.1}}
>
> 3. An explicit statement, in your own words: this delegates only `<domain>`;
>    the parent domain's own nameserver setting must not change.
>
> Ask them to tell you when they have saved the change.

Continue at Step 4 to verify, running the same `dig NS <domain>` checks against
the subdomain. Step 3's paragraph about capturing existing records and its
"external DNS" alternative do not apply here — the subdomain's own records (if
any) are unaffected by adding a delegation NS set beside them.

## Step 2 - Identify the registrar or DNS host

Take the FIRST line of the NS answers from Step 1. Lowercase it and strip the
trailing dot. Then test whether that hostname CONTAINS each key in the table
below - a substring test, not a suffix test. Two of the biggest providers put
their key in the MIDDLE of the name:

    ns-1234.awsdns-56.org      contains "awsdns"     -> AWS Route 53
    ns1-08.azure-dns.com       contains "azure-dns"  -> Microsoft Azure
    dns1.registrar-servers.com contains "registrar-servers.com" -> Namecheap

{{fact:registrars.table}}

| Observation | Next |
| --- | --- |
| exactly one key matches and it has a panel link | Step 3, using that link with `<domain>` filled in |
| the key matches but the row says "no panel link" | Step 3, but tell the person the registrar's NAME and that they must find the nameserver setting themselves |
| no key matches | Step 3, telling the person the nameserver hostnames you saw; the hostnames usually name the provider (for example `ns1.example-hosting.net`) |

## Step 3 - Capture the existing records, then change the nameservers

Changing nameservers moves ALL DNS for the domain, not only mail. Any website or
other record that exists today will stop resolving unless it is recreated on
Kuju's side. Collect what exists now so the person can recreate it:

    dig A <domain> +short
    dig AAAA <domain> +short
    dig A www.<domain> +short
    dig CNAME www.<domain> +short
    dig MX <domain> +short
    dig TXT <domain> +short

Keep the non-empty answers — including the MX and TXT ones, which you need for
the Step 6 report and for rollback, but must NOT hand to the person as records
to recreate (see item 2 below). Then:

> **HUMAN ACTION** - you cannot do this step. Give the person:
>
> 1. The DNS panel link from Step 2 (the registrar name if there is none, or —
>    if no key matched at all — the nameserver hostnames you observed in
>    Step 1, since that is the only identifying information you have).
> 2. ONLY the captured A, AAAA and CNAME lines, with the instruction to add
>    them in Kuju's domain DNS page after delegation. Do NOT forward the
>    captured MX or TXT lines: Kuju publishes its own mail records (MX, SPF,
>    DKIM, DMARC) once delegated, and re-adding the old provider's values
>    alongside them creates a duplicate MX (mail can keep flowing to the old
>    host) and two competing SPF TXT records (SPF fails outright per RFC 7208
>    — a PermError, not a pass). Hold onto the MX/TXT values only for your
>    Step 6 report and in case the person needs to roll back.
> 3. The exact two nameservers to set, replacing whatever is there now:
>
>    Set custom nameservers to:
>      {{fact:nameservers.0}}
>      {{fact:nameservers.1}}
>
> Ask them to tell you when they have saved the change. Registrars usually
> apply it within minutes; some take up to 48 hours.

If the person must keep their current DNS host (for example the website's
records cannot move), the alternative is to leave the nameservers alone and add
Kuju's four mail records where the DNS lives today. The Kuju domain wizard
offers this as the "external DNS" choice and shows the exact records; Step 5
verifies either path the same way.

## Step 4 - Wait for the delegation to be visible

Re-run Step 1 every 15 minutes:

    dig NS <domain> +short
    dig NS <domain> +short @1.1.1.1
    dig NS <domain> +short @8.8.8.8

| Observation | Next |
| --- | --- |
| all three answers end in `.kuju.email.` | Step 5 |
| some answers are old, some new | propagation in progress - wait 15 minutes and repeat |
| unchanged after 2 hours | **HUMAN ACTION** - ask the person to open the registrar panel and confirm the change was saved (a common miss is a "confirm" email from the registrar that was never clicked) |
| unchanged after 48 hours | **HUMAN ACTION** - the registrar has not applied it; the person needs to contact the registrar's support |

## Step 5 - Verify the mail records

Once the nameservers point at Kuju, Kuju publishes the mail records itself.
Check each one:

    dig MX <domain> +short
    dig TXT <domain> +short
    dig TXT _dmarc.<domain> +short

| Record | Expected | If missing | If present but does not match |
| --- | --- | --- | --- |
| MX | exactly `{{fact:mx.priority}} {{fact:mx.target}}.` | wait 15 minutes and re-check; Kuju creates it when the domain is provisioned | MISMATCH - report the value seen; a second MX from the old provider means Step 3's item 2 was not followed and mail may still be routing to the old host |
| SPF (TXT at the domain) | a record equal to `{{fact:customer_domain_records.spf}}` | same | MISMATCH - report the value(s) seen; more than one SPF TXT record (old provider's plus Kuju's) makes SPF fail outright, not just look wrong |
| DMARC (TXT at `_dmarc.<domain>`) | a record starting with `v=DMARC1` (Kuju's default is `{{fact:customer_domain_records.dmarc}}`) | same | MISMATCH - report the value seen |

DKIM uses a selector that Kuju rotates, so its name is not fixed:

> **HUMAN ACTION** - ask the person to open the domain in the Kuju admin, find
> the DNS section, and read you the DKIM selector shown there (it looks like
> `mail-20260901`).

Then:

    dig TXT <selector>._domainkey.<domain> +short

| Observation | Next |
| --- | --- |
| a record containing `v=DKIM1` | DKIM is published |
| empty | wait 15 minutes; if still empty, **HUMAN ACTION** - ask the person to press "re-check DNS" on the same admin page, then re-run |
| non-empty but does not contain `v=DKIM1` | MISMATCH - confirm the selector spelling with the person and re-run once; if it still does not match, report it as MISMATCH rather than PASS or MISSING |

If any record is still missing after two re-checks, stop here and use the
delivery troubleshooting runbook.

## Step 6 - Report

Tell the person, in this order: which registrar you identified, what they
changed, the three `dig NS` answers from Step 4, and the four verification
results from Step 5 (each one PASS, MISSING, or MISMATCH, with the value
observed). Do not summarise a MISSING or a MISMATCH as "done" — MISMATCH means
a record exists but is wrong, which is not the same as working.
