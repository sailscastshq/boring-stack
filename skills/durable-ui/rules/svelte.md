---
name: svelte
description: Complete Svelte store implementations — localStorageStore, queryStateStore, formDraftStore with full page examples
metadata:
  tags: svelte, stores, writable, localStorageStore, queryStateStore, formDraftStore
---

# Svelte Implementations

Complete Svelte 5 store implementations for durable UI patterns. These stores use Svelte's `writable` store contract and integrate with Svelte 5 runes (`$state`, `$derived`, `$effect`). No existing equivalents exist in the templates — these are new implementations.

## localStorageStore

A writable Svelte store backed by localStorage with cross-tab sync:

```js
// assets/js/stores/localStorage.js
import { writable } from 'svelte/store'

export function localStorageStore(key, initialValue) {
  const isBrowser = typeof window !== 'undefined'

  // Read initial value from localStorage
  let initial = initialValue
  if (isBrowser) {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        initial = JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }

  const store = writable(initial)

  if (isBrowser) {
    // Persist to localStorage on every change
    store.subscribe((value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    })

    // Cross-tab sync: update store when another tab changes localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        try {
          const newValue =
            e.newValue !== null ? JSON.parse(e.newValue) : initialValue
          store.set(newValue)
        } catch {}
      }
    })
  }

  return store
}
```

**API**:

- `const collapsed = localStorageStore('MY_KEY', false)` — returns a writable store
- `$collapsed` — read the value (Svelte auto-subscription)
- `$collapsed = true` — update the value (syncs to localStorage)
- `collapsed.set(true)` — programmatic update
- `collapsed.update(v => !v)` — functional update

## queryStateStore

A writable Svelte store synced to a URL query parameter:

```js
// assets/js/stores/queryState.js
import { writable } from 'svelte/store'

export function queryStateStore(key, defaultValue = '', options = {}) {
  const { replace = false } = options
  const isBrowser = typeof window !== 'undefined'

  // Read initial value from URL
  let initial = defaultValue
  if (isBrowser) {
    const params = new URLSearchParams(window.location.search)
    const urlValue = params.get(key)
    if (urlValue !== null) {
      initial = urlValue
    }
  }

  const store = writable(initial)

  if (isBrowser) {
    // Track whether update came from popstate to avoid circular updates
    let isPopState = false

    // Update URL when store value changes
    store.subscribe((value) => {
      if (isPopState) {
        isPopState = false
        return
      }

      const url = new URL(window.location.href)
      if (value && value !== defaultValue) {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }

      const method = replace ? 'replaceState' : 'pushState'
      window.history[method]({}, '', url.toString())
    })

    // Listen for back/forward navigation
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search)
      isPopState = true
      store.set(params.get(key) ?? defaultValue)
    })
  }

  return store
}
```

**API**:

- `const tab = queryStateStore('tab', 'profile')` — returns a writable store
- `$tab` — read the current value
- `$tab = 'billing'` — update URL to `?tab=billing` via pushState
- `queryStateStore('search', '', { replace: true })` — uses replaceState

## formDraftStore

Wraps Inertia `useForm` with localStorage draft persistence:

```js
// assets/js/stores/formDraft.js
export function createFormDraft(draftKey, initialData, options = {}) {
  const { ttl = 24 * 60 * 60 * 1000 } = options
  const isBrowser = typeof window !== 'undefined'

  let hasDraft = false
  let draftSavedAt = null
  let draftData = null

  // Check for existing draft
  if (isBrowser) {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
        } else {
          const hasContent = Object.values(draft.data).some((v) =>
            typeof v === 'string' ? v.trim() : Boolean(v)
          )
          if (hasContent) {
            hasDraft = true
            draftSavedAt = new Date(draft.savedAt)
            draftData = draft.data
          }
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  }

  return {
    hasDraft,
    draftSavedAt,
    draftData,

    saveDraft(data) {
      if (!isBrowser) return
      const hasContent = Object.values(data).some((v) =>
        typeof v === 'string' ? v.trim() : Boolean(v)
      )
      if (hasContent) {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              data,
              savedAt: Date.now(),
              expiresAt: Date.now() + ttl
            })
          )
        } catch {}
      }
    },

    clearDraft() {
      if (isBrowser) localStorage.removeItem(draftKey)
    }
  }
}
```

**Usage in a Svelte component**:

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'
  import { createFormDraft } from '~/stores/formDraft'
  import { onMount } from 'svelte'

  const draftKey = 'ASCENT_DRAFT_POST_CREATE'
  const draft = createFormDraft(draftKey, { title: '', body: '' })

  let showRestore = $state(draft.hasDraft)

  const form = useForm({
    title: '',
    body: ''
  })

  // Debounced auto-save
  let debounceTimer
  $effect(() => {
    const data = { title: $form.title, body: $form.body }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => draft.saveDraft(data), 500)
  })

  function restoreDraft() {
    if (draft.draftData) {
      $form.title = draft.draftData.title
      $form.body = draft.draftData.body
      showRestore = false
    }
  }

  function discardDraft() {
    draft.clearDraft()
    showRestore = false
  }

  function submit(e) {
    e.preventDefault()
    $form.post('/posts', {
      onSuccess: () => draft.clearDraft()
    })
  }
</script>

{#if showRestore}
  <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex justify-between items-center">
    <p>You have an unsaved draft from {draft.draftSavedAt?.toLocaleString()}.</p>
    <div class="flex gap-2">
      <button type="button" onclick={restoreDraft} class="text-amber-700 font-medium">Restore</button>
      <button type="button" onclick={discardDraft} class="text-gray-500">Discard</button>
    </div>
  </div>
{/if}

<form onsubmit={submit}>
  <input bind:value={$form.title} placeholder="Post title" />
  <textarea bind:value={$form.body} placeholder="Write your post..." />
  <button type="submit" disabled={$form.processing}>Publish</button>
</form>
```

## Complete Page Example: Settings with Tabs

```svelte
<!-- assets/js/pages/settings/index.svelte -->
<script>
  import { queryStateStore } from '~/stores/queryState'
  import ProfileTab from './tabs/ProfileTab.svelte'
  import SecurityTab from './tabs/SecurityTab.svelte'
  import BillingTab from './tabs/BillingTab.svelte'
  import TeamTab from './tabs/TeamTab.svelte'

  const tab = queryStateStore('tab', 'profile')

  const tabs = [
    { id: 'profile', label: 'Profile', component: ProfileTab },
    { id: 'security', label: 'Security', component: SecurityTab },
    { id: 'billing', label: 'Billing', component: BillingTab },
    { id: 'team', label: 'Team', component: TeamTab }
  ]

  const activeComponent = $derived(
    tabs.find(t => t.id === $tab)?.component || ProfileTab
  )
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Settings</h1>
  <nav class="flex gap-1 border-b mb-6">
    {#each tabs as t}
      <button
        onclick={() => $tab = t.id}
        class="px-4 py-2 -mb-px text-sm font-medium {$tab === t.id
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'}"
      >
        {t.label}
      </button>
    {/each}
  </nav>
  <svelte:component this={activeComponent} />
</div>
```

## Complete Page Example: Filterable User List

```svelte
<!-- assets/js/pages/users/index.svelte -->
<script>
  import { queryStateStore } from '~/stores/queryState'

  let { users } = $props()

  const search = queryStateStore('search', '', { replace: true })
  const role = queryStateStore('role', '')
  const sort = queryStateStore('sort', 'name')
  const dir = queryStateStore('dir', 'asc')

  const filtered = $derived.by(() => {
    let result = users

    if ($search) {
      const q = $search.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }

    if ($role) {
      result = result.filter(u => u.role === $role)
    }

    return [...result].sort((a, b) => {
      const aVal = a[$sort] || ''
      const bVal = b[$sort] || ''
      const cmp = aVal.localeCompare(bVal)
      return $dir === 'asc' ? cmp : -cmp
    })
  })

  function toggleSort(field) {
    if ($sort === field) {
      $dir = $dir === 'asc' ? 'desc' : 'asc'
    } else {
      $sort = field
      $dir = 'asc'
    }
  }
</script>

<svelte:head>
  <title>Users</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Users</h1>
  <div class="flex gap-4 mb-4">
    <input
      type="text"
      bind:value={$search}
      placeholder="Search by name or email..."
      class="border rounded px-3 py-2 flex-1"
    />
    <select bind:value={$role} class="border rounded px-3 py-2">
      <option value="">All roles</option>
      <option value="owner">Owner</option>
      <option value="admin">Admin</option>
      <option value="member">Member</option>
    </select>
  </div>
  <table class="w-full">
    <thead>
      <tr class="text-left border-b">
        <th class="pb-2 cursor-pointer" onclick={() => toggleSort('name')}>
          Name {$sort === 'name' ? ($dir === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th class="pb-2 cursor-pointer" onclick={() => toggleSort('email')}>
          Email {$sort === 'email' ? ($dir === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th class="pb-2">Role</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as user (user.id)}
        <tr class="border-b">
          <td class="py-2">{user.name}</td>
          <td class="py-2">{user.email}</td>
          <td class="py-2">{user.role}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if filtered.length === 0}
    <p class="text-gray-500 text-center py-8">No users found.</p>
  {/if}
</div>
```
