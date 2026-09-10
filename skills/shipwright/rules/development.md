---
name: development
description: Development workflow - dev server, HMR, Node --watch-path, views/app.ejs template, common issues, debugging, environment variables
metadata:
  tags: development, dev-server, hmr, hot-module-replacement, watch, debugging, troubleshooting, environment
---

# Development and HMR

Run `npm run dev` and browse the Sails origin (normally `http://localhost:1337`). Shipwright 1.5.1 creates Rsbuild middleware and attaches it to Sails' HTTP app. Its WebSocket connects to the same HTTP server; it does not start a second listener that needs an application proxy.

Set a different port through Sails, for example `PORT=3000 npm run dev`. Do not hardcode a second Rsbuild server port or HMR client port in a normal template.

For programmatic tests, select an available port and pass it explicitly to Sails, then read `sails.hooks.http.server.address().port` after lift. Navigate to that actual port. Do not assume `port: 0` selects an ephemeral port: Sails may normalize it to its default. The browser HMR connection should follow the served origin; verify this with a real source edit instead of assuming a fixed port such as 1337 or 3333.

## Verify hot reload

1. Open an existing page through Sails and type into a form.
2. Edit a visible label in its React or Vue component.
3. Confirm the new label appears without a document reload and the input remains intact.
4. Restore the source and confirm there are no compilation or browser errors.

React Fast Refresh and Vue HMR are supplied by their framework plugins. Frontend edits should not restart Sails. Backend changes under the watched paths restart the process. Restart after build-plugin or alias configuration changes.

## Troubleshooting

- Read terminal build errors and browser console/WebSocket errors first.
- Confirm assets and HMR connect to the Sails origin, including when using a dynamic test port or reverse proxy.
- For missing styles, check `pluginTailwindcss()`, the CSS import, static utility names, and source scanning.
- For unresolved imports, check paths, package installation, and aliases in `jsconfig.json`.
- For stale artifacts, stop the app before removing generated `.tmp/public` and `.tmp/ssr` output, then rebuild. Do not delete application data stored elsewhere in `.tmp`.
- Use Node `^20.19.0 || >=22.12.0`, including in CI and production.

Run `npm run lint`, `npm test`, and a production smoke after a build migration. In this repository, run `NODE_ENV=production node ../../scripts/smoke-template-production.cjs` from each template. It checks page HTML and referenced assets; SSR-enabled login pages must contain the rendered form, and SSR fallback warnings fail the check.
