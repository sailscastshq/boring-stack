---
name: eat-the-pain
description: >
  Shape products and managed services around customer burdens they can take responsibility for.
  Use when deciding how to remove customer work, anxiety, coordination, or recovery effort;
  review an end-to-end customer journey; or price an optional done-for-you offer.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: product-strategy, customer-outcomes, customer-journey, managed-services, validation, pricing
---

# Eat the Pain

Find the work customers endure to reach an outcome, then decide which burden the product can reliably own. Removing a screen or adding automation counts only if it reduces the customer's total burden, including exceptions and recovery.

Default to research and strategy. Invoking this skill does not authorize implementation, commits, releases, payments, outreach, or other external actions. Implement product changes only when the user asks; use existing authorization for any requested actions.

## Ground the opportunity

Recover the relevant product context from available conversation, source, documentation, customer evidence, and connected resources before asking for missing essentials. Establish:

- Who is trying to do what, what triggers the job, and how they handle it today.
- What the product actually does now, its stage and limits, and which capabilities are only proposed.
- Where customers spend time, worry, repeat work, coordinate others, or recover from failure; cite observations, support reports, or interviews when available.

Distinguish verified behavior, customer-reported experience, inference, and hypothesis. Code can establish behavior, but does not by itself establish customer demand. Missing evidence is an experiment to run, not permission to invent a pain or capability. Ask a focused question when a missing fact changes the recommendation; otherwise state the assumption and keep scope narrow.

When competitors or adjacent services can inform the decision, inspect current primary sources such as their documentation, pricing, terms, and product flows. Cite sources beside factual comparisons and record material limits or unknowns. Separate what a provider claims from demonstrated behavior. Borrow a useful mechanism without assuming equivalent coverage, economics, or customer fit. If research is unavailable, label the comparison unverified and avoid presenting remembered details as current facts.

## Choose the responsibility boundary

Trace the journey far enough to reach the customer's outcome: discovery, setup, normal use, ongoing care, failure, recovery, and exit. Follow handoffs between people and tools. Include what happens when nobody responds, a payment fails, an update breaks, or the customer wants to stop, as relevant to the job.

For the painful steps, identify the current owner, evidence and impact, proposed product responsibility, and what the customer must still decide or approve. Prefer a few consequential burdens over an exhaustive inventory.

A product can absorb execution, monitoring, coordination, and recovery while preserving customer choices. Define consent, visibility, escalation, reversal or exit, and the limits of the promise. Do not turn relief into hidden lock-in, unwanted outreach, or uncontrolled access to customer data. Avoid transferring the same work into opaque support queues or asking customers to supervise the automation continuously.

Separate two kinds of work:

- **Baseline obligation:** make the advertised product work reliably, explain failures, and provide a usable recovery path. A broken update flow or required CLI workaround is a reliability problem to fix, not a premium upsell opportunity.
- **Optional managed service:** take on additional ongoing work for a customer who freely chooses delegation. Explain the extra scope, service limits, and price separately from baseline repairs.

## Prove relief before building

Rank the strongest opportunities by severity and frequency of evidenced pain, customer value, willingness to delegate or pay, confidence, delivery effort, and operating risk. Explain the trade-offs; avoid false precision when evidence is thin. Include doing less or fixing the baseline when that wins.

Design the smallest concierge experiment that tests the leading uncertainty before a feature build. Specify the customer cohort, manual service, consent and boundaries, duration, owner, and a concrete next action. Measure relief against today's process: customer minutes or interruptions, successful outcomes, time to recover, or repeat use. Measure operator effort and failure rates too. State a success threshold and a stop or revise condition; label provisional numbers as assumptions.

Assess feasibility: labor per customer, infrastructure and third-party costs, support and exception load, reliability capacity, and privacy or access requirements. Estimate contribution margin with explicit assumptions and a plausible high-support case. A manual pilot may validate value without proving scalability. Propose a price or pricing experiment only when the added value and economics support it; do not guarantee funding, revenue, uptime, or growth.

## Return a useful decision

Match the depth to the request. A focused review may need only a short recommendation and experiment; a broad assessment may benefit from a journey or opportunity table. Include:

- **Outcome:** `[Product] eats the pain of ___ so [customer] can ___`. Label it a proposed promise when it exceeds verified capabilities.
- **Priorities:** the best few evidence-backed opportunities, separating baseline fixes from optional paid work, with ownership boundaries and key unknowns.
- **Next experiment:** who does what next, what customer relief would count as success, operating cost assumptions, and what would stop or change the plan.

## Illustrative lenses

These are directions to investigate, not claims about current product capabilities or proven demand:

- **FLOSSAfrica:** help maintainers obtain sustainable support without making fundraising a full-time job. Investigate where sponsor discovery, applications, reporting, or follow-up create burden; test one bounded concierge service with maintainer approval. A payment mechanism alone does not prove sponsor demand or remove fundraising effort.
- **Slipway:** help customers keep applications updated reliably without routine CLI workarounds. First establish the current update and recovery behavior and fix any broken baseline. Separately test whether customers want optional managed scheduling, monitoring, or recovery assistance with clear approval boundaries.
