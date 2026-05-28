---
name: error-handling
description: Error handling in Inertia - server errors, the dev error modal, production error handling, validation errors
metadata:
  tags: errors, server-error, 500, modal, development, production, error-handling
---

# Error Handling

## Validation Errors (400)

See [forms-and-validation.md](forms-and-validation.md) for the complete validation error flow. In summary:

1. Action throws `{ exitName: { problems: [{ fieldName: 'message' }] } }`
2. `badRequest` response stores errors in session and redirects back with 303
3. Inertia middleware shares errors as `errors` prop on next page load
4. `useForm` makes them available as `form.errors.fieldName`

## Status And Server Errors

The `inertia-sails` package includes `handleErrorPage()` and
`handleServerError()` helpers that behave differently based on the environment,
request type, and app configuration.

### Development

In development mode, 500-level HTML errors are rendered with **Youch**. For
Inertia visits, the client displays that HTML in the Inertia error modal, so the
developer gets source frames, stack traces, and sanitized request metadata
without losing the current page.

```
┌─────────────────────────────────────┐
│  500                                │
│  Server Error                       │
│  TypeError                          │
│                                     │
│  POST /api/teams                    │
│                                     │
│  Error Message                      │
│  Cannot read properties of null     │
│                                     │
│  Stack Trace                        │
│  at fn (/api/controllers/team.js:42)│
│  at ...                             │
└─────────────────────────────────────┘
```

### Production

In production, `inertia-sails` renders the configured Inertia status page for
`403`, `404`, `500`, and `503` responses by default:

```js
// config/inertia.js
module.exports.inertia = {
  errorPage: 'error',
  errorStatuses: [403, 404, 500, 503]
}
```

The client must ship the page component:

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

Hybrid apps that still want Sails' EJS `views/404.ejs` and `views/500.ejs`
can opt out:

```js
module.exports.inertia = {
  errorPage: false
}
```

### JSON Requests

JSON requests receive JSON status payloads instead of HTML or Inertia pages.

## Response Files

Wire Sails' built-in response names into `inertia-sails` so framework-level
403/404/500 responses all use the same policy:

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

Then use it as an exit:

```js
exits: {
  serverError: {
    responseType: 'serverError'
  }
}
```

## Error Handling Patterns

### Catching Errors in Actions

```js
fn: async function ({ teamId }) {
  try {
    await sails.helpers.billing.charge(teamId)
  } catch (err) {
    sails.log.error('Billing failed:', err)
    sails.inertia.flash('error', 'Payment processing failed. Please try again.')
    return '/settings/billing'
  }
}
```

### Custom Error Page Names

If an app wants a different component name, configure it:

```js
module.exports.inertia = {
  errorPage: 'errors/status'
}
```

### Error Boundaries (Client Side)

Inertia fires events when errors occur:

```js
import { router } from '@inertiajs/react'

// Listen for Inertia-level errors
router.on('error', (event) => {
  console.error('Inertia error:', event)
})

// Listen for invalid responses (e.g., non-Inertia responses)
router.on('invalid', (event) => {
  // Inertia shows these in a modal by default
  console.error('Invalid Inertia response:', event)
})
```

## The Problems Format

Validation errors use the `problems` array format. Each problem can be:

### Object Format (Preferred)

```js
// Maps directly to form.errors.fieldName
problems: [
  { email: 'Email is already taken.' },
  { password: 'Password must be at least 8 characters.' }
]
```

### String Format

```js
// Sails' built-in validation errors come as strings
problems: ['"email" must be a valid email address.', '"password" is required.']
// The quoted field name is extracted: form.errors.email, form.errors.password
```

### General Error (Non-Field)

```js
// Use a descriptive key for non-field errors
problems: [{ login: 'Wrong email/password combination.' }]
// Accessed as form.errors.login
```
