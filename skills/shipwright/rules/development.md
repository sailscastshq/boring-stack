---
name: development
description: Development workflow - dev server, HMR, Node --watch-path, views/app.ejs template, common issues, debugging, environment variables
metadata:
  tags: development, dev-server, hmr, hot-module-replacement, watch, debugging, troubleshooting, environment
---

# Development Workflow

## Dev Server

### Starting Development

```bash
npm run dev
```

This executes:

```bash
node --watch-path=api --watch-path=config app.js
```

When `npm run dev` starts, two things happen:

1. **Sails lifts** -- The Node.js server starts, loads configuration, initializes hooks, binds routes
2. **Shipwright starts** -- The Shipwright hook starts Rsbuild's dev server, which compiles assets and enables HMR

The dev server proxies asset requests through Sails, so you access everything through a single URL (typically `http://localhost:1337`).

### How the Dev Server Works

In development (`NODE_ENV` is not `production`):

1. Shipwright starts Rsbuild's dev server on an internal port
2. The `shipwright.scripts()` and `shipwright.styles()` helpers in `views/app.ejs` inject tags pointing to the dev server
3. Rsbuild watches `assets/` for file changes
4. When a file changes, Rsbuild recompiles only what changed and sends an HMR update to the browser
5. The browser applies the update without a full page reload

In production (`NODE_ENV=production`):

1. Shipwright runs a full Rsbuild build before Sails starts listening
2. Compiled assets go to `.tmp/public/` with content hashes
3. `shipwright.scripts()` and `shipwright.styles()` read from `manifest.json` and inject production asset URLs
4. Sails serves the static files from `.tmp/public/`

## Hot Module Replacement (HMR)

HMR is the mechanism that updates code in the browser without a full page reload. Shipwright provides HMR through Rsbuild's built-in dev server.

### What HMR Updates

- **CSS changes** -- Instantly applied without any page state loss. Edit a Tailwind class or custom CSS and see it immediately.
- **React components** -- Updated via React Fast Refresh. Component state is preserved when possible. If the component signature changes significantly, a full re-render occurs.
- **Vue components** -- Updated via Vue's HMR API. Template, script, and style changes are applied incrementally.
- **Svelte components** -- Updated via Svelte's HMR support. Component state is preserved where possible.

### HMR State Preservation

HMR preserves component state during updates. For example, if you have a form with filled-in fields and you edit the component's layout, the form values remain after the HMR update.

State is **not** preserved when:

- The component's hooks or lifecycle methods change substantially
- The component is renamed or moved
- An error occurs during the update (HMR falls back to a full reload)

### When HMR Falls Back to Full Reload

- Changes to `assets/js/app.js` (the entry point) trigger a full reload
- Adding or removing page files triggers a full reload (the page map is rebuilt)
- Fatal errors in components cause Rsbuild to show an error overlay, and fixing the error triggers a reload

## Node --watch-path

The `--watch-path` flag is a Node.js feature (v18.11+) that restarts the process when watched files change:

```bash
node --watch-path=api --watch-path=config app.js
```

This watches:

- `api/` -- Controllers, helpers, hooks, models, policies, responses
- `config/` -- All configuration files

When a file in these directories changes, Node.js kills the Sails process and restarts it. This ensures server-side changes (new routes, updated actions, model changes) take effect.

### What --watch-path Does NOT Watch

- `assets/` -- Handled by Shipwright's HMR (no server restart needed)
- `views/` -- Changes to `app.ejs` require a manual browser refresh
- `scripts/` -- Shell scripts are run independently
- Root files -- `package.json`, `jsconfig.json`, `postcss.config.js` (restart `npm run dev` manually)

### Comparison with Alternatives

| Approach                       | Watches           | Restarts        |
| ------------------------------ | ----------------- | --------------- |
| `node --watch-path=api app.js` | `api/`, `config/` | Node process    |
| `nodemon app.js`               | Configurable      | Node process    |
| Shipwright HMR                 | `assets/`         | Browser modules |

The `--watch-path` approach is preferred because it is built into Node.js (no extra dependency) and scoped to only the directories that need server restarts.

## The views/app.ejs Template

`views/app.ejs` is the root HTML template that Sails renders on every initial page load. It is the shell that holds the Inertia application.

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

### Template Helpers

**`<%- shipwright.styles() %>`** -- Outputs CSS `<link>` tags. Uses raw output (`<%-`) because it produces HTML tags.

- **Development**: May output nothing (CSS is injected by the HMR dev server) or a `<link>` to the dev server's CSS
- **Production**: Outputs `<link rel="stylesheet" href="/static/css/index.a1b2c3d4.css">` from the manifest

**`<%- shipwright.scripts() %>`** -- Outputs JavaScript `<script>` tags. Uses raw output (`<%-`) because it produces HTML tags.

- **Development**: Outputs `<script>` tags pointing to the Rsbuild dev server
- **Production**: Outputs `<script src="/static/js/index.e5f6g7h8.js">` from the manifest

**`<%= JSON.stringify(page) %>`** -- Outputs the Inertia page object as escaped JSON. This is how Inertia bootstraps on the client -- the JavaScript entry reads this JSON and renders the correct page component.

### Customizing the Template

Add meta tags, favicons, or external resources:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#6C25C1" />
    <%- shipwright.styles() %>
  </head>
  <body class="antialiased bg-gray-50">
    <div id="app" data-page="<%= JSON.stringify(page) %>"></div>
    <%- shipwright.scripts() %>
  </body>
</html>
```

### Using Locals

The `local()` method passes data to the EJS template (not to page components). Locals become top-level variables in the template:

```js
// In a hook or middleware
sails.inertia.local('title', 'My App - Dashboard')
```

```html
<!-- views/app.ejs -->
<head>
  <title><%= locals.title || 'My App' %></title>
  <%- shipwright.styles() %>
</head>
```

### Multiple Root Templates

You can create multiple EJS templates for different layouts:

```
views/
├── app.ejs        # Default template (standard app layout)
├── auth.ejs       # Auth template (minimal, centered)
└── minimal.ejs    # Minimal template (no chrome)
```

Set the root view per-request using `sails.inertia.setRootView()`:

```js
// In a policy
module.exports = async function (req, res, proceed) {
  sails.inertia.setRootView('auth')
  return proceed()
}
```

Each template must include the `shipwright.styles()`, `shipwright.scripts()`, and `data-page` elements.

## Environment Variables

### Frontend Environment Variables

Use `source.define` in `config/shipwright.js` to expose values to frontend code:

```js
// config/shipwright.js
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()],
    source: {
      define: {
        'process.env.APP_NAME': JSON.stringify(
          process.env.APP_NAME || 'My App'
        ),
        'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN || ''),
        'process.env.PUBLIC_API_URL': JSON.stringify(
          process.env.PUBLIC_API_URL || ''
        )
      }
    }
  }
}
```

These values are inlined at build time:

```jsx
// Available in any frontend component
function Footer() {
  return <p>Powered by {process.env.APP_NAME}</p>
}
```

**Important**: Never expose secret keys or sensitive values through `source.define`. These values are embedded in the JavaScript bundle and visible to anyone.

### Backend Environment Variables

Backend environment variables are accessed through `sails.config.custom` or `process.env`. They are **not** bundled into frontend code. See the Sails configuration skill for details on `config/custom.js` and `config/env/production.js`.

## Common Issues

### Port Conflicts

If port 1337 is already in use:

```bash
# Find what's using the port
lsof -i :1337

# Use a different port
PORT=3000 node app.js
```

Or set the port in `config/local.js`:

```js
// config/local.js
module.exports = {
  port: 3000
}
```

### Stale Build Artifacts

If you see outdated styles or JavaScript:

```bash
# Remove the build output directory
rm -rf .tmp

# Restart the dev server
npm run dev
```

### Module Resolution Errors

If imports fail with "Cannot find module":

1. **Check the path alias** -- Verify `jsconfig.json` has the correct alias mapping
2. **Check the file extension** -- Rsbuild resolves `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte` automatically
3. **Restart the dev server** -- Some changes to `jsconfig.json` require a restart

```bash
# After changing jsconfig.json or postcss.config.js
# Stop the dev server (Ctrl+C) and restart
npm run dev
```

### HMR Not Working

If changes are not reflected in the browser:

1. **Check the browser console** -- Look for HMR connection errors
2. **Check the terminal** -- Look for build errors from Rsbuild
3. **Hard refresh** -- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
4. **Clear the build cache** -- `rm -rf .tmp && npm run dev`
5. **Check file watching** -- Ensure the changed file is inside `assets/`

### CSS Changes Not Applying

If Tailwind CSS changes do not appear:

1. **Check the class name** -- Tailwind CSS v4 uses standard CSS custom property names in `@theme`; ensure the utility exists
2. **Check postcss.config.js** -- Make sure the correct plugin is listed (`@tailwindcss/postcss` for v4, `tailwindcss` for v3)
3. **Check the import** -- Ensure `assets/css/app.css` is imported in `assets/js/app.js` via `import '~/css/app.css'`

### Build Errors in Production

If `npm start` fails:

```bash
# Run the production build locally to see errors
NODE_ENV=production node app.js
```

Common production build issues:

- **Missing dependencies** -- Ensure all runtime dependencies are in `dependencies` (not `devDependencies`) in `package.json`
- **Environment variables** -- Ensure all required variables are set in the production environment
- **Node.js version** -- Ensure the production server runs Node.js >= 18.0

## Debugging

### Build Errors

Rsbuild shows build errors in the terminal and overlays them in the browser. Read the error message carefully -- it typically includes the file path and line number.

```
ERROR in ./assets/js/pages/Dashboard.jsx
Module not found: Can't resolve '@/components/Chart'
```

This means the file `assets/js/components/Chart.jsx` does not exist or the path alias is misconfigured.

### Rsbuild Verbose Logging

For more detailed build output, set the `RSBUILD_LOG` environment variable:

```bash
RSBUILD_LOG=verbose npm run dev
```

### Browser Dev Tools

- **Console** -- Check for runtime errors, HMR messages, and hydration warnings
- **Network tab** -- Verify that asset requests succeed (200 status) and are not cached stale versions
- **Sources tab** -- With source maps enabled, you can debug the original source code
- **Elements tab** -- Inspect the rendered HTML and verify that `shipwright.styles()` and `shipwright.scripts()` injected the correct tags

### Checking the Build Output

Inspect what Shipwright built:

```bash
# List all output files
ls -la .tmp/public/static/js/
ls -la .tmp/public/static/css/

# View the manifest
cat .tmp/public/manifest.json
```

### Performance Profiling

Use the browser's Performance tab to profile the app. Look for:

- **Large JavaScript bundles** -- Consider code splitting with dynamic `import()`
- **Unused CSS** -- Tailwind CSS v4 automatically tree-shakes unused styles
- **Render-blocking resources** -- Ensure CSS is loaded in `<head>` and JS is loaded at the end of `<body>` (which `views/app.ejs` does by default)

## Development Tips

### Fast Iteration

- **Frontend changes** (components, CSS) are handled by HMR -- no server restart
- **Backend changes** (actions, helpers, routes) are handled by `--watch-path` -- automatic server restart
- **Configuration changes** (shipwright.js, postcss.config.js, jsconfig.json) require manually restarting `npm run dev`

### Editor Integration

The `jsconfig.json` file enables editor features:

- **Autocompletion** for path aliases (`@/components/` shows available components)
- **Jump to definition** works through alias paths
- **Error checking** with `checkJs: false` (disabled by default; enable for type checking)

### Running in Production Mode Locally

Test the production build locally before deploying:

```bash
# Build and run in production mode
NODE_ENV=production node app.js
```

This runs the full Rsbuild production build (minification, tree-shaking, content hashing) and serves the result. Useful for:

- Catching build errors before they hit CI/CD
- Testing that environment variables are set correctly
- Verifying asset hashing and cache behavior
- Checking that SSR works correctly (if enabled)
