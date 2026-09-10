# mellow-react

This template should help get you started developing with a modern Sails fullstack application with Sails and React.

This scaffold contains:

- Sails
- React
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

![Template preview](https://raw.githubusercontent.com/sailscastshq/boring-stack/main/.github/previews/mellow-react-home.png)

## Dependency maintenance

The September 2026 dependency refresh updates Sails, Nodemailer, and the framework/build dependencies. Nodemailer 10 requires Node 20 or newer, which is covered by this template's `engines` requirement. Commit `package-lock.json` with dependency changes and verify with `npm ci`, `npm run lint`, `npm test`, and a production build.

The `package.json` overrides keep `qs` on the patched 6.x line and `body-parser` on the patched 1.x line while upstream packages still pin older releases.

Revisit overrides when the upstream constraints include patched versions. Do not remove them based only on a successful install.
