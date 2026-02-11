---
name: principles
description: Decision framework for choosing the right persistence layer — localStorage vs URL params vs session vs database
metadata:
  tags: principles, decision-framework, state-management, durability, architecture
---

# Durable UI Principles

## The Durability Spectrum

Not all state needs the same persistence strategy. The Boring JavaScript Stack provides four tiers, each with increasing durability:

| Tier          | Storage                | Survives Reload? | Shareable?  | Cross-Device?  | Example                      |
| ------------- | ---------------------- | ---------------- | ----------- | -------------- | ---------------------------- |
| **Ephemeral** | React/Vue/Svelte state | No               | No          | No             | Dropdown open, hover state   |
| **Browser**   | localStorage           | Yes              | No          | No             | Sidebar collapsed, dark mode |
| **URL**       | Query parameters       | Yes              | Yes         | Yes (via link) | Active tab, filters, page    |
| **Server**    | Session / Database     | Yes              | Via session | Yes (database) | Cart contents, user prefs    |

## Decision Matrix

Use this flowchart to choose where state belongs:

```
Is this state meaningful to another user clicking a shared link?
├── YES → URL query parameters (tabs, filters, pagination, open sections)
└── NO
    ├── Is it a user preference that should persist across visits?
    │   ├── YES → Does it need to sync across devices?
    │   │   ├── YES → Database (save to User model or a Preferences table)
    │   │   └── NO → localStorage (sidebar collapsed, dark mode, dismissed banners)
    │   └── NO → Component state (ephemeral)
    └── Is it form data the user hasn't submitted yet?
        ├── YES → localStorage with auto-save (draft persistence)
        └── NO → Component state (ephemeral)
```

## The Shareability Test

**"Would another user clicking a link need this state?"**

If YES, put it in the URL. This is the single most important test:

- `/settings?tab=billing` — YES, another user should land on the billing tab
- `/users?search=john&role=admin` — YES, the filter should reproduce
- Sidebar collapsed — NO, that's a personal preference → localStorage
- Dark mode — NO, personal preference → localStorage
- Unsaved form draft — NO, only the author needs it → localStorage

## The Back-Button Test

When using URL state, decide between `pushState` and `replaceState`:

- **pushState** — Creates a new history entry. Use for navigation-like changes:

  - Switching tabs: `/settings?tab=billing` → `/settings?tab=security`
  - Paginating: `/users?page=1` → `/users?page=2`

- **replaceState** — Updates the current entry silently. Use for refinement:
  - Typing in a search filter: `/users?search=j` → `/users?search=jo` → `/users?search=john`
  - Toggling sort direction: `/users?sort=name&dir=asc` → `/users?sort=name&dir=desc`

**Rule of thumb**: If the user would expect the back button to undo it, use `pushState`. If they would be annoyed by many back-button steps, use `replaceState`.

## Interaction with Inertia.js

Inertia.js manages full-page state on the server. Durable UI is specifically for **client-only state** that doesn't need server involvement:

| Approach                   | When to Use                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| **Client-only URL sync**   | Filters/tabs that work with existing page data (no server request needed)         |
| **Inertia `router.get()`** | Filters that need the server to re-query data (search with server-side filtering) |
| **Inertia `useRemember`**  | Preserving form state across Inertia navigations (built-in, no localStorage)      |
| **localStorage**           | Preferences that persist beyond the current session                               |

When server data depends on the URL state (e.g., paginated results), combine both:

```js
// Client reads URL params on mount, then fetches from server via Inertia
router.get('/users', { search, page, sort }, { preserveState: true })
```

When the filter is purely client-side (e.g., filtering already-loaded data):

```js
// Client-only: update URL without server request
window.history.replaceState({}, '', `?tab=${tab}`)
```

## Key Naming Conventions

### localStorage Keys

Use a namespaced prefix to avoid collisions. The Ascent templates use `ASCENT_`:

```
ASCENT_SIDEBAR_COLLAPSED     → boolean
ASCENT_DARK_MODE             → "light" | "dark" | "system"
ASCENT_DISMISSED_BANNERS     → ["welcome", "upgrade"]
ASCENT_DRAFT_POST_123        → { title: "...", body: "..." }
```

Pattern: `{APP_PREFIX}_{FEATURE}_{OPTIONAL_ID}`

### URL Parameter Keys

Keep them short, lowercase, and hyphen-free:

```
?tab=billing                 → Single active tab
?search=john&role=admin      → Filters
?sort=name&dir=asc           → Sorting
?page=3                      → Pagination
?open=pricing                → Open section/modal
```

## SSR Safety

All localStorage and URL access must be guarded for server-side rendering. Window APIs don't exist during SSR:

```js
// WRONG — crashes during SSR
const value = localStorage.getItem('key')

// RIGHT — guard with typeof check
const value = typeof window !== 'undefined' ? localStorage.getItem('key') : null
```

The framework-specific hooks/composables/stores in this skill handle SSR safety automatically.

## Storage Limits and Error Handling

localStorage has a ~5MB limit per origin. Always wrap operations in try/catch:

```js
try {
  localStorage.setItem(key, JSON.stringify(value))
} catch (error) {
  // QuotaExceededError — storage is full
  console.warn(`Failed to save to localStorage: ${error.message}`)
}
```

For URL state, be mindful of URL length limits (~2,000 characters is safe across all browsers). Don't store large datasets in the URL.

## Anti-Patterns

1. **Don't store sensitive data in localStorage** — It's accessible to any JavaScript on the page. Never store tokens, passwords, or PII.

2. **Don't duplicate server state in localStorage** — If the server already has the data, don't cache it client-side. Use Inertia's `once()` prop caching instead.

3. **Don't use localStorage for data that needs to sync in real-time** — Use Inertia shared data or WebSockets instead.

4. **Don't put ephemeral state in the URL** — Tooltip visibility, dropdown open state, and animation state don't belong in the URL.

5. **Don't use `pushState` for every URL change** — Rapid filter typing would create dozens of history entries. Use `replaceState` for refinement.
