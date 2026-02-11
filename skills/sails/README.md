# Sails.js Skill

A comprehensive skill for building server-side applications with [Sails.js](https://sailsjs.com) in The Boring JavaScript Stack. This skill gives any AI agent a deep understanding of Sails 1.0 -- from app anatomy and request lifecycle to production deployment.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/sails
```

## What's Included

### Getting Started

- **Getting Started** - App anatomy, project structure, file conventions, naming patterns, .sailsrc, globals

### Core Concepts

- **Actions** - The actions2 format with inputs, exits, response types, and the four action patterns
- **Helpers** - Reusable server-side functions with the machine specification
- **Routes** - Route configuration, dynamic parameters, wildcards, and targets
- **Policies** - Request-level guards for authentication and authorization
- **Hooks** - App-level hooks for shared data, middleware, and initialization

### Request Pipeline

- **Request Lifecycle** - How HTTP requests flow through the entire Sails pipeline
- **Middleware** - HTTP middleware configuration, Express integration, custom middleware

### Configuration & Infrastructure

- **Configuration** - Config files, environment variables, and custom settings
- **Responses** - Custom response types including Inertia-specific responses
- **Security** - CORS, CSRF protection, sessions, and security patterns
- **Deployment** - Production configuration, Redis sessions, scaling, Docker

### Framework Reference

- **Sails Object** - The global `sails` object: config, helpers, models, hooks, log, inertia
- **File Uploads** - File upload patterns with Skipper and cloud storage
- **Shell Scripts** - Background tasks, data migrations, and maintenance scripts
- **Blueprints** - Auto-generated REST API and when to use or disable it
- **Generators** - Scaffolding new files with `sails generate` and custom generators

## Usage

This skill teaches Sails.js patterns as used in The Boring JavaScript Stack, where Sails serves as the backend for Inertia.js-powered frontends (React, Vue, or Svelte).

### Example Action (actions2)

```js
// api/controllers/dashboard/view-dashboard.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    const stats = await sails.helpers.dashboard.getStats()
    return {
      page: 'dashboard/index',
      props: { stats }
    }
  }
}
```

### Example Helper

```js
// api/helpers/format-currency.js
module.exports = {
  inputs: {
    amount: { type: 'number', required: true }
  },
  fn: async function ({ amount }) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }
}
```

### Example Policy

```js
// api/policies/is-authenticated.js
module.exports = async function (req, res, proceed) {
  if (req.session.userId) {
    return proceed()
  }
  await sails.helpers.returnUrl.set(req)
  return res.redirect('/login')
}
```

### Example Route Configuration

```js
// config/routes.js
module.exports.routes = {
  'GET /': { action: 'home/view-home' },
  'GET /dashboard': { action: 'dashboard/view-dashboard' },
  'POST /login': { action: 'auth/login' },
  'GET /settings/profile': { action: 'setting/view-profile' },
  'PATCH /settings/profile': { action: 'setting/update-profile' },
  'GET /team/:id': { action: 'team/view-team' }
}
```

## Related Skills

- **[waterline](../waterline/)** - Database ORM for models, queries, and associations
- **[inertia](../inertia/)** - Client-server bridge connecting Sails to React/Vue/Svelte
