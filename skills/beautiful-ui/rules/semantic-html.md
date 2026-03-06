---
name: semantic-html
description: Element selection guide — when to use which HTML element instead of a generic div or span, with practical examples for page layouts, navigation, content, forms, tables, and interactive patterns
metadata:
  tags: semantic-html, landmarks, article, section, nav, header, footer, main, aside, figure, details, dialog, headings, forms, tables, accessibility
---

# Semantic HTML Element Guide

Every HTML element carries meaning. A `<div>` means nothing — it's a generic container. A `<nav>` means "this is a group of navigation links." Choosing the right element makes your markup self-documenting, accessible to screen readers, friendly to search engines, and compatible with browser features like Reader Mode.

**The core rule: if a more specific element exists for your content, use it instead of `<div>` or `<span>`.**

## The Div Litmus Test

Before writing a `<div>`, ask: **"What is this content?"** — not "How should this look?" If the answer is a noun that maps to an HTML element, use that element.

| If the content is...             | Use                         | Not                           |
| -------------------------------- | --------------------------- | ----------------------------- |
| The whole page's primary content | `<main>`                    | `<div id="main">`             |
| A site-wide header/banner        | `<header>`                  | `<div class="header">`        |
| A site-wide footer               | `<footer>`                  | `<div class="footer">`        |
| A group of navigation links      | `<nav>`                     | `<div class="nav">`           |
| Supplementary/sidebar content    | `<aside>`                   | `<div class="sidebar">`       |
| A self-contained composition     | `<article>`                 | `<div class="post">`          |
| A thematic grouping with heading | `<section>`                 | `<div class="section">`       |
| An image with a caption          | `<figure>` + `<figcaption>` | `<div class="image-wrapper">` |
| A collapsible panel              | `<details>` + `<summary>`   | `<div class="accordion">`     |
| A modal/dialog                   | `<dialog>`                  | `<div class="modal">`         |
| A data grid                      | `<table>`                   | `<div class="table">`         |
| A list of items                  | `<ul>` / `<ol>`             | `<div>` with children         |
| A term and its definition        | `<dl>`, `<dt>`, `<dd>`      | `<div>` + `<span>` pairs      |
| Emphasized text                  | `<em>`                      | `<span class="italic">`       |
| Important text                   | `<strong>`                  | `<span class="bold">`         |
| A date or time                   | `<time>`                    | `<span class="date">`         |
| Code                             | `<code>`                    | `<span class="code">`         |
| A quotation                      | `<blockquote>` / `<q>`      | `<div class="quote">`         |
| Contact information              | `<address>`                 | `<div class="contact">`       |
| A line break in an address/poem  | `<br>`                      | `<div>` per line              |

**When `<div>` is correct:** Use `<div>` when the element is purely a styling/layout wrapper with no semantic meaning — a flex container, a grid cell, a background wrapper. The `<div>` is the right choice when no semantic element fits.

## Page Landmarks

Landmarks are the top-level semantic regions that structure a page. Screen readers expose these as navigation points, allowing users to jump directly to the header, main content, navigation, or footer.

### The Standard Layout

```
┌─────────────────────────────────┐
│ <header>                        │  ← Site banner, logo, global nav
├──────────┬──────────────────────┤
│ <nav>    │ <main>               │  ← Primary navigation + main content
│          │   <article>          │
│          │   <section>          │
│          │   <section>          │
├──────────┤                      │
│ <aside>  │                      │  ← Sidebar, related links
├──────────┴──────────────────────┤
│ <footer>                        │  ← Copyright, secondary nav
└─────────────────────────────────┘
```

### React

```jsx
// assets/js/layouts/AppLayout.jsx
export default function AppLayout({ children }) {
  return (
    <>
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <a href="/" className="text-xl font-bold">
            Acme
          </a>
          <nav aria-label="Main">
            <ul className="flex gap-6">
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/projects">Projects</a>
              </li>
              <li>
                <a href="/settings">Settings</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl flex gap-8 px-4 py-8">
        <main className="flex-1">{children}</main>
        <aside className="w-64 shrink-0">
          <nav aria-label="Sidebar">
            <ul className="space-y-2">
              <li>
                <a href="/help">Help</a>
              </li>
              <li>
                <a href="/changelog">Changelog</a>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-500">
          &copy; 2026 Acme Inc.
        </div>
      </footer>
    </>
  )
}
```

### Vue

```vue
<!-- assets/js/layouts/AppLayout.vue -->
<script setup></script>

<template>
  <header class="border-b bg-white">
    <div class="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
      <a href="/" class="text-xl font-bold">Acme</a>
      <nav aria-label="Main">
        <ul class="flex gap-6">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/projects">Projects</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <div class="mx-auto max-w-7xl flex gap-8 px-4 py-8">
    <main class="flex-1">
      <slot />
    </main>
    <aside class="w-64 shrink-0">
      <nav aria-label="Sidebar">
        <ul class="space-y-2">
          <li><a href="/help">Help</a></li>
          <li><a href="/changelog">Changelog</a></li>
        </ul>
      </nav>
    </aside>
  </div>

  <footer class="border-t bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-500">
      &copy; 2026 Acme Inc.
    </div>
  </footer>
</template>
```

### Svelte

```svelte
<!-- assets/js/layouts/AppLayout.svelte -->
<script>
  let { children } = $props()
</script>

<header class="border-b bg-white">
  <div class="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
    <a href="/" class="text-xl font-bold">Acme</a>
    <nav aria-label="Main">
      <ul class="flex gap-6">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/projects">Projects</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  </div>
</header>

<div class="mx-auto max-w-7xl flex gap-8 px-4 py-8">
  <main class="flex-1">
    {@render children()}
  </main>
  <aside class="w-64 shrink-0">
    <nav aria-label="Sidebar">
      <ul class="space-y-2">
        <li><a href="/help">Help</a></li>
        <li><a href="/changelog">Changelog</a></li>
      </ul>
    </nav>
  </aside>
</div>

<footer class="border-t bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-500">
    &copy; 2026 Acme Inc.
  </div>
</footer>
```

### Key Rules for Landmarks

1. **One `<main>` per page** — There must be exactly one `<main>` element. It represents the dominant content of the `<body>`.

2. **`<header>` and `<footer>` are context-dependent** — A `<header>` inside `<body>` is the site banner. A `<header>` inside `<article>` is the article header. Same element, different scope.

3. **Label multiple `<nav>` elements** — If a page has more than one `<nav>`, give each an `aria-label` to distinguish them: `<nav aria-label="Main">`, `<nav aria-label="Sidebar">`, `<nav aria-label="Footer">`.

4. **`<aside>` means tangentially related** — Sidebar content, pull quotes, advertising, related links. It's content that could be removed without reducing the meaning of the main content.

5. **Don't nest landmarks unnecessarily** — `<main>` inside `<main>` is invalid. `<header>` inside `<header>` is invalid. Keep the landmark tree flat and meaningful.

## Article vs Section

This is the most commonly confused distinction:

| Element     | Meaning                                                   | Standalone? | Example                                 |
| ----------- | --------------------------------------------------------- | ----------- | --------------------------------------- |
| `<article>` | A self-contained, independently distributable composition | Yes         | Blog post, comment, product card, tweet |
| `<section>` | A thematic grouping of content, typically with a heading  | No          | "Features" section, "Pricing" section   |

**The syndication test:** Could this content make sense on its own if extracted and published elsewhere (in an RSS feed, an email, another page)? If yes → `<article>`. If no → `<section>`.

### Nesting Patterns

Articles can contain sections (chapters of a post). Sections can contain articles (a "Latest Posts" section with article cards). Both are valid:

```html
<!-- Blog post with sections -->
<article>
  <h1>Getting Started with Sails.js</h1>
  <section>
    <h2>Installation</h2>
    <p>...</p>
  </section>
  <section>
    <h2>Your First Route</h2>
    <p>...</p>
  </section>
</article>

<!-- Section containing article cards -->
<section aria-labelledby="latest-heading">
  <h2 id="latest-heading">Latest Posts</h2>
  <article>
    <h3>Deploying to Production</h3>
    <p>...</p>
  </article>
  <article>
    <h3>Websocket Patterns</h3>
    <p>...</p>
  </article>
</section>
```

## Heading Hierarchy

Headings (`<h1>` through `<h6>`) create a document outline. Screen readers use this outline to navigate, and search engines use it to understand content structure.

### Rules

1. **One `<h1>` per page** — The `<h1>` is the page title. Everything else is `<h2>` and below.

2. **Never skip levels** — Go `<h1>` → `<h2>` → `<h3>`, not `<h1>` → `<h3>`. Skipping confuses the document outline.

3. **Headings describe sections** — Every `<section>` should have a heading. If you can't think of a heading, you probably don't need a `<section>`.

4. **Don't use headings for styling** — If you need big bold text that isn't a section title, use CSS classes, not a heading element.

### Practical Outline

```
<h1>Dashboard</h1>                        ← Page title
  <h2>Recent Activity</h2>                ← Section
    <h3>Today</h3>                        ← Subsection
    <h3>Yesterday</h3>
  <h2>Analytics</h2>                      ← Section
    <h3>Revenue</h3>
    <h3>Users</h3>
  <h2>Quick Actions</h2>                  ← Section
```

### In Inertia.js Pages

With Inertia.js and the `<Head>` component, the page `<title>` is set separately from the content `<h1>`. Both should exist:

```jsx
// React
import { Head } from '@inertiajs/react'

export default function Dashboard({ stats }) {
  return (
    <>
      <Head title="Dashboard" />
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="text-lg font-semibold mb-4">
          Recent Activity
        </h2>
        {/* ... */}
      </section>
    </>
  )
}
```

## Navigation Patterns

### Primary Navigation

Always wrap navigation links in `<nav>` with a descriptive `aria-label`. Use `<ul>` + `<li>` — navigation is a list of links:

```html
<nav aria-label="Main">
  <ul>
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/team">Team</a></li>
    <li><a href="/settings">Settings</a></li>
  </ul>
</nav>
```

**`aria-current="page"`** — Mark the active link. Screen readers announce "Dashboard, current page" instead of just "Dashboard." This is more meaningful than a CSS class alone.

### Breadcrumbs

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/projects/42" aria-current="page">Acme Redesign</a></li>
  </ol>
</nav>
```

Use `<ol>` (ordered list) for breadcrumbs — the order matters. The visual separator (`/` or `>`) should be CSS-only (via `::before` pseudo-elements), not in the HTML:

```css
nav[aria-label='Breadcrumb'] li + li::before {
  content: '/';
  margin: 0 0.5rem;
  color: #9ca3af;
}
```

### Pagination

```html
<nav aria-label="Pagination">
  <ul className="flex gap-2">
    <li><a href="/users?page=1" aria-label="Previous page">&laquo;</a></li>
    <li><a href="/users?page=1">1</a></li>
    <li><a href="/users?page=2" aria-current="page">2</a></li>
    <li><a href="/users?page=3">3</a></li>
    <li><a href="/users?page=3" aria-label="Next page">&raquo;</a></li>
  </ul>
</nav>
```

## Forms

Forms are one of the most important areas for semantic HTML. Proper form structure makes forms accessible, enables browser autofill, and provides built-in validation.

### Labels

Every input must have a label. There are two patterns:

```html
<!-- Wrapping (preferred — no id needed) -->
<label>
  Email
  <input type="email" name="email" />
</label>

<!-- Linking via for/id -->
<label for="email-input">Email</label>
<input id="email-input" type="email" name="email" />
```

**Never use placeholder as a label.** Placeholders disappear on input, making the form harder to use. Use a real `<label>`.

### Fieldsets for Grouping

Group related fields with `<fieldset>` and `<legend>`:

```html
<form>
  <fieldset>
    <legend>Personal Information</legend>
    <label>
      Full name
      <input type="text" name="fullName" autocomplete="name" />
    </label>
    <label>
      Email
      <input type="email" name="emailAddress" autocomplete="email" />
    </label>
  </fieldset>

  <fieldset>
    <legend>Shipping Address</legend>
    <label>
      Street
      <input type="text" name="street" autocomplete="address-line1" />
    </label>
    <label>
      City
      <input type="text" name="city" autocomplete="address-level2" />
    </label>
  </fieldset>

  <button type="submit">Place Order</button>
</form>
```

### Input Types

Use the correct `type` — it changes the mobile keyboard, enables browser validation, and powers autofill:

| Data     | Type              | Mobile keyboard             |
| -------- | ----------------- | --------------------------- |
| Email    | `type="email"`    | @ key, .com suggestions     |
| Phone    | `type="tel"`      | Numeric keypad              |
| URL      | `type="url"`      | .com, / keys                |
| Number   | `type="number"`   | Numeric keypad              |
| Password | `type="password"` | Hidden input, paste support |
| Search   | `type="search"`   | Search key on keyboard      |
| Date     | `type="date"`     | Native date picker          |

### Autocomplete Attributes

Add `autocomplete` to let browsers fill in known data. This is critical for checkout and registration forms:

```html
<input type="text" name="fullName" autocomplete="name" />
<input type="email" name="email" autocomplete="email" />
<input type="tel" name="phone" autocomplete="tel" />
<input type="text" name="street" autocomplete="address-line1" />
<input type="text" name="city" autocomplete="address-level2" />
<input type="text" name="zip" autocomplete="postal-code" />
<input type="text" name="cc" autocomplete="cc-number" />
```

### Validation Feedback

Associate error messages with inputs using `aria-describedby`:

```jsx
// React — with Inertia.js form errors
function EmailField({ form }) {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={form.data.email}
        onChange={(e) => form.setData('email', e.target.value)}
        aria-invalid={!!form.errors.email}
        aria-describedby={form.errors.email ? 'email-error' : undefined}
      />
      {form.errors.email && (
        <p id="email-error" role="alert" className="text-sm text-red-600 mt-1">
          {form.errors.email}
        </p>
      )}
    </div>
  )
}
```

Key attributes:

- **`aria-invalid="true"`** — Tells assistive technology this field has an error
- **`aria-describedby="email-error"`** — Links the input to its error message so screen readers announce both together
- **`role="alert"`** — Announces the error immediately when it appears

## Data Tables

Use `<table>` for tabular data. Never use `<div>` grids to display data that has rows and columns — screen readers can't navigate them.

### Proper Table Structure

```html
<table>
  <caption>
    Team members and their roles
  </caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
      <th scope="col">Joined</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Kelvin Omereshone</td>
      <td>kelvin@example.com</td>
      <td>Admin</td>
      <td><time datetime="2024-01-15">Jan 15, 2024</time></td>
    </tr>
    <tr>
      <td>Ada Lovelace</td>
      <td>ada@example.com</td>
      <td>Member</td>
      <td><time datetime="2024-03-22">Mar 22, 2024</time></td>
    </tr>
  </tbody>
</table>
```

Key elements:

- **`<caption>`** — Describes the table's purpose. Visible by default (can be visually hidden with CSS but stays accessible).
- **`<thead>` / `<tbody>`** — Separates headers from data. Required for proper screen reader navigation.
- **`<th scope="col">`** — Declares column headers. `scope="row"` is for row headers.
- **`<time datetime="...">`** — Machine-readable date. Screen readers and search engines can parse the `datetime` attribute.

### React Table Component

```jsx
function MembersTable({ members }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <caption className="sr-only">Team members</caption>
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
          >
            Name
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
          >
            Role
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
          >
            Joined
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {members.map((member) => (
          <tr key={member.id}>
            <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <time dateTime={member.joinedAt}>{member.joinedFormatted}</time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Interactive Elements

### `<details>` and `<summary>` — Native Disclosure

The browser provides a fully accessible, no-JavaScript accordion:

```html
<details>
  <summary>What payment methods do you accept?</summary>
  <p>
    We accept Visa, Mastercard, and PayPal. All payments are processed securely
    through Lemon Squeezy.
  </p>
</details>

<details>
  <summary>Can I cancel my subscription?</summary>
  <p>
    Yes, you can cancel anytime from your account settings. You'll retain access
    until the end of your billing period.
  </p>
</details>
```

Style with CSS — the `<summary>` is the clickable toggle, and the content below it shows/hides automatically. The `open` attribute is added when expanded:

```css
details[open] summary {
  font-weight: 600;
}
```

### FAQ Page Example

#### React

```jsx
export default function FAQ({ faqs }) {
  return (
    <>
      <Head title="FAQ" />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        <dl className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.id} className="border rounded-lg">
              <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-gray-50">
                {faq.question}
              </summary>
              <dd className="px-4 pb-4 text-gray-600">{faq.answer}</dd>
            </details>
          ))}
        </dl>
      </main>
    </>
  )
}
```

#### Vue

```vue
<script setup>
import { Head } from '@inertiajs/vue3'

defineProps({ faqs: Array })
</script>

<template>
  <Head title="FAQ" />
  <main class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
    <dl class="space-y-4">
      <details v-for="faq in faqs" :key="faq.id" class="border rounded-lg">
        <summary class="px-4 py-3 cursor-pointer font-medium hover:bg-gray-50">
          {{ faq.question }}
        </summary>
        <dd class="px-4 pb-4 text-gray-600">
          {{ faq.answer }}
        </dd>
      </details>
    </dl>
  </main>
</template>
```

#### Svelte

```svelte
<script>
  let { faqs } = $props()
</script>

<svelte:head>
  <title>FAQ</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-12">
  <h1 class="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
  <dl class="space-y-4">
    {#each faqs as faq (faq.id)}
      <details class="border rounded-lg">
        <summary class="px-4 py-3 cursor-pointer font-medium hover:bg-gray-50">
          {faq.question}
        </summary>
        <dd class="px-4 pb-4 text-gray-600">
          {faq.answer}
        </dd>
      </details>
    {/each}
  </dl>
</main>
```

### `<dialog>` — Native Modal

The `<dialog>` element provides a browser-native modal with built-in backdrop, focus trapping, and Escape-to-close:

```html
<dialog id="confirm-dialog">
  <h2>Delete this project?</h2>
  <p>This action cannot be undone.</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>
```

Open with `dialog.showModal()` (modal with backdrop) or `dialog.show()` (non-modal). The `method="dialog"` form closes the dialog and sets `dialog.returnValue` to the button's `value`.

#### React

```jsx
import { useRef } from 'react'

function ConfirmDialog({ title, message, onConfirm }) {
  const dialogRef = useRef(null)

  function open() {
    dialogRef.current?.showModal()
  }

  function handleClose() {
    if (dialogRef.current?.returnValue === 'confirm') {
      onConfirm()
    }
  }

  return (
    <>
      <button onClick={open}>Delete</button>
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="rounded-lg p-6 backdrop:bg-black/50"
      >
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-600">{message}</p>
        <form method="dialog" className="flex gap-2 justify-end">
          <button value="cancel" className="px-4 py-2 text-gray-600">
            Cancel
          </button>
          <button
            value="confirm"
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </form>
      </dialog>
    </>
  )
}
```

#### Vue

```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: String,
  message: String
})

const emit = defineEmits(['confirm'])
const dialogRef = ref(null)

function open() {
  dialogRef.value?.showModal()
}

function handleClose() {
  if (dialogRef.value?.returnValue === 'confirm') {
    emit('confirm')
  }
}

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialogRef"
    @close="handleClose"
    class="rounded-lg p-6 backdrop:bg-black/50"
  >
    <h2 class="text-lg font-bold mb-2">{{ title }}</h2>
    <p class="mb-4 text-gray-600">{{ message }}</p>
    <form method="dialog" class="flex gap-2 justify-end">
      <button value="cancel" class="px-4 py-2 text-gray-600">Cancel</button>
      <button value="confirm" class="px-4 py-2 bg-red-600 text-white rounded">
        Delete
      </button>
    </form>
  </dialog>
</template>
```

#### Svelte

```svelte
<script>
  let { title, message, onconfirm } = $props()
  let dialogEl = $state(null)

  export function open() {
    dialogEl?.showModal()
  }

  function handleClose() {
    if (dialogEl?.returnValue === 'confirm') {
      onconfirm()
    }
  }
</script>

<dialog bind:this={dialogEl} onclose={handleClose} class="rounded-lg p-6 backdrop:bg-black/50">
  <h2 class="text-lg font-bold mb-2">{title}</h2>
  <p class="mb-4 text-gray-600">{message}</p>
  <form method="dialog" class="flex gap-2 justify-end">
    <button value="cancel" class="px-4 py-2 text-gray-600">Cancel</button>
    <button value="confirm" class="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
  </form>
</dialog>
```

## Media Elements

### Figure and Figcaption

Wrap images, charts, code blocks, or any self-contained media in `<figure>` when it has a caption:

```html
<figure>
  <img
    src="/images/architecture.png"
    alt="System architecture diagram showing the API gateway, services, and database layers"
  />
  <figcaption>
    Figure 1: High-level architecture of the Acme platform
  </figcaption>
</figure>
```

### Picture for Responsive Images

```html
<picture>
  <source
    media="(min-width: 768px)"
    srcset="/images/hero-desktop.webp"
    type="image/webp"
  />
  <source
    media="(min-width: 768px)"
    srcset="/images/hero-desktop.jpg"
    type="image/jpeg"
  />
  <source srcset="/images/hero-mobile.webp" type="image/webp" />
  <img
    src="/images/hero-mobile.jpg"
    alt="Team collaborating around a whiteboard"
  />
</picture>
```

### Alt Text Rules

- **Descriptive for meaningful images**: `alt="Bar chart showing 40% revenue growth in Q3"`
- **Empty for decorative images**: `alt=""` (not omitted — that makes screen readers read the filename)
- **Functional for linked images**: `alt="Go to homepage"` (describe the action, not the image)

## Inline Semantics

Use the correct inline element for the content's meaning:

| Element        | Meaning                           | Example                                                      |
| -------------- | --------------------------------- | ------------------------------------------------------------ |
| `<em>`         | Stress emphasis (changes meaning) | "I _love_ this" vs "I love _this_"                           |
| `<strong>`     | Strong importance                 | "**Warning:** This cannot be undone"                         |
| `<time>`       | Machine-readable date/time        | `<time datetime="2024-01-15">Jan 15</time>`                  |
| `<code>`       | Inline code                       | Use `<code>router.get()</code>`                              |
| `<kbd>`        | Keyboard input                    | Press `<kbd>Ctrl</kbd>+<kbd>S</kbd>`                         |
| `<abbr>`       | Abbreviation with expansion       | `<abbr title="Application Programming Interface">API</abbr>` |
| `<mark>`       | Highlighted/referenced text       | Search results highlighting                                  |
| `<small>`      | Side comments, fine print         | Copyright notices, legal text                                |
| `<del>`        | Deleted/removed text              | Price was `<del>$99</del>` now $79                           |
| `<ins>`        | Inserted/added text               | Price is now `<ins>$79</ins>`                                |
| `<blockquote>` | Block quotation                   | Customer testimonials                                        |
| `<cite>`       | Title of a work                   | `<cite>The Pragmatic Programmer</cite>`                      |
| `<address>`    | Contact information               | Author info in `<article>` footer                            |

## Complete Page Example: Blog Post

Pulling it all together — a semantically rich blog post page:

### React

```jsx
import { Head, Link } from '@inertiajs/react'

export default function BlogPost({ post, relatedPosts }) {
  return (
    <>
      <Head title={post.title} />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <article>
          <header className="mb-8">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex gap-2 text-sm text-gray-500">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>/</li>
                <li aria-current="page">{post.title}</li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-600">
              By{' '}
              <address className="inline not-italic">
                {post.author.name}
              </address>{' '}
              on{' '}
              <time dateTime={post.publishedAt}>{post.publishedFormatted}</time>
            </p>
          </header>

          <figure className="mb-8">
            <img
              src={post.coverImage}
              alt={post.coverAlt}
              className="rounded-lg w-full"
            />
            {post.coverCaption && (
              <figcaption className="text-sm text-gray-500 mt-2">
                {post.coverCaption}
              </figcaption>
            )}
          </figure>

          <section className="prose max-w-none">
            {post.sections.map((section) => (
              <div key={section.id}>
                <h2>{section.heading}</h2>
                <p>{section.content}</p>
              </div>
            ))}
          </section>

          <footer className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-500">
              Published{' '}
              <time dateTime={post.publishedAt}>{post.publishedFormatted}</time>.
              Last updated <time dateTime={post.updatedAt}>
                {post.updatedFormatted}
              </time>.
            </p>
          </footer>
        </article>

        <aside className="mt-12">
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold mb-6">
              Related Posts
            </h2>
            <ul className="space-y-4">
              {relatedPosts.map((related) => (
                <li key={related.id}>
                  <article>
                    <h3>
                      <Link
                        href={`/blog/${related.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {related.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">{related.excerpt}</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </>
  )
}
```

## Anti-Patterns

1. **Div soup** — Building entire layouts from `<div>` elements. Every `<div class="header">` should be a `<header>`. Every `<div class="nav">` should be a `<nav>`.

2. **Heading for styling** — Using `<h3>` because you want smaller text. Use CSS classes instead. Heading levels must follow the document outline, not visual size.

3. **Missing labels** — Inputs without `<label>` are invisible to screen readers. Placeholder text is not a label.

4. **Fake buttons** — `<div onclick="...">` or `<a href="#" onclick="...">`. Use `<button>` for actions and `<a href="...">` for navigation. Buttons handle keyboard events (Enter, Space) and have the correct ARIA role automatically.

5. **Table for layout** — `<table>` is for tabular data only. Use CSS Grid or Flexbox for layout.

6. **Layout for tabular data** — The opposite mistake: using `<div>` grids for data that has rows and columns. If users would understand it as a table, mark it up as a `<table>`.

7. **Skipping alt text** — Omitting `alt` entirely (not the same as `alt=""`). Without `alt`, screen readers read the image filename, which is worse than nothing.

8. **Click handlers on non-interactive elements** — Adding `onClick` to a `<div>` or `<span>`. Use `<button>` for actions. If you truly can't use a button, add `role="button"`, `tabindex="0"`, and keyboard event handlers — but just use a `<button>`.

9. **Using `<br>` for spacing** — `<br>` is for line breaks in content (addresses, poems). For visual spacing, use CSS margin or padding.

10. **Wrapping everything in `<section>`** — Not every `<div>` needs to become a `<section>`. Only use `<section>` for a thematic grouping with a heading. A flex wrapper or grid cell is still a `<div>`.
