---
name: client-side-components
description: Client-side Inertia components - Link, router, usePage, Head, layouts, createInertiaApp
metadata:
  tags: link, router, usePage, head, layouts, client-side, react, vue, svelte
---

# Client-Side Components

## The `Link` Component

Use `Link` instead of `<a>` tags for internal navigation. It makes XHR requests instead of full page loads:

### React

```jsx
import { Link } from '@inertiajs/react'

// Basic link
<Link href="/dashboard">Dashboard</Link>

// With styling
<Link
  href="/signup"
  className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-white"
>
  Get Started
</Link>

// Active link detection
const { url } = usePage()
<Link
  href="/features"
  className={url === '/features' ? 'bg-brand-100 text-brand-700' : 'text-gray-700'}
>
  Features
</Link>

// Method and data
<Link href="/logout" method="delete" as="button">
  Logout
</Link>
```

### Vue

```vue
<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/signup" class="bg-brand px-6 py-2.5 text-white">Sign up</Link>
  <Link href="/logout" method="delete" as="button">Logout</Link>
</template>
```

### Svelte

```svelte
<script>
  import { Link } from '@inertiajs/svelte'
</script>

<Link href="/dashboard">Dashboard</Link>
<Link href="/forgot-password" class="text-brand hover:underline">Forgot Password</Link>
```

### When to Use `<a>` Instead of `Link`

Use regular `<a>` tags for:

- External URLs (`https://example.com`)
- OAuth redirect URLs (`/auth/google/redirect`)
- File downloads
- Any URL that should trigger a full page load

```jsx
// OAuth buttons use <a> tags, not Link
<a href="/auth/google/redirect" className="btn">Sign in with Google</a>
<a href="/auth/github/redirect" className="btn">Sign in with GitHub</a>
```

## The `router` Object

For programmatic navigation (outside of links and forms):

```jsx
import { router } from '@inertiajs/react'

// Navigate
router.visit('/dashboard')
router.get('/users')

// Mutations
router.post('/teams', { name: 'New Team' })
router.patch('/teams/1', { name: 'Updated Team' })
router.delete('/logout')

// With options
router.visit('/dashboard', {
  method: 'get',
  preserveScroll: true,
  preserveState: true,
  only: ['users'], // Partial reload
  except: ['notifications'], // Exclude props
  onSuccess: (page) => {},
  onError: (errors) => {}
})

// Reload current page (partial reload)
router.reload({ only: ['notifications'] })
```

### Vue

```vue
<script setup>
import { router } from '@inertiajs/vue3'

function logout() {
  router.delete('/logout')
}
</script>

<template>
  <button @click="logout">Logout</button>
  <button @click="router.delete('/logout')">Logout (inline)</button>
</template>
```

## `usePage()` -- Access Page Data

Access the current page object (URL, props, component) from any component:

### React

```jsx
import { usePage } from '@inertiajs/react'

export default function AppLayout({ children }) {
  const { url, props } = usePage()
  const loggedInUser = props.loggedInUser
  const flash = props.flash
  const errors = props.errors

  return (
    <div>
      {loggedInUser ? (
        <span>{loggedInUser.fullName}</span>
      ) : (
        <Link href="/login">Login</Link>
      )}
      {children}
    </div>
  )
}
```

### Vue

```vue
<script setup>
import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
</script>

<template>
  <span v-if="loggedInUser">{{ loggedInUser.fullName }}</span>
  <Link v-else href="/login">Login</Link>
</template>
```

## `Head` Component -- Page Title and Meta

Set the page title and meta tags:

### React

```jsx
import { Head } from '@inertiajs/react'

export default function Login() {
  return (
    <>
      <Head title="Login | My App" />
      {/* page content */}
    </>
  )
}

// With meta tags
;<Head>
  <title>Dashboard</title>
  <meta name="description" content="Your dashboard" />
</Head>
```

### Vue

```vue
<template>
  <Head title="Login | My App" />
  <!-- page content -->
</template>
```

### Svelte

```svelte
<svelte:head>
  <title>Login | Mellow</title>
</svelte:head>
```

## Persistent Layouts

Layouts wrap page components and persist across navigation (they don't remount). This preserves state like scroll position, audio players, etc.

### React

```jsx
// Define layout on the page component
import DashboardLayout from '@/layouts/DashboardLayout'

ProfileSettings.layout = (page) => (
  <DashboardLayout title="Profile" maxWidth="narrow">
    {page}
  </DashboardLayout>
)

export default function ProfileSettings() {
  return <div>Profile content</div>
}
```

### Vue

```vue
<script setup>
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: DashboardLayout
})

// Or with props:
defineOptions({
  layout: (h, page) =>
    h(DashboardLayout, { maxWidth: 'narrow', title: 'Profile' }, () => page)
})
</script>
```

### Nested Layouts

```jsx
// Page with two levels of layout
ProfileSettings.layout = (page) => (
  <DashboardLayout title="Profile">
    <SettingsLayout>{page}</SettingsLayout>
  </DashboardLayout>
)
```

## Layout Component Example

```jsx
// assets/js/layouts/AppLayout.jsx
import { Link, usePage } from '@inertiajs/react'
import { Toast } from 'primereact/toast'
import { useFlashToast } from '@/hooks/useFlashToast'
import { useRef } from 'react'

export default function AppLayout({ children }) {
  const { loggedInUser } = usePage().props
  const { url } = usePage()
  const toast = useRef(null)

  useFlashToast(toast)

  return (
    <div className="flex min-h-screen flex-col">
      <header>
        <nav className="flex items-center justify-between px-4 py-4">
          <Link href="/">
            <img src="/images/logo.svg" alt="Logo" />
          </Link>

          {loggedInUser ? (
            <div className="flex items-center space-x-6">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/profile">{loggedInUser.fullName}</Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">Login</Link>
              <Link
                href="/signup"
                className="bg-brand text-white px-4 py-2 rounded"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
      <Toast ref={toast} />
    </div>
  )
}
```

## Remembering State

Preserve component state across navigation:

```jsx
import { useRemember } from '@inertiajs/react'

// State persists when navigating away and back
const [filters, setFilters] = useRemember(
  { search: '', status: 'all' },
  'user-filters'
)
```

```vue
<script setup>
import { useRemember } from '@inertiajs/vue3'
const filters = useRemember({ search: '', status: 'all' }, 'user-filters')
</script>
```
