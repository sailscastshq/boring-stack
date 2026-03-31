---
name: frugal-stack-decisions
description: Using frugal architecture to choose the simplest, most cost-aware fit inside The Boring JavaScript Stack
metadata:
  tags: boring-stack, sails, inertia, waterline, shipwright, quest, realtime, architecture
---

# Frugal Stack Decisions

Use frugal architecture to keep the stack boring on purpose, not by accident.

## Start With the Default Stack Shape

Prefer:

- a Sails action plus an Inertia page over a duplicated page API and client data layer
- Waterline plus the primary database over extra data stores added for hypothetical scale
- built-in Shipwright asset handling over custom pipeline work
- Sounding request tests over browser-heavy suites when the browser is not the thing being validated

Delay:

- Redis, queues, websocket fanout, search infrastructure, object pipelines, and edge logic until usage justifies them
- internal platforms that solve organizational scale you do not yet have
- expensive monitoring products when simple metrics and logs will answer the current question

## Tie Architecture to Unit Economics

Before you add a new layer, ask:

- what revenue event, customer outcome, or mission-critical outcome pays for this?
- what part of cost-to-serve does it reduce or protect?
- if usage doubled tomorrow, would this layer improve the economics or merely look sophisticated?

Examples in this stack:

- a background job is justified if it shortens user response time or consolidates expensive work
- a CDN is justified if it meaningfully absorbs traffic, latency, or origin load
- realtime is justified if faster updates change user behavior or reduce manual refresh churn

## Spend More on the Path That Must Work

Invest first in:

- authentication, payments, checkout, critical notifications, and primary write paths
- recovery, retries, and visibility for workflows that directly affect revenue or trust

Spend carefully on:

- admin conveniences
- low-value automations
- vanity dashboards
- broad realtime features
- speculative personalization

## Add Explicit Cost Levers

Good Boring Stack levers include:

- job frequency and batch size in Quest
- email send timing, batching, and template weight
- image size, caching, and retention
- request rate limits
- feature-level degradation flags
- database query count and payload size on Inertia responses
- websocket room fanout and event frequency

## Prefer Reversible Decisions

When two choices are close, pick the one that:

- teaches you faster
- locks you in less
- keeps migration cost low
- can be upgraded later without rewriting the product
