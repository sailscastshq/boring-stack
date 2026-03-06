---
name: beautiful-ui
description: >
  Beautiful UI patterns for modern web development — semantic HTML, accessible markup, responsive design, typography,
  and form UX. Use this skill when building page layouts, structuring content, choosing semantic elements, implementing
  navigation, building forms, creating data tables, handling accessibility, designing responsive layouts, establishing
  typographic hierarchy, or any markup and styling that should be meaningful, accessible, and well-structured.
  Works with React, Vue, and Svelte with Tailwind CSS.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: beautiful-ui, semantic-html, accessibility, a11y, responsive, typography, form-ux, landmarks, aria, navigation, forms, tables, headings, tailwind, mobile-first, container-queries
---

# Beautiful UI

Beautiful UI is the practice of building interfaces that are meaningful, accessible, and structurally correct. Every element should carry semantic weight — describing what content _is_, not just how it _looks_. Every layout should respond to the user's device. Every form should be fast to complete and forgiving of mistakes. Beautiful UI fills the gap between "it looks right" and "it _is_ right."

## When to Use

Use this skill when:

- Building page layouts with `<header>`, `<main>`, `<aside>`, `<footer>` landmarks
- Structuring content sections with `<article>`, `<section>`, `<nav>`
- Choosing between `<div>` / `<span>` and a more meaningful element
- Writing navigation menus, breadcrumbs, and pagination
- Building forms with proper labels, fieldsets, validation timing, and error presentation
- Creating data tables with `<thead>`, `<tbody>`, `<caption>`, and `<scope>`
- Establishing heading hierarchy (`<h1>` through `<h6>`)
- Using interactive elements like `<details>`, `<dialog>`, `<menu>`
- Embedding media with `<figure>`, `<figcaption>`, `<picture>`, `<video>`
- Adding ARIA roles, live regions, skip links, or focus management
- Making keyboard navigation work for tabs, menus, and custom widgets
- Respecting `prefers-reduced-motion` and color contrast requirements
- Building responsive layouts with Tailwind breakpoints and container queries
- Creating responsive navigation (hamburger menus, off-canvas sidebars)
- Making tables responsive (scroll, card transformation, priority columns)
- Establishing typographic hierarchy with size, weight, and color
- Using `tabular-nums` for data alignment, `text-balance` for headings
- Configuring font stacks, custom fonts, and the prose/typography plugin
- Designing form layouts (single-column, multi-column for related fields)
- Implementing "reward early, punish late" validation with Inertia.js
- Choosing between radio buttons and select menus
- Building destructive action confirmations (type-to-confirm)

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/semantic-html.md](rules/semantic-html.md) - Element selection guide: when to use which HTML element and why
- [rules/accessibility.md](rules/accessibility.md) - ARIA roles, live regions, skip links, focus management, keyboard navigation, screen reader announcements, contrast, and reduced motion
- [rules/responsive-patterns.md](rules/responsive-patterns.md) - Mobile-first breakpoints, container queries, responsive grids, navigation, tables, forms, touch targets, and viewport units
- [rules/typography.md](rules/typography.md) - Type scale, font stacks, line height, line length, letter spacing, font weight hierarchy, text color, prose styling, truncation, tabular numbers, and dark mode
- [rules/form-ux.md](rules/form-ux.md) - Form layout, label placement, input sizing, validation timing, error presentation, submit buttons, optional fields, help text, and destructive action confirmation
- [rules/spacing-over-dividers.md](rules/spacing-over-dividers.md) - Default to spacing over borders and dividers — fewer lines, more whitespace, cleaner interfaces
