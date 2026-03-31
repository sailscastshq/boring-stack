---
name: automation-last
description: Deciding what is ready for automation and what should remain manual for now
metadata:
  tags: automation, ai, agents, ci, jobs, scripts, operations
---

# Automation Last

Automation is a multiplier. It multiplies clarity when the workflow is sound, and multiplies confusion when it is not.

## What Is Ready to Automate

A workflow is ready when:

- people can describe the exact trigger
- the inputs are consistent
- the outputs are recognizable
- the manual version has already succeeded repeatedly
- edge cases are known enough to handle or escalate
- somebody owns the failures

If those conditions are missing, automate later.

## Good Automation Targets

Strong candidates:

- running stable test suites in CI
- repeatable setup and scaffolding
- deterministic formatting and linting
- scheduled jobs with clear retries and alerts
- transactional emails tied to well-defined events
- lifecycle messages tied to proven product moments
- support or ops checklists that already exist in human form
- AI assistance on bounded tasks with review points

## Bad Automation Targets

Avoid automating:

- a signup or onboarding flow that is still being redesigned
- a sales workflow you still cannot explain clearly
- a content engine around a message that has not landed yet
- requirements gathering when the problem is still fuzzy
- prompts that produce unstable business logic
- alerting without clear response ownership
- flaky tests
- workflows with unresolved policy or compliance questions

Automating a broken process does not create leverage. It creates a faster failure mode.

## AI and Agent Guidance

AI is still automation. Treat it with the same discipline.

Before delegating to an agent, ask:

- Is the task concrete and bounded?
- Do we know what good output looks like?
- Can a human review the result quickly?
- Will the task still exist next month, or are we automating temporary confusion?

Use AI after the human workflow is legible, not instead of making it legible.

## Boring Stack Examples

Examples that often belong late, not early:

- background jobs with `quest`
- realtime fanout with `realtime`
- aggressive caching layers
- custom generators and codegen
- autonomous content or support agents

Examples that often belong earlier once stable:

- Sounding in CI
- migration scripts
- deployment scripts
- mail templates for known events
- billing webhooks for confirmed payment flows
