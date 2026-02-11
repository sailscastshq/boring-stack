---
name: ssr
description: Server-side rendering (SSR) for Inertia.js apps - SSR entry point, config/inertia.js setup, framework-specific differences, when to use SSR
metadata:
  tags: ssr, server-side-rendering, seo, performance, react, vue, svelte, inertia
---

# Server-Side Rendering (SSR)

## What SSR Means for Inertia Apps

In a standard Boring Stack app, the server sends a minimal HTML shell (`views/app.ejs`) with a `<div id="app">` and a JSON payload of the page data. The browser then boots the JavaScript framework, reads the JSON from `data-page`, and renders the page client-side.

With SSR enabled, the server pre-renders the page component to HTML **before** sending it to the browser. The browser receives a fully-rendered HTML page, which is then "hydrated" by the client-side JavaScript to make it interactive. This provides:

- **Faster first paint** -- Users see content immediately instead of a blank page
- **SEO** -- Search engines can index the fully-rendered HTML
- **Social sharing** -- Open Graph crawlers see the actual page content

The Inertia SSR protocol works alongside Shipwright's build system. Shipwright builds the SSR bundle, and `inertia-sails` executes it on the server during each request.

## SSR Entry Point

Each framework needs a separate SSR entry point at `assets/js/ssr.js`. This file exports a `render` function that takes the Inertia page object and returns HTML.

### React SSR Entry

```js
// assets/js/ssr.js
import { createInertiaApp } from '@inertiajs/react'
import ReactDOMServer from 'react-dom/server'

export default function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => require(`./pages/${name}`),
    setup: ({ App, props }) => <App {...props} />
  })
}
```

Key differences from the client entry (`app.js`):

- Uses `ReactDOMServer.renderToString` instead of `createRoot().render()`
- No DOM mounting -- returns HTML string instead
- No CSS import (CSS is handled by the client bundle)
- No progress bar configuration
- The `setup` function returns the component tree instead of mounting it

### Vue SSR Entry

```js
// assets/js/ssr.js
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createInertiaApp } from '@inertiajs/vue3'

export default function render(page) {
  return createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => require(`./pages/${name}`),
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin)
    }
  })
}
```

Key differences from the client entry:

- Uses `createSSRApp` instead of `createApp`
- Uses `renderToString` from `vue/server-renderer`
- Returns the app instance instead of calling `.mount()`
- Register only SSR-compatible plugins (avoid DOM-dependent plugins like toast services)

### Svelte SSR Entry

```js
// assets/js/ssr.js
import { createInertiaApp } from '@inertiajs/svelte'
import { render } from 'svelte/server'

export default function ssrRender(page) {
  return createInertiaApp({
    page,
    resolve: (name) => require(`./pages/${name}`),
    setup({ App, props }) {
      return render(App, { props })
    }
  })
}
```

Key differences from the client entry:

- Uses `render` from `svelte/server` instead of `mount` from `svelte`
- Returns the rendered result instead of mounting to a DOM element

## Server Configuration

SSR is configured in `config/inertia.js`:

```js
// config/inertia.js
module.exports.inertia = {
  ssr: {
    enabled: true,
    bundle: 'assets/js/ssr.js'
  }
}
```

| Option        | Type      | Default              | Description                             |
| ------------- | --------- | -------------------- | --------------------------------------- |
| `ssr.enabled` | `boolean` | `false`              | Whether to enable server-side rendering |
| `ssr.bundle`  | `string`  | `'assets/js/ssr.js'` | Path to the SSR entry point             |

By default, SSR is **not enabled** in Boring Stack templates. The `config/inertia.js` ships as an empty object:

```js
// Default config/inertia.js (SSR disabled)
module.exports.inertia = {}
```

## Enabling SSR

### Step 1: Create the SSR Entry

Create `assets/js/ssr.js` with the appropriate framework render function (see examples above).

### Step 2: Configure Inertia

Enable SSR in `config/inertia.js`:

```js
// config/inertia.js
module.exports.inertia = {
  ssr: {
    enabled: true,
    bundle: 'assets/js/ssr.js'
  }
}
```

### Step 3: Install SSR Dependencies

For React:

```bash
npm install react-dom
# react-dom is already included in Boring Stack templates
```

For Vue:

```bash
# vue/server-renderer is included with the vue package
npm install vue
```

For Svelte:

```bash
# svelte/server is included with the svelte package
npm install svelte
```

### Step 4: Restart the Dev Server

```bash
npm run dev
```

Shipwright will detect the SSR configuration and build the SSR bundle alongside the client bundle.

## When to Use SSR

### Use SSR When

- **SEO is critical** -- Public-facing pages that need search engine indexing (marketing pages, blog posts, product listings)
- **Social sharing matters** -- Pages that are shared on social media and need proper Open Graph rendering
- **First paint performance** -- Pages where users need to see content as fast as possible (landing pages)

### Skip SSR When

- **Authenticated pages** -- Dashboard, settings, admin panels -- search engines do not index these, and users expect a brief loading state
- **Real-time features** -- Pages with WebSocket connections, live updates, or heavy client-side state
- **Simple apps** -- Internal tools, prototypes, MVPs -- SSR adds complexity without proportional benefit
- **Development speed** -- SSR introduces an additional build target and potential debugging complexity

### Performance Trade-Off

SSR adds server-side CPU cost for each request. Every page render requires executing the component tree on the server. For high-traffic applications, consider:

- Caching SSR output for public pages
- Using SSR only for specific routes (not app-wide)
- Monitoring server CPU usage after enabling SSR

## SSR Limitations and Caveats

### No Browser APIs on the Server

Code that runs during SSR does not have access to browser APIs (`window`, `document`, `localStorage`, `navigator`). Guard browser-only code:

```jsx
// React
import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // This only runs in the browser, not during SSR
    const saved = localStorage.getItem('theme')
    if (saved) setTheme(saved)
  }, [])

  return (
    <button onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
      {theme}
    </button>
  )
}
```

```vue
<!-- Vue -->
<script setup>
import { onMounted, ref } from 'vue'

const theme = ref('light')

onMounted(() => {
  // onMounted only runs in the browser
  const saved = localStorage.getItem('theme')
  if (saved) theme.value = saved
})
</script>
```

### Third-Party Libraries

Some libraries assume a browser environment. When using SSR, check that imported libraries are SSR-compatible. If a library is not SSR-safe, conditionally import it:

```jsx
import { lazy, Suspense } from 'react'

// Only load in the browser
const MapComponent =
  typeof window !== 'undefined'
    ? lazy(() => import('@/components/Map'))
    : () => null

function LocationPage({ coordinates }) {
  return (
    <div>
      <h1>Location</h1>
      <Suspense fallback={<div>Loading map...</div>}>
        <MapComponent coordinates={coordinates} />
      </Suspense>
    </div>
  )
}
```

### Hydration Mismatches

The server-rendered HTML must match the client-rendered output exactly. Differences cause hydration warnings or errors. Common causes:

- Using `Date.now()` or `Math.random()` in render (different values on server vs client)
- Conditional rendering based on `window.innerWidth` (not available on server)
- Browser extensions that modify the DOM

### SSR and Shared Data

Shared data set via `sails.inertia.share()` in hooks and policies works normally with SSR. The shared props are included in the page object that gets passed to the SSR render function.

## Running SSR in Production

In production, the SSR bundle is built alongside the client bundle during `npm start`. No additional commands or processes are needed.

```bash
# Production start (builds both client and SSR bundles, then serves)
NODE_ENV=production node app.js
```

The SSR render function runs in the same Node.js process as Sails. There is no separate SSR server to manage.

### Production Checklist

1. Ensure `config/inertia.js` has `ssr.enabled: true`
2. Ensure `assets/js/ssr.js` exists and exports a `render` function
3. Test SSR locally with `NODE_ENV=production node app.js` before deploying
4. Monitor server memory and CPU -- SSR increases resource usage per request
5. Verify no hydration mismatch warnings in the browser console
