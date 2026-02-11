---
name: quest
description: >
  Background job scheduling with sails-hook-quest for Sails.js applications.
  Use this skill when creating, scheduling, or managing background jobs,
  cron tasks, recurring scripts, or any deferred/periodic work in a Sails.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: quest, jobs, scheduling, cron, background, scripts, sails
---

# Quest — Background Job Scheduling

Quest is a job scheduling hook for Sails.js that turns scripts in the `scripts/` directory into scheduled background jobs. Each job runs as an isolated child process via `sails run`, with full access to models, helpers, and configuration.

## When to Use

Use this skill when:

- Creating background jobs or scheduled tasks
- Setting up cron schedules, recurring intervals, or one-time delayed execution
- Defining job scripts with inputs and overlap prevention
- Using the `sails.quest` API to manage jobs at runtime
- Listening to job lifecycle events (start, complete, error)
- Configuring the console environment for lightweight job execution

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - What Quest is, installation, project structure, quick start
- [rules/scheduling.md](rules/scheduling.md) - Cron, human-readable intervals, shorthand, later.js, one-time execution
- [rules/job-definition.md](rules/job-definition.md) - Script anatomy, inputs, overlap prevention, config-defined jobs
- [rules/api.md](rules/api.md) - `sails.quest` API reference: control, info, events
- [rules/patterns.md](rules/patterns.md) - Common job patterns with complete script examples
