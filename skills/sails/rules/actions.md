---
name: actions
description: Sails.js actions2 format - inputs, exits, response types, action patterns for The Boring JavaScript Stack
metadata:
  tags: actions, actions2, controllers, inputs, exits, responseType, fn
---

# Actions

The Boring JavaScript Stack uses the **actions2** format exclusively. Actions are standalone files in `api/controllers/`, organized in subfolders by feature.

## Actions2 Format

Every action is a file exporting a machine-style object with `inputs`, `exits`, and `fn`:

```js
// api/controllers/dashboard/view-dashboard.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId })
    return {
      page: 'dashboard/index',
      props: { user }
    }
  }
}
```

## File Naming and Organization

Actions are **kebab-cased** files organized in subdirectories:

```
api/controllers/
├── auth/
│   ├── login.js            → POST /login
│   ├── signup.js           → POST /signup
│   └── view-login.js       → GET /login
├── dashboard/
│   ├── view-dashboard.js   → GET /dashboard
│   └── view-profile.js     → GET /profile
├── settings/
│   ├── update-profile.js   → PATCH /profile
│   └── update-password.js  → PATCH /settings/password
└── webhooks/
    └── receive-stripe.js   → POST /webhooks/stripe
```

Use the generator to scaffold actions:

```bash
npx sails generate action auth/signup
npx sails generate action dashboard/view-dashboard
```

## Inputs

Inputs define the parameters your action accepts. Sails automatically validates and coerces them from the request body, query string, or URL parameters.

```js
inputs: {
  // Required string with validation
  email: {
    type: 'string',
    required: true,
    isEmail: true,
    description: 'The email address for the new account.'
  },

  // Required string with custom validation
  password: {
    type: 'string',
    required: true,
    minLength: 8,
    custom: function (value) {
      return /[a-z]/i.test(value) && /[0-9]/.test(value)
    },
    description: 'At least 8 characters with letters and numbers.'
  },

  // Optional string with default
  fullName: {
    type: 'string',
    defaultsTo: ''
  },

  // Boolean with default
  rememberMe: {
    type: 'boolean',
    defaultsTo: false
  },

  // Constrained string (enum)
  role: {
    type: 'string',
    isIn: ['admin', 'member', 'viewer'],
    defaultsTo: 'member'
  },

  // Number with range
  page: {
    type: 'number',
    min: 1,
    defaultsTo: 1
  },

  // Reference type (for file uploads, complex objects)
  avatar: {
    type: 'ref'
  },

  // JSON type (for arbitrary objects/arrays)
  metadata: {
    type: 'json'
  }
}
```

### Input Types

| Type      | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `string`  | Text values                                                   |
| `number`  | Numeric values (integers and floats)                          |
| `boolean` | True/false                                                    |
| `json`    | Any JSON-serializable value (objects, arrays)                 |
| `ref`     | Any JavaScript value (file uploads, streams, complex objects) |

### Validation Rules

| Rule         | Applies To | Description                                             |
| ------------ | ---------- | ------------------------------------------------------- |
| `required`   | All        | Must be provided (not undefined, null, or empty string) |
| `isEmail`    | String     | Valid email format                                      |
| `isIn`       | String     | Must be one of the listed values                        |
| `minLength`  | String     | Minimum string length                                   |
| `maxLength`  | String     | Maximum string length                                   |
| `regex`      | String     | Must match regular expression                           |
| `min`        | Number     | Minimum numeric value                                   |
| `max`        | Number     | Maximum numeric value                                   |
| `isInteger`  | Number     | Must be a whole number                                  |
| `custom`     | All        | Custom validation function returning boolean            |
| `defaultsTo` | All        | Default value if not provided                           |
| `allowNull`  | All        | Allow null value                                        |

## Exits

Exits define the possible outcomes of an action. Each exit can specify a `responseType`:

```js
exits: {
  // Success exit (always implicit, but you should define the responseType)
  success: {
    responseType: 'inertia'        // Render an Inertia page
  },

  // Redirect exit
  success: {
    responseType: 'redirect'       // 302 redirect
  },

  // Bad request exit (validation errors)
  badRequest: {
    responseType: 'badRequest'     // Store errors in session, redirect back
  },

  // Custom named exits
  emailAlreadyInUse: {
    responseType: 'badRequest'
  },

  // Not found
  notFound: {
    responseType: 'notFound'       // 404 response
  },

  // Server error
  serverError: {
    responseType: 'serverError'    // 500 with dev modal or production flash
  }
}
```

### Response Types in The Boring Stack

| Response Type       | Description                                       | Used For                            |
| ------------------- | ------------------------------------------------- | ----------------------------------- |
| `'inertia'`         | Renders an Inertia page                           | Page views (GET requests)           |
| `'redirect'`        | 302 redirect                                      | After mutations (POST/PATCH/DELETE) |
| `'inertiaRedirect'` | 409 + full page reload                            | When `once()` cached data changed   |
| `'badRequest'`      | Stores errors in session, redirects back with 303 | Validation failures                 |
| `'serverError'`     | Dev: error modal. Prod: flash + redirect          | Unexpected errors                   |
| `'notFound'`        | 404 response                                      | Missing resources                   |
| `''` (empty)        | Raw JSON response                                 | API endpoints, webhooks             |

## The Four Action Patterns

### 1. Render a Page (GET)

```js
// api/controllers/dashboard/view-dashboard.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId })
    const teams = await Team.find({ members: userId })

    return {
      page: 'dashboard/index',
      props: {
        user,
        teams,
        analytics: sails.inertia.defer(async () => {
          return await sails.helpers.dashboard.getAnalytics(userId)
        })
      }
    }
  }
}
```

### 2. Redirect After Mutation (POST/PATCH/DELETE)

```js
// api/controllers/team/create-team.js
module.exports = {
  inputs: {
    name: { type: 'string', required: true, maxLength: 100 }
  },
  exits: {
    success: { responseType: 'redirect' },
    badRequest: { responseType: 'badRequest' }
  },
  fn: async function ({ name }) {
    const team = await Team.create({
      name,
      owner: this.req.session.userId
    }).fetch()

    sails.inertia.flash('success', `Team "${name}" created!`)
    return `/teams/${team.id}`
  }
}
```

### 3. Redirect with Cache Refresh (inertiaRedirect)

Use `inertiaRedirect` when shared `once()` data has changed and needs a full page reload:

```js
// api/controllers/team/switch-team.js
module.exports = {
  inputs: {
    teamId: { type: 'string', required: true }
  },
  exits: {
    success: { responseType: 'inertiaRedirect' }
  },
  fn: async function ({ teamId }) {
    this.req.session.currentTeamId = teamId

    // Refresh cached shared data because team context changed
    sails.inertia.refreshOnce('currentTeam')
    sails.inertia.refreshOnce('loggedInUser')

    return '/dashboard'
  }
}
```

### 4. Validation Errors (badRequest)

```js
// api/controllers/auth/signup.js
module.exports = {
  inputs: {
    email: { type: 'string', required: true, isEmail: true },
    password: { type: 'string', required: true, minLength: 8 },
    fullName: { type: 'string', required: true }
  },
  exits: {
    success: { responseType: 'redirect' },
    badSignupRequest: { responseType: 'badRequest' }
  },
  fn: async function ({ email, password, fullName }) {
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: await sails.helpers.passwords.hashPassword(password),
      fullName
    })
      .intercept('E_UNIQUE', () => ({
        badSignupRequest: {
          problems: [{ email: 'An account with this email already exists.' }]
        }
      }))
      .fetch()

    this.req.session.userId = newUser.id
    sails.inertia.flash('success', 'Welcome aboard!')
    return '/dashboard'
  }
}
```

## Accessing Request Context

Inside `fn`, access the request via `this.req` and response via `this.res`:

```js
fn: async function (inputs) {
  // Session
  const userId = this.req.session.userId

  // Headers
  const userAgent = this.req.get('User-Agent')

  // IP address
  const ip = this.req.ip

  // Cookies
  const token = this.req.cookies.token

  // Check if Inertia request
  const isInertia = this.req.get('X-Inertia')

  // File uploads
  const uploadedFiles = await sails.helpers.uploadOne(this.req.file('avatar'))

  // Set response status
  this.res.status(201)
}
```

## Throwing Exits

```js
fn: async function ({ teamId }) {
  const team = await Team.findOne({ id: teamId })

  // Throw a named exit as a string
  if (!team) throw 'notFound'

  // Throw with data (for badRequest with problems)
  throw {
    badRequest: {
      problems: [{ teamId: 'Team not found.' }]
    }
  }

  // Throw with intercept (on database operations)
  await Team.create({ name })
    .intercept('E_UNIQUE', () => ({
      nameAlreadyInUse: {
        problems: [{ name: 'A team with this name already exists.' }]
      }
    }))
}
```

## Actions Without Inputs/Exits (Minimal)

For simple actions, you can omit `inputs` and just define `exits` and `fn`:

```js
// api/controllers/auth/logout.js
module.exports = {
  exits: {
    success: { responseType: 'redirect' }
  },
  fn: async function () {
    delete this.req.session.userId
    sails.inertia.flushShared()
    return '/'
  }
}
```

## Webhook / API Actions (No Inertia)

For webhooks or API endpoints that return JSON:

```js
// api/controllers/webhooks/receive-stripe.js
module.exports = {
  inputs: {
    id: { type: 'string', required: true },
    type: { type: 'string', required: true },
    data: { type: 'json', required: true }
  },
  fn: async function ({ id, type, data }) {
    switch (type) {
      case 'invoice.paid':
        await sails.helpers.billing.handleInvoicePaid(data.object)
        break
      case 'customer.subscription.deleted':
        await sails.helpers.billing.handleSubscriptionCanceled(data.object)
        break
    }

    return { received: true }
  }
}
```

## Generated Actions (Boring Stack Generators)

The Boring Stack includes generators for common action patterns:

```bash
# Generate a page action (renders Inertia page)
npx sails generate page dashboard

# Generate Inertia response
npx sails generate inertia

# Generate redirect response
npx sails generate inertia-redirect

# Generate bad request response
npx sails generate bad-request
```
