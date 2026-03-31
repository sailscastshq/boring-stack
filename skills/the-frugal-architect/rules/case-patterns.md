---
name: case-patterns
description: Reusable patterns distilled from Frugal Architect case studies
metadata:
  tags: case-studies, watch-duty, pbs, wetransfer, too-good-to-go, patterns
---

# Case Patterns

Use these as pattern prompts, not hero stories to cargo-cult.

## Watch Duty: Start Simple, Mature When the Need Is Real

Useful pattern:

- begin with proven tools the team can ship and operate confidently
- stop traffic as early as possible when bursts are extreme
- accept a more capable and more expensive layer only after you understand the exact need

Translation:

- simple first does not mean stagnant forever
- it means you earn complexity with evidence

## Too Good To Go: Always Ask Why

Useful pattern:

- question whether the architecture is serving the mission or just engineering taste
- prefer proven technology when reliability and delivery speed matter more than novelty
- let incremental progress beat big-bang perfectionism

Translation:

- the strongest frugal habit is still asking why this exists at all

## PBS: Tie Spend to the Mission

Useful pattern:

- make every engineering investment answer to the mission it serves
- move from constant firefighting toward systems that are cheaper to run and easier to trust

Translation:

- cost-aware work is easier when everyone understands the purpose behind the spend

## WeTransfer: Measure Digital Waste

Useful pattern:

- treat unnecessary compute, storage, and retries as waste with both cost and operational consequences
- invest in observability before assuming you need a rebuild
- keep pursuing steady gains even inside a mature production system

Translation:

- if the system is already live, you can still make meaningful progress without stopping the business
