---
name: boring-stack-decisions
description: Using the Algorithm to choose the simplest fitting architecture in The Boring JavaScript Stack
metadata:
  tags: boring-stack, sails, inertia, architecture, waterline, quest, realtime, payments
---

# Boring Stack Decisions

This stack already encodes several deletion-first opinions. Use them before inventing new layers.

## Default Architecture Bias

Prefer this sequence:

1. Sails action receives the request
2. helper contains reusable business logic when needed
3. Waterline persists the truth
4. Inertia renders the page with server-provided props
5. Tailwind styles the interface

Reach for extra infrastructure only when the product requirement clearly demands it.

## What to Delete First

When a plan feels heavy, try removing:

- a separate API layer for page-first product work
- duplicated validation split across many places
- client-side state that mirrors server truth
- custom data-fetching wrappers around straightforward Inertia flows
- a background job for something that is fast enough inline
- realtime updates for information users can refresh
- a queue, cache, or search service added for anticipated scale
- a new package when the platform or stack already covers it

## Architecture Questions by Layer

### Page and Request Flow

Ask:

- Can this be one page and one action instead of a wizard or mini-app?
- Can the server compute this and send it as props?
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
- Can `useForm` or page props replace a custom store?
- Does this state need to survive reloads, or is it ephemeral UI?

## Add Complexity Only on Proof

Use the existing skills when the answer is yes:

- `authentication` when the product truly needs richer auth flows
- `payments` when billing becomes a real requirement
- `email` when transactional email is part of the core product loop
- `quest` when work is slow, retryable, or scheduled
- `realtime` when live updates materially change value
- `durable-ui` when state genuinely belongs in the browser or URL
- `testing` when faster confidence requires stronger trials

The burden of proof is on the new layer, not on the boring default.
