---
name: getting-started
description: What Quest is, installation, project structure, configuration, and quick start for background job scheduling in Sails.js
metadata:
  tags: setup, installation, config, basics, quest
---

# Getting Started with Quest

## What is Quest?

Quest is a job scheduling hook for Sails.js that transforms scripts in your `scripts/` directory into scheduled background jobs. It provides:

- **Process isolation** — each job runs as a separate child process via `sails run`
- **Multiple scheduling formats** — cron expressions, human-readable intervals, shorthand notation, and later.js text
- **Full Sails context** — jobs have access to models, helpers, and configuration
- **Overlap prevention** — prevents the same job from running concurrently
- **Runtime control** — start, stop, pause, resume, and run jobs programmatically

## Installation

```bash
npm install sails-hook-quest
```

Quest auto-registers as a Sails hook — no manual wiring needed. It loads after the ORM is ready, so your jobs can safely use models.

## Project Structure

```
my-app/
├── scripts/                  # Job scripts live here
│   ├── cleanup-sessions.js
│   ├── send-weekly-report.js
│   └── process-email-queue.js
├── config/
│   ├── quest.js              # Quest configuration
│   └── env/
│       └── console.js        # Lightweight environment for jobs
└── ...
```

## Quick Start

### 1. Create a Job Script

Jobs are standard Sails scripts (the machine format used by `sails run`) with an added `quest` property that defines the schedule:

```js
// scripts/cleanup-sessions.js
module.exports = {
  friendlyName: 'Cleanup sessions',

  description: 'Remove expired sessions older than 30 days.',

  quest: {
    interval: '1 hour'
  },

  inputs: {
    daysOld: {
      type: 'number',
      defaultsTo: 30
    }
  },

  fn: async function (inputs) {
    const cutoff = Date.now() - inputs.daysOld * 24 * 60 * 60 * 1000
    const deleted = await Session.destroy({
      lastActive: { '<': cutoff }
    }).fetch()

    sails.log.info(`Cleaned up ${deleted.length} expired sessions`)
  }
}
```

### 2. Configure Quest (Optional)

The defaults work out of the box, but you can customize behavior:

```js
// config/quest.js
module.exports.quest = {
  // Auto-start scheduled jobs when Sails lifts (default: true)
  autoStart: true,

  // Default timezone for cron expressions (default: 'UTC')
  timezone: 'UTC',

  // Prevent overlapping runs by default (default: true)
  withoutOverlapping: true,

  // Environment for child processes (default: 'console')
  environment: 'console',

  // Directory containing job scripts (default: 'scripts')
  scriptsDir: 'scripts',

  // Path to sails executable (default: './node_modules/.bin/sails')
  sailsPath: './node_modules/.bin/sails',

  // Jobs can also be defined here instead of (or in addition to) script files
  jobs: []
}
```

### 3. Set Up the Console Environment

Jobs run in the `console` environment by default. Create a lightweight config that disables unnecessary hooks for faster job startup:

```js
// config/env/console.js
module.exports = {
  hooks: {
    views: false,
    sockets: false,
    pubsub: false
  }
}
```

This significantly reduces startup time for job processes since they don't need view rendering, WebSockets, or pub/sub.

### 4. Lift Sails

```bash
sails lift
```

Quest automatically discovers scripts with a `quest` property, parses their schedules, and begins execution. You'll see log output like:

```
verbose: Registered job: cleanup-sessions { interval: '1 hour' }
verbose: Quest: Starting all jobs...
```

## How It Works

1. **Discovery** — on lift, Quest scans the `scripts/` directory for files with a `quest` property
2. **Registration** — jobs from both scripts and `config/quest.js` are merged into a registry
3. **Scheduling** — the scheduler parses each job's timing (cron, interval, timeout, or date) and sets timers
4. **Execution** — when a timer fires, the hook spawns `sails run <script-name>` as a child process
5. **Isolation** — the child process lifts a separate Sails instance (in the `console` environment), runs the script's `fn()`, and exits
6. **Events** — the parent process emits lifecycle events (`quest:job:start`, `quest:job:complete`, `quest:job:error`)
7. **Rescheduling** — for recurring jobs (interval/cron), the next run is scheduled after the current one completes

## Running Jobs Manually

You can always run any script manually, just like any Sails script:

```bash
sails run cleanup-sessions
```

Or with inputs:

```bash
sails run cleanup-sessions --daysOld=7
```

This is useful for testing jobs before setting up a schedule.

## Default Configuration Reference

| Option               | Default                       | Description                                   |
| -------------------- | ----------------------------- | --------------------------------------------- |
| `autoStart`          | `true`                        | Auto-start all jobs when Sails lifts          |
| `timezone`           | `'UTC'`                       | Default timezone for cron expressions         |
| `withoutOverlapping` | `true`                        | Prevent concurrent runs of the same job       |
| `environment`        | `'console'`                   | NODE_ENV for child processes                  |
| `scriptsDir`         | `'scripts'`                   | Directory to scan for job scripts             |
| `sailsPath`          | `'./node_modules/.bin/sails'` | Path to the Sails CLI executable              |
| `jobs`               | `[]`                          | Config-defined jobs (merged with script jobs) |
