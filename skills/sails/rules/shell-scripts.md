---
name: shell-scripts
description: Sails.js shell scripts - background tasks, data migrations, cron jobs, maintenance scripts
metadata:
  tags: scripts, shell, background, migration, cron, tasks, maintenance
---

# Shell Scripts

Shell scripts are standalone Node.js scripts that run in the Sails environment with full access to models, helpers, and configuration. They're used for background tasks, data migrations, and maintenance jobs.

## Script Location

Scripts live in the `scripts/` directory at the project root:

```
scripts/
├── seed-database.js
├── migrate-users.js
├── send-weekly-digest.js
└── cleanup-expired-tokens.js
```

## Basic Script Structure

Every script must require and lift Sails to access the framework:

```js
// scripts/seed-database.js
module.exports = {
  friendlyName: 'Seed database',
  description: 'Populate the database with initial data.',

  fn: async function () {
    sails.log.info('Seeding database...')

    // Full access to models
    const adminCount = await User.count({ role: 'admin' })
    if (adminCount === 0) {
      await User.create({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: await sails.helpers.passwords.hashPassword('changeme'),
        emailStatus: 'verified'
      })
      sails.log.info('Created admin user')
    }

    // Full access to helpers
    const token = await sails.helpers.strings.random('url-friendly')
    sails.log.info('Generated token:', token)

    sails.log.info('Database seeding complete.')
  }
}
```

## Running Scripts

Run scripts with `sails run`:

```bash
# Run a script
sails run seed-database

# With environment
NODE_ENV=production sails run cleanup-expired-tokens
```

Or invoke directly with Node:

```bash
node scripts/seed-database.js
```

When using `sails run`, Sails automatically lifts the app (loading config, models, helpers, etc.), runs the script, then lowers.

## Data Migration Script

```js
// scripts/migrate-user-avatars.js
module.exports = {
  friendlyName: 'Migrate user avatars',
  description: 'Move avatar URLs from local storage to S3 references.',

  fn: async function () {
    sails.log.info('Starting avatar migration...')

    let migrated = 0

    await User.stream({ avatarUrl: { '!=': '' } }).eachRecord(async (user) => {
      if (user.avatarUrl && user.avatarUrl.startsWith('.tmp/')) {
        // Upload to S3 and update record
        // ... migration logic ...

        await User.updateOne({ id: user.id }).set({
          avatarUrl: newS3Url
        })
        migrated++

        if (migrated % 100 === 0) {
          sails.log.info(`Migrated ${migrated} avatars...`)
        }
      }
    })

    sails.log.info(`Migration complete. ${migrated} avatars migrated.`)
  }
}
```

## Cleanup Script

```js
// scripts/cleanup-expired-tokens.js
module.exports = {
  friendlyName: 'Cleanup expired tokens',
  description: 'Remove expired password reset and email verification tokens.',

  fn: async function () {
    const now = Date.now()

    // Clear expired password reset tokens
    const resetResult = await User.update({
      passwordResetToken: { '!=': '' },
      passwordResetTokenExpiresAt: { '<': now }
    })
      .set({
        passwordResetToken: '',
        passwordResetTokenExpiresAt: 0
      })
      .fetch()

    sails.log.info(`Cleared ${resetResult.length} expired reset tokens`)

    // Clear expired email proof tokens
    const proofResult = await User.update({
      emailProofToken: { '!=': '' },
      emailProofTokenExpiresAt: { '<': now }
    })
      .set({
        emailProofToken: '',
        emailProofTokenExpiresAt: 0
      })
      .fetch()

    sails.log.info(`Cleared ${proofResult.length} expired proof tokens`)
  }
}
```

## Bulk Email Script

```js
// scripts/send-weekly-digest.js
module.exports = {
  friendlyName: 'Send weekly digest',
  description: 'Send weekly activity digest to all verified users.',

  fn: async function () {
    sails.log.info('Sending weekly digests...')

    let sent = 0
    let failed = 0

    await User.stream({ emailStatus: 'verified' }).eachRecord(async (user) => {
      await sails.helpers.mail.send
        .with({
          to: user.email,
          subject: 'Your Weekly Digest',
          template: 'weekly-digest',
          templateData: {
            name: user.fullName
            // ... digest data
          }
        })
        .tolerate((err) => {
          sails.log.warn(`Failed to send digest to ${user.email}:`, err.message)
          failed++
        })

      sent++
      if (sent % 50 === 0) {
        sails.log.info(`Sent ${sent} digests...`)
      }
    })

    sails.log.info(`Done. Sent: ${sent}, Failed: ${failed}`)
  }
}
```

## Scheduling Scripts (Cron)

Use system cron or a scheduler to run scripts periodically:

```bash
# crontab -e
# Run cleanup every day at 3 AM
0 3 * * * cd /path/to/app && NODE_ENV=production sails run cleanup-expired-tokens

# Send weekly digest every Monday at 8 AM
0 8 * * 1 cd /path/to/app && NODE_ENV=production sails run send-weekly-digest
```

Or use `node-cron` within Sails (in a custom hook):

```js
// api/hooks/scheduler/index.js
const cron = require('node-cron')

module.exports = function defineSchedulerHook(sails) {
  return {
    initialize: async function () {
      // Run cleanup daily at 3 AM
      cron.schedule('0 3 * * *', async () => {
        sails.log.info('Running scheduled cleanup...')
        // Cleanup logic here
      })
    }
  }
}
```

## Script with Command-Line Arguments

Access arguments via `process.argv` or use a library:

```js
// scripts/delete-user.js
module.exports = {
  friendlyName: 'Delete user',
  description: 'Delete a user by email address.',

  inputs: {
    email: {
      type: 'string',
      required: true,
      description: 'The email of the user to delete'
    }
  },

  fn: async function ({ email }) {
    const user = await User.findOne({ email })
    if (!user) {
      sails.log.warn(`No user found with email: ${email}`)
      return
    }

    await User.destroyOne({ id: user.id })
    sails.log.info(`Deleted user: ${user.fullName} (${user.email})`)
  }
}
```

## Build Scripts (Static Content Generation)

Complex scripts can generate static content from external sources at deploy time. Fleet uses this to build docs, query libraries, and handbook content from YAML/Markdown in the monorepo:

```js
// scripts/build-static-content.js
module.exports = {
  friendlyName: 'Build static content',
  description:
    'Generate HTML from Markdown/YAML and write metadata to .sailsrc.',

  inputs: {
    dry: { type: 'boolean', description: "Dry run (don't write files)." },
    githubAccessToken: {
      type: 'string',
      description: 'For GitHub API requests.'
    }
  },

  fn: async function ({ dry, githubAccessToken }) {
    let path = require('path')
    let YAML = require('yaml')
    let topLvlRepoPath = path.resolve(sails.config.appPath, '../')

    let builtStaticContent = {}

    // Run multiple content pipelines in parallel
    await sails.helpers.flow.simultaneously([
      async () => {
        // Parse queries from YAML
        let yaml = await sails.helpers.fs.read(
          path.join(topLvlRepoPath, 'docs/queries.yml')
        )
        let queries = YAML.parseAllDocuments(yaml).map(
          (doc) => doc.toJSON().spec
        )
        builtStaticContent.queries = queries
      },
      async () => {
        // Parse markdown documentation
        // ...
        builtStaticContent.markdownPages = []
      }
    ])

    if (!dry) {
      // Write the built content to .sailsrc so it's available as sails.config.builtStaticContent
      let sailsRc = await sails.helpers.fs
        .readJson('.sailsrc')
        .tolerate('doesNotExist', () => ({}))
      sailsRc.builtStaticContent = builtStaticContent
      await sails.helpers.fs.writeJson.with({
        destination: '.sailsrc',
        json: sailsRc,
        force: true
      })
    }
  }
}
```

### Parallel Execution with `flow.simultaneously`

Run independent async tasks in parallel within a script:

```js
await sails.helpers.flow.simultaneously([
  async () => {
    /* task 1 */
  },
  async () => {
    /* task 2 */
  },
  async () => {
    /* task 3 */
  }
])
```

## Script Best Practices

1. **Always use `stream()`** for large datasets -- Don't load thousands of records into memory with `find()`
2. **Log progress** -- Print periodic status updates for long-running scripts
3. **Use `.tolerate()`** for non-critical failures -- Don't let one email failure stop the whole batch
4. **Test in development first** -- Run against development data before production
5. **Use transactions** for multi-record mutations that must be atomic
6. **Set NODE_ENV** when running against production -- Ensures correct config is loaded
