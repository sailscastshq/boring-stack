# Svelte

This template should help get you started developing with a modern Sails fullstack application with Inertia and Svelte.

This scaffold contains:

- Sails
- Svelte
- Tailwind

## Testing

Mellow ships with Sounding trials for helpers, HTTP endpoints, Inertia visits, and browser-capable page behavior.

```bash
npm test
npm run test:unit
npm run test:functional
npm run test:e2e
```

- `tests/unit/` covers helpers and small business logic.
- `tests/functional/` covers request behavior and Inertia `visit()` contracts.
- `tests/e2e/` is reserved for browser-capable trials that opt into `{ browser: true }`.

## Application-owned UI

This template ships editable [Klean UI and Klean Icons](https://docs.sailscasts.com/klean-ui/) source, installed with `klean-ui@0.0.4` under `assets/js/components/ui/`. Ordinary Tailwind classes at the call site control its appearance. There is no Klean runtime or provider.

See [UI.md](UI.md) for the installed inventory, artwork exceptions, and safe update workflow.

## Design and customization

Mellow uses warm off-white surfaces, violet actions, restrained serif headings, and a readable system sans-serif for forms. Landing content is organized in ruled sections; profile forms use aligned description and control columns on wide screens. Authentication, recovery, and status pages share the same compact form treatment. See [UI.md](UI.md) for the palette, application recipes, page inventory, and screenshot workflow.

![Template preview](https://raw.githubusercontent.com/sailscastshq/boring-stack/main/.github/previews/mellow-svelte-home.png)
