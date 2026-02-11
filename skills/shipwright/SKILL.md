---
name: shipwright
description: >
  Shipwright build system for The Boring JavaScript Stack — Rsbuild-based asset pipeline replacing Grunt,
  with framework plugins for React/Vue/Svelte, Tailwind CSS, SSR support, and dev server with HMR.
  Use this skill when configuring builds, managing assets, or debugging the development server.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: shipwright, rsbuild, build, vite, assets, tailwind, ssr, hmr, boring-stack
---

# Shipwright

Shipwright (`sails-hook-shipwright`) is the modern build system for The Boring JavaScript Stack. Built on [Rsbuild](https://rsbuild.dev), it replaces the legacy Grunt pipeline with a fast, zero-config asset pipeline that supports React, Vue, and Svelte through framework plugins.

## When to Use

Use this skill when:

- Configuring `config/shipwright.js` (framework plugins, build options)
- Understanding the asset pipeline (CSS, JavaScript entry points, static assets)
- Setting up Tailwind CSS with PostCSS
- Configuring server-side rendering (SSR) with `config/inertia.js`
- Debugging the dev server, HMR, or build issues
- Understanding the `views/app.ejs` template and `shipwright.styles()`/`shipwright.scripts()` helpers
- Managing path aliases (`~/` for `assets/js/`)
- Working with code splitting and third-party CSS imports

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - What Shipwright is, dev/build commands, project structure
- [rules/configuration.md](rules/configuration.md) - config/shipwright.js, framework plugins, entry points, path aliases
- [rules/asset-pipeline.md](rules/asset-pipeline.md) - CSS with Tailwind, JavaScript entry, static assets, code splitting
- [rules/ssr.md](rules/ssr.md) - Server-side rendering setup, SSR entry point, framework differences
- [rules/development.md](rules/development.md) - Dev server, HMR, Node --watch-path, common issues, debugging
