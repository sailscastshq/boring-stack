---
name: svelte
description: Svelte-specific Inertia APIs - useForm, page store, Link, inertia action, Deferred, WhenVisible, usePoll, layouts
metadata:
  tags: svelte, useForm, page, Link, inertia, Deferred, WhenVisible, usePoll, layouts, stores, createInertiaApp
---

# Svelte

All Svelte-specific Inertia APIs are imported from `@inertiajs/svelte`. Svelte uses **stores** for reactivity rather than hooks.

## Imports

```svelte
<script>
  import {
    createInertiaApp,
    router,
    page,            // Readable store (not a function)
    Link,
    inertia,         // Svelte action directive
    useForm,
    usePoll,
    usePrefetch,
    useRemember,
    Deferred,
    WhenVisible,
  } from '@inertiajs/svelte'
</script>
```

## Key Differences from React/Vue

1. **No `usePage()` function** -- Svelte uses `page` as a store, accessed via `$page`
2. **No `Head` component** -- Uses native `<svelte:head>` instead
3. **`useForm` returns a Writable store** -- Access via `$form.fieldName`
4. **`inertia` action** -- Unique `use:inertia` directive for making any element a link
5. **Layout via `<script context="module">`** -- Uses `export const layout = Component`

## `createInertiaApp` -- App Bootstrap

```js
// assets/js/app.js
import { createInertiaApp } from '@inertiajs/svelte'
import { mount } from 'svelte'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.svelte', { eager: true })
    return pages[`./pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  }
})
```

## `useForm` -- Form State Management (Store-Based)

`useForm` returns a Svelte `Writable` store. Access fields with the `$` prefix.

### Basic Usage

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    email: null,
    password: null,
    rememberMe: false,
  })

  // Reactive derived values
  $: disableButton = !$form.email || !$form.password || $form.processing
</script>

<svelte:head>
  <title>Login | My App</title>
</svelte:head>

<form on:submit|preventDefault={$form.post('/login')}>
  <input type="email" bind:value={$form.email} />
  {#if $form.errors.email}
    <p class="text-red-500">{$form.errors.email}</p>
  {/if}

  <input type="password" bind:value={$form.password} />
  {#if $form.errors.password}
    <p class="text-red-500">{$form.errors.password}</p>
  {/if}

  <label>
    <input type="checkbox" bind:checked={$form.rememberMe} />
    Remember me
  </label>

  <button type="submit" disabled={disableButton}>
    {$form.processing ? 'Logging in...' : 'Login'}
  </button>
</form>
```

### Form Methods

```svelte
<script>
  $form.get(url, options)
  $form.post(url, options)
  $form.put(url, options)
  $form.patch(url, options)
  $form.delete(url, options)

  $form.reset()
  $form.reset('password')
  $form.clearErrors()
  $form.clearErrors('email')
  $form.setError('email', 'Invalid email')
  $form.cancel()

  // Transform before submission
  $form.transform((data) => ({
    ...data,
    remember: data.rememberMe ? 'on' : '',
  })).post('/login')
</script>
```

### Form Properties

```svelte
<script>
  $form.data()             // Returns plain data object
  $form.errors            // { fieldName: 'message' }
  $form.hasErrors         // Boolean
  $form.processing        // Boolean
  $form.progress          // Upload progress
  $form.wasSuccessful     // Boolean
  $form.recentlySuccessful // Boolean (true for ~2 seconds)
  $form.isDirty           // Boolean
</script>
```

### With Remember Key

```svelte
<script>
  // Form state persists across back/forward navigation
  const form = useForm('CreateUser', {
    name: '',
    email: '',
  })
</script>
```

### Multiple Forms

```svelte
<script>
  import { useForm, router } from '@inertiajs/svelte'

  const profileForm = useForm({
    email: loggedInUser.email,
    fullName: loggedInUser.fullName,
  })

  const deleteForm = useForm({
    password: null,
  })

  function updateProfile() {
    $profileForm.patch('/profile', {
      preserveScroll: true,
      preserveState: true,
    })
  }

  function deleteAccount() {
    if (confirm('Are you sure?')) {
      $deleteForm.delete('/profile')
    }
  }
</script>
```

## `page` Store -- Access Page Data

Svelte uses the `page` store (not a `usePage()` function):

```svelte
<script>
  import { page } from '@inertiajs/svelte'

  // Access via $page (auto-subscription)
  $: loggedInUser = $page.props.loggedInUser
  $: flash = $page.props.flash
  $: currentUrl = $page.url
</script>

{#if loggedInUser}
  <span>{loggedInUser.fullName}</span>
{:else}
  <a href="/login">Login</a>
{/if}

{#if flash?.success}
  <div class="text-green-600">{flash.success}</div>
{/if}
```

## `Link` -- SPA Navigation

```svelte
<script>
  import { Link } from '@inertiajs/svelte'
</script>

<!-- Basic -->
<Link href="/dashboard">Dashboard</Link>

<!-- HTTP method -->
<Link href="/logout" method="delete">Logout</Link>

<!-- Preserve scroll/state -->
<Link href="/users?page=2" preserveScroll preserveState>Page 2</Link>

<!-- Partial reload -->
<Link href="/dashboard" only={['notifications']}>Refresh</Link>

<!-- Prefetch -->
<Link href="/dashboard" prefetch>Dashboard</Link>
<Link href="/about" prefetch="mount">About</Link>
<Link href="/about" prefetch cacheFor={60000}>About</Link>

<!-- Styling -->
<Link
  href="/features"
  class={$page.url === '/features' ? 'text-brand font-bold' : 'text-gray-700'}
>
  Features
</Link>
```

## `use:inertia` Action -- Make Any Element a Link

A unique Svelte feature. The `inertia` action turns any element into an Inertia link:

```svelte
<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<!-- Simple link -->
<a href="/dashboard" use:inertia>Dashboard</a>

<!-- With method -->
<button use:inertia={{ href: '/logout', method: 'delete' }}>Logout</button>

<!-- With options -->
<div use:inertia={{ href: '/dashboard', preserveScroll: true }}>
  Go to Dashboard
</div>

<!-- With prefetching -->
<a href="/settings" use:inertia={{ prefetch: 'hover', cacheFor: 30000 }}>
  Settings
</a>
```

### Action Events

```svelte
<a
  href="/users"
  use:inertia
  on:before={(e) => console.log('Before', e.detail)}
  on:success={(e) => console.log('Success', e.detail)}
  on:error={(e) => console.log('Error', e.detail)}
  on:finish={(e) => console.log('Finished', e.detail)}
>
  Users
</a>
```

## `<svelte:head>` -- Document Head

Svelte uses native `<svelte:head>` instead of an Inertia Head component:

```svelte
<svelte:head>
  <title>Dashboard | My App</title>
  <meta name="description" content="Your dashboard overview" />
</svelte:head>
```

### Dynamic Title

```svelte
<script>
  export let user
</script>

<svelte:head>
  <title>{user.name}'s Profile</title>
</svelte:head>
```

## `router` -- Programmatic Navigation

```svelte
<script>
  import { router } from '@inertiajs/svelte'

  function logout() {
    router.delete('/logout')
  }

  function refreshNotifications() {
    router.reload({ only: ['notifications'] })
  }
</script>

<button on:click={logout}>Logout</button>
<button on:click={refreshNotifications}>Refresh</button>
```

### Global Event Listeners

```svelte
<script>
  import { router } from '@inertiajs/svelte'
  import { onMount, onDestroy } from 'svelte'

  let removeListener

  onMount(() => {
    removeListener = router.on('navigate', (event) => {
      console.log('Navigated to:', event.detail.page.url)
    })
  })

  onDestroy(() => {
    removeListener?.()
  })
</script>
```

## `Deferred` -- Loading Deferred Props

Uses Svelte's slot system. The `fallback` slot is **required**:

```svelte
<script>
  import { Deferred } from '@inertiajs/svelte'
  export let analytics
</script>

<!-- Single deferred prop -->
<Deferred data="analytics">
  <svelte:fragment slot="fallback">
    <p>Loading analytics...</p>
  </svelte:fragment>
  <AnalyticsChart data={analytics} />
</Deferred>

<!-- Multiple deferred props -->
<Deferred data={['users', 'roles']}>
  <svelte:fragment slot="fallback">
    <div class="skeleton-loader">Loading...</div>
  </svelte:fragment>
  <UserTable {users} {roles} />
</Deferred>
```

## `WhenVisible` -- Lazy Load on Scroll

The `fallback` slot is optional for WhenVisible:

```svelte
<script>
  import { WhenVisible } from '@inertiajs/svelte'
  export let comments
</script>

<WhenVisible data="comments">
  <svelte:fragment slot="fallback">
    <p>Loading comments...</p>
  </svelte:fragment>
  {#each comments as comment}
    <div>{comment.body}</div>
  {/each}
</WhenVisible>

<!-- With buffer -->
<WhenVisible data="comments" buffer={200}>
  <svelte:fragment slot="fallback"><p>Loading...</p></svelte:fragment>
  <CommentsList />
</WhenVisible>

<!-- Always reload when visible -->
<WhenVisible data="liveData" always>
  <svelte:fragment slot="fallback"><p>Loading...</p></svelte:fragment>
  <LiveFeed />
</WhenVisible>
```

## `usePoll` -- Auto-Polling

```svelte
<script>
  import { usePoll } from '@inertiajs/svelte'

  // Poll every 5 seconds
  const { stop, start } = usePoll(5000, { only: ['notifications'] })

  // Keep alive in background
  usePoll(3000, { only: ['messages'] }, { keepAlive: true })

  // Manual start
  const poller = usePoll(5000, { only: ['data'] }, { autoStart: false })
</script>
```

Automatically stops on component destroy.

## `useRemember` -- Persist State

Returns a Svelte `Writable` store:

```svelte
<script>
  import { useRemember } from '@inertiajs/svelte'

  const filters = useRemember({ search: '', page: 1 }, 'userSearch')
</script>

<input bind:value={$filters.search} />
<p>Page: {$filters.page}</p>
```

## `usePrefetch` -- Prefetch Awareness

Returns Svelte `Readable` stores:

```svelte
<script>
  import { usePrefetch } from '@inertiajs/svelte'

  const { isPrefetched, isPrefetching, lastUpdatedAt, flush } = usePrefetch()
</script>

{#if $isPrefetching}
  <p>Loading...</p>
{/if}
```

## Persistent Layouts

Define layouts in a `<script context="module">` block:

```svelte
<script context="module">
  import AppLayout from '@/layouts/AppLayout.svelte'
  export const layout = AppLayout
</script>

<script>
  import { page } from '@inertiajs/svelte'
  $: loggedInUser = $page.props.loggedInUser
</script>

<svelte:head>
  <title>Dashboard | My App</title>
</svelte:head>

<section>
  <h1>Welcome, {loggedInUser.fullName}</h1>
</section>
```

### Nested Layouts

```svelte
<script context="module">
  import AppLayout from '@/layouts/AppLayout.svelte'
  import SettingsLayout from '@/layouts/SettingsLayout.svelte'
  export const layout = [AppLayout, SettingsLayout]
</script>
```

### Default Layout via Resolve

```js
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.svelte', { eager: true })
    const page = pages[`./pages/${name}.svelte`]
    return { default: page.default, layout: page.layout || AppLayout }
  }
})
```

## Svelte Reactivity Patterns

### Reactive Declarations (`$:`)

```svelte
<script>
  const form = useForm({ email: '', password: '' })

  $: isValid = $form.email && $form.password?.length >= 8
  $: hasError = $form.hasErrors
</script>
```

### Two-Way Binding (`bind:`)

```svelte
<input bind:value={$form.name} />
<input type="checkbox" bind:checked={$form.rememberMe} />
<select bind:value={$form.role}>
  <option value="admin">Admin</option>
  <option value="user">User</option>
</select>
```

### Event Modifiers

```svelte
<form on:submit|preventDefault={$form.post('/submit')}>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
```

### Conditional Rendering and CSS

```svelte
{#if $form.errors.email}
  <p class="text-red-500">{$form.errors.email}</p>
{/if}

{#if $form.recentlySuccessful}
  <p class="text-green-600">Saved!</p>
{/if}

<button
  class:opacity-50={$form.processing}
  disabled={$form.processing}
>
  Submit
</button>
```
