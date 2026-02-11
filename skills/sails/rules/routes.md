---
name: routes
description: Sails.js routing - custom routes, dynamic parameters, wildcards, route targets, ordering
metadata:
  tags: routes, routing, url, parameters, wildcards, targets, config
---

# Routes

Routes map URLs to actions. All routes are defined in `config/routes.js`.

## Basic Route Syntax

```js
// config/routes.js
module.exports.routes = {
  // 'VERB /path': { action: 'folder/action-name' }
  'GET /': { action: 'view-homepage' },
  'GET /login': { action: 'auth/view-login' },
  'POST /login': { action: 'auth/login' },
  'GET /signup': { action: 'auth/view-signup' },
  'POST /signup': { action: 'auth/signup' },
  'DELETE /logout': { action: 'auth/logout' },
  'GET /dashboard': { action: 'dashboard/view-dashboard' }
}
```

## HTTP Verbs

| Verb     | Use Case                   |
| -------- | -------------------------- |
| `GET`    | Render pages, fetch data   |
| `POST`   | Create resources           |
| `PATCH`  | Update resources (partial) |
| `PUT`    | Replace resources (full)   |
| `DELETE` | Remove resources           |

If no verb is specified, the route matches **all** HTTP methods:

```js
'/webhook': { action: 'webhooks/receive' }  // Matches GET, POST, PUT, PATCH, DELETE
```

## Dynamic Parameters

```js
module.exports.routes = {
  // Named parameter -- available as input or req.param('id')
  'GET /teams/:id': { action: 'team/view-team' },
  'PATCH /teams/:id': { action: 'team/update-team' },
  'DELETE /teams/:id': { action: 'team/delete-team' },

  // Multiple parameters
  'GET /teams/:teamId/members/:memberId': { action: 'team/view-member' },

  // Optional parameter
  'GET /blog/:slug?': { action: 'blog/view-post' }
}
```

In the action, dynamic parameters are available as inputs:

```js
// api/controllers/team/view-team.js
module.exports = {
  inputs: {
    id: { type: 'string', required: true } // From :id in the route
  },
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function ({ id }) {
    const team = await Team.findOne({ id })
    if (!team) throw 'notFound'
    return { page: 'teams/show', props: { team } }
  }
}
```

## Wildcard Routes

```js
module.exports.routes = {
  // Catch-all wildcard -- matches everything after the prefix
  'GET /docs/*': { action: 'docs/view-page' },

  // Global catch-all (place LAST -- used for 404 pages)
  'GET /*': { action: 'not-found', skipAssets: true }
}
```

Access wildcard values with `urlWildcardSuffix`:

```js
// api/controllers/docs/view-page.js
module.exports = {
  urlWildcardSuffix: 'path',
  inputs: {
    path: { type: 'string', defaultsTo: '' }
  },
  fn: async function ({ path }) {
    // path = 'getting-started/installation' for /docs/getting-started/installation
  }
}
```

## A Complete Routes File (Boring Stack Pattern)

```js
// config/routes.js
module.exports.routes = {
  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

  // Webhooks
  'POST /webhooks/stripe': { action: 'webhooks/receive-stripe' },

  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

  // Auth
  'GET /login': { action: 'auth/view-login' },
  'GET /signup': { action: 'auth/view-signup' },
  'POST /login': { action: 'auth/login' },
  'POST /signup': { action: 'auth/signup' },
  'DELETE /logout': { action: 'auth/logout' },

  // Password reset
  'GET /forgot-password': { action: 'auth/view-forgot-password' },
  'POST /forgot-password': { action: 'auth/send-password-reset' },
  'GET /reset-password/:token': { action: 'auth/view-reset-password' },
  'POST /reset-password': { action: 'auth/reset-password' },

  // Dashboard
  'GET /': { action: 'dashboard/view-homepage' },
  'GET /dashboard': { action: 'dashboard/view-dashboard' },

  // Profile / Settings
  'GET /profile': { action: 'dashboard/view-profile' },
  'PATCH /profile': { action: 'settings/update-profile' },
  'PATCH /settings/password': { action: 'settings/update-password' },
  'DELETE /profile': { action: 'settings/delete-account' },

  // Teams
  'GET /teams': { action: 'team/view-teams' },
  'GET /teams/:id': { action: 'team/view-team' },
  'POST /teams': { action: 'team/create-team' },
  'PATCH /teams/:id': { action: 'team/update-team' },
  'DELETE /teams/:id': { action: 'team/delete-team' },

  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝

  // 404 catch-all (must be last)
  'GET /*': { action: 'not-found', skipAssets: true }
}
```

## Route Target Types

### Action Target (most common)

```js
'GET /dashboard': { action: 'dashboard/view-dashboard' }

// Shorthand (without object wrapper)
'GET /dashboard': 'dashboard/view-dashboard'
```

### View Target (static pages, no action needed)

```js
'GET /terms':   { view: 'legal/terms' }       // Renders views/legal/terms.ejs
'GET /privacy': { view: 'legal/privacy' }
```

### Redirect Target

```js
'/old-dashboard':  '/dashboard',              // Internal redirect
'/docs':           'https://docs.example.com' // External redirect
```

### Function Target (inline handler)

```js
'GET /health': function (req, res) {
  return res.json({ status: 'ok', uptime: process.uptime() })
}
```

### Policy + Action Chain

```js
'GET /admin': [
  { policy: 'is-admin' },
  { action: 'admin/view-dashboard' }
]
```

## Route Options

```js
'GET /*': {
  action: 'not-found',
  skipAssets: true,     // Don't match URLs with dots (images, CSS, JS, etc.)
}

'GET /api/*': {
  action: 'api/not-found',
  csrf: false,          // Disable CSRF for this route
}
```

| Option       | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| `skipAssets` | Don't match URLs containing dots (e.g., `style.css`, `logo.png`) |
| `skipRegex`  | RegExp or array of RegExps to skip                               |
| `csrf`       | Override CSRF protection for this route (`true` or `false`)      |
| `cors`       | Override CORS settings for this route                            |
| `locals`     | Default view locals for this route                               |

### Using `locals` for Page Metadata

Set view locals directly in the route definition for SEO metadata and layout configuration:

```js
'GET /pricing': {
  action: 'view-pricing',
  locals: {
    currentSection: 'pricing',
    pageTitleForMeta: 'Pricing',
    pageDescriptionForMeta: 'Plans and pricing for Fleet.'
  }
},

'GET /': {
  action: 'view-homepage',
  locals: {
    isHomepage: true,
    showHeaderCTA: true,
  }
},

'GET /contact': {
  action: 'view-contact',
  locals: {
    pageTitleForMeta: 'Contact us',
    pageDescriptionForMeta: 'Get in touch with our team.',
    hideFooterLinks: true,
  }
}
```

These locals are available as `res.locals.*` in the action and view templates (or shared via Inertia props in the custom hook).

### `skipAssets: false` for Wildcard Content Routes

When wildcard routes handle dynamic content paths that might conflict with static asset detection:

```js
'GET /articles/*': {
  skipAssets: false,   // Allow URLs like /articles/fleet-4.0-release
  action: 'articles/view-basic-article',
  locals: { currentSection: 'more' }
}
```

## Route Ordering

Sails sorts routes by specificity:

1. **Static paths** first (`/login`, `/dashboard`)
2. **Dynamic parameters** next (`/teams/:id`)
3. **Wildcards** last (`/*`)

Within each group, routes are matched in the order they appear in `config/routes.js`. Always place your catch-all `/*` route last.
