# Shipwright Skills for Claude Code

Configure and optimize the Shipwright build system in The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/shipwright
```

## Usage

After installing, Claude will automatically apply Shipwright best practices when you work on build configuration:

> "Set up Tailwind CSS in my Sails project"

> "Configure SSR for my React Inertia app"

> "Add a path alias for my components directory"

> "Debug why HMR isn't working"

## Skills Included

- **getting-started** - What Shipwright is, dev/build commands, project structure
- **configuration** - config/shipwright.js, framework plugins, entry points, aliases
- **asset-pipeline** - CSS with Tailwind, JavaScript, static assets, code splitting
- **ssr** - Server-side rendering setup and configuration
- **development** - Dev server, HMR, Node --watch-path, debugging

## What is Shipwright?

[sails-hook-shipwright](https://github.com/sailscastshq/sails-hook-shipwright) is a Sails.js hook that replaces the legacy Grunt asset pipeline with a modern [Rsbuild](https://rsbuild.dev)-based build system. It provides fast builds, HMR in development, and framework plugins for React, Vue, and Svelte.

## Links

- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [Rsbuild Documentation](https://rsbuild.dev)
- [Tailwind CSS](https://tailwindcss.com)

## License

MIT
