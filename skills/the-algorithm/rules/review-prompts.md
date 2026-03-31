---
name: review-prompts
description: Reusable questions for planning, roadmap pruning, positioning, execution, and agent prompts
metadata:
  tags: prompts, review, planning, roadmap, agent, checklist
---

# Review Prompts

Use these prompts when shaping products, reviewing plans or code, or steering an AI agent.

## Requirement Prompts

- Which requirement here is real, and which is inherited preference or fear?
- Who is the named owner of each requirement?
- What evidence says this matters now?
- If we removed this entirely, what concrete outcome gets worse?

## Deletion Prompts

- What page, field, setting, helper, model, or dependency can disappear?
- What offer, plan, or channel can disappear?
- What are we carrying only because we already wrote it down?
- Can two user steps become one?
- What would the most embarrassingly small version look like?

## Simplification Prompts

- What is the single happy path?
- What is the single clear promise?
- Where is the true source of truth?
- Can the server own this instead of the client?
- Can one clear abstraction replace several clever ones?

## Cycle-Time Prompts

- What is the smallest vertical slice that proves this works?
- What is the fastest honest test for the critical path?
- How can we get real user feedback before broadening the design?
- Are we making learning faster, or only making implementation busier?

## Automation Prompts

- Has a human performed this successfully enough times to understand it?
- Are inputs, outputs, and failure modes stable?
- Who gets paged, notified, or blocked when this automation fails?
- Are we automating leverage, or automating ambiguity?

## One-Shot Agent Prompt

Use this when you want the model to apply the skill explicitly:

```text
Apply The Algorithm to this plan. First question the requirements, then list deletion candidates, then propose the simplest surviving design, then suggest the fastest validation loop, and finally identify what should stay manual versus what is ready for automation.
```
