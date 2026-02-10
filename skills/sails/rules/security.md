---
name: security
description: Sails.js security - CORS, CSRF, sessions, cookies, security configuration
metadata:
  tags: security, cors, csrf, sessions, cookies, authentication, encryption
---

# Security

## CORS Configuration

```js
// config/security.js
module.exports.security = {
  cors: {
    allRoutes: true,
    allowOrigins: ['http://localhost:1337', 'https://myapp.com'],
    allowRequestMethods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
    allowRequestHeaders:
      'content-type, x-csrf-token, x-inertia, x-inertia-version, x-inertia-partial-data, x-inertia-partial-component, x-inertia-partial-except, x-inertia-reset',
    allowCredentials: true
  }
}
```

### Per-Route CORS

```js
// config/routes.js
'POST /api/webhook': {
  action: 'webhooks/receive',
  cors: {
    allowOrigins: ['https://stripe.com'],
    allowCredentials: false
  }
}
```

## CSRF Protection

CSRF protection is built into Sails. Inertia.js handles CSRF automatically:

1. Sails generates a CSRF token stored in a `_csrf` cookie
2. Inertia's client library reads the cookie
3. Inertia includes the token as `X-CSRF-Token` header on every request

```js
// config/security.js
module.exports.security = {
  csrf: true // Enable CSRF protection globally
}
```

### Disabling CSRF for Specific Routes

For webhooks or API endpoints:

```js
// config/routes.js
'POST /webhooks/stripe': {
  action: 'webhooks/receive-stripe',
  csrf: false
}
```

## Sessions

### Session Setup

```js
// config/session.js
module.exports.session = {
  name: 'myapp.sid',
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false // true in production with HTTPS
  }
}
```

### Using Sessions

```js
// Set session data
this.req.session.userId = user.id
this.req.session.currentTeamId = team.id

// Read session data
const userId = this.req.session.userId

// Delete session data
delete this.req.session.userId

// Destroy entire session
this.req.session.destroy((err) => {
  /* ... */
})
```

### Redis Session Store (Production)

```js
// config/env/production.js
module.exports = {
  session: {
    adapter: '@sailshq/connect-redis',
    url: process.env.REDIS_URL,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }
}
```

## Authentication Patterns

### Login Flow

```js
// api/controllers/auth/login.js
module.exports = {
  inputs: {
    email: { type: 'string', required: true, isEmail: true },
    password: { type: 'string', required: true },
    rememberMe: { type: 'boolean', defaultsTo: false }
  },
  exits: {
    success: { responseType: 'redirect' },
    badLoginRequest: { responseType: 'badRequest' }
  },
  fn: async function ({ email, password, rememberMe }) {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw {
        badLoginRequest: {
          problems: [{ login: 'Wrong email/password combination.' }]
        }
      }
    }

    await sails.helpers.passwords
      .checkPassword(password, user.password)
      .intercept('incorrect', () => ({
        badLoginRequest: {
          problems: [{ login: 'Wrong email/password combination.' }]
        }
      }))

    // Set session
    this.req.session.userId = user.id

    // Extend session for "remember me"
    if (rememberMe) {
      this.req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    }

    return '/dashboard'
  }
}
```

### Logout Flow

```js
// api/controllers/auth/logout.js
module.exports = {
  exits: {
    success: { responseType: 'redirect' }
  },
  fn: async function () {
    delete this.req.session.userId
    sails.inertia.flushShared()
    sails.inertia.clearHistory()
    return '/'
  }
}
```

### Password Reset Flow

```js
// api/controllers/auth/send-password-reset.js
module.exports = {
  inputs: {
    email: { type: 'string', required: true, isEmail: true }
  },
  exits: {
    success: { responseType: 'redirect' }
  },
  fn: async function ({ email }) {
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      const token = sails.helpers.generateToken()
      await User.updateOne({ id: user.id }).set({
        passwordResetToken: token,
        passwordResetTokenExpiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
      })

      await sails.helpers.mail.sendTemplate.with({
        to: user.email,
        subject: 'Reset Your Password',
        template: 'password-reset',
        templateData: {
          fullName: user.fullName,
          resetUrl: `${sails.config.custom.appUrl}/reset-password/${token}`
        }
      })
    }

    // Always show success (don't reveal if email exists)
    sails.inertia.flash(
      'success',
      'If that email exists, we sent a reset link.'
    )
    return '/login'
  }
}
```

## Data Encryption at Rest

Sails supports encrypting sensitive model attributes:

```js
// api/models/User.js
module.exports = {
  attributes: {
    ssn: {
      type: 'string',
      encrypt: true // Encrypted at rest using dataEncryptionKeys
    }
  }
}

// config/models.js
module.exports.models = {
  dataEncryptionKeys: {
    default: process.env.DATA_ENCRYPTION_KEY
  }
}
```

## Security Best Practices

1. **Always use `migrate: 'safe'` in production** -- Never auto-migrate production databases
2. **Use environment variables** for secrets -- Never hardcode API keys or passwords
3. **Enable CSRF** for all routes except webhooks
4. **Use HTTPS** in production -- Set `cookie.secure: true` in session config
5. **Use Redis sessions** in production -- In-memory sessions don't scale
6. **Don't expose sensitive data** -- Use `customToJSON` in models to strip passwords
7. **Validate all inputs** -- Use `inputs` validation in actions, never trust client data
8. **Use `intercept('E_UNIQUE')`** -- Handle unique constraint errors gracefully
