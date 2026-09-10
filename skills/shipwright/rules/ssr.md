---
name: ssr
description: Server-side rendering (SSR) for Inertia.js apps - SSR entry point, config/inertia.js setup, framework-specific differences, when to use SSR
metadata:
  tags: ssr, server-side-rendering, seo, performance, react, vue, svelte, inertia
---

# Server-side rendering

Ascent Vue enables SSR. The other templates render on the client by default. SSR runs inside the Sails process through `inertia-sails`; no separate renderer server is needed.

## Build and enable

Keep `pluginInertia()` in the build plugins. It detects `assets/js/ssr.js`, creates a Node build, and writes `.tmp/ssr/inertia.mjs`. Enable rendering in `config/inertia.js`:

```js
module.exports.inertia = { ssr: true }
```

The default bundle is the compiled `.tmp/ssr/inertia.mjs`, not the source entry. For explicit options:

```js
module.exports.inertia = {
  ssr: { enabled: true, bundle: '.tmp/ssr/inertia.mjs', fallback: false }
}
```

Use `fallback: false` during verification so a renderer failure cannot pass as a client-only shell.

A Vue entry exports the renderer:

```js
import { createInertiaApp } from '@inertiajs/vue3'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

export default function render(page) {
  return createInertiaApp({
    page,
    render: renderToString,
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin)
    }
  })
}
```

`pluginInertia()` supplies page discovery here as in the browser entry. Preserve application-specific providers and shared components, such as Ascent Vue notifications, so server and client trees agree. Keep CSS imports in the browser entry.

## Externals and chunks

The plugin sets `output.target: 'node'` and `output.autoExternal: true` for the Node environment. Runtime dependencies must remain installed: externalized imports are resolved by Node at render time. Rsbuild's automatic externalization includes dependencies, optionalDependencies, and peerDependencies by default, not devDependencies. Scope any `autoExternal` overrides to the Node environment; do not externalize ordinary browser dependencies this way. See [output.autoExternal](https://rsbuild.rs/config/output/auto-external).

Rsbuild 2 can emit multiple Node chunks. The loader imports the entry, which loads companion chunks from `.tmp/ssr/`. Deploy that entire directory, not just `inertia.mjs`. Keep it outside `.tmp/public`. The plugin writes SSR files to disk in development because the Sails loader reads files rather than the browser dev middleware.

## Verification

Check a production HTTP response before browser JavaScript runs: an SSR login response must include its actual form markup. A 200 status and a `data-page` attribute alone do not prove SSR succeeded. Watch for fallback warnings and missing chunk/module errors. Also test hydration in the browser and source updates in development.

Keep browser APIs in mounted hooks/effects. Avoid nondeterministic values during rendering and maintain the same initial component tree on server and client. SSR is useful for public content but adds rendering work to each request; enable it where it serves the application.
