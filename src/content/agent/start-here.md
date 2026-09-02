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
   commands that write, log in, or change anything on any system.
2. **Branch on observations, not on guesses.** Every step has a table of what
   you might observe and what to do next. If your observation is not in the
   table, stop and tell the person exactly what you saw.
3. **`<angle brackets>` are yours to fill in at run time** - `<domain>` is the
   person's domain, `<selector>` is a value they read to you. Values with no
   brackets are real and current; do not "correct" them.
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
| `dig` is missing | use `nslookup -type=<record> <name>` wherever a runbook shows `dig <record> <name>`; the observations are the same |
| `curl` or `openssl` is missing | tell the person which command is missing; read them the step's command and ask them to run it and report back what it printed |

## Which runbook

| The person wants to | Open |
| --- | --- |
| redeem an invite they received (Kuju is invite-only during the beta) | [Redeem a Kuju Email invite](/kuju-email/agent/signup-trial.md) |
| point their own domain at Kuju | [Delegate your domain's DNS to Kuju](/kuju-email/agent/dns-delegation.md) |
| bring their existing mail across from another provider | [Move an existing mailbox into Kuju](/kuju-email/agent/migration.md) |
| find out why mail is not arriving, bounces, or lands in spam | [Troubleshoot mail delivery for a Kuju domain](/kuju-email/agent/troubleshooting-delivery.md) |

Reference, when a term is unfamiliar: the [glossary](/kuju-email/glossary.md).
The [API reference](/kuju-email/docs.md) exists for completeness; no runbook
needs it and you should not call the API.

## Where these files come from

Every runbook is generated from a single source of facts at build time, so
the values you see reflect the latest deploy. If a value in a runbook
disagrees with what you observe, trust your observation, tell the person,
and continue with the runbook's "if not" branch.
