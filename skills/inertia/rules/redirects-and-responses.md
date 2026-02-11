---
name: redirects-and-responses
description: Redirect patterns in Inertia - redirect vs inertiaRedirect vs location(), when to use each
metadata:
  tags: redirects, inertiaRedirect, redirect, location, 303, 409, responses
---

# Redirects and Responses

## The Critical Distinction: `redirect` vs `inertiaRedirect`

This is one of the most important concepts in The Boring JavaScript Stack. Choosing the wrong redirect type leads to broken navigation or unnecessary full page reloads.

### `responseType: 'redirect'` -- Standard Redirect

Sends a **302/303 HTTP redirect**. Inertia intercepts it and follows with a GET request using XHR. The page transition is smooth (SPA-style) with no full page reload.

**Use when:**

- After a successful form submission (POST/PATCH/DELETE)
- Redirecting to a different page after login/signup
- The target page will get fresh data from its own GET action
- No shared cached data needs to be force-refreshed

```js
// api/controllers/auth/signup.js
exits: {
  success: { responseType: 'redirect' }
},
fn: async function ({ fullName, email, password }) {
  // ... create user ...
  this.req.session.userId = user.id
  return '/dashboard'  // Smooth SPA transition
}
```

### `responseType: 'inertiaRedirect'` -- Full Page Visit

Sends a **409 status** with an `X-Inertia-Location` header. The Inertia client does a **full window.location visit** (like clicking a link for the first time). This reloads the entire page.

**Use when:**

- Shared data cached with `sails.inertia.once()` has changed (e.g., profile update, team switch)
- You've called `sails.inertia.refreshOnce()` and need the page to pick up the fresh data
- You're redirecting to an external URL
- You need a clean state reset

```js
// api/controllers/setting/update-profile.js
exits: {
  success: { responseType: 'inertiaRedirect' }
},
fn: async function ({ fullName, email }) {
  await User.updateOne({ id: this.req.me.id }).set({ fullName, email })

  // Invalidate cached shared data
  sails.inertia.refreshOnce('loggedInUser')
  sails.inertia.flash('success', 'Profile updated!')

  return '/settings/profile'  // Full page reload
}
```

## How Each Redirect Works Under the Hood

### Standard Redirect Flow

```
Client: POST /login (XHR with X-Inertia header)
Server: 303 See Other → Location: /dashboard
Client: GET /dashboard (XHR with X-Inertia header)
Server: 200 OK → { component: 'dashboard', props: {...} }
Client: Swaps component (no page reload)
```

### Inertia Redirect (Location Visit) Flow

```
Client: PATCH /settings/profile (XHR with X-Inertia header)
Server: 409 Conflict → X-Inertia-Location: /settings/profile
Client: window.location = '/settings/profile' (full page reload)
Server: 200 OK → Full HTML document with fresh data-page
Client: Full app bootstrap with new data
```

## When to Use Which -- Decision Guide

| Scenario                     | Use               | Why                                                |
| ---------------------------- | ----------------- | -------------------------------------------------- |
| Login success → dashboard    | `redirect`        | Dashboard has its own GET action that fetches data |
| Signup → check email         | `redirect`        | Simple page transition                             |
| Update profile → same page   | `inertiaRedirect` | Need to refresh `loggedInUser` shared data         |
| Switch active team           | `inertiaRedirect` | Need to refresh `currentTeam` cached prop          |
| Logout → login page          | `redirect`        | Shared data flushed, login page doesn't need it    |
| Delete account → home        | `redirect`        | Session destroyed, clean redirect                  |
| OAuth callback → dashboard   | `inertiaRedirect` | External redirect, need full page load             |
| Create team → team page      | `redirect`        | New team page fetches its own data                 |
| Update team name → same page | `inertiaRedirect` | Team data is cached in shared props                |

## Flash Messages with Redirects

Flash messages persist across **one** redirect. Set them before returning the redirect URL:

```js
// With redirect
sails.inertia.flash('success', 'Team created!')
return '/teams'

// With inertiaRedirect
sails.inertia.flash('success', 'Profile updated!')
return '/settings/profile'
```

On the frontend, flash messages are available via `usePage().props.flash`.

## Redirecting After Validation Errors

When a `badRequest` exit is thrown, the `handleBadRequest` response automatically:

1. Stores validation errors in `req.session.errors`
2. Redirects back with **303** to the `Referrer` URL
3. The next page load includes errors in props via the Inertia middleware

You don't need to handle this manually -- just throw the exit:

```js
throw {
  invalid: {
    problems: [{ email: 'Invalid email address.' }]
  }
}
```

## Programmatic Location Visit

If you need to force a location visit outside of an exit:

```js
// Direct usage in any middleware or action
sails.inertia.location(req, res, '/external-page')
```

## Redirect with Query Parameters

```js
// Standard redirect with query params
return `/check-email?email=${encodeURIComponent(email)}&type=password-reset`

// Inertia redirect with query params
return `/verify?token=${token}`
```

## The 303 Rule

For POST/PUT/PATCH/DELETE requests, Inertia expects a **303 See Other** redirect (not 302). The `inertia-sails` middleware handles this automatically -- when a POST/PUT/PATCH/DELETE results in a 302, it's converted to 303 to ensure the browser follows with a GET request.
