---
name: advanced-features
description: Advanced Inertia features - history encryption, partial reloads, asset versioning, CSRF, SSR, polling
metadata:
  tags: history, encryption, partial-reload, versioning, csrf, ssr, polling, prefetching
---

# Advanced Features

## Partial Reloads

Partial reloads let you request **only specific props** from the server without re-fetching everything. This is a major performance optimization.

### Client-Side: Request Specific Props

```jsx
import { router } from '@inertiajs/react'

// Only reload the 'notifications' prop
router.reload({ only: ['notifications'] })

// Reload everything except 'heavyData'
router.reload({ except: ['heavyData'] })

// Using useForm with partial reload
form.post('/messages', {
  only: ['messages'], // Only update messages prop
  preserveScroll: true,
  preserveState: true
})
```

### How It Works

When a partial reload is requested:

1. Client sends `X-Inertia-Partial-Data: notifications` header
2. Server only resolves the `notifications` prop (skips everything else)
3. Client merges the partial response with existing page data
4. `AlwaysProp` instances are always resolved regardless of partial reload filters

### Server-Side: Prop Types and Partial Reloads

| Prop Type    | Included in Partial Reload? |
| ------------ | --------------------------- |
| Standard     | Only if in `only` list      |
| `always()`   | Always included             |
| `once()`     | Only if in `only` list      |
| `optional()` | Only if in `only` list      |
| `defer()`    | Loaded in separate request  |

## History Encryption

Encrypt sensitive page data stored in the browser's history state. This prevents users from seeing sensitive data by pressing the back button after logging out.

### Server-Side

```js
// Enable history encryption for this page
sails.inertia.encryptHistory()

return {
  page: 'settings/billing',
  props: { sensitiveData: billingInfo }
}

// Clear all encrypted history (e.g., on logout)
sails.inertia.clearHistory()
```

### Client-Side

History encryption is configured in `createInertiaApp`:

```js
createInertiaApp({
  // ... other options
  encryptHistory: true // Enable globally
})
```

## Asset Versioning

Asset versioning ensures clients always have the latest JavaScript/CSS. When the version changes, Inertia forces a full page reload.

The `inertia-sails` hook automatically handles versioning. The version is included in every Inertia response and compared with the client's version via the `X-Inertia-Version` header.

If versions don't match, the server responds with **409 Conflict** and the client does a full page reload.

## CSRF Protection

Inertia.js handles CSRF tokens automatically. In The Boring JavaScript Stack:

1. Sails' built-in CSRF protection generates a token
2. The token is stored in a cookie (`_csrf`)
3. Inertia's client-side library reads the cookie and includes it in requests as `X-CSRF-Token` header

No manual CSRF handling is needed in your actions or forms.

For actions that need the CSRF token as a prop (rare):

```js
props: {
  csrf: sails.inertia.always(() => this.req.csrfToken())
}
```

## Server-Side Rendering (SSR)

SSR pre-renders the initial page on the server for better SEO and faster first paint.

### Client Setup

```js
// assets/js/ssr.js (SSR entry point)
import { createInertiaApp } from '@inertiajs/react'
import ReactDOMServer from 'react-dom/server'

export default function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => require(`./pages/${name}`),
    setup: ({ App, props }) => <App {...props} />
  })
}
```

### Server Configuration

SSR configuration is handled via `sails.config.inertia`:

```js
// config/inertia.js
module.exports.inertia = {
  ssr: {
    enabled: true,
    bundle: 'assets/js/ssr.js'
  }
}
```

## Polling

Inertia v2 supports automatic polling to keep data fresh:

```jsx
import { usePoll } from '@inertiajs/react'

// Poll every 5 seconds
usePoll(5000)

// Poll with options
usePoll(5000, {
  only: ['notifications'], // Only reload specific props
  keepAlive: true // Continue polling when tab is in background
})
```

## Prefetching

Preload page data before the user navigates:

```jsx
import { Link } from '@inertiajs/react'

// Prefetch on hover
<Link href="/dashboard" prefetch>Dashboard</Link>

// Prefetch strategies
<Link href="/dashboard" prefetch="hover">On Hover</Link>
<Link href="/dashboard" prefetch="mount">On Mount</Link>
<Link href="/dashboard" prefetch="click">On Click</Link>
```

## Scroll Management

Control scroll behavior during navigation:

```jsx
// Preserve scroll position
;<Link href="/users?page=2" preserveScroll>
  Page 2
</Link>

// In programmatic navigation
router.visit('/users', { preserveScroll: true })

// In form submission
form.post('/messages', { preserveScroll: true })
```

### Scroll Regions

Track scroll positions of specific elements:

```jsx
<div scroll-region>
  {/* Scroll position of this div is tracked across navigation */}
  <UserList users={users} />
</div>
```

## Events

Listen to Inertia lifecycle events:

```jsx
import { router } from '@inertiajs/react'

// Before a visit starts
router.on('before', (event) => {
  // Return false to cancel the visit
  if (!confirm('Leave this page?')) return false
})

// When a visit starts
router.on('start', (event) => {
  console.log('Navigating to:', event.detail.visit.url)
})

// When a visit succeeds
router.on('success', (event) => {
  console.log('Page loaded:', event.detail.page.component)
})

// When a visit fails (validation errors)
router.on('error', (event) => {
  console.log('Validation errors:', event.detail.errors)
})

// When an invalid response is received
router.on('invalid', (event) => {
  // Handle non-Inertia responses
  event.preventDefault()
})

// When a visit finishes (success or error)
router.on('finish', (event) => {
  // Clean up loading states
})

// When navigation is cancelled
router.on('cancel', () => {})
```

## Root View Override

Use different HTML templates for different sections of your app:

```js
// In a hook or action:
sails.inertia.setRootView('auth') // Uses views/auth.ejs

// Different root views for different sections:
// views/app.ejs -- Main app layout
// views/auth.ejs -- Minimal auth layout
// views/admin.ejs -- Admin-specific layout
```

Each root view must include the `data-page` container and Shipwright scripts:

```html
<!-- views/auth.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <%- shipwright.styles() %>
  </head>
  <body class="bg-gray-50">
    <div id="app" data-page="<%= JSON.stringify(page) %>"></div>
    <%- shipwright.scripts() %>
  </body>
</html>
```
