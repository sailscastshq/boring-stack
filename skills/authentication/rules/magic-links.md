---
name: magic-links
description: Passwordless magic link authentication - token generation, hashing, request/verify actions, auto-signup, rate limiting, security practices
metadata:
  tags: magic-link, passwordless, token, hashing, rate-limiting, auto-signup, email
---

# Magic Link Authentication

## Overview

Magic links provide passwordless authentication. The user enters their email, receives a link with a unique token, clicks it, and is logged in. The Boring Stack implements magic links with cryptographic token hashing, rate limiting, single-use enforcement, and automatic account creation for new users.

## Token Lifecycle

```
1. User enters email
2. Server generates a random URL-friendly token
3. Server hashes the token and stores the hash in the database
4. Server sends the plain token in an email link
5. User clicks the link
6. Server hashes the incoming token and compares against the stored hash
7. If valid: mark as used, log user in
```

The key security insight: only the **hash** is stored in the database. If the database is compromised, the attacker cannot reconstruct valid magic link URLs.

## Magic Link Helpers

### Generate Token

```js
// api/helpers/magic-link/generate-token.js
module.exports = {
  fn: async function () {
    // Generate a cryptographically random URL-friendly token
    const token = await sails.helpers.strings.random('url-friendly')
    return token
  }
}
```

### Hash Token

```js
// api/helpers/magic-link/hash-token.js
const crypto = require('crypto')

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },

  fn: async function ({ token }) {
    // SHA-256 hash for storage (not bcrypt -- we need exact match, not timing-safe comparison)
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}
```

### Validate Token

```js
// api/helpers/magic-link/validate-token.js
const crypto = require('crypto')

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true
    },
    user: {
      type: 'ref',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Token is valid.'
    },
    invalid: {
      description: 'Token is invalid, expired, or already used.'
    }
  },

  fn: async function ({ token, user }) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Check token matches
    if (user.magicLinkToken !== hashedToken) {
      throw 'invalid'
    }

    // Check expiration
    if (user.magicLinkTokenExpiresAt < Date.now()) {
      throw 'invalid'
    }

    // Check single-use
    if (user.magicLinkTokenUsedAt) {
      throw 'invalid'
    }

    return true
  }
}
```

## Request Magic Link Action

This is the main action that generates and sends a magic link email:

```js
// api/controllers/auth/request-magic-link.js
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
    },
    rateLimited: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email }) {
    const normalizedEmail = email.toLowerCase()

    // Find or prepare user
    var user = await User.findOne({ email: normalizedEmail })

    // Rate limiting: check if a magic link was sent recently (2-minute cooldown)
    if (user && user.magicLinkTokenExpiresAt) {
      const tokenAge =
        Date.now() - (user.magicLinkTokenExpiresAt - 15 * 60 * 1000)
      const cooldownMs = 2 * 60 * 1000 // 2 minutes

      if (tokenAge < cooldownMs) {
        throw {
          rateLimited: {
            problems: [
              {
                form: 'A magic link was sent recently. Please check your email or wait a moment.'
              }
            ]
          }
        }
      }
    }

    // Generate token and hash
    const token = await sails.helpers.magicLink.generateToken()
    const hashedToken = await sails.helpers.magicLink.hashToken(token)

    if (user) {
      // Update existing user with new magic link token
      await User.updateOne({ id: user.id }).set({
        magicLinkToken: hashedToken,
        magicLinkTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        magicLinkTokenUsedAt: null
      })
    } else {
      // Auto-signup: create a new user account
      user = await sails.helpers.user.signupWithTeam.with({
        fullName: normalizedEmail.split('@')[0], // Temporary name from email
        email: normalizedEmail
      })

      await User.updateOne({ id: user.id }).set({
        magicLinkToken: hashedToken,
        magicLinkTokenExpiresAt: Date.now() + 15 * 60 * 1000,
        magicLinkTokenUsedAt: null
      })
    }

    // Build the magic link URL
    const magicLinkUrl = `${
      sails.config.custom.baseUrl
    }/auth/verify-magic-link?token=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}`

    // Send the email
    await sails.helpers.mail.send.with({
      to: normalizedEmail,
      subject: 'Your magic link',
      template: 'email-magic-link',
      templateData: {
        fullName: user.fullName,
        magicLinkUrl
      }
    })

    return '/check-email'
  }
}
```

### Key Design Decisions

1. **Auto-signup**: If the email is not registered, a new account is created automatically. The user does not need a separate signup step.
2. **Rate limiting**: A 2-minute cooldown prevents abuse. The cooldown is calculated from when the token was created (expiry minus the 15-minute window).
3. **Silent redirect**: The action always redirects to `/check-email`, even if the email is not registered (before auto-signup was added). This prevents email enumeration.

## Verify Magic Link Action

When the user clicks the link in their email:

```js
// api/controllers/auth/verify-magic-link.js
module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidOrExpired: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ token, email }) {
    const normalizedEmail = email.toLowerCase()

    // Find the user
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      throw { invalidOrExpired: '/login?error=invalid-magic-link' }
    }

    // Validate the token (checks hash match, expiration, and single-use)
    try {
      await sails.helpers.magicLink.validateToken.with({ token, user })
    } catch (err) {
      throw { invalidOrExpired: '/login?error=invalid-magic-link' }
    }

    // Mark token as used (single-use enforcement)
    await User.updateOne({ id: user.id }).set({
      magicLinkTokenUsedAt: Date.now()
    })

    // If email was unconfirmed, confirm it (they proved ownership by clicking the link)
    if (user.emailStatus === 'unconfirmed') {
      await User.updateOne({ id: user.id }).set({
        emailStatus: 'confirmed'
      })
    }

    // Full login
    this.req.session.userId = user.id

    // Set active team
    const defaultTeam = await sails.helpers.user.getDefaultTeam(user.id)
    if (defaultTeam) {
      this.req.session.activeTeamId = defaultTeam.id
    }

    // Redirect to stored return URL or dashboard
    const returnUrl = await sails.helpers.returnUrl.get(this.req)
    await sails.helpers.returnUrl.clear(this.req)

    return returnUrl
  }
}
```

## Flow Diagram

```
User enters email on login page
  |
  +--> POST /auth/request-magic-link
  |      |
  |      +--> Check rate limit (2-min cooldown)
  |      |      |
  |      |      +--> Too soon: throw rateLimited
  |      |
  |      +--> Find user by email
  |      |      |
  |      |      +--> Not found: auto-create user via signupWithTeam
  |      |
  |      +--> Generate random token
  |      +--> Hash token (SHA-256)
  |      +--> Store hash + expiry in user record
  |      +--> Send email with plain token in URL
  |      +--> Redirect to /check-email
  |
User clicks link in email
  |
  +--> GET /auth/verify-magic-link?token=xxx&email=xxx
         |
         +--> Find user by email
         +--> Hash incoming token
         +--> Compare with stored hash
         +--> Check expiration (15 min)
         +--> Check single-use (not already used)
         +--> Mark token as used
         +--> Confirm email if unconfirmed
         +--> Set req.session.userId
         +--> Set active team
         +--> Redirect to returnUrl or /dashboard
```

## Security Properties

### Token Hashing

The magic link token is **never stored in plain text**. Only the SHA-256 hash is saved in the database:

```js
// What's stored in the database:
// user.magicLinkToken = "a3f2b8c9d4e5f6..." (SHA-256 hash)

// What's sent in the email:
// /auth/verify-magic-link?token=Xk9mQ2... (plain random token)
```

If an attacker gains database access, they cannot reconstruct the magic link URLs.

### Single-Use Enforcement

The `magicLinkTokenUsedAt` field ensures each token can only be used once:

```js
// On generation:
magicLinkTokenUsedAt: null

// After successful use:
magicLinkTokenUsedAt: Date.now()

// On validation, reject if already used:
if (user.magicLinkTokenUsedAt) {
  throw 'invalid'
}
```

### Rate Limiting

A 2-minute cooldown between requests prevents abuse:

```js
// Calculate when the token was created
const tokenAge = Date.now() - (user.magicLinkTokenExpiresAt - 15 * 60 * 1000)
const cooldownMs = 2 * 60 * 1000  // 2 minutes

if (tokenAge < cooldownMs) {
  throw { rateLimited: { problems: [...] } }
}
```

This is calculated from the token expiry minus the 15-minute window, giving us the creation timestamp without needing an extra field.

### Token Expiration

Tokens expire after 15 minutes:

```js
magicLinkTokenExpiresAt: Date.now() + 15 * 60 * 1000
```

During validation:

```js
if (user.magicLinkTokenExpiresAt < Date.now()) {
  throw 'invalid'
}
```

## Frontend Integration

### Request Magic Link Form

```jsx
// React
import { useForm } from '@inertiajs/react'

function MagicLinkForm() {
  const { data, setData, post, errors, processing } = useForm({
    email: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/auth/request-magic-link')
  }

  return (
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
      {errors.form && <p className="text-red-500">{errors.form}</p>}

      <button type="submit" disabled={processing}>
        {processing ? 'Sending...' : 'Send magic link'}
      </button>
    </form>
  )
}
```

### Check Email Page

After requesting a magic link, the user sees a confirmation page:

```jsx
// React - pages/auth/check-email.jsx
export default function CheckEmail() {
  return (
    <div>
      <h1>Check your email</h1>
      <p>We sent you a magic link. Click the link in the email to log in.</p>
      <p>The link expires in 15 minutes.</p>
    </div>
  )
}
```

## Email Template

```js
// Email template data passed to the mailer
await sails.helpers.mail.send.with({
  to: normalizedEmail,
  subject: 'Your magic link',
  template: 'email-magic-link',
  templateData: {
    fullName: user.fullName,
    magicLinkUrl: `${
      sails.config.custom.baseUrl
    }/auth/verify-magic-link?token=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}`
  }
})
```

The `baseUrl` comes from `config/custom.js` and must be set correctly for each environment:

```js
// config/custom.js
module.exports.custom = {
  baseUrl: 'http://localhost:1337' // Override in production
  // ...
}
```

## Routes

```js
// config/routes.js
module.exports.routes = {
  // Magic link pages
  'GET /magic-link': { action: 'auth/view-magic-link' },
  'GET /check-email': { action: 'auth/view-check-email' },

  // Magic link API
  'POST /auth/request-magic-link': { action: 'auth/request-magic-link' },
  'GET /auth/verify-magic-link': { action: 'auth/verify-magic-link' }
}
```

Note that the verify action is a **GET** request because the user clicks a link in their email. The token is passed as a query parameter.

## Magic Link vs Password Auth

| Aspect          | Password                  | Magic Link                            |
| --------------- | ------------------------- | ------------------------------------- |
| User effort     | Type email + password     | Type email, check inbox               |
| Server storage  | Bcrypt hash               | SHA-256 hash (temporary)              |
| Token lifetime  | Permanent (until changed) | 15 minutes                            |
| Rate limiting   | Lockout after N attempts  | 2-minute cooldown                     |
| Auto-signup     | No (separate signup flow) | Yes (creates account if missing)      |
| 2FA integration | Yes (partial login)       | Bypasses 2FA (email proves ownership) |

Magic link login bypasses 2FA because the user has already proved they control the email address, which is equivalent to or stronger than email-based 2FA.
