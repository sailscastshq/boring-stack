---
name: principles
description: Decision framework for choosing the right persistence layer and interaction pattern — localStorage vs URL params vs session vs database, and when to use dismissal patterns
metadata:
  tags: principles, decision-framework, state-management, durability, architecture, dismissal, interaction
---

# Durable UI Principles

Durable UI covers two complementary concerns: **state resilience** (making data survive reloads, navigation, and crashes) and **interaction resilience** (making UI elements behave predictably — closing when expected, preserving progress, recovering gracefully).

## The Durability Spectrum

Not all state needs the same persistence strategy. There are four tiers, each with increasing durability:

| Tier          | Storage                | Survives Reload? | Shareable?  | Cross-Device?  | Example                          |
| ------------- | ---------------------- | ---------------- | ----------- | -------------- | -------------------------------- |
| **Ephemeral** | React/Vue/Svelte state | No               | No          | No             | Dropdown open, modal open, hover |
| **Browser**   | localStorage           | Yes              | No          | No             | Sidebar collapsed, dark mode     |
| **URL**       | Query parameters       | Yes              | Yes         | Yes (via link) | Active tab, filters, page        |
| **Server**    | Session / Database     | Yes              | Via session | Yes (database) | Cart contents, user prefs        |

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

## Interaction Resilience

Beyond persistence, durable UI means interactive elements behave the way users expect. Every overlay, form, and multi-step flow should handle these scenarios:

### Dismissal Matrix

| Element                  | Click outside | Backdrop click | Escape key | Required?              |
| ------------------------ | :-----------: | :------------: | :--------: | ---------------------- |
| Dropdown / popover       |      Yes      |       —        |    Yes     | Always                 |
| Context menu             |      Yes      |       —        |    Yes     | Always                 |
| Modal / dialog           |       —       |      Yes       |    Yes     | Always                 |
| Confirm dialog           |       —       |      Yes       |    Yes     | Always                 |
| Drawer / sidebar overlay |       —       |      Yes       |    Yes     | Always                 |
| Toast / notification     |       —       |       —        |  Optional  | Auto-dismiss preferred |

See [click-outside.md](click-outside.md) for implementations.

### Focus & Feedback Matrix

| Scenario                          | What should happen                                    | Rule                                             |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Modal closes                      | Focus returns to the element that triggered it        | [focus-management.md](focus-management.md)       |
| Modal opens                       | Focus is trapped inside the modal (Tab cycles within) | [focus-management.md](focus-management.md)       |
| List item deleted                 | Focus moves to next item (or previous if last)        | [focus-management.md](focus-management.md)       |
| Optimistic action succeeds        | UI already reflects the change, no jank               | [optimistic-ui.md](optimistic-ui.md)             |
| Optimistic action fails           | UI rolls back to previous state, error shown          | [optimistic-ui.md](optimistic-ui.md)             |
| Back/forward navigation           | Scroll position restored to where user was            | [scroll-restoration.md](scroll-restoration.md)   |
| Scrollable container re-rendered  | Scroll position preserved                             | [scroll-restoration.md](scroll-restoration.md)   |
| Server action completes           | Toast notification shown, auto-dismissed              | [toast-notifications.md](toast-notifications.md) |
| User hovers toast                 | Auto-dismiss pauses until hover ends                  | [toast-notifications.md](toast-notifications.md) |
| Search input typing               | Debounced — no request until user pauses (300ms)      | [debounced-search.md](debounced-search.md)       |
| New search while previous pending | Previous request cancelled via AbortController        | [debounced-search.md](debounced-search.md)       |

### Form Resilience Matrix

| Scenario                                   | What should happen                                       | Rule                                       |
| ------------------------------------------ | -------------------------------------------------------- | ------------------------------------------ |
| Single form + accidental refresh           | Auto-saved draft restored                                | [form-persistence.md](form-persistence.md) |
| Multi-step wizard + accidental refresh     | Resume at last step with all data                        | [multi-step-forms.md](multi-step-forms.md) |
| Navigate away with unsaved changes         | Warning before leaving                                   | [form-persistence.md](form-persistence.md) |
| Multi-step wizard + navigate between steps | No warning (intentional navigation)                      | [multi-step-forms.md](multi-step-forms.md) |
| Form submitted successfully                | Clear draft, no stale data next visit                    | Both                                       |
| Edit form with no changes                  | Submit button disabled — UI reflects nothing has changed | UI Honesty                                 |
| Edit form with changes                     | Submit button enabled — UI signals unsaved changes exist | UI Honesty                                 |

### UI Honesty

The interface must reflect the true state of user intent. Never assume — derive.

The most common violation is an always-enabled "Update" button on edit forms. When the button is always clickable, the user can't tell if they've changed anything, the app can't warn about unsaved changes, and submitting without changes wastes a server round-trip.

**Rule:** Disable submit buttons until the form is dirty. With Inertia.js, `useForm` tracks `isDirty` automatically:

```html
<!-- Vue -->
<button :disabled="!form.isDirty || form.processing">Update</button>
```

```jsx
{
  /* React */
}
;<button disabled={!form.isDirty || form.processing}>Update</button>
```

This principle extends beyond buttons:

- "Save" indicators should only appear when there's something to save
- Badge counts should be computed from the actual list, not maintained separately
- "Changes saved" toasts should only fire when changes were actually persisted
- Any visual signal that communicates state should be derived from actual state, not assumed

## Anti-Patterns

1. **Don't store sensitive data in localStorage** — It's accessible to any JavaScript on the page. Never store tokens, passwords, or PII.

2. **Don't duplicate server state in localStorage** — If the server already has the data, don't cache it client-side. Use Inertia's `once()` prop caching instead.

3. **Don't use localStorage for data that needs to sync in real-time** — Use Inertia shared data or WebSockets instead.

4. **Don't put ephemeral state in the URL** — Tooltip visibility, dropdown open state, and animation state don't belong in the URL.

5. **Don't use `pushState` for every URL change** — Rapid filter typing would create dozens of history entries. Use `replaceState` for refinement.
