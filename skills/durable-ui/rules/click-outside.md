---
name: click-outside
description: Close dropdowns, context menus, popovers, modals, and dialogs by clicking outside, clicking the backdrop, or pressing Escape — with hooks for React, Vue, and Svelte
metadata:
  tags: click-outside, dropdown, context-menu, popover, modal, dialog, backdrop, confirm, escape-key, focus-management, useClickOutside
---

# Click-Outside & Backdrop Dismissal

Dropdowns, context menus, popovers, modals, and confirm dialogs must close when the user clicks outside them (or on the backdrop) or presses Escape. This is a fundamental UI interaction pattern. Without it, menus stack up, modals trap users, and the page feels broken.

## Architecture

```
User opens menu → Set `open = true` → Render menu
                                        ↓
User clicks outside ──→ mousedown listener on document ──→ Set `open = false`
User presses Escape ──→ keydown listener on document ───→ Set `open = false`
```

The pattern requires three pieces:

1. **A ref** pointing to the menu container element
2. **A mousedown listener** on `document` that checks if the click target is outside the ref
3. **A keydown listener** on `document` that checks for the `Escape` key

Use `mousedown` instead of `click` — it fires before `click` and prevents the menu from briefly reopening when the trigger button is inside the same container.

## useClickOutside Hook / Composable

### React

```jsx
// assets/js/hooks/useClickOutside.js
import { useEffect, useRef, useCallback } from 'react'

export function useClickOutside(handler) {
  const ref = useRef(null)
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        handlerRef.current()
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        handlerRef.current()
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return ref
}
```

**Usage**:

```jsx
import { useState } from 'react'
import { useClickOutside } from '~/hooks/useClickOutside'

function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const menuRef = useClickOutside(() => setOpen(false))

  return (
    <div ref={menuRef} className="relative">
      <button onClick={() => setOpen(!open)}>{user.name}</button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
          <a href="/settings" className="block px-4 py-2 hover:bg-gray-100">
            Settings
          </a>
          <a href="/logout" className="block px-4 py-2 hover:bg-gray-100">
            Log out
          </a>
        </div>
      )}
    </div>
  )
}
```

### Vue

```js
// assets/js/composables/clickOutside.js
import { onMounted, onUnmounted, ref } from 'vue'

export function useClickOutside(handler) {
  const elementRef = ref(null)

  function onMouseDown(e) {
    if (elementRef.value && !elementRef.value.contains(e.target)) {
      handler()
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      handler()
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('keydown', onKeyDown)
  })

  return elementRef
}
```

**Usage**:

```vue
<script setup>
import { ref } from 'vue'
import { useClickOutside } from '~/composables/clickOutside'

const open = ref(false)
const menuRef = useClickOutside(() => (open.value = false))
</script>

<template>
  <div ref="menuRef" class="relative">
    <button @click="open = !open">Menu</button>
    <div
      v-if="open"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1"
    >
      <a href="/settings" class="block px-4 py-2 hover:bg-gray-100">Settings</a>
      <a href="/logout" class="block px-4 py-2 hover:bg-gray-100">Log out</a>
    </div>
  </div>
</template>
```

### Svelte

```js
// assets/js/actions/clickOutside.js
export function clickOutside(node, handler) {
  function onMouseDown(e) {
    if (!node.contains(e.target)) {
      handler()
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      handler()
    }
  }

  document.addEventListener('mousedown', onMouseDown)
  document.addEventListener('keydown', onKeyDown)

  return {
    update(newHandler) {
      handler = newHandler
    },
    destroy() {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }
}
```

**Usage**:

```svelte
<script>
  import { clickOutside } from '~/actions/clickOutside'

  let open = $state(false)
</script>

<div use:clickOutside={() => open = false} class="relative">
  <button onclick={() => open = !open}>
    Menu
  </button>
  {#if open}
    <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
      <a href="/settings" class="block px-4 py-2 hover:bg-gray-100">Settings</a>
      <a href="/logout" class="block px-4 py-2 hover:bg-gray-100">Log out</a>
    </div>
  {/if}
</div>
```

## Complete Example: Context Menu

A right-click context menu that positions itself at the cursor and dismisses on outside click or Escape:

### React

```jsx
import { useState, useCallback } from 'react'
import { useClickOutside } from '~/hooks/useClickOutside'

function FileList({ files }) {
  const [contextMenu, setContextMenu] = useState(null)
  const menuRef = useClickOutside(() => setContextMenu(null))

  const handleContextMenu = useCallback((e, file) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, file })
  }, [])

  return (
    <div>
      {files.map((file) => (
        <div
          key={file.id}
          onContextMenu={(e) => handleContextMenu(e, file)}
          className="p-2 hover:bg-gray-50 cursor-default"
        >
          {file.name}
        </div>
      ))}

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-white rounded-lg shadow-lg border py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              console.log('Rename', contextMenu.file)
              setContextMenu(null)
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Rename
          </button>
          <button
            onClick={() => {
              console.log('Delete', contextMenu.file)
              setContextMenu(null)
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
```

### Vue

```vue
<script setup>
import { ref } from 'vue'
import { useClickOutside } from '~/composables/clickOutside'

defineProps({ files: { type: Array, required: true } })

const contextMenu = ref(null)
const menuRef = useClickOutside(() => (contextMenu.value = null))

function handleContextMenu(e, file) {
  e.preventDefault()
  contextMenu.value = { x: e.clientX, y: e.clientY, file }
}
</script>

<template>
  <div>
    <div
      v-for="file in files"
      :key="file.id"
      @contextmenu="handleContextMenu($event, file)"
      class="p-2 hover:bg-gray-50 cursor-default"
    >
      {{ file.name }}
    </div>

    <div
      v-if="contextMenu"
      ref="menuRef"
      class="fixed bg-white rounded-lg shadow-lg border py-1 z-50"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <button
        @click="contextMenu = null"
        class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Rename
      </button>
      <button
        @click="contextMenu = null"
        class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        Delete
      </button>
    </div>
  </div>
</template>
```

### Svelte

```svelte
<script>
  import { clickOutside } from '~/actions/clickOutside'

  let { files } = $props()
  let contextMenu = $state(null)

  function handleContextMenu(e, file) {
    e.preventDefault()
    contextMenu = { x: e.clientX, y: e.clientY, file }
  }
</script>

<div>
  {#each files as file (file.id)}
    <div
      oncontextmenu={(e) => handleContextMenu(e, file)}
      class="p-2 hover:bg-gray-50 cursor-default"
    >
      {file.name}
    </div>
  {/each}

  {#if contextMenu}
    <div
      use:clickOutside={() => contextMenu = null}
      class="fixed bg-white rounded-lg shadow-lg border py-1 z-50"
      style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
    >
      <button
        onclick={() => contextMenu = null}
        class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Rename
      </button>
      <button
        onclick={() => contextMenu = null}
        class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        Delete
      </button>
    </div>
  {/if}
</div>
```

## Nested Menus

When a menu contains sub-menus (e.g., a navigation dropdown with fly-out items), the click-outside handler must encompass the entire menu tree. Attach the ref to the **outermost** container:

```jsx
// React example — ref wraps both the trigger and all nested menus
function NavItem({ label, children }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useClickOutside(() => setOpen(false))

  return (
    <div ref={wrapperRef} className="relative">
      <button onClick={() => setOpen(!open)}>{label}</button>
      {open && (
        <div className="absolute left-0 mt-1 bg-white shadow-lg rounded border">
          {children}
        </div>
      )}
    </div>
  )
}
```

If the sub-menu renders via a **portal** (e.g., appended to `<body>` for z-index reasons), the `contains()` check will fail because the portal content isn't inside the ref. In that case, track both elements:

```jsx
export function useClickOutsideMultiple(refs, handler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    function onMouseDown(e) {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(e.target)
      )
      if (isOutside) {
        handlerRef.current()
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        handlerRef.current()
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [refs])
}
```

## Conditional Listeners

Only attach document listeners while the menu is open. This avoids unnecessary event processing when the menu is closed:

### React

```jsx
export function useClickOutside(handler, enabled = true) {
  const ref = useRef(null)
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return

    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        handlerRef.current()
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        handlerRef.current()
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [enabled])

  return ref
}

// Only listen while the dropdown is open
const menuRef = useClickOutside(() => setOpen(false), open)
```

### Vue

```js
export function useClickOutside(handler, enabledRef) {
  const elementRef = ref(null)

  watch(enabledRef, (enabled) => {
    if (enabled) {
      document.addEventListener('mousedown', onMouseDown)
      document.addEventListener('keydown', onKeyDown)
    } else {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('keydown', onKeyDown)
  })

  return elementRef
}
```

## Modal & Dialog Backdrop Dismissal

Modals and confirm dialogs use a different dismissal pattern than dropdowns. Instead of listening on `document`, they have a **backdrop overlay** — clicking it should close the modal, but clicking inside the modal content should not.

The key technique: attach the click handler to the **backdrop element** and check that the click target is the backdrop itself (not a child).

### React

```jsx
// assets/js/components/Modal.jsx
import { useEffect, useCallback } from 'react'

export function Modal({ open, onClose, children }) {
  // Escape key dismissal
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Backdrop click — only close when clicking the backdrop itself
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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        {children}
      </div>
    </div>
  )
}
```

**Usage**:

```jsx
function SettingsPage() {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete account</button>
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)}>
        <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
        <p className="mb-4">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  )
}
```

### Vue

```vue
<!-- assets/js/components/Modal.vue -->
<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

function onKeyDown(e) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    } else {
      document.removeEventListener('keydown', onKeyDown)
    }
  }
)

onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
      <slot />
    </div>
  </div>
</template>
```

**Usage**:

```vue
<script setup>
import Modal from '~/components/Modal.vue'
import { ref } from 'vue'

const showConfirm = ref(false)
</script>

<template>
  <button @click="showConfirm = true">Delete account</button>
  <Modal :open="showConfirm" @close="showConfirm = false">
    <h2 class="text-lg font-bold mb-4">Are you sure?</h2>
    <p class="mb-4">This action cannot be undone.</p>
    <div class="flex gap-2 justify-end">
      <button @click="showConfirm = false" class="px-4 py-2 text-gray-600">
        Cancel
      </button>
      <button
        @click="handleDelete"
        class="px-4 py-2 bg-red-600 text-white rounded"
      >
        Delete
      </button>
    </div>
  </Modal>
</template>
```

### Svelte

```svelte
<!-- assets/js/components/Modal.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte'

  let { open, onclose, children } = $props()

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onclose()
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') onclose()
  }

  $effect(() => {
    if (open) {
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
  })
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={handleBackdropClick}
    role="dialog"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
      {@render children()}
    </div>
  </div>
{/if}
```

**Usage**:

```svelte
<script>
  import Modal from '~/components/Modal.svelte'

  let showConfirm = $state(false)
</script>

<button onclick={() => showConfirm = true}>Delete account</button>
<Modal open={showConfirm} onclose={() => showConfirm = false}>
  <h2 class="text-lg font-bold mb-4">Are you sure?</h2>
  <p class="mb-4">This action cannot be undone.</p>
  <div class="flex gap-2 justify-end">
    <button onclick={() => showConfirm = false} class="px-4 py-2 text-gray-600">Cancel</button>
    <button onclick={handleDelete} class="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
  </div>
</Modal>
```

### Confirm Dialog Helper

A reusable confirm pattern that wraps the modal with a promise-based API:

```jsx
// React — useConfirm hook
import { useState, useCallback } from 'react'

export function useConfirm() {
  const [state, setState] = useState({
    open: false,
    resolve: null,
    message: ''
  })

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ open: true, resolve, message })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ open: false, resolve: null, message: '' })
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState({ open: false, resolve: null, message: '' })
  }, [state.resolve])

  return { confirm, ...state, handleConfirm, handleCancel }
}

// Usage
function DangerZone() {
  const { confirm, open, message, handleConfirm, handleCancel } = useConfirm()

  async function deleteAccount() {
    const yes = await confirm('Are you sure you want to delete your account?')
    if (yes) {
      // Proceed with deletion
    }
  }

  return (
    <>
      <button onClick={deleteAccount}>Delete account</button>
      <Modal open={open} onClose={handleCancel}>
        <p className="mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={handleCancel}>Cancel</button>
          <button
            onClick={handleConfirm}
            className="bg-red-600 text-white rounded px-4 py-2"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </>
  )
}
```

### Backdrop vs Click-Outside: When to Use Which

| Pattern                                             | Use for                            | How it works                                  |
| --------------------------------------------------- | ---------------------------------- | --------------------------------------------- |
| **Click-outside** (`useClickOutside`)               | Dropdowns, popovers, context menus | `mousedown` on `document`, check `contains()` |
| **Backdrop click** (`e.target === e.currentTarget`) | Modals, dialogs, drawers, confirms | Click handler on the overlay div itself       |

**Rule of thumb**: If the element floats _alongside_ other content (dropdown), use click-outside. If the element _blocks_ the page with an overlay (modal), use backdrop click.

## URL-Synced Modals (Shareable Deep Links)

Some modals should be **shareable via URL** — if someone pastes the link in Slack, the recipient should land with the modal open. This bridges the dismissal pattern (click-outside.md) with the URL state pattern (url-state.md).

### The Shareability Test for Modals

**"If someone shares this link, should the recipient land with this modal open?"**

| YES — put in URL                       | NO — ephemeral state only         |
| -------------------------------------- | --------------------------------- |
| Pricing detail: `/pricing?plan=pro`    | Confirm dialog: "Delete this?"    |
| Photo lightbox: `/gallery?photo=42`    | Error/validation modal            |
| Edit record: `/users?edit=123`         | Cookie consent                    |
| Preview overlay: `/docs?preview=intro` | Onboarding first-visit modal      |
| Auth modal: `/app?auth=login`          | Any modal requiring prior context |

### useModalRoute Hook / Composable

The pattern: read `?modal=value` on mount, open the modal if present. Use `pushState` when opening (so the back button closes it) and listen for `popstate` to sync.

#### React

```jsx
// assets/js/hooks/useModalRoute.js
import { useState, useEffect, useCallback } from 'react'

export function useModalRoute(paramKey) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get(paramKey)
  })

  const open = useCallback(
    (modalValue) => {
      setValue(modalValue)
      const url = new URL(window.location.href)
      url.searchParams.set(paramKey, modalValue)
      window.history.pushState({ modal: paramKey }, '', url.toString())
    },
    [paramKey]
  )

  const close = useCallback(() => {
    setValue(null)
    const url = new URL(window.location.href)
    url.searchParams.delete(paramKey)
    // Go back if we pushed a modal state, otherwise just replace
    if (window.history.state?.modal === paramKey) {
      window.history.back()
    } else {
      window.history.replaceState({}, '', url.toString())
    }
  }, [paramKey])

  // Sync with back/forward navigation
  useEffect(() => {
    function onPopState() {
      const param = new URLSearchParams(window.location.search).get(paramKey)
      setValue(param)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [paramKey])

  return {
    isOpen: value !== null,
    value,
    open,
    close
  }
}
```

**Usage — Photo lightbox**:

```jsx
function GalleryPage({ photos }) {
  const modal = useModalRoute('photo')
  const activePhoto = photos.find((p) => String(p.id) === modal.value)

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.thumbnail}
            onClick={() => modal.open(String(photo.id))}
            className="cursor-pointer rounded hover:opacity-80"
          />
        ))}
      </div>

      <Modal open={modal.isOpen} onClose={modal.close}>
        {activePhoto && (
          <img src={activePhoto.fullSize} className="max-w-full max-h-[80vh]" />
        )}
      </Modal>
    </div>
  )
}
```

#### Vue

```js
// assets/js/composables/modalRoute.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useModalRoute(paramKey) {
  const value = ref(null)

  onMounted(() => {
    value.value = new URLSearchParams(window.location.search).get(paramKey)
  })

  function open(modalValue) {
    value.value = modalValue
    const url = new URL(window.location.href)
    url.searchParams.set(paramKey, modalValue)
    window.history.pushState({ modal: paramKey }, '', url.toString())
  }

  function close() {
    value.value = null
    const url = new URL(window.location.href)
    url.searchParams.delete(paramKey)
    if (window.history.state?.modal === paramKey) {
      window.history.back()
    } else {
      window.history.replaceState({}, '', url.toString())
    }
  }

  function onPopState() {
    value.value = new URLSearchParams(window.location.search).get(paramKey)
  }

  onMounted(() => window.addEventListener('popstate', onPopState))
  onUnmounted(() => window.removeEventListener('popstate', onPopState))

  return {
    isOpen: computed(() => value.value !== null),
    value,
    open,
    close
  }
}
```

**Usage**:

```vue
<script setup>
import { useModalRoute } from '~/composables/modalRoute'
import { computed } from 'vue'
import Modal from '~/components/Modal.vue'

const props = defineProps({ photos: Array })
const modal = useModalRoute('photo')
const activePhoto = computed(() =>
  props.photos.find((p) => String(p.id) === modal.value.value)
)
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <img
      v-for="photo in photos"
      :key="photo.id"
      :src="photo.thumbnail"
      @click="modal.open(String(photo.id))"
      class="cursor-pointer rounded hover:opacity-80"
    />
  </div>
  <Modal :open="modal.isOpen.value" @close="modal.close">
    <img
      v-if="activePhoto"
      :src="activePhoto.fullSize"
      class="max-w-full max-h-[80vh]"
    />
  </Modal>
</template>
```

#### Svelte

```js
// assets/js/stores/modalRoute.js
import { writable, derived } from 'svelte/store'

export function modalRouteStore(paramKey) {
  const isBrowser = typeof window !== 'undefined'

  const initial = isBrowser
    ? new URLSearchParams(window.location.search).get(paramKey)
    : null

  const value = writable(initial)
  const isOpen = derived(value, ($v) => $v !== null)

  if (isBrowser) {
    window.addEventListener('popstate', () => {
      value.set(new URLSearchParams(window.location.search).get(paramKey))
    })
  }

  return {
    value,
    isOpen,
    open(modalValue) {
      value.set(modalValue)
      const url = new URL(window.location.href)
      url.searchParams.set(paramKey, modalValue)
      window.history.pushState({ modal: paramKey }, '', url.toString())
    },
    close() {
      value.set(null)
      const url = new URL(window.location.href)
      url.searchParams.delete(paramKey)
      if (window.history.state?.modal === paramKey) {
        window.history.back()
      } else {
        window.history.replaceState({}, '', url.toString())
      }
    }
  }
}
```

**Usage**:

```svelte
<script>
  import { modalRouteStore } from '~/stores/modalRoute'
  import Modal from '~/components/Modal.svelte'

  let { photos } = $props()
  const modal = modalRouteStore('photo')
  const activePhoto = $derived(photos.find((p) => String(p.id) === $modal.value))
</script>

<div class="grid grid-cols-3 gap-4">
  {#each photos as photo (photo.id)}
    <img
      src={photo.thumbnail}
      onclick={() => modal.open(String(photo.id))}
      class="cursor-pointer rounded hover:opacity-80"
    />
  {/each}
</div>

<Modal open={$modal.isOpen} onclose={modal.close}>
  {#if activePhoto}
    <img src={activePhoto.fullSize} class="max-w-full max-h-[80vh]" />
  {/if}
</Modal>
```

### Why pushState for Modals

Use `pushState` (not `replaceState`) when opening a URL-synced modal because:

1. **Back button closes the modal** — This matches user expectations. Pressing back should dismiss the modal and reveal the page underneath, not navigate away entirely.
2. **History is clean** — One entry for the page, one for the modal. Back once = close modal. Back again = leave page.
3. **Deep links work** — Sharing `/gallery?photo=42` opens the lightbox. Pressing back on that shared link navigates to `/gallery`.

## Common Mistakes

1. **Using `click` instead of `mousedown`** — If the trigger button is inside the ref container, `click` fires after the menu opens, immediately closing it. `mousedown` fires first, breaking this race condition.

2. **Forgetting Escape key** — Click-outside alone isn't enough. Keyboard users and screen reader users rely on Escape to dismiss overlays. Always pair them.

3. **Not stopping propagation wisely** — Avoid `e.stopPropagation()` on menu items. It breaks other click-outside handlers up the tree. Instead, call the close handler explicitly.

4. **Attaching listeners unconditionally** — If you have 20 dropdowns on a page, each adding document listeners regardless of open state, you waste resources. Use conditional listeners.

5. **Missing cleanup** — Always remove event listeners on unmount. Leaked listeners cause memory leaks and ghost interactions.

6. **Using click-outside for modals** — Don't attach a `document` mousedown listener to close modals. The backdrop overlay is already there — just check `e.target === e.currentTarget` on it. Simpler, more performant, and doesn't interfere with other click-outside handlers.

7. **Not locking body scroll** — When a modal is open, the page behind it should not scroll. Add `document.body.style.overflow = 'hidden'` on open and restore it on close.
