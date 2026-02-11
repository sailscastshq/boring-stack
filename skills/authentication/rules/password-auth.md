---
name: password-auth
description: Password-based signup and login flows - password hashing, bcrypt verification, remember me, validation errors, signup with team, logout
metadata:
  tags: password, signup, login, bcrypt, hashing, remember-me, validation, logout, session
---

# Password Authentication

## Overview

Password auth is the foundational login method in The Boring Stack. It uses bcrypt for hashing (via `sails-hook-organics`), stores hashed passwords in the User model, and relies on Waterline lifecycle callbacks to hash passwords automatically on create and update.

## Signup Flow

### The Signup Action

```js
// api/controllers/auth/signup.js
module.exports = {
  inputs: {
    fullName: {
      type: 'string',
      required: true,
      maxLength: 120
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    emailAlreadyInUse: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ fullName, email, password }) {
    var newEmailAddress = email.toLowerCase()

    // Check if email is already taken
    var existingUser = await User.findOne({ email: newEmailAddress })
    if (existingUser) {
      throw {
        emailAlreadyInUse: {
          problems: [{ email: 'This email address is already in use.' }]
        }
      }
    }

    // Create user and team atomically
    const user = await sails.helpers.user.signupWithTeam.with({
      fullName,
      email: newEmailAddress,
      password,
      tosAcceptedByIp: this.req.ip
    })

    // Send verification email
    const token = await sails.helpers.strings.random('url-friendly')
    await User.updateOne({ id: user.id }).set({
      emailProofToken: token,
      emailProofTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })

    await sails.helpers.mail.send.with({
      to: newEmailAddress,
      subject: 'Verify your email',
      template: 'email-verify-account',
      templateData: {
        fullName,
        token
      }
    })

    // Log the user in
    this.req.session.userId = user.id

    return '/check-email'
  }
}
```

### Signup With Team Helper

New users are created inside a transaction along with their default team and team membership:

```js
// api/helpers/user/signup-with-team.js
module.exports = {
  inputs: {
    fullName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    password: { type: 'string' },
    tosAcceptedByIp: { type: 'string' },
    googleId: { type: 'string' },
    githubId: { type: 'string' }
  },

  fn: async function ({
    fullName,
    email,
    password,
    tosAcceptedByIp,
    googleId,
    githubId
  }) {
    // Atomic transaction: create user + team + membership together
    const user = await sails.getDatastore().transaction(async (db) => {
      const newUser = await User.create({
        fullName,
        email,
        password, // Hashed automatically by beforeCreate
        tosAcceptedByIp,
        googleId,
        githubId
      })
        .fetch()
        .usingConnection(db)

      const team = await Team.create({
        name: `${fullName}'s Team`,
        owner: newUser.id
      })
        .fetch()
        .usingConnection(db)

      await TeamMember.create({
        user: newUser.id,
        team: team.id,
        role: 'owner'
      }).usingConnection(db)

      return newUser
    })

    return user
  }
}
```

### Validation Error Pattern

When signup fails, throw an exit with a `problems` array. The `badRequest` response type automatically handles this for Inertia:

```js
// Throwing validation errors
throw {
  emailAlreadyInUse: {
    problems: [{ email: 'This email address is already in use.' }]
  }
}
```

On the frontend, Inertia makes these available as `errors`:

```jsx
// React
import { useForm } from '@inertiajs/react'

function Signup() {
  const { data, setData, post, errors, processing } = useForm({
    fullName: '',
    email: '',
    password: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/auth/signup')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={data.fullName}
        onChange={(e) => setData('fullName', e.target.value)}
      />

      <input
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
      />
      {errors.email && <p className="text-red-500">{errors.email}</p>}

      <input
        type="password"
        value={data.password}
        onChange={(e) => setData('password', e.target.value)}
      />

      <button type="submit" disabled={processing}>
        Sign up
      </button>
    </form>
  )
}
```

## Login Flow

### The Login Action

```js
// api/controllers/auth/login.js
module.exports = {
  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    password: {
      type: 'string',
      required: true
    },
    rememberMe: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    badCombo: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email, password, rememberMe }) {
    var user = await User.findOne({ email: email.toLowerCase() })

    // Check if user exists
    if (!user) {
      throw {
        badCombo: {
          problems: [
            { form: 'The email and password combination is not valid.' }
          ]
        }
      }
    }

    // Check if user has a password (may have signed up via OAuth or magic link)
    if (!user.password) {
      throw {
        badCombo: {
          problems: [
            {
              form: 'This account does not have a password. Try logging in with a magic link or social login.'
            }
          ]
        }
      }
    }

    // Verify password with bcrypt
    await sails.helpers.passwords
      .checkPassword(password, user.password)
      .intercept('incorrect', () => {
        return {
          badCombo: {
            problems: [
              { form: 'The email and password combination is not valid.' }
            ]
          }
        }
      })

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Create partial login session (not fully logged in yet)
      this.req.session.partialLogin = {
        userId: user.id,
        createdAt: Date.now()
      }

      // If email 2FA is enabled, send the code immediately
      if (user.emailTwoFactorEnabled) {
        const code = String(Math.floor(100000 + Math.random() * 900000))
        await User.updateOne({ id: user.id }).set({
          twoFactorVerificationCode: code,
          twoFactorVerificationCodeExpiresAt: Date.now() + 10 * 60 * 1000
        })
        await sails.helpers.mail.send.with({
          to: user.email,
          subject: 'Your login verification code',
          template: 'email-two-factor-code',
          templateData: { code, fullName: user.fullName }
        })
      }

      return '/auth/two-factor'
    }

    // Handle remember me
    if (rememberMe) {
      this.req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
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

### Login Flow Diagram

```
POST /auth/login (email + password)
  |
  +--> Find user by email
  |      |
  |      +--> Not found: throw badCombo
  |
  +--> Check password with bcrypt
  |      |
  |      +--> Incorrect: throw badCombo
  |
  +--> Check 2FA enabled?
  |      |
  |      +--> Yes: Set partialLogin session, redirect to /auth/two-factor
  |      |
  |      +--> No: Continue to full login
  |
  +--> Set req.session.userId
  +--> Set active team
  +--> Handle remember me cookie
  +--> Redirect to returnUrl or /dashboard
```

## Password Hashing

### How It Works

Passwords are hashed automatically via Waterline lifecycle callbacks in the User model. You never call the hash function manually during signup or password updates:

```js
// api/models/User.js
beforeCreate: async function (values, proceed) {
  if (values.password) {
    values.password = await sails.helpers.passwords.hashPassword(values.password)
  }
  return proceed()
},

beforeUpdate: async function (values, proceed) {
  if (values.password) {
    values.password = await sails.helpers.passwords.hashPassword(values.password)
  }
  return proceed()
}
```

### Password Helpers

The `sails-hook-organics` package provides bcrypt-based password helpers:

```js
// Hash a password (10 salt rounds by default)
const hash = await sails.helpers.passwords.hashPassword('mypassword')

// Check a password against its hash
await sails.helpers.passwords.checkPassword('mypassword', hash)
// Throws 'incorrect' if the password doesn't match

// Usage with intercept for custom error handling
await sails.helpers.passwords
  .checkPassword(password, user.password)
  .intercept('incorrect', () => {
    return {
      badCombo: {
        problems: [{ form: 'Invalid email or password.' }]
      }
    }
  })
```

### Key Rules

- **Never store plaintext passwords** -- The model hooks handle this automatically
- **Never compare passwords with `===`** -- Always use `checkPassword` (bcrypt timing-safe comparison)
- **The `protect: true` attribute** -- Ensures the password field is excluded from default query results

## Remember Me

The "remember me" feature extends the session cookie lifetime:

```js
// Default session cookie: expires when browser closes (session cookie)
// With remember me: 30-day persistent cookie
if (rememberMe) {
  this.req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
}
```

This is set **before** assigning `req.session.userId` so the session store persists with the extended lifetime.

## Validation Error Patterns

### The problems Array

All auth actions use the same validation pattern -- throw an exit name with a `problems` array:

```js
// Single field error
throw {
  emailAlreadyInUse: {
    problems: [{ email: 'This email is already registered.' }]
  }
}

// General form error (not tied to a specific field)
throw {
  badCombo: {
    problems: [{ form: 'Invalid email or password.' }]
  }
}

// Multiple field errors
throw {
  invalid: {
    problems: [
      { email: 'Please enter a valid email address.' },
      { password: 'Password must be at least 8 characters.' }
    ]
  }
}
```

### The badRequest Response

The `badRequest` response type (`api/responses/badRequest.js`) converts these problems into Inertia-compatible errors:

```js
// api/responses/badRequest.js
module.exports = function badRequest(data) {
  const res = this.res
  const req = this.req

  if (data && data.problems) {
    // Convert problems array to errors object for Inertia
    const errors = {}
    for (const problem of data.problems) {
      for (const [key, value] of Object.entries(problem)) {
        errors[key] = value
      }
    }

    // For Inertia requests, redirect back with errors in session
    req.session.errors = errors
    return res.redirect('back')
  }

  return res.status(400).json(data)
}
```

### Security Note on Error Messages

The login action uses a generic "invalid email or password" message for both missing users and wrong passwords. This prevents email enumeration attacks -- an attacker cannot determine whether an email is registered by observing different error messages.

## Logout

```js
// api/controllers/auth/logout.js
module.exports = {
  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function () {
    // Clear the session
    delete this.req.session.userId
    delete this.req.session.activeTeamId

    // Flush shared Inertia data (clears cached once() values like loggedInUser)
    sails.inertia.flushShared(this.req, this.res)

    return '/login'
  }
}
```

### Why flushShared Matters

`sails.inertia.flushShared()` is critical on logout. Without it, the `once()` cached `loggedInUser` would still contain the old user's data for the remainder of the session. Flushing clears all `once()` cached values so the next request starts fresh.

## Email Verification

After signup, the user receives a verification email with a token:

```js
// api/controllers/auth/verify-email.js
module.exports = {
  inputs: {
    token: {
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
    }
  },

  fn: async function ({ token }) {
    var user = await User.findOne({ emailProofToken: token })

    if (!user || user.emailProofTokenExpiresAt < Date.now()) {
      throw {
        invalidOrExpiredToken: '/email-verification-failed'
      }
    }

    // Handle two cases:
    if (user.emailStatus === 'unconfirmed') {
      // New user verifying their email
      await User.updateOne({ id: user.id }).set({
        emailStatus: 'confirmed',
        emailProofToken: '',
        emailProofTokenExpiresAt: 0
      })
    } else if (user.emailStatus === 'change-requested') {
      // Existing user verifying a new email address
      await User.updateOne({ id: user.id }).set({
        emailStatus: 'confirmed',
        emailProofToken: '',
        emailProofTokenExpiresAt: 0
      })
    }

    // Auto-login after verification
    this.req.session.userId = user.id

    return '/dashboard'
  }
}
```

## Setting Up an Initial Password

Users who signed up via magic link or OAuth may not have a password. They can set one from their security settings:

```js
// api/controllers/security/setup-initial-password.js
module.exports = {
  inputs: {
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
    passwordMismatch: {
      responseType: 'badRequest'
    },
    alreadyHasPassword: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ password, confirmPassword }) {
    if (password !== confirmPassword) {
      throw {
        passwordMismatch: {
          problems: [{ confirmPassword: 'Passwords do not match.' }]
        }
      }
    }

    const user = await User.findOne({ id: this.req.session.userId })

    if (user.password) {
      throw {
        alreadyHasPassword: {
          problems: [
            {
              form: 'You already have a password. Use the change password form instead.'
            }
          ]
        }
      }
    }

    // Password is hashed automatically by beforeUpdate
    await User.updateOne({ id: user.id }).set({ password })

    return '/settings/security'
  }
}
```

## Updating an Existing Password

```js
// api/controllers/security/update-password.js
module.exports = {
  inputs: {
    currentPassword: {
      type: 'string',
      required: true
    },
    newPassword: {
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
    incorrect: {
      responseType: 'badRequest'
    },
    passwordMismatch: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ currentPassword, newPassword, confirmPassword }) {
    if (newPassword !== confirmPassword) {
      throw {
        passwordMismatch: {
          problems: [{ confirmPassword: 'Passwords do not match.' }]
        }
      }
    }

    const user = await User.findOne({ id: this.req.session.userId })

    // Verify current password
    await sails.helpers.passwords
      .checkPassword(currentPassword, user.password)
      .intercept('incorrect', () => {
        return {
          incorrect: {
            problems: [{ currentPassword: 'Current password is incorrect.' }]
          }
        }
      })

    // Update password (hashed automatically by beforeUpdate)
    await User.updateOne({ id: user.id }).set({ password: newPassword })

    return '/settings/security'
  }
}
```
