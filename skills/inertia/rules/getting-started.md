---
name: getting-started
description: How Inertia.js works, the protocol, client-side and server-side setup in The Boring JavaScript Stack
metadata:
  tags: inertia, protocol, setup, boring-stack, sails, hooks
---

# Getting Started with Inertia.js

## What is Inertia.js?

Inertia.js is a protocol that lets you build modern single-page applications (SPAs) using server-side routing and controllers. Instead of building a separate API and managing client-side state, you render React/Vue/Svelte components directly from your Sails.js actions -- just like traditional server-rendered apps, but with the smooth feel of a SPA.

## The Inertia Protocol

On the **first page visit**, the server returns a full HTML document with the initial page data serialized in a `data-page` attribute. After that, all navigation happens via **XHR requests** with the `X-Inertia` header. The server responds with just a JSON "page object" containing the component name and props. The client swaps out the component without a full page reload.

Key request/response headers:

- `X-Inertia: true` -- Sent on all subsequent requests to indicate an Inertia visit
- `X-Inertia-Version` -- Asset version for cache busting
- `X-Inertia-Location` -- Used in 409 responses to force full page visits
- `X-Inertia-Partial-Data` -- For partial reloads (only fetch specific props)
- `X-Inertia-Partial-Except` -- Exclude specific props from reload

## Server-Side Setup (inertia-sails)

The `inertia-sails` package is a Sails hook that implements the Inertia protocol. It's installed as a dependency and registers as the `inertia` hook.

### Configuration

Create `config/inertia.js` in your Sails app:

```js
// config/inertia.js
module.exports.inertia = {}
```

The hook uses `sails.config.inertia` for configuration options.

### Custom Responses

The Boring Stack templates include these custom response files:

```js
// api/responses/inertia.js -- Renders an Inertia page
module.exports = function inertia(data) {
  return this.req._sails.inertia.render(this.req, this.res, data)
}
```

```js
// api/responses/inertiaRedirect.js -- Forces a full page visit
module.exports = function inertiaRedirect(url) {
  return this.req._sails.inertia.location(this.req, this.res, url)
}
```

```js
// api/responses/badRequest.js -- Handles validation errors for Inertia
module.exports = function badRequest(data) {
  return this.req._sails.inertia.handleBadRequest(this.req, this.res, data)
}
```

```js
// api/responses/serverError.js -- Handles 500 errors with dev modal
module.exports = function serverError(data) {
  return this.req._sails.inertia.handleServerError(this.req, this.res, data)
}
```

### The Root View Template

The initial HTML page is rendered from an EJS template at `views/app.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <%- shipwright.styles() %>
  </head>
  <body>
    <div id="app" data-page="<%= JSON.stringify(page) %>"></div>
    <%- shipwright.scripts() %>
  </body>
</html>
```

The `page` variable contains the serialized Inertia page object with the component name, URL, version, and props.

## Client-Side Setup

### React

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
    color: '#0EA5E9'
  }
})
```

### Vue

```js
// assets/js/app.js
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })
    app.use(plugin)
    app.mount(el)
  },
  progress: {
    color: '#0EA5E9'
  }
})
```

### Svelte

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

### The `resolve` Function

The `resolve` function maps a component name (e.g., `'auth/login'`) to the actual file (`./pages/auth/login.jsx`). This is what connects server-side `{ page: 'auth/login' }` to the right frontend component.

### Progress Indicator

The `progress` option configures the loading bar shown during Inertia visits. Set `color` to match your brand. Additional options:

```js
progress: {
  delay: 250,        // ms before showing the bar
  color: '#0EA5E9',  // bar color
  includeCSS: true,  // inject default CSS
  showSpinner: false  // show a spinner icon
}
```

## AsyncLocalStorage Context

The `inertia-sails` hook uses Node.js `AsyncLocalStorage` to maintain per-request state. This prevents data leaks between concurrent requests when using `share()`, `flash()`, `setRootView()`, etc. The context is set up automatically in `routes.before` for all HTTP methods.

## File Structure Convention

```
api/
  controllers/
    home/
      view-home.js          # GET / -- renders 'index' page
    auth/
      view-login.js          # GET /login -- renders 'auth/login' page
      login.js               # POST /login -- handles form, redirects
  responses/
    inertia.js               # Custom response: render Inertia page
    inertiaRedirect.js       # Custom response: force full page visit
    badRequest.js            # Custom response: validation errors
    serverError.js           # Custom response: 500 with dev modal
assets/
  js/
    app.js                   # createInertiaApp bootstrap
    pages/
      index.jsx              # Home page component
      auth/
        login.jsx            # Login page component
    layouts/
      AppLayout.jsx          # Persistent layout wrapper
views/
  app.ejs                    # Root HTML template
config/
  inertia.js                 # Inertia configuration
  routes.js                  # Route definitions
```
