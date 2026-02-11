---
name: getting-started
description: Sails.js app anatomy, project structure, file conventions, naming patterns, .sailsrc, and global configuration
metadata:
  tags: anatomy, structure, project, conventions, sailsrc, globals, setup
---

# Getting Started with Sails.js

## What is Sails?

Sails.js is a real-time MVC framework for Node.js built on top of Express. It uses a **convention-over-configuration** approach -- files are auto-discovered by their location and name, and the framework wires everything together at startup (called "lifting").

In The Boring JavaScript Stack, Sails serves as the backend framework paired with Inertia.js for rendering React, Vue, or Svelte frontends.

## App Anatomy

A Boring Stack Sails app follows this directory structure:

```
my-app/
├── api/
│   ├── controllers/         # Actions (request handlers)
│   │   ├── auth/            # Feature-grouped subdirectories
│   │   │   ├── login.js
│   │   │   ├── signup.js
│   │   │   └── logout.js
│   │   ├── dashboard/
│   │   │   └── view-dashboard.js
│   │   └── setting/
│   │       ├── view-profile.js
│   │       └── update-profile.js
│   ├── helpers/             # Reusable functions
│   │   ├── passwords/
│   │   │   ├── hash-password.js
│   │   │   └── check-password.js
│   │   ├── mail/
│   │   │   └── send.js
│   │   └── format-currency.js
│   ├── hooks/               # Custom app-level hooks
│   │   └── custom/
│   │       └── index.js
│   ├── models/              # Waterline ORM models
│   │   ├── User.js
│   │   └── Team.js
│   ├── policies/            # Request guard middleware
│   │   ├── is-authenticated.js
│   │   └── is-guest.js
│   └── responses/           # Custom response types
│       ├── inertia.js
│       ├── badRequest.js
│       └── serverError.js
├── config/
│   ├── routes.js            # URL-to-action mappings
│   ├── policies.js          # Action-to-policy mappings
│   ├── models.js            # Default model settings
│   ├── datastores.js        # Database connections
│   ├── custom.js            # App-specific settings
│   ├── security.js          # CORS, CSRF settings
│   ├── session.js           # Session store config
│   ├── globals.js           # Global variable exposure
│   ├── blueprints.js        # Auto-REST route settings
│   ├── bootstrap.js         # Startup function (runs once on lift)
│   ├── http.js              # HTTP middleware config
│   ├── inertia.js           # Inertia.js settings
│   ├── local.js             # Local overrides (gitignored)
│   └── env/
│       └── production.js    # Production environment overrides
├── assets/                  # Static files (compiled by Vite/Shipwright)
│   └── js/
│       ├── app.jsx          # React/Vue/Svelte entry point
│       └── pages/           # Inertia page components
├── views/                   # Server-side templates (minimal in Boring Stack)
│   └── layouts/
│       └── layout.ejs       # Root HTML layout for Inertia
├── scripts/                 # Shell scripts (background tasks, migrations)
├── db/                      # SQLite database files (development)
├── .sailsrc                 # Project-level Sails config
└── package.json
```

## File Naming Conventions

### Actions (Controllers)

Actions use **kebab-case** filenames. The file path becomes the action identity:

```
api/controllers/auth/login.js           → action identity: 'auth/login'
api/controllers/dashboard/view-dashboard.js → action identity: 'dashboard/view-dashboard'
api/controllers/setting/update-profile.js   → action identity: 'setting/update-profile'
```

**Convention**: Prefix view actions with `view-` (e.g., `view-dashboard.js`, `view-profile.js`). Form submission actions use the verb (e.g., `login.js`, `signup.js`, `update-profile.js`).

### Helpers

Helpers also use **kebab-case** filenames. Directory structure maps to dot-notation:

```
api/helpers/format-currency.js              → sails.helpers.formatCurrency()
api/helpers/passwords/hash-password.js      → sails.helpers.passwords.hashPassword()
api/helpers/mail/send.js                    → sails.helpers.mail.send()
api/helpers/user/signup-with-team.js        → sails.helpers.user.signupWithTeam()
```

### Models

Models use **PascalCase** filenames. They become globally available:

```
api/models/User.js           → User (global)
api/models/Team.js           → Team (global)
api/models/Membership.js     → Membership (global)
```

### Policies

Policies use **kebab-case** filenames:

```
api/policies/is-authenticated.js    → 'is-authenticated'
api/policies/is-guest.js            → 'is-guest'
api/policies/has-clearance.js       → 'has-clearance'
```

### Responses

Responses use **camelCase** filenames:

```
api/responses/inertia.js            → responseType: 'inertia'
api/responses/badRequest.js         → responseType: 'badRequest'
api/responses/serverError.js        → responseType: 'serverError'
```

## .sailsrc

The `.sailsrc` file configures project-level Sails settings. In Boring Stack apps:

```json
{
  "hooks": {
    "grunt": false,
    "sockets": false,
    "pubsub": false
  },
  "generators": {
    "modules": {
      "page": "create-sails-generator/generators/page"
    }
  }
}
```

Key settings:

- **`hooks`** -- Enable/disable hooks. `false` disables a hook entirely. The Boring Stack disables Grunt (uses Vite/Shipwright instead), sockets, and pubsub.
- **`generators`** -- Custom generators for `sails generate`. The `page` generator creates new Inertia page components.

## Globals

Sails exposes several globals by default. Configured in `config/globals.js`:

```js
// config/globals.js
module.exports.globals = {
  models: true, // User, Team, etc. available without require()
  sails: true, // sails object available globally
  _: false, // Lodash (disabled in Boring Stack)
  async: false // async library (disabled in Boring Stack)
}
```

When `models: true`, all models are available as globals:

```js
// No require needed:
const user = await User.findOne({ id: 1 })
const teams = await Team.find({ owner: userId })
```

If globals are disabled, use `sails.models`:

```js
const user = await sails.models.user.findOne({ id: 1 })
```

## Bootstrap

The `config/bootstrap.js` file runs once when Sails lifts. Use it for one-time setup:

```js
// config/bootstrap.js
module.exports.bootstrap = async function () {
  sails.log.info('App is bootstrapping...')

  // Seed initial data if empty
  const adminCount = await User.count({ role: 'admin' })
  if (adminCount === 0) {
    await User.create({
      fullName: 'Admin',
      email: 'admin@example.com',
      password: await sails.helpers.passwords.hashPassword('changeme'),
      emailStatus: 'verified'
    })
    sails.log.info('Created initial admin user')
  }
}
```

### Bootstrap Version Tracking

For apps with complex seed data, track whether bootstrap has already run to avoid re-seeding on every lift:

```js
module.exports.bootstrap = async function () {
  var HARD_CODED_DATA_VERSION = 1
  var bootstrapLastRunInfoPath = require('path').resolve(
    sails.config.appPath,
    '.tmp/bootstrap-version.json'
  )

  // Skip in production to prevent data loss
  if (
    process.env.NODE_ENV === 'production' ||
    sails.config.models.migrate === 'safe'
  ) {
    sails.log('Skipping bootstrap in production to avoid data loss.')
    return
  }

  // Check if this version already ran
  var lastRunInfo = await sails.helpers.fs
    .readJson(bootstrapLastRunInfoPath)
    .tolerate('doesNotExist')
  if (lastRunInfo && lastRunInfo.lastRunVersion === HARD_CODED_DATA_VERSION) {
    sails.log(
      'Skipping v' + HARD_CODED_DATA_VERSION + ' bootstrap (already run).'
    )
    return
  }

  // Wipe and reseed all data
  for (let identity in sails.models) {
    await sails.models[identity].destroy({})
  }

  await User.create({
    emailAddress: 'admin@example.com',
    firstName: 'Ryan',
    lastName: 'Dahl',
    isSuperAdmin: true,
    password: await sails.helpers.passwords.hashPassword('abc123')
  })

  // Save bootstrap version
  await sails.helpers.fs.writeJson
    .with({
      destination: bootstrapLastRunInfoPath,
      json: { lastRunVersion: HARD_CODED_DATA_VERSION, lastRunAt: Date.now() },
      force: true
    })
    .tolerate((err) => {
      sails.log.warn('Could not write bootstrap version file:', err.message)
    })
}
```

**Important**: Bootstrap runs after all hooks have initialized. Models, helpers, and the full `sails` object are available.

## Lifting Sails

Sails starts via the `lift` command:

```bash
# Development (auto-restarts on changes via nodemon/shipwright)
npx shipwright dev

# Direct lift
node app.js

# With environment
NODE_ENV=production node app.js

# With config overrides
sails lift --port=8080
```

The lift process:

1. Load configuration from all `config/` files
2. Load and initialize all hooks (including custom hooks)
3. Load models, helpers, actions, policies, responses
4. Bind routes
5. Run `config/bootstrap.js`
6. Start HTTP server
7. Emit `ready` event

## Configuration Precedence

Configuration is merged in this order (highest priority first):

1. Command-line arguments (`--port=8080`)
2. Environment variables (`sails_port=8080`)
3. `.sailsrc` in app directory
4. Global `~/.sailsrc`
5. `config/local.js` (gitignored, for developer-specific overrides)
6. `config/env/<NODE_ENV>.js` (e.g., `config/env/production.js`)
7. Other files in `config/`
8. Hook defaults

## Environment Variables

Override any config value using `sails_` prefix with `__` for nesting:

```bash
# Override port
sails_port=8080 node app.js

# Override database URL
sails_datastores__default__url='postgresql://localhost/mydb' node app.js

# Override custom config
sails_custom__stripeKey='sk_test_...' node app.js
```

The `__` double-underscore maps to nested config paths:

```
sails_datastores__default__url → sails.config.datastores.default.url
sails_custom__baseUrl          → sails.config.custom.baseUrl
sails_session__secret          → sails.config.session.secret
```
