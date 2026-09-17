# rsbuild-plugin-inertia

Rsbuild plugin for Inertia.js apps in The Boring JavaScript Stack.

```js
const { pluginVue } = require('@rsbuild/plugin-vue')
const { pluginInertia } = require('rsbuild-plugin-inertia')

module.exports.shipwright = {
  build: {
    plugins: [pluginVue(), pluginInertia()]
  }
}
```

## What it handles

- Centralizes Inertia-specific Rsbuild configuration.
- Stubs Inertia v3's optional Axios adapter import when Axios is not installed,
  so templates do not need to ship Axios just to satisfy the bundler.
- Injects a Boring Stack default page resolver for `./pages`.
- Supports an Inertia/Vite-style `pages` shorthand when apps need to override
  the default.
- Lazy-loads pages by default for automatic page-level code splitting.
- Provides an SSR build configuration path without enabling runtime SSR by
  default.
- Sends HTML interstitials (Cloudflare challenges, WAF blocks, proxy error
  pages) to the browser as real page loads instead of Inertia's error dialog.

## Vite Plugin Parity

Inertia's Vite plugin gives apps two big conveniences: page resolution and SSR
developer-mode wiring. This plugin brings the page-resolution side to Rsbuild
now, using Rspack primitives:

- default `./pages` resolver injection
- `pages: './pages'` shorthand for explicit overrides
- `pages: { path, extension, lazy, transform }` object shorthand
- lazy page loading by default
- `lazy: false` for single-bundle apps
- framework-aware default export handling for Vue, React, and Svelte
- automatic resolver injection when no `pages` or `resolve` is configured
- automatic SSR entry detection when `assets/js/ssr.js` exists

SSR is split deliberately. The plugin can prepare a Node build environment, but
Sails should decide which requests render through SSR. That keeps hybrid EJS and
Inertia apps predictable and gives Boring Stack projects room for per-page SSR
instead of forcing every Inertia response through one runtime policy.

## Page Resolution

```js
createInertiaApp({
  setup({ el, App, props }) {
    // mount your framework app
  }
})
```

The plugin detects Vue, React, or Svelte from the Inertia adapter import and
generates the matching resolver for `./pages`. By default it uses Rspack's lazy
`require.context` mode, which gives Boring Stack apps the same code-splitting
benefit Inertia's Vite plugin gets from `import.meta.glob`.

Only configure `pages` when an app uses a non-standard directory or wants to
change resolver behavior:

```js
createInertiaApp({
  pages: {
    path: './pages',
    lazy: false
  },
  setup({ el, App, props }) {
    // mount your framework app
  }
})
```

Set `lazy: false` when you intentionally want all pages in the initial bundle.

The shorthand also supports custom extensions and page-name transforms:

```js
createInertiaApp({
  pages: {
    path: './screens',
    extension: ['.jsx', '.tsx'],
    transform: (name, page) => page.component || name
  },
  setup({ el, App, props }) {
    // mount your framework app
  }
})
```

If an app calls `createInertiaApp()` without `pages` or `resolve`, the plugin
injects the Boring Stack default resolver for `./pages`. This differs from the
Vite plugin's Laravel-friendly `./pages`/`./Pages` fallback because Rspack
requires `require.context` directories to be static and present at build time.
Apps using `./Pages` can opt in explicitly with `pages: './Pages'`.

## SSR Build Environment

Runtime SSR remains controlled by the server adapter, but the plugin prepares
the Rsbuild `node` environment automatically when `assets/js/ssr.js` exists:

```js
pluginInertia()
```

Only configure `ssr` when an app uses a non-standard SSR entry point:

```js
pluginInertia({
  ssr: {
    entry: 'assets/js/server.js'
  }
})
```

Set `ssr: false` to disable auto-detection.

Then `config/inertia.js` can decide which requests actually render through SSR:

```js
module.exports.inertia = {
  ssr: {
    enabled: true
  }
}
```

When `enabled` is true and `pages` is omitted, every Inertia page can SSR. Use
`pages: ['index', 'pricing']` to make SSR selective.

The Boring JavaScript Stack does not need a separate SSR server process; Sails
imports the private `.tmp/ssr/inertia.mjs` bundle in-process.

## HTML Interstitials

When an Inertia visit is answered by something in front of your app instead of
the app itself, such as a Cloudflare challenge, a WAF block, or a proxy error
page, Inertia shows its error dialog with that page trapped in an iframe. A
challenge can never complete in there, so the visitor is stuck.

The plugin fixes this without any app code. It adds a small browser runtime to
the module that calls `createInertiaApp()`, which listens for Inertia's
cancelable `inertia:httpException` event and turns the response into a real
page load so the browser can handle it:

- GET visits load the visited URL. Other methods (form submissions) reload the
  current page, because a POST cannot be replayed as a navigation.
- Only `text/html` responses without the `X-Inertia` header are handled. JSON
  errors and Inertia's own error responses keep Inertia's default behavior.
- In production, any such HTML response navigates. In development, the dialog
  stays for ordinary server errors so they remain debuggable, and only clear
  interstitials navigate: a `cf-mitigated` header or a `403`, `429`, or `503`
  status.
- If the same URL hits an interstitial again within 15 seconds of navigating to
  it (for example deferred props or polling blocked by a WAF rule that the full
  page load did not clear), the runtime steps aside and Inertia's default
  handling runs, so it cannot reload in a loop.
- The runtime only ships in the browser build. The SSR bundle never receives
  it.

Per-visit `onHttpException` callbacks still run first, so a visit can handle a
response itself by returning `false`.

To keep Inertia's default dialog for every non-Inertia response, opt out:

```js
pluginInertia({
  interstitials: false
})
```
