---
name: configuration
description: Sails.js configuration - config files, environment variables, custom settings, datastores, globals
metadata:
  tags: config, environment, custom, datastores, globals, bootstrap, settings
---

# Configuration

All Sails configuration lives in the `config/` directory. Each file exports a key that merges into `sails.config`.

## Config File Overview

| File                   | Access As                 | Purpose                         |
| ---------------------- | ------------------------- | ------------------------------- |
| `config/routes.js`     | `sails.config.routes`     | URL-to-action mappings          |
| `config/policies.js`   | `sails.config.policies`   | Action-to-policy mappings       |
| `config/models.js`     | `sails.config.models`     | Default model settings          |
| `config/datastores.js` | `sails.config.datastores` | Database connections            |
| `config/custom.js`     | `sails.config.custom`     | App-specific settings           |
| `config/security.js`   | `sails.config.security`   | CORS, CSRF settings             |
| `config/session.js`    | `sails.config.session`    | Session store, cookies          |
| `config/globals.js`    | `sails.config.globals`    | Global variable exposure        |
| `config/blueprints.js` | `sails.config.blueprints` | Auto-generated REST routes      |
| `config/bootstrap.js`  | `sails.config.bootstrap`  | Startup function                |
| `config/inertia.js`    | `sails.config.inertia`    | Inertia.js settings (SSR, etc.) |

## Custom Configuration

`config/custom.js` is the place for all your app-specific settings:

```js
// config/custom.js
module.exports.custom = {
  // App info
  appName: 'My App',
  appUrl: 'http://localhost:1337',

  // Email
  mailgunDomain: 'mg.example.com',
  mailgunApiKey: '',

  // Stripe
  stripeSecretKey: '',
  stripePublishableKey: '',
  stripePrices: {
    starter: 'price_xxx',
    pro: 'price_yyy'
  },

  // Feature flags
  enableBetaFeatures: false
}
```

Access anywhere: `sails.config.custom.stripeSecretKey`

## Datastores

```js
// config/datastores.js
module.exports.datastores = {
  default: {
    adapter: 'sails-postgresql',
    url: 'postgresql://user:pass@localhost:5432/myapp'
  }
}
```

Common adapters:

- `sails-postgresql` -- PostgreSQL
- `sails-mysql` -- MySQL
- `sails-mongo` -- MongoDB
- `sails-disk` -- Local disk (development only)

## Models Configuration

```js
// config/models.js
module.exports.models = {
  // Auto-migration strategy
  migrate: 'alter', // 'alter' (dev), 'safe' (production), 'drop' (reset)

  // Default attributes for ALL models
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true },
    updatedAt: { type: 'number', autoUpdatedAt: true },
    id: { type: 'string', columnName: '_id' }, // MongoDB style
    // or
    id: { type: 'number', autoIncrement: true } // SQL style
  },

  // Archive soft-deleted records
  archiveModelIdentity: 'archive',

  // Cascade deletes to associated records
  cascadeOnDestroy: true,

  // Return updated records after .update()
  fetchRecordsOnUpdate: true,
  fetchRecordsOnCreate: true,
  fetchRecordsOnCreateEach: true,
  fetchRecordsOnDestroy: false,

  // Data encryption key
  dataEncryptionKeys: {
    default: 'your-encryption-key-here'
  }
}
```

## Session Configuration

```js
// config/session.js
module.exports.session = {
  // Cookie name
  name: 'my-app.sid',

  // Session secret (auto-generated if not set)
  secret: process.env.SESSION_SECRET || 'default-dev-secret',

  // Cookie settings
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false // Set true in production with HTTPS
  }

  // Redis session store (for production)
  // adapter: '@sailshq/connect-redis',
  // url: process.env.REDIS_URL,
}
```

## Globals

```js
// config/globals.js
module.exports.globals = {
  sails: true, // Access `sails` globally
  models: true, // Access models like `User` globally
  helpers: false, // Use `sails.helpers.*` instead
  _: false, // Disable lodash global
  async: false // Disable async global
}
```

## Blueprints

The Boring Stack typically disables blueprint routes (since routes are explicit):

```js
// config/blueprints.js
module.exports.blueprints = {
  actions: false, // No auto-routes for actions
  rest: false, // No auto-REST routes for models
  shortcuts: false // No shortcut routes
}
```

## Bootstrap

`config/bootstrap.js` runs once when Sails starts:

```js
// config/bootstrap.js
module.exports.bootstrap = async function () {
  // Seed database, warm caches, etc.
  const adminCount = await User.count({ role: 'admin' })
  if (adminCount === 0) {
    sails.log.info('No admin users found. Creating default admin...')
    await User.create({
      email: 'admin@example.com',
      password: await sails.helpers.passwords.hashPassword('changeme'),
      role: 'admin',
      fullName: 'Admin'
    })
  }
}
```

## Environment-Specific Configuration

### `config/env/production.js`

Overrides for production:

```js
// config/env/production.js
module.exports = {
  datastores: {
    default: {
      adapter: 'sails-postgresql',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  },
  models: {
    migrate: 'safe' // Never auto-migrate in production
  },
  session: {
    adapter: '@sailshq/connect-redis',
    url: process.env.REDIS_URL,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  },
  security: {
    cors: {
      allRoutes: true,
      allowOrigins: [process.env.APP_URL]
    }
  },
  custom: {
    appUrl: process.env.APP_URL,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    mailgunApiKey: process.env.MAILGUN_API_KEY
  }
}
```

### `config/local.js`

Local overrides (gitignored):

```js
// config/local.js (not committed to git)
module.exports = {
  port: 1337,
  custom: {
    stripeSecretKey: 'sk_test_...',
    mailgunApiKey: 'key-...'
  }
}
```

## Configuration Precedence (highest to lowest)

1. Command-line args (`sails lift --port=1338`)
2. Environment variables (`sails_port=1492`)
3. `.sailsrc` in app directory
4. Global `~/.sailsrc`
5. `config/local.js`
6. `config/env/*` matching `NODE_ENV`
7. Other files in `config/`

## Environment Variables

Override any config using `sails_` prefix with `__` for nesting:

```bash
# Override port
sails_port=8080 sails lift

# Override datastore URL
sails_datastores__default__url='postgresql://...' sails lift

# Override custom config
sails_custom__stripeSecretKey='sk_test_...' sails lift
```

## .sailsrc

Project-level Sails configuration:

```json
{
  "hooks": {
    "grunt": false,
    "sockets": false,
    "pubsub": false
  },
  "generators": {
    "modules": {
      "page": "create-sails-generator"
    }
  }
}
```

## The `sails` Object

The global `sails` object provides access to everything:

```js
sails.config // All configuration
sails.config.custom // Custom app settings
sails.models // All models { user: User, team: Team }
sails.helpers // All helpers
sails.hooks // All hooks
sails.log // Logger (sails.log.info, .warn, .error, .debug)
sails.getDatastore() // Get default datastore
```
