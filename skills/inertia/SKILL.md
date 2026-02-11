---
name: inertia
description: >
  Inertia.js server-side rendering, redirects, shared data, forms, validation, and client-side patterns
  for The Boring JavaScript Stack. Use this skill when building pages, handling form submissions,
  managing redirects, sharing data, or working with any Inertia.js feature in a Sails.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: inertia, sails, boring-stack, spa, forms, redirects, shared-data, props
---

# Inertia.js for The Boring JavaScript Stack

Inertia.js is the bridge between Sails.js and your frontend framework (React, Vue, or Svelte) in The Boring JavaScript Stack. It lets you build modern single-page apps using classic server-side routing and controllers -- no API required. The `inertia-sails` package implements the full Inertia.js v2 protocol as a Sails hook.

## When to Use

Use this skill when:

- Rendering pages with Inertia (`responseType: 'inertia'`)
- Handling form submissions and redirects (`responseType: 'redirect'` vs `'inertiaRedirect'`)
- Sharing data globally across all pages (`sails.inertia.share()`, `once()`, `refreshOnce()`)
- Working with flash messages (`sails.inertia.flash()`)
- Handling validation errors (`responseType: 'badRequest'`, `form.errors`)
- Using advanced props: deferred, optional, always, merge, scroll
- Building frontend components with `useForm`, `usePage`, `Link`, `Head`, `router`
- Setting up `createInertiaApp` and persistent layouts
- Handling server errors with the Inertia error modal
- Working with partial reloads, history encryption, or asset versioning

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - How Inertia works, the protocol, client and server setup
- [rules/rendering-pages.md](rules/rendering-pages.md) - Server-side rendering, page objects, the `inertia` response type
- [rules/actions-and-exits.md](rules/actions-and-exits.md) - Action2 patterns, exit response types, the four action patterns
- [rules/redirects-and-responses.md](rules/redirects-and-responses.md) - redirect vs inertiaRedirect, when to use each, location visits
- [rules/shared-data-and-flash.md](rules/shared-data-and-flash.md) - share(), once(), refreshOnce(), flushShared(), flash()
- [rules/forms-and-validation.md](rules/forms-and-validation.md) - useForm, form submission, validation errors, badRequest flow
- [rules/props-system.md](rules/props-system.md) - AlwaysProp, DeferProp, MergeProp, OnceProp, OptionalProp, ScrollProp
- [rules/client-side-components.md](rules/client-side-components.md) - Link, router, usePage, Head, layouts, createInertiaApp
- [rules/error-handling.md](rules/error-handling.md) - Server errors, the dev error modal, production error handling
- [rules/advanced-features.md](rules/advanced-features.md) - History encryption, partial reloads, asset versioning, CSRF, SSR

### Framework-Specific APIs

- [rules/react.md](rules/react.md) - React: useForm, usePage, Link, Head, Deferred, WhenVisible, usePoll, layouts
- [rules/vue.md](rules/vue.md) - Vue: useForm, usePage, Link, Head, Deferred, WhenVisible, usePoll, defineOptions layouts
- [rules/svelte.md](rules/svelte.md) - Svelte: useForm (stores), page store, Link, inertia action, svelte:head, layouts
