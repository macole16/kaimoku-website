---
slug: migration
title: Move an existing mailbox into Kuju
order: 4
preconditions:
  - the customer has an active Kuju mailbox (demo domain or their own domain)
  - the customer knows the OLD provider and can sign in to it
  - you can run dig and openssl
outcome: "The old mailbox is imported into Kuju with folders, flags and dates intact, and the customer understands what the test cap means"
facts_used: [test_migration_cap_gb, mx]
---

# Move an existing mailbox into Kuju

You are an agent helping a person move mail from an existing mailbox into
Kuju Email. Replace `<old-domain>` with the domain of the mailbox being moved
everywhere below (for example `gmail.com` or the customer's own domain).
Never invent a value you did not observe. Every command here is read-only.

**You never handle credentials.** The import runs inside Kuju; the person
types the old provider's password into Kuju's import form themselves. If they
offer you the password, decline and tell them where to enter it.

Steps marked **HUMAN ACTION** are things you cannot do — for example signing
in to the old provider or to Kuju's import page, entering a password, reading
a value from the Kuju admin screen, or checking their own mailbox. Give the
person exact instructions, then wait for them to confirm.

## Step 1 - Identify the source provider

> **HUMAN ACTION** - ask: "Where is the old mailbox - Gmail, Outlook/Microsoft
> 365, Fastmail, or something else?"

| Answer | IMAP server to use in the import form | What the person must prepare first |
| --- | --- | --- |
| Gmail / Google Workspace | `imap.gmail.com`, port 993 | an App Password (Google account > Security > 2-Step Verification > App passwords); their normal password will not work |
| Outlook.com / Microsoft 365 | `outlook.office365.com`, port 993 | their normal password, or an app password if the account uses two-step sign-in |
| Fastmail | `imap.fastmail.com`, port 993 | an App Password (Settings > Privacy & Security > Integrations) |
| iCloud | `imap.mail.me.com`, port 993 | an app-specific password (appleid.apple.com) |
| something else | Step 1a | their normal mailbox password |

### Step 1a - Discover the IMAP server for another provider

    dig SRV _imaps._tcp.<old-domain> +short
    dig MX <old-domain> +short

| Observation | Next |
| --- | --- |
| the SRV answer names a host (the last field, e.g. `imap.example.net.`) | use that host, port 993 |
| SRV empty, MX names a host | the IMAP server is usually `imap.` or `mail.` at the same provider as the MX host; try both in Step 2 |
| both empty | **HUMAN ACTION** - the person must look up "IMAP settings" in the old provider's help pages |

## Step 2 - Confirm the server is reachable (no login)

    openssl s_client -connect <imap-host>:993 -brief </dev/null

| Observation | Next |
| --- | --- |
| a line starting `* OK` | reachable; Step 3 |
| `Connection refused` or `timed out` | wrong host or port; back to Step 1 |
| a certificate error naming a different host | wrong host; back to Step 1 |

## Step 3 - Estimate the size before anything moves

Kuju's import page can measure the old mailbox without transferring any mail:
it asks the IMAP server for each message's size (`RFC822.SIZE`, metadata only)
and adds them up. A 20 GB mailbox costs a few hundred kilobytes to measure.

> **HUMAN ACTION** - ask the person to open the import page in Kuju, enter the
> server from Step 1 and their credentials, and run the size estimate. Ask them
> to read you the total and, if shown, the date of the oldest message.

Two things to tell the person about the number:

- **Gmail double-counts.** Labels are virtual folders, so a message with three
  labels appears in three folders. An estimate that sums every folder overstates
  a heavily-labelled account 2-3x. The accurate figure is `[Gmail]/All Mail`
  alone; if the estimate lists folders, use that folder's size.
- **It is wire size, not disk size.** The figure is what the old server will
  send, not what it occupies on disk; the two differ by index overhead and
  compression. Treat it as an estimate, not an invoice.

Trash and Spam usually hold real bytes nobody wants. Ask whether to exclude
them; the default is to leave them out.

## Step 4 - Explain the test cap in time, not bytes

During the closed beta a test migration imports at most
**{{fact:test_migration_cap_gb}} GB per account**. Kuju imports newest-first, so
the imported slice is the person's RECENT mail - the mail they actually use.
Describe the cap using the estimate from Step 3, like this:

    Your mailbox is 18 GB. The test brings your most recent {{fact:test_migration_cap_gb}} GB -
    roughly your last 5 months. Nothing older is lost; it stays where it is
    and comes across when the account converts.

Work the months out from the estimate: if the mailbox spans M months and holds
E GB, the cap covers about `M x {{fact:test_migration_cap_gb}} / E` months of the
newest mail.

**Reaching the cap is a PAUSE. It is not an error and it is not a restart.**
The import records where it stopped (the folder and the last message id),
remembers how many bytes it brought across, and skips anything already imported
if it is run again. When the person converts to a paying account, the SAME job
resumes from that point; nothing is re-imported and nothing is duplicated.
If the person asks "did it fail?", the answer is no.

## Step 5 - Start the import

> **HUMAN ACTION** - the person starts the import from the same page. Ask them
> to tell you the status shown, and to check it again after a few minutes.

| Status shown | Meaning | Next |
| --- | --- | --- |
| running | mail is arriving, newest first | wait; check again in 10 minutes |
| paused, mentioning the cap or the beta | the {{fact:test_migration_cap_gb}} GB test slice is complete | Step 6 - this is the expected end state for a test |
| paused, any other reason | the old provider disconnected (rate limiting is common) | the person presses resume; the import continues from its checkpoint |
| failed, mentioning login or authentication | wrong credentials or a missing app password | back to Step 1's third column |
| completed | everything came across (the mailbox was under the cap) | Step 6 |

## Step 6 - Verify what arrived

> **HUMAN ACTION** - ask the person to open their Kuju mailbox and confirm:
> the newest messages are present, folders match the old layout, read/unread
> flags survived, and dates are the original dates (not today's).

If something is missing, running the import again is safe: duplicates are
detected and skipped, so a re-run only adds what is absent.

## Step 7 - Remind them what has NOT changed

Importing copies mail; it does not redirect it. New mail keeps arriving at the
old provider until the domain's MX record points at Kuju
(`{{fact:mx.priority}} {{fact:mx.target}}.`). For a demo-domain mailbox that is
expected. For their own domain, the next runbook is
[dns-delegation](/kuju-email/agent/dns-delegation.md).
