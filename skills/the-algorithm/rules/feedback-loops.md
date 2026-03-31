---
name: feedback-loops
description: Accelerating learning, validation, testing, and release without speeding up waste
metadata:
  tags: cycle-time, feedback, testing, prototyping, release, instrumentation
---

# Feedback Loops

Cycle time is how long it takes to learn whether your decision was right. Faster feedback is valuable only after the work itself is small and clean.

## Shorten the Proof Path

Prefer the fastest proof that can kill or confirm the idea:

1. written hypothesis
2. static mock or page stub
3. local end-to-end happy path
4. request-level trial
5. browser trial
6. beta user interaction
7. production telemetry

Do not start at level 7 when level 3 would answer the question.

## Accelerate Product Delivery

Reduce batch size:

- ship vertical slices instead of parallel subsystems
- keep pull requests narrow
- make acceptance criteria visible
- test the critical path first
- stage rollout when risk is uneven

The goal is not maximum activity. It is minimum time between decision and evidence.

## Accelerate the Local Loop in This Stack

Use the stack's natural fast paths:

- render the page with Inertia before building cross-page state machinery
- verify behavior with Sounding request trials before reaching for browser tests
- capture mail locally before integrating a live provider
- use fixtures, factories, and focused scenarios instead of giant seed states
- reproduce bugs with the smallest failing page, action, helper, or model path

## Measure the Right Things

Faster loops need clear signals.

Track:

- time to first user success
- completion rate of the main flow
- time from bug report to reproduced case
- time from change to deployed validation
- support questions per new feature

Avoid vanity acceleration like faster builds for features nobody should have built.

## Review Loop Questions

Ask:

- What is the smallest end-to-end slice that proves this matters?
- What evidence can we gather this week instead of next month?
- Which test gives us the fastest honest confidence?
- Are we speeding up the right thing, or just making motion look productive?
