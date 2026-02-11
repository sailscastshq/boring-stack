# Testing Skills for Claude Code

Write comprehensive tests for The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/testing
```

## Usage

After installing, Claude will automatically apply testing best practices when you work on test files:

> "Write unit tests for the calculate-password-strength helper"

> "Add an e2e test for the signup flow"

> "Write an integration test that verifies the dashboard returns the right props"

> "Set up GitHub Actions CI for running tests"

## Skills Included

- **getting-started** - Testing philosophy, project structure, npm scripts
- **unit-testing** - Node.js test runner, getSails() pattern, helper testing
- **e2e-testing** - Playwright setup, page testing, traces, CI modes
- **integration-testing** - inertia-sails/test assertion library
- **test-configuration** - Environment config, database strategy, GitHub Actions

## Testing Stack

- **Unit tests**: Node.js built-in test runner (`node:test`) + `node:assert/strict`
- **E2E tests**: [Playwright](https://playwright.dev) for browser automation
- **Integration tests**: [inertia-sails/test](https://docs.sailscasts.com/inertia-sails) for Inertia response assertions

## Links

- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## License

MIT
