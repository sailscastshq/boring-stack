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
  <div id="app"></div>
  <script type="application/json" data-page="app">
    <%- JSON.stringify(page).replace(/</g, '\\u003c') %>
  </script>
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
  locals: { title: '...' }   // Locals for root EJS template
}
```

#### `responseType: 'inertiaRedirect'`

Return a URL string to redirect:

```js
return '/dashboard'
```

`inertiaRedirect` performs an Inertia location visit. It does not return a
page object, so `sails.inertia.preserveFragment()` does not apply to this
response type. If you already know the fragment you want, include it in the
returned URL.

#### Preserving URL fragments

When a standard Inertia redirect should carry the current hash to the next
page, mark the redirect before returning the URL:

```js
sails.inertia.preserveFragment()
return '/articles/new-slug'
```

If the user started from `/articles/old-slug#comments`, the Inertia client can
carry `#comments` to the redirected page.

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

#### `local(key, value)`

Set a local variable for the root EJS template:

```js
sails.inertia.local('title', 'Dashboard')
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

### Error Pages

In development, 500-level HTML responses render a rich Youch error page with
the stack trace and sanitized request metadata. For Inertia visits, the client
will show that HTML in its development error modal.

In production, `inertia-sails` renders the configured Inertia error page for
`403`, `404`, `500`, and `503` responses by default. The page receives
`status`, `title`, and `message` props:

```vue
<!-- assets/js/pages/error.vue -->
<script setup>
import { Head, Link } from '@inertiajs/vue3'

defineProps({
  status: Number,
  title: String,
  message: String
})
</script>

<template>
  <Head :title="`${status} ${title}`" />

  <main>
    <p>Status {{ status }}</p>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <Link href="/">Go home</Link>
  </main>
</template>
```

Wire Sails' standard responses through the hook so framework-level 403/404/500
responses use the same policy:

```js
// api/responses/serverError.js
module.exports = function serverError(error) {
  return this.req._sails.inertia.handleServerError(this.req, this.res, error)
}

// api/responses/notFound.js
module.exports = function notFound(error) {
  return this.req._sails.inertia.handleErrorPage(this.req, this.res, {
    statusCode: 404,
    error
  })
}

// api/responses/forbidden.js
module.exports = function forbidden(error) {
  return this.req._sails.inertia.handleErrorPage(this.req, this.res, {
    statusCode: 403,
    error
  })
}
```

Hybrid apps can keep classic Sails EJS error views by disabling the Inertia
error page:

```js
// config/inertia.js
module.exports.inertia = {
  errorPage: false
}
```

### Precognition

Inertia v3 forms can validate against server-owned Sails rules before the real
submit runs. `inertia-sails` handles the Precognition response headers and
returns validation failures as `422` JSON instead of redirecting through the
normal session-backed Inertia error flow.

Use `withPrecognition()` on the client:

```js
const form = useForm({
  email: null
}).withPrecognition('post', '/forgot-password')
```

Then validate a field when the user leaves it:

```vue
<InputEmail v-model="form.email" @blur="form.validate('email')" />
```

On the server, add a small custom response so successful Precognition checks
can exit before side effects without going through the action's normal
`success` response type:

```js
// api/responses/precognitionSuccess.js
module.exports = function precognitionSuccess() {
  return this.req._sails.inertia.handlePrecognitionSuccess(this.req, this.res)
}
```

Then use a named exit in the action:

```js
exits: {
  success: {
    responseType: 'redirect'
  },
  precognitionSuccess: {
    responseType: 'precognitionSuccess'
  }
},

fn: async function ({ email }, exits) {
  if (sails.inertia.isPrecognitive(this.req)) {
    return exits.precognitionSuccess()
  }

  await sendPasswordResetEmail(email)
  return '/check-email'
}
```

For custom database-backed checks, use `shouldValidate()` so expensive rules
only run when the client asked for that field:

```js
if (sails.inertia.shouldValidate('email', this.req)) {
  const existingUser = await User.findOne({ email })

  if (existingUser) {
    throw {
      badSignupRequest: {
        problems: [{ email: 'An account with this email already exists.' }]
      }
    }
  }
}
```

Available helpers:

- `sails.inertia.isPrecognitive(req?)`
- `sails.inertia.validateOnly(req?)`
- `sails.inertia.shouldValidate(field, req?)`
- `sails.inertia.handlePrecognitionSuccess(req, res)` for custom responses

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

Deferred props can also be rescued when a non-critical callback fails:

```js
return {
  page: 'dashboard',
  props: {
    analytics: sails.inertia
      .defer(async () => {
        return await Analytics.getExpensiveReport()
      })
      .rescue()
  }
}
```

Or pass the rescue option inline:

```js
return {
  page: 'dashboard',
  props: {
    analytics: sails.inertia.defer(
      async () => {
        return await Analytics.getExpensiveReport()
      },
      { rescue: true }
    )
  }
}
```

When a rescued deferred prop throws, it is omitted from `props` and its key is
reported in `rescuedProps`, allowing the client `<Deferred>` component to show
its rescue slot instead of failing the whole deferred response.

### Merge Props

Merge with existing client-side data (useful for infinite scroll):

```js
// Shallow merge
messages: sails.inertia.merge(() => newMessages)

// Prepend new items instead of appending
notifications: sails.inertia.merge(() => newNotifications).prepend()

// Merge a nested array inside a paginated object
users: sails.inertia.merge(() => paginatedUsers).append('data')

// Match existing items by ID when merging
users: sails.inertia
  .merge(() => paginatedUsers)
  .append('data', {
    matchOn: 'id'
  })

// Deep merge (nested objects)
settings: sails.inertia.deepMerge(() => updatedSettings)

// Deep merge with item matching
chat: sails.inertia.deepMerge(() => chatState).matchOn('messages.id')
```

### Infinite Scroll

Paginate data with automatic merge behavior. Works with Inertia's `<InfiniteScroll>` component:

```js
// Controller
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

```vue
<!-- Vue component -->
<script setup>
import { InfiniteScroll } from '@inertiajs/vue3'

defineProps({ invoices: Object })
</script>

<template>
  <InfiniteScroll data="invoices">
    <div v-for="invoice in invoices.data" :key="invoice.id">
      {{ invoice.invoiceNumber }}
    </div>
  </InfiniteScroll>
</template>
```

`scroll()` targets the wrapped array for merging, such as `invoices.data`, and follows Inertia's infinite-scroll merge intent header so previous-page requests prepend while next-page requests append.

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
- **notFound.js** - 404 status pages
- **forbidden.js** - 403 status pages

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
  },

  // Production status page component.
  // Set to false to keep classic Sails EJS error views.
  errorPage: 'error',
  errorStatuses: [403, 404, 500, 503]
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
