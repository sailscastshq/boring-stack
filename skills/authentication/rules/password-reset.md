---
name: password-reset
description: Password reset flow - forgot password with token generation, reset password with token validation, security practices, email integration
metadata:
  tags: password-reset, forgot-password, token, email, security, recovery
---

# Password Reset

## Overview

Password reset is a two-step flow: the user requests a reset link (forgot password), then uses the link to set a new password (reset password). The Boring Stack implements this with secure token generation, expiration, and automatic login after reset.

## Flow Diagram

```
User clicks "Forgot password?"
  |
  +--> GET /forgot-password (view)
  |      |
  |      +--> User enters email, submits form
  |
  +--> POST /auth/forgot-password
  |      |
  |      +--> Find user by email
  |      |      |
  |      |      +--> Not found: silently redirect (don't reveal)
  |      |      +--> Found: generate token, send email
  |      |
  |      +--> Redirect to /check-email
  |
User clicks link in email
  |
  +--> GET /reset-password?token=xxx (view)
  |      |
  |      +--> User enters new password, submits form
  |
  +--> POST /auth/reset-password
         |
         +--> Find user by token
         +--> Check token expiry
         +--> Update password
         +--> Clear token
         +--> Auto-login (set session)
         +--> Redirect to /dashboard
```

## Forgot Password Action

```js
// api/controllers/auth/forgot-password.js
module.exports = {
  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ email }) {
    var user = await User.findOne({ email: email.toLowerCase() })

    // SECURITY: Always redirect to /check-email, even if user not found.
    // This prevents email enumeration attacks.
    if (!user) {
      return '/check-email'
    }

    // Generate a secure random token
    const token = await sails.helpers.strings.random('url-friendly')

    // Store token with 1-hour expiry
    await User.updateOne({ id: user.id }).set({
      passwordResetToken: token,
      passwordResetTokenExpiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    })

    // Build the reset URL
    const resetUrl = `${sails.config.custom.baseUrl}/reset-password?token=${token}`

    // Send email
    await sails.helpers.mail.send.with({
      to: user.email,
      subject: 'Reset your password',
      template: 'email-reset-password',
      templateData: {
        fullName: user.fullName,
        resetUrl
      }
    })

    return '/check-email'
  }
}
```

### Security: Silent Failure

The forgot password action **always** redirects to `/check-email`, regardless of whether the email exists in the database:

```js
// User not found -- silent redirect, no error shown
if (!user) {
  return '/check-email'
}
```

This is a critical security measure. If the action returned an error like "no account with that email," an attacker could probe the system to discover which email addresses are registered. By always redirecting to the same page, the response is identical whether or not the email exists.

## Reset Password Action

```js
// api/controllers/auth/reset-password.js
module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    },
    confirmPassword: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidOrExpiredToken: {
      responseType: 'redirect'
    },
    passwordMismatch: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ token, password, confirmPassword }) {
    // Validate password confirmation
    if (password !== confirmPassword) {
      throw {
        passwordMismatch: {
          problems: [{ confirmPassword: 'Passwords do not match.' }]
        }
      }
    }

    // Find user by token
    var user = await User.findOne({ passwordResetToken: token })

    if (!user) {
      throw { invalidOrExpiredToken: '/reset-password?error=invalid' }
    }

    // Check token expiry
    if (user.passwordResetTokenExpiresAt < Date.now()) {
      throw { invalidOrExpiredToken: '/reset-password?error=expired' }
    }

    // Update password and clear the token
    // Password is hashed automatically by the User model's beforeUpdate hook
    await User.updateOne({ id: user.id }).set({
      password,
      passwordResetToken: '',
      passwordResetTokenExpiresAt: 0
    })

    // Auto-login after password reset
    this.req.session.userId = user.id

    return '/dashboard'
  }
}
```

## Token Lifecycle

The password reset token goes through a clear lifecycle:

```
1. Generated    --> Token created, stored with expiry
2. Sent         --> Email delivered with reset URL
3. Validated    --> User clicks link, token matched and not expired
4. Consumed     --> Password updated, token cleared from database
```

### Token Storage

```js
// On generation (forgot-password action):
await User.updateOne({ id: user.id }).set({
  passwordResetToken: token, // Plain token (URL-friendly random string)
  passwordResetTokenExpiresAt: Date.now() + 60 * 60 * 1000 // 1-hour expiry
})
```

### Token Validation

```js
// On reset (reset-password action):
// 1. Find by token
var user = await User.findOne({ passwordResetToken: token })

// 2. Check existence
if (!user) {
  throw { invalidOrExpiredToken: '/reset-password?error=invalid' }
}

// 3. Check expiry
if (user.passwordResetTokenExpiresAt < Date.now()) {
  throw { invalidOrExpiredToken: '/reset-password?error=expired' }
}
```

### Token Cleanup

```js
// After successful reset:
await User.updateOne({ id: user.id }).set({
  password, // New password (auto-hashed by beforeUpdate)
  passwordResetToken: '', // Clear the token
  passwordResetTokenExpiresAt: 0 // Clear the expiry
})
```

## View Actions

### Forgot Password Page

```js
// api/controllers/auth/view-forgot-password.js
module.exports = {
  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return {
      page: 'auth/forgot-password'
    }
  }
}
```

### Reset Password Page

```js
// api/controllers/auth/view-reset-password.js
module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'inertia'
    },
    invalidToken: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ token }) {
    // Validate the token before showing the reset form
    var user = await User.findOne({ passwordResetToken: token })

    if (!user || user.passwordResetTokenExpiresAt < Date.now()) {
      throw { invalidToken: '/forgot-password?error=invalid-or-expired' }
    }

    return {
      page: 'auth/reset-password',
      props: { token }
    }
  }
}
```

## Frontend Integration

### Forgot Password Form

```jsx
// React - pages/auth/forgot-password.jsx
import { useForm } from '@inertiajs/react'

export default function ForgotPassword() {
  const { data, setData, post, errors, processing } = useForm({
    email: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/auth/forgot-password')
  }

  return (
    <div>
      <h1>Forgot your password?</h1>
      <p>Enter your email and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          required
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}

        <button type="submit" disabled={processing}>
          {processing ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
```

### Reset Password Form

```jsx
// React - pages/auth/reset-password.jsx
import { useForm } from '@inertiajs/react'

export default function ResetPassword({ token }) {
  const { data, setData, post, errors, processing } = useForm({
    token,
    password: '',
    confirmPassword: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/auth/reset-password')
  }

  return (
    <div>
      <h1>Reset your password</h1>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="token" value={token} />

        <label htmlFor="password">New password</label>
        <input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          minLength={8}
          required
        />
        {errors.password && <p className="text-red-500">{errors.password}</p>}

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          value={data.confirmPassword}
          onChange={(e) => setData('confirmPassword', e.target.value)}
          minLength={8}
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword}</p>
        )}

        <button type="submit" disabled={processing}>
          {processing ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  )
}
```

## Routes

```js
// config/routes.js
module.exports.routes = {
  // Forgot password
  'GET /forgot-password': { action: 'auth/view-forgot-password' },
  'POST /auth/forgot-password': { action: 'auth/forgot-password' },

  // Reset password
  'GET /reset-password': { action: 'auth/view-reset-password' },
  'POST /auth/reset-password': { action: 'auth/reset-password' },

  // Check email (shared confirmation page)
  'GET /check-email': { action: 'auth/view-check-email' }
}
```

## Policy Configuration

All password reset routes are accessible to guests:

```js
// config/policies.js
module.exports.policies = {
  'auth/view-forgot-password': 'is-guest',
  'auth/forgot-password': 'is-guest',
  'auth/view-reset-password': 'is-guest',
  'auth/reset-password': 'is-guest'
}
```

## Email Template

The reset email contains a link with the token:

```js
await sails.helpers.mail.send.with({
  to: user.email,
  subject: 'Reset your password',
  template: 'email-reset-password',
  templateData: {
    fullName: user.fullName,
    resetUrl: `${sails.config.custom.baseUrl}/reset-password?token=${token}`
  }
})
```

The `baseUrl` must be configured correctly in each environment:

```js
// config/custom.js
module.exports.custom = {
  baseUrl: 'http://localhost:1337' // Override in production env config
}

// config/env/production.js
module.exports = {
  custom: {
    baseUrl: 'https://myapp.com'
  }
}
```

## Security Checklist

| Concern            | Implementation                                     |
| ------------------ | -------------------------------------------------- |
| Email enumeration  | Silent failure -- always redirect to /check-email  |
| Token guessability | Cryptographically random URL-friendly string       |
| Token expiration   | 1-hour expiry with timestamp check                 |
| Token reuse        | Token cleared after successful reset               |
| Password storage   | Auto-hashed by User model beforeUpdate hook        |
| Auto-login         | User is logged in immediately after reset          |
| Form validation    | Password confirmation checked before processing    |
| View validation    | Reset page validates token before showing the form |

## Common Customizations

### Adjusting Token Expiry

```js
// Default: 1 hour
passwordResetTokenExpiresAt: Date.now() + 60 * 60 * 1000

// Shorter (30 minutes) for higher security:
passwordResetTokenExpiresAt: Date.now() + 30 * 60 * 1000

// Longer (24 hours) for user convenience:
passwordResetTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
```

### Sending a Confirmation Email After Reset

```js
// In reset-password action, after updating the password:
await sails.helpers.mail.send.with({
  to: user.email,
  subject: 'Your password has been reset',
  template: 'email-password-changed',
  templateData: {
    fullName: user.fullName
  }
})
```

### Rate Limiting Forgot Password Requests

To prevent abuse, you can add rate limiting similar to magic links:

```js
// Check if a reset was requested recently (5-minute cooldown)
if (user.passwordResetTokenExpiresAt) {
  const tokenAge =
    Date.now() - (user.passwordResetTokenExpiresAt - 60 * 60 * 1000)
  if (tokenAge < 5 * 60 * 1000) {
    // Still redirect to check-email to avoid leaking info
    return '/check-email'
  }
}
```
