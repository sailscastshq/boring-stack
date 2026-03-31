---
name: simplify-the-design
description: Using the Algorithm to simplify the design before adding more layers
metadata:
  tags: simplification, design, layering, scope, systems
---

# Simplify the Design

Deletion-first architecture starts with the path already available to you. Use that before inventing new layers.

## Default Architecture Bias

Prefer this sequence:

1. a request handler receives the request
2. a reusable function or helper contains shared business logic when needed
3. the primary datastore persists the truth
4. the server returns the response or page with the needed data
5. the interface stays close to the page or component that uses it

Reach for extra infrastructure only when the product requirement clearly demands it.

## What to Delete First

When a plan feels heavy, try removing:

- a separate API layer for page-first product work
- duplicated validation split across many places
- client-side state that mirrors server truth
- custom data-fetching wrappers around straightforward request-response flows
- a background job for something that is fast enough inline
- realtime updates for information users can refresh
- a queue, cache, or search service added for anticipated scale
- a new package when the platform or stack already covers it

## Architecture Questions by Layer

### Page and Request Flow

Ask:

- Can this be one page and one action instead of a wizard or mini-app?
- Can the server compute this and send it directly in the response?
- Can the successful path be a redirect instead of local mutation choreography?

### Domain Logic

Ask:

- Does this logic belong in a helper instead of a controller branch?
- Can two helpers become one clearer helper with better naming?
- Are we modeling business rules, or just compensating for a confusing UI?

### Data Model

Ask:

- Can one table or association replace multiple coordination structures?
- Do we really need this status field, or can the state be derived?
- Are we storing a source of truth or a cached convenience copy?

### Frontend State

Ask:

- Is this truly client-owned state, or should it come from the server?
- Can a standard form flow or server-returned data replace a custom store?
- Does this state need to survive reloads, or is it ephemeral UI?

## Add Complexity Only on Proof

Reach for richer capabilities only when the answer is yes:

- stronger auth when the product truly needs richer auth flows
- billing infrastructure when billing becomes a real requirement
- transactional email when messaging is part of the core loop
- jobs or scheduling when work is slow, retryable, or timed
- realtime when live updates materially change value
- durable browser state when state genuinely belongs in the browser or URL
- deeper testing infrastructure when faster confidence requires stronger validation

The burden of proof is on the new layer, not on the boring default.
