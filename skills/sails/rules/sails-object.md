---
name: sails-object
description: The global sails object - sails.config, sails.helpers, sails.models, sails.hooks, sails.log, sails.getDatastore, sails.getUrlFor
metadata:
  tags: sails, global, config, helpers, models, hooks, log, getDatastore, getUrlFor
---

# The Global sails Object

The `sails` object is available globally throughout your application. It provides access to configuration, models, helpers, hooks, logging, and utility methods.

## sails.config

Access any configuration value:

```js
sails.config.custom.baseUrl // From config/custom.js
sails.config.custom.appName // App name
sails.config.datastores.default // Default datastore config
sails.config.models.migrate // Migration strategy
sails.config.session.secret // Session secret
sails.config.security.csrf // CSRF setting
sails.config.port // Server port
sails.config.environment // 'development' or 'production'
sails.config.appPath // Absolute path to app root
```

### Custom Configuration

`config/custom.js` is the recommended place for app-specific settings:

```js
// config/custom.js
module.exports.custom = {
  appName: 'My App',
  baseUrl: 'http://localhost:1337',
  passwordResetTokenTTL: 24 * 60 * 60 * 1000,
  emailProofTokenTTL: 24 * 60 * 60 * 1000,
  invitationExpiresTTL: 7 * 24 * 60 * 60 * 1000,
  rememberMeCookieMaxAge: 30 * 24 * 60 * 60 * 1000,
  internalEmail: 'contact@example.com',
  stripeSecretKey: '',
  stripePublishableKey: ''
}

// Access anywhere:
const ttl = sails.config.custom.passwordResetTokenTTL
const url = `${sails.config.custom.baseUrl}/verify-email/${token}`
```

## sails.helpers

Call any helper:

```js
// Direct invocation (single-input helpers)
const hash = await sails.helpers.passwords.hashPassword(password)

// Named arguments (multiple inputs)
await sails.helpers.mail.send.with({
  to: user.email,
  subject: 'Welcome!',
  template: 'welcome',
  templateData: { name: user.fullName }
})

// Synchronous helpers (if marked sync: true)
const url = sails.helpers.getGravatarUrl(email)
```

Helper namespace maps to directory structure:

```
api/helpers/format-currency.js        → sails.helpers.formatCurrency()
api/helpers/passwords/hash-password.js → sails.helpers.passwords.hashPassword()
api/helpers/mail/send.js              → sails.helpers.mail.send()
api/helpers/user/get-default-team.js  → sails.helpers.user.getDefaultTeam()
```

## sails.models

Access models programmatically (useful when globals are disabled or for dynamic model access):

```js
sails.models.user // Same as User global
sails.models.team // Same as Team global
sails.models.membership // Same as Membership global

// Dynamic model access
const modelName = 'user'
const records = await sails.models[modelName].find()
```

**Note**: Model names in `sails.models` are always lowercase, regardless of filename casing.

## sails.hooks

Access loaded hooks:

```js
sails.hooks.custom // The custom hook instance
sails.hooks.orm // The ORM hook
sails.hooks.inertia // The Inertia.js hook (from inertia-sails)
sails.hooks.policies // The policies hook
sails.hooks.helpers // The helpers hook
```

### Hook Events

Wait for specific hooks to load:

```js
sails.on('hook:orm:loaded', () => {
  // Models are now available
})

sails.after(['hook:orm:loaded', 'hook:custom:loaded'], () => {
  // Both ORM and custom hook are ready
})
```

## sails.log

CaptainsLog logging with levels:

```js
sails.log('Default message') // info level
sails.log.verbose('Detailed debug info') // verbose (most detailed)
sails.log.info('Server started on port 1337') // informational
sails.log.debug('Processing user:', userId) // debug
sails.log.warn('Deprecated method called') // warning
sails.log.error('Failed to send email:', err) // error
```

Log level is set in config:

```js
// config/log.js
module.exports.log = {
  level: 'info' // Show info and above (info, warn, error)
}
```

Each level includes all levels above it:

```
verbose → info → debug → warn → error → silent
```

## sails.getDatastore()

Access the underlying datastore for raw queries and transactions:

```js
// Get the default datastore
const datastore = sails.getDatastore()

// Get a named datastore
const contentStore = sails.getDatastore('content')

// Transactions
await sails.getDatastore().transaction(async (db) => {
  await User.create({ ... }).fetch().usingConnection(db)
  await Team.create({ ... }).fetch().usingConnection(db)
})

// Raw database access (advanced)
const db = sails.getDatastore().manager
```

## sails.getUrlFor()

Generate a URL for a named action:

```js
const loginUrl = sails.getUrlFor('auth/login') // '/login'
const dashUrl = sails.getUrlFor('dashboard/view-dashboard') // '/dashboard'
```

This resolves the URL by looking up which route points to the given action identity.

## sails.getRouteFor()

Get the full route configuration for an action:

```js
const route = sails.getRouteFor('auth/login')
// { method: 'POST', url: '/login' }
```

## sails.inertia

The Inertia.js hook (from `inertia-sails`) provides:

```js
// Share data with all Inertia pages
sails.inertia.share('key', value)

// Share with caching (only fetched once until refreshed)
sails.inertia.share(
  'loggedInUser',
  sails.inertia.once(async () => {
    return await User.findOne({ id: req.session.userId })
  })
)

// Force refresh of cached data
sails.inertia.refreshOnce('loggedInUser')

// Flash a message (available for one request)
sails.inertia.flash('success', 'Profile updated!')
sails.inertia.flash('error', 'Something went wrong.')

// Flush shared data (e.g., on logout)
sails.inertia.flushShared()
sails.inertia.flushShared('loggedInUser') // Flush specific key

// Clear client-side history (for security on logout)
sails.inertia.clearHistory()
```

## sails.uploadOne() / sails.upload()

File upload utilities:

```js
// Upload a single file
const fileInfo = await sails.uploadOne(avatar, { maxBytes: 5 * 1024 * 1024 })

// Upload multiple files
const files = await sails.upload(documents, { maxBytes: 50 * 1024 * 1024 })

// Delete an uploaded file
await sails.rm(fileInfo.fd)
```

## sails.lift() / sails.lower()

Lifecycle methods (rarely used directly -- usually handled by `app.js`):

```js
// Start the server
sails.lift({ port: 1337 }, (err) => {
  if (err) throw err
  console.log('Sails lifted on port', sails.config.port)
})

// Gracefully shut down
sails.lower((err) => {
  if (err) console.error(err)
  process.exit()
})
```

## Other sails Properties

```js
sails.config.appPath // Absolute path to the app root directory
sails.config.port // Server port (default: 1337)
sails.config.environment // 'development' or 'production'

// Event emitter methods (Sails extends EventEmitter)
sails.on('ready', () => {
  /* server is listening */
})
sails.emit('custom-event', data)
```

## Using sails in Different Contexts

| Context       | How to access sails                        |
| ------------- | ------------------------------------------ |
| Actions       | `sails` (global) or `this.req._sails`      |
| Helpers       | `sails` (global)                           |
| Models        | `sails` (global)                           |
| Policies      | `sails` (global) or `req._sails`           |
| Hooks         | Passed as argument: `function(sails) { }`  |
| Bootstrap     | `sails` (global)                           |
| Shell scripts | `sails` (global, after lift)               |
| Tests         | `sails` (global, after lift in test setup) |
