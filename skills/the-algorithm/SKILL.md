---
name: the-algorithm
description: >
  Product-building operating system inspired by Elon Musk's five-step "The Algorithm" —
  question every requirement, delete nonessential work, simplify what remains, accelerate feedback loops,
  and automate last. Use this skill when shaping offers, features, onboarding, pricing, architecture,
  workflow, launch, or automation decisions. Tailored for founders,
  designers, operators, product engineers, and AI coding agents building real products.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: the-algorithm, product-strategy, mvp, scope, architecture, simplification, delivery, automation
---

# The Algorithm

The Algorithm is a subtraction-first way to build products. Its value for builders is not the factory metaphor. It is the sequence:

1. prove the requirement
2. remove unnecessary work
3. simplify the surviving path
4. speed up learning and delivery
5. automate only after the flow is stable

In product and application work, this usually means resisting extra layers and extra surfaces:

- no extra API when one server-driven flow can do the job
- no client state system when the database and server-provided data are enough
- no queue, socket, cache, search service, or microservice until the product truly needs it
- no second or third pricing idea before the first one proves itself
- no AI automation over a workflow humans do not yet understand

## When to Use

Use this skill when:

- shaping an MVP, offer, feature spec, onboarding flow, pricing flow, internal tool, or launch plan
- reviewing a bloated plan and deciding what to cut before implementation
- deciding how narrow the first version should be
- simplifying positioning, product promise, or distribution flow
- choosing whether a page, action, helper, model, queue, websocket, or integration should exist
- deciding whether to build a public API, background job, realtime feature, or custom client state layer
- simplifying a tangled React, Vue, or Svelte experience into one clear happy path
- improving cycle time for prototyping, testing, QA, feedback, and release
- deciding what should stay manual, what should become a checklist, and what is ready for automation
- steering an AI coding agent away from premature complexity and toward product outcomes
- applying discipline to vibe coding so speed does not outrun judgment

## Default Biases

When this skill is active, bias toward:

- one primary actor before many roles
- one painful job before many adjacent jobs
- one obvious path before many options
- one source of truth before mirrored state
- one vertical slice before broad platform work
- one manual proof before a permanent automation

## Rules

Read the rule files that match the decision you are making:

- [rules/five-steps.md](rules/five-steps.md) - The five-step sequence translated from manufacturing into builder and product work
- [rules/product-shaping.md](rules/product-shaping.md) - Applying the algorithm from problem selection through offer, MVP scope, UX, pricing, distribution, and launch
- [rules/simplify-the-design.md](rules/simplify-the-design.md) - How to simplify the design before adding more layers
- [rules/feedback-loops.md](rules/feedback-loops.md) - How to accelerate learning, validation, testing, and release without speeding up waste
- [rules/automation-last.md](rules/automation-last.md) - What is actually ready for automation, and what should remain manual for now
- [rules/review-prompts.md](rules/review-prompts.md) - Reusable questions for planning, code review, roadmap pruning, and agent prompts
