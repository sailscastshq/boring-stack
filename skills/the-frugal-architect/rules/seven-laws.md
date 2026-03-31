---
name: seven-laws
description: The seven laws of frugal architecture translated into builder, product, and engineering choices
metadata:
  tags: laws, frugality, cost, architecture, trade-offs, optimization
---

# The Seven Laws

Frugal architecture is about earning more value from each dollar, each moving part, and each engineering hour. It is not about starving the system. It is about spending deliberately.

## 1. Make Cost a Non-functional Requirement

Treat cost the way you treat reliability, security, and latency.

- define a budget, target margin, or cost-to-serve expectation before you scale the feature
- ask what the expensive path is per signup, team, order, workflow, or request
- reject designs that only work if nobody looks at the bill

## 2. Systems That Last Align Cost to Business

Healthy systems scale their cost with value creation, not with engineering enthusiasm.

- map infrastructure, vendor spend, and support load to the revenue or mission outcome they support
- prefer architectures where marginal cost rises only when usage or value rises
- be suspicious of large fixed-cost platforms introduced before the product earns them

## 3. Architecting Is a Series of Trade-offs

There is no free architecture.

- state the trade explicitly: cost vs latency, resilience vs simplicity, vendor convenience vs control
- avoid words like "best practice" when the real answer is "best trade-off for this stage"
- pick the trade that protects the business and user experience, not the architect's ego

## 4. Unobserved Systems Lead to Unknown Costs

Unknown cost becomes unmanaged cost.

- make spend, utilization, throughput, queue depth, and error rates visible to engineers
- put cost signals where product and engineering can see them regularly
- do not start cost-cutting guesses until you can see where the waste lives

## 5. Cost-aware Architectures Implement Cost Controls

A frugal system has knobs, guardrails, and graceful failure modes.

- add quotas, retention windows, backpressure, rate limits, circuit breakers, and degradation paths
- separate must-work paths from can-degrade paths
- design so a spike increases service pressure in a controlled way instead of detonating the bill

## 6. Cost Optimization Is Incremental

Most worthwhile savings come from steady improvement, not from dramatic rewrites.

- profile first, then change one thing at a time
- favor repeated 10% to 30% wins over one massive "optimization project"
- preserve delivery speed while you remove waste from hot paths and steady-state operations

## 7. Unchallenged Success Leads to Assumptions

The fact that something worked once does not mean it is still the right choice.

- revisit old defaults for frameworks, vendors, regions, instance sizes, and data retention
- question "we are a X shop" thinking when it blocks better trade-offs
- keep success from hardening into dogma
