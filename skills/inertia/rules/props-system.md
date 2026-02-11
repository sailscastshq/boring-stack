---
name: props-system
description: The inertia-sails props system - AlwaysProp, DeferProp, MergeProp, OnceProp, OptionalProp, ScrollProp
metadata:
  tags: props, defer, once, always, optional, merge, scroll, partial-reload
---

# Props System

The `inertia-sails` package implements a rich props system that controls how data is loaded, cached, and updated on the client. These prop types match the Inertia.js v2 protocol.

## Standard Props

By default, props are plain values resolved on every page visit:

```js
return {
  page: 'dashboard',
  props: {
    user: await User.findOne({ id: userId }),
    stats: { invoiceCount: 42, totalRevenue: 15000 }
  }
}
```

## `sails.inertia.defer(callback, group?)` -- Deferred Props

Deferred props are **not included in the initial page response**. Instead, they're loaded in a separate request after the page renders. Use for expensive queries that shouldn't block the initial page load.

```js
return {
  page: 'dashboard',
  props: {
    // These load immediately
    user: await User.findOne({ id: userId }),

    // This loads after the page renders
    analytics: sails.inertia.defer(async () => {
      return await Analytics.getExpensiveReport(userId)
    }),

    // Group deferred props to load them in one request
    recentActivity: sails.inertia.defer(
      async () => Activity.find({ user: userId }).limit(20),
      'sidebar' // Group name
    ),
    notifications: sails.inertia.defer(
      async () => Notification.find({ user: userId, read: false }),
      'sidebar' // Same group -- loaded together
    )
  }
}
```

On the client, deferred props start as `undefined` and populate after the deferred request completes:

```jsx
export default function Dashboard({ user, analytics, recentActivity }) {
  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>

      {/* Shows a loader until analytics loads */}
      {analytics ? <AnalyticsChart data={analytics} /> : <Skeleton />}
    </div>
  )
}
```

## `sails.inertia.once(callback)` -- Once Props (Cached)

Once props are evaluated once and cached. They're NOT re-evaluated on subsequent visits until explicitly refreshed with `refreshOnce()`. Used primarily with `share()` for expensive global data.

```js
// In the custom hook:
sails.inertia.share(
  'loggedInUser',
  sails.inertia.once(async () => {
    const user = await User.findOne({ id: req.session.userId })
    return user
  })
)
```

**Key behavior:**

- First visit: callback runs, result is cached
- Subsequent visits: cached result is reused (callback does NOT run)
- After `sails.inertia.refreshOnce('loggedInUser')`: callback runs again on next visit

## `sails.inertia.always(callback)` -- Always Props

Always props are evaluated on **every request**, including partial reloads. Standard props are excluded during partial reloads unless explicitly requested. Always props bypass this.

```js
return {
  page: 'dashboard',
  props: {
    // Only included if specifically requested in partial reload
    users: await User.find(),

    // Always included, even in partial reloads
    csrf: sails.inertia.always(() => this.req.csrfToken()),
    currentTime: sails.inertia.always(() => Date.now())
  }
}
```

## `sails.inertia.optional(callback)` -- Optional Props

Optional props are **only loaded when explicitly requested** via partial reloads. They're excluded from the initial page load entirely.

```js
return {
  page: 'users/index',
  props: {
    // Always loaded
    users: await User.find().limit(20),

    // Only loaded when the client requests it via partial reload
    categories: sails.inertia.optional(async () => {
      return await Category.find()
    })
  }
}
```

On the client, trigger a partial reload to fetch optional props:

```jsx
import { router } from '@inertiajs/react'

// Fetch only the 'categories' prop
router.reload({ only: ['categories'] })
```

## `sails.inertia.merge(callback)` -- Merge Props

Merge props **append to existing data** instead of replacing it. Used for infinite scroll / load more patterns.

```js
return {
  page: 'messages',
  props: {
    // On partial reload, new messages are merged with existing ones
    messages: sails.inertia.merge(async () => {
      return await Message.find()
        .sort('createdAt DESC')
        .limit(20)
        .skip(page * 20)
    })
  }
}
```

### Deep Merge

For nested objects, use `deepMerge()`:

```js
settings: sails.inertia.deepMerge(async () => {
  return await Settings.findOne({ user: userId })
})
```

### Chaining Merge with Defer

```js
// Deferred prop that merges with existing data
messages: sails.inertia
  .defer(async () => {
    return await Message.find().limit(20)
  })
  .merge() // Chain merge behavior
```

## `sails.inertia.scroll(callback, options)` -- Scroll Props

Scroll props provide pagination metadata for Inertia.js v2's `<InfiniteScroll>` component:

```js
return {
  page: 'invoices',
  props: {
    invoices: sails.inertia.scroll(
      async () => {
        return await Invoice.find({ creator: userId })
          .sort('createdAt DESC')
          .paginate(page, perPage)
      },
      {
        page: currentPage,
        perPage: 20,
        total: totalCount
      }
    )
  }
}
```

The scroll prop generates metadata:

```js
{
  scrollProps: {
    invoices: {
      pageName: 'page',
      currentPage: 1,
      previousPage: null,
      nextPage: 2,
      reset: false
    }
  }
}
```

## Props Resolution Order

When rendering a page, props are resolved in this order:

1. **Shared props** (from `sails.inertia.share()`) are merged with page props
2. **Partial reload filtering**: If `X-Inertia-Partial-Data` or `X-Inertia-Partial-Except` headers are present, props are filtered
3. **Once props**: Check cache, run callback only if not cached
4. **Always props**: Always resolved regardless of partial reload
5. **Optional props**: Only resolved if explicitly requested
6. **Deferred props**: Separated into `deferredProps` in the page object
7. **Merge props**: Flagged in `mergeProps` array
8. **Scroll props**: Metadata extracted into `scrollProps`
9. **All remaining props**: Resolved (functions are called, promises awaited)

## Props Type Reference

| Prop Type    | When Resolved        | Partial Reload Behavior      | Use Case                            |
| ------------ | -------------------- | ---------------------------- | ----------------------------------- |
| Standard     | Every visit          | Excluded unless in `only`    | Most data                           |
| `always()`   | Every visit          | Always included              | CSRF tokens, timestamps             |
| `once()`     | First visit only     | Excluded unless in `only`    | Expensive global data (user, teams) |
| `optional()` | Never by default     | Only when in `only`          | Rarely-needed data                  |
| `defer()`    | After initial render | Loaded in separate request   | Expensive secondary data            |
| `merge()`    | Every visit          | Merges with existing         | Infinite scroll / load more         |
| `scroll()`   | Every visit          | Includes pagination metadata | Paginated lists                     |
