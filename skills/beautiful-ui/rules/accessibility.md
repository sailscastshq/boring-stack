---
name: accessibility
description: Practical accessibility patterns — ARIA roles, live regions, skip links, focus management, keyboard navigation, screen reader announcements, color contrast, and reduced motion
metadata:
  tags: accessibility, a11y, aria, screen-reader, focus-management, keyboard-navigation, skip-link, live-region, contrast, reduced-motion, wcag
---

# Accessibility Patterns

Accessibility is not an add-on — it's part of writing correct HTML. These patterns ensure your UI works for everyone: keyboard users, screen reader users, users with low vision, and users with motor impairments.

## The First Rule of ARIA

**If a native HTML element exists with the semantics and behavior you need, use it instead of adding ARIA.** Pages with ARIA present average 41% more detected accessibility errors than those without (WebAIM Million analysis). ARIA used incorrectly does more harm than good.

| You want...        | Use native HTML               | Not ARIA                     |
| ------------------ | ----------------------------- | ---------------------------- |
| A clickable action | `<button>`                    | `<div role="button">`        |
| Navigation links   | `<nav>`                       | `<div role="navigation">`    |
| Page header        | `<header>`                    | `<div role="banner">`        |
| Page footer        | `<footer>`                    | `<div role="contentinfo">`   |
| Main content       | `<main>`                      | `<div role="main">`          |
| Sidebar            | `<aside>`                     | `<div role="complementary">` |
| Form field         | `<input>` + `<label>`         | `<div role="textbox">`       |
| Checkbox           | `<input type="checkbox">`     | `<div role="checkbox">`      |
| Disclosure         | `<details>` + `<summary>`     | `<div>` + `aria-expanded`    |
| Modal dialog       | `<dialog>` with `showModal()` | `<div role="dialog">`        |

ARIA is needed only when building custom widgets that have no native HTML equivalent: tabs, combobox/autocomplete, tree views, and custom sliders.

## Skip Links

Skip links let keyboard users jump past navigation to the main content. Without them, keyboard users must tab through every nav link on every page load.

```html
<!-- First element inside <body> -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-blue-500"
>
  Skip to main content
</a>

<!-- Main content target -->
<main id="main-content" tabindex="-1">
  <!-- page content -->
</main>
```

The `sr-only` class hides the link visually. `focus:not-sr-only` reveals it when the user presses Tab. The `tabindex="-1"` on `<main>` allows it to receive programmatic focus without appearing in the tab order.

### React Layout

```jsx
export default function AppLayout({ children }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <header>{/* nav */}</header>
      <main id="main-content" tabindex="-1" className="flex-1">
        {children}
      </main>
      <footer>{/* footer */}</footer>
    </>
  )
}
```

### Vue Layout

```vue
<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
  >
    Skip to main content
  </a>
  <header><!-- nav --></header>
  <main id="main-content" tabindex="-1" class="flex-1">
    <slot />
  </main>
  <footer><!-- footer --></footer>
</template>
```

### Svelte Layout

```svelte
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
>
  Skip to main content
</a>
<header><!-- nav --></header>
<main id="main-content" tabindex="-1" class="flex-1">
  {@render children()}
</main>
<footer><!-- footer --></footer>
```

## Live Regions

Live regions announce dynamic content changes to screen readers. Without them, users miss toast notifications, form errors, loading states, and real-time updates.

### aria-live Values

| Value       | Behavior                                  | Use for                                |
| ----------- | ----------------------------------------- | -------------------------------------- |
| `polite`    | Waits for the user to finish current task | Toast notifications, status updates    |
| `assertive` | Interrupts immediately                    | Errors, urgent alerts, form validation |
| `off`       | Ignored (default)                         | Content that updates too frequently    |

### Toast Notifications

The live region container must exist in the DOM **before** the message appears. Screen readers only announce content that is **added** to a live region, not content that exists when the region mounts.

```jsx
// React — toast container always in the DOM
function ToastContainer({ toasts }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 space-y-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="rounded-lg bg-white p-4 shadow-lg border"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
```

```vue
<!-- Vue — toast container -->
<template>
  <div
    aria-live="polite"
    aria-atomic="false"
    class="fixed bottom-4 right-4 z-50 space-y-2"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      role="status"
      class="rounded-lg bg-white p-4 shadow-lg border"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
```

```svelte
<!-- Svelte — toast container -->
<div aria-live="polite" aria-atomic="false" class="fixed bottom-4 right-4 z-50 space-y-2">
  {#each toasts as toast (toast.id)}
    <div role="status" class="rounded-lg bg-white p-4 shadow-lg border">
      {toast.message}
    </div>
  {/each}
</div>
```

### Form Error Summary

Use `role="alert"` (implicitly `aria-live="assertive"`) for error summaries that appear after form submission:

```jsx
{
  Object.keys(errors).length > 0 && (
    <div
      role="alert"
      className="rounded-md bg-red-50 border border-red-200 p-4 mb-6"
    >
      <h2 className="text-sm font-medium text-red-800">
        There were {Object.keys(errors).length} errors with your submission
      </h2>
      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-red-700">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} className="underline">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Loading States

```jsx
;<button disabled={processing} aria-busy={processing}>
  {processing ? 'Saving...' : 'Save changes'}
</button>

{
  /* Or with a separate status region */
}
;<div aria-live="polite" className="text-sm text-gray-500">
  {processing && <p>Saving your changes...</p>}
  {recentlySuccessful && <p>Changes saved.</p>}
</div>
```

### Key Rules

- **`aria-atomic="true"`** — Announces the entire region content, not just the changed part. Use for single-value displays (e.g., a counter).
- **`aria-atomic="false"`** (default) — Announces only the added/changed content. Use for lists of toasts.
- **Don't use `role="alert"` on every error** — Multiple simultaneous alerts overwhelm screen readers. Use `role="alert"` only on the error summary, and `aria-describedby` for individual field errors.

## Focus Management

### Focus Return After Modal Close

When a modal closes, focus must return to the element that triggered it. Without this, keyboard users lose their place on the page.

```jsx
// React
import { useRef } from 'react'

function DeleteButton({ onDelete }) {
  const triggerRef = useRef(null)
  const dialogRef = useRef(null)

  function open() {
    dialogRef.current?.showModal()
  }

  function handleClose() {
    if (dialogRef.current?.returnValue === 'confirm') {
      onDelete()
    }
    // Return focus to the trigger button
    triggerRef.current?.focus()
  }

  return (
    <>
      <button ref={triggerRef} onClick={open}>
        Delete
      </button>
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="rounded-lg p-6 backdrop:bg-black/50"
      >
        <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
        <form method="dialog" className="flex gap-2 justify-end">
          <button value="cancel">Cancel</button>
          <button
            value="confirm"
            className="bg-red-600 text-white rounded px-4 py-2"
          >
            Delete
          </button>
        </form>
      </dialog>
    </>
  )
}
```

### Focus After List Item Deletion

When a list item is deleted, focus should move to the next item (or previous if last was deleted). Without this, focus jumps to `<body>` and the user loses context.

```jsx
// React
function TaskList({ tasks, onDelete }) {
  const itemRefs = useRef({})

  function handleDelete(id, index) {
    onDelete(id)
    // Focus next item, or previous if deleting the last item
    const remaining = tasks.filter((t) => t.id !== id)
    const nextIndex = Math.min(index, remaining.length - 1)
    const nextTask = remaining[nextIndex]
    if (nextTask) {
      requestAnimationFrame(() => {
        itemRefs.current[nextTask.id]?.focus()
      })
    }
  }

  return (
    <ul>
      {tasks.map((task, index) => (
        <li
          key={task.id}
          ref={(el) => (itemRefs.current[task.id] = el)}
          tabIndex={-1}
          className="flex items-center justify-between py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <span>{task.title}</span>
          <button
            onClick={() => handleDelete(task.id, index)}
            aria-label={`Delete ${task.title}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
```

### Focus Trapping

The native `<dialog>` element with `showModal()` traps focus automatically — Tab cycles within the dialog. If you must build a custom modal without `<dialog>`, trap focus manually:

```jsx
// React — manual focus trap (only needed if NOT using <dialog>)
import { useEffect, useRef } from 'react'

function useFocusTrap(containerRef, enabled) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    first?.focus()
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, enabled])
}
```

**Prefer `<dialog>` with `showModal()`** over manual focus trapping. It handles focus trapping, Escape to close, backdrop click, and `inert` on the rest of the page — all for free.

## Keyboard Navigation

### Interactive Element Rules

| Element     | Expected keyboard behavior               |
| ----------- | ---------------------------------------- |
| `<button>`  | Enter and Space activate it              |
| `<a>`       | Enter activates it                       |
| `<input>`   | Tab focuses, typing enters data          |
| `<select>`  | Tab focuses, arrow keys navigate options |
| Tab/menus   | Arrow keys move between items            |
| Any overlay | Escape dismisses it                      |

### Roving Tabindex for Composite Widgets

For tab panels, toolbars, and menu bars, use "roving tabindex" — only one item in the group is tabbable at a time. Arrow keys move focus between items.

```jsx
// React — Tab panel with roving tabindex
import { useState, useRef } from 'react'

function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef([])

  function handleKeyDown(e, index) {
    let newIndex = index
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1
    } else {
      return
    }
    e.preventDefault()
    setActiveIndex(newIndex)
    tabRefs.current[newIndex]?.focus()
  }

  return (
    <div>
      <div role="tablist" className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              index === activeIndex
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className="p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

```vue
<!-- Vue — Tab panel -->
<script setup>
import { ref } from 'vue'

const props = defineProps({ tabs: Array })
const activeIndex = ref(0)
const tabRefs = ref([])

function handleKeyDown(e, index) {
  let newIndex = index
  if (e.key === 'ArrowRight') newIndex = (index + 1) % props.tabs.length
  else if (e.key === 'ArrowLeft')
    newIndex = (index - 1 + props.tabs.length) % props.tabs.length
  else if (e.key === 'Home') newIndex = 0
  else if (e.key === 'End') newIndex = props.tabs.length - 1
  else return
  e.preventDefault()
  activeIndex.value = newIndex
  tabRefs.value[newIndex]?.focus()
}
</script>

<template>
  <div>
    <div role="tablist" class="flex border-b">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :ref="(el) => (tabRefs[index] = el)"
        role="tab"
        :id="`tab-${tab.id}`"
        :aria-selected="index === activeIndex"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="index === activeIndex ? 0 : -1"
        @click="activeIndex = index"
        @keydown="handleKeyDown($event, index)"
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
          index === activeIndex
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="(tab, index) in tabs"
      :key="tab.id"
      role="tabpanel"
      :id="`panel-${tab.id}`"
      :aria-labelledby="`tab-${tab.id}`"
      v-show="index === activeIndex"
      tabindex="0"
      class="p-4"
    >
      <slot :name="tab.id" />
    </div>
  </div>
</template>
```

## Screen Reader Announcements

### Visually Hidden Text

Use Tailwind's `sr-only` class to provide text that screen readers announce but sighted users don't see:

```html
<!-- Icon-only button with accessible label -->
<button aria-label="Close">
  <svg class="h-5 w-5" aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- Or use sr-only text -->
<button>
  <svg class="h-5 w-5" aria-hidden="true"><!-- X icon --></svg>
  <span class="sr-only">Close</span>
</button>

<!-- Badge with context -->
<span class="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
  3 <span class="sr-only">unread notifications</span>
</span>

<!-- Table caption hidden visually but accessible -->
<table>
  <caption class="sr-only">
    Team members and their roles
  </caption>
  <!-- ... -->
</table>
```

### When to Use Which

| Technique            | Use when...                                    |
| -------------------- | ---------------------------------------------- |
| `aria-label`         | The element has no visible text (icon buttons) |
| `aria-labelledby`    | Another visible element serves as the label    |
| `aria-describedby`   | Supplementary help text, error messages        |
| `sr-only` span       | You need more complex hidden text              |
| `aria-hidden="true"` | Decorative content that should be ignored      |

### Decorative Content

Mark purely visual elements as `aria-hidden="true"` so screen readers skip them:

```html
<!-- Decorative icon — screen reader should ignore it -->
<svg aria-hidden="true" class="h-5 w-5 text-green-500"><!-- check icon --></svg>
<span>Active</span>

<!-- Decorative separator -->
<span aria-hidden="true" class="text-gray-300">|</span>

<!-- Decorative avatar background -->
<div
  aria-hidden="true"
  class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
></div>
```

## Color and Contrast

### WCAG Contrast Requirements

| Level | Normal text   | Large text (18px+ or 14px+ bold) |
| ----- | ------------- | -------------------------------- |
| AA    | 4.5:1 minimum | 3:1 minimum                      |
| AAA   | 7:1 minimum   | 4.5:1 minimum                    |

### Common Tailwind Combinations That Pass AA

| Text color      | Background    | Ratio  | Passes?         |
| --------------- | ------------- | ------ | --------------- |
| `text-gray-900` | white         | ~15:1  | AA + AAA        |
| `text-gray-700` | white         | ~8:1   | AA + AAA        |
| `text-gray-500` | white         | ~4.6:1 | AA only         |
| `text-gray-400` | white         | ~3.1:1 | Large text only |
| `text-white`    | `bg-blue-600` | ~5.4:1 | AA              |
| `text-white`    | `bg-red-600`  | ~4.6:1 | AA              |

### Don't Rely on Color Alone

Never use color as the only way to convey information (WCAG 1.4.1):

```html
<!-- WRONG — color is the only indicator -->
<span class="text-green-600">Active</span>
<span class="text-red-600">Inactive</span>

<!-- RIGHT — text and/or icons supplement color -->
<span class="flex items-center gap-1.5 text-green-600">
  <svg class="h-4 w-4" aria-hidden="true"><!-- check icon --></svg>
  Active
</span>
<span class="flex items-center gap-1.5 text-red-600">
  <svg class="h-4 w-4" aria-hidden="true"><!-- X icon --></svg>
  Inactive
</span>
```

## Reduced Motion

Respect the user's `prefers-reduced-motion` setting. Some users experience motion sickness, seizures, or distraction from animations.

```html
<!-- Tailwind: motion-safe only applies when user hasn't requested reduced motion -->
<div class="motion-safe:transition-all motion-safe:duration-300">
  <!-- animated content -->
</div>

<!-- Tailwind: motion-reduce applies when user prefers reduced motion -->
<div
  class="transition-all duration-300 motion-reduce:transition-none motion-reduce:animate-none"
>
  <!-- falls back to no animation -->
</div>
```

### Practical Pattern

```jsx
// Loading spinner: still visible but doesn't spin in reduced motion
<svg
  className="h-5 w-5 motion-safe:animate-spin text-blue-600"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  {/* spinner paths */}
</svg>
<span className="sr-only">Loading...</span>
```

### CSS Approach

```css
/* In your global CSS */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Common ARIA Patterns

### Accordion (Custom — When `<details>` Won't Work)

If you need animated disclosure or controlled open state that `<details>` doesn't support, use ARIA:

```jsx
// React
function Accordion({ items }) {
  const [openId, setOpenId] = useState(null)

  return (
    <div>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="border-b">
            <h3>
              <button
                aria-expanded={isOpen}
                aria-controls={`content-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between py-4 text-left font-medium"
              >
                {item.title}
                <svg
                  className={`h-5 w-5 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </h3>
            <div
              id={`content-${item.id}`}
              role="region"
              aria-labelledby={`heading-${item.id}`}
              hidden={!isOpen}
              className="pb-4 text-gray-600"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### Alert Banners

```html
<!-- Dismissible alert -->
<div
  role="alert"
  class="flex items-center gap-3 rounded-lg bg-yellow-50 border border-yellow-200 p-4"
>
  <svg class="h-5 w-5 text-yellow-600 shrink-0" aria-hidden="true">
    <!-- warning icon -->
  </svg>
  <p class="text-sm text-yellow-800">
    Your trial expires in 3 days. Upgrade to continue.
  </p>
  <button
    aria-label="Dismiss alert"
    class="ml-auto text-yellow-600 hover:text-yellow-800"
  >
    <svg class="h-5 w-5" aria-hidden="true"><!-- X icon --></svg>
  </button>
</div>

<!-- Status update (non-urgent) -->
<div role="status" class="flex items-center gap-2 text-sm text-green-600">
  <svg class="h-4 w-4" aria-hidden="true"><!-- check icon --></svg>
  Changes saved
</div>
```

## Anti-Patterns

1. **Adding `role="button"` to a `<div>`** — Use a `<button>`. If you must use a div, you also need `tabindex="0"`, `onKeyDown` for Enter/Space, and cursor styling. Just use `<button>`.

2. **Using `aria-label` on non-interactive elements** — `aria-label` is reliably supported only on interactive elements (`<button>`, `<a>`, `<input>`) and landmarks. Don't put it on `<div>` or `<span>`.

3. **Hiding content with `display: none` that screen readers need** — Use `sr-only` instead. `display: none` and `visibility: hidden` hide content from all users including screen readers.

4. **Using `tabindex` values greater than 0** — `tabindex="1"`, `tabindex="2"`, etc. create unpredictable tab orders. Only use `tabindex="0"` (adds to natural order) or `tabindex="-1"` (programmatic focus only).

5. **Removing focus outlines** — `outline: none` without a visible focus indicator makes the page unusable for keyboard users. Use `focus-visible:` styles instead of removing outlines entirely.

6. **Auto-playing media** — Auto-playing video or audio without user initiation violates WCAG 1.4.2. Always require user interaction to start media.

7. **Moving focus unexpectedly** — Don't move focus on hover, on timer, or when the user hasn't performed an action. Focus changes should be in response to deliberate user interaction.

8. **Using `aria-live` on frequently updating content** — A live region that updates every second will overwhelm screen readers with constant announcements. Debounce updates or use `aria-live="off"`.
