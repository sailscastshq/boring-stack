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
