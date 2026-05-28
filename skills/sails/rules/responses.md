---
name: responses
description: Sails.js custom responses - Inertia responses, badRequest, serverError, redirect, response files
metadata:
  tags: responses, inertia, badRequest, serverError, redirect, custom, api
---

# Responses

Custom responses in `api/responses/` define how actions communicate results to the client. The Boring Stack uses Inertia-aware response types for pages, validation, redirects, and status pages.

## Response Files

```
api/responses/
├── inertia.js          ← Renders an Inertia page
├── inertia-redirect.js ← 409 full page reload (for stale once() data)
├── badRequest.js       ← Validation errors → session → redirect back
├── serverError.js      ← 500 handling with Youch in dev, status page in prod
├── notFound.js         ← 404 status page
└── forbidden.js        ← 403 status page
```

## `inertia.js` -- Render a Page

```js
// api/responses/inertia.js
module.exports = function inertia(data) {
  return this.req._sails.inertia.render(this.req, this.res, data)
}
```

Used when an action returns page data:

```js
// In an action:
exits: { success: { responseType: 'inertia' } },
fn: async function () {
  return {
    page: 'dashboard/index',
    props: { user, teams }
  }
}
```

## `inertia-redirect.js` -- Full Page Reload

```js
// api/responses/inertia-redirect.js
module.exports = function inertiaRedirect(url) {
  return this.req._sails.inertia.location(this.req, this.res, url)
}
```

Sends a **409 Conflict** response with `X-Inertia-Location` header, causing the client to do a full page reload. Used when cached `once()` data has changed:

```js
// In an action:
exits: { success: { responseType: 'inertiaRedirect' } },
fn: async function () {
  sails.inertia.refreshOnce('loggedInUser')
  return '/dashboard'
}
```

## `badRequest.js` -- Validation Errors

```js
// api/responses/badRequest.js
module.exports = function badRequest(data) {
  return this.req._sails.inertia.handleBadRequest(this.req, this.res, data)
}
```

This response:

1. Parses `problems` array into `{ fieldName: 'message' }` format
2. Stores errors in `req.session.errors`
3. Redirects back to the Referrer URL with **303**
4. On next page load, the Inertia middleware shares errors as the `errors` prop

```js
// In an action:
exits: {
  badSignupRequest: { responseType: 'badRequest' }
},
fn: async function ({ email }) {
  throw {
    badSignupRequest: {
      problems: [
        { email: 'An account with this email already exists.' }
      ]
    }
  }
}
```

### The Problems Format

```js
// Object format (preferred) -- maps to form.errors.fieldName
problems: [
  { email: 'Email is already taken.' },
  { password: 'Password must be at least 8 characters.' }
]

// String format (from Sails validation) -- field name extracted from quotes
problems: ['"email" must be a valid email address.']
// → form.errors.email = 'must be a valid email address.'

// General error (non-field)
problems: [{ login: 'Wrong email/password combination.' }]
// → form.errors.login = 'Wrong email/password combination.'
```

## `serverError.js`, `notFound.js`, `forbidden.js` -- Error Handling

```js
// api/responses/serverError.js
module.exports = function serverError(data) {
  return this.req._sails.inertia.handleServerError(this.req, this.res, data)
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

**In development**: 500-level HTML responses render a Youch error page. Inertia visits show that page in the Inertia development modal.

**In production**: `403`, `404`, `500`, and `503` render the configured Inertia status page by default:

```js
// config/inertia.js
module.exports.inertia = {
  errorPage: 'error',
  errorStatuses: [403, 404, 500, 503]
}
```

Ship `assets/js/pages/error.{vue,jsx,svelte}` in the client. Hybrid apps that
prefer `views/404.ejs` and `views/500.ejs` can set `errorPage: false`.

## Generating Response Files

```bash
npx sails generate inertia              # Creates api/responses/inertia.js
npx sails generate inertia-redirect     # Creates api/responses/inertia-redirect.js
npx sails generate bad-request          # Creates api/responses/badRequest.js
```

## Content-Negotiating Custom Responses

Custom responses can return different formats based on whether the request wants JSON (API/AJAX) or HTML (browser):

### `unauthorized.js`

```js
// api/responses/unauthorized.js
module.exports = function unauthorized() {
  var req = this.req
  var res = this.res

  if (req.wantsJSON) {
    return res.sendStatus(401)
  }

  // Clear the session and redirect to login
  if (req.session.userId) {
    delete req.session.userId
  }
  return res.redirect('/login')
}
```

### `expired.js` (Token Expired)

```js
// api/responses/expired.js
module.exports = function expired() {
  var req = this.req
  var res = this.res

  if (req.wantsJSON) {
    return res.status(498).send('Token Expired/Invalid')
  }
  return res.status(498).view('498')
}
```

### `badConfig.js` (Missing Configuration)

A response that provides helpful troubleshooting guidance:

```js
// api/responses/badConfig.js
module.exports = function badConfig(configKeyPath) {
  let res = this.res

  let explanation = 'Missing, incomplete, or invalid configuration'
  if (configKeyPath) {
    explanation += ` (sails.config.${configKeyPath}).`
    if (configKeyPath.match(/^builtStaticContent/)) {
      explanation +=
        ' Try running `sails run build-static-content`, then re-lift the server.'
    } else {
      explanation += ' Update this configuration, then re-lift the server.'
    }
  }

  return res.serverError(explanation)
}

// Usage in an action:
// exits: { badConfig: { responseType: 'badConfig' } }
// throw { badConfig: 'builtStaticContent.queries' }
```

## Built-in Sails Responses

These are available without custom response files:

```js
// In classic actions (not actions2):
res.ok(data) // 200
res.badRequest(data) // 400
res.forbidden() // 403
res.notFound() // 404
res.serverError(err) // 500
res.redirect(url) // 302
res.redirect(301, url) // 301
res.json(data) // JSON response
res.send(data) // Auto-detect content type
res.status(201).json() // Chain status + response
```

## API / JSON Responses

For API endpoints or webhooks that don't use Inertia:

```js
// api/controllers/api/get-status.js
module.exports = {
  fn: async function () {
    // Returning an object without responseType sends JSON
    return {
      status: 'healthy',
      version: '1.0.0',
      uptime: process.uptime()
    }
  }
}
```

```js
// Or with explicit status code:
fn: async function () {
  this.res.status(201)
  return { id: newRecord.id, created: true }
}
```
