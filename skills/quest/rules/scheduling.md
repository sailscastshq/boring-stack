---
name: scheduling
description: All scheduling formats supported by Quest — cron expressions, human-readable intervals, shorthand notation, later.js text, one-time execution, and timezone configuration
metadata:
  tags: cron, interval, scheduling, timeout, date, timezone, quest
---

# Scheduling Formats

Quest supports multiple scheduling formats through three parsing libraries: `cron-parser`, `human-interval`, and `@breejs/later`. Choose the format that best fits your use case.

## Cron Expressions

Standard 5-field cron format. Best for time-of-day or calendar-based schedules.

```js
// scripts/daily-backup.js
module.exports = {
  friendlyName: 'Daily backup',
  description: 'Back up the database every day at 2 AM.',

  quest: {
    cron: '0 2 * * *'
  },

  fn: async function () {
    await sails.helpers.backupDatabase()
  }
}
```

### Common Cron Patterns

```js
quest: {
  cron: '* * * * *'
} // Every minute
quest: {
  cron: '*/5 * * * *'
} // Every 5 minutes
quest: {
  cron: '0 * * * *'
} // Every hour (on the hour)
quest: {
  cron: '0 2 * * *'
} // Daily at 2:00 AM
quest: {
  cron: '0 9 * * MON'
} // Every Monday at 9:00 AM
quest: {
  cron: '0 0 1 * *'
} // First day of every month at midnight
quest: {
  cron: '0 0 * * MON-FRI'
} // Weekdays at midnight
quest: {
  cron: '0 */6 * * *'
} // Every 6 hours
quest: {
  cron: '30 4 * * SUN'
} // Every Sunday at 4:30 AM
```

### Cron Field Reference

```
┌──────── minute (0–59)
│ ┌────── hour (0–23)
│ │ ┌──── day of month (1–31)
│ │ │ ┌── month (1–12 or JAN–DEC)
│ │ │ │ ┌ day of week (0–7 or SUN–SAT, 0 and 7 are Sunday)
│ │ │ │ │
* * * * *
```

### Cron Options

Pass custom options to `cron-parser` via `cronOptions`:

```js
quest: {
  cron: '0 9 * * *',
  cronOptions: {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31')
  }
}
```

## Human-Readable Intervals

Natural language intervals parsed by the `human-interval` library. Best for simple recurring intervals.

```js
// scripts/health-check.js
module.exports = {
  friendlyName: 'Health check',
  description: 'Ping external APIs every 5 minutes.',

  quest: {
    interval: '5 minutes'
  },

  fn: async function () {
    const status = await sails.helpers.checkApiHealth()
    if (!status.healthy) {
      await sails.helpers.sendSlackAlert.with({
        message: `API unhealthy: ${status.error}`
      })
    }
  }
}
```

### Supported Interval Formats

```js
// Seconds
quest: {
  interval: '30 seconds'
}

// Minutes
quest: {
  interval: '5 minutes'
}
quest: {
  interval: '1 minute'
}

// Hours
quest: {
  interval: '2 hours'
}
quest: {
  interval: '1 hour'
}

// Days
quest: {
  interval: '7 days'
}
quest: {
  interval: '1 day'
}

// "every" prefix also works
quest: {
  interval: 'every 5 minutes'
}
quest: {
  interval: 'every 2 hours'
}
```

## Shorthand Notation

Compact format for quick interval definitions. The shorthand is converted internally to the full human-readable format.

```js
quest: {
  interval: '5s'
} // → '5 seconds'
quest: {
  interval: '10m'
} // → '10 minutes'
quest: {
  interval: '2h'
} // → '2 hours'
quest: {
  interval: '1d'
} // → '1 day'
quest: {
  interval: '30s'
} // → '30 seconds'
```

### Shorthand Reference

| Suffix | Expands To | Example              |
| ------ | ---------- | -------------------- |
| `s`    | seconds    | `30s` → `30 seconds` |
| `m`    | minutes    | `5m` → `5 minutes`   |
| `h`    | hours      | `2h` → `2 hours`     |
| `d`    | days       | `1d` → `1 day`       |

## Numeric Intervals (Milliseconds)

Pass a number to set the interval in milliseconds:

```js
quest: {
  interval: 300000
} // Every 5 minutes (300,000 ms)
quest: {
  interval: 60000
} // Every 1 minute
quest: {
  interval: 3600000
} // Every 1 hour
```

## Later.js Text Expressions

For complex calendar-based schedules, use text expressions parsed by `@breejs/later`:

```js
quest: {
  interval: 'at 10:00 am'
}
quest: {
  interval: 'at 3:30 pm'
}
quest: {
  interval: 'at 10:00 am on the 1st'
}
quest: {
  interval: 'at 10:00 am on the 15th'
}
```

These expressions support the full `later.parse.text()` syntax.

## One-Time Execution

### Timeout (Delayed One-Time Run)

Run a job once after a specified delay from when Sails lifts:

```js
// scripts/warmup-cache.js
module.exports = {
  friendlyName: 'Warmup cache',
  description: 'Pre-compute expensive queries after startup.',

  quest: {
    timeout: '10 minutes'
  },

  fn: async function () {
    await sails.helpers.warmupDashboardCache()
  }
}
```

Timeout accepts all the same formats as interval:

```js
quest: {
  timeout: '30 seconds'
} // Human-readable
quest: {
  timeout: '5m'
} // Shorthand
quest: {
  timeout: 60000
} // Milliseconds
quest: {
  timeout: 'at 3:00 pm'
} // Later.js (next occurrence)
```

### Specific Date

Run a job once at an exact date and time:

```js
// scripts/launch-campaign.js
module.exports = {
  friendlyName: 'Launch campaign',
  description: 'Start the marketing campaign at a specific time.',

  quest: {
    date: new Date('2025-03-15T09:00:00Z')
  },

  fn: async function () {
    await sails.helpers.activateCampaign()
    await sails.helpers.sendNotification.with({
      message: 'Campaign is now live!'
    })
  }
}
```

**Note:** `date` and `timeout` cannot be combined — use one or the other. If the date is in the past, the job will not run.

## Timezone Configuration

### Global Timezone

Set the default timezone for all cron jobs in `config/quest.js`:

```js
// config/quest.js
module.exports.quest = {
  timezone: 'America/New_York'
}
```

### Per-Job Timezone Override

Override the global timezone for a specific job:

```js
// scripts/eu-report.js
module.exports = {
  friendlyName: 'EU daily report',

  quest: {
    cron: '0 9 * * *',
    timezone: 'Europe/London' // Run at 9 AM London time
  },

  fn: async function () {
    // ...
  }
}
```

The timezone primarily affects cron expressions. Interval-based schedules (like `'5 minutes'`) are timezone-agnostic since they're relative delays.

## Decision Guide

| Use Case                     | Format          | Example                                     |
| ---------------------------- | --------------- | ------------------------------------------- |
| Run at specific times of day | Cron            | `cron: '0 9 * * *'`                         |
| Run on specific days         | Cron            | `cron: '0 0 * * MON'`                       |
| Run every N minutes/hours    | Interval        | `interval: '5 minutes'`                     |
| Quick prototyping            | Shorthand       | `interval: '30s'`                           |
| Complex calendar rules       | Later.js        | `interval: 'at 10:00 am on the 1st'`        |
| Run once after delay         | Timeout         | `timeout: '10 minutes'`                     |
| Run at exact date            | Date            | `date: new Date('2025-03-15')`              |
| Need timezone control        | Cron + timezone | `cron: '0 9 * * *', timezone: 'US/Eastern'` |

## Long Delays

JavaScript's `setTimeout` has a maximum safe delay of ~24.8 days (2,147,483,647 ms). Quest handles this automatically — for schedules beyond this limit, it sets intermediate timers that recalculate and reschedule as the target time approaches. You don't need to worry about this.
