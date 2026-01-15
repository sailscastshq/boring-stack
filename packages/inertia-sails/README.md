# inertia-sails

The official Inertia.js adapter for Sails.js, powering [The Boring JavaScript Stack](https://sailscasts.com/boring).

## Installation

```bash
npm install inertia-sails
```

Or use [create-sails](https://github.com/sailscastshq/create-sails) to scaffold a complete app:

```bash
npx create-sails my-app
```

## Quick Start

### 1. Configure Inertia

```js
// config/inertia.js
module.exports.inertia = {
  rootView: 'app', // views/app.ejs
  version: 1 // Asset version for cache busting
}
```

### 2. Create a root view

```ejs
<!-- views/app.ejs -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <%- shipwright.styles() %>
</head>
<body>
  <div id="app" data-page="<%- JSON.stringify(page) %>"></div>
  <%- shipwright.scripts() %>
</body>
</html>
```

### 3. Create an action

```js
// api/controllers/dashboard/view-dashboard.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    return {
      page: 'dashboard/index',
      props: {
        stats: await Stats.find()
      }
    }
  }
}
```

## API Reference

### Responses

#### `responseType: 'inertia'`

Return an Inertia page response:

```js
return {
  page: 'users/index',       // Component name
  props: { users: [...] },   // Props passed to component
  viewData: { title: '...' } // Data for root EJS template
}
```

#### `responseType: 'inertiaRedirect'`

Return a URL string to redirect:

```js
return '/dashboard'
```

### Sharing Data

#### `share(key, value)`

Share data with the current request (request-scoped):

```js
sails.inertia.share('flash', { success: 'Saved!' })
```

#### `shareGlobally(key, value)`

Share data across all requests (app-wide):

```js
// In hook initialization
sails.inertia.shareGlobally('appName', 'My App')
```

#### `viewData(key, value)`

Share data with the root EJS template:

```js
sails.inertia.viewData('title', 'Dashboard')
```

### Once Props (Cached)

Cache expensive props across navigations. The client tracks cached props and skips re-fetching.

#### `once(callback)`

```js
// In custom hook
sails.inertia.share(
  'loggedInUser',
  sails.inertia.once(async () => {
    return await User.findOne({ id: req.session.userId })
  })
)
```

**Chainable methods:**

- `.as(key)` - Custom cache key
- `.until(seconds)` - TTL expiration
- `.fresh(condition)` - Force refresh

```js
sails.inertia
  .once(() => fetchPermissions())
  .as('user-permissions')
  .until(3600) // Cache for 1 hour
  .fresh(req.query.refresh === 'true')
```

#### `shareOnce(key, callback)`

Shorthand for `share()` + `once()`:

```js
sails.inertia.shareOnce('countries', () => Country.find())
```

#### `refreshOnce(keys)`

Force refresh cached props from an action:

```js
// After updating user profile
await User.updateOne({ id: userId }).set({ fullName })
sails.inertia.refreshOnce('loggedInUser')
```

### Flash Messages

One-time messages that don't persist in browser history:

```js
sails.inertia.flash('success', 'Profile updated!')
sails.inertia.flash({ error: 'Failed', field: 'email' })
```

Access in your frontend via `page.props.flash`.

### Deferred Props

Load props after initial page render:

```js
return {
  page: 'dashboard',
  props: {
    // Loads immediately
    user: currentUser,
    // Loads after render
    analytics: sails.inertia.defer(async () => {
      return await Analytics.getExpensiveReport()
    })
  }
}
```

### Merge Props

Merge with existing client-side data (useful for infinite scroll):

```js
// Shallow merge
messages: sails.inertia.merge(() => newMessages)

// Deep merge (nested objects)
settings: sails.inertia.deepMerge(() => updatedSettings)
```

### Infinite Scroll

Paginate data with automatic merge behavior:

```js
const page = this.req.param('page', 0)
const perPage = 20
const invoices = await Invoice.find().paginate(page, perPage)
const total = await Invoice.count()

return {
  page: 'invoices/index',
  props: {
    invoices: sails.inertia.scroll(() => invoices, {
      page,
      perPage,
      total,
      wrapper: 'data' // Wraps in { data: [...], meta: {...} }
    })
  }
}
```

### History Encryption

Encrypt sensitive data in browser history:

```js
sails.inertia.encryptHistory() // Enable for current request
sails.inertia.clearHistory() // Clear history state
```

### Root View

Change the root template per-request:

```js
sails.inertia.setRootView('auth') // Use views/auth.ejs
```

### Back Navigation

Get the referrer URL for redirects:

```js
return sails.inertia.back('/dashboard') // Fallback if no referrer
```

### Optional Props

Props only included when explicitly requested via partial reload:

```js
categories: sails.inertia.optional(() => Category.find())
```

### Always Props

Props included even in partial reloads:

```js
csrf: sails.inertia.always(() => this.req.csrfToken())
```

## Custom Hook Example

Share user data across all authenticated pages using `once()` for caching:

```js
// api/hooks/custom/index.js
module.exports = function defineCustomHook(sails) {
  return {
    routes: {
      before: {
        'GET /*': {
          skipAssets: true,
          fn: async function (req, res, next) {
            if (req.session.userId) {
              sails.inertia.share(
                'loggedInUser',
                sails.inertia.once(async () => {
                  return await User.findOne({ id: req.session.userId }).select([
                    'id',
                    'email',
                    'fullName',
                    'avatarUrl'
                  ])
                })
              )
            }
            return next()
          }
        }
      }
    }
  }
}
```

## Custom Responses

Copy these to `api/responses/`:

- **inertia.js** - Handle Inertia page responses
- **inertiaRedirect.js** - Handle Inertia redirects
- **badRequest.js** - Validation errors with redirect back
- **serverError.js** - Error modal in dev, graceful redirect in prod

## Architecture

inertia-sails uses **AsyncLocalStorage** for request-scoped state, preventing data leaks between concurrent requests. This is critical for `share()`, `flash()`, `setRootView()`, and other per-request APIs.

## Configuration

```js
// config/inertia.js
module.exports.inertia = {
  // Root EJS template (default: 'app')
  rootView: 'app',

  // Asset version for cache busting (optional - auto-detected by default)
  // version: 'custom-version',

  // History encryption settings
  history: {
    encrypt: false
  }
}
```

### Automatic Asset Versioning

inertia-sails automatically handles asset versioning:

1. **With Shipwright**: Reads `.tmp/public/manifest.json` and generates an MD5 hash. Version changes when any bundled asset changes.

2. **Without Shipwright**: Falls back to server startup timestamp, ensuring fresh assets on each restart.

You can override this with a custom version if needed:

```js
// config/inertia.js
module.exports.inertia = {
  version: 'v2.1.0' // Or a function: () => myCustomVersion()
}
```

## References

- [The Boring Stack Docs](https://docs.sailscasts.com/boring-stack)
- [Inertia.js](https://inertiajs.com)
- [Sails.js](https://sailsjs.com)
