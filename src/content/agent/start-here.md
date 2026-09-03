---
slug: start-here
title: Start here
order: 1
preconditions: []
outcome: "You know the rules of this corpus, which runbook to open, and what you can and cannot do"
facts_used: []
---

# Start here

You are an agent helping a person set up or run Kuju Email. This corpus is a
set of runbooks written for you, not for them — read this page fully before
opening any other. Never invent a value you did not observe. Every command
anywhere in this corpus is read-only.

## The rules

1. **Only run the commands the runbooks show.** They are all read-only
   (`dig`, `nslookup`, `curl -sI`, `openssl s_client`). Do not improvise
   commands that write, log in, or change anything on any system. A
   4-space-indented block is not always something to run - it can also be
   words to say to the person (a script, for example migration's cap
   explanation) or a template for them to fill in (for example the support
   report). The sentence introducing it says what it is; only a command is
   something you execute.
2. **Branch on observations, not on guesses.** Every step has a table of what
   you might observe and what to do next. If your observation is not in the
   table, stop and tell the person exactly what you saw.
3. **Values come in three kinds.** `<angle brackets>` are yours to fill in at
   run time - `<domain>` is the person's domain, `<selector>` is a value they
   read to you. A value with no brackets is real and current; do not
   "correct" it. A third kind is an illustrative example, always marked
   locally where it appears: an invite that "looks like `KUJU-7F3K-9QM2`", a
   worked nameserver table using `ns-1234.awsdns-56.org`, a DKIM selector that
   "after a rotation... looks like `mail-20260901`", or a migration script
   sized in GB and months. None of these is the person's value - never report
   one as something you observed.
4. **HUMAN ACTION means you cannot do it.** A step tagged **HUMAN ACTION** is
   off-limits to you — for example a registrar login, a control panel, a
   password, or a screen inside Kuju. Give the person precise instructions
   and wait. Never claim you completed a HUMAN ACTION step.
5. **Never handle secrets.** Do not ask for passwords, invite codes or app
   passwords, and decline them if offered.
6. **Report what you observed, not what you concluded.** Paste command output
   when you report; say MISSING when something is missing.

## Before you start

Check which tools you have:

    dig -v
    curl --version
    openssl version

| Observation | Next |
| --- | --- |
| all three print a version | continue |
| `dig` is missing | use `nslookup -type=<record> <name>` wherever a runbook shows `dig <record> <name>`. For NS and MX, read the `nameserver =` / `mail exchanger =` lines when present. `nslookup` prints "can't find" for BOTH an absent name and a present name with no record of that type - never key off that phrase; read what follows the colon instead: `: NXDOMAIN` means the name does not exist, `: No answer` means the name exists but has no record of that type. For TXT and SRV, a present record is prefixed with a `text =` / `service =` label, so compare the value on the right of `=`, not the whole line. The only thing `nslookup` cannot do is a `dig` command that names a server with `@` — the runbook that uses one says what to do instead |
| `curl` or `openssl` is missing | tell the person which command is missing; read them the step's command and ask them to run it and report back what it printed |

## Which runbook

| The person wants to | Open |
| --- | --- |
| redeem an invite they received (Kuju is invite-only during the beta) | [Redeem a Kuju Email invite](/kuju-email/agent/signup-trial.md) |
| point their own domain at Kuju (needs an active Kuju account — [redeem the invite](/kuju-email/agent/signup-trial.md) first) | [Set up your domain's DNS for Kuju](/kuju-email/agent/dns-delegation.md) |
| bring their existing mail across from another provider | [Move an existing mailbox into Kuju](/kuju-email/agent/migration.md) |
| find out why mail is not arriving, bounces, or lands in spam | [Troubleshoot mail delivery for a Kuju domain](/kuju-email/agent/troubleshooting-delivery.md) |
| understand a sending-limit, rate-limit or quota error they hit while sending | [Troubleshoot mail delivery for a Kuju domain](/kuju-email/agent/troubleshooting-delivery.md), section C |

Reference, when a term is unfamiliar: the [glossary](/kuju-email/glossary.md).
The [API reference](/kuju-email/docs.md) exists for completeness; no runbook
needs it and you should not call the API.

## Where these files come from

Every runbook is generated from a single source of facts at build time, so
the values you see reflect the latest deploy. If a value in a runbook
disagrees with what you observe, trust your observation, tell the person,
and continue with the runbook's "if not" branch.
