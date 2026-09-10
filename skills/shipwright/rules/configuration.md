---
name: configuration
description: Shipwright configuration - config/shipwright.js, framework plugins, entry points, path aliases, build options, output settings
metadata:
  tags: config, shipwright, rsbuild, plugins, react, vue, svelte, aliases, jsconfig, entry, output
---

# Shipwright configuration

`module.exports.shipwright.build` accepts Rsbuild configuration. A Vue template uses:

```js
const { pluginTailwindcss } = require('@rsbuild/plugin-tailwindcss')
const { pluginVue } = require('@rsbuild/plugin-vue')
const { pluginInertia } = require('rsbuild-plugin-inertia')

module.exports.shipwright = {
  build: {
    plugins: [pluginTailwindcss(), pluginVue(), pluginInertia()]
  }
}
```

For React, use `pluginReact()` from `@rsbuild/plugin-react`; for Svelte, use `pluginSvelte()` from `@rsbuild/plugin-svelte`. Keep the Tailwind and Inertia plugins in both cases.

## React Compiler

React Compiler is opt-in. With the React 2.1 plugin and Rsbuild 2.2, enable it using `pluginReact({ reactCompiler: true })`. The templates leave it disabled by default. Test application behavior before enabling it. React 17/18 applications additionally need `react-compiler-runtime` and a matching compiler target; these templates use React 19.

See the [React plugin options](https://rsbuild.rs/plugins/list/plugin-react).

## Entry and page discovery

Shipwright detects the browser entry. Keep `createInertiaApp()` in `assets/js/app.js`; `pluginInertia()` supplies page resolution from `assets/js/pages/` when no explicit resolver is present. Do not add a hand-written `require()` resolver to a normal template entry. An existing custom resolver is preserved. Set `pluginInertia({ pages: false })` only when taking responsibility for resolution yourself.

For SSR, the plugin detects `assets/js/ssr.js` and creates separate `web` and `node` environments. Browser entries and copied public assets belong to `web`; the private renderer belongs to `node`. See [SSR](ssr.md).

## Aliases and build options

Shipwright supplies `@` for `assets/js` and `~` for `assets`. Keep editor mappings in `jsconfig.json` consistent:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["assets/js/*"], "~/*": ["assets/*"] }
  }
}
```

Use `build.source.define` for explicitly public build-time constants. Values embedded in browser bundles are visible to users. Backend secrets belong in Sails configuration.

Use `build.output.assetPrefix` for a CDN and `build.output.sourceMap` for source-map policy. With multiple environments, scope browser-only changes to `build.environments.web` and server-only changes to `build.environments.node`.

Configure the application port in Sails, not as a separate Rsbuild listener. See [development](development.md) and the [Rsbuild configuration reference](https://rsbuild.rs/config/).
