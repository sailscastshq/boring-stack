---
name: responsive-patterns
description: Responsive design patterns with Tailwind CSS — mobile-first breakpoints, container queries, responsive grids, navigation, tables, forms, touch targets, viewport units, and responsive visibility
metadata:
  tags: responsive, mobile-first, breakpoints, container-queries, grid, responsive-nav, responsive-table, touch-targets, viewport-units, tailwind
---

# Responsive Design Patterns

Responsive design means building layouts that adapt to the user's screen. With Tailwind CSS, this is mobile-first: unprefixed utilities apply at all sizes, and breakpoint prefixes (`sm:`, `md:`, `lg:`) layer on complexity for larger screens.

## Mobile-First Approach

Tailwind's breakpoints are **additive** — they apply at that width _and above_:

| Prefix | Min Width | Meaning                   |
| ------ | --------- | ------------------------- |
| (none) | 0px       | All screens (mobile base) |
| `sm:`  | 640px     | Small tablets and up      |
| `md:`  | 768px     | Tablets and up            |
| `lg:`  | 1024px    | Laptops and up            |
| `xl:`  | 1280px    | Desktops and up           |
| `2xl:` | 1536px    | Large desktops and up     |

**Critical rule: `sm:` does NOT mean "small screens."** It means 640px and above. Mobile styles must be unprefixed.

```html
<!-- WRONG: This only applies at 640px+ -->
<div class="sm:text-center">
  <!-- RIGHT: Centers on mobile, left-aligns at 640px+ -->
  <div class="text-center sm:text-left"></div>
</div>
```

### Tailwind v4 Custom Breakpoints

```css
@import 'tailwindcss';

@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-3xl: 120rem;
}
```

Tailwind v4 also supports max-width (`max-sm:`, `max-md:`) and range variants (`md:max-xl:flex`).

## Container Queries

Container queries respond to the **parent container's** size instead of the viewport. This makes components truly portable — a card that stacks vertically in a narrow sidebar and goes horizontal in wide main content, without knowing which context it lives in.

**When to use which:**

- **Breakpoints (media queries)**: Page-level layout decisions (columns, show/hide nav)
- **Container queries**: Reusable components (cards, widgets) that appear in different layout contexts

### Tailwind v4 (Built-in, No Plugin)

Mark a container with `@container`, then use `@sm:`, `@md:`, `@lg:` on descendants:

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">
    <img class="w-full @md:w-48 rounded-lg" src="..." alt="..." />
    <div>
      <h3 class="font-bold">Product Name</h3>
      <p class="text-gray-600">Description text</p>
    </div>
  </div>
</div>
```

### Named Containers

For nested containers, use names to target the right one:

```html
<div class="@container/sidebar">
  <div class="@container/card">
    <!-- Targets the card container -->
    <div class="@sm/card:flex-row flex flex-col">...</div>
    <!-- Targets the sidebar container -->
    <div class="@lg/sidebar:hidden">...</div>
  </div>
</div>
```

### Container Query Sizes

| Variant | Min Width |
| ------- | --------- |
| `@3xs:` | 256px     |
| `@2xs:` | 288px     |
| `@xs:`  | 320px     |
| `@sm:`  | 384px     |
| `@md:`  | 448px     |
| `@lg:`  | 512px     |
| `@xl:`  | 576px     |
| `@2xl:` | 672px     |

## Responsive Grid Layouts

### Basic Responsive Grid

```html
<div
  class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
  <!-- cards reflow automatically -->
</div>
```

### Auto-Fill / Auto-Fit (No Breakpoints Needed)

```html
<!-- auto-fill: consistent card sizes, empty space if fewer items -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
  <!-- cards -->
</div>

<!-- auto-fit: items stretch to fill available space -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <!-- cards -->
</div>
```

**When to use which:**

- `auto-fill` — Cards stay at their natural width. Better for 4+ items.
- `auto-fit` — Cards stretch to fill space. Better for 1-3 items.

### Dashboard Grid

```html
<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <div class="md:col-span-2">Main chart (spans 2 columns)</div>
  <div>Side stats</div>
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

## Responsive Navigation

### Pattern: Hide/Show Toggle

Desktop shows inline nav, mobile shows hamburger with expandable menu:

#### React

```jsx
import { useState } from 'react'

function AppNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a href="/">Logo</a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <a href="/features">Features</a>
          </li>
          <li>
            <a href="/pricing">Pricing</a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t px-4 py-4 md:hidden">
          <ul className="space-y-4">
            <li>
              <a href="/features">Features</a>
            </li>
            <li>
              <a href="/pricing">Pricing</a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
```

#### Vue

```vue
<script setup>
import { ref } from 'vue'
const menuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 border-b bg-white">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <a href="/">Logo</a>
      <ul class="hidden items-center gap-6 md:flex">
        <li><a href="/features">Features</a></li>
        <li><a href="/pricing">Pricing</a></li>
      </ul>
      <button
        class="md:hidden"
        @click="menuOpen = !menuOpen"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation menu"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"
          />
        </svg>
      </button>
    </nav>
    <div v-if="menuOpen" class="border-t px-4 py-4 md:hidden">
      <ul class="space-y-4">
        <li><a href="/features">Features</a></li>
        <li><a href="/pricing">Pricing</a></li>
      </ul>
    </div>
  </header>
</template>
```

#### Svelte

```svelte
<script>
  let menuOpen = $state(false)
</script>

<header class="sticky top-0 z-50 border-b bg-white">
  <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
    <a href="/">Logo</a>
    <ul class="hidden items-center gap-6 md:flex">
      <li><a href="/features">Features</a></li>
      <li><a href="/pricing">Pricing</a></li>
    </ul>
    <button class="md:hidden" onclick={() => menuOpen = !menuOpen} aria-expanded={menuOpen} aria-label="Toggle navigation menu">
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
      </svg>
    </button>
  </nav>
  {#if menuOpen}
    <div class="border-t px-4 py-4 md:hidden">
      <ul class="space-y-4">
        <li><a href="/features">Features</a></li>
        <li><a href="/pricing">Pricing</a></li>
      </ul>
    </div>
  {/if}
</header>
```

## Responsive Tables

### Pattern 1: Horizontal Scroll (Simplest)

Wrap the table in `overflow-x-auto`. This preserves table semantics and screen reader navigation:

```html
<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <!-- standard table markup -->
  </table>
</div>
```

### Pattern 2: Card Transformation on Mobile

Show a table on desktop, stacked cards on mobile:

```jsx
// React
function MembersTable({ members }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
              >
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-4 whitespace-nowrap">{m.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{m.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {members.map((m) => (
          <div key={m.id} className="rounded-lg border p-4">
            <p className="font-medium">{m.name}</p>
            <dl className="mt-2 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd>{m.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Role</dt>
                <dd>{m.role}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}
```

### Pattern 3: Priority Columns

Hide less important columns on smaller screens:

```html
<table class="min-w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th class="hidden md:table-cell">Role</th>
      <th class="hidden lg:table-cell">Joined</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Kelvin</td>
      <td>kelvin@example.com</td>
      <td class="hidden md:table-cell">Admin</td>
      <td class="hidden lg:table-cell">Jan 15, 2024</td>
      <td>Active</td>
    </tr>
  </tbody>
</table>
```

## Responsive Spacing

Escalate padding and margins at breakpoints:

```html
<!-- Page container -->
<div class="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-12">
  <!-- Section spacing -->
  <section class="py-8 md:py-12 lg:py-16">
    <!-- Card grid gap -->
    <div class="grid gap-4 md:gap-6 lg:gap-8">
      <!-- Max-width content container -->
      <div class="mx-auto max-w-7xl px-4 md:px-8"></div>
    </div>
  </section>
</div>
```

## Responsive Forms

Single column on mobile, multi-column for related short fields on desktop:

```html
<form class="mx-auto max-w-lg space-y-6">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div><!-- First name --></div>
    <div><!-- Last name --></div>
  </div>
  <div><!-- Email (full width) --></div>

  <div class="grid grid-cols-6 gap-4">
    <div class="col-span-6 sm:col-span-3"><!-- City --></div>
    <div class="col-span-3 sm:col-span-1"><!-- State --></div>
    <div class="col-span-3 sm:col-span-2"><!-- Zip --></div>
  </div>

  <!-- Buttons: full width on mobile, right-aligned on desktop -->
  <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
    <button type="button" class="rounded-md border px-4 py-2">Cancel</button>
    <button type="submit" class="rounded-md bg-blue-600 px-4 py-2 text-white">
      Save
    </button>
  </div>
</form>
```

## Touch Targets

Minimum interactive element size should be **44x44 CSS pixels** (WCAG 2.5.5). Smaller targets have 3x higher error rates on mobile.

```html
<!-- Button with adequate touch target -->
<button class="min-h-11 min-w-11 px-4 py-2">Click me</button>

<!-- Icon button -->
<button class="flex h-11 w-11 items-center justify-center rounded-lg">
  <svg class="h-5 w-5" aria-hidden="true"><!-- icon --></svg>
  <span class="sr-only">Settings</span>
</button>

<!-- Nav links with adequate padding -->
<nav>
  <ul class="space-y-1">
    <li>
      <a href="/dashboard" class="block rounded-lg px-3 py-2.5">Dashboard</a>
    </li>
    <li>
      <a href="/settings" class="block rounded-lg px-3 py-2.5">Settings</a>
    </li>
  </ul>
</nav>

<!-- Spacing between touch targets (minimum 8px gap) -->
<div class="flex gap-3">
  <button class="min-h-11 px-4 py-2">Save</button>
  <button class="min-h-11 px-4 py-2">Cancel</button>
</div>
```

## Viewport Units

### The Three Dynamic Heights

| Unit  | Tailwind Class | Meaning                                      | Use for                  |
| ----- | -------------- | -------------------------------------------- | ------------------------ |
| `dvh` | `h-dvh`        | Changes as mobile browser chrome shows/hides | Chat UIs, maps           |
| `svh` | `min-h-svh`    | Smallest viewport (chrome visible)           | Full-page layouts, login |
| `lvh` | `h-lvh`        | Largest viewport (chrome hidden, = `vh`)     | Rarely used alone        |

```html
<!-- Full-height login page -->
<div class="flex min-h-svh flex-col items-center justify-center p-4">
  <div class="w-full max-w-md"><!-- login form --></div>
</div>

<!-- Chat interface that fills visible area exactly -->
<div class="flex h-dvh flex-col">
  <header class="shrink-0 border-b p-4">Chat</header>
  <div class="flex-1 overflow-y-auto p-4"><!-- messages --></div>
  <div class="shrink-0 border-t p-4">
    <input type="text" class="w-full" placeholder="Type a message..." />
  </div>
</div>

<!-- Hero section -->
<section class="flex min-h-svh items-center justify-center">
  <h1 class="text-4xl font-bold">Welcome</h1>
</section>
```

**Don't use `h-screen` (100vh) for full-height mobile layouts** — content gets hidden behind the mobile browser address bar. Use `min-h-svh` instead.

## Responsive Visibility

```html
<!-- Desktop only -->
<div class="hidden lg:block">Desktop content</div>

<!-- Mobile only -->
<div class="lg:hidden">Mobile content</div>

<!-- Match the display type -->
<nav class="hidden lg:flex items-center gap-6">...</nav>
<div class="hidden lg:grid grid-cols-3">...</div>

<!-- Short label on mobile, full text on desktop -->
<span class="md:hidden">Q3</span>
<span class="hidden md:inline">Third Quarter 2026</span>
```

**Match the display type:** If the element is a flex container, use `lg:flex` not `lg:block`. If it's a grid, use `lg:grid`.

## Responsive Typography

```html
<!-- Heading scales up at breakpoints -->
<h1 class="text-2xl font-bold md:text-3xl lg:text-4xl">Page Title</h1>

<!-- Fluid heading with clamp() (no breakpoint jumps) -->
<h1 class="text-[clamp(1.875rem,1.3rem+2.5vw,3.75rem)] font-bold">
  Smooth Heading
</h1>
```

See [typography.md](typography.md) for comprehensive typography patterns.

## Anti-Patterns

1. **Using `sm:` for mobile styles** — `sm:` means 640px+. Mobile styles must be unprefixed.

2. **Using `h-screen` on mobile** — `100vh` doesn't account for the mobile browser address bar. Use `min-h-svh`.

3. **Hardcoding minmax() too large** — `grid-cols-[repeat(auto-fill,minmax(400px,1fr))]` overflows on 320px mobile screens.

4. **Using `hidden md:block` for flex containers** — Use `hidden md:flex` to preserve the display type.

5. **Not testing with 1 item** — A responsive grid that looks great with 12 items might look broken with 1 or 2.

6. **Missing `aria-expanded` on hamburger buttons** — Screen readers need to know whether the menu is open or closed.

7. **Icon buttons smaller than 44px** — A 20px icon with no padding is impossible to tap accurately on mobile.
