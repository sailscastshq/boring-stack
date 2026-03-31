---
name: observability-and-controls
description: What to measure and what controls to add so costs stay visible and adjustable
metadata:
  tags: observability, budgets, controls, monitoring, degradation, limits
---

# Observability and Controls

Do not optimize what you cannot see. Do not trust a system that has no levers.

## Minimum Visibility

For the feature or architecture under review, aim to know:

- request volume, latency, and error rate
- database query count, query time, and the slowest queries
- job volume, runtime, retries, and backlog
- storage growth and retention behavior
- email volume and provider spend
- cache hit rate and the cost of misses
- third-party API usage, rate-limit pressure, and overage risk

Where practical, connect these to a business signal:

- signups
- active teams or users
- orders
- messages sent
- files stored
- incidents prevented

## Design Cost Controls Early

Useful controls include:

- quotas and rate limits
- retention windows and cleanup jobs
- concurrency limits on workers and fanout
- cache TTLs and purge controls
- graceful degradation for non-critical features
- hard fail-safes around runaway jobs or external API calls
- budget alerts for infrastructure and third-party services

## Separate Critical and Optional Work

Classify components like this:

- Tier 1: must work even during spikes
- Tier 2: should work, but can slow down
- Tier 3: can be delayed, sampled, batched, or turned off

This makes better decisions possible:

- keep auth and checkout healthy first
- let secondary analytics or enrichment lag behind
- reduce fanout or polling before you scale every server tier

## Make Cost Visible to Product Too

Cost is not just an infrastructure concern.

- product decisions change payload size, notification volume, storage retention, and support load
- engineering should expose the cost shape of feature ideas early
- product should understand which UX choices are cheap, expensive, or only expensive at scale
