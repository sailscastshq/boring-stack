---
name: getting-started
description: Testing philosophy, project structure, npm scripts, prerequisites, and the layered testing strategy for The Boring JavaScript Stack
metadata:
  tags: getting-started, philosophy, structure, scripts, prerequisites, testing-strategy
---

# Getting Started with Testing

## Testing Philosophy

The Boring JavaScript Stack follows a **layered testing strategy** where each layer targets a specific concern:

| Layer           | Tool                               | What it tests                                      | Speed                              |
| --------------- | ---------------------------------- | -------------------------------------------------- | ---------------------------------- |
| **Unit**        | `node:test` + `node:assert/strict` | Helpers, utilities, pure business logic            | Fast (no browser, minimal Sails)   |
| **Integration** | `inertia-sails/test`               | Action responses, props, redirects, flash messages | Medium (HTTP-level, no browser)    |
| **E2E**         | Playwright                         | Full user flows in a real browser                  | Slower (real browser, real server) |

The guiding principle: **helpers get unit tests, pages get e2e tests, actions get integration tests**.

### Why This Split?

- **Helpers** are pure functions with defined inputs and exits. They load without HTTP, views, or sockets -- making them ideal for fast, isolated unit tests.
- **Actions** return Inertia responses (component name, props, redirects). Integration tests verify the response shape without rendering in a browser.
- **Pages** are what users see. E2E tests drive a real browser to verify that navigation, forms, and interactions work end-to-end.

### No External Test Framework

The unit testing layer uses Node.js built-in modules (`node:test` and `node:assert/strict`) -- no Mocha, Jest, or Vitest. This means zero test framework dependencies for unit tests. Playwright is the only additional testing dependency, and it covers the e2e layer.

## Project Structure

Tests live in the `tests/` directory at the project root:

```
my-app/
├── tests/
│   ├── unit/                    # Unit tests (node:test)
│   │   └── helpers/             # Mirror api/helpers/ structure
│   │       ├── capitalize.test.js
│   │       ├── format-currency.test.js
│   │       └── validate-email.test.js
│   ├── e2e/                     # End-to-end tests (Playwright)
│   │   └── pages/               # Mirror page/route structure
│   │       ├── home.test.js
│   │       ├── login.test.js
│   │       └── dashboard.test.js
│   └── util/                    # Shared test utilities
│       └── get-sails.js         # Sails singleton for unit tests
├── playwright.config.js         # Playwright configuration
├── config/
│   └── env/
│       └── test.js              # Test environment config
└── package.json                 # Test scripts
```

### Naming Conventions

- **Unit tests**: `tests/unit/helpers/<helper-name>.test.js` -- mirrors the helper file name
- **E2E tests**: `tests/e2e/pages/<page-name>.test.js` -- mirrors the page or feature being tested
- **Test utilities**: `tests/util/<utility-name>.js` -- shared helpers used across test files
- **File extension**: Always `.test.js` (this is the pattern the test runner globs for)

### Mirroring Source Structure

Unit tests mirror the `api/helpers/` directory. If you have `api/helpers/format-currency.js`, its test goes in `tests/unit/helpers/format-currency.test.js`. E2E tests mirror the page structure -- if you have a `/dashboard` page, write `tests/e2e/pages/dashboard.test.js`.

## NPM Scripts

The `package.json` includes these test scripts:

```json
{
  "scripts": {
    "test:unit": "node --test --test-concurrency=1 tests/unit/**/*.test.js",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test": "npm run test:unit && npm run test:e2e"
  }
}
```

### Script Breakdown

**`npm run test:unit`** -- Runs all unit tests:

- `node --test` activates the built-in test runner
- `--test-concurrency=1` runs test files sequentially (required because all tests share one Sails instance)
- `tests/unit/**/*.test.js` globs all test files recursively under `tests/unit/`

**`npm run test:e2e`** -- Runs all Playwright tests in headless mode (no browser window). This is what CI uses.

**`npm run test:e2e:ui`** -- Opens Playwright's interactive UI mode. This provides a visual test explorer with time-travel debugging, DOM snapshots, and the ability to run individual tests. Best for local development and debugging.

**`npm run test:e2e:headed`** -- Runs Playwright tests with a visible browser window. Useful for watching tests execute step-by-step.

**`npm test`** -- Runs the full test suite: unit tests first, then e2e tests. If unit tests fail, e2e tests are skipped (fail-fast with `&&`).

### Running Specific Tests

```bash
# Run a single unit test file
node --test tests/unit/helpers/capitalize.test.js

# Run unit tests matching a name pattern
node --test --test-name-pattern="capitalize" tests/unit/**/*.test.js

# Run a single Playwright test file
npx playwright test tests/e2e/pages/home.test.js

# Run Playwright tests matching a grep pattern
npx playwright test --grep "login"

# Run Playwright tests in a specific project (browser)
npx playwright test --project=chromium
```

## Prerequisites

### Node.js 18+

The built-in `node:test` module requires Node.js 18 or later. Node.js 20+ is recommended for the best test runner experience (better reporting, `--test-concurrency` flag, improved glob support).

```bash
node --version  # Must be v18.0.0 or later
```

### Playwright Installation

Playwright requires browser binaries to be installed separately from the npm package:

```bash
# Install Playwright npm package (usually already in devDependencies)
npm install --save-dev @playwright/test

# Download browser binaries (Chromium, Firefox, WebKit)
npx playwright install

# Or install only Chromium (faster, sufficient for most projects)
npx playwright install chromium
```

The Boring Stack's default `playwright.config.js` only uses Desktop Chrome, so installing just Chromium is sufficient.

### Test Environment Configuration

The test environment is configured in `config/env/test.js`. This file is loaded when Sails lifts with `NODE_ENV=test` or `sails_environment=test`. See the [test-configuration](test-configuration.md) rule for full details.

Verify the test environment works:

```bash
# Quick smoke test -- lift Sails in test mode
sails_environment=test node -e "
  const Sails = require('sails').constructor;
  new Sails().load({ environment: 'test' }, (err, sails) => {
    if (err) { console.error(err); process.exit(1); }
    console.log('Sails loaded in test mode on port', sails.config.port);
    sails.lower();
  });
"
```

## Writing Your First Unit Test

Create a helper to test:

```js
// api/helpers/capitalize.js
module.exports = {
  friendlyName: 'Capitalize',
  description: 'Capitalize the first letter of a string.',

  inputs: {
    text: {
      type: 'string',
      required: true,
      description: 'The text to capitalize.'
    }
  },

  fn: async function ({ text }) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
}
```

Write the test:

```js
// tests/unit/helpers/capitalize.test.js
const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.capitalize()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('capitalizes a single word', async () => {
    const result = await sails.helpers.capitalize('hello')
    assert.equal(result, 'Hello')
  })

  it('handles empty string', async () => {
    const result = await sails.helpers.capitalize('')
    assert.equal(result, '')
  })
})
```

Run it:

```bash
npm run test:unit
```

## Writing Your First E2E Test

```js
// tests/e2e/pages/home.test.js
import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Ascent/)
  })

  test('homepage has main heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
```

Run it:

```bash
npm run test:e2e
```

## Quick Reference

| Task                        | Command                                           |
| --------------------------- | ------------------------------------------------- |
| Run all tests               | `npm test`                                        |
| Run unit tests only         | `npm run test:unit`                               |
| Run e2e tests only          | `npm run test:e2e`                                |
| Run e2e with UI             | `npm run test:e2e:ui`                             |
| Run e2e headed              | `npm run test:e2e:headed`                         |
| Run single unit test        | `node --test tests/unit/helpers/foo.test.js`      |
| Run single e2e test         | `npx playwright test tests/e2e/pages/foo.test.js` |
| Install Playwright browsers | `npx playwright install`                          |
| Generate Playwright test    | `npx playwright codegen http://localhost:3333`    |
| View Playwright report      | `npx playwright show-report`                      |
