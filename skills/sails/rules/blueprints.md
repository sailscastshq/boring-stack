---
name: blueprints
description: Sails.js Blueprint API - auto-generated REST routes, blueprint actions, when to use or disable blueprints
metadata:
  tags: blueprints, rest, api, crud, auto-routes, shortcut
---

# Blueprints

Blueprints are Sails' automatic REST API generation system. They create CRUD routes for your models without writing any action code.

## Blueprint Configuration

```js
// config/blueprints.js
module.exports.blueprints = {
  actions: false, // Auto-route actions by file path
  rest: false, // Auto-generate RESTful routes for models
  shortcuts: false // Shortcut routes (GET-based CRUD, development only)
}
```

### The Boring Stack Disables Blueprints

In Boring Stack apps, all three blueprint types are **disabled by default**. Routes are explicit in `config/routes.js`, and actions use the Inertia response pattern instead of raw REST.

## When Blueprints Are Useful

Even though the Boring Stack disables them, blueprints are valuable for:

1. **Rapid prototyping** -- Get a working API in minutes
2. **Admin panels** -- Auto-generate CRUD for internal tools
3. **API-only services** -- Building JSON APIs without Inertia
4. **Mobile backends** -- Quick REST API for mobile apps

## Blueprint Types

### REST Blueprints (`rest: true`)

Auto-generates RESTful routes for every model:

| Method | Route                        | Blueprint Action | Description             |
| ------ | ---------------------------- | ---------------- | ----------------------- |
| GET    | `/user`                      | find             | List all users          |
| GET    | `/user/:id`                  | findOne          | Get one user            |
| POST   | `/user`                      | create           | Create a user           |
| PATCH  | `/user/:id`                  | update           | Update a user           |
| DELETE | `/user/:id`                  | destroy          | Delete a user           |
| GET    | `/user/:id/:association`     | populate         | Get associated records  |
| POST   | `/user/:id/:association`     | add              | Add to association      |
| DELETE | `/user/:id/:association/:fk` | remove           | Remove from association |
| PATCH  | `/user/:id/:association`     | replace          | Replace association     |

### Action Blueprints (`actions: true`)

Auto-routes actions by their file path:

```
api/controllers/user/find.js     → GET /user/find
api/controllers/user/create.js   → POST /user/create
api/controllers/dashboard.js     → GET /dashboard
```

### Shortcut Blueprints (`shortcuts: true`)

GET-based CRUD shortcuts for development only:

```
GET /user/create?fullName=Kelvin&email=kelvin@example.com
GET /user/update/1?fullName=Kelvin+Updated
GET /user/destroy/1
GET /user/find
GET /user/findOne/1
```

**Warning**: NEVER enable shortcuts in production -- they allow data modification via GET requests.

## Enabling Blueprints for Specific Models

You can enable blueprints selectively:

```js
// config/blueprints.js
module.exports.blueprints = {
  actions: false,
  rest: true, // Enable REST blueprints
  shortcuts: false,
  prefix: '/api' // Prefix all blueprint routes with /api
}
```

With `prefix: '/api'`, blueprint routes become:

```
GET  /api/user        → list users
POST /api/user        → create user
GET  /api/user/:id    → get user
PATCH /api/user/:id   → update user
DELETE /api/user/:id  → delete user
```

## Blueprint Options

```js
// config/blueprints.js
module.exports.blueprints = {
  rest: true,
  prefix: '/api', // URL prefix for all blueprint routes
  restPrefix: '/v1', // Additional prefix for REST routes (/api/v1/user)
  pluralize: true, // Use /users instead of /user
  autoWatch: true, // Auto-push changes via WebSocket (if sockets enabled)
  parseBlueprintOptions: function (req) {
    // Customize query parsing
    return req.options
  }
}
```

## Overriding Blueprint Actions

Create a custom action that replaces the default blueprint behavior:

```js
// api/controllers/user/find.js
// This replaces the default 'find' blueprint for the User model
module.exports = {
  fn: async function () {
    // Custom find logic with pagination
    const page = this.req.query.page || 1
    const perPage = 20

    const users = await User.find()
      .select(['id', 'fullName', 'email', 'createdAt'])
      .sort('createdAt DESC')
      .skip((page - 1) * perPage)
      .limit(perPage)

    const total = await User.count()

    return {
      data: users,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    }
  }
}
```

## Blueprint + Inertia Hybrid Pattern

If you want blueprints for an API alongside Inertia pages:

```js
// config/blueprints.js
module.exports.blueprints = {
  rest: true,
  prefix: '/api', // Blueprints only on /api/*
  shortcuts: false
}

// config/routes.js -- Explicit Inertia routes
module.exports.routes = {
  'GET /': { action: 'home/view-home' },
  'GET /dashboard': { action: 'dashboard/view-dashboard' }
  // Blueprint handles: /api/user, /api/team, etc.
}

// config/policies.js -- Protect blueprint routes
module.exports.policies = {
  'user/*': 'is-authenticated', // Protect all User blueprint actions
  'team/*': 'is-authenticated'
}
```

## Disabling Blueprints for Specific Models

Disable blueprints at the model level:

```js
// api/models/User.js
module.exports = {
  // No blueprint routes will be generated for User
  // even if blueprints.rest is true globally
  attributes: {
    // ...
  }
}
```

Use `config/routes.js` to explicitly define which model endpoints exist.

## Why The Boring Stack Disables Blueprints

1. **Explicit routing** -- Every route is visible in `config/routes.js`
2. **Inertia responses** -- Pages need `responseType: 'inertia'`, not raw JSON
3. **Security** -- No accidental data exposure from auto-generated endpoints
4. **Clarity** -- New developers can see exactly what routes exist
5. **Custom logic** -- Most actions need validation, authorization, and business logic beyond CRUD
