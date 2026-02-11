---
name: react
description: Complete React hook implementations — useLocalStorage, useQueryState, useFormDraft with full page examples
metadata:
  tags: react, hooks, useLocalStorage, useQueryState, useFormDraft, useState
---

# React Implementations

Complete React hook implementations for durable UI patterns. These hooks follow React conventions (useState API, useEffect for side effects) and are SSR-safe for use with Inertia.js server-side rendering.

## useLocalStorage Hook

Reference implementation from the Ascent React template, extended with cross-tab sync:

```jsx
// assets/js/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Sync to localStorage when value changes
  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Cross-tab sync: listen for changes from other tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue
          setStoredValue(newValue)
        } catch {
          setStoredValue(initialValue)
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, initialValue])

  return [storedValue, setValue]
}
```

**API**:

- `const [value, setValue] = useLocalStorage('key', defaultValue)`
- `setValue(newValue)` — direct value
- `setValue(prev => !prev)` — functional update (same API as `useState`)
- Returns `defaultValue` during SSR and when localStorage is unavailable

## useQueryState Hook

Syncs a single URL query parameter with React state:

```jsx
// assets/js/hooks/useQueryState.js
import { useState, useEffect, useCallback } from 'react'

export function useQueryState(key, defaultValue = '', options = {}) {
  const { replace = false } = options

  const [value, setValueState] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    const params = new URLSearchParams(window.location.search)
    return params.get(key) ?? defaultValue
  })

  // Update URL when value changes
  const setValue = useCallback(
    (newValue) => {
      const resolvedValue =
        newValue instanceof Function ? newValue(value) : newValue
      setValueState(resolvedValue)

      if (typeof window === 'undefined') return

      const url = new URL(window.location.href)
      if (resolvedValue && resolvedValue !== defaultValue) {
        url.searchParams.set(key, resolvedValue)
      } else {
        url.searchParams.delete(key)
      }

      const method = replace ? 'replaceState' : 'pushState'
      window.history[method]({}, '', url.toString())
    },
    [key, defaultValue, replace, value]
  )

  // Listen for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setValueState(params.get(key) ?? defaultValue)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [key, defaultValue])

  return [value, setValue]
}
```

**API**:

- `const [value, setValue] = useQueryState('tab', 'profile')`
- `setValue('billing')` — updates URL to `?tab=billing` with pushState
- `useQueryState('search', '', { replace: true })` — uses replaceState (no history entry)
- Default values are omitted from the URL for hygiene

## useFormDraft Hook

Wraps Inertia `useForm` with localStorage persistence, restore banner, and auto-cleanup:

```jsx
// assets/js/hooks/useFormDraft.js
import { useForm } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'

export function useFormDraft(draftKey, initialData, options = {}) {
  const { ttl = 24 * 60 * 60 * 1000 } = options // Default: 24 hours
  const form = useForm(initialData)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftMeta, setDraftMeta] = useState(null)
  const debounceRef = useRef(null)

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
          return
        }
        // Check if draft has meaningful content
        const hasContent = Object.values(draft.data).some((v) =>
          typeof v === 'string' ? v.trim() : Boolean(v)
        )
        if (hasContent) {
          setHasDraft(true)
          setDraftMeta(draft)
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [draftKey])

  // Debounced auto-save
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const hasContent = Object.values(form.data).some((v) =>
        typeof v === 'string' ? v.trim() : Boolean(v)
      )
      if (hasContent) {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              data: form.data,
              savedAt: Date.now(),
              expiresAt: Date.now() + ttl
            })
          )
        } catch {}
      }
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [form.data, draftKey, ttl])

  function restoreDraft() {
    if (draftMeta?.data) {
      form.setData(draftMeta.data)
      setHasDraft(false)
    }
  }

  function discardDraft() {
    localStorage.removeItem(draftKey)
    setHasDraft(false)
  }

  function clearDraft() {
    localStorage.removeItem(draftKey)
  }

  return {
    form,
    hasDraft,
    draftSavedAt: draftMeta?.savedAt ? new Date(draftMeta.savedAt) : null,
    restoreDraft,
    discardDraft,
    clearDraft
  }
}
```

**API**:

```jsx
const { form, hasDraft, draftSavedAt, restoreDraft, discardDraft, clearDraft } =
  useFormDraft('ASCENT_DRAFT_POST', { title: '', body: '' })

// Submit with auto-clear
form.post('/posts', { onSuccess: clearDraft })
```

## Complete Page Example: Settings with Tabs

```jsx
// assets/js/pages/settings/index.jsx
import { Head } from '@inertiajs/react'
import { useQueryState } from '~/hooks/useQueryState'
import AppLayout from '~/layouts/AppLayout'
import ProfileTab from './tabs/ProfileTab'
import SecurityTab from './tabs/SecurityTab'
import BillingTab from './tabs/BillingTab'
import TeamTab from './tabs/TeamTab'

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
  { id: 'team', label: 'Team' }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useQueryState('tab', 'profile')

  const TabComponent =
    {
      profile: ProfileTab,
      security: SecurityTab,
      billing: BillingTab,
      team: TeamTab
    }[activeTab] || ProfileTab

  return (
    <AppLayout>
      <Head title="Settings" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <nav className="flex gap-1 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 -mb-px text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <TabComponent />
      </div>
    </AppLayout>
  )
}
```

## Complete Page Example: Filterable User List

```jsx
// assets/js/pages/users/index.jsx
import { Head } from '@inertiajs/react'
import { useQueryState } from '~/hooks/useQueryState'
import { useMemo } from 'react'
import AppLayout from '~/layouts/AppLayout'

export default function UsersPage({ users }) {
  const [search, setSearch] = useQueryState('search', '', { replace: true })
  const [role, setRole] = useQueryState('role', '')
  const [sort, setSort] = useQueryState('sort', 'name')
  const [dir, setDir] = useQueryState('dir', 'asc')

  const filtered = useMemo(() => {
    let result = users

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }

    if (role) {
      result = result.filter((u) => u.role === role)
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sort] || ''
      const bVal = b[sort] || ''
      const cmp = aVal.localeCompare(bVal)
      return dir === 'asc' ? cmp : -cmp
    })

    return result
  }, [users, search, role, sort, dir])

  const toggleSort = (field) => {
    if (sort === field) {
      setDir(dir === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(field)
      setDir('asc')
    }
  }

  return (
    <AppLayout>
      <Head title="Users" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="border rounded px-3 py-2 flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th
                className="pb-2 cursor-pointer"
                onClick={() => toggleSort('name')}
              >
                Name {sort === 'name' && (dir === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="pb-2 cursor-pointer"
                onClick={() => toggleSort('email')}
              >
                Email {sort === 'email' && (dir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="pb-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">No users found.</p>
        )}
      </div>
    </AppLayout>
  )
}
```
