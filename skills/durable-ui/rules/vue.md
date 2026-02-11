---
name: vue
description: Complete Vue composable implementations — useLocalStorage, useQueryState, useFormDraft with full page examples
metadata:
  tags: vue, composables, useLocalStorage, useQueryState, useFormDraft, ref, watch
---

# Vue Implementations

Complete Vue 3 composable implementations for durable UI patterns. These composables follow Vue conventions (reactive refs, watchers, lifecycle hooks) and are SSR-safe for use with Inertia.js server-side rendering.

## useLocalStorage Composable

Reference implementation from the Ascent Vue template, extended with cross-tab sync:

```js
// assets/js/composables/localStorage.js
import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = ref(initialValue)

  onMounted(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        storedValue.value = JSON.parse(item)
      }
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
    } else if (e.key === key && e.newValue === null) {
      storedValue.value = initialValue
    }
  }

  onMounted(() => window.addEventListener('storage', onStorage))
  onUnmounted(() => window.removeEventListener('storage', onStorage))

  return storedValue
}
```

**API**:

- `const value = useLocalStorage('key', defaultValue)` — returns a reactive ref
- `value.value = newValue` — updates both ref and localStorage
- Reads from localStorage on mount (SSR-safe — no window access during SSR)
- Cross-tab sync via `storage` event

## useQueryState Composable

Syncs a single URL query parameter with a reactive ref:

```js
// assets/js/composables/queryState.js
import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useQueryState(key, defaultValue = '', options = {}) {
  const { replace = false } = options

  const value = ref(defaultValue)

  // Read initial value from URL on mount
  onMounted(() => {
    const params = new URLSearchParams(window.location.search)
    const urlValue = params.get(key)
    if (urlValue !== null) {
      value.value = urlValue
    }
  })

  // Update URL when value changes
  watch(value, (newValue) => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    if (newValue && newValue !== defaultValue) {
      url.searchParams.set(key, newValue)
    } else {
      url.searchParams.delete(key)
    }

    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', url.toString())
  })

  // Listen for back/forward navigation
  function onPopState() {
    const params = new URLSearchParams(window.location.search)
    value.value = params.get(key) ?? defaultValue
  }

  onMounted(() => window.addEventListener('popstate', onPopState))
  onUnmounted(() => window.removeEventListener('popstate', onPopState))

  return value
}
```

**API**:

- `const tab = useQueryState('tab', 'profile')` — returns a writable ref
- `tab.value = 'billing'` — updates URL to `?tab=billing` with pushState
- `useQueryState('search', '', { replace: true })` — uses replaceState
- Default values are omitted from the URL for hygiene

## useFormDraft Composable

Wraps Inertia `useForm` with localStorage persistence:

```js
// assets/js/composables/formDraft.js
import { useForm } from '@inertiajs/vue3'
import { ref, watch, onMounted } from 'vue'

export function useFormDraft(draftKey, initialData, options = {}) {
  const { ttl = 24 * 60 * 60 * 1000 } = options
  const form = useForm(initialData)
  const hasDraft = ref(false)
  const draftSavedAt = ref(null)
  let draftData = null
  let debounceTimer

  // Check for existing draft on mount
  onMounted(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
          return
        }
        const hasContent = Object.values(draft.data).some((v) =>
          typeof v === 'string' ? v.trim() : Boolean(v)
        )
        if (hasContent) {
          hasDraft.value = true
          draftSavedAt.value = new Date(draft.savedAt)
          draftData = draft.data
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  })

  // Debounced auto-save
  watch(
    () => ({ ...form.data }),
    (data) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
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
      }, 500)
    },
    { deep: true }
  )

  function restoreDraft() {
    if (draftData) {
      Object.keys(draftData).forEach((key) => {
        form[key] = draftData[key]
      })
      hasDraft.value = false
    }
  }

  function discardDraft() {
    localStorage.removeItem(draftKey)
    hasDraft.value = false
  }

  function clearDraft() {
    localStorage.removeItem(draftKey)
  }

  return {
    form,
    hasDraft,
    draftSavedAt,
    restoreDraft,
    discardDraft,
    clearDraft
  }
}
```

**API**:

```vue
<script setup>
import { useFormDraft } from '~/composables/formDraft'

const { form, hasDraft, draftSavedAt, restoreDraft, discardDraft, clearDraft } =
  useFormDraft('ASCENT_DRAFT_POST', { title: '', body: '' })

function submit() {
  form.post('/posts', { onSuccess: clearDraft })
}
</script>
```

## Complete Page Example: Settings with Tabs

```vue
<!-- assets/js/pages/settings/index.vue -->
<script setup>
import { Head } from '@inertiajs/vue3'
import { useQueryState } from '~/composables/queryState'
import AppLayout from '~/layouts/AppLayout.vue'
import ProfileTab from './tabs/ProfileTab.vue'
import SecurityTab from './tabs/SecurityTab.vue'
import BillingTab from './tabs/BillingTab.vue'
import TeamTab from './tabs/TeamTab.vue'

defineOptions({ layout: AppLayout })

const tab = useQueryState('tab', 'profile')

const tabs = [
  { id: 'profile', label: 'Profile', component: ProfileTab },
  { id: 'security', label: 'Security', component: SecurityTab },
  { id: 'billing', label: 'Billing', component: BillingTab },
  { id: 'team', label: 'Team', component: TeamTab }
]

const activeTabComponent = $computed(
  () => tabs.find((t) => t.id === tab.value)?.component || ProfileTab
)
</script>

<template>
  <Head title="Settings" />
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>
    <nav class="flex gap-1 border-b mb-6">
      <button
        v-for="t in tabs"
        :key="t.id"
        @click="tab = t.id"
        :class="[
          'px-4 py-2 -mb-px text-sm font-medium',
          tab === t.id
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ t.label }}
      </button>
    </nav>
    <component :is="activeTabComponent" />
  </div>
</template>
```

## Complete Page Example: Filterable User List

```vue
<!-- assets/js/pages/users/index.vue -->
<script setup>
import { Head } from '@inertiajs/vue3'
import { useQueryState } from '~/composables/queryState'
import { computed } from 'vue'
import AppLayout from '~/layouts/AppLayout.vue'

defineOptions({ layout: AppLayout })

const props = defineProps({
  users: { type: Array, required: true }
})

const search = useQueryState('search', '', { replace: true })
const role = useQueryState('role', '')
const sort = useQueryState('sort', 'name')
const dir = useQueryState('dir', 'asc')

const filtered = computed(() => {
  let result = props.users

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }

  if (role.value) {
    result = result.filter((u) => u.role === role.value)
  }

  return [...result].sort((a, b) => {
    const aVal = a[sort.value] || ''
    const bVal = b[sort.value] || ''
    const cmp = aVal.localeCompare(bVal)
    return dir.value === 'asc' ? cmp : -cmp
  })
})

function toggleSort(field) {
  if (sort.value === field) {
    dir.value = dir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value = field
    dir.value = 'asc'
  }
}
</script>

<template>
  <Head title="Users" />
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Users</h1>
    <div class="flex gap-4 mb-4">
      <input
        type="text"
        v-model="search"
        placeholder="Search by name or email..."
        class="border rounded px-3 py-2 flex-1"
      />
      <select v-model="role" class="border rounded px-3 py-2">
        <option value="">All roles</option>
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </select>
    </div>
    <table class="w-full">
      <thead>
        <tr class="text-left border-b">
          <th class="pb-2 cursor-pointer" @click="toggleSort('name')">
            Name
            <span v-if="sort === 'name'">{{ dir === 'asc' ? '↑' : '↓' }}</span>
          </th>
          <th class="pb-2 cursor-pointer" @click="toggleSort('email')">
            Email
            <span v-if="sort === 'email'">{{ dir === 'asc' ? '↑' : '↓' }}</span>
          </th>
          <th class="pb-2">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filtered" :key="user.id" class="border-b">
          <td class="py-2">{{ user.name }}</td>
          <td class="py-2">{{ user.email }}</td>
          <td class="py-2">{{ user.role }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="filtered.length === 0" class="text-gray-500 text-center py-8">
      No users found.
    </p>
  </div>
</template>
```
