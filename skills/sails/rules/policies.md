---
name: policies
description: Sails.js policies - request guards, authentication, authorization, policy configuration
metadata:
  tags: policies, authentication, authorization, guards, middleware, isLoggedIn
---

# Policies

Policies are middleware functions that run **before** an action. They're used for authentication, authorization, and request validation.

## Policy Files

Policies live in `api/policies/`:

```js
// api/policies/is-logged-in.js
module.exports = async function (req, res, proceed) {
  if (req.session.userId) {
    return proceed()
  }
  return res.redirect('/login')
}
```

A policy receives `(req, res, proceed)`:

- Call `proceed()` to continue to the action
- Call `res.redirect()`, `res.forbidden()`, etc. to stop execution

## Policy Configuration

Configure which policies apply to which actions in `config/policies.js`:

```js
// config/policies.js
module.exports.policies = {
  // Default: all actions require login
  '*': 'is-logged-in',

  // Public pages (no auth required)
  'auth/*': true, // All auth actions are public
  'view-homepage': true, // Homepage is public
  'not-found': true, // 404 page is public

  // Webhooks (no auth, no CSRF)
  'webhooks/*': true,

  // Admin-only actions
  'admin/*': ['is-logged-in', 'is-admin'],

  // Specific action overrides
  'settings/delete-account': ['is-logged-in', 'is-account-owner']
}
```

### Policy Rules

| Value                      | Meaning                                        |
| -------------------------- | ---------------------------------------------- |
| `true`                     | Allow all requests (public access)             |
| `false`                    | Block all requests                             |
| `'policy-name'`            | Run the named policy                           |
| `['policy-a', 'policy-b']` | Run multiple policies in order (all must pass) |

### Policies Do NOT Cascade

Each action mapping is independent. If you set `'*': 'is-logged-in'`, then override `'admin/*': 'is-admin'`, admin actions only run `is-admin` -- **not** both `is-logged-in` and `is-admin`. To require both:

```js
'admin/*': ['is-logged-in', 'is-admin']
```

## Common Policy Patterns

### Authentication (is-logged-in)

```js
// api/policies/is-logged-in.js
module.exports = async function (req, res, proceed) {
  if (req.session.userId) {
    return proceed()
  }

  // For Inertia requests, redirect to login
  if (req.get('X-Inertia')) {
    return res.redirect('/login')
  }

  // For API/non-Inertia requests
  return res.forbidden()
}
```

### Authorization (is-admin)

```js
// api/policies/is-admin.js
module.exports = async function (req, res, proceed) {
  const user = await User.findOne({ id: req.session.userId })
  if (user && user.role === 'admin') {
    return proceed()
  }
  return res.forbidden()
}
```

### Attaching User to Request

A common pattern is to use the custom hook (not a policy) to attach the logged-in user to the request so all actions can access it:

```js
// api/hooks/custom/index.js (in routes.before)
'GET /*': {
  skipAssets: true,
  fn: async function (req, res, next) {
    if (req.session.userId) {
      req.me = await User.findOne({ id: req.session.userId })
    }
    return next()
  }
}
```

Then in policies:

```js
// api/policies/is-logged-in.js
module.exports = async function (req, res, proceed) {
  if (req.me) {
    return proceed()
  }
  return res.redirect('/login')
}
```

### API Key Authentication

For machine-to-machine endpoints (cloud customers, microservices):

```js
// api/policies/is-cloud-customer.js
module.exports = async function (req, res, proceed) {
  if (req.get('API-KEY') === sails.config.custom.sharedApiSecret) {
    return proceed()
  }
  return res.unauthorized()
}
```

### Feature-Flag Gated Policy

Control access with a config-level feature flag that can be toggled without redeploying:

```js
// api/policies/has-feature-access.js
module.exports = async function (req, res, proceed) {
  // Check global feature flag first
  if (sails.config.custom.enablePublicFeature) {
    return proceed()
  }

  // Fall back to per-user flag
  if (!req.me) {
    return req.wantsJSON ? res.sendStatus(401) : res.redirect('/login')
  }

  if (!req.me.isSuperAdmin && !req.me.canUseFeature) {
    return res.forbidden()
  }

  return proceed()
}
```

### Content Negotiation in Policies

Use `req.wantsJSON` to handle both browser and API requests:

```js
// api/policies/is-super-admin.js
module.exports = async function (req, res, proceed) {
  if (!req.me) {
    if (req.wantsJSON) {
      return res.sendStatus(401)
    } else {
      return res.redirect('/login?admin')
    }
  }

  if (!req.me.isSuperAdmin) {
    return res.forbidden()
  }

  return proceed()
}
```

### Team Membership Check

```js
// api/policies/is-team-member.js
module.exports = async function (req, res, proceed) {
  const teamId = req.param('id') || req.param('teamId')
  if (!teamId) return res.badRequest()

  const membership = await TeamMember.findOne({
    user: req.session.userId,
    team: teamId
  })

  if (membership) {
    req.teamMembership = membership
    return proceed()
  }

  return res.forbidden()
}
```

## Boring Stack Default Policy Configuration

```js
// config/policies.js
module.exports.policies = {
  '*': 'is-logged-in',

  // Auth pages
  'auth/view-login': true,
  'auth/view-signup': true,
  'auth/login': true,
  'auth/signup': true,
  'auth/view-forgot-password': true,
  'auth/send-password-reset': true,
  'auth/view-reset-password': true,
  'auth/reset-password': true,

  // Public pages
  'view-homepage': true,
  'not-found': true,
  'legal/*': true,

  // Webhooks
  'webhooks/*': true
}
```
