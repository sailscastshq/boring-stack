---
name: review-prompts
description: Reusable frugal architecture questions for planning, review, and agent prompts
metadata:
  tags: prompts, review, planning, cost, architecture
---

# Review Prompts

Use these prompts when planning a feature, reviewing architecture, or steering an agent.

## Product and Business Fit

- What unit of value pays for this system or feature?
- How does cost-to-serve change as usage grows?
- Which part of the business or mission is protected by this spend?

## Architecture Shape

- What is the simplest architecture that can safely serve the current stage?
- Which trade-offs are being made, and are they explicit?
- Which layer is here because of evidence, and which layer is here because of fear?

## Measurement

- Which cost, utilization, and reliability metrics will tell us if this is working?
- What do we currently not see that could hide waste?
- Can product and engineering both understand the cost shape from the dashboards?

## Controls and Failure Modes

- What knobs can we turn during a spike?
- What can degrade gracefully without violating trust?
- Which safeguards prevent runaway jobs, overages, or needless fanout?

## Optimization

- What is the cheapest next experiment that could improve the economics?
- Are we proposing a rewrite before exhausting smaller, measurable improvements?
- What assumption is being carried forward only because it worked before?
