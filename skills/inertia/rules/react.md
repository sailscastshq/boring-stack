---
name: react
description: React-specific Inertia APIs - useForm, usePage, Link, Head, Deferred, WhenVisible, usePoll, usePrefetch, useRemember, layouts
metadata:
  tags: react, useForm, usePage, Link, Head, Deferred, WhenVisible, usePoll, layouts, createInertiaApp
---

# React

All React-specific Inertia APIs are imported from `@inertiajs/react`.

## Imports

```jsx
import {
  createInertiaApp,
  router,
  Link,
  Head,
  useForm,
  usePage,
  usePoll,
  usePrefetch,
  useRemember,
  Deferred,
  WhenVisible
} from '@inertiajs/react'
```

## `createInertiaApp` -- App Bootstrap

```jsx
// assets/js/app.jsx
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })
    return pages[`./pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  title: (title) => (title ? `${title} | My App` : 'My App')
})
```

## `useForm` -- Form State Management

`useForm` returns an object with form data, methods, and reactive state.

### Basic Usage

```jsx
import { useForm } from '@inertiajs/react'

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    rememberMe: false
  })

  function submit(e) {
    e.preventDefault()
    post('/login')
  }

  return (
    <form onSubmit={submit}>
      <input
        type="email"
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
      />
      {errors.email && <p className="text-red-500">{errors.email}</p>}

      <input
        type="password"
        value={data.password}
        onChange={(e) => setData('password', e.target.value)}
      />
      {errors.password && <p className="text-red-500">{errors.password}</p>}

      <label>
        <input
          type="checkbox"
          checked={data.rememberMe}
          onChange={(e) => setData('rememberMe', e.target.checked)}
        />
        Remember me
      </label>

      <button type="submit" disabled={processing}>
        {processing ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### `setData` Variants

```jsx
// Set single field
setData('email', 'user@example.com')

// Set with callback (for derived values)
setData('email', (prev) => prev.toLowerCase())

// Set multiple fields
setData({ email: 'user@example.com', fullName: 'John Doe' })

// Set nested field via callback
setData((data) => ({ ...data, address: { ...data.address, city: 'NYC' } }))
```

### Form Methods

```jsx
const form = useForm({ name: '', email: '' })

form.get(url, options) // GET request
form.post(url, options) // POST request
form.put(url, options) // PUT request
form.patch(url, options) // PATCH request
form.delete(url, options) // DELETE request

form.reset() // Reset all fields to initial values
form.reset('password') // Reset specific field
form.clearErrors() // Clear all errors
form.clearErrors('email') // Clear specific field error
form.setError('email', 'Invalid email') // Set error manually
form.cancel() // Cancel in-flight request

// Transform data before submission
form
  .transform((data) => ({
    ...data,
    email: data.email.toLowerCase()
  }))
  .post('/signup')
```

### Form Properties

```jsx
form.data // Current form data object
form.errors // { fieldName: 'message' }
form.hasErrors // Boolean
form.processing // Boolean -- request in flight
form.progress // Upload progress { percentage, total, loaded }
form.wasSuccessful // Boolean -- last submission succeeded
form.recentlySuccessful // Boolean -- true for ~2 seconds after success
form.isDirty // Boolean -- data changed from initial values
```

### Submission Options

```jsx
form.post('/signup', {
  preserveScroll: true,
  preserveState: true,
  only: ['users'],
  except: ['meta'],
  headers: { 'X-Custom': 'value' },
  forceFormData: true, // Force multipart/form-data
  onBefore: (visit) => confirm('Submit?'),
  onStart: (visit) => {},
  onProgress: (progress) => console.log(`${progress.percentage}%`),
  onSuccess: (page) => form.reset('password'),
  onError: (errors) => console.error(errors),
  onFinish: () => {},
  onCancel: () => {}
})
```

### Remember Key (Persist Form State)

```jsx
// Form state survives back/forward navigation
const form = useForm('login-form', {
  email: '',
  password: ''
})
```

## `usePage` -- Access Page Data

```jsx
import { usePage } from '@inertiajs/react'

export default function Dashboard() {
  const { props, url } = usePage()
  const { loggedInUser, flash, errors } = props

  return (
    <div>
      <h1>Welcome, {loggedInUser.fullName}</h1>
      {flash?.success && <div className="text-green-600">{flash.success}</div>}
      {url === '/dashboard' && <span>You're on the dashboard</span>}
    </div>
  )
}
```

### Page Object Shape

```ts
{
  component: string           // Page component name
  props: {                    // All page props including shared data
    errors: Record<string, string>
    flash: { success?: string; error?: string }
    loggedInUser: User | null
    // ... page-specific props
  }
  url: string                 // Current URL
  version: string | null      // Asset version
}
```

## `Link` -- SPA Navigation

```jsx
import { Link, usePage } from '@inertiajs/react'

// Basic
<Link href="/dashboard">Dashboard</Link>

// With HTTP method
<Link href="/logout" method="delete" as="button">Logout</Link>

// Active link
const { url } = usePage()
<Link
  href="/features"
  className={url === '/features' ? 'bg-brand-100 text-brand' : 'text-gray-700'}
>
  Features
</Link>

// Preserve scroll/state
<Link href="/users?page=2" preserveScroll preserveState>Page 2</Link>

// Partial reload
<Link href="/dashboard" only={['notifications']}>Refresh</Link>

// Prefetch on hover
<Link href="/dashboard" prefetch>Dashboard</Link>
<Link href="/dashboard" prefetch="mount">Dashboard</Link>
<Link href="/dashboard" prefetch cacheFor={60000}>Dashboard</Link>

// With data
<Link href="/users" data={{ search: 'John', page: 2 }}>Search</Link>

// Replace history entry
<Link href="/login" replace>Login</Link>
```

### When to Use `<a>` Instead of `Link`

```jsx
// External URLs
<a href="https://example.com">External</a>

// OAuth redirects
<a href="/auth/google/redirect">Sign in with Google</a>

// File downloads
<a href="/files/report.pdf" download>Download Report</a>
```

### `data-loading` Attribute

While a visit triggered by a Link is in-flight, the element gets a `data-loading` attribute. Use for CSS loading states:

```css
a[data-loading] {
  opacity: 0.5;
}
```

## `Head` -- Document Head Management

```jsx
import { Head } from '@inertiajs/react'

// Title only (uses title callback from createInertiaApp)
<Head title="Dashboard" />

// Title + meta tags
<Head title="Dashboard">
  <meta name="description" content="Your dashboard overview" />
  <meta property="og:title" content="Dashboard" />
</Head>

// Deduplication with head-key
<Head>
  <meta head-key="description" name="description" content="Default" />
</Head>
// In a child component, this replaces the above:
<Head>
  <meta head-key="description" name="description" content="Specific page" />
</Head>
```

## `router` -- Programmatic Navigation

```jsx
import { router } from '@inertiajs/react'

// Navigation
router.visit('/dashboard')
router.get('/users', { search: 'John' })
router.post('/teams', { name: 'New Team' })
router.patch('/teams/1', { name: 'Updated' })
router.delete('/logout')

// Reload current page
router.reload({ only: ['notifications'] })
router.reload({ except: ['heavyData'] })

// With options
router.post('/users', userData, {
  preserveScroll: true,
  onSuccess: (page) => console.log('Created!'),
  onError: (errors) => console.error(errors)
})

// Cancel requests
router.cancel()
router.cancelAll()

// Client-side state manipulation (no server request)
router.replace({
  props: (current) => ({ ...current, showModal: true })
})
router.push({
  url: '/users?modal=true',
  props: (current) => ({ ...current, showModal: true })
})

// Global events
const removeListener = router.on('navigate', (event) => {
  console.log('Navigated to:', event.detail.page.url)
})
// Later: removeListener()
```

### Global Events

| Event       | Description                                    |
| ----------- | ---------------------------------------------- |
| `before`    | Before visit starts (return `false` to cancel) |
| `start`     | Visit started                                  |
| `progress`  | Upload progress                                |
| `finish`    | Visit finished (success or error)              |
| `cancel`    | Visit cancelled                                |
| `navigate`  | Page navigation completed                      |
| `success`   | Successful response                            |
| `error`     | Validation errors                              |
| `invalid`   | Non-Inertia response                           |
| `exception` | Unexpected error                               |

## `Deferred` -- Loading Deferred Props

Renders a fallback until server-deferred props arrive:

```jsx
import { Deferred } from '@inertiajs/react'

// Single deferred prop
<Deferred data="analytics" fallback={<div>Loading analytics...</div>}>
  <AnalyticsChart data={analytics} />
</Deferred>

// Multiple deferred props
<Deferred data={['users', 'roles']} fallback={<Spinner />}>
  <UserTable users={users} roles={roles} />
</Deferred>

// With render functions
<Deferred
  data="comments"
  fallback={() => <SkeletonLoader lines={5} />}
>
  {() => <CommentList comments={comments} />}
</Deferred>
```

## `WhenVisible` -- Lazy Load on Scroll

Loads props when the element scrolls into the viewport:

```jsx
import { WhenVisible } from '@inertiajs/react'

// Load 'comments' when visible
<WhenVisible data="comments" fallback={<CommentsSkeleton />}>
  <CommentList />
</WhenVisible>

// With buffer (load 200px before visible)
<WhenVisible data="recommendations" buffer={200} fallback={<Spinner />}>
  <RecommendationList />
</WhenVisible>

// Always reload when visible
<WhenVisible data="liveData" always fallback={<Spinner />}>
  <LiveFeed />
</WhenVisible>

// Custom wrapper element
<WhenVisible data="items" as="section" fallback={<Loading />}>
  <ItemGrid />
</WhenVisible>

// With custom reload params
<WhenVisible
  params={{ only: ['notifications'], headers: { 'X-Custom': 'true' } }}
  fallback={<p>Loading...</p>}
>
  <NotificationList />
</WhenVisible>
```

## `usePoll` -- Auto-Polling

```jsx
import { usePoll } from '@inertiajs/react'

// Poll every 5 seconds
const { stop, start } = usePoll(5000)

// Partial reload every 3 seconds
usePoll(3000, { only: ['notifications'] })

// Keep alive in background tabs
usePoll(1000, { only: ['status'] }, { keepAlive: true })

// Manual start
const poller = usePoll(2000, { only: ['messages'] }, { autoStart: false })
// Later: poller.start()
```

## `useRemember` -- Persist State Across Navigation

```jsx
import { useRemember } from '@inertiajs/react'

// State persists when navigating away and back
const [filters, setFilters] = useRemember(
  { search: '', status: 'all' },
  'user-filters'
)
```

## `usePrefetch` -- Prefetch Awareness

```jsx
import { usePrefetch } from '@inertiajs/react'

const { isPrefetched, isPrefetching, lastUpdatedAt, flush } = usePrefetch()
```

## Persistent Layouts

Layouts don't remount between navigations, preserving state (scroll, audio, etc.):

```jsx
// Define layout on the page component
import AppLayout from '@/layouts/AppLayout'

Dashboard.layout = (page) => <AppLayout title="Dashboard">{page}</AppLayout>

export default function Dashboard({ user }) {
  return <h1>Welcome, {user.fullName}</h1>
}
```

### Nested Layouts

```jsx
import AppLayout from '@/layouts/AppLayout'
import SettingsLayout from '@/layouts/SettingsLayout'

ProfileSettings.layout = (page) => (
  <AppLayout title="Settings">
    <SettingsLayout>{page}</SettingsLayout>
  </AppLayout>
)
```

### Default Layout via Resolve

```jsx
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })
    const page = pages[`./pages/${name}.jsx`]
    page.default.layout =
      page.default.layout || ((page) => <AppLayout>{page}</AppLayout>)
    return page
  }
  // ...
})
```
