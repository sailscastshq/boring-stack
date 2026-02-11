---
name: request-lifecycle
description: Sails.js request lifecycle - how HTTP requests flow through hooks, middleware, policies, actions, and responses
metadata:
  tags: request, lifecycle, middleware, pipeline, flow, hooks, policies, actions
---

# Request Lifecycle

Understanding how a request flows through Sails is critical for debugging and building features correctly.

## Full Request Flow

```
HTTP Request arrives
    │
    ▼
1. Express receives req/res
    │
    ▼
2. HTTP middleware pipeline (config/http.js)
    │  ├─ bodyParser (parses JSON/form bodies)
    │  ├─ compress (gzip compression)
    │  ├─ cookieParser
    │  ├─ session (express-session)
    │  ├─ favicon
    │  └─ custom middleware (if configured)
    │
    ▼
3. Sails Router matches route (config/routes.js)
    │  └─ Extracts dynamic params (:id, :token)
    │
    ▼
4. Hook "before" routes (all hooks, in order)
    │  ├─ Request hook: adds req._sails, req.param(), etc.
    │  ├─ CSRF hook: validates CSRF token on POST/PUT/PATCH/DELETE
    │  ├─ CORS hook: handles preflight and CORS headers
    │  └─ Custom hook: shares Inertia data (loggedInUser, teams, etc.)
    │
    ▼
5. Policy chain (config/policies.js)
    │  ├─ is-authenticated → proceed() or redirect('/login')
    │  ├─ has-clearance → proceed() or 403
    │  └─ (all must pass to reach the action)
    │
    ▼
6. Action execution (api/controllers/)
    │  ├─ Input validation (from inputs: {})
    │  │   └─ Invalid inputs → automatic badRequest
    │  ├─ fn() runs with validated inputs
    │  │   ├─ this.req / this.res available
    │  │   ├─ Calls helpers, models, services
    │  │   └─ Returns data or throws exit
    │  └─ Exit handler (responseType)
    │
    ▼
7. Response sent
    │  ├─ 'inertia' → Render Inertia page
    │  ├─ 'redirect' → HTTP 302 redirect
    │  ├─ 'inertiaRedirect' → HTTP 409 with location
    │  ├─ 'badRequest' → Store errors in session, redirect back
    │  └─ (no responseType) → JSON response
    │
    ▼
8. Hook "after" routes (cleanup)
```

## Route Matching

When a request comes in, Sails matches it against routes in this order:

1. **Hook "before" routes** -- Middleware added by hooks (CSRF, CORS, custom)
2. **Explicit routes** -- Routes defined in `config/routes.js`
3. **Blueprint routes** -- Auto-generated REST routes (disabled in Boring Stack)
4. **Hook "after" routes** -- Fallback middleware
5. **Static assets** -- Files in `assets/` or `.tmp/public/`
6. **404 handler** -- If nothing matches

Routes are sorted by specificity:

```
1. /settings/profile              (most specific - static path)
2. /team/:id/settings             (has one dynamic param)
3. /team/:id/:section             (has two dynamic params)
4. /docs/*                        (wildcard - least specific)
```

## Policy Chain Execution

Policies run as a middleware chain. Each policy either calls `proceed()` to continue or sends a response to stop:

```js
// Policy chain for 'team/view-settings': ['is-authenticated', 'has-clearance']

// Step 1: is-authenticated runs
module.exports = async function (req, res, proceed) {
  if (req.session.userId) {
    return proceed() // ✓ Continue to next policy
  }
  return res.redirect('/login') // ✗ Stop chain, send response
}

// Step 2: has-clearance runs (only if step 1 called proceed())
module.exports = function (req, res, next) {
  return sails.hooks.clearance.check(req, res, next)
}

// Step 3: Action runs (only if all policies called proceed())
```

**Important**: If ANY policy in the chain responds instead of calling `proceed()`, the action never runs.

## Action Execution Details

When the action runs, the `fn` function receives validated inputs:

```js
module.exports = {
  inputs: {
    email: { type: 'string', required: true, isEmail: true },
    password: { type: 'string', required: true, minLength: 8 }
  },
  exits: {
    success: { responseType: 'redirect' },
    badSignup: { responseType: 'badRequest' }
  },
  fn: async function ({ email, password }) {
    // 1. Inputs are already validated and coerced
    // 2. `this.req` and `this.res` are available
    // 3. Return value goes to the 'success' exit
    // 4. throw { exitName: data } goes to that named exit

    return '/dashboard' // Goes to 'success' exit → redirect
  }
}
```

### Input Resolution

Sails resolves `inputs` from multiple sources (in priority order):

1. **URL path parameters** -- `/team/:id` → `inputs.id`
2. **Query string** -- `?page=2` → `inputs.page`
3. **Request body** -- POST JSON/form data → `inputs.*`
4. **File uploads** -- Multipart form fields listed in `files: []`

All sources are merged. If the same key appears in multiple sources, path params take priority over query, which takes priority over body.

### Exit Resolution

When `fn` completes:

| What happens in fn         | Which exit triggers | What gets sent                     |
| -------------------------- | ------------------- | ---------------------------------- |
| `return value`             | `success`           | `value` passed to response handler |
| `throw 'exitName'`         | `exitName`          | `undefined` passed to handler      |
| `throw { exitName: data }` | `exitName`          | `data` passed to handler           |
| Unhandled error            | `error` (500)       | Error object                       |

## Hook "before" Routes in Detail

The custom hook in Boring Stack runs on every GET request to set up shared Inertia data:

```js
// api/hooks/custom/index.js
routes: {
  before: {
    'GET /*': {
      skipAssets: true,  // Don't run on /js/*, /css/*, etc.
      fn: async function (req, res, next) {
        // This runs BEFORE policies and actions
        if (req.session.userId) {
          sails.inertia.share('loggedInUser',
            sails.inertia.once(async () => {
              return await User.findOne({ id: req.session.userId })
            })
          )
        }
        return next()  // MUST call next() to continue the chain
      }
    }
  }
}
```

**Critical**: Hook route handlers MUST call `next()` (or send a response). Forgetting `next()` causes the request to hang forever.

## CSRF Validation in the Lifecycle

For non-GET requests (POST, PUT, PATCH, DELETE), CSRF validation happens in step 4:

1. Client sends `X-CSRF-Token` header (Inertia does this automatically)
2. CSRF hook compares token against the session's CSRF secret
3. If invalid → 403 Forbidden (request never reaches policies or action)
4. If valid → continues to policies

Routes can opt out: `'POST /webhooks/stripe': { action: 'webhooks/stripe', csrf: false }`

## Session Availability

The session (`req.session`) is available throughout the entire lifecycle:

- **Middleware** -- Available after the session middleware runs
- **Hook routes** -- Available (this is where shared data reads session)
- **Policies** -- Available (this is where auth checks session)
- **Actions** -- Available via `this.req.session`
- **Helpers** -- Available if `req` is passed explicitly

## Common Debugging Tips

1. **Request hangs**: A policy or hook handler forgot to call `proceed()` or `next()`
2. **Action never runs**: A policy is blocking -- check `config/policies.js`
3. **403 Forbidden**: CSRF token missing or invalid
4. **Inputs undefined**: Check input names match the form field names
5. **Wrong action called**: Check route specificity -- more specific routes should come first
6. **Shared data stale**: `once()` caches aggressively -- call `refreshOnce()` after mutations
