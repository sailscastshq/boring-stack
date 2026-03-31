# Testing Skills for Claude Code

Write Sounding-powered tests for The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/testing
```

## Usage

After installing, Claude will automatically apply Sounding-first testing guidance when you work on test files:

> "Write a Sounding trial for the signupWithTeam helper"

> "Add a request-level trial for guest protection on the dashboard"

> "Write an Inertia trial that verifies the pricing page props"

> "Add a browser-capable Sounding trial for the magic-link login flow"

> "Set up config/sounding.js and a clean test environment"

## Skills Included

- **getting-started** - Sounding philosophy, suite structure, scripts, migration approach
- **unit-testing** - helper trials, worlds, factories, scenarios, business logic
- **integration-testing** - JSON endpoint and Inertia testing with `get()`, `post()`, and `visit()`
- **e2e-testing** - browser-capable trials with `page`, `login`, and Playwright-backed assertions
- **test-configuration** - Sounding config, test env config, datastores, mail capture, CI

## Testing Stack

- **Primary framework**: [Sounding](https://docs.sailscasts.com/sounding)
- **Runner underneath**: Node.js built-in test runner (`node:test`)
- **Browser engine**: Playwright, surfaced through Sounding browser-capable trials
- **Mail capture**: Sounding mailbox through the real Sails mail path

## Links

- [Sounding Documentation](https://docs.sailscasts.com/sounding)
- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## License

MIT
