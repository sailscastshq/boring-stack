---
name: vue
description: Vue-specific Inertia APIs - useForm, usePage, Link, Head, Deferred, WhenVisible, usePoll, usePrefetch, useRemember, layouts
metadata:
  tags: vue, useForm, usePage, Link, Head, Deferred, WhenVisible, usePoll, layouts, createInertiaApp, defineOptions
---

# Vue

All Vue-specific Inertia APIs are imported from `@inertiajs/vue3`.

## Imports

```vue
<script setup>
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
} from '@inertiajs/vue3'
</script>
```

## `createInertiaApp` -- App Bootstrap

```js
// assets/js/app.js
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.vue', { eager: true })
    return pages[`./pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
  title: (title) => (title ? `${title} | My App` : 'My App')
})
```

## `useForm` -- Form State Management

`useForm` returns a Vue `reactive` object with form data, methods, and state.

### Basic Usage

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  email: '',
  password: '',
  rememberMe: false
})
</script>

<template>
  <form @submit.prevent="form.post('/login')">
    <input type="email" v-model="form.email" />
    <p v-if="form.errors.email" class="text-red-500">{{ form.errors.email }}</p>

    <input type="password" v-model="form.password" />
    <p v-if="form.errors.password" class="text-red-500">
      {{ form.errors.password }}
    </p>

    <label>
      <input type="checkbox" v-model="form.rememberMe" />
      Remember me
    </label>

    <button type="submit" :disabled="form.processing">
      {{ form.processing ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>
```

### Form Methods

```js
form.get(url, options)
form.post(url, options)
form.put(url, options)
form.patch(url, options)
form.delete(url, options)

form.reset() // Reset all fields
form.reset('password') // Reset specific field
form.clearErrors() // Clear all errors
form.clearErrors('email') // Clear specific error
form.setError('email', 'Invalid') // Set error manually
form.cancel() // Cancel in-flight request

// Transform data before submission
form
  .transform((data) => ({
    ...data,
    remember: data.rememberMe ? 'on' : ''
  }))
  .post('/login')
```

### Form Properties

```js
form.data() // Returns plain data object (no methods)
form.errors // { fieldName: 'message' }
form.hasErrors // Boolean
form.processing // Boolean
form.progress // Upload progress
form.wasSuccessful // Boolean
form.recentlySuccessful // Boolean (true for ~2 seconds after success)
form.isDirty // Boolean
```

### With Computed Properties

Since `useForm` returns a `reactive` object, all fields are reactive:

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'
import { computed } from 'vue'

const form = useForm({
  email: null,
  password: null
})

const disableButton = computed(() => {
  return !form.email || !form.password || form.processing
})
</script>
```

### Submission Options

```js
form.post('/signup', {
  preserveScroll: true,
  preserveState: true,
  only: ['users'],
  except: ['meta'],
  forceFormData: true,
  onBefore: (visit) => confirm('Submit?'),
  onStart: (visit) => {},
  onProgress: (progress) => {},
  onSuccess: (page) => form.reset('password'),
  onError: (errors) => {},
  onFinish: () => {},
  onCancel: () => {}
})
```

### Receiving Props via defineProps

```vue
<script setup>
const { token } = defineProps({ token: String })

const form = useForm({
  token,
  password: null,
  confirmPassword: null
})
</script>
```

## `usePage` -- Access Page Data (Reactive)

`usePage()` returns a `reactive` object with `computed` properties -- automatically reactive.

```vue
<script setup>
import { usePage } from '@inertiajs/vue3'
import { computed, watch } from 'vue'

const page = usePage()

// Direct access (reactive)
const loggedInUser = page.props.loggedInUser
const currentUrl = page.url

// Computed derived values
const isAdmin = computed(() => page.props.loggedInUser?.role === 'admin')

// Watch for changes
watch(
  () => page.props.flash,
  (flash) => {
    if (flash?.success) showToast(flash.success)
  }
)
</script>

<template>
  <nav>
    <span v-if="loggedInUser">{{ loggedInUser.fullName }}</span>
    <Link v-else href="/login">Login</Link>
  </nav>
</template>
```

## `Link` -- SPA Navigation

```vue
<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <!-- Basic -->
  <Link href="/dashboard">Dashboard</Link>

  <!-- HTTP method -->
  <Link href="/logout" method="delete" as="button">Logout</Link>

  <!-- Preserve scroll/state -->
  <Link href="/users?page=2" preserve-scroll preserve-state>Page 2</Link>

  <!-- Partial reload -->
  <Link href="/dashboard" :only="['notifications']">Refresh</Link>

  <!-- Prefetch -->
  <Link href="/dashboard" prefetch>Dashboard</Link>
  <Link href="/dashboard" prefetch="mount">Dashboard</Link>
  <Link href="/about" prefetch :cache-for="60000">About</Link>

  <!-- With data -->
  <Link href="/users" :data="{ search: 'John' }">Search</Link>

  <!-- Event callbacks -->
  <Link
    href="/dashboard"
    @before="() => confirm('Are you sure?')"
    @success="() => console.log('Navigated!')"
  >
    Dashboard
  </Link>
</template>
```

### When to Use `<a>` Instead of `Link`

```vue
<template>
  <a href="https://example.com">External</a>
  <a href="/auth/google/redirect">Sign in with Google</a>
</template>
```

## `Head` -- Document Head Management

```vue
<script setup>
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <!-- Title only -->
  <Head title="Dashboard" />

  <!-- Title + meta -->
  <Head title="Dashboard">
    <meta name="description" content="Your dashboard" />
  </Head>

  <!-- Deduplication with head-key -->
  <Head>
    <meta
      head-key="description"
      name="description"
      content="Page description"
    />
  </Head>
</template>
```

## `router` -- Programmatic Navigation

```vue
<script setup>
import { router } from '@inertiajs/vue3'

function logout() {
  router.delete('/logout')
}

function search(query) {
  router.get('/users', { search: query }, { preserveState: true })
}
</script>

<template>
  <button @click="logout">Logout</button>
  <button @click="router.reload({ only: ['notifications'] })">Refresh</button>
</template>
```

### Global Events in Vue

```vue
<script setup>
import { router } from '@inertiajs/vue3'
import { onMounted, onUnmounted } from 'vue'

let removeListener

onMounted(() => {
  removeListener = router.on('navigate', (event) => {
    console.log('Navigated to:', event.detail.page.url)
  })
})

onUnmounted(() => {
  removeListener?.()
})
</script>
```

### Client-Side Navigation (No Server Request)

```js
router.replace({
  props: (current) => ({ ...current, showModal: true }),
  preserveState: true
})

router.push({
  url: '/users?modal=true',
  props: (current) => ({ ...current, showModal: true })
})
```

## `Deferred` -- Loading Deferred Props

Uses Vue's slot system:

```vue
<script setup>
import { Deferred } from '@inertiajs/vue3'
</script>

<template>
  <!-- Single deferred prop -->
  <Deferred data="analytics">
    <template #fallback>
      <div>Loading analytics...</div>
    </template>
    <AnalyticsChart :data="$page.props.analytics" />
  </Deferred>

  <!-- Multiple deferred props -->
  <Deferred :data="['users', 'roles']">
    <template #fallback>
      <Spinner />
    </template>
    <UserTable :users="$page.props.users" :roles="$page.props.roles" />
  </Deferred>
</template>
```

## `WhenVisible` -- Lazy Load on Scroll

```vue
<script setup>
import { WhenVisible } from '@inertiajs/vue3'
</script>

<template>
  <WhenVisible data="comments">
    <template #fallback>
      <p>Loading comments...</p>
    </template>
    <CommentsList :comments="$page.props.comments" />
  </WhenVisible>

  <!-- With buffer -->
  <WhenVisible :data="['relatedPosts']" :buffer="200">
    <template #fallback><SkeletonLoader /></template>
    <RelatedContent :posts="$page.props.relatedPosts" />
  </WhenVisible>

  <!-- Always reload when visible -->
  <WhenVisible data="latestPosts" always>
    <template #fallback><p>Checking for new posts...</p></template>
    <PostFeed :posts="$page.props.latestPosts" />
  </WhenVisible>
</template>
```

## `usePoll` -- Auto-Polling

```vue
<script setup>
import { usePoll } from '@inertiajs/vue3'

// Poll every 5 seconds (partial reload)
const { stop, start } = usePoll(5000, { only: ['notifications'] })

// Keep alive in background tabs
usePoll(3000, { only: ['messages'] }, { keepAlive: true })

// Manual start
const poller = usePoll(5000, { only: ['data'] }, { autoStart: false })
</script>
```

Automatically stops on `onUnmounted`.

## `useRemember` -- Persist State Across Navigation

```vue
<script setup>
import { useRemember } from '@inertiajs/vue3'

// Returns a Ref -- use .value or v-model
const filters = useRemember(
  {
    search: '',
    sort: 'name',
    direction: 'asc'
  },
  'user-filters'
)
</script>

<template>
  <input v-model="filters.search" />
  <select v-model="filters.sort">
    <option value="name">Name</option>
    <option value="date">Date</option>
  </select>
</template>
```

## `usePrefetch` -- Prefetch Awareness

```vue
<script setup>
import { usePrefetch } from '@inertiajs/vue3'

// Returns Refs (reactive)
const { isPrefetched, isPrefetching, lastUpdatedAt, flush } = usePrefetch()
</script>
```

## Persistent Layouts with `defineOptions`

```vue
<script setup>
import { Head, usePage } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})

const page = usePage()
const loggedInUser = page.props.loggedInUser
</script>

<template>
  <Head title="Dashboard" />
  <h1>Welcome, {{ loggedInUser.fullName }}</h1>
</template>
```

### Nested Layouts

```vue
<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: [AppLayout, DashboardLayout]
})
</script>
```

### Layout as Function

```vue
<script setup>
import { h } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: (h, page) => h(AppLayout, { sidebar: true }, () => page)
})
</script>
```

### No Layout

```vue
<script setup>
defineOptions({ layout: null })
</script>
```

## Vue-Specific: Options API Globals

Available in the Options API (not needed in Composition API):

```js
this.$inertia // The router instance
this.$page // Current page data
```

## Vue-Specific: Options API Remember

```vue
<script>
export default {
  remember: 'form', // Remember this.$data.form across navigation
  // or
  remember: {
    data: ['form'],
    key: 'users-create'
  },
  data() {
    return {
      form: { name: '', email: '' }
    }
  }
}
</script>
```
