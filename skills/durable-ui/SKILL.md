---
name: durable-ui
description: >
  Durable UI patterns for modern web development — persisting client-side state across page loads, browser sessions,
  and shareable URLs. Use this skill when implementing localStorage persistence, URL query parameter state, form draft
  auto-save, multi-step wizard persistence, click-outside dismissal, modal/dialog backdrop patterns, or any client-side
  state and interaction pattern that should be resilient and well-behaved. Works with React, Vue, and Svelte.
metadata:
  author: sailscastshq
  version: '1.1.0'
  tags: durable-ui, localStorage, url-state, query-params, form-persistence, multi-step-forms, click-outside, modal, dialog, backdrop, dropdown, state-management, web-dev
---

# Durable UI

Durable UI is the practice of making client-side state and interactions resilient. State should survive page reloads, browser sessions, and — where appropriate — be shareable via URL. Interactive elements like dropdowns and modals should be dismissable in the ways users expect (click outside, Escape, backdrop click). Multi-step flows should never lose progress. Durable UI fills the gap for **UI preferences**, **navigation context**, and **interaction patterns** that belong on the client.

## When to Use

Use this skill when:

- Persisting UI preferences in localStorage (sidebar collapsed, dark mode, dismissed banners)
- Syncing filters, tabs, or pagination state to URL query parameters
- Auto-saving form drafts to localStorage with restore-on-return
- Building multi-step wizard forms that preserve progress across reloads and navigation
- Making dropdowns, context menus, and popovers close on outside click or Escape
- Closing modals, dialogs, and confirms via backdrop click or Escape
- Deciding where state should live (client localStorage vs URL vs server session vs database)
- Building `useLocalStorage`, `useQueryState`, `useDurableUrl`, `useDurableStorage`, `useFormDraft`, `useWizardDraft`, or `useClickOutside` hooks/composables/stores
- Handling cross-tab synchronization of localStorage values
- Implementing unsaved-changes warnings with Inertia.js navigation guards
- Managing focus return after modal close, focus trapping, and focus after list item deletion
- Building optimistic UI updates with rollback on error (toggles, list mutations, Inertia integration)
- Restoring scroll position after navigation, back/forward, and within scrollable containers
- Implementing toast notification queues with auto-dismiss, pause-on-hover, and aria-live
- Building debounced search with AbortController cancellation for client-side and server-side filtering

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/principles.md](rules/principles.md) - Decision framework: when to use localStorage vs URL params vs session vs database
- [rules/local-storage.md](rules/local-storage.md) - localStorage patterns with examples for React, Vue, and Svelte
- [rules/url-state.md](rules/url-state.md) - URL query parameter sync with pushState/replaceState patterns
- [rules/form-persistence.md](rules/form-persistence.md) - Auto-save form drafts with restore, expiry, and unsaved-changes warnings
- [rules/multi-step-forms.md](rules/multi-step-forms.md) - Multi-step wizard persistence with per-step drafts and aggregate submission
- [rules/click-outside.md](rules/click-outside.md) - Close dropdowns, context menus, modals, and dialogs on outside click, backdrop click, or Escape
- [rules/focus-management.md](rules/focus-management.md) - Focus return after modal close, focus trapping, and focus after list item deletion
- [rules/optimistic-ui.md](rules/optimistic-ui.md) - Optimistic updates with rollback on error for toggles, list mutations, and Inertia actions
- [rules/scroll-restoration.md](rules/scroll-restoration.md) - Scroll position restoration after navigation, back/forward, and within scrollable containers
- [rules/toast-notifications.md](rules/toast-notifications.md) - Toast notification queues with auto-dismiss, pause-on-hover, and Inertia flash integration
- [rules/debounced-search.md](rules/debounced-search.md) - Debounced search with AbortController cancellation for client-side and server-side filtering
- [rules/react.md](rules/react.md) - Complete React hook implementations (useLocalStorage, useQueryState, useFormDraft)
- [rules/vue.md](rules/vue.md) - Complete Vue composable implementations (useLocalStorage, useQueryState, useDurableUrl, useDurableStorage, useFormDraft)
- [rules/svelte.md](rules/svelte.md) - Complete Svelte store implementations (localStorageStore, queryStateStore, formDraftStore)
