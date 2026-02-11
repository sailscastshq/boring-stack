---
name: getting-started
description: Auth architecture overview - session-based auth, User model fields, policies, req.me pattern, return URL handling, and route protection
metadata:
  tags: architecture, session, policies, req.me, return-url, user-model, route-protection
---

# Getting Started with Authentication

## Auth Architecture

The Boring JavaScript Stack uses **session-based authentication**. When a user logs in, their user ID is stored in `req.session.userId`. Every subsequent request includes the session cookie, and the custom hook resolves the full user record as shared Inertia data.

There is no JWT, no token header, and no separate auth server. The session is stored server-side (in-memory by default, or in a session store like Redis or MongoDB in production), and the browser receives a plain `sails.sid` cookie.

### Core Principle

```
Browser cookie (sails.sid) --> Session store (req.session.userId) --> User record --> req.me / shared props
```

All auth flows ultimately do one thing: set `req.session.userId` to the logged-in user's ID. Everything else -- magic links, passkeys, 2FA, OAuth -- is just a different path to reach that same session assignment.

## User Model Overview

The `User` model (`api/models/User.js`) contains all authentication-related attributes. Here are the key field groups:

### Core Auth Fields

```js
// api/models/User.js
module.exports = {
  attributes: {
    // Identity
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200
    },
    password: {
      type: 'string',
      protect: true, // Excluded from default queries
      minLength: 8
    },
    emailStatus: {
      type: 'string',
      isIn: ['unconfirmed', 'confirmed', 'change-requested'],
      defaultsTo: 'unconfirmed'
    },

    // Profile
    fullName: {
      type: 'string',
      required: true,
      maxLength: 120
    },
    initials: {
      type: 'string'
    },
    avatarUrl: {
      type: 'string',
      maxLength: 2048
    },
    tosAcceptedByIp: {
      type: 'string'
    }
  }
}
```

### Two-Factor Authentication Fields

```js
{
  twoFactorEnabled: { type: 'boolean', defaultsTo: false },
  totpEnabled: { type: 'boolean', defaultsTo: false },
  emailTwoFactorEnabled: { type: 'boolean', defaultsTo: false },
  totpSecret: { type: 'string' },
  backupCodes: { type: 'json', defaultsTo: [] },
  twoFactorVerificationCode: { type: 'string' },
  twoFactorVerificationCodeExpiresAt: { type: 'number' }
}
```

### Passkey Fields

```js
{
  passkeyEnabled: { type: 'boolean', defaultsTo: false },
  passkeys: { type: 'json', defaultsTo: [] },       // Array of stored credentials
  passkeyChallenge: { type: 'string' },              // Current WebAuthn challenge
  passkeyChallengeExpiresAt: { type: 'number' }      // Challenge expiration timestamp
}
```

### Token Fields

```js
{
  // Email verification
  emailProofToken: { type: 'string' },
  emailProofTokenExpiresAt: { type: 'number' },

  // Password reset
  passwordResetToken: { type: 'string' },
  passwordResetTokenExpiresAt: { type: 'number' },

  // Magic links
  magicLinkToken: { type: 'string', protect: true },  // Stored as hash
  magicLinkTokenExpiresAt: { type: 'number' },
  magicLinkTokenUsedAt: { type: 'number' }
}
```

### OAuth Fields

```js
{
  // Google
  googleId: { type: 'string', allowNull: true },
  googleAccessToken: { type: 'string', protect: true },
  googleIdToken: { type: 'string', protect: true },
  googleAvatarUrl: { type: 'string', maxLength: 2048 },

  // GitHub
  githubId: { type: 'string', allowNull: true },
  githubAccessToken: { type: 'string', protect: true },
  githubAvatarUrl: { type: 'string', maxLength: 2048 }
}
```

### Lifecycle Callbacks

The User model uses `beforeCreate` and `beforeUpdate` to handle password hashing, strength calculation, and initials:

```js
module.exports = {
  // ...attributes above...

  beforeCreate: async function (values, proceed) {
    if (values.password) {
      values.password = await sails.helpers.passwords.hashPassword(
        values.password
      )
    }
    if (values.fullName) {
      values.initials = values.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    }
    return proceed()
  },

  beforeUpdate: async function (values, proceed) {
    if (values.password) {
      values.password = await sails.helpers.passwords.hashPassword(
        values.password
      )
    }
    if (values.fullName) {
      values.initials = values.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    }
    return proceed()
  },

  customToJSON: function () {
    return _.omit(this, [
      'password',
      'passwordResetToken',
      'passwordResetTokenExpiresAt',
      'emailProofToken',
      'emailProofTokenExpiresAt',
      'magicLinkToken',
      'magicLinkTokenExpiresAt',
      'magicLinkTokenUsedAt',
      'totpSecret',
      'backupCodes',
      'twoFactorVerificationCode',
      'twoFactorVerificationCodeExpiresAt',
      'passkeyChallenge',
      'passkeyChallengeExpiresAt',
      'googleAccessToken',
      'googleIdToken',
      'githubAccessToken'
    ])
  }
}
```

The `customToJSON` method ensures sensitive fields are never accidentally exposed in API responses or Inertia props.

## Policies

The Boring Stack uses three core authentication policies:

### is-authenticated

The primary guard for protected routes. Checks that the user has a valid session:

```js
// api/policies/is-authenticated.js
module.exports = async function (req, res, proceed) {
  if (req.session.userId) {
    return proceed()
  }

  // Store the URL they were trying to visit for post-login redirect
  sails.helpers.returnUrl.set(req, req.url)

  return res.redirect('/login')
}
```

### is-guest

Prevents authenticated users from accessing auth pages (login, signup). This stops a logged-in user from seeing the login form:

```js
// api/policies/is-guest.js
module.exports = async function (req, res, proceed) {
  if (!req.session.userId) {
    return proceed()
  }

  return res.redirect('/dashboard')
}
```

### has-partially-logged-in

For the 2FA verification step. A "partial login" means the user provided valid credentials but still needs to complete 2FA:

```js
// api/policies/has-partially-logged-in.js
module.exports = async function (req, res, proceed) {
  if (req.session.partialLogin && req.session.partialLogin.userId) {
    return proceed()
  }

  return res.redirect('/login')
}
```

## The req.me Pattern

The custom hook attaches the logged-in user to every Inertia response via `sails.inertia.share()`:

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
              const loggedInUser = await User.findOne({
                id: req.session.userId
              })
              if (!loggedInUser) {
                sails.log.warn(
                  'Session references missing user, clearing session...'
                )
                delete req.session.userId
                return next()
              }

              // Share with Inertia (available on every page as props.loggedInUser)
              sails.inertia.share(
                'loggedInUser',
                sails.inertia.once(async () => {
                  return {
                    id: loggedInUser.id,
                    email: loggedInUser.email,
                    fullName: loggedInUser.fullName,
                    initials: loggedInUser.initials,
                    avatarUrl: loggedInUser.avatarUrl
                  }
                })
              )

              // Also attach to req for use in policies and actions
              req.me = loggedInUser
            }

            return next()
          }
        }
      }
    }
  }
}
```

On the frontend, access the user via Inertia's shared data:

```jsx
// React
import { usePage } from '@inertiajs/react'

function Navigation() {
  const { loggedInUser } = usePage().props
  if (!loggedInUser) return <LoginLink />
  return <span>Welcome, {loggedInUser.fullName}</span>
}
```

```vue
<!-- Vue -->
<script setup>
import { usePage } from '@inertiajs/vue3'
const { loggedInUser } = usePage().props
</script>
```

## Return URL Handling

When a guest visits a protected page, the auth system stores their intended destination and redirects them back after login.

### Storing the Return URL

The `is-authenticated` policy stores the URL before redirecting to login:

```js
// api/policies/is-authenticated.js
sails.helpers.returnUrl.set(req, req.url)
return res.redirect('/login')
```

### The Return URL Helpers

```js
// api/helpers/return-url/set.js
module.exports = {
  inputs: {
    req: { type: 'ref', required: true },
    url: { type: 'string', required: true }
  },
  fn: async function ({ req, url }) {
    req.session.returnUrl = url
  }
}

// api/helpers/return-url/get.js
module.exports = {
  inputs: {
    req: { type: 'ref', required: true }
  },
  fn: async function ({ req }) {
    return req.session.returnUrl || '/dashboard'
  }
}

// api/helpers/return-url/clear.js
module.exports = {
  inputs: {
    req: { type: 'ref', required: true }
  },
  fn: async function ({ req }) {
    delete req.session.returnUrl
  }
}
```

### Using Return URL After Login

Every login action (password, magic link, passkey, OAuth) follows the same pattern:

```js
// In any login action's fn:
req.session.userId = user.id

// Get the stored return URL (defaults to /dashboard)
const returnUrl = await sails.helpers.returnUrl.get(req)
await sails.helpers.returnUrl.clear(req)

return res.redirect(returnUrl)
```

This ensures that a user who visits `/settings/billing` while logged out will be taken to `/login`, and after authenticating, will be redirected back to `/settings/billing` instead of the default dashboard.

## Auth State Hierarchy

Users move through three authentication states:

```
Guest (no session)
  |
  | -- login with valid credentials (when 2FA enabled) -->
  |
Partial Login (req.session.partialLogin.userId set)
  |
  | -- complete 2FA verification -->
  |
Full Login (req.session.userId set)
```

### State Transitions

| From          | Action              | To            |
| ------------- | ------------------- | ------------- |
| Guest         | Login (no 2FA)      | Full Login    |
| Guest         | Login (2FA enabled) | Partial Login |
| Guest         | Magic link verified | Full Login    |
| Guest         | Passkey verified    | Full Login    |
| Guest         | OAuth callback      | Full Login    |
| Partial Login | 2FA verified        | Full Login    |
| Partial Login | 10-min timeout      | Guest         |
| Full Login    | Logout              | Guest         |

### Partial Login Session

When a user has 2FA enabled, the login action creates a partial login session instead of a full login:

```js
// In login action, after password verified but 2FA is required:
req.session.partialLogin = {
  userId: user.id,
  createdAt: Date.now()
}
// Do NOT set req.session.userId yet
return res.redirect('/auth/two-factor')
```

The 2FA verification action then promotes the partial login to a full login:

```js
// In verify-2fa action, after code verified:
req.session.userId = req.session.partialLogin.userId
delete req.session.partialLogin
return res.redirect('/dashboard')
```

## Route Protection with Policies

### Policy Configuration

```js
// config/policies.js
module.exports.policies = {
  // Default: all actions require authentication
  '*': 'is-authenticated',

  // Auth pages: only guests can access
  'auth/view-login': 'is-guest',
  'auth/view-signup': 'is-guest',
  'auth/login': 'is-guest',
  'auth/signup': 'is-guest',
  'auth/request-magic-link': 'is-guest',
  'auth/verify-magic-link': 'is-guest',
  'auth/view-forgot-password': 'is-guest',
  'auth/forgot-password': 'is-guest',
  'auth/view-reset-password': 'is-guest',
  'auth/reset-password': 'is-guest',
  'auth/challenge-passkey': 'is-guest',
  'auth/verify-passkey': 'is-guest',

  // OAuth: guests only
  'auth/redirect': 'is-guest',
  'auth/callback': 'is-guest',

  // 2FA verification: requires partial login
  'auth/view-verify-2fa': 'has-partially-logged-in',
  'auth/verify-2fa': 'has-partially-logged-in',
  'auth/send-login-email-2fa': 'has-partially-logged-in',

  // Protected areas: is-authenticated (inherited from *)
  // dashboard/*: is-authenticated
  // setting/*: is-authenticated
  // security/*: is-authenticated

  // Public pages
  'view-homepage': true,
  'not-found': true,
  'legal/*': true,
  'webhooks/*': true
}
```

### Policy Design Rules

1. **Guest pages use `is-guest`** -- Prevents logged-in users from seeing login/signup forms
2. **2FA pages use `has-partially-logged-in`** -- Only reachable after valid credential entry
3. **Everything else inherits `is-authenticated`** from the `'*'` default
4. **Policies do not cascade** -- Each action mapping is independent. If you need both `is-authenticated` and `is-admin`, list both: `['is-authenticated', 'is-admin']`

## Directory Structure

```
api/
├── controllers/
│   └── auth/
│       ├── login.js                   # POST /auth/login
│       ├── signup.js                  # POST /auth/signup
│       ├── logout.js                  # POST /auth/logout
│       ├── request-magic-link.js      # POST /auth/request-magic-link
│       ├── verify-magic-link.js       # GET  /auth/verify-magic-link
│       ├── forgot-password.js         # POST /auth/forgot-password
│       ├── reset-password.js          # POST /auth/reset-password
│       ├── verify-email.js            # GET  /auth/verify-email
│       ├── verify-2fa.js              # POST /auth/verify-2fa
│       ├── send-login-email-2fa.js    # POST /auth/send-login-email-2fa
│       ├── challenge-passkey.js       # POST /auth/challenge-passkey
│       ├── verify-passkey.js          # POST /auth/verify-passkey
│       ├── redirect.js               # GET  /auth/redirect/:provider
│       ├── callback.js               # GET  /auth/callback/:provider
│       ├── view-login.js             # GET  /login
│       ├── view-signup.js            # GET  /signup
│       ├── view-forgot-password.js   # GET  /forgot-password
│       ├── view-reset-password.js    # GET  /reset-password
│       └── view-verify-2fa.js        # GET  /auth/two-factor
├── controllers/
│   └── security/
│       ├── setup-passkey.js           # POST /security/setup-passkey
│       ├── verify-passkey-setup.js    # POST /security/verify-passkey-setup
│       ├── setup-totp.js             # POST /security/setup-totp
│       ├── verify-totp-setup.js      # POST /security/verify-totp-setup
│       ├── setup-email-2fa.js        # POST /security/setup-email-2fa
│       ├── verify-email-2fa-setup.js # POST /security/verify-email-2fa-setup
│       ├── disable-2fa.js            # POST /security/disable-2fa
│       ├── generate-backup-codes.js  # POST /security/generate-backup-codes
│       ├── update-password.js        # PATCH /security/update-password
│       └── setup-initial-password.js # POST /security/setup-initial-password
├── helpers/
│   ├── magic-link/
│   │   ├── generate-token.js
│   │   ├── hash-token.js
│   │   └── validate-token.js
│   ├── passkey/
│   │   ├── generate-registration-options.js
│   │   ├── generate-authentication-options.js
│   │   ├── verify-registration.js
│   │   └── verify-authentication.js
│   ├── totp/
│   │   ├── generate-secret.js
│   │   ├── generate-qr-code.js
│   │   └── verify.js
│   ├── user/
│   │   ├── signup-with-team.js
│   │   └── get-default-team.js
│   └── return-url/
│       ├── get.js
│       ├── set.js
│       └── clear.js
├── models/
│   └── User.js
└── policies/
    ├── is-authenticated.js
    ├── is-guest.js
    └── has-partially-logged-in.js
```

## Auth Flow Summary

| Method             | Route                         | Policy                  | Session Result                  |
| ------------------ | ----------------------------- | ----------------------- | ------------------------------- |
| Password login     | POST /auth/login              | is-guest                | userId (or partialLogin if 2FA) |
| Signup             | POST /auth/signup             | is-guest                | userId                          |
| Magic link request | POST /auth/request-magic-link | is-guest                | -- (sends email)                |
| Magic link verify  | GET /auth/verify-magic-link   | is-guest                | userId                          |
| Passkey challenge  | POST /auth/challenge-passkey  | is-guest                | -- (returns options)            |
| Passkey verify     | POST /auth/verify-passkey     | is-guest                | userId                          |
| 2FA verify         | POST /auth/verify-2fa         | has-partially-logged-in | userId                          |
| OAuth redirect     | GET /auth/redirect/:provider  | is-guest                | -- (redirects to provider)      |
| OAuth callback     | GET /auth/callback/:provider  | is-guest                | userId                          |
| Logout             | POST /auth/logout             | is-authenticated        | cleared                         |
