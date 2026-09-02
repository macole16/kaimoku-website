---
slug: signup-trial
title: Redeem a Kuju Email invite
order: 2
preconditions:
  - the customer has received an invite from a Kuju Site Admin (an email containing a link and a code)
  - you can run curl
outcome: "The invite is redeemed, the customer has chosen a demo-domain mailbox or bring-your-own-domain, and you know which runbook comes next"
facts_used: [signup_url]
---

# Redeem a Kuju Email invite

You are an agent helping a person redeem a Kuju Email invite and start using
it. Kuju Email is in an invite-only beta: there is no public signup, and a
Kuju Site Admin issues an invite to a named person only. If the person has no
invite, stop after Step 1. Never invent a value you did not observe. Every
command here is read-only.

Steps marked **HUMAN ACTION** are things you cannot do — for example opening
the invite email, clicking the redemption link or typing the code, entering a
password, contacting the Site Admin who sent the invite, or answering a
question only they can answer (such as which domain they own). Give the
person exact instructions, then wait for them to confirm.

## Step 1 - Find the invite

> **HUMAN ACTION** - ask the person to open the invite email — it carries
> one secret, rendered two ways: a clickable link, and the same token as a
> human-typeable code that looks like `KUJU-7F3K-9QM2`. They are not two
> different invites - either one redeems it, and using one does not
> invalidate the other until the invite is used or expires.

| Observation | Next |
| --- | --- |
| the person has the email with a link | Step 2, using the link |
| the person has only the code (for example read out over the phone) | Step 2, using the code |
| the person has neither | there is nothing to redeem; **HUMAN ACTION** - tell them to ask whoever offered them access to have a Kuju Site Admin send an invite, then stop |
| the link says the invite is expired or already used | **HUMAN ACTION** - ask the Site Admin to re-send it; a re-send issues a fresh secret |

Never ask the person to paste the link or the code to you. You do not need it.

## Step 2 - Check the redemption page is open

Before sending the person to the page, observe whether it is accepting invites:

    curl -sI {{fact:signup_url.value}}

Read the first line (the status) and the `location:` header if present.

| Observation | Meaning | Next |
| --- | --- | --- |
| `HTTP/2 200` (or `HTTP/1.1 200`) | the page is open | Step 3 |
| `303` or `302` with `location:` ending in `/login` | the beta gate is not open yet on this server; invites cannot be redeemed today | **HUMAN ACTION** - tell the person to reply to whoever sent the invite and ask when redemption opens; stop |
| connection error or `5xx` | the service is unreachable right now | wait 15 minutes and re-run; if it is still failing, **HUMAN ACTION** - report it to whoever sent the invite |

## Step 3 - Redeem

> **HUMAN ACTION** - the person clicks the link, or opens
> `{{fact:signup_url.value}}` and types the code. They set their own name and
> password there. You cannot do this for them and must not see the password.
> Ask them to tell you when they reach the choice screen described in Step 4.

## Step 4 - Choose the path

After redemption Kuju asks how the person wants to use the beta. Both paths
are real and both are worth exercising; help them choose by asking one
question:

> **HUMAN ACTION** - ask: "Do you own a domain you want to receive mail on
> right now, or do you want to try Kuju first?"

| Answer | Choice on screen | What it gives them | Next |
| --- | --- | --- | --- |
| "try it first" | a mailbox on the demo domain | an address ending in Kuju's demo domain, working immediately, nothing to configure | [migration](/kuju-email/agent/migration.md) if they want their old mail in it; otherwise done |
| "my own domain" | **bring your own domain** | Kuju's domain wizard: enter the domain, pick a DNS strategy, verify | [dns-delegation](/kuju-email/agent/dns-delegation.md) |

The choice is not final: a demo-domain tester can add their own domain later.

## Step 5 - What not to say

The invite does not carry a plan or a price, and you must not infer one. If
the person asks which plan they are on, what it will cost, or how long their
access lasts, tell them: the invite grants beta access; plan, pricing and
terms are settled separately with Kaimoku, and whoever sent the invite is the
one to ask. Do not guess an answer from anything you have seen elsewhere.

## Step 6 - Report

Tell the person: whether the redemption page was open (Step 2 status), which
path they chose, and the name of the next runbook.
