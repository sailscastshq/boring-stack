# Beautiful UI Skills for Claude Code

Write meaningful, accessible, responsive markup in The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/beautiful-ui
```

## Usage

After installing, Claude will automatically apply beautiful UI best practices when you build page layouts, forms, and component markup:

> "Build a settings page with a sidebar navigation"

> "Create a pricing page with feature comparison"

> "Add a blog post layout with author info and related articles"

> "Build a responsive dashboard with stats cards and a data table"

> "Add a signup form with validation"

## Skills Included

- **semantic-html** - Element selection guide: when to use which HTML element and why
- **accessibility** - ARIA roles, live regions, skip links, focus management, keyboard navigation, contrast, reduced motion
- **responsive-patterns** - Mobile-first breakpoints, container queries, responsive grids, navigation, tables, touch targets, viewport units
- **typography** - Type scale, font stacks, line height, line length, letter spacing, font weight hierarchy, text color, prose, truncation, tabular numbers
- **form-ux** - Form layout, labels, validation timing, error presentation, submit buttons, optional fields, destructive actions

## What is Beautiful UI?

Beautiful UI means building interfaces that are meaningful, accessible, and structurally correct. A `<nav>` tells screen readers "this is navigation." An `<article>` tells Reader Mode "this is the main content." A top-aligned label is completed fastest. A `tabular-nums` class aligns your pricing table. A `min-h-svh` replaces `h-screen` so mobile users don't have content hidden behind the address bar.

The goal is to eliminate div soup, fix accessibility gaps, make layouts responsive by default, establish typographic hierarchy, and build forms that are fast to complete and forgiving of mistakes. These patterns draw from Refactoring UI, Nielsen Norman Group, WCAG, and MDN best practices.

## Links

- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [MDN HTML Elements Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT
