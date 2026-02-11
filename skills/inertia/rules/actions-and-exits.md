---
name: actions-and-exits
description: Sails.js action2 patterns for Inertia - exits, response types, the four action patterns
metadata:
  tags: actions, exits, response-type, controllers, action2, patterns
---

# Actions and Exits

## The Four Action Patterns

In The Boring JavaScript Stack, every Sails action falls into one of four patterns based on its exit response type.

### Pattern A: Render a Page (`responseType: 'inertia'`)

Used for **GET routes** that display a page. The action returns `{ page, props }`.

```js
// api/controllers/dashboard/view-dashboard.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    var recentInvoices = await Invoice.find({
      creator: this.req.me.id
    })
      .sort('createdAt DESC')
      .limit(5)

    return {
      page: 'dashboard/index',
      props: { recentInvoices }
    }
  }
}
```

### Pattern B: Redirect After Mutation (`responseType: 'redirect'`)

Used for **POST/PATCH/PUT/DELETE routes** that succeed and redirect. The action returns a **URL string**. Inertia automatically follows the redirect with a GET request.

```js
// api/controllers/auth/signup.js
module.exports = {
  inputs: {
    fullName: { type: 'string', required: true },
    email: { type: 'string', isEmail: true, required: true },
    password: { type: 'string', required: true, minLength: 8 }
  },
  exits: {
    success: { responseType: 'redirect' },
    emailTaken: { responseType: 'badRequest' }
  },
  fn: async function ({ fullName, email, password }) {
    var user = await User.create({ fullName, email, password })
      .intercept('E_UNIQUE', 'emailTaken')
      .fetch()

    this.req.session.userId = user.id
    return '/dashboard'
  }
}
```

### Pattern C: Inertia Redirect / Full Page Visit (`responseType: 'inertiaRedirect'`)

Used when you need to **force a full page reload** after a mutation. This sends a 409 status with an `X-Inertia-Location` header, which tells the Inertia client to do a full window visit. Use this when:

- Shared data has changed and needs a fresh load (e.g., after profile update)
- You want to ensure all cached `once()` props are refreshed
- The URL is external or requires a full reload

```js
// api/controllers/setting/update-profile.js
module.exports = {
  inputs: {
    fullName: { type: 'string' },
    email: { type: 'string', isEmail: true },
    avatar: { type: 'ref' }
  },
  exits: {
    success: { responseType: 'inertiaRedirect' },
    invalid: { responseType: 'badRequest' }
  },
  fn: async function ({ fullName, email, avatar }) {
    await User.updateOne({ id: this.req.me.id }).set({ fullName, email })

    sails.inertia.refreshOnce('loggedInUser')
    sails.inertia.flash('success', 'Profile updated successfully!')
    return '/settings/profile'
  }
}
```

### Pattern D: Validation Error (`responseType: 'badRequest'`)

Used when form validation fails. The action throws with a `problems` array. The `badRequest` response handler stores errors in the session and redirects back.

```js
// Throwing validation errors:
throw {
  emailTaken: {
    problems: [{ email: 'An account with this email already exists.' }]
  }
}

// Or using .intercept():
await User.create({ email, password }).intercept('E_UNIQUE', () => ({
  emailTaken: {
    problems: [{ email: 'Email is already taken.' }]
  }
}))
```

## Complete Action Example

A real-world action combining multiple exits:

```js
// api/controllers/auth/login.js
module.exports = {
  inputs: {
    email: { type: 'string', isEmail: true, required: true },
    password: { type: 'string', required: true },
    rememberMe: { type: 'boolean', defaultsTo: false }
  },
  exits: {
    success: { responseType: 'redirect' },
    badCombo: { responseType: 'badRequest' },
    twoFactorRequired: { responseType: 'redirect' }
  },
  fn: async function ({ email, password, rememberMe }) {
    var user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw { badCombo: { problems: [{ login: 'Wrong email/password.' }] } }
    }

    await sails.helpers.passwords
      .checkPassword(password, user.password)
      .intercept('incorrect', () => ({
        badCombo: { problems: [{ login: 'Wrong email/password.' }] }
      }))

    if (user.twoFactorEnabled) {
      this.req.session.partialLogin = { userId: user.id }
      throw { twoFactorRequired: '/verify-2fa' }
    }

    this.req.session.userId = user.id
    var returnUrl =
      (await sails.helpers.returnUrl.get(this.req)) || '/dashboard'
    return returnUrl
  }
}
```

## Exit Response Types Reference

| Response Type       | Status              | Use Case                | Action Returns        |
| ------------------- | ------------------- | ----------------------- | --------------------- |
| `'inertia'`         | 200                 | Render a page           | `{ page, props }`     |
| `'redirect'`        | 302/303             | Redirect after mutation | URL string            |
| `'inertiaRedirect'` | 409                 | Force full page reload  | URL string            |
| `'badRequest'`      | 303 (redirect back) | Validation error        | `{ problems: [...] }` |
| `'serverError'`     | 500                 | Server error            | Error object          |
| `'notFound'`        | 404                 | Resource not found      | (any)                 |

## Naming Conventions

Actions follow a naming convention based on their purpose:

- **View actions** (GET): `view-home.js`, `view-login.js`, `view-profile.js`
- **Mutation actions** (POST/PATCH/DELETE): `signup.js`, `login.js`, `update-profile.js`, `delete-profile.js`
- **API actions**: `create-team.js`, `update-team.js`, `remove-member.js`

## Accessing Request Context in Actions

Inside an action2 `fn`:

```js
fn: async function (inputs) {
  // Access request/response
  this.req    // Request object
  this.res    // Response object

  // Session
  this.req.session.userId

  // Current user (if set by a hook)
  this.req.me

  // Inertia methods
  sails.inertia.share('key', value)
  sails.inertia.flash('success', 'Done!')
  sails.inertia.refreshOnce('loggedInUser')

  // Destructured inputs
  const { email, password } = inputs
}
```
