# Durable UI Skills for Claude Code

Build persistent, shareable UI state in The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/durable-ui
```

## Usage

After installing, Claude will automatically apply durable UI best practices when you work on client-side state persistence:

> "Add a collapsible sidebar that remembers its state"

> "Sync the active tab to the URL so users can share links"

> "Auto-save form drafts so users don't lose work on page reload"

> "Add filters to the users list that persist in the URL"

## Skills Included

- **principles** - Decision framework for choosing the right persistence layer
- **local-storage** - localStorage patterns (sidebar, dark mode, banners, cross-tab sync)
- **url-state** - URL query param sync (tabs, filters, pagination, modals)
- **form-persistence** - Auto-save drafts with restore, expiry, and unsaved-changes warnings
- **react** - Complete React hook implementations
- **vue** - Complete Vue composable implementations
- **svelte** - Complete Svelte store implementations

## What is Durable UI?

Durable UI keeps meaningful client-side state alive across page loads and browser sessions. It bridges the gap between server-side state (database, session) and ephemeral component state, using localStorage for preferences and URL parameters for shareable navigation context.

## Links

- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [Inertia.js Documentation](https://inertiajs.com)

## License

MIT
