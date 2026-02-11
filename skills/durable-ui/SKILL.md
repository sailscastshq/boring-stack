---
name: durable-ui
description: >
  Durable UI patterns for persisting client-side state across page loads, browser sessions, and shareable URLs
  in The Boring JavaScript Stack. Use this skill when implementing localStorage persistence, URL query parameter
  state, form draft auto-save, or any client-side state that should survive navigation in a Sails.js + Inertia.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: durable-ui, localStorage, url-state, query-params, form-persistence, state-management, boring-stack
---

# Durable UI

Durable UI is the practice of persisting meaningful client-side state so it survives page reloads, browser sessions, and — where appropriate — can be shared via URL. In The Boring JavaScript Stack, most application state lives on the server (database, session). Durable UI fills the gap for **UI preferences** and **navigation context** that belong on the client.

## When to Use

Use this skill when:

- Persisting UI preferences in localStorage (sidebar collapsed, dark mode, dismissed banners)
- Syncing filters, tabs, or pagination state to URL query parameters
- Auto-saving form drafts to localStorage with restore-on-return
- Deciding where state should live (client localStorage vs URL vs server session vs database)
- Building `useLocalStorage`, `useQueryState`, or `useFormDraft` hooks/composables/stores
- Handling cross-tab synchronization of localStorage values
- Implementing unsaved-changes warnings with Inertia.js navigation guards

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/principles.md](rules/principles.md) - Decision framework: when to use localStorage vs URL params vs session vs database
- [rules/local-storage.md](rules/local-storage.md) - localStorage patterns with examples for React, Vue, and Svelte
- [rules/url-state.md](rules/url-state.md) - URL query parameter sync with pushState/replaceState patterns
- [rules/form-persistence.md](rules/form-persistence.md) - Auto-save form drafts with restore, expiry, and unsaved-changes warnings
- [rules/react.md](rules/react.md) - Complete React hook implementations (useLocalStorage, useQueryState, useFormDraft)
- [rules/vue.md](rules/vue.md) - Complete Vue composable implementations (useLocalStorage, useQueryState, useFormDraft)
- [rules/svelte.md](rules/svelte.md) - Complete Svelte store implementations (localStorageStore, queryStateStore, formDraftStore)
