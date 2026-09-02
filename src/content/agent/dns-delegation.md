---
slug: dns-delegation
title: Set up your domain's DNS for Kuju
order: 3
preconditions:
  - the customer owns a domain and can log in to wherever it is registered
  - the customer has an active Kuju account (see signup-trial)
  - you can run dig (or nslookup)
outcome: "Mail for the domain reaches Kuju — by delegating the nameservers, or by adding Kuju's records at the existing DNS host — and MX, SPF, DKIM and DMARC verify"
facts_used: [nameservers, mx, customer_domain_records, registrars]
---

# Set up your domain's DNS for Kuju

You are an agent helping a person set up Kuju Email for `<domain>`: either by
moving the domain's DNS to Kuju, or by adding Kuju's mail records to the DNS
host they already use. Replace `<domain>` with the customer's domain everywhere
below (for example `example.com`). Never invent a value you did not observe.
Every command here is read-only.

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
| every NS answer ends in `.kuju.email.` | Step 5 - already delegated, so Kuju publishes the mail records; verify only |
| NS answers present, any other host | Step 2 |
| `status: SERVFAIL`, `status: REFUSED`, or no response (timeout) | retry the lookup once; if it still fails, stop and tell the person the lookup itself is failing — do not guess a registrar from absent data |

If `dig` is not installed, `nslookup -type=NS <domain>` gives the same answer:
"can't find" is NXDOMAIN, an empty result is 1b, otherwise read the `nameserver =`
lines.

Write the NS answers down. They name the host that answers for this domain right
now, which Step 3b needs in order to query it directly, and Step 6 reports them
on every path.

### Step 1a - The name does not exist

> **HUMAN ACTION** - the domain is not registered, or was typed wrong. Ask the
> person to confirm the spelling. If it is correct, they need to register the
> domain first; come back to Step 1 afterwards.

### Step 1b - A subdomain hosted inside its parent zone

`<domain>` is a subdomain (such as `mail.example.com`) whose records live in the
parent domain's DNS (`example.com` in that example). **Do not follow Step 3a's
script on this path.** "Set custom nameservers" is a registrar-level control
that replaces the PARENT domain's own top-level NS records — applying it here
would delegate all of `example.com`, not just the subdomain, and would very
likely take the parent domain's entire DNS offline. That is worse than the
delegation never happening, so treat this branch as its own procedure:

1. Repeat Step 1 with the parent domain to see who hosts ITS DNS.
2. Identify that host with Step 2's substring table — matching logic only; this
   path does not continue to Step 3.
3. Then use this script:

> **HUMAN ACTION** - you cannot do this step. Give the person:
>
> 1. The instruction to add `<domain>` in the Kuju admin, choose **Use Kuju
>    DNS**, and provision it. The choice matters: the wizard's other option is
>    pre-selected, and picking it would leave Kuju with no zone for the
>    subdomain, so the delegation below could never work.
> 2. The DNS panel link or host name from Step 2 (or the nameserver hostnames
>    you observed if no key matched).
> 3. The instruction to open the parent zone's DNS RECORDS section — not the
>    "nameservers" / "custom nameservers" setting, which controls the parent
>    domain's own top-level NS and must be left exactly as it is — and add two
>    NS records scoped to the subdomain label only:
>
>    Add NS records for `<domain>` pointing at:
>      {{fact:nameservers.0}}
>      {{fact:nameservers.1}}
>
>    Most panels want just the label (`mail`), not the full `mail.example.com`,
>    and both records must be saved, not one.
> 4. An explicit statement, in your own words: this delegates only `<domain>`;
>    the parent domain's own nameserver setting must not change.
>
> Ask them to tell you when they have saved the change.

Continue at Step 4, running the same `dig NS <domain>` checks against the
subdomain and using its "from Step 1b" row.

## Step 2 - Identify the registrar or DNS host

Take the FIRST line of the NS answers from Step 1. Lowercase it and strip the
trailing dot. Then test whether that hostname CONTAINS each key in the table
below - a substring test, not a suffix test. Two of the biggest providers put
their key in the MIDDLE of the name:

    ns-1234.awsdns-56.org      contains "awsdns"     -> AWS Route 53
    ns1-08.azure-dns.com       contains "azure-dns"  -> Microsoft Azure
    dns1.registrar-servers.com contains "registrar-servers.com" -> Namecheap

{{fact:registrars.table}}

This step finds out WHERE the person will be working. It does not decide what
they change there. Every row below continues to Step 3; they differ only in what
you carry with you.

| Observation | Carry into Step 3 |
| --- | --- |
| exactly one key matches and it has a panel link | that link, with `<domain>` filled in |
| the key matches but the row says "no panel link" | the host's NAME; the person will have to find the right screen there themselves |
| no key matches | the nameserver hostnames you saw |

## Step 3 - Choose how the domain will use Kuju

There are two ways to finish this, and the choice belongs to the person, not to
you. Kuju's domain wizard asks the same question — "Use Kuju DNS" or "Keep your
current DNS" — so whatever they answer here is what they must pick there too.

Two facts you will need on either path:

- **An SPF record is a TXT record whose value begins `v=spf1`.** Every other TXT
  record a domain carries — `google-site-verification=`, `MS=`, and anything
  else — is not a mail record and is none of Kuju's business.
- **Kuju's MX and SPF records REPLACE the old provider's; they never join
  them.** A second MX record means mail can keep flowing to the old host — and
  if the old MX has a lower preference number than Kuju's
  `{{fact:mx.priority}}`, essentially all of it will. A second `v=spf1` record
  makes SPF fail outright for every message, a PermError per RFC 7208, so
  neither record is used.

> **HUMAN ACTION** - you cannot choose for them. Ask: "Do you want Kuju to run
> all of this domain's DNS, or do you want to keep your current DNS host and
> just add Kuju's mail records to it?" Give them both consequences before they
> answer:
>
> - **Kuju runs all DNS.** Nothing to maintain afterwards; Kuju publishes the
>   mail records and keeps them correct. But every record the domain has today —
>   website, subdomains, domain-verification strings, anything — has to be
>   recreated on Kuju's side or it stops resolving.
> - **Keep the current DNS host.** Nothing else about the domain moves. But they
>   own the four mail records, and they have to add the new DKIM record by hand
>   each time Kuju rotates the key.

| Answer | Next |
| --- | --- |
| Kuju runs all DNS ("Use Kuju DNS" in the wizard) | Step 3a |
| keep the current DNS host ("Keep your current DNS" in the wizard) | Step 3b |

### Step 3a - Move all DNS to Kuju

Collect what exists now, so the person can recreate it on Kuju's side:

    dig A <domain> +short
    dig AAAA <domain> +short
    dig A www.<domain> +short
    dig CNAME www.<domain> +short
    dig MX <domain> +short
    dig TXT <domain> +short

Keep every non-empty answer; Step 6 reports them. When `www` is a CNAME, the `A`
query prints the CNAME target as well as the addresses — the separate `CNAME`
query tells you which value that is. Then:

> **HUMAN ACTION** - you cannot do this step. Give the person:
>
> 1. The instruction to add the domain in the Kuju admin, choose **Use Kuju
>    DNS**, and provision it. This has to happen BEFORE the nameservers change,
>    so that Kuju's nameservers have a zone to answer for, and the choice
>    matters: the wizard's other option is pre-selected.
> 2. The DNS panel link or host name you carried from Step 2 (or the nameserver
>    hostnames you observed in Step 1, if no key matched — that is the only
>    identifying information you have).
> 3. The captured A, AAAA and CNAME lines, plus any TXT line that does NOT begin
>    `v=spf1`, with the instruction to add them in Kuju's domain DNS page after
>    delegation. Do NOT forward the captured MX line or any `v=spf1` TXT line:
>    Kuju publishes its own mail records once delegated, and re-adding the old
>    values alongside them is the failure described in Step 3. Hold those two
>    values for your Step 6 report instead.
> 4. The exact two nameservers to set, replacing whatever is there now:
>
>    Set custom nameservers to:
>      {{fact:nameservers.0}}
>      {{fact:nameservers.1}}
>
> 5. A warning to watch for a "confirm this change" email from the registrar and
>    click it. An unclicked confirmation is the single most common reason a
>    correctly-entered nameserver change never takes effect.
>
> Ask them to tell you when they have saved the change. Registrars usually
> apply it within minutes; some take up to 48 hours.

Continue at Step 4.

### Step 3b - Keep the current DNS host and add Kuju's records

Nothing moves. The nameservers stay exactly as Step 1 found them, and the person
adds Kuju's four mail records where their DNS already lives.

First, find out whether the domain already publishes mail records that would
collide with Kuju's:

    dig MX <domain> +short
    dig TXT <domain> +short

| Observation | Next |
| --- | --- |
| MX is already `{{fact:mx.priority}} {{fact:mx.target}}.` AND a `v=spf1` record equal to `{{fact:customer_domain_records.spf}}` is present | someone has done this before. Do not remove anything - go to the HUMAN ACTION below, give item 1 ONLY, and then continue at Step 5 |
| anything else | the full HUMAN ACTION below |

Carry any MX record, and any TXT record beginning `v=spf1`, into item 3 of that
block — those are what must be replaced. Leave every other TXT record alone.

Item 1 is never skipped, even when the records already look right: Kuju's MX and
SPF values are the same for every customer, so seeing them proves only that
somebody added them, not that this domain exists in Kuju. Without provisioning,
there is no DKIM record to add and no record table to check against.

> **HUMAN ACTION** - you cannot do this step. Give the person:
>
> 1. The instruction to add the domain in the Kuju admin, choose **Keep your
>    current DNS**, and provision it. Kuju then shows a table of the exact
>    records to add — Type, Name and Value — and does not touch their DNS
>    itself. If the domain is already there, they do not add it again: ask them
>    to confirm it is provisioned and that "Keep your current DNS" is the
>    option selected, then read the record table from its DNS page.
> 2. The DNS panel link or host name you carried from Step 2, and the
>    instruction to add every row of that table there: an MX at the domain, an
>    SPF TXT at the domain, a DKIM TXT at a `._domainkey` name, and a DMARC TXT
>    at `_dmarc.<domain>`. Two things to tell them about the values. Copy them
>    from Kuju's table rather than retyping — the DKIM value is unique to their
>    domain and the DMARC value contains it. And Kuju displays the TXT values
>    wrapped in quotation marks: those quotes show where the value starts and
>    ends and are not part of it, so if their panel does not already show quotes
>    around its other TXT records, paste the value without them.
> 3. Any MX or `v=spf1` TXT records you identified above, quoted back to them
>    exactly, with the instruction to remove those — and only those — in the
>    same edit.
> 4. An explicit statement, in your own words: the nameservers must not change.
>
> If the table shows no DKIM row at all, stop and report that rather than
> improvising one. Otherwise, ask them to tell you when they have saved the
> records.

Continue at **Step 5**; on this path the person publishes the records, not Kuju.
Skip Step 4 — it waits for a nameserver change, and there is none here.

## Step 4 - Wait for the delegation to be visible

Only Step 3a and Step 1b arrive here.

Before waiting on anything, confirm Kuju actually has a zone for the domain.
This costs one lookup and can save two hours:

    dig MX <domain> @{{fact:nameservers.0}}

`status: NOERROR` with an ANSWER SECTION means the zone exists and the
delegation will work once it propagates. `status: REFUSED` means it does not —
go straight to Step 4c. Anything else — a timeout, `status: SERVFAIL`, or
NOERROR with no ANSWER SECTION — tells you nothing either way: do not send
anyone to Step 4c on it. Carry on with the poll below, and if the delegation
never appears, come back and try this check again.

Then re-run Step 1 every 15 minutes:

    dig NS <domain> +short
    dig NS <domain> +short @1.1.1.1
    dig NS <domain> +short @8.8.8.8

| Observation | Next |
| --- | --- |
| all three answers end in `.kuju.email.` | Step 5 - Kuju publishes the mail records |
| some answers are old, some new, or some empty | propagation in progress - wait 15 minutes and repeat |
| all three are empty, or `dig NS <domain>` shows `status: SERVFAIL` | Step 4c |
| unchanged after 2 hours, from Step 3a | Step 4a |
| unchanged after 2 hours, from Step 1b | Step 4b |
| unchanged after 48 hours | Step 4d |

### Step 4a - The registrar has not applied it yet (from Step 3a)

> **HUMAN ACTION** - ask the person to reopen the registrar's nameserver setting
> for the domain and read back the two values saved there. Then ask them to
> search their email, including spam, for a "confirm this change" message from
> the registrar: an unclicked confirmation is the commonest cause, and the
> change will never apply without it. Then re-run this step.

### Step 4b - The parent zone's records need checking (from Step 1b)

> **HUMAN ACTION** - ask the person to reopen the PARENT zone's DNS records
> section and read back both NS records they added. Two things to confirm: the
> name should be only the subdomain label, such as `mail`, and not the full
> `mail.example.com`; and there should be two records, not one. The parent
> domain's own nameserver setting is correct as it is and should not be touched.
> Then re-run this step.

### Step 4c - The nameservers moved but Kuju has no zone

The domain was never provisioned in Kuju, or was provisioned with the wrong
choice, so Kuju's nameservers refuse to answer for it and the delegation cannot
resolve. This is not a registrar problem and the registrar cannot fix it.

> **HUMAN ACTION** - ask the person to open the domain in the Kuju admin and
> provision it with **Use Kuju DNS**. If it is already there, ask them to
> confirm which DNS option is selected; "Keep your current DNS" is the one that
> produces this. Then re-run this step.

### Step 4d - Still unchanged after 48 hours

> **HUMAN ACTION** - the change is not being applied, and the person needs
> support from the host you identified in Step 2: the registrar if they came
> from Step 3a, or whoever hosts the parent zone's DNS if they came from
> Step 1b — which is often not the registrar.

## Step 5 - Verify the mail records

Two cases, and they differ in what a missing record means:

- **Kuju publishes the records** — the domain is delegated to Kuju, whether by
  Step 3a, by Step 1b, or before this conversation started. A missing record can
  still be on its way.
- **The person publishes them** — Step 3b. Their DNS host still needs a few
  minutes, and your own earlier lookup may have cached a "not there" answer, so
  one re-check is still right; after that, something was not saved as shown.

Check each one:

    dig MX <domain> +short
    dig TXT <domain> +short
    dig TXT _dmarc.<domain> +short

| Record | Expected | If missing | If present but does not match |
| --- | --- | --- | --- |
| MX | exactly `{{fact:mx.priority}} {{fact:mx.target}}.` | see "If a record is missing" below | MISMATCH - report the value seen; a second MX means the old provider's record is still published and mail may still route there |
| SPF (TXT at the domain) | a record equal to `{{fact:customer_domain_records.spf}}` | same | MISMATCH - report every `v=spf1` value seen; two of them is an outright failure, not a cosmetic mismatch (see Step 3) |
| DMARC (TXT at `_dmarc.<domain>`) | a record starting with `v=DMARC1` (Kuju's default is `{{fact:customer_domain_records.dmarc}}`) | same | MISMATCH - report the value seen |

`dig +short` prints a TXT value wrapped in quotation marks. Those quotes are how
DNS represents the value, not part of it, and most control panels add them for
you — so a value that looks unquoted in the person's panel and quoted in `dig`
is the same value, and correct. Never ask anyone to add quotation marks to make
the two look alike; that changes the record and, for SPF, stops it beginning
`v=spf1` at all. A value that appears DOUBLY quoted in `dig` output is the one
to report — that is a literal quote saved inside the value.

### DKIM

DKIM's record name contains a selector that Kuju rotates, so it is not fixed. A
newly provisioned domain uses `default`. Try that before asking anyone:

    dig TXT default._domainkey.<domain> +short

If that returns a record containing `v=DKIM1`, the selector is `default` and
DKIM is published — no need to ask. One exception: if the domain has been live
for more than a month it may have rotated, and where the person publishes their
own records the old `default` record is never removed, so it can still answer.
On a domain that old, confirm the selector below rather than trusting this
probe. Otherwise:

> **HUMAN ACTION** - ask the person to open the domain in the Kuju admin, find
> the DNS section, and read you the DKIM selector shown there (after a rotation
> it looks like `mail-20260901`). On a domain that keeps its own DNS host, that
> screen also shows a "Nameservers Not Pointed at Kuju" notice and says DNS is
> externally managed. Tell them before they read it out that this is expected on
> their setup and is not a fault.

    dig TXT <selector>._domainkey.<domain> +short

| Observation | Next |
| --- | --- |
| a record containing `v=DKIM1` | DKIM is published - Step 6 |
| empty | see "If a record is missing" below, using the name `<selector>._domainkey.<domain>` |
| non-empty but does not contain `v=DKIM1` | MISMATCH - confirm the selector spelling with the person and re-run once; if it still does not match, report it as MISMATCH rather than PASS or MISSING |

If the person publishes their own records, tell them one more thing before you
finish. Kuju rotates the DKIM key periodically, and because it does not control
their DNS it cannot publish the new record for them. When that happens they must
copy the new record out of the Kuju admin into their DNS. Nothing breaks while
they wait: Kuju only switches to the new key once it can see the new record
published, so until then it keeps signing with the old one and the rotation
simply does not complete. Where Kuju publishes the records, this happens by
itself.

### If a record is missing

**Where Kuju publishes the records:** wait 15 minutes and re-check — Kuju
creates them when the domain is provisioned. If it is still missing,
**HUMAN ACTION** - ask the person to open the domain's DNS page in the Kuju
admin and press "re-check DNS", then re-run. If the record is still absent, that
button only re-reads what is published — ask them to press **Auto-Configure Mail
Records** on the same page, which republishes the records themselves.

**Where the person publishes them (Step 3b):** rule out a cached answer first. A
lookup made before the record existed can be remembered by the resolver for an
hour or more, so ask the domain's own nameservers directly. Use the NS hostnames
from Step 1 — ask EACH of them, and do not add `+short`, because you need the
header.

This check needs `dig`, and it is the one place in this runbook where
`nslookup` is not a substitute: it takes the server as a trailing argument
rather than `@server`, and prints no `status:` line, so the table below cannot
be read through it. With only `nslookup`, do not conclude anything is missing —
report the record UNVERIFIED and give the person the `dig` command to run.

    dig MX <domain> @<nameserver from Step 1>
    dig TXT <domain> @<nameserver from Step 1>
    dig TXT _dmarc.<domain> @<nameserver from Step 1>
    dig TXT <selector>._domainkey.<domain> @<nameserver from Step 1>

Read the `status:` line and the ANSWER SECTION, exactly as in Step 1:

| Observation | Meaning |
| --- | --- |
| `status: NOERROR` and the record is in the ANSWER SECTION | the record IS published and only your resolver's cache is stale - report it as PASS, and tell the person it will be visible everywhere shortly |
| `status: NOERROR` with no ANSWER SECTION, or `status: NXDOMAIN`, on every nameserver you asked | the record is genuinely not there - continue below. (A missing record at the domain itself, MX or SPF, answers NOERROR; a missing `_dmarc` or `._domainkey` name answers NXDOMAIN. Both mean absent) |
| the nameservers disagree with each other | the change is still publishing across their provider - wait 15 minutes and ask again |
| `status: REFUSED`, `status: SERVFAIL`, or `connection timed out` | this tells you NOTHING about the record - the server would not answer you. Do not treat it as missing; wait and re-check, or ask a different nameserver from Step 1 |

> **HUMAN ACTION** - only when every nameserver answered and none had the
> record: ask the person to open the record table in the Kuju admin next to
> their DNS panel and compare the missing row's Name against what they saved.
> The usual cause is a panel that appends the domain for you, so
> `_dmarc.<domain>` ends up saved as `_dmarc.<domain>.<domain>`. Then re-run the
> check above.

Once the record you came here for is resolved, go back to the check that sent
you: if that was the MX, SPF or DMARC table, DKIM above it has not been done yet.

If a record is still missing after two re-checks, stop here and use the
[delivery troubleshooting runbook](/kuju-email/agent/troubleshooting-delivery.md).
That does not apply to a record the nameservers confirmed above: one that is
published but not yet visible to your resolver is correct, and reporting it as a
problem would send the person chasing something that is already right.

## Step 6 - Report

Tell the person, in this order:

1. Which path they took: Step 3a, Step 3b, Step 1b, or "already delegated before
   we started" if Step 1 sent you straight to Step 5.
2. Which registrar or DNS host you identified.
3. What they changed.
4. The `dig NS` answers you have: the three from Step 4, or — where Step 4 was
   not run — the ones from Step 1.
5. The four verification results from Step 5, each one PASS, MISSING or
   MISMATCH, with the value observed, and the DKIM selector you used.

Where a line does not apply on the path taken, say so explicitly rather than
leaving it out: Step 2 and Step 4 are not run on the already-delegated path, and
Step 4 is not run on Step 3b. Do not summarise a MISSING or a MISMATCH as "done"
— MISMATCH means a record exists but is wrong, which is not the same as working.

Then, if anything changed, report what you saw beforehand. You cannot observe it
again once it is gone:

- **From Step 3a** - the nameservers from Step 1, and the MX and TXT answers you
  captured. Undoing the delegation is normally just setting those nameservers
  back: the previous DNS host usually still holds the zone, so its records
  return with it. What you captured is what rebuilds it if that zone has since
  been deleted, and it is also the checklist of A, AAAA, CNAME and non-SPF TXT
  records that still have to be recreated on Kuju's side.
- **From Step 3b** - any MX or `v=spf1` records you had the person remove,
  quoted exactly. Those are gone from their DNS now, and your report is the only
  copy.
- **From Step 1b** - the two NS records added to the parent zone, and the parent
  zone's own nameservers from Step 1. Undoing this means removing those two
  records; nothing else in the parent zone was touched.
