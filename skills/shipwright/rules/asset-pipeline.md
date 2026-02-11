---
name: asset-pipeline
description: Asset pipeline - CSS with Tailwind CSS, JavaScript entry and page resolution, static assets, code splitting, PostCSS configuration
metadata:
  tags: assets, css, tailwind, postcss, javascript, code-splitting, images, fonts, static, pipeline
---

# Asset Pipeline

Shipwright manages all frontend assets through Rsbuild. Assets live in the `assets/` directory and are compiled to `.tmp/public/` for serving.

## CSS with Tailwind CSS

### Tailwind CSS v4

The mellow templates use Tailwind CSS v4 with the new `@import` syntax and CSS-first configuration:

```css
/* assets/css/app.css */
@import 'tailwindcss';

@theme {
  /* Brand Colors */
  --color-brand: #6c25c1;
  --color-brand-50: #ccaeef;
  --color-brand-100: #c19dec;
  --color-brand-200: #ab7be6;
  --color-brand-300: #9659df;
  --color-brand-400: #8036d9;
  --color-brand-500: #6c25c1;
  --color-brand-600: #521c92;
  --color-brand-700: #371363;
  --color-brand-800: #1d0a34;
  --color-brand-900: #030105;
  --color-brand-950: #000000;
}
```

PostCSS config for Tailwind v4:

```js
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

Dependencies for Tailwind v4:

```json
{
  "devDependencies": {
    "tailwindcss": "^4.1.16",
    "@tailwindcss/postcss": "^4.1.16"
  }
}
```

### Tailwind CSS v3

The ascent templates use Tailwind CSS v3 with the classic directive-based approach:

```css
/* assets/css/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

PostCSS config for Tailwind v3:

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {}
  }
}
```

Dependencies for Tailwind v3:

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.18"
  }
}
```

### Customizing the Theme (v4)

Tailwind v4 uses CSS custom properties inside `@theme` to define design tokens:

```css
/* assets/css/app.css */
@import 'tailwindcss';

@theme {
  /* Custom colors */
  --color-brand: #6c25c1;
  --color-brand-500: #6c25c1;
  --color-brand-600: #521c92;

  /* Custom fonts */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Custom spacing */
  --spacing-18: 4.5rem;

  /* Custom breakpoints */
  --breakpoint-3xl: 1920px;
}
```

These tokens generate utility classes automatically. `--color-brand-500` creates `text-brand-500`, `bg-brand-500`, `border-brand-500`, etc.

### Adding Custom CSS

Add custom styles after the Tailwind import:

```css
/* assets/css/app.css */
@import 'tailwindcss';

@theme {
  --color-brand: #6c25c1;
}

/* Custom component styles */
@layer components {
  .btn-primary {
    @apply bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors;
  }

  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
}

/* Custom utility styles */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### Importing Third-Party CSS

Import CSS from `node_modules` in your main CSS file or in the JavaScript entry:

```css
/* In assets/css/app.css */
@import 'primeicons/primeicons.css';
@import 'floating-vue/dist/style.css';
```

Or in the JavaScript entry point:

```js
// In assets/js/app.js
import '~/css/app.css'
import 'primeicons/primeicons.css'
import 'floating-vue/dist/style.css'
```

Both approaches work. Importing in JavaScript is more explicit about which components need which CSS. Importing in the CSS file keeps all style imports together.

## JavaScript Entry Point

### The Entry File

`assets/js/app.js` is the main JavaScript entry point. Shipwright auto-detects this file and uses it as Rsbuild's entry. This file:

1. Imports global CSS (Tailwind and any third-party styles)
2. Creates the Inertia application
3. Configures page resolution
4. Sets up the framework renderer

```js
// assets/js/app.js (React)
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

### Page Resolution

The `resolve` callback maps Inertia page names to component files. When an action returns `{ page: 'dashboard/index' }`, the resolve function loads `assets/js/pages/dashboard/index.jsx`.

```js
// Basic resolution -- bundles ALL pages into the main chunk
resolve: (name) => require(`./pages/${name}`)
```

This uses Rsbuild's `require.context` internally to discover and bundle all page components at build time.

### Page Directory Structure

```
assets/js/pages/
├── Home.jsx                    # page: 'Home'
├── auth/
│   ├── Login.jsx               # page: 'auth/Login'
│   └── Signup.jsx              # page: 'auth/Signup'
├── dashboard/
│   └── Index.jsx               # page: 'dashboard/Index'
└── settings/
    ├── Profile.jsx             # page: 'settings/Profile'
    └── Security.jsx            # page: 'settings/Security'
```

### Using Layouts

With the Inertia plugin, layouts are set per-page and persist across navigation:

```jsx
// assets/js/pages/dashboard/Index.jsx
import AppLayout from '@/layouts/App'

export default function DashboardIndex({ stats }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard</p>
    </div>
  )
}

DashboardIndex.layout = (page) => <AppLayout>{page}</AppLayout>
```

```
assets/js/layouts/
├── App.jsx                     # Main app layout (sidebar, header)
├── Auth.jsx                    # Auth pages layout (centered card)
└── Settings.jsx                # Settings pages layout (tabs, sidebar)
```

### Registering Global Plugins (Vue)

For Vue, you can register plugins in the entry point's `setup` function:

```js
// assets/js/app.js (Vue with plugins)
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })
    app.use(plugin)
    app.use(PrimeVue, { unstyled: true })
    app.use(ToastService)
    app.mount(el)
  },
  progress: {
    color: '#6C25C1'
  }
})
```

### Wrapping with Providers (React)

For React, wrap the `<App>` with context providers:

```js
// assets/js/app.js (React with providers)
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import Tailwind from 'primereact/passthrough/tailwind'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    createRoot(el).render(
      <PrimeReactProvider
        value={{
          unstyled: true,
          pt: Tailwind,
          ptOptions: { mergeProps: true, mergeSections: true }
        }}
      >
        <App {...props} />
      </PrimeReactProvider>
    )
  },
  progress: {
    color: '#0EA5E9'
  }
})
```

## Static Assets

### Images

Place images in `assets/images/` and import them in components:

```jsx
// Direct import -- returns the URL to the image
import logo from '~/images/logo.png'

function Header() {
  return <img src={logo} alt="Logo" />
}
```

Or reference them in CSS:

```css
.hero {
  background-image: url('~/images/hero-bg.jpg');
}
```

### Fonts

Place fonts in `assets/fonts/` and reference them in CSS:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('~/fonts/CustomFont-Regular.woff2') format('woff2'), url('~/fonts/CustomFont-Regular.woff')
      format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Public Files

Files that should be served as-is (without processing) can be placed in the `assets/` directory. Rsbuild copies static assets that are imported or referenced in code to the output directory with content hashing for cache busting.

## Code Splitting

### Automatic Code Splitting

Rsbuild automatically splits vendor code into separate chunks. Third-party libraries from `node_modules` are bundled into a `vendor` chunk, which changes less frequently and caches well in browsers.

### Dynamic Imports

Use dynamic `import()` for route-level code splitting. This splits each page into its own chunk that loads on demand:

```js
// assets/js/app.js
createInertiaApp({
  resolve: (name) => {
    // Dynamic import creates separate chunks per page
    return import(`./pages/${name}`)
  }
  // ...
})
```

With dynamic imports, each page component becomes its own chunk. When a user navigates to `/dashboard`, only the dashboard chunk is loaded. The trade-off is a small loading delay on navigation instead of a larger initial bundle.

**Note**: The default Boring Stack templates use `require()` (synchronous) for page resolution. This bundles all pages into the main chunk for simpler builds. Switch to `import()` only if your app has many pages and you want to reduce the initial bundle size.

### Manual Code Splitting

Split large features into separate chunks with dynamic imports:

```jsx
import { lazy, Suspense } from 'react'

// This component will be in its own chunk
const HeavyChart = lazy(() => import('@/components/HeavyChart'))

function Dashboard({ data }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  )
}
```

## PostCSS Configuration

PostCSS is configured via `postcss.config.js` at the project root. Rsbuild automatically detects and uses this file.

### Tailwind v4 Configuration

```js
// postcss.config.js (mellow templates)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

### Tailwind v3 Configuration

```js
// postcss.config.js (ascent templates)
module.exports = {
  plugins: {
    tailwindcss: {}
  }
}
```

### Adding PostCSS Plugins

```js
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': true
      }
    },
    autoprefixer: {}
  }
}
```

**Note**: Tailwind CSS v4 includes autoprefixer functionality, so adding it separately is typically unnecessary with Tailwind v4.

## Build Output

### Output Directory

Shipwright outputs all compiled assets to `.tmp/public/`:

```
.tmp/public/
├── static/
│   ├── js/
│   │   ├── index.[hash].js          # Main bundle
│   │   ├── vendor.[hash].js         # Third-party libs
│   │   └── async/
│   │       ├── page-Home.[hash].js  # Code-split pages (if using import())
│   │       └── page-Login.[hash].js
│   └── css/
│       └── index.[hash].css          # Compiled CSS (Tailwind + custom)
└── manifest.json                      # Asset manifest for versioning
```

### Manifest File

The `manifest.json` maps source filenames to their hashed output filenames:

```json
{
  "allFiles": {
    "index.js": "/static/js/index.a1b2c3d4.js",
    "index.css": "/static/css/index.e5f6g7h8.css"
  },
  "entries": {
    "index": {
      "js": ["/static/js/index.a1b2c3d4.js"],
      "css": ["/static/css/index.e5f6g7h8.css"]
    }
  }
}
```

The `inertia-sails` hook hashes this manifest to generate an asset version. When the manifest changes (because assets changed), Inertia detects the version mismatch and triggers a full page reload.

### Cleaning the Build Output

The `.tmp/` directory can be safely deleted to force a fresh build:

```bash
rm -rf .tmp
npm run dev
```

This is useful when you encounter stale build artifacts or caching issues.
