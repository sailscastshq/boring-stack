---
name: getting-started
description: What Shipwright is, how it replaces the legacy Grunt pipeline, dev/build commands, project structure, and build output
metadata:
  tags: shipwright, rsbuild, setup, install, getting-started, build, hook, grunt, pipeline
---

# Getting Started with Shipwright

## What is Shipwright?

Shipwright (`sails-hook-shipwright`) is the modern build system for The Boring JavaScript Stack. It is a Sails.js hook that wraps [Rsbuild](https://rsbuild.dev) -- a high-performance build tool built on Rspack -- to provide a fast, zero-config asset pipeline for Sails applications.

Shipwright replaces the legacy Grunt pipeline that older Sails.js versions used for compiling assets. Instead of Grunt tasks and a `tasks/` directory, Shipwright provides:

- **Hot Module Replacement (HMR)** in development for instant feedback
- **Framework plugins** for React, Vue, and Svelte via Rsbuild's plugin system
- **Automatic code splitting** for optimized production bundles
- **Tailwind CSS** integration through PostCSS
- **Path aliases** via `jsconfig.json` for clean imports
- **Manifest-based asset versioning** for cache busting

## Prerequisites

Shipwright is installed as a `devDependency` in every Boring Stack project. The key packages are:

```json
{
  "devDependencies": {
    "sails-hook-shipwright": "^1.1.0",
    "@rsbuild/plugin-react": "^1.1.0",
    "@tailwindcss/postcss": "^4.1.16",
    "tailwindcss": "^4.1.16"
  }
}
```

The framework plugin varies by template:

| Template      | Plugin Package           |
| ------------- | ------------------------ |
| mellow-react  | `@rsbuild/plugin-react`  |
| mellow-vue    | `@rsbuild/plugin-vue`    |
| mellow-svelte | `@rsbuild/plugin-svelte` |
| ascent-react  | `@rsbuild/plugin-react`  |
| ascent-vue    | `@rsbuild/plugin-vue`    |

Shipwright is listed in `devDependencies` because it is a build-time tool. In production, the build step runs before the server starts, and Sails serves the pre-built static files from `.tmp/public/`.

## Why Shipwright Replaced Grunt

Older Sails.js applications used a Grunt-based pipeline with a `tasks/` directory containing Grunt configurations for LESS compilation, JavaScript concatenation, and file copying. This approach had several drawbacks:

- Grunt is slow compared to modern bundlers
- No HMR -- changes required a full page reload
- No tree-shaking or code splitting
- Complex configuration for simple tasks
- No support for modern frameworks like React, Vue, or Svelte

The Boring Stack disables the Grunt hook in `.sailsrc` and uses Shipwright instead:

```json
{
  "hooks": {
    "grunt": false
  }
}
```

Shipwright hooks into Sails' lift process automatically. When Sails detects `sails-hook-shipwright` in the project's `node_modules`, it loads the hook and either starts the Rsbuild dev server (in development) or runs a production build (when `NODE_ENV=production`).

## Commands

### Development

```bash
npm run dev
```

This runs:

```bash
node --watch-path=api --watch-path=config app.js
```

What happens during development:

1. `node app.js` lifts Sails
2. Shipwright hook initializes and starts Rsbuild's dev server
3. Rsbuild compiles assets from `assets/js/app.js` and serves them with HMR
4. The `--watch-path` flags tell Node.js to restart the Sails process when files in `api/` or `config/` change
5. Frontend changes (components, CSS) are hot-reloaded without a server restart

### Production

```bash
npm start
```

This runs:

```bash
NODE_ENV=production node app.js
```

What happens in production:

1. Shipwright detects `NODE_ENV=production`
2. Rsbuild runs a full production build (minification, tree-shaking, code splitting)
3. Build output goes to `.tmp/public/`
4. A `manifest.json` is generated for asset versioning
5. Sails starts and serves the static files from `.tmp/public/`

## Project Structure

The asset-related files in a Boring Stack project:

```
my-app/
├── assets/
│   ├── css/
│   │   └── app.css               # Main CSS entry (Tailwind CSS)
│   ├── js/
│   │   ├── app.js                 # JavaScript entry point
│   │   └── pages/                 # Inertia page components
│   │       ├── Home.jsx           # React example
│   │       ├── Home.vue           # Vue example
│   │       └── Home.svelte        # Svelte example
│   └── images/                    # Static images
├── views/
│   └── app.ejs                    # Root HTML template
├── config/
│   └── shipwright.js              # Shipwright/Rsbuild configuration
├── postcss.config.js              # PostCSS plugins (Tailwind)
├── jsconfig.json                  # Path aliases and editor support
├── .tmp/
│   └── public/                    # Build output (generated)
│       ├── static/
│       │   ├── js/
│       │   │   ├── index.[hash].js
│       │   │   └── async/         # Code-split chunks
│       │   └── css/
│       │       └── index.[hash].css
│       └── manifest.json          # Asset manifest for versioning
└── package.json
```

### Key Files

**`assets/js/app.js`** -- The JavaScript entry point. This file bootstraps the Inertia app and imports global CSS:

```js
// React entry point
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    color: '#6C25C1'
  }
})
```

**`assets/css/app.css`** -- The main CSS file. Uses Tailwind CSS v4's `@import` syntax:

```css
@import 'tailwindcss';

@theme {
  --color-brand: #6c25c1;
  --color-brand-500: #6c25c1;
  --color-brand-600: #521c92;
}
```

**`views/app.ejs`** -- The root HTML template that Sails renders on the initial page load:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <%- shipwright.styles() %>
  </head>
  <body>
    <div id="app" data-page="<%= JSON.stringify(page) %>"></div>
    <%- shipwright.scripts() %>
  </body>
</html>
```

The `shipwright.styles()` and `shipwright.scripts()` helpers inject the correct `<link>` and `<script>` tags. In development, they point to the Rsbuild dev server. In production, they reference the hashed files from the build output.

**`config/shipwright.js`** -- Configures the Rsbuild build, primarily for framework plugins:

```js
// React
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()]
  }
}
```

## How Shipwright Works

### Hook Lifecycle

1. **Sails lifts** -- `node app.js` or `npm run dev`
2. **Hook discovery** -- Sails finds `sails-hook-shipwright` in `node_modules`
3. **Configuration merge** -- `config/shipwright.js` merges into `sails.config.shipwright`
4. **Initialization** -- The hook reads the config and prepares Rsbuild
5. **Dev mode** -- Rsbuild dev server starts alongside Sails (with HMR proxy)
6. **Production mode** -- Rsbuild runs a build, outputs to `.tmp/public/`, then Sails serves static files

### Template Helpers

Shipwright injects two EJS helpers into the view locals:

- **`shipwright.styles()`** -- Returns `<link>` tags for CSS files. In dev mode, this may return nothing (CSS is injected by the dev server). In production, it returns hashed CSS file references from the manifest.
- **`shipwright.scripts()`** -- Returns `<script>` tags for JavaScript bundles. In dev mode, this points to the Rsbuild dev server URL. In production, it returns hashed JS file references from the manifest.

### Asset Versioning

Inertia.js uses asset versioning to detect when the frontend has changed. The `inertia-sails` hook automatically reads `.tmp/public/manifest.json` and hashes its contents to produce a version string. When assets change, the version changes, and Inertia triggers a full page reload to pick up the new assets.

```js
// This happens automatically -- no configuration needed
// inertia-sails reads .tmp/public/manifest.json and hashes it
// The version is sent as X-Inertia-Version header
```

## Creating a New Project

When scaffolding a new Boring Stack project with `create-sails`, Shipwright is set up automatically:

```bash
npx create-sails my-app
```

The generator:

1. Installs `sails-hook-shipwright` as a devDependency
2. Installs the appropriate framework plugin (`@rsbuild/plugin-react`, etc.)
3. Creates `config/shipwright.js` with the framework plugin
4. Creates `views/app.ejs` with `shipwright.styles()` and `shipwright.scripts()` helpers
5. Creates `assets/js/app.js` as the entry point
6. Creates `postcss.config.js` with the Tailwind CSS plugin
7. Creates `jsconfig.json` with path aliases

No additional setup is needed -- `npm run dev` starts the development server immediately.
