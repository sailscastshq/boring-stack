---
name: hooks
description: Sails.js hooks - app-level hooks, the custom hook, shared data, route middleware, lifecycle
metadata:
  tags: hooks, custom, middleware, lifecycle, initialize, routes, shared-data
---

# Hooks

Hooks are Sails' plugin system. The most important hook in The Boring Stack is the **custom hook** (`api/hooks/custom/index.js`), which sets up shared Inertia data and route-level middleware.

## The Custom Hook

Every Boring Stack app has a custom hook that initializes shared data and request middleware:

```js
// api/hooks/custom/index.js
module.exports = function defineCustomHook(sails) {
  return {
    initialize: async function () {
      sails.log.info('Initializing custom hook (`api/hooks/custom`)')
    },

    routes: {
      before: {
        'GET /*': {
          skipAssets: true,
          fn: async function (req, res, next) {
            // Share data with every Inertia page
            sails.inertia.share(
              'loggedInUser',
              sails.inertia.once(async () => {
                if (!req.session.userId) return null
                const user = await User.findOne({ id: req.session.userId })
                if (!user) return null
                return {
                  id: user.id,
                  email: user.email,
                  fullName: user.fullName,
                  initials: user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                }
              })
            )

            // Share flash messages
            sails.inertia.share(
              'flash',
              sails.inertia.always(() => ({
                success: req.session.flash?.success || null,
                error: req.session.flash?.error || null
              }))
            )

            return next()
          }
        }
      }
    }
  }
}
```

### What Happens in the Custom Hook

1. **`routes.before`** -- Registers middleware that runs before every GET request
2. **`skipAssets: true`** -- Skips static file requests (CSS, JS, images)
3. **`sails.inertia.share()`** -- Makes data available as props on every Inertia page
4. **`sails.inertia.once()`** -- Caches the value so the callback only runs once per session
5. **`sails.inertia.always()`** -- Runs the callback on every request (for dynamic data like flash messages)

## Hook Specification

A hook is a function that receives `sails` and returns an object with lifecycle methods:

```js
// api/hooks/my-hook/index.js
module.exports = function myHook(sails) {
  return {
    // Default configuration values
    defaults: {
      myHook: {
        enabled: true,
        timeout: 5000
      }
    },

    // Run after defaults are merged, before initialize
    configure: function () {
      // Access config: sails.config.myHook.enabled
    },

    // Startup tasks (can be async)
    initialize: async function () {
      sails.log.info('My hook initialized!')

      // Wait for another hook if needed
      // await new Promise((resolve) => {
      //   sails.on('hook:orm:loaded', resolve)
      // })
    },

    // Route middleware
    routes: {
      before: {
        'GET /*': function (req, res, next) {
          // Runs before custom/action routes
          return next()
        }
      },
      after: {
        'GET /*': function (req, res, next) {
          // Runs after custom/action routes
          return next()
        }
      }
    }
  }
}
```

### Hook Lifecycle Order

1. **`defaults`** -- Merge default config values
2. **`configure`** -- Run configuration logic
3. **`initialize`** -- Run startup tasks
4. **`routes`** -- Bind route middleware

### Hook Events

When a hook finishes initializing, it emits `hook:<name>:loaded`:

```js
// Wait for the ORM before doing something
sails.on('hook:orm:loaded', () => {
  // Models are now available
})

// Wait for multiple hooks
sails.after(['hook:orm:loaded', 'hook:custom:loaded'], () => {
  // Both ORM and custom hook are ready
})
```

## Real-World Custom Hook Patterns

### Config Validation on Initialize

Check that required integrations are configured at startup:

```js
initialize: async function () {
  var IMPORTANT_STRIPE_CONFIG = ['stripeSecret', 'stripePublishableKey']
  var isMissingStripeConfig = _.difference(IMPORTANT_STRIPE_CONFIG, Object.keys(sails.config.custom)).length > 0

  if (isMissingStripeConfig) {
    sails.log.verbose('Missing Stripe config -- billing features will be disabled.')
  }

  // Compute a derived config flag from the check
  sails.config.custom.enableBillingFeatures = !isMissingStripeConfig
}
```

### Waiting for Another Hook Before Configuring

Use `sails.after()` to wait for a dependency hook:

```js
initialize: async function () {
  sails.after('hook:organics:loaded', () => {
    sails.helpers.stripe.configure({
      secret: sails.config.custom.stripeSecret
    })
    sails.helpers.sendgrid.configure({
      secret: sails.config.custom.sendgridSecret,
      from: sails.config.custom.fromEmailAddress,
      fromName: sails.config.custom.fromName,
    })
  })
}
```

### The `req.me` Pattern

Attach the logged-in user to the request so actions and policies can use `this.req.me` / `req.me`:

```js
routes: {
  before: {
    '/*': {
      skipAssets: true,
      fn: async function (req, res, next) {
        // Default to undefined so views don't need typeof checks
        res.locals.me = undefined

        if (!req.session || !req.session.userId) {
          return next()
        }

        var loggedInUser = await User.findOne({ id: req.session.userId })
        if (!loggedInUser) {
          sails.log.warn('User record for session userId has gone missing...')
          delete req.session.userId
          return res.unauthorized()
        }

        // Expose on req for use in actions and policies
        req.me = loggedInUser

        // Expose sanitized version as a view local (strips protect: true fields)
        var sanitizedUser = _.extend({}, loggedInUser)
        sails.helpers.redactUser(sanitizedUser)
        res.locals.me = sanitizedUser

        return next()
      }
    }
  }
}
```

### Setting Security Headers in the Hook

```js
if (req.method === 'GET' || req.method === 'HEAD') {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains;'
  )
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), usb=()')
}
```

### Background Task After Response

Track page views or analytics without blocking the response using `res.once('finish')`:

```js
res.once('finish', function onceFinish() {
  if (res.statusCode === 200) {
    sails.helpers.flow
      .build(async () => {
        await sails.helpers.crm.trackPageView.with({
          userId: sanitizedUser.id,
          url: req.url
        })
      })
      .exec((err) => {
        // Use .exec() to run in the background
        if (err) {
          sails.log.warn('Background CRM tracking failed:', err)
        }
      })
  }
})
```

### Updating `lastSeenAt` Without Blocking

A common optimization -- fire-and-forget the DB update:

```js
var MS_TO_BUFFER = 60 * 1000
var now = Date.now()
if (loggedInUser.lastSeenAt < now - MS_TO_BUFFER) {
  User.updateOne({ id: loggedInUser.id })
    .set({ lastSeenAt: now })
    .exec((err) => {
      // Meanwhile, the request continues...
      if (err) {
        sails.log.error(
          'Could not update lastSeenAt for user ' + loggedInUser.id,
          err
        )
      }
    })
}
```

## Creating App-Level Hooks

### Directory Structure

```
api/hooks/
├── custom/
│   └── index.js        ← The main custom hook (shared data, middleware)
├── billing/
│   └── index.js        ← A billing hook
└── analytics.js        ← A single-file hook
```

### Example: Rate Limiting Hook

```js
// api/hooks/rate-limit/index.js
module.exports = function rateLimitHook(sails) {
  const rateMap = new Map()

  return {
    defaults: {
      rateLimit: {
        maxRequests: 100,
        windowMs: 60000
      }
    },

    routes: {
      before: {
        'POST /*': function (req, res, next) {
          const key = req.ip
          const now = Date.now()
          const window = sails.config.rateLimit.windowMs
          const max = sails.config.rateLimit.maxRequests

          const entry = rateMap.get(key) || { count: 0, start: now }
          if (now - entry.start > window) {
            entry.count = 0
            entry.start = now
          }

          entry.count++
          rateMap.set(key, entry)

          if (entry.count > max) {
            return res.status(429).json({ error: 'Too many requests' })
          }

          return next()
        }
      }
    }
  }
}
```

## Installable Hooks (npm packages)

Hooks from npm are automatically loaded. The `inertia-sails` package is a hook:

```json
// package.json
{
  "dependencies": {
    "inertia-sails": "^1.1.0"
  }
}
```

The hook is loaded because its package name starts with `sails-hook-` or it declares a `sails` key in its `package.json`:

```json
{
  "sails": {
    "isHook": true,
    "hookName": "inertia"
  }
}
```

## Disabling Hooks

In `.sailsrc`:

```json
{
  "hooks": {
    "grunt": false,
    "sockets": false,
    "pubsub": false
  }
}
```

The Boring Stack typically disables `grunt` (replaced by Shipwright/Vite) and may disable `sockets` and `pubsub` if not using WebSockets.
