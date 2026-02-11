---
name: local-storage
description: localStorage persistence patterns for sidebar state, dark mode, dismissed banners, and cross-tab sync
metadata:
  tags: localStorage, dark-mode, sidebar, preferences, cross-tab, storage-event
---

# localStorage Patterns

localStorage is the right choice for **browser-scoped preferences** — state that should persist across page reloads and browser sessions but doesn't need to be shareable via URL or synced across devices.

## Sidebar Collapsed State

The Ascent templates persist sidebar state so it survives navigation:

### React

```jsx
import { useLocalStorage } from '~/hooks/useLocalStorage'

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useLocalStorage(
    'ASCENT_SIDEBAR_COLLAPSED',
    false
  )

  return (
    <div className="flex">
      <aside className={collapsed ? 'w-16' : 'w-64'}>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
        {!collapsed && <nav>{/* nav items */}</nav>}
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### Vue

```vue
<script setup>
import { useLocalStorage } from '~/composables/localStorage'

const collapsed = useLocalStorage('ASCENT_SIDEBAR_COLLAPSED', false)
</script>

<template>
  <div class="flex">
    <aside :class="collapsed ? 'w-16' : 'w-64'">
      <button @click="collapsed = !collapsed">
        {{ collapsed ? '→' : '←' }}
      </button>
      <nav v-if="!collapsed"><!-- nav items --></nav>
    </aside>
    <main class="flex-1"><slot /></main>
  </div>
</template>
```

### Svelte

```svelte
<script>
  import { localStorageStore } from '$lib/stores/localStorage'

  const collapsed = localStorageStore('ASCENT_SIDEBAR_COLLAPSED', false)
</script>

<div class="flex">
  <aside class={$collapsed ? 'w-16' : 'w-64'}>
    <button onclick={() => $collapsed = !$collapsed}>
      {$collapsed ? '→' : '←'}
    </button>
    {#if !$collapsed}
      <nav><!-- nav items --></nav>
    {/if}
  </aside>
  <main class="flex-1"><slot /></main>
</div>
```

## Dark Mode Preference

Dark mode has three states: `light`, `dark`, and `system` (follows OS preference). The Ascent templates implement this with a `matchMedia` listener for system changes:

### React

```jsx
import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    return localStorage.getItem('darkModePreference') || 'system'
  })

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const pref = localStorage.getItem('darkModePreference')
    if (pref === 'dark') return true
    if (pref === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') {
      const systemDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      root.classList.toggle('dark', systemDark)
      setIsDark(systemDark)
    } else {
      root.classList.toggle('dark', mode === 'dark')
      setIsDark(mode === 'dark')
    }
  }, [mode])

  // Listen to OS preference changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      setIsDark(e.matches)
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const toggleDarkMode = () => {
    const newMode = isDark ? 'light' : 'dark'
    setMode(newMode)
    localStorage.setItem('darkModePreference', newMode)
  }

  const setSystemMode = () => {
    setMode('system')
    localStorage.removeItem('darkModePreference')
  }

  return { isDark, toggleDarkMode, setSystemMode, mode }
}
```

### Vue

```vue
<script setup>
import { useDarkMode } from '~/composables/darkMode'

const { isDark, toggleDarkMode, setSystemMode, mode } = useDarkMode()
</script>

<template>
  <button @click="toggleDarkMode">
    {{ isDark ? '☀️' : '🌙' }}
  </button>
  <button @click="setSystemMode" :class="{ active: mode === 'system' }">
    System
  </button>
</template>
```

### Svelte

```svelte
<script>
  import { localStorageStore } from '$lib/stores/localStorage'
  import { derived } from 'svelte/store'
  import { onMount } from 'svelte'

  const mode = localStorageStore('darkModePreference', 'system')
  let systemDark = $state(false)

  onMount(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark = mq.matches
    mq.addEventListener('change', (e) => systemDark = e.matches)
  })

  $effect(() => {
    const dark = $mode === 'dark' || ($mode === 'system' && systemDark)
    document.documentElement.classList.toggle('dark', dark)
  })
</script>
```

## Dismissed Banners and Onboarding Steps

Track which banners or tips the user has dismissed:

### React

```jsx
function WelcomeBanner() {
  const [dismissed, setDismissed] = useLocalStorage(
    'ASCENT_DISMISSED_BANNERS',
    []
  )

  if (dismissed.includes('welcome')) return null

  return (
    <div className="bg-blue-50 p-4 rounded-lg flex justify-between">
      <p>Welcome to your new app! Here's how to get started...</p>
      <button onClick={() => setDismissed([...dismissed, 'welcome'])}>
        Dismiss
      </button>
    </div>
  )
}
```

### Vue

```vue
<script setup>
import { useLocalStorage } from '~/composables/localStorage'
import { computed } from 'vue'

const dismissed = useLocalStorage('ASCENT_DISMISSED_BANNERS', [])
const showBanner = computed(() => !dismissed.value.includes('welcome'))

function dismiss() {
  dismissed.value = [...dismissed.value, 'welcome']
}
</script>

<template>
  <div v-if="showBanner" class="bg-blue-50 p-4 rounded-lg flex justify-between">
    <p>Welcome to your new app! Here's how to get started...</p>
    <button @click="dismiss">Dismiss</button>
  </div>
</template>
```

### Svelte

```svelte
<script>
  import { localStorageStore } from '$lib/stores/localStorage'

  const dismissed = localStorageStore('ASCENT_DISMISSED_BANNERS', [])
  const showBanner = $derived(!$dismissed.includes('welcome'))

  function dismiss() {
    $dismissed = [...$dismissed, 'welcome']
  }
</script>

{#if showBanner}
  <div class="bg-blue-50 p-4 rounded-lg flex justify-between">
    <p>Welcome to your new app! Here's how to get started...</p>
    <button onclick={dismiss}>Dismiss</button>
  </div>
{/if}
```

## Table Column Visibility

Let users customize which columns are visible in data tables:

### React

```jsx
function UsersTable({ users }) {
  const allColumns = ['name', 'email', 'role', 'created', 'status']
  const [visible, setVisible] = useLocalStorage(
    'ASCENT_USERS_COLUMNS',
    allColumns
  )

  const toggleColumn = (col) => {
    setVisible((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        {allColumns.map((col) => (
          <label key={col} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={visible.includes(col)}
              onChange={() => toggleColumn(col)}
            />
            {col}
          </label>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            {visible.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              {visible.map((col) => (
                <td key={col}>{user[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
```

## Cross-Tab Synchronization

When a user changes a preference in one tab, other tabs should update. The `storage` event fires when localStorage is modified by **another tab** in the same origin:

### React

```jsx
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // Listen for changes from other tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch {
          setStoredValue(e.newValue)
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, initialValue])

  const setValue = useCallback(
    (value) => {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}
```

### Vue

```js
import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = ref(initialValue)

  onMounted(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) storedValue.value = JSON.parse(item)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  })

  watch(storedValue, (newValue) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  })

  // Cross-tab sync
  function onStorage(e) {
    if (e.key === key && e.newValue !== null) {
      try {
        storedValue.value = JSON.parse(e.newValue)
      } catch {}
    }
  }

  onMounted(() => window.addEventListener('storage', onStorage))
  onUnmounted(() => window.removeEventListener('storage', onStorage))

  return storedValue
}
```

### Svelte

```js
import { writable } from 'svelte/store'
import { browser } from '$app/environment' // SvelteKit check; for Inertia use typeof window !== 'undefined'

export function localStorageStore(key, initialValue) {
  const isBrowser = typeof window !== 'undefined'

  let initial = initialValue
  if (isBrowser) {
    try {
      const item = window.localStorage.getItem(key)
      if (item) initial = JSON.parse(item)
    } catch {}
  }

  const store = writable(initial)

  if (isBrowser) {
    store.subscribe((value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    })

    // Cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          store.set(JSON.parse(e.newValue))
        } catch {}
      }
    })
  }

  return store
}
```

## Error Handling and Storage Limits

localStorage has a ~5MB limit. When the quota is exceeded, `setItem` throws a `QuotaExceededError`:

```js
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Attempt cleanup: remove expired drafts or old preferences
      cleanupExpiredDrafts()
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch {
        console.error('localStorage is full even after cleanup')
        return false
      }
    }
    console.warn('localStorage error:', error)
    return false
  }
}

function cleanupExpiredDrafts() {
  const now = Date.now()
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith('ASCENT_DRAFT_')) {
      try {
        const draft = JSON.parse(localStorage.getItem(key))
        if (draft?.expiresAt && draft.expiresAt < now) {
          localStorage.removeItem(key)
        }
      } catch {
        localStorage.removeItem(key)
      }
    }
  }
}
```

## Private/Incognito Mode

In most browsers, localStorage works in private/incognito mode but is cleared when the window closes. Safari historically had a 0-byte quota in private mode (fixed in modern versions). Always use try/catch to handle gracefully.
