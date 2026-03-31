---
name: five-steps
description: The five-step Algorithm translated into builder, product, and engineering decisions
metadata:
  tags: five-steps, requirements, deletion, simplification, cycle-time, automation
---

# The Five Steps

Use the steps in order. Most teams invert them. They start by automating, optimizing, or scaling work that should have been questioned or deleted.

## 1. Question Every Requirement

Treat every requirement as guilty until proven necessary.

For each requirement, identify:

- who wants it
- what user pain, revenue event, or risk it addresses
- what would break if it did not exist
- what evidence supports it
- whether it is a law, policy, payment constraint, or just a preference

Requirements that sound impressive are often the most dangerous because nobody wants to challenge them.

In builder work, question:

- whole features
- whole offers
- extra audience segments
- pricing tiers
- edge-case branches
- roles and permission matrices
- admin workflows
- approval steps
- data fields
- integrations
- framework choices
- performance targets with no user or business consequence

## 2. Delete Any Part or Process You Can

Once a requirement survives scrutiny, remove everything around it that is not carrying its weight.

Delete candidates:

- optional settings nobody asked for
- extra landing-page sections
- channels you cannot sustain
- recurring rituals that do not improve decisions
- secondary navigation paths
- duplicate actions and helpers
- endpoints that mirror page behavior
- internal tools that replace a temporary spreadsheet too early
- status values, feature flags, and abstractions that exist "just in case"
- team rituals that create delay without improving decisions

If your first draft survives intact, you probably did not delete aggressively enough.

## 3. Simplify and Optimize What Remains

Only simplify the work that still deserves to exist.

Simplification usually means:

- one clear actor
- one primary flow
- one clear promise
- one source of truth
- fewer states and branches
- clearer names
- fewer moving parts between user intent and persisted data

Do not confuse extra abstraction with simplicity. A simpler system usually has fewer nouns, fewer files, and fewer handoffs.

## 4. Accelerate Cycle Time

Now that the shape is smaller and cleaner, make learning faster.

Speed up:

- prototyping
- local verification
- request-level testing
- review size
- beta feedback
- bug reproduction
- instrumentation and support loops

Accelerating before deletion and simplification only helps you produce waste faster.

## 5. Automate Last

Automation should lock in a known-good flow, not discover the flow for you.

Automate when:

- the manual version has already worked several times
- inputs and outputs are stable
- failure modes are understood
- someone owns the automation when it breaks

In builder work, "automation" includes:

- CI pipelines
- deployment and rollback scripts
- code generation
- prospecting and lifecycle workflows
- background jobs
- AI copilots and agents
- alerts, triage, and escalation workflows

If humans still disagree on the right process, the work is not ready to automate.
