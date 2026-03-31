---
name: incremental-optimization
description: A measured loop for removing waste without freezing product delivery
metadata:
  tags: optimization, iteration, profiling, performance, cost, waste
---

# Incremental Optimization

Frugal teams do not wait for a grand rewrite. They make the next worthwhile improvement visible, measured, and repeatable.

## The Loop

1. measure the current path
2. identify the most likely source of waste
3. change one lever
4. measure again
5. keep, revert, or tune
6. document the lesson and move to the next hotspot

## High-return Places to Look First

In this stack, common waste shows up in:

- oversized Inertia props
- repeated database queries and N+1 access
- browser tests doing work request tests could cover more cheaply
- cron jobs that run too often or scan too much
- email workflows that send too much or too eagerly
- realtime events that fan out more often than users can perceive
- large assets, uploads, or retained files with weak cleanup
- background jobs retrying the same failure without new information

## Rewrite Last

Before proposing a rewrite, try:

- better indexing or query shape
- smaller payloads
- tighter caching
- better batching
- reduced polling
- cheaper storage classes or retention
- clearer degradation logic during spikes

Large rewrites are justified only when smaller changes cannot alter the economics enough.

## Celebrate Compounding Wins

Incremental improvements matter because they stack:

- lower steady-state cost
- smaller incident blast radius
- faster response during spikes
- better developer understanding of the system

The goal is not theoretical perfection. The goal is a healthier system that keeps getting cheaper to serve relative to the value it creates.
