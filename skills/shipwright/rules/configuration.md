---
name: configuration
description: Shipwright configuration - config/shipwright.js, framework plugins, entry points, path aliases, build options, output settings
metadata:
  tags: config, shipwright, rsbuild, plugins, react, vue, svelte, aliases, jsconfig, entry, output
---

# Configuration

## config/shipwright.js

All Shipwright configuration lives in `config/shipwright.js`. The exported `shipwright` key merges into `sails.config.shipwright`. The primary purpose of this file is to configure Rsbuild plugins and build options.

### Minimal Configuration

Every Boring Stack project needs exactly one framework plugin:

```js
// React
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()]
  }
}
```

```js
// Vue
const { pluginVue } = require('@rsbuild/plugin-vue')
module.exports.shipwright = {
  build: {
    plugins: [pluginVue()]
  }
}
```

```js
// Svelte
const { pluginSvelte } = require('@rsbuild/plugin-svelte')
module.exports.shipwright = {
  build: {
    plugins: [pluginSvelte()]
  }
}
```

The `build` key maps directly to [Rsbuild configuration](https://rsbuild.dev/config/). Anything you can configure in Rsbuild, you can configure here.

## Framework Plugins

### React Plugin

```bash
npm install --save-dev @rsbuild/plugin-react
```

```js
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()]
  }
}
```

The React plugin:

- Enables JSX transformation (no need to `import React` in every file)
- Supports React Fast Refresh for HMR
- Handles `.jsx` and `.tsx` files

You can pass options to the plugin:

```js
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [
      pluginReact({
        // Use the classic runtime if needed (default is 'automatic')
        swcReactOptions: {
          runtime: 'automatic'
        }
      })
    ]
  }
}
```

Runtime dependencies:

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "@inertiajs/react": "^2.1.2"
  }
}
```

### Vue Plugin

```bash
npm install --save-dev @rsbuild/plugin-vue
```

```js
const { pluginVue } = require('@rsbuild/plugin-vue')
module.exports.shipwright = {
  build: {
    plugins: [pluginVue()]
  }
}
```

The Vue plugin:

- Compiles `.vue` Single File Components (SFC)
- Enables Vue's HMR for instant component updates
- Supports `<script setup>`, `<style scoped>`, and all Vue SFC features

Runtime dependencies:

```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "@inertiajs/vue3": "^2.1.2"
  }
}
```

### Svelte Plugin

```bash
npm install --save-dev @rsbuild/plugin-svelte
```

```js
const { pluginSvelte } = require('@rsbuild/plugin-svelte')
module.exports.shipwright = {
  build: {
    plugins: [pluginSvelte()]
  }
}
```

The Svelte plugin:

- Compiles `.svelte` components
- Supports Svelte 5's runes and the `mount()` API
- Enables Svelte HMR

Runtime dependencies:

```json
{
  "dependencies": {
    "svelte": "^5.0.0",
    "@inertiajs/svelte": "^2.1.2"
  }
}
```

## Entry Points

Shipwright automatically detects `assets/js/app.js` as the JavaScript entry point. This is the file that bootstraps the Inertia application and imports global CSS.

### React Entry Point

```js
// assets/js/app.js
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

### Vue Entry Point

```js
// assets/js/app.js
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
  progress: {
    color: '#6C25C1'
  }
})
```

### Svelte Entry Point

```js
// assets/js/app.js
import { createInertiaApp } from '@inertiajs/svelte'
import { mount } from 'svelte'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  },
  progress: {
    color: '#6C25C1'
  }
})
```

### Page Resolution

The `resolve` function maps Inertia page names to component files:

```js
resolve: (name) => require(`./pages/${name}`)
```

When an action returns `{ page: 'dashboard/index' }`, Rsbuild resolves it to `assets/js/pages/dashboard/index.jsx` (or `.vue`, `.svelte`). Rsbuild uses `require.context` under the hood to bundle all pages found in the `./pages/` directory.

## Path Aliases

Path aliases are configured in `jsconfig.json` at the project root. These aliases work both in the editor (for autocompletion and jump-to-definition) and in Rsbuild builds.

```json
{
  "include": ["api/**/*", "assets/js/**/*"],
  "compilerOptions": {
    "types": ["node"],
    "typeRoots": ["./node_modules/@types"],
    "lib": ["es2016"],
    "outDir": "./irrelevant/unused",
    "allowJs": true,
    "checkJs": false,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmitOnError": true,
    "noErrorTruncation": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["assets/js/*"],
      "~/*": ["assets/*"]
    }
  }
}
```

### Default Aliases

| Alias | Maps To       | Example Usage                        |
| ----- | ------------- | ------------------------------------ |
| `~/*` | `assets/*`    | `import '~/css/app.css'`             |
| `@/*` | `assets/js/*` | `import Layout from '@/layouts/App'` |

### Using Aliases in Code

```js
// Import CSS from assets/css/
import '~/css/app.css'

// Import a layout component from assets/js/layouts/
import AuthLayout from '@/layouts/Auth'

// Import a shared component from assets/js/components/
import Button from '@/components/Button'

// Import a utility from assets/js/lib/
import { formatDate } from '@/lib/utils'
```

### Adding Custom Aliases

To add a new alias, update `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["assets/js/*"],
      "~/*": ["assets/*"],
      "@components/*": ["assets/js/components/*"],
      "@hooks/*": ["assets/js/hooks/*"]
    }
  }
}
```

Shipwright reads `jsconfig.json` (or `tsconfig.json`) automatically, so path aliases are shared between the editor and the build system. No separate Rsbuild alias configuration is needed.

## Extending Rsbuild Configuration

The `build` key in `config/shipwright.js` accepts any valid Rsbuild configuration. This allows you to customize the build beyond framework plugins.

### Adding Multiple Plugins

```js
const { pluginReact } = require('@rsbuild/plugin-react')
const { pluginSass } = require('@rsbuild/plugin-sass')

module.exports.shipwright = {
  build: {
    plugins: [pluginReact(), pluginSass()]
  }
}
```

### Customizing Output

```js
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()],
    output: {
      // Change asset prefix for CDN deployment
      assetPrefix: 'https://cdn.example.com/',
      // Control source maps
      sourceMap: {
        js:
          process.env.NODE_ENV === 'production'
            ? 'source-map'
            : 'cheap-module-source-map',
        css: true
      }
    }
  }
}
```

### Defining Global Constants

```js
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()],
    source: {
      define: {
        'process.env.APP_NAME': JSON.stringify('My App'),
        'process.env.APP_VERSION': JSON.stringify('1.0.0')
      }
    }
  }
}
```

These constants are replaced at build time and can be used in frontend code:

```jsx
function Footer() {
  return (
    <p>
      {process.env.APP_NAME} v{process.env.APP_VERSION}
    </p>
  )
}
```

### Proxy Configuration

In development, you can configure the Rsbuild dev server proxy:

```js
const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
}
```

## Source Maps

Source maps help with debugging by mapping compiled code back to the original source. Rsbuild generates source maps by default in development.

For production, you can control source map behavior:

```js
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()],
    output: {
      sourceMap: {
        // Full source maps for debugging production issues
        js: 'source-map',
        css: true
      }
    }
  }
}
```

Source map options for JavaScript:

- `false` -- No source maps (smallest output)
- `'cheap-module-source-map'` -- Fast, line-level mapping (good for development)
- `'source-map'` -- Full source maps (good for production debugging)
- `'hidden-source-map'` -- Source maps generated but not referenced in bundle (upload to error tracking services)

## Environment-Specific Configuration

Use Sails' configuration precedence to override Shipwright settings per environment:

```js
// config/env/production.js
module.exports = {
  shipwright: {
    build: {
      output: {
        sourceMap: {
          js: false,
          css: false
        }
      }
    }
  }
}
```

Or in `config/local.js` for developer-specific overrides:

```js
// config/local.js (gitignored)
module.exports = {
  shipwright: {
    build: {
      server: {
        port: 3001 // Use a different dev server port
      }
    }
  }
}
```
