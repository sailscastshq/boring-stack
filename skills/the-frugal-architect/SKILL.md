---
name: the-frugal-architect
description: >
  Cost-aware architecture skill inspired by The Frugal Architect and adapted for
  The Boring JavaScript Stack. Treat cost as a first-class non-functional requirement,
  align system shape to the business model, make trade-offs explicit, observe cost and
  waste, add cost controls, optimize incrementally, and challenge stale assumptions.
  Use this skill when shaping infrastructure, architecture, scaling, observability,
  performance, background jobs, caching, or product-engineering trade-offs.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: the-frugal-architect, frugality, cost-awareness, architecture, trade-offs, observability, optimization, boring-stack
---

# The Frugal Architect

The Frugal Architect is not a plea to be cheap. It is a discipline for maximizing value per unit of spend, complexity, and attention.

In The Boring JavaScript Stack, that usually means:

- make recurring cost visible before it surprises you
- choose boring, proven building blocks before exotic ones
- match architecture to the business model and the current stage of the product
- spend more where failure hurts the business, and less where degradation is acceptable
- add explicit levers for cost, throughput, and graceful degradation
- optimize through measured, incremental improvements instead of heroic rewrites

## When to Use

Use this skill when:

- deciding whether a new service, queue, cache, search layer, CDN feature, or vendor should exist
- shaping hosting, deployment, storage, background job, email, or realtime architecture
- reviewing a feature that may increase infrastructure or third-party spend
- deciding how much reliability, latency, or throughput a workflow truly deserves
- planning for traffic spikes, seasonality, rate limits, or step-function growth
- designing observability, budgets, alerts, quotas, or degradation paths
- choosing between "build it now" and "wait until the economics justify it"
- reviewing architecture that feels expensive, under-measured, or over-engineered
- guiding an AI coding agent toward durable, cost-aware choices instead of novelty

## Default Biases

When this skill is active, bias toward:

- one proven dependency before one fashionable dependency
- one measured bottleneck before broad optimization work
- one explicit cost lever before blanket cost cutting
- one boring deployment path before a platform maze
- one business-backed scaling concern before hypothetical scale theater
- one incremental improvement before one rewrite

## Rules

Read the rule files that match the decision you are making:

- [rules/seven-laws.md](rules/seven-laws.md) - The seven laws of frugal architecture translated into builder and product decisions
- [rules/frugal-stack-decisions.md](rules/frugal-stack-decisions.md) - Applying frugal architecture to Sails, Inertia, Waterline, Shipwright, Quest, Realtime, and related stack choices
- [rules/observability-and-controls.md](rules/observability-and-controls.md) - What to measure, what to budget, and which cost controls to design in early
- [rules/incremental-optimization.md](rules/incremental-optimization.md) - A practical loop for reducing waste without pausing product delivery
- [rules/case-patterns.md](rules/case-patterns.md) - Patterns distilled from Frugal Architect case studies such as Watch Duty, PBS, Too Good To Go, and WeTransfer
- [rules/review-prompts.md](rules/review-prompts.md) - Reusable questions for planning, architecture review, cost review, and agent prompts
