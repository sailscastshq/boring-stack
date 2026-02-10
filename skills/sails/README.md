# Sails.js Skill

A comprehensive skill for building server-side applications with [Sails.js](https://sailsjs.com) in The Boring JavaScript Stack.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/sails
```

## What's Included

- **Actions** - The actions2 format with inputs, exits, and response types
- **Helpers** - Reusable server-side functions with the machine specification
- **Routes** - Route configuration, dynamic parameters, wildcards, and targets
- **Policies** - Request-level guards for authentication and authorization
- **Hooks** - App-level hooks for shared data, middleware, and initialization
- **Configuration** - Config files, environment variables, and custom settings
- **Responses** - Custom response types including Inertia-specific responses
- **Security** - CORS, CSRF protection, sessions, and security patterns

## Usage

This skill teaches you Sails.js patterns as used in The Boring JavaScript Stack, where Sails serves as the backend for Inertia.js-powered frontends (React, Vue, or Svelte).

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

## Related Skills

- **[waterline](../waterline/)** - Database ORM for models, queries, and associations
- **[inertia](../inertia/)** - Client-server bridge connecting Sails to React/Vue/Svelte
