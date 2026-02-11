---
name: job-definition
description: Script anatomy, the quest property, inputs, overlap prevention, config-defined jobs, process isolation, and the console environment
metadata:
  tags: scripts, inputs, jobs, overlap, config, process, quest
---

# Job Definition

Jobs in Quest are Sails scripts — the same format used by `sails run`. A script becomes a scheduled job by adding a `quest` property that defines when and how it should run.

## Script Anatomy

A complete job script follows the Sails machine format:

```js
// scripts/process-email-queue.js
module.exports = {
  friendlyName: 'Process email queue',

  description: 'Send queued emails in batches of 50.',

  quest: {
    interval: '30 seconds',
    withoutOverlapping: true
  },

  inputs: {
    batchSize: {
      type: 'number',
      description: 'Maximum number of emails to process per run.',
      defaultsTo: 50
    },

    retryFailed: {
      type: 'boolean',
      description: 'Whether to retry previously failed emails.',
      defaultsTo: false
    }
  },

  fn: async function (inputs) {
    const emails = await EmailQueue.find({
      status: inputs.retryFailed ? { in: ['pending', 'failed'] } : 'pending',
      limit: inputs.batchSize,
      sort: 'createdAt ASC'
    })

    for (const email of emails) {
      try {
        await sails.helpers.sendEmail.with({
          to: email.to,
          subject: email.subject,
          template: email.template,
          templateData: email.data
        })

        await EmailQueue.updateOne({ id: email.id }).set({ status: 'sent' })
      } catch (err) {
        await EmailQueue.updateOne({ id: email.id }).set({
          status: 'failed',
          error: err.message
        })
      }
    }

    sails.log.info(`Processed ${emails.length} emails`)
  }
}
```

## The `quest` Property

The `quest` object on a script controls scheduling and execution behavior:

```js
quest: {
  // SCHEDULING (pick one) ─────────────────────────
  interval: '5 minutes',             // Recurring interval
  // cron: '0 * * * *',              // Cron expression
  // timeout: '10 minutes',          // One-time delay
  // date: new Date('2025-12-25'),   // One-time at specific date

  // OPTIONAL ──────────────────────────────────────
  name: 'custom-name',               // Override auto-detected name
  timezone: 'America/New_York',      // Override global timezone
  cronOptions: {},                   // Options for cron-parser
  withoutOverlapping: true,          // Prevent concurrent runs
  inputs: {                          // Default input values
    batchSize: 100
  }
}
```

### Scheduling Priority

If multiple scheduling options are present, Quest uses this priority order:

1. `cron` — if a cron expression is defined, it takes precedence
2. `interval` — string or numeric interval
3. `timeout` — one-time delayed execution
4. `date` — one-time at specific date

**Important:** `date` and `timeout` cannot be combined. Quest will throw an error if both are present.

## Inputs

### Defining Inputs

Inputs use the standard Sails machine format with types, descriptions, and defaults:

```js
inputs: {
  daysOld: {
    type: 'number',
    description: 'Delete records older than this many days.',
    defaultsTo: 30
  },

  dryRun: {
    type: 'boolean',
    description: 'Log what would be deleted without actually deleting.',
    defaultsTo: false
  },

  notifyEmail: {
    type: 'string',
    description: 'Email address to notify on completion.',
    defaultsTo: 'admin@example.com'
  }
}
```

### How Inputs Are Passed

When Quest runs a job, inputs are serialized as CLI arguments to `sails run`:

```bash
sails run cleanup-sessions --daysOld=7 --dryRun=true
```

- **Primitives** (string, number, boolean) are passed as-is
- **Objects and arrays** are JSON.stringify'd before passing

### Input Sources and Merging

Inputs can come from three sources, merged in this priority order (highest wins):

1. **`sails.quest.run()` call** — inputs passed when manually running a job
2. **Script `quest.inputs`** — defaults in the quest property
3. **Script `inputs.*.defaultsTo`** — defaults from the inputs schema (extracted automatically)
4. **Config `jobs[].inputs`** — defaults from `config/quest.js`

```js
// config/quest.js — lowest priority
module.exports.quest = {
  jobs: [
    {
      name: 'cleanup-sessions',
      inputs: { daysOld: 90 } // Config default
    }
  ]
}

// scripts/cleanup-sessions.js — script defaults override config
module.exports = {
  quest: {
    interval: '1 hour',
    inputs: { daysOld: 30 } // Script quest default (wins over config)
  },
  inputs: {
    daysOld: {
      type: 'number',
      defaultsTo: 30 // Schema default (extracted as scriptInputs)
    }
  },
  fn: async function (inputs) {
    /* ... */
  }
}

// Runtime call — highest priority
await sails.quest.run('cleanup-sessions', { daysOld: 7 })
```

## Overlap Prevention

By default, Quest prevents the same job from running concurrently. If a job is still running when its next scheduled execution arrives, the new run is skipped:

```js
quest: {
  interval: '30 seconds',
  withoutOverlapping: true    // Default: true (from config)
}
```

When a run is skipped, Quest logs a warning:

```
warn: Job "process-email-queue" is already running, skipping...
```

### Disabling Overlap Prevention

For jobs that are safe to run concurrently:

```js
quest: {
  interval: '1 minute',
  withoutOverlapping: false   // Allow concurrent runs
}
```

### Global Default

Set the default for all jobs in `config/quest.js`:

```js
module.exports.quest = {
  withoutOverlapping: true // This is already the default
}
```

Per-job settings override the global default.

## Config-Defined Jobs

Instead of adding a `quest` property to a script, you can define jobs entirely in `config/quest.js`:

```js
// config/quest.js
module.exports.quest = {
  jobs: [
    // Full definition
    {
      name: 'cleanup-sessions',
      interval: '1 hour',
      withoutOverlapping: true,
      inputs: {
        daysOld: 30
      }
    },

    // String shorthand (just references a script by name, no schedule override)
    'health-check',

    // Cron-based
    {
      name: 'weekly-report',
      cron: '0 9 * * MON',
      timezone: 'America/New_York'
    }
  ]
}
```

### Config + Script Merging

When a job is defined in both config and a script:

- Config provides the **base** (inputs, control options)
- Script's `quest` property **overrides** scheduling and options
- This lets you set deployment-specific inputs in config while keeping schedules in scripts

```js
// config/quest.js — sets deployment-specific inputs
module.exports.quest = {
  jobs: [
    {
      name: 'send-report',
      inputs: {
        recipientEmail: 'ops@mycompany.com' // Deployment-specific
      }
    }
  ]
}

// scripts/send-report.js — defines the schedule and logic
module.exports = {
  quest: {
    cron: '0 9 * * MON' // Schedule lives with the script
  },
  inputs: {
    recipientEmail: { type: 'string', required: true }
  },
  fn: async function (inputs) {
    // inputs.recipientEmail comes from config
  }
}
```

### Duplicate Names

Job names must be unique within `config/quest.js`. If two config entries share a name, Quest throws an error:

```
Error: Duplicate job name "cleanup" in config/quest.js. Each job must have a unique name.
```

## Process Isolation

Each job runs as a **separate Node.js process** via `sails run`. This provides:

- **Crash isolation** — a failing job doesn't affect the main app
- **Memory isolation** — jobs don't share memory with the web server
- **Clean state** — each run starts with a fresh Sails instance
- **Full context** — jobs have access to all models, helpers, services, and configuration

### How Execution Works

```
Main Sails Process                    Child Process
─────────────────                    ─────────────
Timer fires for "cleanup"
  → spawn('sails', ['run',           → Lifts Sails (console env)
     'cleanup', '--daysOld=30'])        → Loads models, helpers
                                        → Runs script fn()
                                        → Exits with code 0 or 1
  ← Receives exit code              ← Process ends
  → Emits quest:job:complete
  → Schedules next run
```

## The Console Environment

By default, Quest runs jobs in the `console` environment (`NODE_ENV=console`). This lets you create a minimal Sails configuration that skips unnecessary hooks:

```js
// config/env/console.js
module.exports = {
  hooks: {
    views: false, // No view rendering (EJS, Pug, etc.)
    sockets: false, // No WebSocket server
    pubsub: false // No publish/subscribe
  },

  // You can also adjust other settings for the job environment
  log: {
    level: 'info' // Less verbose logging
  }
}
```

### Why Use the Console Environment?

1. **Faster startup** — skipping hooks like views and sockets reduces Sails lift time
2. **Lower memory** — fewer hooks mean less memory consumption per job process
3. **Focused dependencies** — jobs only load what they actually need (models, helpers)

### Customizing the Job Environment

To use a different environment name:

```js
// config/quest.js
module.exports.quest = {
  environment: 'worker' // Uses config/env/worker.js instead
}
```

Then create `config/env/worker.js` with the appropriate hook settings.
