---
name: toast-notifications
description: Global toast/notification queue with auto-dismiss, hover pause, max stacking, Inertia flash integration, and accessible announcements for React, Vue, and Svelte
metadata:
  tags: toast, notification, flash, snackbar, alert, queue, auto-dismiss, aria-live, inertia, useToast
---

# Toast / Notification Queue Management

Toast notifications provide non-blocking feedback to users after actions complete. They stack visually, auto-dismiss after a configurable duration, and can be manually closed. A well-built toast system is global (any component can push a toast), survives Inertia navigations, pauses auto-dismiss on hover, and announces to screen readers via `aria-live`.

## Architecture

```
Component calls toast.success('Saved!')
        ↓
Toast store/context adds { id, message, type, duration }
        ↓
Toast container renders stack (fixed bottom-right)
        ↓
Auto-dismiss timer starts (default 5000ms)
        ↓
User hovers → pause timer → user leaves → resume timer
        ↓
Timer expires OR user clicks X → removeToast(id) → exit animation → unmount
```

Key design decisions:

1. **Toast store lives outside the Inertia page lifecycle** — If the store is scoped to a page component, toasts disappear on navigation. The store must be at the layout or app root level.
2. **Max visible toasts** — When more than 5 toasts exist, the oldest is auto-removed to prevent screen overflow.
3. **Auto-generated IDs** — Each toast gets a unique ID via an incrementing counter. This avoids collisions and simplifies removal.
4. **Type-based styling** — Four visual variants: `success` (green), `error` (red), `warning` (amber), `info` (blue).

## Toast Store / Context

### React

```jsx
// assets/js/contexts/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const MAX_TOASTS = 5
const DEFAULT_DURATION = 5000

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(
    ({ message, type = 'info', duration = DEFAULT_DURATION }) => {
      const id = ++toastCounter

      setToasts((prev) => {
        const next = [...prev, { id, message, type, duration }]
        // If we exceed the max, remove the oldest
        if (next.length > MAX_TOASTS) {
          return next.slice(next.length - MAX_TOASTS)
        }
        return next
      })

      return id
    },
    []
  )

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}
```

### Vue

```js
// assets/js/composables/toastStore.js
import { ref } from 'vue'

const MAX_TOASTS = 5
const DEFAULT_DURATION = 5000

let toastCounter = 0

const toasts = ref([])

export function useToastStore() {
  function addToast({ message, type = 'info', duration = DEFAULT_DURATION }) {
    const id = ++toastCounter

    toasts.value.push({ id, message, type, duration })

    // If we exceed the max, remove the oldest
    if (toasts.value.length > MAX_TOASTS) {
      toasts.value = toasts.value.slice(toasts.value.length - MAX_TOASTS)
    }

    return id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, addToast, removeToast }
}
```

The `toasts` ref is declared at module scope so it is shared across all components that import `useToastStore()`. This is the Vue equivalent of a global store -- no Pinia or Vuex needed.

### Svelte

```js
// assets/js/stores/toastStore.js
import { writable } from 'svelte/store'

const MAX_TOASTS = 5
const DEFAULT_DURATION = 5000

let toastCounter = 0

export const toasts = writable([])

export function addToast({
  message,
  type = 'info',
  duration = DEFAULT_DURATION
}) {
  const id = ++toastCounter

  toasts.update((prev) => {
    const next = [...prev, { id, message, type, duration }]
    if (next.length > MAX_TOASTS) {
      return next.slice(next.length - MAX_TOASTS)
    }
    return next
  })

  return id
}

export function removeToast(id) {
  toasts.update((prev) => prev.filter((t) => t.id !== id))
}
```

## Toast Container Component

The container renders the toast stack with fixed positioning, entrance/exit animations, hover-to-pause, and type-based styling.

### React

```jsx
// assets/js/components/ToastContainer.jsx
import { useEffect, useRef, useState } from 'react'
import { useToastContext } from '~/contexts/ToastContext'

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-600 text-white'
}

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false)
  const timerRef = useRef(null)
  const remainingRef = useRef(toast.duration)
  const startRef = useRef(null)

  function startTimer() {
    startRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      dismiss()
    }, remainingRef.current)
  }

  function pauseTimer() {
    clearTimeout(timerRef.current)
    if (startRef.current) {
      remainingRef.current -= Date.now() - startRef.current
    }
  }

  function dismiss() {
    clearTimeout(timerRef.current)
    setIsExiting(true)
    // Wait for the exit animation to finish before removing
    setTimeout(() => onRemove(toast.id), 300)
  }

  useEffect(() => {
    startTimer()
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-[420px]
        ${typeStyles[toast.type]}
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
      role="status"
      aria-live="polite"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
    >
      <span className="text-lg font-bold flex-shrink-0">
        {typeIcons[toast.type]}
      </span>
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => dismiss()}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext()

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
```

Add these animation keyframes to your CSS (Tailwind `@layer utilities` or a global stylesheet):

```css
/* assets/css/app.css */
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.animate-toast-in {
  animation: toast-in 0.3s ease-out forwards;
}

.animate-toast-out {
  animation: toast-out 0.3s ease-in forwards;
}
```

### Vue

```vue
<!-- assets/js/components/ToastContainer.vue -->
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useToastStore } from '~/composables/toastStore'

const { toasts, removeToast } = useToastStore()

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-600 text-white'
}

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

// Track timers and exit state per toast
const timers = new Map()
const exitingIds = ref(new Set())

function startTimer(toast) {
  const state = timers.get(toast.id) || {
    remaining: toast.duration,
    start: null
  }
  state.start = Date.now()
  state.timeout = setTimeout(() => dismiss(toast.id), state.remaining)
  timers.set(toast.id, state)
}

function pauseTimer(toastId) {
  const state = timers.get(toastId)
  if (state) {
    clearTimeout(state.timeout)
    state.remaining -= Date.now() - state.start
    timers.set(toastId, state)
  }
}

function dismiss(toastId) {
  const state = timers.get(toastId)
  if (state) clearTimeout(state.timeout)
  timers.delete(toastId)
  exitingIds.value = new Set([...exitingIds.value, toastId])
  // Wait for exit animation
  setTimeout(() => {
    exitingIds.value = new Set(
      [...exitingIds.value].filter((id) => id !== toastId)
    )
    removeToast(toastId)
  }, 300)
}

// Start timers for new toasts
watch(
  () => toasts.value.length,
  () => {
    for (const toast of toasts.value) {
      if (!timers.has(toast.id) && !exitingIds.value.has(toast.id)) {
        startTimer(toast)
      }
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  for (const [, state] of timers) {
    clearTimeout(state.timeout)
  }
  timers.clear()
})
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    aria-label="Notifications"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-[420px]',
        typeStyles[toast.type],
        exitingIds.has(toast.id) ? 'animate-toast-out' : 'animate-toast-in'
      ]"
      role="status"
      aria-live="polite"
      @mouseenter="pauseTimer(toast.id)"
      @mouseleave="startTimer(toast)"
    >
      <span class="text-lg font-bold flex-shrink-0">{{
        typeIcons[toast.type]
      }}</span>
      <p class="flex-1 text-sm">{{ toast.message }}</p>
      <button
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
        @click="dismiss(toast.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/components/ToastContainer.svelte -->
<script>
  import { toasts, removeToast } from '~/stores/toastStore'
  import { onDestroy } from 'svelte'

  const typeStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-600 text-white'
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  const timers = new Map()
  let exitingIds = $state(new Set())

  function startTimer(toast) {
    const state = timers.get(toast.id) || { remaining: toast.duration, start: null }
    state.start = Date.now()
    state.timeout = setTimeout(() => dismiss(toast.id), state.remaining)
    timers.set(toast.id, state)
  }

  function pauseTimer(toastId) {
    const state = timers.get(toastId)
    if (state) {
      clearTimeout(state.timeout)
      state.remaining -= Date.now() - state.start
      timers.set(toastId, state)
    }
  }

  function dismiss(toastId) {
    const state = timers.get(toastId)
    if (state) clearTimeout(state.timeout)
    timers.delete(toastId)
    exitingIds = new Set([...exitingIds, toastId])
    setTimeout(() => {
      exitingIds = new Set([...exitingIds].filter((id) => id !== toastId))
      removeToast(toastId)
    }, 300)
  }

  // Start timers when new toasts appear
  $effect(() => {
    for (const toast of $toasts) {
      if (!timers.has(toast.id) && !exitingIds.has(toast.id)) {
        startTimer(toast)
      }
    }
  })

  onDestroy(() => {
    for (const [, state] of timers) {
      clearTimeout(state.timeout)
    }
    timers.clear()
  })
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-label="Notifications">
  {#each $toasts as toast (toast.id)}
    <div
      class={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-[420px] ${typeStyles[toast.type]} ${exitingIds.has(toast.id) ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="status"
      aria-live="polite"
      onmouseenter={() => pauseTimer(toast.id)}
      onmouseleave={() => startTimer(toast)}
    >
      <span class="text-lg font-bold flex-shrink-0">{typeIcons[toast.type]}</span>
      <p class="flex-1 text-sm">{toast.message}</p>
      <button
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
        onclick={() => dismiss(toast.id)}
      >
        ✕
      </button>
    </div>
  {/each}
</div>
```

## useToast Hook / Composable

A convenience API so any component can push toasts with `toast.success('Saved!')`:

### React

```jsx
// assets/js/hooks/useToast.js
import { useCallback } from 'react'
import { useToastContext } from '~/contexts/ToastContext'

export function useToast() {
  const { addToast, removeToast } = useToastContext()

  const success = useCallback(
    (message, duration) => addToast({ message, type: 'success', duration }),
    [addToast]
  )

  const error = useCallback(
    (message, duration) => addToast({ message, type: 'error', duration }),
    [addToast]
  )

  const warning = useCallback(
    (message, duration) => addToast({ message, type: 'warning', duration }),
    [addToast]
  )

  const info = useCallback(
    (message, duration) => addToast({ message, type: 'info', duration }),
    [addToast]
  )

  return { success, error, warning, info, addToast, removeToast }
}
```

**Usage:**

```jsx
import { useForm } from '@inertiajs/react'
import { useToast } from '~/hooks/useToast'

function DeletePostButton({ postId }) {
  const toast = useToast()
  const form = useForm({})

  function handleDelete() {
    form.delete(`/posts/${postId}`, {
      onSuccess: () => toast.success('Post deleted successfully'),
      onError: () => toast.error('Failed to delete post')
    })
  }

  return (
    <button onClick={handleDelete} disabled={form.processing}>
      Delete
    </button>
  )
}
```

### Vue

```js
// assets/js/composables/useToast.js
import { useToastStore } from '~/composables/toastStore'

export function useToast() {
  const { addToast, removeToast } = useToastStore()

  function success(message, duration) {
    return addToast({ message, type: 'success', duration })
  }

  function error(message, duration) {
    return addToast({ message, type: 'error', duration })
  }

  function warning(message, duration) {
    return addToast({ message, type: 'warning', duration })
  }

  function info(message, duration) {
    return addToast({ message, type: 'info', duration })
  }

  return { success, error, warning, info, addToast, removeToast }
}
```

**Usage:**

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'
import { useToast } from '~/composables/useToast'

const props = defineProps({ postId: { type: Number, required: true } })
const toast = useToast()
const form = useForm({})

function handleDelete() {
  form.delete(`/posts/${props.postId}`, {
    onSuccess: () => toast.success('Post deleted successfully'),
    onError: () => toast.error('Failed to delete post')
  })
}
</script>

<template>
  <button @click="handleDelete" :disabled="form.processing">Delete</button>
</template>
```

### Svelte

```js
// assets/js/stores/useToast.js
import { addToast, removeToast } from '~/stores/toastStore'

export function useToast() {
  function success(message, duration) {
    return addToast({ message, type: 'success', duration })
  }

  function error(message, duration) {
    return addToast({ message, type: 'error', duration })
  }

  function warning(message, duration) {
    return addToast({ message, type: 'warning', duration })
  }

  function info(message, duration) {
    return addToast({ message, type: 'info', duration })
  }

  return { success, error, warning, info, addToast, removeToast }
}
```

**Usage:**

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'
  import { useToast } from '~/stores/useToast'

  let { postId } = $props()
  const toast = useToast()
  const form = useForm({})

  function handleDelete() {
    $form.delete(`/posts/${postId}`, {
      onSuccess: () => toast.success('Post deleted successfully'),
      onError: () => toast.error('Failed to delete post')
    })
  }
</script>

<button onclick={handleDelete} disabled={$form.processing}>Delete</button>
```

## Integration with Inertia.js Flash Messages

In a Sails.js + Inertia application, the server sets flash messages via `sails.inertia.flash('success', 'Profile updated!')`. These arrive on the client as `usePage().props.flash`. The goal is to convert server flash messages into toasts automatically.

### Server-Side (Sails.js Action)

```js
// api/controllers/setting/update-profile.js
module.exports = {
  exits: {
    success: { responseType: 'redirect' }
  },
  fn: async function ({ fullName, email }) {
    await User.updateOne({ id: this.req.me.id }).set({ fullName, email })
    sails.inertia.flash('success', 'Profile updated successfully!')
    return '/settings'
  }
}
```

### React

```jsx
// assets/js/hooks/useFlashToast.js
import { useEffect, useRef } from 'react'
import { usePage } from '@inertiajs/react'
import { useToast } from '~/hooks/useToast'

export function useFlashToast() {
  const { flash } = usePage().props
  const toast = useToast()
  const processedRef = useRef(null)

  useEffect(() => {
    if (!flash) return

    // Serialize flash to detect changes and avoid duplicates
    const flashKey = JSON.stringify(flash)
    if (flashKey === processedRef.current) return
    processedRef.current = flashKey

    for (const [type, message] of Object.entries(flash)) {
      if (!message) continue
      const toastType =
        type === 'success'
          ? 'success'
          : type === 'error'
          ? 'error'
          : type === 'warning'
          ? 'warning'
          : 'info'
      toast[toastType](
        typeof message === 'string'
          ? message
          : message.detail || message.summary
      )
    }
  }, [flash])
}
```

**Mount it in your layout** so it runs on every page:

```jsx
// assets/js/layouts/AppLayout.jsx
import { ToastProvider } from '~/contexts/ToastContext'
import { ToastContainer } from '~/components/ToastContainer'
import { useFlashToast } from '~/hooks/useFlashToast'

function InnerLayout({ children }) {
  useFlashToast()
  return <>{children}</>
}

export default function AppLayout({ children }) {
  return (
    <ToastProvider>
      <InnerLayout>{children}</InnerLayout>
      <ToastContainer />
    </ToastProvider>
  )
}
```

### Vue

```js
// assets/js/composables/useFlashToast.js
import { watch, ref } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { useToast } from '~/composables/useToast'

export function useFlashToast() {
  const page = usePage()
  const toast = useToast()
  const lastFlashKey = ref(null)

  watch(
    () => page.props.flash,
    (flash) => {
      if (!flash) return

      const flashKey = JSON.stringify(flash)
      if (flashKey === lastFlashKey.value) return
      lastFlashKey.value = flashKey

      for (const [type, message] of Object.entries(flash)) {
        if (!message) continue
        const toastType =
          type === 'success'
            ? 'success'
            : type === 'error'
            ? 'error'
            : type === 'warning'
            ? 'warning'
            : 'info'
        toast[toastType](
          typeof message === 'string'
            ? message
            : message.detail || message.summary
        )
      }
    },
    { deep: true, immediate: true }
  )
}
```

**Mount it in your layout:**

```vue
<!-- assets/js/layouts/AppLayout.vue -->
<script setup>
import ToastContainer from '~/components/ToastContainer.vue'
import { useFlashToast } from '~/composables/useFlashToast'

useFlashToast()
</script>

<template>
  <slot />
  <ToastContainer />
</template>
```

### Svelte

```js
// assets/js/stores/useFlashToast.js
import { page } from '@inertiajs/svelte'
import { addToast } from '~/stores/toastStore'
import { get } from 'svelte/store'

let lastFlashKey = null

export function useFlashToast() {
  // Subscribe to page store changes
  const unsubscribe = page.subscribe(($page) => {
    const flash = $page.props.flash
    if (!flash) return

    const flashKey = JSON.stringify(flash)
    if (flashKey === lastFlashKey) return
    lastFlashKey = flashKey

    for (const [type, message] of Object.entries(flash)) {
      if (!message) continue
      const toastType =
        type === 'success'
          ? 'success'
          : type === 'error'
          ? 'error'
          : type === 'warning'
          ? 'warning'
          : 'info'
      addToast({
        message:
          typeof message === 'string'
            ? message
            : message.detail || message.summary,
        type: toastType
      })
    }
  })

  return unsubscribe
}
```

**Mount it in your layout:**

```svelte
<!-- assets/js/layouts/AppLayout.svelte -->
<script>
  import ToastContainer from '~/components/ToastContainer.svelte'
  import { useFlashToast } from '~/stores/useFlashToast'
  import { onDestroy } from 'svelte'

  let { children } = $props()

  const unsubscribe = useFlashToast()
  onDestroy(unsubscribe)
</script>

{@render children()}
<ToastContainer />
```

## Wiring Up: Putting It All Together

The toast system has three layers that must be connected correctly:

```
App Root
  └── ToastProvider (React) / module-level ref (Vue) / writable store (Svelte)
        └── Layout
              ├── useFlashToast()     ← converts server flash → toast
              ├── Page components     ← call useToast() for client-side toasts
              └── ToastContainer      ← renders the visual stack
```

For React, the `ToastProvider` must wrap everything, including the Inertia page. Place it in your root layout:

```jsx
// assets/js/app.jsx
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from '~/contexts/ToastContext'
import { ToastContainer } from '~/components/ToastContainer'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })
    return pages[`./pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <ToastProvider>
        <App {...props} />
        <ToastContainer />
      </ToastProvider>
    )
  }
})
```

For Vue and Svelte, the module-level store is automatically shared across all components. Just add `<ToastContainer />` to your layout and call `useFlashToast()` in the layout's setup.

## Common Mistakes

1. **Losing toasts on Inertia navigation** — If the toast store is created inside a page component, it re-initializes on every navigation. The store must live at the app or layout root level, outside Inertia's page rendering lifecycle. In React, wrap the entire `<App>` with `<ToastProvider>`. In Vue and Svelte, use module-level state so the store persists across page swaps.

2. **Not pausing auto-dismiss on hover** — Users hover over toasts to read them. If the toast disappears while they are reading, they miss information. Track the remaining time, pause on `mouseenter`, and resume on `mouseleave`.

3. **Showing duplicate toasts for the same flash message** — Inertia may re-render with the same `flash` props on navigation. Without deduplication, the same "Profile updated!" toast appears multiple times. Track the last processed flash (via `JSON.stringify`) and skip if unchanged.

4. **Too many toasts stacking** — Without a maximum, rapid actions (e.g., bulk delete) can produce dozens of toasts that cover the entire screen. Set a max (5 is a good default) and remove the oldest when exceeded.

5. **No way to manually dismiss** — Auto-dismiss is convenient for success messages but frustrating for errors. Users need to click an X button to dismiss toasts on their own terms. Error toasts can also use a longer duration (e.g., 8000ms) to give users more time.

6. **Not using `aria-live="polite"` for accessibility** — Screen readers do not announce dynamically inserted content unless the container uses `aria-live`. Add `role="status"` and `aria-live="polite"` to each toast element so assistive technology announces the notification without interrupting the current reading flow.

7. **Placing the toast container inside the page component** — The `<ToastContainer />` must be rendered by the layout or app root, not by individual page components. If a page component renders it, the container unmounts and remounts on every Inertia navigation, causing visible toasts to vanish.

8. **Not cleaning up timers on unmount** — If the toast container component unmounts (e.g., layout change), all running `setTimeout` handles must be cleared. Leaked timers call `removeToast` on a stale state, causing errors or unexpected behavior.
