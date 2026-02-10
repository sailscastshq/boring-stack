---
name: responses
description: Sails.js custom responses - Inertia responses, badRequest, serverError, redirect, response files
metadata:
  tags: responses, inertia, badRequest, serverError, redirect, custom, api
---

# Responses

Custom responses in `api/responses/` define how actions communicate results to the client. The Boring Stack uses four main response types for Inertia.js integration.

## Response Files

```
api/responses/
├── inertia.js          ← Renders an Inertia page
├── inertia-redirect.js ← 409 full page reload (for stale once() data)
├── badRequest.js       ← Validation errors → session → redirect back
└── serverError.js      ← Error handling (dev modal or production flash)
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

## `serverError.js` -- Error Handling

```js
// api/responses/serverError.js
module.exports = function serverError(data) {
  return this.req._sails.inertia.handleServerError(this.req, this.res, data)
}
```

**In development** (Inertia request): Shows a styled error modal with the error name, message, stack trace, and request details.

**In production** (Inertia request): Flashes a generic error message and redirects back:

```js
sails.inertia.flash('error', 'An unexpected error occurred. Please try again.')
res.redirect(303, req.get('Referrer') || '/')
```

**Non-Inertia requests**: Renders the standard `views/500.ejs` view.

## Generating Response Files

```bash
npx sails generate inertia              # Creates api/responses/inertia.js
npx sails generate inertia-redirect     # Creates api/responses/inertia-redirect.js
npx sails generate bad-request          # Creates api/responses/badRequest.js
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
