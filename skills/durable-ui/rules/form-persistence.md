---
name: form-persistence
description: Auto-save form drafts to localStorage with restore, expiry, unsaved-changes warnings, and Inertia integration
metadata:
  tags: form-draft, auto-save, localStorage, beforeunload, inertia, useForm, debounce
---

# Form Draft Persistence

Auto-saving form drafts to localStorage prevents users from losing work when they accidentally close the tab, navigate away, or experience a page reload. This pattern integrates with Inertia.js `useForm` for a seamless experience.

## Architecture

```
User types → Debounce (500ms) → Save to localStorage
                                  ↓
Page load → Check localStorage → Show "Restore draft?" banner
                                  ↓
Form submit (success) → Clear draft from localStorage
```

## Debounced Auto-Save

Save drafts after the user stops typing for 500ms to avoid excessive writes:

### React

```jsx
import { useForm } from '@inertiajs/react'
import { useEffect, useRef, useCallback, useState } from 'react'

function CreatePostPage() {
  const draftKey = 'ASCENT_DRAFT_POST_CREATE'
  const [showRestore, setShowRestore] = useState(false)
  const [savedDraft, setSavedDraft] = useState(null)

  const form = useForm({
    title: '',
    body: '',
    category: ''
  })

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        // Check if draft has expired (24 hours)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
          return
        }
        if (draft.data && (draft.data.title || draft.data.body)) {
          setSavedDraft(draft.data)
          setShowRestore(true)
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [])

  // Debounced auto-save
  const debounceRef = useRef(null)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (form.data.title || form.data.body) {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              data: form.data,
              savedAt: Date.now(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            })
          )
        } catch {}
      }
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [form.data])

  function restoreDraft() {
    if (savedDraft) {
      form.setData(savedDraft)
      setShowRestore(false)
    }
  }

  function discardDraft() {
    localStorage.removeItem(draftKey)
    setShowRestore(false)
  }

  function submit(e) {
    e.preventDefault()
    form.post('/posts', {
      onSuccess: () => localStorage.removeItem(draftKey)
    })
  }

  return (
    <form onSubmit={submit}>
      {showRestore && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex justify-between items-center">
          <p>
            You have an unsaved draft from{' '}
            {new Date(savedDraft?.savedAt).toLocaleString()}.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="text-amber-700 font-medium"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="text-gray-500"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <input
        value={form.data.title}
        onChange={(e) => form.setData('title', e.target.value)}
        placeholder="Post title"
      />
      <textarea
        value={form.data.body}
        onChange={(e) => form.setData('body', e.target.value)}
        placeholder="Write your post..."
      />
      <button type="submit" disabled={form.processing}>
        Publish
      </button>
    </form>
  )
}
```

### Vue

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'
import { ref, watch, onMounted } from 'vue'

const draftKey = 'ASCENT_DRAFT_POST_CREATE'
const showRestore = ref(false)
const savedDraft = ref(null)

const form = useForm({
  title: '',
  body: '',
  category: ''
})

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
      if (draft.data && (draft.data.title || draft.data.body)) {
        savedDraft.value = draft.data
        showRestore.value = true
      }
    }
  } catch {
    localStorage.removeItem(draftKey)
  }
})

// Debounced auto-save
let debounceTimer
watch(
  () => ({ ...form.data }),
  (data) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (data.title || data.body) {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              data,
              savedAt: Date.now(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000
            })
          )
        } catch {}
      }
    }, 500)
  },
  { deep: true }
)

function restoreDraft() {
  Object.assign(form, savedDraft.value)
  showRestore.value = false
}

function discardDraft() {
  localStorage.removeItem(draftKey)
  showRestore.value = false
}

function submit() {
  form.post('/posts', {
    onSuccess: () => localStorage.removeItem(draftKey)
  })
}
</script>
```

### Svelte

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  const draftKey = 'ASCENT_DRAFT_POST_CREATE'
  let showRestore = $state(false)
  let savedDraft = $state(null)

  const form = useForm({
    title: '',
    body: '',
    category: ''
  })

  onMount(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
          return
        }
        if (draft.data && (draft.data.title || draft.data.body)) {
          savedDraft = draft.data
          showRestore = true
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  })

  // Debounced auto-save
  let debounceTimer
  $effect(() => {
    const data = { title: $form.title, body: $form.body, category: $form.category }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (data.title || data.body) {
        try {
          localStorage.setItem(draftKey, JSON.stringify({
            data,
            savedAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
          }))
        } catch {}
      }
    }, 500)
  })

  function restoreDraft() {
    if (savedDraft) {
      $form.title = savedDraft.title
      $form.body = savedDraft.body
      $form.category = savedDraft.category
      showRestore = false
    }
  }

  function discardDraft() {
    localStorage.removeItem(draftKey)
    showRestore = false
  }

  function submit(e) {
    e.preventDefault()
    $form.post('/posts', {
      onSuccess: () => localStorage.removeItem(draftKey)
    })
  }
</script>
```

## Draft Key Strategy

Use meaningful keys that include record IDs for edit forms:

```js
// Create forms — single key per form type
'ASCENT_DRAFT_POST_CREATE'
'ASCENT_DRAFT_TEAM_CREATE'// Edit forms — include the record ID
`ASCENT_DRAFT_POST_EDIT_${postId}``ASCENT_DRAFT_USER_PROFILE_${userId}`// Multi-step forms — include the step
`ASCENT_DRAFT_ONBOARDING_STEP_${step}`
```

For edit forms, populate the form with server data first, then check for a draft:

```jsx
// Edit form: server data is the baseline, draft overrides it
function EditPostPage({ post }) {
  const draftKey = `ASCENT_DRAFT_POST_EDIT_${post.id}`
  const form = useForm({
    title: post.title,
    body: post.body
  })

  useEffect(() => {
    const raw = localStorage.getItem(draftKey)
    if (raw) {
      const draft = JSON.parse(raw)
      // Only offer restore if draft differs from saved version
      if (draft.data.title !== post.title || draft.data.body !== post.body) {
        // Show restore banner
      }
    }
  }, [])
}
```

## Draft Expiry (TTL)

Always set an expiration time on drafts to prevent stale data from lingering:

```js
const DRAFT_TTL = 24 * 60 * 60 * 1000 // 24 hours

// When saving
const draft = {
  data: form.data,
  savedAt: Date.now(),
  expiresAt: Date.now() + DRAFT_TTL
}
localStorage.setItem(key, JSON.stringify(draft))

// When loading
const draft = JSON.parse(localStorage.getItem(key))
if (draft?.expiresAt < Date.now()) {
  localStorage.removeItem(key)
  return null
}
```

Common TTL values:

- **Short forms** (contact, feedback): 1 hour
- **Content creation** (blog post, document): 24 hours
- **Complex forms** (onboarding, application): 7 days

## Unsaved Changes Warning

Warn users when they try to leave with unsaved changes. This requires both a `beforeunload` handler (for browser tab close) and an Inertia navigation guard:

### React

```jsx
import { useEffect } from 'react'
import { router } from '@inertiajs/react'

function useUnsavedChanges(isDirty) {
  // Browser tab close / reload
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Inertia navigation (link clicks, router.visit)
  useEffect(() => {
    if (!isDirty) return
    const removeListener = router.on('before', (event) => {
      if (!confirm('You have unsaved changes. Leave anyway?')) {
        event.preventDefault()
      }
    })
    return removeListener
  }, [isDirty])
}

// Usage
function EditPostPage({ post }) {
  const form = useForm({ title: post.title, body: post.body })
  useUnsavedChanges(form.isDirty)
  // ...
}
```

### Vue

```js
import { onMounted, onUnmounted, watch } from 'vue'
import { router } from '@inertiajs/vue3'

export function useUnsavedChanges(isDirtyRef) {
  function beforeUnload(e) {
    if (isDirtyRef.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  let removeInertiaListener

  onMounted(() => {
    window.addEventListener('beforeunload', beforeUnload)
    removeInertiaListener = router.on('before', (event) => {
      if (
        isDirtyRef.value &&
        !confirm('You have unsaved changes. Leave anyway?')
      ) {
        event.preventDefault()
      }
    })
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnload)
    removeInertiaListener?.()
  })
}
```

### Svelte

```js
import { router } from '@inertiajs/svelte'
import { onMount, onDestroy } from 'svelte'

export function useUnsavedChanges(isDirtyFn) {
  let removeInertiaListener

  function beforeUnload(e) {
    if (isDirtyFn()) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  onMount(() => {
    window.addEventListener('beforeunload', beforeUnload)
    removeInertiaListener = router.on('before', (event) => {
      if (isDirtyFn() && !confirm('You have unsaved changes. Leave anyway?')) {
        event.preventDefault()
      }
    })
  })

  onDestroy(() => {
    window.removeEventListener('beforeunload', beforeUnload)
    removeInertiaListener?.()
  })
}
```

## Clear on Successful Submit

Always clear the draft when the form submits successfully. With Inertia, use the `onSuccess` callback:

```js
// React
form.post('/posts', {
  onSuccess: () => localStorage.removeItem(draftKey)
})

// Vue
form.post('/posts', {
  onSuccess: () => localStorage.removeItem(draftKey)
})

// Svelte
$form.post('/posts', {
  onSuccess: () => localStorage.removeItem(draftKey)
})
```

## Inertia useRemember vs localStorage Drafts

Inertia provides `useRemember` which persists form state across Inertia navigations (clicking links within the app). However, `useRemember` does **not** survive:

- Full page reload (F5)
- Tab close and reopen
- Browser crash

Use **localStorage drafts** when you need persistence beyond the Inertia session. Use **useRemember** when you only need to preserve state during in-app navigation (e.g., filling a form, clicking away to read something, then clicking back).
