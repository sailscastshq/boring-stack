---
name: rendering-pages
description: Server-side Inertia page rendering, the page object, sails.inertia.render(), and the inertia response type
metadata:
  tags: render, pages, page-object, response, inertia, server-side
---

# Rendering Pages

## The Page Object

Every Inertia response is a "page object" -- a JSON structure that tells the client which component to render and what data to pass it:

```js
{
  component: 'auth/login',       // Maps to assets/js/pages/auth/login.jsx
  url: '/login',                 // Current URL
  version: '1.0',               // Asset version (for cache busting)
  props: {                      // Data passed to the component
    passkeyChallenge: null,
    flash: {},
    errors: {}
  },
  deferredProps: {},             // Props loaded after initial render
  mergeProps: [],                // Props that merge instead of replace
  scrollRegions: [],             // Scroll position metadata
  encryptHistory: false,         // Whether to encrypt history state
  clearHistory: false            // Whether to clear history
}
```

## Using `responseType: 'inertia'`

The most common pattern for GET routes. The action returns an object with `page` (component name) and optionally `props`:

### Simple Page (No Props)

```js
// api/controllers/home/view-home.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    return { page: 'index' }
  }
}
```

### Page with Props

```js
// api/controllers/auth/view-login.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    const passkeyChallenge = this.req.session.passkeyChallenge || null
    if (passkeyChallenge) delete this.req.session.passkeyChallenge
    return {
      page: 'auth/login',
      props: { passkeyChallenge }
    }
  }
}
```

### Page with Data Fetching

```js
// api/controllers/setting/view-team.js
module.exports = {
  inputs: {
    teamId: { type: 'number', required: true }
  },
  exits: {
    success: { responseType: 'inertia' },
    notFound: { responseType: 'notFound' }
  },
  fn: async function ({ teamId }) {
    var team = await Team.findOne({ id: teamId })
    if (!team) throw 'notFound'

    var memberships = await Membership.find({ team: team.id }).populate(
      'member'
    )
    var pendingInvites = await TeamInvite.find({
      team: team.id,
      status: 'pending'
    })

    return {
      page: 'settings/team',
      props: {
        team,
        memberships,
        pendingInvites
      }
    }
  }
}
```

## How Rendering Works Internally

When `sails.inertia.render(req, res, data)` is called:

1. **Resolves shared props** -- Merges global shared props (from `sails.inertia.share()`) with the action's page-specific props
2. **Handles partial reloads** -- If the request has `X-Inertia-Partial-Data` or `X-Inertia-Partial-Except` headers, only the requested props are resolved
3. **Resolves deferred props** -- Identifies `DeferProp` instances and separates them from immediate props
4. **Resolves merge/once props** -- Processes `MergeProp`, `OnceProp`, and `AlwaysProp` instances
5. **Builds the page object** -- Combines component name, URL, version, and resolved props
6. **Returns the response**:
   - **First visit** (no `X-Inertia` header): Renders `views/app.ejs` with the page object in `data-page`
   - **Subsequent visits** (has `X-Inertia` header): Returns the page object as JSON with `X-Inertia: true` header

## The `page` Property

The `page` string maps directly to a file path under `assets/js/pages/`:

| `page` value                 | File path                                      |
| ---------------------------- | ---------------------------------------------- |
| `'index'`                    | `assets/js/pages/index.jsx`                    |
| `'auth/login'`               | `assets/js/pages/auth/login.jsx`               |
| `'settings/profile'`         | `assets/js/pages/settings/profile.jsx`         |
| `'dashboard/view-dashboard'` | `assets/js/pages/dashboard/view-dashboard.jsx` |

## Overriding the Root View

By default, Inertia renders using `views/app.ejs`. You can override this per-request:

```js
// Use a different root view for this request
sails.inertia.setRootView('auth') // Uses views/auth.ejs instead
```

This is useful for having different HTML shells (e.g., a minimal layout for auth pages).

## Rendering on Non-GET Routes

The `inertia` response type is almost always used with GET routes. For POST/PATCH/PUT/DELETE routes, you typically redirect after processing (see [redirects-and-responses.md](redirects-and-responses.md)).

However, there are edge cases where a non-GET action renders a page:

```js
// api/controllers/setting/delete-profile.js
module.exports = {
  exits: {
    success: { responseType: 'inertiaRedirect' },
    hasTeamMembers: { responseType: 'inertia' } // Show modal instead of redirecting
  },
  fn: async function () {
    // If user has team members, show a page instead of deleting
    if (hasMembers) {
      throw {
        hasTeamMembers: {
          page: 'settings/profile',
          props: { showTransferModal: true }
        }
      }
    }
    // ... proceed with deletion
  }
}
```
