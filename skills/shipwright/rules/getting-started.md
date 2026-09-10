---
name: getting-started
description: What Shipwright is, how it replaces the legacy Grunt pipeline, dev/build commands, project structure, and build output
metadata:
  tags: shipwright, rsbuild, setup, install, getting-started, build, hook, grunt, pipeline
---

# Getting started with Shipwright

Shipwright is the Sails asset hook built on Rsbuild. The templates use published `sails-hook-shipwright ^1.5.1`, which depends on `@rsbuild/core ^2.2.5`. Use Node `^20.19.0 || >=22.12.0` locally and in deployment.

| Templates                  | Framework plugin                |
| -------------------------- | ------------------------------- |
| Mellow React, Ascent React | `@rsbuild/plugin-react ^2.1.0`  |
| Mellow Vue, Ascent Vue     | `@rsbuild/plugin-vue ^2.0.1`    |
| Mellow Svelte              | `@rsbuild/plugin-svelte ^2.0.1` |

All five templates use Tailwind v4 with `@rsbuild/plugin-tailwindcss ^2.0.3` and `rsbuild-plugin-inertia` for page discovery and optional SSR builds. Install dependencies with `npm ci` after scaffolding; keep the template lockfile committed.

Run `npm run dev` to lift Sails with frontend HMR. The template command watches `api/` and `config/` for backend restarts. Run `npm start` for production: Shipwright builds during Sails lift, then Sails serves the generated assets. Build dependencies must be available at this stage; do not omit devDependencies before a production lift that builds assets.

The Grunt hook stays disabled in `.sailsrc`. Configure builds in `config/shipwright.js`; do not add a second standalone build server.

## Files and outputs

- `assets/js/app.js`: browser entry; imports `~/css/app.css` and starts Inertia.
- `assets/js/pages/`: framework page components discovered by the Inertia build plugin.
- `assets/css/app.css`: Tailwind import, theme, and application styles.
- `assets/js/ssr.js`: optional server renderer entry.
- `views/app.ejs`: Inertia root view using `shipwright.styles()` and `shipwright.scripts()`.
- `.tmp/public/manifest.json`: public asset manifest; use generated helpers rather than hardcoded hashed filenames.
- `.tmp/public/`: browser JavaScript, CSS, images, fonts, and copied static assets.
- `.tmp/ssr/`: private SSR entry and companion chunks, outside the public root.

Documentation lives at [docs.sailscasts.com](https://docs.sailscasts.com/boring-stack). Do not create a second documentation site in the repository's root `docs/` directory.
