---
name: generators
description: Sails.js generators - sails generate, custom generators, page generator, scaffolding
metadata:
  tags: generators, generate, scaffold, page, create-sails-generator
---

# Generators

Generators scaffold new files in a Sails project. They create boilerplate files with the correct structure and naming conventions.

## Built-in Generators

### Generate an Action

```bash
sails generate action auth/login
```

Creates `api/controllers/auth/login.js`:

```js
module.exports = {
  friendlyName: 'Login',
  description: 'Login auth.',
  inputs: {},
  exits: {},
  fn: async function (inputs) {
    // All done.
    return
  }
}
```

### Generate a Helper

```bash
sails generate helper format-currency
```

Creates `api/helpers/format-currency.js`:

```js
module.exports = {
  friendlyName: 'Format currency',
  description: '',
  inputs: {},
  exits: {
    success: {
      description: 'All done.'
    }
  },
  fn: async function (inputs) {
    // ...
  }
}
```

### Generate a Model

```bash
sails generate model user
```

Creates `api/models/User.js`:

```js
module.exports = {
  attributes: {
    // ...
  }
}
```

### Generate a Policy

```bash
sails generate policy is-admin
```

Creates `api/policies/is-admin.js`.

### Generate a Response

```bash
sails generate response notAuthorized
```

Creates `api/responses/notAuthorized.js`.

### Generate a Hook

```bash
sails generate hook rate-limiter
```

Creates `api/hooks/rate-limiter/index.js`.

### Generate a Script

```bash
sails generate script seed-database
```

Creates `scripts/seed-database.js`.

## The Page Generator (Boring Stack)

The Boring Stack includes a custom `page` generator that creates both a Sails action and an Inertia page component:

```bash
sails generate page dashboard
```

This creates:

1. **Action**: `api/controllers/dashboard/view-dashboard.js`
2. **Page component**: `assets/js/pages/dashboard/index.jsx` (or `.vue`/`.svelte`)
3. **Route entry**: Added to `config/routes.js`

### Configured in .sailsrc

```json
{
  "generators": {
    "modules": {
      "page": "create-sails-generator/generators/page"
    }
  }
}
```

### Page Generator Options

```bash
# Generate a nested page
sails generate page settings/profile

# Creates:
# api/controllers/setting/view-profile.js
# assets/js/pages/setting/profile.jsx
# Route: 'GET /settings/profile': 'setting/view-profile'
```

## Custom Generators

Custom generators are defined in the `create-sails-generator` package in the Boring Stack monorepo. They follow a specific structure:

```
generators/
└── page/
    ├── index.js          # Generator logic
    └── templates/
        ├── action.template  # Action file template
        └── page.template    # Page component template
```

### Generator Structure

```js
// generators/page/index.js
module.exports = {
  before: function (scope, exits) {
    // Validate inputs, set defaults
    if (!scope.args[0]) {
      return exits.error('Please provide a page name.')
    }
    scope.pageName = scope.args[0]
    return exits.success()
  },

  targets: {
    './api/controllers/:pageName/view-:pageName.js': {
      template: 'action.template'
    },
    './assets/js/pages/:pageName/index.jsx': {
      template: 'page.template'
    }
  },

  after: function (scope, exits) {
    console.log('New page created!')
    return exits.success()
  }
}
```

## Generator Tips

1. **Use generators for consistency** -- Generated files follow the project's conventions
2. **The page generator** is the most commonly used in Boring Stack development
3. **Action names** follow the pattern: `feature/verb-noun` (e.g., `auth/login`, `setting/update-profile`)
4. **View actions** are prefixed with `view-` (e.g., `view-dashboard`, `view-profile`)
5. **Generate then customize** -- Generators create the skeleton, you add the business logic

## Available Generator Commands

| Command                          | Creates               | Location                      |
| -------------------------------- | --------------------- | ----------------------------- |
| `sails generate action <name>`   | Action (controller)   | `api/controllers/<name>.js`   |
| `sails generate helper <name>`   | Helper function       | `api/helpers/<name>.js`       |
| `sails generate model <name>`    | Waterline model       | `api/models/<Name>.js`        |
| `sails generate policy <name>`   | Policy middleware     | `api/policies/<name>.js`      |
| `sails generate response <name>` | Response handler      | `api/responses/<name>.js`     |
| `sails generate hook <name>`     | App-level hook        | `api/hooks/<name>/index.js`   |
| `sails generate script <name>`   | Shell script          | `scripts/<name>.js`           |
| `sails generate page <name>`     | Action + page + route | Multiple files (Boring Stack) |
