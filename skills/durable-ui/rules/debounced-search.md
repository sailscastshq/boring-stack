---
name: debounced-search
description: Debounced search with URL sync, loading states, empty states, and server-side search via Inertia — reusable hooks for React, Vue, and Svelte
metadata:
  tags: debounced-search, debounce, search, filter, url-sync, loading-state, empty-state, inertia, replaceState, cancel-request
---

# Debounced Search

Debounced search prevents firing a search on every keystroke. Instead, it waits until the user pauses typing before executing the search. This avoids flooding the server with requests, reduces UI flicker, and keeps the interface responsive.

## Architecture

```
User types into search input
        |
        v
  Debounce (300ms)
        |
        v
  Update URL with replaceState (shareable link)
        |
        +--> Client-side: filter already-loaded data
        |         |
        |         +--> Show results
        |         +--> Show "No results" empty state
        |
        +--> Server-side: router.get() via Inertia
                  |
                  +--> Cancel previous in-flight request
                  +--> Show loading spinner
                  +--> Server queries database
                  +--> Inertia returns new props
                  +--> Show results or empty state
```

## useDebounce Primitive

A reusable debounce hook that takes a value and delay, returning the debounced value. Use this as a building block for both client-side and server-side search.

### React

```jsx
// assets/js/hooks/useDebounce.js
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

**Usage**:

```jsx
import { useState } from 'react'
import { useDebounce } from '~/hooks/useDebounce'

function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  // debouncedQuery updates 300ms after the user stops typing
  useEffect(() => {
    if (debouncedQuery) {
      console.log('Search for:', debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### Vue

```js
// assets/js/composables/debounce.js
import { ref, watch, onUnmounted } from 'vue'

export function useDebounce(valueRef, delay = 300) {
  const debouncedValue = ref(valueRef.value)
  let timer

  watch(valueRef, (newValue) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  onUnmounted(() => clearTimeout(timer))

  return debouncedValue
}
```

**Usage**:

```vue
<script setup>
import { ref, watch } from 'vue'
import { useDebounce } from '~/composables/debounce'

const query = ref('')
const debouncedQuery = useDebounce(query, 300)

watch(debouncedQuery, (value) => {
  if (value) {
    console.log('Search for:', value)
  }
})
</script>

<template>
  <input v-model="query" type="text" placeholder="Search..." />
</template>
```

### Svelte

```js
// assets/js/stores/debounce.js
import { writable } from 'svelte/store'

export function createDebouncedValue(initial = '', delay = 300) {
  const immediate = writable(initial)
  const debounced = writable(initial)
  let timer

  immediate.subscribe((value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.set(value)
    }, delay)
  })

  return {
    // Set the immediate value (call this on input)
    set: immediate.set,
    // Subscribe to the debounced value
    subscribe: debounced.subscribe,
    // Access the immediate store for binding
    immediate
  }
}
```

**Usage with Svelte 5 runes** (preferred approach without a store):

```svelte
<script>
  let query = $state('')
  let debouncedQuery = $state('')
  let timer

  $effect(() => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedQuery = query
    }, 300)
    return () => clearTimeout(timer)
  })

  $effect(() => {
    if (debouncedQuery) {
      console.log('Search for:', debouncedQuery)
    }
  })
</script>

<input type="text" bind:value={query} placeholder="Search..." />
```

## Client-Side Search

Filter already-loaded data without a server round-trip. Debounce the filter input, sync the query to the URL with `replaceState`, and show result counts and empty states.

### React

```jsx
// assets/js/pages/Users/Index.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from '~/hooks/useDebounce'

function getInitialSearch() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('search') || ''
}

export default function UsersPage({ users }) {
  const [search, setSearch] = useState(getInitialSearch)
  const debouncedSearch = useDebounce(search, 300)

  // Sync debounced value to URL with replaceState
  useEffect(() => {
    const url = new URL(window.location)
    if (debouncedSearch) {
      url.searchParams.set('search', debouncedSearch)
    } else {
      url.searchParams.delete('search')
    }
    window.history.replaceState({}, '', url)
  }, [debouncedSearch])

  // Filter users based on debounced search
  const filtered = useMemo(() => {
    if (!debouncedSearch) return users
    const q = debouncedSearch.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
    )
  }, [users, debouncedSearch])

  const clearSearch = useCallback(() => setSearch(''), [])

  return (
    <div>
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        {debouncedSearch && <span> for "{debouncedSearch}"</span>}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No users found</p>
          <p className="mt-1">
            Try a different search term or{' '}
            <button onClick={clearSearch} className="text-blue-600 underline">
              clear the search
            </button>
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {filtered.map((user) => (
            <li key={user.id} className="py-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Vue

```vue
<!-- assets/js/pages/Users/Index.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDebounce } from '~/composables/debounce'

const props = defineProps({ users: Array })

const search = ref('')
const debouncedSearch = useDebounce(search, 300)

// Read initial search from URL
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const initial = params.get('search')
  if (initial) search.value = initial
})

// Sync debounced value to URL with replaceState
watch(debouncedSearch, (value) => {
  const url = new URL(window.location)
  if (value) {
    url.searchParams.set('search', value)
  } else {
    url.searchParams.delete('search')
  }
  window.history.replaceState({}, '', url)
})

const filtered = computed(() => {
  if (!debouncedSearch.value) return props.users
  const q = debouncedSearch.value.toLowerCase()
  return props.users.filter(
    (user) =>
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
  )
})

function clearSearch() {
  search.value = ''
}
</script>

<template>
  <div>
    <div class="relative mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search users..."
        class="w-full px-4 py-2 border rounded-lg"
      />
      <button
        v-if="search"
        @click="clearSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        Clear
      </button>
    </div>

    <p class="text-sm text-gray-500 mb-4">
      {{ filtered.length }} {{ filtered.length === 1 ? 'result' : 'results' }}
      <span v-if="debouncedSearch">for "{{ debouncedSearch }}"</span>
    </p>

    <div v-if="filtered.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg font-medium">No users found</p>
      <p class="mt-1">
        Try a different search term or
        <button @click="clearSearch" class="text-blue-600 underline">
          clear the search
        </button>
      </p>
    </div>

    <ul v-else class="divide-y">
      <li v-for="user in filtered" :key="user.id" class="py-3">
        <p class="font-medium">{{ user.name }}</p>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
      </li>
    </ul>
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/pages/Users/Index.svelte -->
<script>
  import { onMount } from 'svelte'

  let { users } = $props()

  let search = $state('')
  let debouncedSearch = $state('')
  let timer

  // Read initial search from URL
  onMount(() => {
    const params = new URLSearchParams(window.location.search)
    const initial = params.get('search')
    if (initial) search = initial
  })

  // Debounce search input
  $effect(() => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedSearch = search
    }, 300)
    return () => clearTimeout(timer)
  })

  // Sync debounced value to URL with replaceState
  $effect(() => {
    const url = new URL(window.location)
    if (debouncedSearch) {
      url.searchParams.set('search', debouncedSearch)
    } else {
      url.searchParams.delete('search')
    }
    window.history.replaceState({}, '', url)
  })

  let filtered = $derived(() => {
    if (!debouncedSearch) return users
    const q = debouncedSearch.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
    )
  })

  function clearSearch() {
    search = ''
  }
</script>

<div>
  <div class="relative mb-4">
    <input
      type="text"
      bind:value={search}
      placeholder="Search users..."
      class="w-full px-4 py-2 border rounded-lg"
    />
    {#if search}
      <button
        onclick={clearSearch}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        Clear
      </button>
    {/if}
  </div>

  <p class="text-sm text-gray-500 mb-4">
    {filtered().length} {filtered().length === 1 ? 'result' : 'results'}
    {#if debouncedSearch}
      <span>for "{debouncedSearch}"</span>
    {/if}
  </p>

  {#if filtered().length === 0}
    <div class="text-center py-12 text-gray-500">
      <p class="text-lg font-medium">No users found</p>
      <p class="mt-1">
        Try a different search term or
        <button onclick={clearSearch} class="text-blue-600 underline">
          clear the search
        </button>
      </p>
    </div>
  {:else}
    <ul class="divide-y">
      {#each filtered() as user (user.id)}
        <li class="py-3">
          <p class="font-medium">{user.name}</p>
          <p class="text-sm text-gray-500">{user.email}</p>
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

## Server-Side Search with Inertia

When the dataset is too large to load entirely on the client, search on the server using Inertia's `router.get()`. Debounce before sending the request, show a loading spinner during the round-trip, and cancel stale requests when the user keeps typing.

Key principles:

- **Debounce 300ms** before calling `router.get()`
- **`preserveState: true`** keeps component state (input focus, scroll position)
- **`replace: true`** uses `replaceState` instead of `pushState` (avoids polluting browser history)
- **Cancel previous requests** so stale responses never overwrite newer results
- **Minimum query length** (2 characters) prevents searching on single characters

### React

```jsx
// assets/js/pages/Users/Index.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { router, usePage } from '@inertiajs/react'

function getInitialSearch() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('search') || ''
}

export default function UsersPage({ users, search: serverSearch }) {
  const [search, setSearch] = useState(serverSearch || getInitialSearch())
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const abortControllerRef = useRef(null)

  const performSearch = useCallback((value) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Skip server request for very short queries
    if (value.length > 0 && value.length < 2) return

    abortControllerRef.current = new AbortController()

    setLoading(true)
    router.get('/users', value ? { search: value } : {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      signal: abortControllerRef.current.signal,
      onFinish: () => setLoading(false)
    })
  }, [])

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      performSearch(search)
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [search, performSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  function clearSearch() {
    setSearch('')
  }

  return (
    <div>
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        )}
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {users.length} {users.length === 1 ? 'result' : 'results'}
        {search && <span> for "{search}"</span>}
      </p>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No users found</p>
          <p className="mt-1">
            Try a different search term or{' '}
            <button onClick={clearSearch} className="text-blue-600 underline">
              clear the search
            </button>
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {users.map((user) => (
            <li key={user.id} className="py-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Vue

```vue
<!-- assets/js/pages/Users/Index.vue -->
<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { router } from '@inertiajs/vue3'

const props = defineProps({
  users: Array,
  search: { type: String, default: '' }
})

const query = ref(props.search || '')
const loading = ref(false)
let debounceTimer
let abortController

function performSearch(value) {
  // Cancel any in-flight request
  if (abortController) {
    abortController.abort()
  }

  // Skip server request for very short queries
  if (value.length > 0 && value.length < 2) return

  abortController = new AbortController()

  loading.value = true
  router.get('/users', value ? { search: value } : {}, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
    signal: abortController.signal,
    onFinish: () => {
      loading.value = false
    }
  })
}

watch(query, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch(value)
  }, 300)
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  if (abortController) abortController.abort()
})

function clearSearch() {
  query.value = ''
}
</script>

<template>
  <div>
    <div class="relative mb-4">
      <input
        v-model="query"
        type="text"
        placeholder="Search users..."
        class="w-full px-4 py-2 border rounded-lg"
      />
      <div v-if="loading" class="absolute right-10 top-1/2 -translate-y-1/2">
        <div
          class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        />
      </div>
      <button
        v-if="query"
        @click="clearSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        Clear
      </button>
    </div>

    <p class="text-sm text-gray-500 mb-4">
      {{ users.length }} {{ users.length === 1 ? 'result' : 'results' }}
      <span v-if="query">for "{{ query }}"</span>
    </p>

    <div v-if="users.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg font-medium">No users found</p>
      <p class="mt-1">
        Try a different search term or
        <button @click="clearSearch" class="text-blue-600 underline">
          clear the search
        </button>
      </p>
    </div>

    <ul v-else class="divide-y">
      <li v-for="user in users" :key="user.id" class="py-3">
        <p class="font-medium">{{ user.name }}</p>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
      </li>
    </ul>
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/pages/Users/Index.svelte -->
<script>
  import { router } from '@inertiajs/svelte'

  let { users, search: serverSearch = '' } = $props()

  let query = $state(serverSearch)
  let loading = $state(false)
  let debounceTimer
  let abortController

  function performSearch(value) {
    // Cancel any in-flight request
    if (abortController) {
      abortController.abort()
    }

    // Skip server request for very short queries
    if (value.length > 0 && value.length < 2) return

    abortController = new AbortController()

    loading = true
    router.get(
      '/users',
      value ? { search: value } : {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        signal: abortController.signal,
        onFinish: () => {
          loading = false
        }
      }
    )
  }

  // Debounce and trigger search
  $effect(() => {
    const value = query
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      performSearch(value)
    }, 300)
    return () => clearTimeout(debounceTimer)
  })

  function clearSearch() {
    query = ''
  }
</script>

<div>
  <div class="relative mb-4">
    <input
      type="text"
      bind:value={query}
      placeholder="Search users..."
      class="w-full px-4 py-2 border rounded-lg"
    />
    {#if loading}
      <div class="absolute right-10 top-1/2 -translate-y-1/2">
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    {/if}
    {#if query}
      <button
        onclick={clearSearch}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        Clear
      </button>
    {/if}
  </div>

  <p class="text-sm text-gray-500 mb-4">
    {users.length} {users.length === 1 ? 'result' : 'results'}
    {#if query}
      <span>for "{query}"</span>
    {/if}
  </p>

  {#if users.length === 0}
    <div class="text-center py-12 text-gray-500">
      <p class="text-lg font-medium">No users found</p>
      <p class="mt-1">
        Try a different search term or
        <button onclick={clearSearch} class="text-blue-600 underline">
          clear the search
        </button>
      </p>
    </div>
  {:else}
    <ul class="divide-y">
      {#each users as user (user.id)}
        <li class="py-3">
          <p class="font-medium">{user.name}</p>
          <p class="text-sm text-gray-500">{user.email}</p>
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

## Sails.js Server Action

The server action receives the search query, applies it to a Waterline query, and returns filtered results as Inertia props:

```js
// api/controllers/users/list.js
module.exports = {
  friendlyName: 'List users',

  inputs: {
    search: {
      type: 'string',
      defaultsTo: ''
    }
  },

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function ({ search }) {
    let criteria = {}

    if (search && search.length >= 2) {
      criteria = {
        or: [{ name: { contains: search } }, { email: { contains: search } }]
      }
    }

    const users = await User.find(criteria).sort('name ASC')

    return {
      page: 'users/index',
      props: {
        users,
        search
      }
    }
  }
}
```

For larger datasets, add pagination alongside search:

```js
// api/controllers/users/list.js
module.exports = {
  friendlyName: 'List users',

  inputs: {
    search: {
      type: 'string',
      defaultsTo: ''
    },
    page: {
      type: 'number',
      defaultsTo: 1,
      min: 1
    }
  },

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function ({ search, page }) {
    const perPage = 25
    let criteria = {}

    if (search && search.length >= 2) {
      criteria = {
        or: [{ name: { contains: search } }, { email: { contains: search } }]
      }
    }

    const [users, total] = await Promise.all([
      User.find(criteria)
        .sort('name ASC')
        .skip((page - 1) * perPage)
        .limit(perPage),
      User.count(criteria)
    ])

    return {
      page: 'users/index',
      props: {
        users,
        search,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage)
        }
      }
    }
  }
}
```

## Complete Searchable Page Example

A full page combining debounced search, URL sync via Inertia, loading indicator, empty state, result count, and a clear button. This is the recommended pattern for server-side search.

### React

```jsx
// assets/js/pages/Users/Index.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Head, Link, router } from '@inertiajs/react'

export default function UsersIndex({
  users,
  search: serverSearch,
  pagination
}) {
  const [search, setSearch] = useState(serverSearch || '')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const abortControllerRef = useRef(null)
  const inputRef = useRef(null)

  const performSearch = useCallback((value) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (value.length > 0 && value.length < 2) return

    abortControllerRef.current = new AbortController()
    setLoading(true)

    const params = {}
    if (value) params.search = value

    router.get('/users', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      signal: abortControllerRef.current.signal,
      onFinish: () => setLoading(false)
    })
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      performSearch(search)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, performSearch])

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  function clearSearch() {
    setSearch('')
    inputRef.current?.focus()
  }

  return (
    <>
      <Head title="Users" />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        {/* Search input */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            )}
            {search && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500 mb-4">
          {pagination ? (
            <>
              Showing {users.length} of {pagination.total}{' '}
              {pagination.total === 1 ? 'user' : 'users'}
            </>
          ) : (
            <>
              {users.length} {users.length === 1 ? 'user' : 'users'}
            </>
          )}
          {search && <span> matching "{search}"</span>}
        </p>

        {/* Results or empty state */}
        {users.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg font-medium">No users found</p>
            <p className="mt-1">
              No results for "{search}".{' '}
              <button onClick={clearSearch} className="text-blue-600 underline">
                Clear search
              </button>
            </p>
          </div>
        ) : (
          <ul className="divide-y border rounded-lg">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-3 hover:bg-gray-50">
                <Link href={`/users/${user.id}`} className="block">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
```

### Vue

```vue
<!-- assets/js/pages/Users/Index.vue -->
<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { Head, Link, router } from '@inertiajs/vue3'

const props = defineProps({
  users: Array,
  search: { type: String, default: '' },
  pagination: { type: Object, default: null }
})

const query = ref(props.search || '')
const loading = ref(false)
const inputRef = ref(null)
let debounceTimer
let abortController

function performSearch(value) {
  if (abortController) abortController.abort()
  if (value.length > 0 && value.length < 2) return

  abortController = new AbortController()
  loading.value = true

  const params = {}
  if (value) params.search = value

  router.get('/users', params, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
    signal: abortController.signal,
    onFinish: () => {
      loading.value = false
    }
  })
}

watch(query, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch(value)
  }, 300)
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  if (abortController) abortController.abort()
})

function clearSearch() {
  query.value = ''
  inputRef.value?.focus()
}
</script>

<template>
  <Head title="Users" />
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">Users</h1>

    <!-- Search input -->
    <div class="relative mb-6">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="Search by name or email..."
        class="w-full pl-10 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div
        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
      >
        <div
          v-if="loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        />
        <button
          v-if="query"
          @click="clearSearch"
          class="text-gray-400 hover:text-gray-600 text-sm"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Result count -->
    <p class="text-sm text-gray-500 mb-4">
      <template v-if="pagination">
        Showing {{ users.length }} of {{ pagination.total }}
        {{ pagination.total === 1 ? 'user' : 'users' }}
      </template>
      <template v-else>
        {{ users.length }} {{ users.length === 1 ? 'user' : 'users' }}
      </template>
      <span v-if="query"> matching "{{ query }}"</span>
    </p>

    <!-- Empty state -->
    <div v-if="users.length === 0" class="text-center py-16 text-gray-500">
      <svg
        class="mx-auto h-12 w-12 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p class="text-lg font-medium">No users found</p>
      <p class="mt-1">
        No results for "{{ query }}".
        <button @click="clearSearch" class="text-blue-600 underline">
          Clear search
        </button>
      </p>
    </div>

    <!-- Results list -->
    <ul v-else class="divide-y border rounded-lg">
      <li
        v-for="user in users"
        :key="user.id"
        class="px-4 py-3 hover:bg-gray-50"
      >
        <Link :href="`/users/${user.id}`" class="block">
          <p class="font-medium">{{ user.name }}</p>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </Link>
      </li>
    </ul>
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/pages/Users/Index.svelte -->
<script>
  import { router } from '@inertiajs/svelte'

  let { users, search: serverSearch = '', pagination = null } = $props()

  let query = $state(serverSearch)
  let loading = $state(false)
  let debounceTimer
  let abortController
  let inputEl

  function performSearch(value) {
    if (abortController) abortController.abort()
    if (value.length > 0 && value.length < 2) return

    abortController = new AbortController()
    loading = true

    const params = {}
    if (value) params.search = value

    router.get('/users', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      signal: abortController.signal,
      onFinish: () => {
        loading = false
      }
    })
  }

  $effect(() => {
    const value = query
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      performSearch(value)
    }, 300)
    return () => clearTimeout(debounceTimer)
  })

  function clearSearch() {
    query = ''
    inputEl?.focus()
  }
</script>

<svelte:head>
  <title>Users</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-8 px-4">
  <h1 class="text-2xl font-bold mb-6">Users</h1>

  <!-- Search input -->
  <div class="relative mb-6">
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      bind:this={inputEl}
      type="text"
      bind:value={query}
      placeholder="Search by name or email..."
      class="w-full pl-10 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
      {#if loading}
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      {/if}
      {#if query}
        <button
          onclick={clearSearch}
          class="text-gray-400 hover:text-gray-600 text-sm"
        >
          Clear
        </button>
      {/if}
    </div>
  </div>

  <!-- Result count -->
  <p class="text-sm text-gray-500 mb-4">
    {#if pagination}
      Showing {users.length} of {pagination.total}
      {pagination.total === 1 ? 'user' : 'users'}
    {:else}
      {users.length} {users.length === 1 ? 'user' : 'users'}
    {/if}
    {#if query}
      <span>matching "{query}"</span>
    {/if}
  </p>

  <!-- Empty state -->
  {#if users.length === 0}
    <div class="text-center py-16 text-gray-500">
      <svg
        class="mx-auto h-12 w-12 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p class="text-lg font-medium">No users found</p>
      <p class="mt-1">
        No results for "{query}".
        <button onclick={clearSearch} class="text-blue-600 underline">
          Clear search
        </button>
      </p>
    </div>
  {:else}
    <!-- Results list -->
    <ul class="divide-y border rounded-lg">
      {#each users as user (user.id)}
        <li class="px-4 py-3 hover:bg-gray-50">
          <a href={`/users/${user.id}`} class="block">
            <p class="font-medium">{user.name}</p>
            <p class="text-sm text-gray-500">{user.email}</p>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

## Choosing Client-Side vs Server-Side Search

| Factor               | Client-side              | Server-side (Inertia)                    |
| -------------------- | ------------------------ | ---------------------------------------- |
| **Dataset size**     | Small (< 500 items)      | Large or paginated                       |
| **Latency**          | Instant (no network)     | Network round-trip                       |
| **Full-text search** | Basic string matching    | Database-powered (LIKE, full-text index) |
| **URL sync**         | Manual with replaceState | Automatic with router.get                |
| **Loading state**    | Not needed               | Required for good UX                     |
| **Initial load**     | All data sent upfront    | Only current page of data                |

**Rule of thumb**: If you can load all the data on the initial page load without a performance penalty, use client-side filtering. If the dataset is large, paginated, or requires complex queries, use server-side search with Inertia.

## Common Mistakes

1. **Not debouncing** — Firing a search request on every keystroke floods the server. Typing "john" sends 4 requests (`j`, `jo`, `joh`, `john`) instead of 1. Always debounce search inputs.

2. **Debouncing too long or too short** — A 300ms debounce is the sweet spot. Under 150ms barely debounces at all (fast typists trigger multiple requests). Over 500ms feels sluggish and unresponsive. Stick to 250-350ms.

3. **Not syncing search to URL** — If the search query isn't in the URL, users can't bookmark or share filtered results. Always sync to `?search=value`. For client-side search, use `replaceState`. For Inertia, `router.get()` handles this automatically.

4. **Using pushState for every character** — If you use `pushState` instead of `replaceState` while the user types, every debounced character creates a new browser history entry. Typing "john" creates 4 history entries, and the user has to press Back 4 times to leave the page. Always use `replaceState` (or `replace: true` in Inertia) for search inputs.

5. **Not showing loading state** — During a server-side search, the user sees no feedback that their search is being processed. They might type again, thinking the input is broken. Always show a spinner or loading indicator during the request.

6. **Not canceling previous requests** — If a user types "jo", waits for debounce, then types "john", two requests fire. If the "jo" response arrives after the "john" response, the UI shows stale results. Cancel in-flight requests using `AbortController` before starting a new one.

7. **Searching on empty string or single character** — Searching for "" fetches the default unfiltered results, which is a wasted request if you already have them. Searching for a single character ("j") returns too many results to be useful. Set a minimum query length of 2 characters before triggering a server search.
