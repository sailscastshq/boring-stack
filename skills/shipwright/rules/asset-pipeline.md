---
name: asset-pipeline
description: Asset pipeline - CSS with Tailwind CSS, JavaScript entry and page resolution, static assets, code splitting, PostCSS configuration
metadata:
  tags: assets, css, tailwind, postcss, javascript, code-splitting, images, fonts, static, pipeline
---

# Asset pipeline

## Tailwind v4

Register `pluginTailwindcss()` from `@rsbuild/plugin-tailwindcss` in `config/shipwright.js`. It runs Tailwind through the webpack integration. All current templates use this path.

```css
/* assets/css/app.css */
@import 'tailwindcss';

@theme {
  --color-brand-500: #6c25c1;
}
```

Import this stylesheet from `assets/js/app.js` with `import '~/css/app.css'`. Preserve the template's existing theme, `@config`, and source declarations during migration. Keep utility names statically discoverable; use explicit maps for variants rather than constructing fragments such as `bg-${color}-500`.

Remove `@tailwindcss/postcss` when switching to the Rsbuild plugin. Delete `postcss.config.js` only if Tailwind was its only plugin. An older Tailwind v3 app must keep its compatible PostCSS setup until its CSS is deliberately migrated; the Rsbuild Tailwind plugin requires Tailwind v4.

See [the Tailwind plugin](https://rsbuild.rs/plugins/list/plugin-tailwindcss).

## Resource imports and static files

Import an asset to obtain its bundled URL, or use a resource query when the required representation matters:

```js
import logoUrl from '~/images/logo.svg'
import sourceText from './example.js?raw'
import downloadUrl from './example.js?url'
```

`?raw` imports text; `?url` imports an asset URL. Resource imports must not be transformed as executable page modules. See [Rsbuild static assets](https://rsbuild.rs/guide/basic/static-assets).

Shipwright copies static files from `assets/`, excluding JavaScript and stylesheet source directories. A copied `assets/images/logo.svg` is available at `/images/logo.svg`. Use imports when you want bundler processing; use a public path for copied assets. JavaScript and CSS source should not be copied into the public directory.

## HTML and chunks

Retain `shipwright.styles()` and `shipwright.scripts()` in the root EJS view. They use the build manifest to select assets; avoid manually naming output chunks. Keep the template's Inertia root and SSR markup intact.

Dynamic imports can emit companion chunks. Deploy the complete browser output, and, for SSR, the complete private `.tmp/ssr/` directory. Verify a production lift, page HTML, and each referenced JavaScript/CSS request after build changes.
