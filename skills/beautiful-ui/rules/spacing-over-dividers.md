---
name: spacing-over-dividers
description: Use spacing instead of borders and dividers to separate content — fewer lines, more whitespace, cleaner interfaces
metadata:
  tags: spacing, dividers, borders, whitespace, separation, visual-hierarchy, layout, tailwind
---

# Spacing Over Dividers

Borders and horizontal rules are overused. Most of the time, **spacing alone** creates clearer separation than a line ever could. Lines add visual clutter — every `border-b`, `divide-y`, and `<hr>` is one more element the eye has to process. Default to spacing. Reach for a border only when spacing isn't enough.

## The Principle

When two pieces of content need to be visually separated, there are three tools available — ranked from cleanest to heaviest:

| Tool                        | Visual weight | Use when...                                                                              |
| --------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| **Spacing**                 | Lightest      | Default. Almost always sufficient.                                                       |
| **Background color change** | Medium        | Sections need stronger distinction (e.g., alternating sections on a landing page)        |
| **Border / divider**        | Heaviest      | Content is so dense that spacing and color alone aren't enough (e.g., dense data tables) |

**Start with spacing. Only add a border if the separation is still ambiguous.**

## Spacing Creates Grouping

The Gestalt principle of proximity: **elements that are close together are perceived as related.** You don't need a line between groups — you need more space _between_ groups than _within_ groups.

```
WRONG — borders everywhere:
┌──────────────────────┐
│ Item A               │
├──────────────────────┤
│ Item B               │
├──────────────────────┤
│ Item C               │
├──────────────────────┤
│ Item D               │
└──────────────────────┘

RIGHT — spacing creates groups:
  Item A
  Item B
  Item C

  Item D
  Item E

  Item F
```

The gap between groups tells the user "these are different sections" without any lines.

## Replacing Borders with Spacing

### Card Lists

```html
<!-- HEAVY — dividers between every card -->
<div class="divide-y divide-gray-200">
  <div class="py-4">Card 1</div>
  <div class="py-4">Card 2</div>
  <div class="py-4">Card 3</div>
</div>

<!-- CLEAN — spacing between cards -->
<div class="space-y-4">
  <div class="rounded-lg bg-white p-4 shadow-sm">Card 1</div>
  <div class="rounded-lg bg-white p-4 shadow-sm">Card 2</div>
  <div class="rounded-lg bg-white p-4 shadow-sm">Card 3</div>
</div>
```

### Form Sections

```html
<!-- HEAVY — borders between every section -->
<form>
  <fieldset class="border-b border-gray-200 pb-6">
    <legend class="text-lg font-semibold">Personal Info</legend>
    <!-- fields -->
  </fieldset>
  <fieldset class="border-b border-gray-200 py-6">
    <legend class="text-lg font-semibold">Address</legend>
    <!-- fields -->
  </fieldset>
  <fieldset class="py-6">
    <legend class="text-lg font-semibold">Payment</legend>
    <!-- fields -->
  </fieldset>
</form>

<!-- CLEAN — spacing between sections -->
<form class="space-y-10">
  <fieldset class="space-y-4">
    <legend class="text-lg font-semibold">Personal Info</legend>
    <!-- fields -->
  </fieldset>
  <fieldset class="space-y-4">
    <legend class="text-lg font-semibold">Address</legend>
    <!-- fields -->
  </fieldset>
  <fieldset class="space-y-4">
    <legend class="text-lg font-semibold">Payment</legend>
    <!-- fields -->
  </fieldset>
</form>
```

The key: `space-y-10` between sections vs `space-y-4` within sections. The larger gap signals "new group" without any border.

### Page Sections

```html
<!-- HEAVY — borders between page sections -->
<section class="border-b border-gray-200 py-12">
  <h2>Features</h2>
</section>
<section class="border-b border-gray-200 py-12">
  <h2>Pricing</h2>
</section>
<section class="py-12">
  <h2>FAQ</h2>
</section>

<!-- CLEAN — spacing + background color alternation -->
<section class="bg-white py-16">
  <h2>Features</h2>
</section>
<section class="bg-gray-50 py-16">
  <h2>Pricing</h2>
</section>
<section class="bg-white py-16">
  <h2>FAQ</h2>
</section>
```

Background color alternation creates section distinction without a single border.

### Sidebar Navigation

```html
<!-- HEAVY — dividers between nav groups -->
<nav class="space-y-1">
  <a href="/dashboard" class="block px-3 py-2">Dashboard</a>
  <a href="/projects" class="block px-3 py-2">Projects</a>
  <hr class="my-2 border-gray-200" />
  <a href="/settings" class="block px-3 py-2">Settings</a>
  <a href="/billing" class="block px-3 py-2">Billing</a>
  <hr class="my-2 border-gray-200" />
  <a href="/help" class="block px-3 py-2">Help</a>
</nav>

<!-- CLEAN — spacing between groups -->
<nav class="space-y-6">
  <div class="space-y-1">
    <a href="/dashboard" class="block px-3 py-2">Dashboard</a>
    <a href="/projects" class="block px-3 py-2">Projects</a>
  </div>
  <div class="space-y-1">
    <a href="/settings" class="block px-3 py-2">Settings</a>
    <a href="/billing" class="block px-3 py-2">Billing</a>
  </div>
  <div class="space-y-1">
    <a href="/help" class="block px-3 py-2">Help</a>
  </div>
</nav>
```

`space-y-6` between groups, `space-y-1` within groups. No `<hr>` needed.

### Dashboard Stats

```html
<!-- HEAVY — borders between stats -->
<div class="grid grid-cols-3 divide-x divide-gray-200">
  <div class="px-6 text-center">
    <p class="text-sm text-gray-500">Users</p>
    <p class="text-2xl font-bold">12,847</p>
  </div>
  <div class="px-6 text-center">
    <p class="text-sm text-gray-500">Revenue</p>
    <p class="text-2xl font-bold">$24.5k</p>
  </div>
  <div class="px-6 text-center">
    <p class="text-sm text-gray-500">Orders</p>
    <p class="text-2xl font-bold">1,429</p>
  </div>
</div>

<!-- CLEAN — individual cards with gap -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <div class="rounded-lg bg-white p-6 shadow-sm">
    <p class="text-sm text-gray-500">Users</p>
    <p class="text-2xl font-bold">12,847</p>
  </div>
  <div class="rounded-lg bg-white p-6 shadow-sm">
    <p class="text-sm text-gray-500">Revenue</p>
    <p class="text-2xl font-bold">$24.5k</p>
  </div>
  <div class="rounded-lg bg-white p-6 shadow-sm">
    <p class="text-sm text-gray-500">Orders</p>
    <p class="text-2xl font-bold">1,429</p>
  </div>
</div>
```

## Replacing Borders with Box Shadows

A subtle box shadow creates separation between a card and its background without the hard edge of a border:

```html
<!-- Border separation -->
<div class="rounded-lg border border-gray-200 p-6">Content</div>

<!-- Shadow separation (softer) -->
<div class="rounded-lg bg-white p-6 shadow-sm">Content</div>
```

Shadows feel more natural — they mimic real-world depth. Borders feel like drawn lines.

## When Borders ARE Right

Borders aren't forbidden. They're the right choice when:

### Dense Data Tables

Tables with many rows of similar data benefit from `divide-y` — the data is too uniform for spacing alone to separate rows clearly:

```html
<table class="min-w-full">
  <thead class="bg-gray-50">
    <tr>
      <th
        scope="col"
        class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
      >
        Name
      </th>
      <th
        scope="col"
        class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
      >
        Role
      </th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-100">
    <tr>
      <td class="px-6 py-4">Kelvin Omereshone</td>
      <td class="px-6 py-4">Admin</td>
    </tr>
    <tr>
      <td class="px-6 py-4">Ada Lovelace</td>
      <td class="px-6 py-4">Member</td>
    </tr>
  </tbody>
</table>
```

Even here, prefer `divide-gray-100` (very light) over `divide-gray-200` or `divide-gray-300`. The lighter the line, the less visual noise.

**Alternative: zebra striping** removes borders entirely:

```html
<tbody>
  <tr class="bg-white">
    ...
  </tr>
  <tr class="bg-gray-50">
    ...
  </tr>
  <tr class="bg-white">
    ...
  </tr>
  <tr class="bg-gray-50">
    ...
  </tr>
</tbody>
```

### Header / Footer Separation

A single border between the header and the page content, or the page content and the footer, is standard and expected:

```html
<header class="border-b border-gray-200">...</header>
<main>...</main>
<footer class="border-t border-gray-200">...</footer>
```

This is one of the few places where a border is conventional and removing it would look unusual.

### Input Fields

Form inputs need borders to define their clickable area:

```html
<input class="rounded-md border border-gray-300 px-3 py-2" />
```

### Accent Borders

A colored top or left border on a card or alert adds personality without clutter — this is decorative, not separating:

```html
<!-- Accent top border on a card -->
<div class="rounded-lg border-t-4 border-t-blue-500 bg-white p-6 shadow-sm">
  <h3 class="font-semibold">Pro Plan</h3>
  <p class="text-gray-500">Everything you need</p>
</div>

<!-- Accent left border on a blockquote -->
<blockquote class="border-l-4 border-l-blue-500 pl-4 text-gray-600">
  "This changed how we ship software."
</blockquote>
```

## The Spacing Scale

Use a **consistent, constrained spacing scale** so gaps between sections are predictable:

| Gap              | Tailwind                    | Use for                                   |
| ---------------- | --------------------------- | ----------------------------------------- |
| Tight (within)   | `space-y-1`                 | Nav items, radio buttons, compact lists   |
| Default (within) | `space-y-4`                 | Form fields, card content, list items     |
| Loose (between)  | `space-y-6`                 | Between nav groups, between card sections |
| Section gap      | `space-y-8` to `space-y-10` | Between form sections, page blocks        |
| Page section     | `py-12` to `py-16`          | Between major page sections               |

**The rule of thumb:** The gap between groups should be **at least 1.5–2x** the gap within groups. If items inside a group are `space-y-4` apart, groups should be `space-y-8` or more apart.

## Decision Flowchart

```
Need to separate two pieces of content?
├── Is spacing alone sufficient?
│   └── YES → Use spacing. Done.
├── Still ambiguous? Would a background color change help?
│   └── YES → Use alternating backgrounds (bg-white / bg-gray-50). Done.
├── Still not clear? Is this a dense data table?
│   └── YES → Use divide-y with a light gray (divide-gray-100). Done.
├── Is this a conventional boundary (header/footer)?
│   └── YES → Use border-b / border-t. Done.
└── None of the above apply?
    └── Use a subtle border (border-gray-200). But question whether the layout is too dense.
```

## Anti-Patterns

1. **`divide-y` on everything** — Not every list needs lines between items. Cards with `gap-4` or `space-y-4` are usually cleaner.

2. **Borders + spacing** — Adding a border AND generous spacing is redundant. One or the other. The border says "these are separate." The spacing says "these are separate." Pick one.

3. **Dark borders** — `border-gray-300` or darker creates harsh visual lines. Default to `border-gray-200` or lighter. If you need `border-gray-400`, the layout probably needs rethinking.

4. **Borders as the first instinct** — If your first move when separating content is adding a `border-b`, train yourself to try `space-y` or `gap` first. You'll be surprised how often it's enough.

5. **`<hr>` for grouping** — An `<hr>` in a sidebar nav or between form fields adds visual noise. Use spacing between groups instead.

6. **Vertical dividers in stats rows** — `divide-x` between stats cards looks dated. Use individual cards with `gap-4` instead.
