---
name: test-configuration
description: Sounding configuration for The Boring JavaScript Stack — config/sounding.js, config/env/test.js, datastores, mail capture, quiet logs, cleanup, and CI
metadata:
  tags: configuration, sounding, test-environment, datastore, mail, ci, cleanup
---

# Test Configuration

The Boring JavaScript Stack now separates testing concerns like this:

- `config/env/test.js` defines the app's test environment
- optional `config/sounding.js` overrides how Sounding runs trials against that app

Keep that split clean.

## config/env/test.js

Use `config/env/test.js` for app-level test behavior:

- port
- datastores
- `models.migrate`
- mail transport defaults
- log level
- app-level test-specific flags

A calm starting point looks like this:

```js
module.exports = {
  port: 3333,

  models: {
    migrate: 'drop'
  },

  mail: {
    default: 'log'
  },

  log: {
    level: 'error'
  }
}
```

## config/sounding.js

Add `config/sounding.js` only when your app actually needs an override. The cleanest override is usually the shorthand string form:

```js
module.exports.sounding = {
  datastore: 'inherit'
}
```

## Datastore guidance

Prefer Sails-native terms:

- say **datastore**, not database
- say **adapter**, not provider

Modes:

- `managed` — the default; Sounding provisions an isolated datastore with `sails-sqlite` under `.tmp/db`
- `inherit` — opt in when your app already has a test datastore story you want to preserve
- `external` — opt in when a dedicated external test datastore is already provisioned

Managed SQLite artifacts already default to `.tmp/db`, so most apps never need a `config/sounding.js` file at all.

## Request transport defaults

For non-browser trials, the calm default is:

```js
request: {
  transport: 'virtual'
}
```

That keeps request and Inertia trials fast and Sails-aware.
Use `transport: 'http'` only when real HTTP parity matters.

## Mail capture

Sounding's mail story should stay simple:

- mail capture is on by default in tests
- the mailbox remains in-memory
- it still goes through the real Sails mail path
- the original helper should be restored after the trial

This gives you truthful mail assertions without sending real mail.

## Cleanup and logging

Good defaults matter here.

Prefer:

- `app.quiet = true`
- filtered test output instead of noisy build chatter
- cleanup in `finally` paths
- managed datastore cleanup even after failed trials

A good test run should mostly show test output, not unrelated app noise.

## CI

The CI story should stay simple:

- install dependencies
- run unit trials
- run e2e/page trials
- upload artifacts only when useful

A typical flow:

```yaml
- run: npm run test:unit
- run: npm run test:e2e
```

Only add extra ceremony when the app genuinely needs it.
