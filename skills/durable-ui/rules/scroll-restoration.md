---
name: scroll-restoration
description: Restore scroll position on back navigation for window and scrollable containers, scroll-to-anchor with async elements, and a back-to-top button pattern
metadata:
  tags: scroll-restoration, sessionStorage, preserveScroll, back-navigation, scrollable-container, anchor, hash, back-to-top, debounce, MutationObserver
---

# Scroll Position Restoration

Navigate from a long list to a detail page, press back, and you land at the top of the list instead of where you left off. Inertia.js provides `preserveScroll` for in-app navigations, but it does not cover every scenario:

- **Full page navigation** — When the user opens a link in a new tab, or the navigation is a full page load rather than an Inertia visit, `preserveScroll` has no effect.
- **Scrollable containers** — `preserveScroll` only handles the window scroll position. Scrollable `<div>` elements (chat panels, side panels, data tables) reset independently.
- **Infinite scroll lists** — After loading 200 items and clicking into one, `preserveScroll` restores the window position but the DOM may not have rendered enough items yet to scroll to.

The solution: save scroll positions to `sessionStorage` (keyed by URL), restore them on mount, and disable the browser's built-in scroll restoration when taking manual control.

## Architecture

```
User scrolls → Debounce (150ms) → Save to sessionStorage
                                    key: SCROLL_{pathname}
                                    ↓
User navigates away → Position saved
                                    ↓
User presses Back → Page mounts → Read sessionStorage → Scroll to saved position
                                    ↓
New navigation (not back) → No restore → Clear stale entries
```

## useScrollRestore Hook / Composable

Saves and restores window scroll position using `sessionStorage`, keyed by the current URL pathname.

### React

```jsx
// assets/js/hooks/useScrollRestore.js
import { useEffect, useRef } from 'react'

export function useScrollRestore() {
  const scrollKey = `SCROLL_${window.location.pathname}`
  const isRestoring = useRef(false)
  const debounceRef = useRef(null)

  // Take control of scroll restoration
  useEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = previous
    }
  }, [])

  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring.current = true
      // Wait for content to render before restoring
      requestAnimationFrame(() => {
        window.scrollTo(0, position.y)
        // Allow a brief window for the scroll to settle
        setTimeout(() => {
          isRestoring.current = false
        }, 100)
      })
    }
  }, [scrollKey])

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    function handleScroll() {
      if (isRestoring.current) return
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        sessionStorage.setItem(scrollKey, JSON.stringify({ y: window.scrollY }))
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(debounceRef.current)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollKey])
}
```

**Usage**:

```jsx
import { useScrollRestore } from '~/hooks/useScrollRestore'

function PostsIndexPage({ posts }) {
  useScrollRestore()

  return (
    <div>
      {posts.map((post) => (
        <a
          key={post.id}
          href={`/posts/${post.id}`}
          className="block p-4 border-b"
        >
          {post.title}
        </a>
      ))}
    </div>
  )
}
```

### Vue

```js
// assets/js/composables/scrollRestore.js
import { onMounted, onUnmounted, ref } from 'vue'

export function useScrollRestore() {
  const scrollKey = `SCROLL_${window.location.pathname}`
  const isRestoring = ref(false)
  let debounceTimer

  function handleScroll() {
    if (isRestoring.value) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sessionStorage.setItem(scrollKey, JSON.stringify({ y: window.scrollY }))
    }, 150)
  }

  onMounted(() => {
    // Take control of scroll restoration
    history.scrollRestoration = 'manual'

    // Restore scroll position
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring.value = true
      requestAnimationFrame(() => {
        window.scrollTo(0, position.y)
        setTimeout(() => {
          isRestoring.value = false
        }, 100)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    clearTimeout(debounceTimer)
    window.removeEventListener('scroll', handleScroll)
  })
}
```

**Usage**:

```vue
<script setup>
import { useScrollRestore } from '~/composables/scrollRestore'

defineProps({ posts: Array })
useScrollRestore()
</script>

<template>
  <div>
    <a
      v-for="post in posts"
      :key="post.id"
      :href="`/posts/${post.id}`"
      class="block p-4 border-b"
    >
      {{ post.title }}
    </a>
  </div>
</template>
```

### Svelte

```js
// assets/js/actions/scrollRestore.js
import { onMount, onDestroy } from 'svelte'

export function useScrollRestore() {
  let isRestoring = false
  let debounceTimer

  function handleScroll() {
    if (isRestoring) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const scrollKey = `SCROLL_${window.location.pathname}`
      sessionStorage.setItem(scrollKey, JSON.stringify({ y: window.scrollY }))
    }, 150)
  }

  onMount(() => {
    history.scrollRestoration = 'manual'

    const scrollKey = `SCROLL_${window.location.pathname}`
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring = true
      requestAnimationFrame(() => {
        window.scrollTo(0, position.y)
        setTimeout(() => {
          isRestoring = false
        }, 100)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onDestroy(() => {
    clearTimeout(debounceTimer)
    window.removeEventListener('scroll', handleScroll)
  })
}
```

**Usage**:

```svelte
<script>
  import { useScrollRestore } from '~/actions/scrollRestore'

  let { posts } = $props()
  useScrollRestore()
</script>

<div>
  {#each posts as post (post.id)}
    <a href={`/posts/${post.id}`} class="block p-4 border-b">
      {post.title}
    </a>
  {/each}
</div>
```

## Scrollable Container Restoration

Window scroll is only half the problem. Scrollable `<div>` elements (chat panels, side panels, data tables with fixed headers) have their own scroll positions that reset on re-render. Attach scroll restoration to a specific element via a ref.

### React

```jsx
// assets/js/hooks/useContainerScrollRestore.js
import { useEffect, useRef, useCallback } from 'react'

export function useContainerScrollRestore(containerId) {
  const ref = useRef(null)
  const scrollKey = `SCROLL_${containerId}_${window.location.pathname}`
  const isRestoring = useRef(false)
  const debounceRef = useRef(null)

  // Restore on mount
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring.current = true
      requestAnimationFrame(() => {
        el.scrollTop = position.y
        setTimeout(() => {
          isRestoring.current = false
        }, 100)
      })
    }
  }, [scrollKey])

  // Save on scroll (debounced)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    function handleScroll() {
      if (isRestoring.current) return
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        sessionStorage.setItem(scrollKey, JSON.stringify({ y: el.scrollTop }))
      }, 150)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(debounceRef.current)
      el.removeEventListener('scroll', handleScroll)
    }
  }, [scrollKey])

  return ref
}
```

**Usage**:

```jsx
import { useContainerScrollRestore } from '~/hooks/useContainerScrollRestore'

function ChatPanel({ messages }) {
  const scrollRef = useContainerScrollRestore('chat-panel')

  return (
    <div ref={scrollRef} className="h-96 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className="p-3 border-b">
          <strong>{msg.sender}</strong>: {msg.text}
        </div>
      ))}
    </div>
  )
}
```

### Vue

```js
// assets/js/composables/containerScrollRestore.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useContainerScrollRestore(containerId) {
  const elementRef = ref(null)
  const scrollKey = `SCROLL_${containerId}_${window.location.pathname}`
  let isRestoring = false
  let debounceTimer

  function handleScroll() {
    if (isRestoring) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (elementRef.value) {
        sessionStorage.setItem(
          scrollKey,
          JSON.stringify({ y: elementRef.value.scrollTop })
        )
      }
    }, 150)
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return

    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring = true
      requestAnimationFrame(() => {
        el.scrollTop = position.y
        setTimeout(() => {
          isRestoring = false
        }, 100)
      })
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    clearTimeout(debounceTimer)
    elementRef.value?.removeEventListener('scroll', handleScroll)
  })

  return elementRef
}
```

**Usage**:

```vue
<script setup>
import { useContainerScrollRestore } from '~/composables/containerScrollRestore'

defineProps({ messages: Array })
const scrollRef = useContainerScrollRestore('chat-panel')
</script>

<template>
  <div ref="scrollRef" class="h-96 overflow-y-auto">
    <div v-for="msg in messages" :key="msg.id" class="p-3 border-b">
      <strong>{{ msg.sender }}</strong
      >: {{ msg.text }}
    </div>
  </div>
</template>
```

### Svelte

```js
// assets/js/actions/containerScrollRestore.js
export function containerScrollRestore(node, containerId) {
  const scrollKey = `SCROLL_${containerId}_${window.location.pathname}`
  let isRestoring = false
  let debounceTimer

  function handleScroll() {
    if (isRestoring) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sessionStorage.setItem(scrollKey, JSON.stringify({ y: node.scrollTop }))
    }, 150)
  }

  // Restore on attach
  const saved = sessionStorage.getItem(scrollKey)
  if (saved) {
    const position = JSON.parse(saved)
    isRestoring = true
    requestAnimationFrame(() => {
      node.scrollTop = position.y
      setTimeout(() => {
        isRestoring = false
      }, 100)
    })
  }

  node.addEventListener('scroll', handleScroll, { passive: true })

  return {
    destroy() {
      clearTimeout(debounceTimer)
      node.removeEventListener('scroll', handleScroll)
    }
  }
}
```

**Usage**:

```svelte
<script>
  import { containerScrollRestore } from '~/actions/containerScrollRestore'

  let { messages } = $props()
</script>

<div use:containerScrollRestore={'chat-panel'} class="h-96 overflow-y-auto">
  {#each messages as msg (msg.id)}
    <div class="p-3 border-b">
      <strong>{msg.sender}</strong>: {msg.text}
    </div>
  {/each}
</div>
```

## Integration with Inertia.js

Inertia's `preserveScroll` option works for same-page navigations (filters, sorting, pagination) where the component stays mounted. Use it for those cases. Use manual scroll restoration for cross-page navigations where the component unmounts and remounts.

### When to Use Which

| Scenario                                                      | Solution                               |
| ------------------------------------------------------------- | -------------------------------------- |
| Filter / sort / paginate (same page, component stays mounted) | Inertia `preserveScroll: true`         |
| Navigate to detail page and back (component unmounts)         | `useScrollRestore` with sessionStorage |
| Scrollable container inside a page                            | `useContainerScrollRestore`            |
| Full page reload (F5) or new tab                              | `useScrollRestore` with sessionStorage |

### Inertia preserveScroll for Same-Page Updates

```jsx
// React — preserveScroll keeps window position during filter changes
import { router } from '@inertiajs/react'

function updateFilter(key, value) {
  router.get(
    '/posts',
    { [key]: value },
    {
      preserveState: true,
      preserveScroll: true,
      replace: true
    }
  )
}
```

### Saving Scroll on Inertia Navigation

Hook into Inertia's `navigate` event to save scroll position right before leaving the page. This is more reliable than saving on every scroll event alone, because it captures the exact position at departure time:

#### React

```jsx
// assets/js/hooks/useScrollRestore.js (enhanced with Inertia integration)
import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'

export function useScrollRestore() {
  const isRestoring = useRef(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    history.scrollRestoration = 'manual'

    const scrollKey = `SCROLL_${window.location.pathname}`

    // Restore on mount
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring.current = true
      requestAnimationFrame(() => {
        window.scrollTo(0, position.y)
        setTimeout(() => {
          isRestoring.current = false
        }, 100)
      })
    }

    // Save on scroll (debounced)
    function handleScroll() {
      if (isRestoring.current) return
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        sessionStorage.setItem(
          `SCROLL_${window.location.pathname}`,
          JSON.stringify({ y: window.scrollY })
        )
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Also save right before Inertia navigates away
    const removeBeforeListener = router.on('before', () => {
      sessionStorage.setItem(
        `SCROLL_${window.location.pathname}`,
        JSON.stringify({ y: window.scrollY })
      )
    })

    return () => {
      clearTimeout(debounceRef.current)
      window.removeEventListener('scroll', handleScroll)
      removeBeforeListener()
    }
  }, [])
}
```

#### Vue

```js
// assets/js/composables/scrollRestore.js (enhanced with Inertia integration)
import { onMounted, onUnmounted } from 'vue'
import { router } from '@inertiajs/vue3'

export function useScrollRestore() {
  let isRestoring = false
  let debounceTimer
  let removeBeforeListener

  function handleScroll() {
    if (isRestoring) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sessionStorage.setItem(
        `SCROLL_${window.location.pathname}`,
        JSON.stringify({ y: window.scrollY })
      )
    }, 150)
  }

  onMounted(() => {
    history.scrollRestoration = 'manual'

    const scrollKey = `SCROLL_${window.location.pathname}`
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring = true
      requestAnimationFrame(() => {
        window.scrollTo(0, position.y)
        setTimeout(() => {
          isRestoring = false
        }, 100)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    removeBeforeListener = router.on('before', () => {
      sessionStorage.setItem(
        `SCROLL_${window.location.pathname}`,
        JSON.stringify({ y: window.scrollY })
      )
    })
  })

  onUnmounted(() => {
    clearTimeout(debounceTimer)
    window.removeEventListener('scroll', handleScroll)
    removeBeforeListener?.()
  })
}
```

#### Svelte

```js
// assets/js/actions/scrollRestore.js (enhanced with Inertia integration)
import { onMount, onDestroy } from 'svelte'
import { router } from '@inertiajs/svelte'

export function useScrollRestore() {
  let isRestoring = false
  let debounceTimer
  let removeBeforeListener

  function handleScroll() {
    if (isRestoring) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sessionStorage.setItem(
        `SCROLL_${window.location.pathname}`,
        JSON.stringify({ y: window.scrollY })
      )
    }, 150)
  }

  onMount(() => {
    history.scrollRestoration = 'manual'

    const scrollKey = `SCROLL_${window.location.pathname}`
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      const position = JSON.parse(saved)
      isRestoring = true
      requestAnimationFrame(() => {
        window.scrollTo(0, position.y)
        setTimeout(() => {
          isRestoring = false
        }, 100)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    removeBeforeListener = router.on('before', () => {
      sessionStorage.setItem(
        `SCROLL_${window.location.pathname}`,
        JSON.stringify({ y: window.scrollY })
      )
    })
  })

  onDestroy(() => {
    clearTimeout(debounceTimer)
    window.removeEventListener('scroll', handleScroll)
    removeBeforeListener?.()
  })
}
```

## Scroll to Anchor / Hash

When the URL contains a hash like `/docs#api-reference`, the page should scroll to that element. The challenge: if the target element renders asynchronously (loaded via Inertia props, deferred data, or lazy components), it may not exist in the DOM when the page first mounts. Use a `MutationObserver` to watch for it with a timeout fallback.

### React

```jsx
// assets/js/hooks/useScrollToHash.js
import { useEffect } from 'react'

export function useScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const id = hash.slice(1)

    function scrollToElement() {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    // Try immediately
    if (scrollToElement()) return

    // If the element is not yet rendered, observe DOM changes
    const observer = new MutationObserver(() => {
      if (scrollToElement()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Give up after 5 seconds
    const timeout = setTimeout(() => observer.disconnect(), 5000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [])
}
```

**Usage**:

```jsx
import { useScrollToHash } from '~/hooks/useScrollToHash'

function DocsPage({ content }) {
  useScrollToHash()

  return (
    <article>
      <h2 id="getting-started">Getting Started</h2>
      <p>{content.gettingStarted}</p>
      <h2 id="api-reference">API Reference</h2>
      <p>{content.apiReference}</p>
    </article>
  )
}
```

### Vue

```js
// assets/js/composables/scrollToHash.js
import { onMounted, onUnmounted } from 'vue'

export function useScrollToHash() {
  let observer
  let timeout

  onMounted(() => {
    const hash = window.location.hash
    if (!hash) return

    const id = hash.slice(1)

    function scrollToElement() {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    if (scrollToElement()) return

    observer = new MutationObserver(() => {
      if (scrollToElement()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    timeout = setTimeout(() => observer?.disconnect(), 5000)
  })

  onUnmounted(() => {
    observer?.disconnect()
    clearTimeout(timeout)
  })
}
```

**Usage**:

```vue
<script setup>
import { useScrollToHash } from '~/composables/scrollToHash'

defineProps({ content: Object })
useScrollToHash()
</script>

<template>
  <article>
    <h2 id="getting-started">Getting Started</h2>
    <p>{{ content.gettingStarted }}</p>
    <h2 id="api-reference">API Reference</h2>
    <p>{{ content.apiReference }}</p>
  </article>
</template>
```

### Svelte

```js
// assets/js/actions/scrollToHash.js
import { onMount, onDestroy } from 'svelte'

export function useScrollToHash() {
  let observer
  let timeout

  onMount(() => {
    const hash = window.location.hash
    if (!hash) return

    const id = hash.slice(1)

    function scrollToElement() {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    if (scrollToElement()) return

    observer = new MutationObserver(() => {
      if (scrollToElement()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    timeout = setTimeout(() => observer?.disconnect(), 5000)
  })

  onDestroy(() => {
    observer?.disconnect()
    clearTimeout(timeout)
  })
}
```

**Usage**:

```svelte
<script>
  import { useScrollToHash } from '~/actions/scrollToHash'

  let { content } = $props()
  useScrollToHash()
</script>

<article>
  <h2 id="getting-started">Getting Started</h2>
  <p>{content.gettingStarted}</p>
  <h2 id="api-reference">API Reference</h2>
  <p>{content.apiReference}</p>
</article>
```

## Back to Top Button

A floating button that appears when the user scrolls past a threshold (e.g., 400px) and smoothly scrolls back to the top when clicked. The button must not flash briefly during scroll restoration — use the same `isRestoring` guard.

### React

```jsx
// assets/js/components/BackToTop.jsx
import { useState, useEffect, useRef } from 'react'

export function BackToTop({ threshold = 400 }) {
  const [visible, setVisible] = useState(false)
  const isRestoring = useRef(false)

  useEffect(() => {
    // Check if a scroll restore is in progress
    const scrollKey = `SCROLL_${window.location.pathname}`
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      isRestoring.current = true
      // Wait for restore to complete before showing the button
      setTimeout(() => {
        isRestoring.current = false
        setVisible(window.scrollY > threshold)
      }, 300)
    }

    function handleScroll() {
      if (isRestoring.current) return
      setVisible(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-opacity"
      aria-label="Back to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  )
}
```

**Usage**:

```jsx
function PostsIndexPage({ posts }) {
  useScrollRestore()

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="p-4 border-b">
          {post.title}
        </div>
      ))}
      <BackToTop />
    </div>
  )
}
```

### Vue

```vue
<!-- assets/js/components/BackToTop.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  threshold: { type: Number, default: 400 }
})

const visible = ref(false)
let isRestoring = false

function handleScroll() {
  if (isRestoring) return
  visible.value = window.scrollY > props.threshold
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  const scrollKey = `SCROLL_${window.location.pathname}`
  const saved = sessionStorage.getItem(scrollKey)
  if (saved) {
    isRestoring = true
    setTimeout(() => {
      isRestoring = false
      visible.value = window.scrollY > props.threshold
    }, 300)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <button
    v-if="visible"
    @click="scrollToTop"
    class="fixed bottom-8 right-8 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-opacity"
    aria-label="Back to top"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 15l7-7 7 7"
      />
    </svg>
  </button>
</template>
```

**Usage**:

```vue
<script setup>
import { useScrollRestore } from '~/composables/scrollRestore'
import BackToTop from '~/components/BackToTop.vue'

defineProps({ posts: Array })
useScrollRestore()
</script>

<template>
  <div>
    <div v-for="post in posts" :key="post.id" class="p-4 border-b">
      {{ post.title }}
    </div>
    <BackToTop />
  </div>
</template>
```

### Svelte

```svelte
<!-- assets/js/components/BackToTop.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte'

  let { threshold = 400 } = $props()
  let visible = $state(false)
  let isRestoring = false

  function handleScroll() {
    if (isRestoring) return
    visible = window.scrollY > threshold
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  onMount(() => {
    const scrollKey = `SCROLL_${window.location.pathname}`
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      isRestoring = true
      setTimeout(() => {
        isRestoring = false
        visible = window.scrollY > threshold
      }, 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onDestroy(() => {
    window.removeEventListener('scroll', handleScroll)
  })
</script>

{#if visible}
  <button
    onclick={scrollToTop}
    class="fixed bottom-8 right-8 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-opacity"
    aria-label="Back to top"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
    </svg>
  </button>
{/if}
```

**Usage**:

```svelte
<script>
  import { useScrollRestore } from '~/actions/scrollRestore'
  import BackToTop from '~/components/BackToTop.svelte'

  let { posts } = $props()
  useScrollRestore()
</script>

<div>
  {#each posts as post (post.id)}
    <div class="p-4 border-b">{post.title}</div>
  {/each}
  <BackToTop />
</div>
```

## Common Mistakes

1. **Using localStorage instead of sessionStorage** — Scroll positions are tied to a browsing session. If a user opens the same page tomorrow, the content may have changed and the saved scroll position would be meaningless or point past the end of the page. Use `sessionStorage`, which clears when the tab closes.

2. **Restoring scroll before content has rendered** — If you call `window.scrollTo()` synchronously during mount, the page content may not have rendered yet, so the document is too short to scroll to. Always use `requestAnimationFrame` to wait one paint cycle, and for dynamic content (infinite scroll, lazy-loaded data), wait for the data to arrive before restoring.

3. **Not debouncing scroll event saves** — The `scroll` event fires 60+ times per second. Writing to `sessionStorage` on every event causes jank and wastes I/O. Debounce saves to 100-200ms. The position captured will be close enough — users do not notice a 150ms discrepancy.

4. **Saving scroll position on every navigation** — Only save the position when the user is _leaving_ the page, not on every route change. In the Inertia integration, listening to the `before` event captures the moment of departure. Saving on `navigate` (after arrival) would save the position of the _new_ page under the _old_ key.

5. **Fighting the browser's built-in scroll restoration** — Browsers have their own scroll restoration for back/forward navigation (`history.scrollRestoration = 'auto'`). If you implement manual scroll restoration without setting `history.scrollRestoration = 'manual'`, the browser and your code will race each other, producing unpredictable jumps. Always set it to `'manual'` when taking control, and restore the previous value on cleanup.

6. **Not suppressing the back-to-top button during restore** — When scroll restoration triggers, the page rapidly scrolls from 0 to the saved position. Without an `isRestoring` guard, the back-to-top button flashes into view during this scroll and then disappears. Use a flag to suppress visibility checks while a restore is in progress.

7. **Forgetting to clean up MutationObserver** — When using `MutationObserver` for scroll-to-anchor, always disconnect it when the element is found, when the component unmounts, or after a timeout. An undisconnected observer on `document.body` with `subtree: true` will fire on every single DOM mutation, degrading performance.
