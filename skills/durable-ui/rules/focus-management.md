---
name: focus-management
description: Return focus after dismissal, trap focus inside modals, and manage focus after list deletions — with hooks for React, Vue, and Svelte
metadata:
  tags: focus-management, focus-return, focus-trap, accessibility, modal, keyboard-navigation, screen-reader, aria, useFocusReturn, useFocusTrap
---

# Focus Management

When a modal opens, focus must move into it. When it closes, focus must return to the element that triggered it. When the user presses Tab inside a modal, focus must cycle within the modal — never escaping to the page behind. When an item is deleted from a list, focus must land on a sensible neighbor, not fall to `<body>`.

Without these patterns, keyboard users lose their place on the page, and screen reader users have no idea where they are. Focus management is not optional — it is a core accessibility requirement (WCAG 2.4.3 Focus Order).

## Focusable Elements Selector

Every focus utility in this guide uses the same selector to find interactive elements:

```js
const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
```

This covers links, enabled form controls, and any element with a non-negative `tabindex`. Elements with `tabindex="-1"` are focusable programmatically but not via Tab, so they are excluded from trap cycling.

## Focus Return After Dismissal

When a modal, dropdown, or popover closes, focus must return to the element that opened it. The pattern:

1. When the overlay opens, capture `document.activeElement` (the trigger)
2. When the overlay closes, call `.focus()` on the captured element
3. Handle the edge case where the trigger was removed from the DOM while the overlay was open

### React

```jsx
// assets/js/hooks/useFocusReturn.js
import { useEffect, useRef } from 'react'

export function useFocusReturn(open) {
  const triggerRef = useRef(null)

  useEffect(() => {
    if (open) {
      // Capture the element that had focus when the overlay opened
      triggerRef.current = document.activeElement
    } else if (triggerRef.current) {
      // Restore focus when the overlay closes
      if (triggerRef.current.isConnected) {
        triggerRef.current.focus()
      }
      triggerRef.current = null
    }
  }, [open])
}
```

**Usage**:

```jsx
import { useState } from 'react'
import { useFocusReturn } from '~/hooks/useFocusReturn'

function SettingsPage() {
  const [showModal, setShowModal] = useState(false)
  useFocusReturn(showModal)

  return (
    <>
      <button onClick={() => setShowModal(true)}>Edit profile</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>Edit Profile</h2>
          {/* modal content */}
        </Modal>
      )}
    </>
  )
}
```

### Vue

```js
// assets/js/composables/focusReturn.js
import { watch, ref } from 'vue'

export function useFocusReturn(openRef) {
  const triggerEl = ref(null)

  watch(openRef, (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      triggerEl.value = document.activeElement
    } else if (!isOpen && wasOpen && triggerEl.value) {
      if (triggerEl.value.isConnected) {
        triggerEl.value.focus()
      }
      triggerEl.value = null
    }
  })
}
```

**Usage**:

```vue
<script setup>
import { ref } from 'vue'
import { useFocusReturn } from '~/composables/focusReturn'

const showModal = ref(false)
useFocusReturn(showModal)
</script>

<template>
  <button @click="showModal = true">Edit profile</button>
  <Modal v-if="showModal" @close="showModal = false">
    <h2>Edit Profile</h2>
    <!-- modal content -->
  </Modal>
</template>
```

### Svelte

In Svelte, focus return is best implemented as an action on the trigger element, so it captures the right element automatically:

```js
// assets/js/actions/focusReturn.js
export function focusReturn(node) {
  let triggerEl = null

  function onFocusOut() {
    triggerEl = node
  }

  node.addEventListener('click', onFocusOut)

  return {
    destroy() {
      node.removeEventListener('click', onFocusOut)
      if (triggerEl && triggerEl.isConnected) {
        triggerEl.focus()
      }
    }
  }
}
```

Alternatively, for a more direct approach matching the React and Vue patterns, use a module-level helper:

```js
// assets/js/utils/focusReturn.js
let triggerEl = null

export function captureFocus() {
  triggerEl = document.activeElement
}

export function restoreFocus() {
  if (triggerEl && triggerEl.isConnected) {
    triggerEl.focus()
  }
  triggerEl = null
}
```

**Usage**:

```svelte
<script>
  import { captureFocus, restoreFocus } from '~/utils/focusReturn'

  let showModal = $state(false)

  function openModal() {
    captureFocus()
    showModal = true
  }

  function closeModal() {
    showModal = false
    restoreFocus()
  }
</script>

<button onclick={openModal}>Edit profile</button>
{#if showModal}
  <Modal onclose={closeModal}>
    <h2>Edit Profile</h2>
    <!-- modal content -->
  </Modal>
{/if}
```

## Focus Trapping in Modals

When a modal is open, pressing Tab should cycle through the focusable elements inside the modal. It must never escape to the page behind it. Shift+Tab from the first element should wrap to the last, and Tab from the last element should wrap to the first.

### React

```jsx
// assets/js/hooks/useFocusTrap.js
import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableEls = container.querySelectorAll(FOCUSABLE)
    if (focusableEls.length === 0) return

    const firstEl = focusableEls[0]
    const lastEl = focusableEls[focusableEls.length - 1]

    // Auto-focus the first focusable element
    firstEl.focus()

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return

      // Re-query in case DOM changed (e.g., conditional buttons)
      const currentFocusable = container.querySelectorAll(FOCUSABLE)
      if (currentFocusable.length === 0) return

      const first = currentFocusable[0]
      const last = currentFocusable[currentFocusable.length - 1]

      if (e.shiftKey) {
        // Shift+Tab on first element → wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab on last element → wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [])

  return containerRef
}
```

**Usage**:

```jsx
import { useFocusTrap } from '~/hooks/useFocusTrap'

function ConfirmDialog({ onConfirm, onCancel }) {
  const trapRef = useFocusTrap()

  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <h2>Are you sure?</h2>
      <p>This action cannot be undone.</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={onConfirm}
          className="bg-red-600 text-white rounded px-4 py-2"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
```

### Vue

```js
// assets/js/composables/focusTrap.js
import { ref, onMounted, onUnmounted } from 'vue'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap() {
  const containerRef = ref(null)

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return
    const container = containerRef.value
    if (!container) return

    const focusableEls = container.querySelectorAll(FOCUSABLE)
    if (focusableEls.length === 0) return

    const first = focusableEls[0]
    const last = focusableEls[focusableEls.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  onMounted(() => {
    const container = containerRef.value
    if (!container) return

    const focusableEls = container.querySelectorAll(FOCUSABLE)
    if (focusableEls.length > 0) {
      focusableEls[0].focus()
    }

    container.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    const container = containerRef.value
    if (container) {
      container.removeEventListener('keydown', handleKeyDown)
    }
  })

  return containerRef
}
```

**Usage**:

```vue
<script setup>
import { useFocusTrap } from '~/composables/focusTrap'

defineProps({ onConfirm: Function, onCancel: Function })

const trapRef = useFocusTrap()
</script>

<template>
  <div ref="trapRef" role="dialog" aria-modal="true">
    <h2>Are you sure?</h2>
    <p>This action cannot be undone.</p>
    <div class="flex gap-2 justify-end">
      <button @click="onCancel">Cancel</button>
      <button
        @click="onConfirm"
        class="bg-red-600 text-white rounded px-4 py-2"
      >
        Delete
      </button>
    </div>
  </div>
</template>
```

### Svelte

```js
// assets/js/actions/focusTrap.js
const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function focusTrap(node) {
  const focusableEls = node.querySelectorAll(FOCUSABLE)
  if (focusableEls.length > 0) {
    focusableEls[0].focus()
  }

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return

    const currentFocusable = node.querySelectorAll(FOCUSABLE)
    if (currentFocusable.length === 0) return

    const first = currentFocusable[0]
    const last = currentFocusable[currentFocusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  node.addEventListener('keydown', handleKeyDown)

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeyDown)
    }
  }
}
```

**Usage**:

```svelte
<script>
  import { focusTrap } from '~/actions/focusTrap'

  let { onconfirm, oncancel } = $props()
</script>

<div use:focusTrap role="dialog" aria-modal="true">
  <h2>Are you sure?</h2>
  <p>This action cannot be undone.</p>
  <div class="flex gap-2 justify-end">
    <button onclick={oncancel}>Cancel</button>
    <button onclick={onconfirm} class="bg-red-600 text-white rounded px-4 py-2">
      Delete
    </button>
  </div>
</div>
```

## Focus After List Item Deletion

When an item is removed from a list, focus should move to a predictable location:

1. The **next sibling** if one exists
2. The **previous sibling** if the deleted item was last
3. A **fallback element** (e.g., an "Add new" button) if the list is now empty

Without this, focus drops to `<body>` and keyboard users must Tab through the entire page to get back.

### React

```jsx
// assets/js/hooks/useFocusAfterDelete.js
import { useRef, useCallback } from 'react'

export function useFocusAfterDelete(fallbackRef) {
  const itemRefs = useRef(new Map())

  const setItemRef = useCallback((id, el) => {
    if (el) {
      itemRefs.current.set(id, el)
    } else {
      itemRefs.current.delete(id)
    }
  }, [])

  const handleDelete = useCallback(
    (id, items, deleteFn) => {
      const currentIndex = items.findIndex((item) => item.id === id)
      const nextItem = items[currentIndex + 1]
      const prevItem = items[currentIndex - 1]

      // Perform the deletion
      deleteFn(id)

      // Focus the next logical element after React re-renders
      requestAnimationFrame(() => {
        if (nextItem && itemRefs.current.has(nextItem.id)) {
          itemRefs.current.get(nextItem.id).focus()
        } else if (prevItem && itemRefs.current.has(prevItem.id)) {
          itemRefs.current.get(prevItem.id).focus()
        } else if (fallbackRef?.current) {
          fallbackRef.current.focus()
        }
      })
    },
    [fallbackRef]
  )

  return { setItemRef, handleDelete }
}
```

**Usage**:

```jsx
import { useState, useRef } from 'react'
import { useFocusAfterDelete } from '~/hooks/useFocusAfterDelete'

function TodoList({ initialItems }) {
  const [items, setItems] = useState(initialItems)
  const addButtonRef = useRef(null)
  const { setItemRef, handleDelete } = useFocusAfterDelete(addButtonRef)

  function deleteItem(id) {
    handleDelete(id, items, (deletedId) => {
      setItems((prev) => prev.filter((item) => item.id !== deletedId))
    })
  }

  return (
    <div>
      <ul role="list">
        {items.map((item) => (
          <li
            key={item.id}
            ref={(el) => setItemRef(item.id, el)}
            tabIndex={-1}
            className="flex justify-between items-center p-2"
          >
            <span>{item.title}</span>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="text-gray-500 py-4">No items yet.</p>
      )}
      <button ref={addButtonRef} className="mt-2">
        Add new item
      </button>
    </div>
  )
}
```

### Vue

```js
// assets/js/composables/focusAfterDelete.js
import { ref } from 'vue'

export function useFocusAfterDelete(fallbackRef) {
  const itemRefs = ref(new Map())

  function setItemRef(id, el) {
    if (el) {
      itemRefs.value.set(id, el)
    } else {
      itemRefs.value.delete(id)
    }
  }

  function handleDelete(id, items, deleteFn) {
    const currentIndex = items.findIndex((item) => item.id === id)
    const nextItem = items[currentIndex + 1]
    const prevItem = items[currentIndex - 1]

    deleteFn(id)

    requestAnimationFrame(() => {
      if (nextItem && itemRefs.value.has(nextItem.id)) {
        itemRefs.value.get(nextItem.id).focus()
      } else if (prevItem && itemRefs.value.has(prevItem.id)) {
        itemRefs.value.get(prevItem.id).focus()
      } else if (fallbackRef?.value) {
        fallbackRef.value.focus()
      }
    })
  }

  return { setItemRef, handleDelete }
}
```

**Usage**:

```vue
<script setup>
import { ref } from 'vue'
import { useFocusAfterDelete } from '~/composables/focusAfterDelete'

const props = defineProps({ initialItems: { type: Array, required: true } })

const items = ref([...props.initialItems])
const addButtonRef = ref(null)
const { setItemRef, handleDelete } = useFocusAfterDelete(addButtonRef)

function deleteItem(id) {
  handleDelete(id, items.value, (deletedId) => {
    items.value = items.value.filter((item) => item.id !== deletedId)
  })
}
</script>

<template>
  <div>
    <ul role="list">
      <li
        v-for="item in items"
        :key="item.id"
        :ref="(el) => setItemRef(item.id, el)"
        tabindex="-1"
        class="flex justify-between items-center p-2"
      >
        <span>{{ item.title }}</span>
        <button @click="deleteItem(item.id)">Delete</button>
      </li>
    </ul>
    <p v-if="items.length === 0" class="text-gray-500 py-4">No items yet.</p>
    <button ref="addButtonRef" class="mt-2">Add new item</button>
  </div>
</template>
```

### Svelte

```svelte
<script>
  let { initialItems } = $props()

  let items = $state([...initialItems])
  let itemEls = $state(new Map())
  let addButtonEl = $state(null)

  function deleteItem(id) {
    const currentIndex = items.findIndex((item) => item.id === id)
    const nextItem = items[currentIndex + 1]
    const prevItem = items[currentIndex - 1]

    items = items.filter((item) => item.id !== id)

    requestAnimationFrame(() => {
      if (nextItem && itemEls.has(nextItem.id)) {
        itemEls.get(nextItem.id).focus()
      } else if (prevItem && itemEls.has(prevItem.id)) {
        itemEls.get(prevItem.id).focus()
      } else if (addButtonEl) {
        addButtonEl.focus()
      }
    })
  }
</script>

<div>
  <ul role="list">
    {#each items as item (item.id)}
      <li
        bind:this={el => { if (el) itemEls.set(item.id, el); else itemEls.delete(item.id) }}
        tabindex="-1"
        class="flex justify-between items-center p-2"
      >
        <span>{item.title}</span>
        <button onclick={() => deleteItem(item.id)}>Delete</button>
      </li>
    {/each}
  </ul>
  {#if items.length === 0}
    <p class="text-gray-500 py-4">No items yet.</p>
  {/if}
  <button bind:this={addButtonEl} class="mt-2">Add new item</button>
</div>
```

## Complete Example: Accessible Modal

A modal that combines focus return, focus trapping, backdrop click dismissal, and Escape key dismissal. This builds on the Modal component from the click-outside rule.

### React

```jsx
// assets/js/components/AccessibleModal.jsx
import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function AccessibleModal({ open, onClose, title, children }) {
  const contentRef = useRef(null)
  const triggerRef = useRef(null)

  // Focus return: capture trigger on open, restore on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else if (triggerRef.current) {
      if (triggerRef.current.isConnected) {
        triggerRef.current.focus()
      }
      triggerRef.current = null
    }
  }, [open])

  // Focus trap: auto-focus first element and trap Tab
  useEffect(() => {
    if (!open) return
    const container = contentRef.current
    if (!container) return

    // Wait for the DOM to be ready
    requestAnimationFrame(() => {
      const focusableEls = container.querySelectorAll(FOCUSABLE)
      if (focusableEls.length > 0) {
        focusableEls[0].focus()
      }
    })

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const focusableEls = container.querySelectorAll(FOCUSABLE)
      if (focusableEls.length === 0) return

      const first = focusableEls[0]
      const last = focusableEls[focusableEls.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
      >
        {children}
      </div>
    </div>
  )
}
```

**Usage**:

```jsx
import { useState } from 'react'
import { AccessibleModal } from '~/components/AccessibleModal'

function TeamPage() {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <div>
      <h1>Team Members</h1>
      <button onClick={() => setShowInvite(true)}>Invite member</button>

      <AccessibleModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite team member"
      >
        <h2 className="text-lg font-bold mb-4">Invite team member</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowInvite(false)
          }}
        >
          <label className="block mb-2">
            Email address
            <input
              type="email"
              name="email"
              className="block w-full mt-1 border rounded px-3 py-2"
              required
            />
          </label>
          <label className="block mb-4">
            Role
            <select
              name="role"
              className="block w-full mt-1 border rounded px-3 py-2"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Send invite
            </button>
          </div>
        </form>
      </AccessibleModal>
    </div>
  )
}
```

### Vue

```vue
<!-- assets/js/components/AccessibleModal.vue -->
<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true }
})

const emit = defineEmits(['close'])

const contentRef = ref(null)
let triggerEl = null

watch(
  () => props.open,
  async (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      // Capture trigger for focus return
      triggerEl = document.activeElement
      document.body.style.overflow = 'hidden'

      await nextTick()
      const container = contentRef.value
      if (container) {
        const focusableEls = container.querySelectorAll(FOCUSABLE)
        if (focusableEls.length > 0) {
          focusableEls[0].focus()
        }
      }
    } else if (!isOpen && wasOpen) {
      document.body.style.overflow = ''
      // Restore focus to trigger
      if (triggerEl && triggerEl.isConnected) {
        triggerEl.focus()
      }
      triggerEl = null
    }
  }
)

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    emit('close')
    return
  }

  if (e.key !== 'Tab') return
  const container = contentRef.value
  if (!container) return

  const focusableEls = container.querySelectorAll(FOCUSABLE)
  if (focusableEls.length === 0) return

  const first = focusableEls[0]
  const last = focusableEls[focusableEls.length - 1]

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click="handleBackdropClick"
  >
    <div
      ref="contentRef"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
      @keydown="handleKeyDown"
    >
      <slot />
    </div>
  </div>
</template>
```

**Usage**:

```vue
<script setup>
import { ref } from 'vue'
import AccessibleModal from '~/components/AccessibleModal.vue'

const showInvite = ref(false)
</script>

<template>
  <div>
    <h1>Team Members</h1>
    <button @click="showInvite = true">Invite member</button>

    <AccessibleModal
      :open="showInvite"
      title="Invite team member"
      @close="showInvite = false"
    >
      <h2 class="text-lg font-bold mb-4">Invite team member</h2>
      <form @submit.prevent="showInvite = false">
        <label class="block mb-2">
          Email address
          <input
            type="email"
            name="email"
            class="block w-full mt-1 border rounded px-3 py-2"
            required
          />
        </label>
        <label class="block mb-4">
          Role
          <select
            name="role"
            class="block w-full mt-1 border rounded px-3 py-2"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            @click="showInvite = false"
            class="px-4 py-2 text-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Send invite
          </button>
        </div>
      </form>
    </AccessibleModal>
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/components/AccessibleModal.svelte -->
<script>
  const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

  let { open, onclose, title, children } = $props()
  let contentEl = $state(null)
  let triggerEl = null

  $effect(() => {
    if (open) {
      triggerEl = document.activeElement
      document.body.style.overflow = 'hidden'

      // Auto-focus the first focusable element after render
      requestAnimationFrame(() => {
        if (contentEl) {
          const focusableEls = contentEl.querySelectorAll(FOCUSABLE)
          if (focusableEls.length > 0) {
            focusableEls[0].focus()
          }
        }
      })
    }

    return () => {
      document.body.style.overflow = ''
      if (triggerEl && triggerEl.isConnected) {
        triggerEl.focus()
      }
      triggerEl = null
    }
  })

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onclose()
      return
    }

    if (e.key !== 'Tab') return
    if (!contentEl) return

    const focusableEls = contentEl.querySelectorAll(FOCUSABLE)
    if (focusableEls.length === 0) return

    const first = focusableEls[0]
    const last = focusableEls[focusableEls.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onclose()
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      bind:this={contentEl}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
      onkeydown={handleKeyDown}
    >
      {@render children()}
    </div>
  </div>
{/if}
```

**Usage**:

```svelte
<script>
  import AccessibleModal from '~/components/AccessibleModal.svelte'

  let showInvite = $state(false)
</script>

<div>
  <h1>Team Members</h1>
  <button onclick={() => showInvite = true}>Invite member</button>

  <AccessibleModal
    open={showInvite}
    onclose={() => showInvite = false}
    title="Invite team member"
  >
    <h2 class="text-lg font-bold mb-4">Invite team member</h2>
    <form onsubmit={(e) => { e.preventDefault(); showInvite = false }}>
      <label class="block mb-2">
        Email address
        <input
          type="email"
          name="email"
          class="block w-full mt-1 border rounded px-3 py-2"
          required
        />
      </label>
      <label class="block mb-4">
        Role
        <select name="role" class="block w-full mt-1 border rounded px-3 py-2">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <div class="flex gap-2 justify-end">
        <button
          type="button"
          onclick={() => showInvite = false}
          class="px-4 py-2 text-gray-600"
        >
          Cancel
        </button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
          Send invite
        </button>
      </div>
    </form>
  </AccessibleModal>
</div>
```

## Common Mistakes

1. **Forgetting to return focus** — When a modal closes without restoring focus, the browser moves focus to `<body>`. Keyboard users must Tab through the entire page to get back to where they were. Always capture `document.activeElement` on open and call `.focus()` on close.

2. **Not trapping focus in modals** — Without a focus trap, pressing Tab in a modal moves focus to elements behind the backdrop. The user can interact with hidden content, which is both confusing and a security concern (e.g., submitting a form they cannot see). Always wrap Tab from last to first and Shift+Tab from first to last.

3. **Using `tabIndex={-1}` incorrectly** — `tabindex="-1"` makes an element focusable via JavaScript (`.focus()`) but removes it from the Tab order. This is correct for list items that should receive focus after deletion but should not be Tab stops. Do not set `tabindex="-1"` on elements that should be reachable by Tab (buttons, inputs) — they already are. Conversely, do not set `tabindex="0"` on list items just to make them tabbable, as this clutters the Tab order. Use `tabindex="-1"` on containers that need programmatic focus only.

4. **Not handling the case where the trigger was removed** — If the element that opened the modal is removed from the DOM while the modal is open (e.g., a button in a list item that was deleted by another user in real-time), calling `.focus()` on it will throw or do nothing. Always check `.isConnected` before restoring focus, and provide a fallback (such as the parent container or a nearby heading).

5. **Focusing too early (before the element is visible)** — Calling `.focus()` on an element that has not been rendered yet, or is inside a `display: none` or `v-if="false"` container, does nothing. Use `requestAnimationFrame`, `nextTick` (Vue), or schedule the focus call after the state update that makes the element visible. In React, this means focusing inside a `useEffect` that runs after render, not synchronously in an event handler.

6. **Not re-querying focusable elements** — The focusable elements inside a modal can change (e.g., a button becomes disabled, a new field appears after validation). If the focus trap caches the list of focusable elements once on mount, it will wrap to the wrong element. Re-query `container.querySelectorAll(FOCUSABLE)` on every Tab keypress.

7. **Missing `role="dialog"` and `aria-modal="true"`** — Screen readers use these attributes to announce the modal and to understand that content behind it is inert. Without them, assistive technology does not know a modal is open, and users may attempt to interact with the obscured page.
