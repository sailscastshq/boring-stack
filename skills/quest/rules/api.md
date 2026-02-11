---
name: api
description: Complete sails.quest API reference — control methods (start, stop, run, add, remove, pause, resume), info methods (list, get, isRunning, jobs), and lifecycle events
metadata:
  tags: api, sails.quest, control, events, runtime, quest
---

# sails.quest API

After Sails lifts, `sails.quest` exposes methods for controlling, querying, and monitoring background jobs at runtime.

## Control Methods

### `sails.quest.start(jobNames?)`

Start scheduling jobs. Called automatically on lift when `autoStart` is `true`.

```js
// Start all jobs
sails.quest.start()

// Start a single job
sails.quest.start('cleanup-sessions')

// Start multiple specific jobs
sails.quest.start(['cleanup-sessions', 'health-check'])
```

### `sails.quest.stop(jobNames?)`

Stop scheduling jobs. Cancels their timers but keeps them in the registry.

```js
// Stop all jobs
sails.quest.stop()

// Stop a single job
sails.quest.stop('cleanup-sessions')

// Stop multiple specific jobs
sails.quest.stop(['cleanup-sessions', 'health-check'])
```

### `sails.quest.run(jobName, inputs?)`

Execute a job immediately, regardless of its schedule. This spawns a child process just like a scheduled run.

```js
// Run with default inputs
await sails.quest.run('cleanup-sessions')

// Run with custom inputs (overrides all defaults)
await sails.quest.run('cleanup-sessions', { daysOld: 7 })

// Run from an action (e.g., admin trigger)
module.exports = {
  friendlyName: 'Trigger cleanup',

  fn: async function () {
    await sails.quest.run('cleanup-sessions', { daysOld: 1 })
    return this.res.json({ message: 'Cleanup job triggered' })
  }
}
```

### `sails.quest.add(jobDefs)`

Register new jobs dynamically at runtime. Added jobs are immediately available for scheduling.

```js
// Add a single job
sails.quest.add({
  name: 'dynamic-report',
  interval: '1 hour',
  inputs: { format: 'csv' }
})

// Add multiple jobs
sails.quest.add([
  {
    name: 'monitor-api',
    interval: '30 seconds',
    inputs: { endpoint: 'https://api.example.com/health' }
  },
  {
    name: 'sync-inventory',
    cron: '0 */4 * * *'
  }
])
```

After adding, start the job to begin scheduled execution:

```js
sails.quest.add({ name: 'new-job', interval: '5m' })
sails.quest.start('new-job')
```

### `sails.quest.remove(jobNames)`

Remove jobs from the registry. Stops their timers and deletes their definitions.

```js
// Remove a single job
sails.quest.remove('old-job')

// Remove multiple jobs
sails.quest.remove(['old-job', 'deprecated-task'])
```

### `sails.quest.pause(jobName)`

Pause a job's execution. The schedule is preserved but runs are skipped until resumed.

```js
sails.quest.pause('heavy-report')
```

### `sails.quest.resume(jobName)`

Resume a previously paused job:

```js
sails.quest.resume('heavy-report')
```

## Info Methods

### `sails.quest.list()`

Get an array of all registered jobs:

```js
const jobs = sails.quest.list()
// Returns: [
//   {
//     name: 'cleanup-sessions',
//     friendlyName: 'Cleanup sessions',
//     description: 'Remove expired sessions...',
//     interval: '1 hour',
//     withoutOverlapping: true,
//     paused: false,
//     inputs: { daysOld: 30 },
//     ...
//   },
//   ...
// ]
```

### `sails.quest.get(name)`

Get a specific job by name:

```js
const job = sails.quest.get('cleanup-sessions')

if (job) {
  sails.log.info(`Job "${job.name}" scheduled every ${job.interval}`)
}
```

Returns `undefined` if the job doesn't exist.

### `sails.quest.isRunning(name)`

Check if a job is currently executing (has an active child process):

```js
if (sails.quest.isRunning('heavy-report')) {
  return this.res.json({ status: 'Report is still generating...' })
}

await sails.quest.run('heavy-report')
return this.res.json({ status: 'Report generation started' })
```

### `sails.quest.jobs`

Direct access to the array of all registered jobs:

```js
const allJobs = sails.quest.jobs
const activeCount = allJobs.filter((j) => !j.paused).length
```

## Lifecycle Events

Quest emits events on the Sails instance that you can listen to anywhere — typically in `config/bootstrap.js` or a custom hook.

### `quest:job:start`

Fired when a job begins execution (child process spawned):

```js
// config/bootstrap.js
module.exports.bootstrap = async function () {
  sails.on('quest:job:start', (data) => {
    sails.log.info(`[Quest] Job "${data.name}" started`)
  })
}
```

**Event payload:**

```js
{
  name: 'cleanup-sessions',   // Job name
  inputs: { daysOld: 30 },    // Inputs passed to the job
  timestamp: Date              // When execution started
}
```

### `quest:job:complete`

Fired when a job finishes successfully (child process exits with code 0):

```js
sails.on('quest:job:complete', (data) => {
  sails.log.info(`[Quest] Job "${data.name}" completed in ${data.duration}ms`)
})
```

**Event payload:**

```js
{
  name: 'cleanup-sessions',
  inputs: { daysOld: 30 },
  timestamp: Date,
  duration: 1523               // Execution time in milliseconds
}
```

### `quest:job:error`

Fired when a job fails (child process exits with non-zero code):

```js
sails.on('quest:job:error', (data) => {
  sails.log.error(`[Quest] Job "${data.name}" failed: ${data.error.message}`)

  // Send alert to monitoring
  await sails.helpers.sendSlackAlert.with({
    channel: '#ops-alerts',
    message: `Background job "${data.name}" failed:\n${data.error.message}`
  })
})
```

**Event payload:**

```js
{
  name: 'cleanup-sessions',
  inputs: { daysOld: 30 },
  timestamp: Date,
  duration: 856,
  error: {
    message: 'Connection refused',
    code: 1,                   // Process exit code
    stack: '...'               // Error stack trace (if available)
  }
}
```

## Common Patterns

### Admin Dashboard: Job Status API

```js
// api/controllers/admin/list-jobs.js
module.exports = {
  friendlyName: 'List jobs',

  fn: async function () {
    const jobs = sails.quest.list().map((job) => ({
      name: job.name,
      friendlyName: job.friendlyName,
      schedule: job.cron || job.interval || job.timeout || 'manual',
      paused: job.paused,
      running: sails.quest.isRunning(job.name)
    }))

    return this.res.json({ jobs })
  }
}
```

### Admin Dashboard: Trigger Job Manually

```js
// api/controllers/admin/run-job.js
module.exports = {
  friendlyName: 'Run job',

  inputs: {
    name: {
      type: 'string',
      required: true
    }
  },

  fn: async function ({ name }) {
    const job = sails.quest.get(name)
    if (!job) {
      return this.res.notFound({ error: `Job "${name}" not found` })
    }

    if (sails.quest.isRunning(name)) {
      return this.res.json({ message: `Job "${name}" is already running` })
    }

    await sails.quest.run(name)
    return this.res.json({ message: `Job "${name}" triggered` })
  }
}
```

### Job Event Logging

```js
// config/bootstrap.js
module.exports.bootstrap = async function () {
  sails.on('quest:job:start', (data) => {
    sails.log.info(`[Quest] Starting: ${data.name}`)
  })

  sails.on('quest:job:complete', (data) => {
    sails.log.info(`[Quest] Complete: ${data.name} (${data.duration}ms)`)
  })

  sails.on('quest:job:error', (data) => {
    sails.log.error(`[Quest] Error: ${data.name} — ${data.error.message}`)
  })
}
```
