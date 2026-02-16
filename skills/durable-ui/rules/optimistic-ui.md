---
name: optimistic-ui
description: Optimistic UI patterns for instant feedback — useOptimistic hook, toggle/like patterns, list mutations, Inertia.js integration, and rollback strategies for React, Vue, and Svelte
metadata:
  tags: optimistic-ui, useOptimistic, rollback, toggle, like, favorite, bookmark, list-mutation, inertia, toast, undo
---

# Optimistic UI

Optimistic UI updates the interface immediately in response to a user action, before the server confirms the result. If the server request succeeds, the UI is already correct. If it fails, the UI rolls back to the previous state and shows an error. This eliminates perceived latency for actions that almost always succeed.

## Architecture

```
User Action (click, submit, drag)
    │
    ├──→ Update UI immediately (optimistic state)
    │
    ├──→ Send request to server
    │         │
    │         ├── Success → UI already correct, done
    │         │
    │         └── Error → Rollback UI to previous state
    │                     + Show error feedback (toast, inline message)
    │
    └──→ (Optional) Disable rapid re-triggering until request settles
```

The key insight: most user actions succeed. Waiting 200-500ms for a server round-trip before showing feedback makes the app feel sluggish. Optimistic UI trades absolute correctness for perceived speed, with a rollback safety net for the rare failure case.

## useOptimistic Hook / Composable

A reusable primitive that manages optimistic state with automatic rollback. It takes the current server value and returns the displayed value plus a function to apply optimistic updates.

### React

```jsx
// assets/js/hooks/useOptimistic.js
import { useState, useCallback, useRef } from 'react'

export function useOptimistic(serverValue, updateFn) {
  const [optimisticValue, setOptimisticValue] = useState(serverValue)
  const pendingRef = useRef(0)

  // Sync with server value when no optimistic updates are pending
  const prevServerRef = useRef(serverValue)
  if (prevServerRef.current !== serverValue && pendingRef.current === 0) {
    prevServerRef.current = serverValue
    setOptimisticValue(serverValue)
  }

  const addOptimistic = useCallback(
    async (optimisticPayload, asyncAction) => {
      const previous = optimisticValue
      const next = updateFn
        ? updateFn(optimisticValue, optimisticPayload)
        : optimisticPayload
      setOptimisticValue(next)
      pendingRef.current += 1

      try {
        await asyncAction()
      } catch (error) {
        setOptimisticValue(previous)
        throw error
      } finally {
        pendingRef.current -= 1
      }
    },
    [optimisticValue, updateFn]
  )

  return [optimisticValue, addOptimistic]
}
```

**API**:

```jsx
// Simple value replacement
const [likes, addOptimistic] = useOptimistic(serverLikes)
await addOptimistic(serverLikes + 1, () =>
  fetch('/api/like', { method: 'POST' })
)

// With update function for complex state
const [items, addOptimistic] = useOptimistic(
  serverItems,
  (current, newItem) => [...current, newItem]
)
await addOptimistic(newItem, () =>
  fetch('/api/items', { method: 'POST', body: JSON.stringify(newItem) })
)
```

### Vue

```js
// assets/js/composables/optimistic.js
import { ref, watch } from 'vue'

export function useOptimistic(serverValueRef, updateFn) {
  const optimisticValue = ref(serverValueRef.value)
  let pendingCount = 0

  // Sync with server value when no optimistic updates are pending
  watch(serverValueRef, (newVal) => {
    if (pendingCount === 0) {
      optimisticValue.value = newVal
    }
  })

  async function addOptimistic(optimisticPayload, asyncAction) {
    const previous = optimisticValue.value
    optimisticValue.value = updateFn
      ? updateFn(optimisticValue.value, optimisticPayload)
      : optimisticPayload
    pendingCount += 1

    try {
      await asyncAction()
    } catch (error) {
      optimisticValue.value = previous
      throw error
    } finally {
      pendingCount -= 1
    }
  }

  return { optimisticValue, addOptimistic }
}
```

**API**:

```js
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'

const serverLikes = computed(() => usePage().props.post.likesCount)
const { optimisticValue: likes, addOptimistic } = useOptimistic(serverLikes)
```

### Svelte

```js
// assets/js/lib/optimistic.svelte.js
export function useOptimistic(getServerValue, updateFn) {
  let optimisticValue = $state(getServerValue())
  let pendingCount = 0

  $effect(() => {
    const serverVal = getServerValue()
    if (pendingCount === 0) {
      optimisticValue = serverVal
    }
  })

  async function addOptimistic(optimisticPayload, asyncAction) {
    const previous = optimisticValue
    optimisticValue = updateFn
      ? updateFn(optimisticValue, optimisticPayload)
      : optimisticPayload
    pendingCount += 1

    try {
      await asyncAction()
    } catch (error) {
      optimisticValue = previous
      throw error
    } finally {
      pendingCount -= 1
    }
  }

  return {
    get value() {
      return optimisticValue
    },
    addOptimistic
  }
}
```

**API**:

```svelte
<script>
  import { useOptimistic } from '~/lib/optimistic.svelte.js'

  let { post } = $props()
  const likes = useOptimistic(() => post.likesCount)
</script>

<span>{likes.value} likes</span>
```

## Toggle Pattern (Favorite / Like / Bookmark)

The most common optimistic UI use case. User clicks a toggle, the UI updates instantly, and a request fires in the background.

### React

```jsx
// assets/js/components/LikeButton.jsx
import { useState, useCallback } from 'react'
import { useOptimistic } from '~/hooks/useOptimistic'
import { router } from '@inertiajs/react'

export function LikeButton({ post }) {
  const [error, setError] = useState(null)

  const [liked, toggleLiked] = useOptimistic(
    post.isLikedByUser,
    (current) => !current
  )

  const [likesCount, updateCount] = useOptimistic(
    post.likesCount,
    (current, delta) => current + delta
  )

  const handleToggle = useCallback(async () => {
    setError(null)
    const willLike = !liked
    const delta = willLike ? 1 : -1

    try {
      await Promise.all([
        toggleLiked(
          null,
          () =>
            new Promise((resolve, reject) => {
              router.post(
                `/posts/${post.id}/like`,
                {},
                {
                  preserveScroll: true,
                  onSuccess: resolve,
                  onError: () => reject(new Error('Failed to save'))
                }
              )
            })
        ),
        updateCount(delta, () => Promise.resolve())
      ])
    } catch {
      setError('Failed to save. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }, [liked, post.id, toggleLiked, updateCount])

  return (
    <div>
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 group"
        aria-label={liked ? 'Unlike this post' : 'Like this post'}
      >
        <svg
          className={`w-5 h-5 transition-colors ${
            liked
              ? 'fill-red-500 text-red-500'
              : 'fill-none text-gray-400 group-hover:text-red-400'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-sm text-gray-600">{likesCount}</span>
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
```

### Vue

```vue
<!-- assets/js/components/LikeButton.vue -->
<script setup>
import { ref, computed } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import { useOptimistic } from '~/composables/optimistic'

const props = defineProps({
  post: { type: Object, required: true }
})

const error = ref(null)

const serverLiked = computed(() => props.post.isLikedByUser)
const serverCount = computed(() => props.post.likesCount)

const { optimisticValue: liked, addOptimistic: toggleLiked } = useOptimistic(
  serverLiked,
  (current) => !current
)

const { optimisticValue: likesCount, addOptimistic: updateCount } =
  useOptimistic(serverCount, (current, delta) => current + delta)

async function handleToggle() {
  error.value = null
  const delta = liked.value ? -1 : 1

  try {
    await toggleLiked(
      null,
      () =>
        new Promise((resolve, reject) => {
          router.post(
            `/posts/${props.post.id}/like`,
            {},
            {
              preserveScroll: true,
              onSuccess: resolve,
              onError: () => reject(new Error('Failed to save'))
            }
          )
        })
    )
    // Count follows the toggle — no separate request needed
    updateCount(delta, () => Promise.resolve())
  } catch {
    error.value = 'Failed to save. Please try again.'
    setTimeout(() => (error.value = null), 3000)
  }
}
</script>

<template>
  <div>
    <button
      @click="handleToggle"
      class="flex items-center gap-1.5 group"
      :aria-label="liked ? 'Unlike this post' : 'Like this post'"
    >
      <svg
        class="w-5 h-5 transition-colors"
        :class="
          liked
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-400 group-hover:text-red-400'
        "
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
      <span class="text-sm text-gray-600">{{ likesCount }}</span>
    </button>
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/components/LikeButton.svelte -->
<script>
  import { router } from '@inertiajs/svelte'
  import { useOptimistic } from '~/lib/optimistic.svelte.js'

  let { post } = $props()
  let error = $state(null)

  const liked = useOptimistic(
    () => post.isLikedByUser,
    (current) => !current
  )

  const likesCount = useOptimistic(
    () => post.likesCount,
    (current, delta) => current + delta
  )

  async function handleToggle() {
    error = null
    const delta = liked.value ? -1 : 1

    try {
      await liked.addOptimistic(null, () =>
        new Promise((resolve, reject) => {
          router.post(
            `/posts/${post.id}/like`,
            {},
            {
              preserveScroll: true,
              onSuccess: resolve,
              onError: () => reject(new Error('Failed to save'))
            }
          )
        })
      )
      likesCount.addOptimistic(delta, () => Promise.resolve())
    } catch {
      error = 'Failed to save. Please try again.'
      setTimeout(() => (error = null), 3000)
    }
  }
</script>

<div>
  <button
    onclick={handleToggle}
    class="flex items-center gap-1.5 group"
    aria-label={liked.value ? 'Unlike this post' : 'Like this post'}
  >
    <svg
      class="w-5 h-5 transition-colors {liked.value
        ? 'fill-red-500 text-red-500'
        : 'fill-none text-gray-400 group-hover:text-red-400'}"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
    <span class="text-sm text-gray-600">{likesCount.value}</span>
  </button>
  {#if error}
    <p class="text-xs text-red-500 mt-1">{error}</p>
  {/if}
</div>
```

## List Mutation Patterns

List operations — add, delete, reorder — are trickier than toggles because the data structure is more complex and rollbacks must restore exact positions.

### Optimistic Add

Add an item to the list immediately with a temporary ID. If the server rejects the item, remove it and show an error.

#### React

```jsx
// assets/js/components/TodoList.jsx
import { useState, useCallback } from 'react'
import { router } from '@inertiajs/react'

export function TodoList({ todos: serverTodos }) {
  const [todos, setTodos] = useState(serverTodos)
  const [error, setError] = useState(null)

  // Sync when server props change (after successful Inertia visit)
  const prevServerRef = useState(serverTodos)[0]
  if (prevServerRef !== serverTodos) {
    setTodos(serverTodos)
  }

  const addTodo = useCallback((title) => {
    setError(null)
    const tempId = `temp-${Date.now()}`
    const optimisticTodo = {
      id: tempId,
      title,
      completed: false,
      pending: true
    }

    setTodos((prev) => [...prev, optimisticTodo])

    router.post(
      '/todos',
      { title },
      {
        preserveScroll: true,
        onError: () => {
          setTodos((prev) => prev.filter((t) => t.id !== tempId))
          setError(`Failed to add "${title}". Please try again.`)
          setTimeout(() => setError(null), 3000)
        }
      }
    )
  }, [])

  return (
    <div>
      <AddTodoForm onAdd={addTodo} />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.pending ? 'opacity-50' : ''}>
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### Vue

```vue
<script setup>
import { ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'

const props = defineProps({ todos: { type: Array, required: true } })

const localTodos = ref([...props.todos])
const error = ref(null)

watch(
  () => props.todos,
  (newTodos) => {
    localTodos.value = [...newTodos]
  }
)

function addTodo(title) {
  error.value = null
  const tempId = `temp-${Date.now()}`
  const optimisticTodo = { id: tempId, title, completed: false, pending: true }

  localTodos.value = [...localTodos.value, optimisticTodo]

  router.post(
    '/todos',
    { title },
    {
      preserveScroll: true,
      onError: () => {
        localTodos.value = localTodos.value.filter((t) => t.id !== tempId)
        error.value = `Failed to add "${title}". Please try again.`
        setTimeout(() => (error.value = null), 3000)
      }
    }
  )
}
</script>

<template>
  <div>
    <AddTodoForm @add="addTodo" />
    <p v-if="error" class="text-sm text-red-500 mb-2">{{ error }}</p>
    <ul>
      <li
        v-for="todo in localTodos"
        :key="todo.id"
        :class="{ 'opacity-50': todo.pending }"
      >
        {{ todo.title }}
      </li>
    </ul>
  </div>
</template>
```

#### Svelte

```svelte
<script>
  import { router } from '@inertiajs/svelte'

  let { todos: serverTodos } = $props()
  let localTodos = $state([...serverTodos])
  let error = $state(null)

  $effect(() => {
    localTodos = [...serverTodos]
  })

  function addTodo(title) {
    error = null
    const tempId = `temp-${Date.now()}`
    const optimisticTodo = { id: tempId, title, completed: false, pending: true }

    localTodos = [...localTodos, optimisticTodo]

    router.post(
      '/todos',
      { title },
      {
        preserveScroll: true,
        onError: () => {
          localTodos = localTodos.filter((t) => t.id !== tempId)
          error = `Failed to add "${title}". Please try again.`
          setTimeout(() => (error = null), 3000)
        }
      }
    )
  }
</script>

<div>
  <AddTodoForm onadd={(e) => addTodo(e.detail)} />
  {#if error}
    <p class="text-sm text-red-500 mb-2">{error}</p>
  {/if}
  <ul>
    {#each localTodos as todo (todo.id)}
      <li class={todo.pending ? 'opacity-50' : ''}>
        {todo.title}
      </li>
    {/each}
  </ul>
</div>
```

### Optimistic Delete

Remove the item from the list immediately. If the server rejects the deletion, restore it at its original position.

#### React

```jsx
function handleDelete(todoId) {
  const previousTodos = [...todos]
  setTodos((prev) => prev.filter((t) => t.id !== todoId))

  router.delete(`/todos/${todoId}`, {
    preserveScroll: true,
    onError: () => {
      setTodos(previousTodos)
      setError('Failed to delete. The item has been restored.')
      setTimeout(() => setError(null), 3000)
    }
  })
}
```

#### Vue

```js
function handleDelete(todoId) {
  const previousTodos = [...localTodos.value]
  localTodos.value = localTodos.value.filter((t) => t.id !== todoId)

  router.delete(`/todos/${todoId}`, {
    preserveScroll: true,
    onError: () => {
      localTodos.value = previousTodos
      error.value = 'Failed to delete. The item has been restored.'
      setTimeout(() => (error.value = null), 3000)
    }
  })
}
```

#### Svelte

```js
function handleDelete(todoId) {
  const previousTodos = [...localTodos]
  localTodos = localTodos.filter((t) => t.id !== todoId)

  router.delete(`/todos/${todoId}`, {
    preserveScroll: true,
    onError: () => {
      localTodos = previousTodos
      error = 'Failed to delete. The item has been restored.'
      setTimeout(() => (error = null), 3000)
    }
  })
}
```

### Optimistic Reorder

Move an item in the list immediately (e.g., after a drag-and-drop), then persist the new order to the server. Revert to the original order on failure.

#### React

```jsx
function handleReorder(fromIndex, toIndex) {
  const previousTodos = [...todos]
  const reordered = [...todos]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  setTodos(reordered)

  const orderedIds = reordered.map((t) => t.id)

  router.put(
    '/todos/reorder',
    { orderedIds },
    {
      preserveScroll: true,
      onError: () => {
        setTodos(previousTodos)
        setError('Failed to save new order. Reverted to previous order.')
        setTimeout(() => setError(null), 3000)
      }
    }
  )
}
```

#### Vue

```js
function handleReorder(fromIndex, toIndex) {
  const previousTodos = [...localTodos.value]
  const reordered = [...localTodos.value]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  localTodos.value = reordered

  const orderedIds = reordered.map((t) => t.id)

  router.put(
    '/todos/reorder',
    { orderedIds },
    {
      preserveScroll: true,
      onError: () => {
        localTodos.value = previousTodos
        error.value = 'Failed to save new order. Reverted to previous order.'
        setTimeout(() => (error.value = null), 3000)
      }
    }
  )
}
```

#### Svelte

```js
function handleReorder(fromIndex, toIndex) {
  const previousTodos = [...localTodos]
  const reordered = [...localTodos]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  localTodos = reordered

  const orderedIds = reordered.map((t) => t.id)

  router.put(
    '/todos/reorder',
    { orderedIds },
    {
      preserveScroll: true,
      onError: () => {
        localTodos = previousTodos
        error = 'Failed to save new order. Reverted to previous order.'
        setTimeout(() => (error = null), 3000)
      }
    }
  )
}
```

## Integration with Inertia.js

Inertia.js provides `onBefore`, `onSuccess`, and `onError` callbacks on every router call, making it a natural fit for optimistic UI. The pattern is: mutate local state before the request, then rely on `onError` to rollback and `onSuccess` (or the automatic prop update) to confirm.

### Sails.js Action (Server Side)

```js
// api/controllers/posts/toggle-like.js
module.exports = {
  friendlyName: 'Toggle like',

  inputs: {
    id: { type: 'number', required: true }
  },

  exits: {
    success: { description: 'Like toggled.' }
  },

  fn: async function ({ id }) {
    const post = await Post.findOne({ id })
    if (!post) throw 'notFound'

    const existingLike = await Like.findOne({
      user: this.req.me.id,
      post: id
    })

    if (existingLike) {
      await Like.destroyOne({ id: existingLike.id })
    } else {
      await Like.create({ user: this.req.me.id, post: id })
    }

    // Inertia will re-render the page with fresh props automatically
    return this.res.redirect(`/posts/${id}`)
  }
}
```

### Full Inertia Integration Pattern

The key insight: Inertia automatically refreshes page props after a successful `router.post`/`router.delete`, so the server-confirmed data will flow in as new props. The optimistic layer only needs to handle the gap between the user action and the server response.

#### React

```jsx
import { useState, useRef, useCallback } from 'react'
import { router } from '@inertiajs/react'

export function BookmarkButton({ article }) {
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked)
  const inflightRef = useRef(false)

  // Sync with server props when they update (after successful Inertia visit)
  const prevBookmarked = useRef(article.isBookmarked)
  if (prevBookmarked.current !== article.isBookmarked) {
    prevBookmarked.current = article.isBookmarked
    if (!inflightRef.current) {
      setIsBookmarked(article.isBookmarked)
    }
  }

  const toggle = useCallback(() => {
    if (inflightRef.current) return // Prevent rapid double-clicks

    const previousValue = isBookmarked
    setIsBookmarked(!isBookmarked)
    inflightRef.current = true

    router.post(
      `/articles/${article.id}/bookmark`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          inflightRef.current = false
          // Props will update via Inertia — no manual sync needed
        },
        onError: () => {
          setIsBookmarked(previousValue)
          inflightRef.current = false
        }
      }
    )
  }, [isBookmarked, article.id])

  return (
    <button onClick={toggle} aria-pressed={isBookmarked}>
      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}
```

#### Vue

```vue
<script setup>
import { ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'

const props = defineProps({ article: { type: Object, required: true } })

const isBookmarked = ref(props.article.isBookmarked)
let inflight = false

watch(
  () => props.article.isBookmarked,
  (newVal) => {
    if (!inflight) {
      isBookmarked.value = newVal
    }
  }
)

function toggle() {
  if (inflight) return

  const previousValue = isBookmarked.value
  isBookmarked.value = !isBookmarked.value
  inflight = true

  router.post(
    `/articles/${props.article.id}/bookmark`,
    {},
    {
      preserveScroll: true,
      onSuccess: () => {
        inflight = false
      },
      onError: () => {
        isBookmarked.value = previousValue
        inflight = false
      }
    }
  )
}
</script>

<template>
  <button @click="toggle" :aria-pressed="isBookmarked">
    {{ isBookmarked ? 'Bookmarked' : 'Bookmark' }}
  </button>
</template>
```

#### Svelte

```svelte
<script>
  import { router } from '@inertiajs/svelte'

  let { article } = $props()
  let isBookmarked = $state(article.isBookmarked)
  let inflight = false

  $effect(() => {
    if (!inflight) {
      isBookmarked = article.isBookmarked
    }
  })

  function toggle() {
    if (inflight) return

    const previousValue = isBookmarked
    isBookmarked = !isBookmarked
    inflight = true

    router.post(
      `/articles/${article.id}/bookmark`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          inflight = false
        },
        onError: () => {
          isBookmarked = previousValue
          inflight = false
        }
      }
    )
  }
</script>

<button onclick={toggle} aria-pressed={isBookmarked}>
  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
</button>
```

## When NOT to Use Optimistic UI

Not every action should be optimistic. Use this decision guide:

| Confidence | Action Type                     | Use Optimistic? | Reason                                                     |
| ---------- | ------------------------------- | :-------------: | ---------------------------------------------------------- |
| **High**   | Toggle like/favorite            |       Yes       | Almost never fails, simple rollback                        |
| **High**   | Mark as read/unread             |       Yes       | No validation, idempotent                                  |
| **High**   | Bookmark/save                   |       Yes       | No validation, idempotent                                  |
| **High**   | Dismiss notification            |       Yes       | Always succeeds                                            |
| **Medium** | Add item to list                |      Maybe      | Depends on server-side validation complexity               |
| **Medium** | Update simple field             |      Maybe      | OK if validation rarely fails                              |
| **Medium** | Reorder items                   |      Maybe      | OK for drag-and-drop where server just persists order      |
| **Low**    | Create with complex validation  |       No        | Server may reject — user sees confusing flash              |
| **Low**    | Payment / checkout              |       No        | Financial actions must be confirmed before showing success |
| **Low**    | Delete with no undo             |       No        | Destructive actions need confirmation, not optimism        |
| **Low**    | Send email / notification       |       No        | Side effects cannot be rolled back                         |
| **Low**    | Actions requiring auth re-check |       No        | Session may have expired                                   |

**Rule of thumb**: Use optimistic UI when the action has a >95% success rate, no irreversible side effects, and a clear rollback path. If the server commonly rejects the action (validation-heavy forms, permission checks, resource conflicts), show a loading state instead.

## Common Mistakes

1. **Not rolling back on error** — The most critical mistake. If the server request fails and the UI stays in the optimistic state, the user sees data that does not match reality. Every optimistic update must have a corresponding rollback in the `onError`/`catch` path.

2. **Optimistic UI for actions that frequently fail** — If a form has complex server-side validation (unique email check, credit limit, inventory stock), the optimistic state will flash and revert often, which is more confusing than a loading spinner. Only use optimistic UI for actions with a high success rate.

3. **Race conditions with rapid toggling** — A user rapidly clicks a like button 5 times. Without protection, 5 requests fire and the final state is unpredictable. Solutions:

   - **Guard with an inflight flag**: Ignore clicks while a request is pending (shown in the Inertia integration examples above).
   - **Use request IDs**: Track the latest request and ignore responses from stale ones.
   - **Debounce**: Delay the request until the user stops clicking (only suitable for non-toggle actions).

4. **Not showing any feedback on rollback** — When a rollback happens, the user sees the UI snap back to the previous state. Without an explanation (toast, inline error), they think the app is broken. Always pair rollbacks with a brief error message.

5. **Optimistic UI for actions with visible side effects** — Sending an email, charging a card, or posting a notification cannot be "rolled back" in any meaningful way. These actions should never be optimistic. Show a loading/processing state and confirm only after the server succeeds.

6. **Forgetting to sync with server state** — After an optimistic update, Inertia will eventually deliver fresh props from the server. If your component ignores these props (because it only reads local state), it can drift out of sync. Always watch/sync server props back into local state when no inflight request is active.

7. **Using optimistic UI without `preserveScroll`** — In Inertia, forgetting `preserveScroll: true` causes the page to jump to the top after the server responds, which is jarring for inline actions like likes and bookmarks.
