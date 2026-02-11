# Inertia.js Skills for Claude Code

Build full-stack Boring Stack apps with Inertia.js just by prompting Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/inertia
```

## Usage

After installing, Claude will automatically apply Inertia.js best practices when you work on Boring Stack projects:

> "Create a settings page that lets users update their profile"

> "Add a form that creates a new team with validation"

> "Set up shared data so the logged-in user is available on every page"

> "When should I use inertiaRedirect instead of redirect?"

## Skills Included

- **getting-started** - How Inertia works, the protocol, client/server setup
- **rendering-pages** - Server-side rendering with `sails.inertia.render()`, page objects
- **actions-and-exits** - Action2 patterns, exit response types, the four action patterns
- **redirects-and-responses** - `redirect` vs `inertiaRedirect` vs `location()`, when to use each
- **shared-data-and-flash** - `share()`, `once()`, `refreshOnce()`, `flushShared()`, `flash()`
- **forms-and-validation** - `useForm`, form submission, validation errors, `badRequest` flow
- **props-system** - `AlwaysProp`, `DeferProp`, `MergeProp`, `OnceProp`, `OptionalProp`, `ScrollProp`
- **client-side-components** - `Link`, `router`, `usePage`, `Head`, layouts, `createInertiaApp`
- **error-handling** - Server errors, the dev error modal, production error handling
- **advanced-features** - History encryption, partial reloads, asset versioning, CSRF, SSR

## What is Inertia.js?

[Inertia.js](https://inertiajs.com) is a protocol that lets you build modern single-page apps using classic server-side routing. In The Boring JavaScript Stack, the `inertia-sails` package connects Sails.js to React, Vue, or Svelte via Inertia.

## Links

- [Inertia.js Documentation](https://inertiajs.com)
- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [inertia-sails Documentation](https://docs.sailscasts.com/inertia-sails)

## License

MIT
