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

## Server Errors (500)

The `inertia-sails` package includes a `serverError` response handler that behaves differently based on the environment and request type.

### Development + Inertia Request

In development mode, server errors are displayed in the **Inertia error modal** -- a styled HTML overlay that shows the error name, message, stack trace, and request details. This lets you debug without losing your page state.

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

### Production + Inertia Request

In production, server errors:

1. Flash a generic error message
2. Redirect back to the Referrer URL with 303

```js
// What happens internally:
sails.inertia.flash('error', 'An unexpected error occurred. Please try again.')
res.redirect(303, req.get('Referrer') || '/')
```

### Non-Inertia Requests

For non-Inertia requests (direct browser visits, API calls), the standard Sails error view (`views/500.ejs`) is rendered.

## Using `responseType: 'serverError'`

Set up the server error response in your custom response file:

```js
// api/responses/serverError.js
module.exports = function serverError(data) {
  return this.req._sails.inertia.handleServerError(this.req, this.res, data)
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

### Custom Error Pages

For 404 errors, create a dedicated page:

```js
// api/controllers/not-found.js (catch-all route)
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    this.res.status(404)
    return { page: 'errors/404' }
  }
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
