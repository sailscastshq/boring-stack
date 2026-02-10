---
name: shared-data-and-flash
description: Sharing data globally with share(), once(), refreshOnce(), flushShared(), and flash messages
metadata:
  tags: share, once, refreshOnce, flushShared, flash, shared-data, global-props
---

# Shared Data and Flash Messages

## Shared Data Overview

Shared data are props available on **every page** without needing to pass them in each action. Common use cases: the logged-in user, active team, flash messages.

## `sails.inertia.share(key, value)`

Share a prop globally for the current request:

```js
// In a hook, policy, or action
sails.inertia.share('appName', 'My App')
sails.inertia.share('loggedInUser', user)
```

The shared value can be:

- A plain value (string, number, object, array)
- A function (called lazily when rendering)
- An async function (awaited when rendering)
- A special prop instance (`OnceProp`, `AlwaysProp`, `DeferProp`, etc.)

## The Custom Hook Pattern

The standard place to share data is in `api/hooks/custom/index.js`. This runs before every GET request:

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
              // Share logged-in user data (cached with once())
              sails.inertia.share(
                'loggedInUser',
                sails.inertia.once(async () => {
                  const user = await User.findOne({ id: req.session.userId })
                  user.currentAvatarUrl = await sails.helpers.user.getAvatarUrl(
                    user
                  )
                  return user
                })
              )

              // Share teams data
              sails.inertia.share(
                'teams',
                sails.inertia.once(async () => {
                  return await Membership.find({
                    member: req.session.userId
                  }).populate('team')
                })
              )
            } else {
              // Flush shared data for logged-out users
              sails.inertia.flushShared('loggedInUser')
              sails.inertia.flushShared('teams')
            }

            return next()
          }
        }
      }
    }
  }
}
```

## `sails.inertia.once(callback)` -- Cached Props

`once()` wraps a callback so it only executes once per session. The result is cached and reused on subsequent page visits until explicitly refreshed.

```js
// This expensive query only runs once, then the result is cached
sails.inertia.share(
  'loggedInUser',
  sails.inertia.once(async () => {
    return await User.findOne({ id: req.session.userId })
  })
)
```

**Why use `once()`?**

- Avoids running expensive queries on every single page load
- The logged-in user data doesn't change between page visits (unless explicitly updated)
- Dramatically improves performance for frequently-shared data

## `sails.inertia.refreshOnce(key)` -- Invalidate Cache

After mutating data that's cached with `once()`, call `refreshOnce()` to force it to be re-evaluated on the next page load:

```js
// api/controllers/setting/update-profile.js
await User.updateOne({ id: this.req.me.id }).set({ fullName, email })

// Invalidate the cached loggedInUser prop
sails.inertia.refreshOnce('loggedInUser')

// Can also refresh multiple props
sails.inertia.refreshOnce('teams')
sails.inertia.refreshOnce('currentTeam')
```

**Important:** After calling `refreshOnce()`, you typically use `responseType: 'inertiaRedirect'` to ensure the client does a full page reload and picks up the fresh data.

## `sails.inertia.flushShared(key)` -- Remove Shared Props

Completely remove a shared prop. Used when the data is no longer relevant (e.g., on logout):

```js
// api/controllers/user/logout.js
module.exports = {
  exits: {
    success: { responseType: 'redirect' }
  },
  fn: async function () {
    // Remove all user-specific shared data
    sails.inertia.flushShared('loggedInUser')
    sails.inertia.flushShared('teams')
    sails.inertia.flushShared('currentTeam')

    // Destroy session
    delete this.req.session.userId

    return '/login'
  }
}
```

## Flash Messages

Flash messages are one-time props that persist across a single redirect. They're automatically cleared after being sent to the client.

### Setting Flash Messages (Server)

```js
// Single flash message
sails.inertia.flash('success', 'Profile updated successfully!')
sails.inertia.flash('error', 'Something went wrong.')
sails.inertia.flash('info', 'Please check your email to confirm.')

// Also works with Sails' built-in flash
this.req.flash('success', 'Team created!')
```

### Accessing Flash Messages (Client)

Flash messages are available in `usePage().props.flash`:

```jsx
// React
import { usePage } from '@inertiajs/react'

const { flash } = usePage().props

// flash.success -- "Profile updated successfully!"
// flash.error -- "Something went wrong."
```

### The useFlashToast Pattern

The Boring Stack templates include a `useFlashToast` hook that converts flash messages into toast notifications:

```jsx
// React -- assets/js/hooks/useFlashToast.js
import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

export function useFlashToast(toastRef) {
  const { flash } = usePage().props

  useEffect(() => {
    if (!toastRef.current) return

    for (const [severity, message] of Object.entries(flash || {})) {
      if (!message) continue
      toastRef.current.show({
        severity: severity === 'success' ? 'success' : severity === 'error' ? 'error' : 'info',
        summary: severity.charAt(0).toUpperCase() + severity.slice(1),
        detail: typeof message === 'string' ? message : message.detail,
        life: 4000
      })
    }
  }, [flash])
}

// Usage in a layout:
const toast = useRef(null)
useFlashToast(toast)
// ...
<Toast ref={toast} />
```

```vue
<!-- Vue -- assets/js/composables/useFlashToast.js -->
<script setup>
import { watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { useToast } from 'primevue/usetoast'

const page = usePage()
const toast = useToast()

watch(
  () => page.props.flash,
  (flash) => {
    for (const [severity, message] of Object.entries(flash || {})) {
      if (!message) continue
      toast.add({
        severity,
        summary: severity.charAt(0).toUpperCase() + severity.slice(1),
        detail: typeof message === 'string' ? message : message.detail,
        life: 4000
      })
    }
  },
  { deep: true, immediate: true }
)
</script>
```

## Validation Errors as Shared Data

Validation errors from `badRequest` are automatically shared as `errors` via the Inertia middleware. After a failed form submission:

1. `handleBadRequest` stores errors in `req.session.errors`
2. On the next page load, the middleware reads `req.session.errors` and shares them
3. Errors are cleared from the session after being sent

On the frontend, errors are accessed via `form.errors` (from `useForm`) or `usePage().props.errors`.
