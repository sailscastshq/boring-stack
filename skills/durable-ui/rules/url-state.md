---
name: url-state
description: URL query parameter sync patterns — tabs, filters, sorting, pagination, and modal open state
metadata:
  tags: url-state, query-params, pushState, replaceState, filters, tabs, pagination
---

# URL Query Parameter State

URL parameters make UI state **shareable** and **bookmarkable**. When state belongs in the URL, any user clicking the link sees the same view. Use URL state for navigation context: tabs, filters, sorting, pagination, and open sections.

## pushState vs replaceState

```js
// pushState — creates a new history entry (user can press Back)
window.history.pushState({}, '', '?tab=billing')

// replaceState — updates current entry silently (no new Back step)
window.history.replaceState({}, '', '?search=john')
```

| Use `pushState` for  | Use `replaceState` for   |
| -------------------- | ------------------------ |
| Tab switches         | Search input (typing)    |
| Page navigation      | Sort direction toggle    |
| Major filter changes | Minor filter refinements |

## Tabs Pattern

Tabs are the most common URL state pattern: `/settings?tab=billing`

### React

```jsx
import { useState, useEffect, useCallback } from 'react'

function SettingsPage() {
  const [tab, setTab] = useQueryState('tab', 'profile')

  return (
    <div>
      <nav className="flex gap-4 border-b">
        {['profile', 'security', 'billing', 'team'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t ? 'border-b-2 border-blue-500 font-semibold' : ''
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>
      <div className="mt-6">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'billing' && <BillingTab />}
        {tab === 'team' && <TeamTab />}
      </div>
    </div>
  )
}
```

### Vue

```vue
<script setup>
import { useQueryState } from '~/composables/queryState'

const tab = useQueryState('tab', 'profile')
const tabs = ['profile', 'security', 'billing', 'team']
</script>

<template>
  <div>
    <nav class="flex gap-4 border-b">
      <button
        v-for="t in tabs"
        :key="t"
        @click="tab = t"
        :class="tab === t ? 'border-b-2 border-blue-500 font-semibold' : ''"
      >
        {{ t.charAt(0).toUpperCase() + t.slice(1) }}
      </button>
    </nav>
    <div class="mt-6">
      <ProfileTab v-if="tab === 'profile'" />
      <SecurityTab v-if="tab === 'security'" />
      <BillingTab v-if="tab === 'billing'" />
      <TeamTab v-if="tab === 'team'" />
    </div>
  </div>
</template>
```

### Svelte

```svelte
<script>
  import { queryStateStore } from '$lib/stores/queryState'

  const tab = queryStateStore('tab', 'profile')
  const tabs = ['profile', 'security', 'billing', 'team']
</script>

<nav class="flex gap-4 border-b">
  {#each tabs as t}
    <button
      onclick={() => $tab = t}
      class={$tab === t ? 'border-b-2 border-blue-500 font-semibold' : ''}
    >
      {t.charAt(0).toUpperCase() + t.slice(1)}
    </button>
  {/each}
</nav>

<div class="mt-6">
  {#if $tab === 'profile'}<ProfileTab />{/if}
  {#if $tab === 'security'}<SecurityTab />{/if}
  {#if $tab === 'billing'}<BillingTab />{/if}
  {#if $tab === 'team'}<TeamTab />{/if}
</div>
```

## Filters and Sorting

Filters produce URLs like `/users?search=john&role=admin&sort=name&dir=asc`:

### React

```jsx
function UsersPage({ users }) {
  const [search, setSearch] = useQueryState('search', '', { replace: true })
  const [role, setRole] = useQueryState('role', '')
  const [sort, setSort] = useQueryState('sort', 'name')
  const [dir, setDir] = useQueryState('dir', 'asc')

  // Client-side filtering (for already-loaded data)
  const filtered = users
    .filter(
      (u) => !search || u.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((u) => !role || u.role === role)
    .sort((a, b) => {
      const cmp = a[sort]?.localeCompare?.(b[sort]) ?? 0
      return dir === 'asc' ? cmp : -cmp
    })

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <button onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
          Sort {dir === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      <ul>
        {filtered.map((user) => (
          <li key={user.id}>
            {user.name} — {user.role}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Server-Side Filtering with Inertia

When filters require server re-queries, combine URL state with Inertia navigation:

### React

```jsx
import { router } from '@inertiajs/react'
import { useCallback, useRef } from 'react'

function UsersPage({ users, filters }) {
  const debounceRef = useRef(null)

  const updateFilters = useCallback(
    (newFilters) => {
      // Merge with existing filters, remove empty values
      const params = { ...filters, ...newFilters }
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k]
      })

      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        router.get('/users', params, {
          preserveState: true,
          preserveScroll: true,
          replace: true
        })
      }, 300)
    },
    [filters]
  )

  return (
    <input
      type="text"
      defaultValue={filters.search}
      onChange={(e) => updateFilters({ search: e.target.value })}
      placeholder="Search..."
    />
  )
}
```

### Vue

```vue
<script setup>
import { router } from '@inertiajs/vue3'
import { ref, watch } from 'vue'

const props = defineProps({ users: Array, filters: Object })
const search = ref(props.filters.search || '')

let debounceTimer
watch(search, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    router.get(
      '/users',
      { ...props.filters, search: value || undefined },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true
      }
    )
  }, 300)
})
</script>
```

## Pagination

Pagination URLs: `/users?page=3`

### React

```jsx
function Pagination({ currentPage, totalPages }) {
  const [page, setPage] = useQueryState('page', '1')

  return (
    <nav className="flex gap-2">
      <button
        disabled={currentPage <= 1}
        onClick={() => setPage(String(currentPage - 1))}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => setPage(String(currentPage + 1))}
      >
        Next
      </button>
    </nav>
  )
}
```

For server-driven pagination, use Inertia:

```jsx
function Pagination({ currentPage, totalPages }) {
  const goToPage = (page) => {
    router.get(
      window.location.pathname,
      { page },
      {
        preserveState: true,
        preserveScroll: true
      }
    )
  }
  // ...
}
```

## Modal and Accordion Open State

Track which section or modal is open via URL: `/faq?open=pricing`

### React

```jsx
function FAQ({ sections }) {
  const [open, setOpen] = useQueryState('open', '')

  return (
    <div>
      {sections.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => setOpen(open === section.id ? '' : section.id)}
            className="w-full text-left font-semibold py-2"
          >
            {section.title}
            <span className="float-right">
              {open === section.id ? '−' : '+'}
            </span>
          </button>
          {open === section.id && (
            <div className="pb-4 text-gray-600">{section.content}</div>
          )}
        </div>
      ))}
    </div>
  )
}
```

## URL Hygiene: Omit Default Values

Don't clutter the URL with default values. Only include parameters that differ from defaults:

```js
// WRONG — cluttered URL
/users?search=&role=&sort=name&dir=asc&page=1

// RIGHT — clean URL (only non-default values)
/users
/users?search=john
/users?role=admin&page=2
```

Implementation pattern:

```js
function buildQueryString(params, defaults = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    // Only include if non-empty and different from default
    if (value && value !== defaults[key]) {
      search.set(key, value)
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
```

## Reading URL Parameters on Mount

All query state hooks need to read the current URL on mount and listen for `popstate` (browser back/forward):

```js
// Read current params
function getParam(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue
  const params = new URLSearchParams(window.location.search)
  return params.get(key) ?? defaultValue
}

// Listen for back/forward navigation
window.addEventListener('popstate', () => {
  // Re-read params from URL and update state
})
```

The framework-specific `useQueryState` / `queryStateStore` implementations in the react.md, vue.md, and svelte.md rules handle this automatically.
