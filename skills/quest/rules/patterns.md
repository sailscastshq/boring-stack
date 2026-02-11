---
name: patterns
description: Common background job patterns with complete script examples — cleanup, email queues, database maintenance, reports, webhook retries, cache warming, and monitoring
metadata:
  tags: patterns, examples, cleanup, email, reports, monitoring, quest
---

# Common Job Patterns

Complete, ready-to-use script examples for common background job scenarios.

## Cleanup Jobs

### Expired Session Cleanup

```js
// scripts/cleanup-sessions.js
module.exports = {
  friendlyName: 'Cleanup sessions',

  description: 'Remove expired sessions and their associated data.',

  quest: {
    interval: '1 hour',
    withoutOverlapping: true
  },

  inputs: {
    daysOld: {
      type: 'number',
      description: 'Remove sessions inactive for this many days.',
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

### Temporary File Cleanup

```js
// scripts/cleanup-temp-files.js
module.exports = {
  friendlyName: 'Cleanup temp files',

  description: 'Remove temporary upload files older than 24 hours.',

  quest: {
    cron: '0 3 * * *' // Daily at 3 AM
  },

  fn: async function () {
    const fs = require('fs').promises
    const path = require('path')
    const tempDir = path.resolve(sails.config.appPath, '.tmp/uploads')
    const cutoff = Date.now() - 24 * 60 * 60 * 1000

    let cleaned = 0
    try {
      const files = await fs.readdir(tempDir)
      for (const file of files) {
        const filePath = path.join(tempDir, file)
        const stat = await fs.stat(filePath)
        if (stat.mtimeMs < cutoff) {
          await fs.unlink(filePath)
          cleaned++
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }

    sails.log.info(`Cleaned up ${cleaned} temporary files`)
  }
}
```

### Soft-Deleted Record Purge

```js
// scripts/purge-deleted-records.js
module.exports = {
  friendlyName: 'Purge deleted records',

  description:
    'Permanently remove soft-deleted records after retention period.',

  quest: {
    cron: '0 2 * * SUN' // Weekly on Sunday at 2 AM
  },

  inputs: {
    retentionDays: {
      type: 'number',
      defaultsTo: 90
    }
  },

  fn: async function (inputs) {
    const cutoff = Date.now() - inputs.retentionDays * 24 * 60 * 60 * 1000

    const purged = await ArchivedRecord.destroy({
      archivedAt: { '<': cutoff }
    }).fetch()

    sails.log.info(
      `Purged ${purged.length} archived records older than ${inputs.retentionDays} days`
    )
  }
}
```

## Email Queue Processing

### Batch Email Sender

```js
// scripts/process-email-queue.js
module.exports = {
  friendlyName: 'Process email queue',

  description: 'Send queued emails in batches with rate limiting.',

  quest: {
    interval: '30 seconds',
    withoutOverlapping: true
  },

  inputs: {
    batchSize: {
      type: 'number',
      defaultsTo: 20
    }
  },

  fn: async function (inputs) {
    const emails = await EmailQueue.find({
      status: 'pending',
      limit: inputs.batchSize,
      sort: 'priority DESC, createdAt ASC'
    })

    if (emails.length === 0) return

    let sent = 0
    let failed = 0

    for (const email of emails) {
      try {
        await sails.helpers.sendEmail.with({
          to: email.to,
          subject: email.subject,
          template: email.template,
          templateData: email.data
        })

        await EmailQueue.updateOne({ id: email.id }).set({
          status: 'sent',
          sentAt: Date.now()
        })
        sent++
      } catch (err) {
        await EmailQueue.updateOne({ id: email.id }).set({
          status: 'failed',
          attempts: email.attempts + 1,
          lastError: err.message
        })
        failed++
      }
    }

    sails.log.info(`Email queue: ${sent} sent, ${failed} failed`)
  }
}
```

### Digest Email Compiler

```js
// scripts/send-daily-digest.js
module.exports = {
  friendlyName: 'Send daily digest',

  description: 'Compile and send daily activity digest to subscribed users.',

  quest: {
    cron: '0 8 * * *', // Daily at 8 AM
    timezone: 'America/New_York'
  },

  fn: async function () {
    const subscribers = await User.find({ digestEnabled: true })
    const yesterday = Date.now() - 24 * 60 * 60 * 1000

    for (const user of subscribers) {
      const activities = await Activity.find({
        user: user.id,
        createdAt: { '>': yesterday }
      })

      if (activities.length === 0) continue

      await sails.helpers.sendEmail.with({
        to: user.email,
        subject: `Your daily digest — ${activities.length} updates`,
        template: 'email-daily-digest',
        templateData: { user, activities }
      })
    }

    sails.log.info(`Sent digest to ${subscribers.length} users`)
  }
}
```

## Database Maintenance

### Data Aggregation

```js
// scripts/aggregate-analytics.js
module.exports = {
  friendlyName: 'Aggregate analytics',

  description: 'Roll up hourly analytics into daily summaries.',

  quest: {
    cron: '5 0 * * *' // Daily at 12:05 AM (after midnight boundary)
  },

  fn: async function () {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const endOfDay = new Date(yesterday)
    endOfDay.setHours(23, 59, 59, 999)

    const db = sails.getDatastore()
    await db.sendNativeQuery(
      `INSERT INTO daily_stats (date, page_views, unique_visitors, signups)
       SELECT DATE($1) as date,
              COUNT(*) as page_views,
              COUNT(DISTINCT visitor_id) as unique_visitors,
              (SELECT COUNT(*) FROM users WHERE created_at BETWEEN $1 AND $2) as signups
       FROM page_views
       WHERE created_at BETWEEN $1 AND $2
       ON CONFLICT (date) DO UPDATE SET
         page_views = EXCLUDED.page_views,
         unique_visitors = EXCLUDED.unique_visitors,
         signups = EXCLUDED.signups`,
      [yesterday.toISOString(), endOfDay.toISOString()]
    )

    sails.log.info(`Aggregated analytics for ${yesterday.toDateString()}`)
  }
}
```

## Report Generation

### Scheduled CSV Export

```js
// scripts/export-monthly-report.js
module.exports = {
  friendlyName: 'Export monthly report',

  description: 'Generate and email monthly report as CSV.',

  quest: {
    cron: '0 6 1 * *' // 1st of every month at 6 AM
  },

  inputs: {
    recipientEmail: {
      type: 'string',
      defaultsTo: 'admin@example.com'
    }
  },

  fn: async function (inputs) {
    const now = new Date()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    )

    const orders = await Order.find({
      createdAt: {
        '>=': startOfLastMonth.getTime(),
        '<=': endOfLastMonth.getTime()
      },
      sort: 'createdAt ASC'
    }).populate('customer')

    // Build CSV
    const header = 'Order ID,Customer,Amount,Status,Date\n'
    const rows = orders
      .map(
        (o) =>
          `${o.id},${o.customer.fullName},${o.amount},${o.status},${new Date(
            o.createdAt
          ).toISOString()}`
      )
      .join('\n')
    const csv = header + rows

    const monthName = startOfLastMonth.toLocaleString('en', {
      month: 'long',
      year: 'numeric'
    })

    await sails.helpers.sendEmail.with({
      to: inputs.recipientEmail,
      subject: `Monthly Report — ${monthName}`,
      template: 'email-monthly-report',
      templateData: {
        monthName,
        orderCount: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0)
      },
      attachments: [
        {
          filename: `report-${monthName.toLowerCase().replace(' ', '-')}.csv`,
          content: csv
        }
      ]
    })

    sails.log.info(
      `Monthly report sent: ${orders.length} orders for ${monthName}`
    )
  }
}
```

## Webhook Retries

### Failed Webhook Retry with Backoff

```js
// scripts/retry-webhooks.js
module.exports = {
  friendlyName: 'Retry webhooks',

  description: 'Retry failed webhook deliveries with exponential backoff.',

  quest: {
    interval: '1 minute',
    withoutOverlapping: true
  },

  inputs: {
    maxAttempts: {
      type: 'number',
      defaultsTo: 5
    },
    batchSize: {
      type: 'number',
      defaultsTo: 10
    }
  },

  fn: async function (inputs) {
    const pendingWebhooks = await WebhookDelivery.find({
      status: 'failed',
      attempts: { '<': inputs.maxAttempts },
      limit: inputs.batchSize,
      sort: 'lastAttemptAt ASC'
    })

    for (const webhook of pendingWebhooks) {
      // Exponential backoff: 1m, 2m, 4m, 8m, 16m
      const backoffMs = Math.pow(2, webhook.attempts) * 60 * 1000
      const nextRetryAt = webhook.lastAttemptAt + backoffMs

      if (Date.now() < nextRetryAt) continue

      try {
        const response = await sails.helpers.http.post(
          webhook.url,
          webhook.payload,
          {
            headers: webhook.headers,
            timeout: 10000
          }
        )

        await WebhookDelivery.updateOne({ id: webhook.id }).set({
          status: 'delivered',
          responseCode: response.statusCode,
          deliveredAt: Date.now()
        })
      } catch (err) {
        const newAttempts = webhook.attempts + 1
        await WebhookDelivery.updateOne({ id: webhook.id }).set({
          attempts: newAttempts,
          lastAttemptAt: Date.now(),
          lastError: err.message,
          status:
            newAttempts >= inputs.maxAttempts ? 'permanently_failed' : 'failed'
        })
      }
    }
  }
}
```

## Cache Warming

### Dashboard Cache Pre-Computation

```js
// scripts/warm-dashboard-cache.js
module.exports = {
  friendlyName: 'Warm dashboard cache',

  description: 'Pre-compute expensive dashboard queries.',

  quest: {
    interval: '15 minutes'
  },

  fn: async function () {
    const stats = {
      totalUsers: await User.count(),
      activeUsers: await User.count({
        lastActiveAt: { '>': Date.now() - 30 * 24 * 60 * 60 * 1000 }
      }),
      totalOrders: await Order.count(),
      revenue: await Order.sum('amount', { status: 'completed' }),
      recentSignups: await User.count({
        createdAt: { '>': Date.now() - 7 * 24 * 60 * 60 * 1000 }
      }),
      computedAt: Date.now()
    }

    // Store in a cache model or in-memory store
    await CacheEntry.updateOrCreate(
      { key: 'dashboard-stats' },
      {
        key: 'dashboard-stats',
        value: JSON.stringify(stats),
        expiresAt: Date.now() + 20 * 60 * 1000
      }
    )

    sails.log.info('Dashboard cache warmed')
  }
}
```

## Monitoring

### External API Health Check

```js
// scripts/health-check.js
module.exports = {
  friendlyName: 'Health check',

  description: 'Monitor external API dependencies and alert on failures.',

  quest: {
    interval: '5 minutes'
  },

  inputs: {
    endpoints: {
      type: 'ref',
      defaultsTo: [
        { name: 'Payment API', url: 'https://api.stripe.com/v1' },
        { name: 'Email Service', url: 'https://api.sendgrid.com/v3' }
      ]
    }
  },

  fn: async function (inputs) {
    for (const endpoint of inputs.endpoints) {
      try {
        const start = Date.now()
        await sails.helpers.http.get(endpoint.url, { timeout: 5000 })
        const latency = Date.now() - start

        if (latency > 3000) {
          sails.log.warn(
            `[Health] ${endpoint.name}: slow response (${latency}ms)`
          )
        }
      } catch (err) {
        sails.log.error(`[Health] ${endpoint.name}: DOWN — ${err.message}`)

        await sails.helpers.sendSlackAlert.with({
          channel: '#ops-alerts',
          message: `🚨 ${endpoint.name} is unreachable: ${err.message}`
        })
      }
    }
  }
}
```

### Stale Data Monitor

```js
// scripts/monitor-stale-data.js
module.exports = {
  friendlyName: 'Monitor stale data',

  description: 'Alert when data synchronization falls behind.',

  quest: {
    interval: '10 minutes'
  },

  fn: async function () {
    const thresholdMinutes = 30
    const cutoff = Date.now() - thresholdMinutes * 60 * 1000

    const staleFeeds = await DataFeed.find({
      lastSyncAt: { '<': cutoff },
      enabled: true
    })

    if (staleFeeds.length > 0) {
      const feedNames = staleFeeds.map((f) => f.name).join(', ')
      sails.log.warn(`[Monitor] Stale data feeds: ${feedNames}`)

      await sails.helpers.sendSlackAlert.with({
        channel: '#ops-alerts',
        message: `Data feeds behind schedule: ${feedNames}\nLast sync > ${thresholdMinutes} minutes ago.`
      })
    }
  }
}
```

## Job Event Logging Pattern

Log all job activity for monitoring and debugging:

```js
// config/bootstrap.js
module.exports.bootstrap = async function () {
  // Log to database for audit trail
  sails.on('quest:job:start', async (data) => {
    await JobLog.create({
      jobName: data.name,
      event: 'start',
      inputs: data.inputs,
      timestamp: data.timestamp
    })
  })

  sails.on('quest:job:complete', async (data) => {
    await JobLog.create({
      jobName: data.name,
      event: 'complete',
      inputs: data.inputs,
      duration: data.duration,
      timestamp: data.timestamp
    })
  })

  sails.on('quest:job:error', async (data) => {
    await JobLog.create({
      jobName: data.name,
      event: 'error',
      inputs: data.inputs,
      duration: data.duration,
      error: data.error.message,
      timestamp: data.timestamp
    })

    // Also alert on errors
    await sails.helpers.sendSlackAlert.with({
      channel: '#ops-alerts',
      message: `Job "${data.name}" failed after ${data.duration}ms:\n${data.error.message}`
    })
  })
}
```
