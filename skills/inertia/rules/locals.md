---
name: locals
description: Locals — passing data to the root EJS template for SEO meta tags, Open Graph images, page titles, and other HTML head content
metadata:
  tags: locals, viewData, meta-tags, seo, og-image, open-graph, title, head, ejs, root-template
---

# Locals

Locals are variables passed to the root EJS template (`views/app.ejs`) during the initial full-page load. They let you set dynamic `<title>`, `<meta>`, Open Graph tags, and any other HTML that belongs in the server-rendered shell -- without polluting your component props.

## Why Locals Matter

Inertia apps are SPAs, but the **first** page load is a full server-rendered HTML response. Search engines, social media crawlers, and link previews all read this initial HTML. If your `<head>` has hardcoded defaults, every page looks the same to Google and Twitter.

Locals solve this. Each action can set page-specific meta tags that crawlers see on the initial load, while your React/Vue/Svelte components receive their data through props as usual.

## Locals vs Props

|                   | Locals                                        | Props                                |
| ----------------- | --------------------------------------------- | ------------------------------------ |
| **Go to**         | Root EJS template (`views/app.ejs`)           | Page components (React/Vue/Svelte)   |
| **When**          | First visit only (full HTML response)         | Every visit (initial + XHR)          |
| **Use for**       | `<title>`, `<meta>`, OG tags, structured data | UI data, user interactions           |
| **Accessible in** | EJS with `<%= variableName %>`                | `usePage().props` or component props |

On subsequent Inertia navigations (XHR), the server returns only the page JSON -- no HTML is rendered, so locals have no effect. This is exactly what you want: meta tags only matter on the initial server response.

## Setting Locals

### From Actions

Return a `locals` object alongside `page` and `props`:

```js
// api/controllers/course/view-course.js
module.exports = {
  inputs: {
    slug: { type: 'string', required: true }
  },
  exits: {
    success: { responseType: 'inertia' },
    notFound: { responseType: 'notFound' }
  },
  fn: async function ({ slug }) {
    const course = await Course.findOne({ slug })
    if (!course) throw 'notFound'

    return {
      page: `courses/${slug}`,
      props: { course },
      locals: {
        title: course.title,
        description: course.description,
        ogImage: course.thumbnailUrl
      }
    }
  }
}
```

### From Hooks and Middleware

Use `sails.inertia.local()` for request-scoped locals:

```js
// api/hooks/custom/index.js
module.exports = function defineCustomHook(sails) {
  return {
    routes: {
      before: {
        'GET /*': {
          skipAssets: true,
          fn: async function (req, res, next) {
            // Set a default title for all pages
            sails.inertia.local('title', 'My App')
            return next()
          }
        }
      }
    }
  }
}
```

### Globally (App-Wide Defaults)

Use `sails.inertia.localGlobally()` for defaults that apply to every request. Typically called during hook initialization:

```js
// In a hook's initialize()
sails.inertia.localGlobally('title', 'Sailscasts')
sails.inertia.localGlobally(
  'description',
  'Screencasts for the calm JavaScript developer.'
)
sails.inertia.localGlobally('ogImage', 'https://sailscasts.com/images/meta.png')
```

Global locals are the base layer. Request-scoped locals (from `local()`) override them, and action-level locals (from `return { locals }`) override both.

## Reading Locals

Use `sails.inertia.getLocals()` to read the merged result (global + request-scoped):

```js
// Get all locals
const allLocals = sails.inertia.getLocals()

// Get a specific local
const title = sails.inertia.getLocals('title')
```

## Using Locals in EJS

Access your locals through EJS's built-in `locals` object. This is safe even when a local wasn't set -- `locals.title` returns `undefined` instead of throwing a ReferenceError:

```html
<!-- views/app.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= locals.title || 'My App' %></title>
    <meta name="description" content="<%= locals.description || '' %>" />
    <meta property="og:title" content="<%= locals.title || 'My App' %>" />
    <meta property="og:description" content="<%= locals.description || '' %>" />
    <meta
      property="og:image"
      content="<%= locals.ogImage || '/images/default-og.png' %>"
    />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <%- shipwright.styles() %>
  </head>
  <body>
    <div id="app" data-page="<%= JSON.stringify(page) %>"></div>
    <%- shipwright.scripts() %>
  </body>
</html>
```

**Why `locals.title` instead of bare `title`?** In EJS, referencing an undeclared variable (`<%= title %>`) throws a ReferenceError. But `locals` is a built-in EJS object that always exists -- accessing a missing property on it returns `undefined`, which `||` handles cleanly. No `typeof` guards needed.

## Precedence

Locals merge in this order (last wins):

1. **Global locals** -- `sails.inertia.localGlobally('title', 'My App')` (set once, applies everywhere)
2. **Request-scoped locals** -- `sails.inertia.local('title', 'Dashboard')` (set in hooks/middleware)
3. **Action locals** -- `return { locals: { title: 'Course: Intro to Sails' } }` (set in the action)

This means an action's locals always win, which is exactly what you want -- a course page should show its own title, not the global default.

## Real-World Examples

### Dynamic SEO for Content Pages

A course platform where every course and lesson page has unique meta tags for search engines and social sharing:

```js
// api/controllers/course/view-lesson.js
module.exports = {
  inputs: {
    courseSlug: { type: 'string', required: true },
    lessonSlug: { type: 'string', required: true }
  },
  exits: {
    success: { responseType: 'inertia' },
    notFound: { responseType: 'notFound' }
  },
  fn: async function ({ courseSlug, lessonSlug }) {
    const lesson = await Lesson.findOne({ slug: lessonSlug }).populate('course')
    if (!lesson) throw 'notFound'

    return {
      page: 'courses/lesson',
      props: { lesson },
      locals: {
        title: `${lesson.title} — ${lesson.course.title}`,
        description: `${lesson.title} — ${lesson.course.title}`,
        ogImage: lesson.course.thumbnailUrl
      }
    }
  }
}
```

When someone shares a lesson link on Twitter or Slack, the preview card shows the lesson title, course name, and course thumbnail -- not a generic "My App" card.

### Blog Posts with Structured Data

```js
// api/controllers/blog/view-post.js
fn: async function ({ slug }) {
  const post = await BlogPost.findOne({ slug }).populate('author')
  if (!post) throw 'notFound'

  return {
    page: 'blog/show',
    props: { post },
    locals: {
      title: `${post.title} | My Blog`,
      description: post.excerpt,
      ogImage: post.coverImageUrl,
      jsonLd: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.coverImageUrl,
        author: { '@type': 'Person', name: post.author.fullName },
        datePublished: post.publishedAt
      })
    }
  }
}
```

```html
<!-- views/app.ejs -->
<head>
  <!-- ... other meta tags ... -->
  <% if (locals.jsonLd) { %>
  <script type="application/ld+json">
    <%- locals.jsonLd %>
  </script>
  <% } %> <%- shipwright.styles() %>
</head>
```

### E-Commerce Product Pages

```js
// api/controllers/product/view-product.js
fn: async function ({ slug }) {
  const product = await Product.findOne({ slug })
  if (!product) throw 'notFound'

  return {
    page: 'products/show',
    props: { product },
    locals: {
      title: `${product.name} — $${product.price} | My Store`,
      description: product.shortDescription,
      ogImage: product.images[0]?.url
    }
  }
}
```

### Per-Page Canonical URLs

```js
// In a hook
sails.inertia.local('canonicalUrl', `https://myapp.com${req.path}`)
```

```html
<link
  rel="canonical"
  href="<%= locals.canonicalUrl || 'https://myapp.com' %>"
/>
```

### Custom Fonts or Scripts Per Page

```js
// An action that needs a code editor
return {
  page: 'editor/index',
  props: { document },
  locals: {
    extraHead:
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono">'
  }
}
```

```html
<head>
  <!-- ... -->
  <%- locals.extraHead || '' %> <%- shipwright.styles() %>
</head>
```

## API Reference

| Method                                    | Scope   | Description                                 |
| ----------------------------------------- | ------- | ------------------------------------------- |
| `return { locals: { ... } }`              | Action  | Set locals from the action return value     |
| `sails.inertia.local(key, value)`         | Request | Set a local for the current request         |
| `sails.inertia.localGlobally(key, value)` | Global  | Set a local for all requests                |
| `sails.inertia.getLocals(key?)`           | Merged  | Get merged locals (global + request-scoped) |

## Common Patterns

### Default Title with Page-Specific Override

```js
// Hook: set default
sails.inertia.localGlobally('title', 'My App')

// Action: override for this page
return {
  page: 'settings/profile',
  props: { user },
  locals: { title: 'Profile Settings | My App' }
}
```

### Conditional Locals

```js
fn: async function () {
  const locals = { title: 'Pricing | My App' }

  // Only set OG image if we have a custom one
  if (sails.config.custom.pricingOgImage) {
    locals.ogImage = sails.config.custom.pricingOgImage
  }

  return { page: 'pricing', locals }
}
```
