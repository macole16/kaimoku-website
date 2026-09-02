# kaimoku-website facts check — systemd units for `build`

Canonical source for the Tier 2 scheduled reality check (spec section 4). The
unit files here are what a from-scratch rebuild of `build` reinstalls;
`/etc/systemd/system` is not version-controlled. Precedent: `kuju-mail/deploy/systemd/`
(`kuju-cert-sync`, recorded in SERVICES.md).

What it does, daily: `git pull` a public clone at `/opt/kaimoku-website`, run
`scripts/check-facts-live.mjs --self-test --ntfy`, which (1) runs five mutants
that MUST fail, (2) checks every `verify:` block in `src/data/mail-facts.yaml`
against live DNS/HTTPS, (3) posts findings to ntfy topic `alerts` and a
heartbeat to `kaimoku-website-facts`. Exit 0 = clean, 1 = findings, 2 = the
checker could not fail its own mutants (no heartbeat is sent on 2).

Tier 1 (the `prebuild` gate) is offline and structural — it cannot tell you a
fact is still TRUE. Tier 3 (the mutants) exists because a checker that has
silently stopped checking reports green forever; the mutants are what make
`SELF-TEST OK` mean something.

## Install (from the laptop; run each line and read its output)

    ssh build 'sudo install -d -o macole -g macole /opt/kaimoku-website'
    ssh build 'git clone --quiet https://github.com/macole16/kaimoku-website.git /opt/kaimoku-website'
    ssh build 'cd /opt/kaimoku-website && npm install --omit=dev --ignore-scripts --no-audit --no-fund'
    ssh build 'sudo cp /opt/kaimoku-website/deploy/systemd/kaimoku-website-facts-check.service /opt/kaimoku-website/deploy/systemd/kaimoku-website-facts-check.timer /etc/systemd/system/'
    ssh build 'sudo systemctl daemon-reload && sudo systemctl enable --now kaimoku-website-facts-check.timer'

`npm install` here is ~150 MB of `node_modules` for one package (`yaml`), because
the checker imports the same core module the site builds from. That is deliberate:
one source of truth for what a fact reference means, rather than a second parser
that could drift from the one the site uses.

## First run (do not wait a day)

    ssh build 'sudo systemctl start kaimoku-website-facts-check.service; systemctl status kaimoku-website-facts-check.service --no-pager | head -n 12'
    ssh build 'journalctl -u kaimoku-website-facts-check.service -n 40 --no-pager -o cat'
    curl -s "https://ntfy.tail3558e0.ts.net/kaimoku-website-facts/json?poll=1&since=1h"

The journal must show `SELF-TEST OK: 5/5 mutants failed as required` before any
report rows; the ntfy poll must return a line titled `kaimoku-website facts check ran`.

## Reading a red run

- `PENDING  signup_url` is expected until `launch-1.5`; it is not a finding.
- `PENDING_NOW_PASSES signup_url` IS a finding: remove `pending: true` from
  `src/data/mail-facts.yaml` and re-word `signup-trial.md` Step 2 in the same commit.
- `SKIP  registrars.name-services.com` is by design (no panel URL upstream).
- `SELF-TEST FAILED` means the checker is broken, not the facts. Fix the checker
  first; nothing it reports until then is evidence.
- A transport failure (DNS timeout, connection refused) currently scores `FAIL`
  with no retry, so a single blip produces a finding. That is known and tracked
  in bd `launch-1.22`; if it proves noisy, fix the alerting semantics rather than
  muting the timer — a muted checker is indistinguishable from a deleted one.

## Update

The unit pulls the checked-out branch on every run, so a merged change to the
checker or the facts is live at the next timer tick. Only a change to the unit
files needs the `cp` + `daemon-reload` lines again.

## Remove

    ssh build 'sudo systemctl disable --now kaimoku-website-facts-check.timer && sudo rm /etc/systemd/system/kaimoku-website-facts-check.{service,timer} && sudo systemctl daemon-reload'
