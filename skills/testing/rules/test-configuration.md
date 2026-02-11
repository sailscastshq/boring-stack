---
name: test-configuration
description: Test environment configuration - config/env/test.js, database strategy with sails-disk, email mocking, GitHub Actions CI workflow, environment variables
metadata:
  tags: configuration, test-environment, sails-disk, ci, github-actions, env, database, email
---

# Test Configuration

The Boring JavaScript Stack separates test configuration from development and production through Sails environment files, purpose-chosen adapters, and a GitHub Actions workflow.

## config/env/test.js

The test environment configuration lives in `config/env/test.js`. This file is loaded automatically when Sails starts with `NODE_ENV=test` or `sails_environment=test`.

```js
// config/env/test.js
module.exports = {
  port: 3333,

  datastores: {
    default: {
      adapter: 'sails-disk'
    }
  },

  models: {
    migrate: 'drop'
  },

  mail: {
    default: 'log'
  },

  log: {
    level: 'error'
  }
}
```

### Setting Breakdown

#### port: 3333

The test server runs on port 3333, separate from the default development port (1337). This prevents conflicts when running tests while the dev server is active. The `playwright.config.js` `baseURL` and `webServer.url` both reference this port.

#### datastores.default.adapter: 'sails-disk'

`sails-disk` is a file-based/in-memory adapter that requires no external database. This is deliberate for testing:

- **No database setup**: No PostgreSQL, MySQL, or MongoDB required in CI or on developer machines
- **Fast**: Reads and writes are in-memory within the process
- **Isolated**: Each test run starts with a clean slate (combined with `migrate: 'drop'`)
- **Portable**: Works identically on macOS, Linux, and Windows CI runners

The `.tmp/` directory is used by `sails-disk` for persistence between Sails lifts, but with `migrate: 'drop'`, data is wiped each time.

#### models.migrate: 'drop'

The `drop` migration strategy destroys all data and recreates all tables when Sails lifts. For testing, this guarantees:

- A clean schema matching the current model definitions
- No stale data from previous test runs
- No migration drift issues

This is the correct choice for tests. Never use `alter` or `safe` for test environments.

#### mail.default: 'log'

Setting the mail transport to `log` prevents any real emails from being sent during tests. Instead, email content is written to the Sails log. This:

- Prevents accidental email sends to real addresses during testing
- Avoids needing SMTP credentials in CI
- Lets you verify email content in logs if needed

#### log.level: 'error'

Only error-level messages appear in test output. This reduces noise from info and debug logs that would clutter test results. If you need to debug a failing test, temporarily change this to `'verbose'` or `'debug'`.

## Database Strategy

### Why sails-disk for Tests

The testing philosophy is: **test your logic, not your database**. Using `sails-disk` means:

1. **Zero infrastructure**: No database server to install, configure, or maintain
2. **Instant setup in CI**: No database service containers or setup steps
3. **Fast execution**: No network overhead, no connection pooling
4. **Deterministic**: No shared state between test runs

### When to Use a Real Database in Tests

In rare cases, you may need to test database-specific behavior (unique constraints at the DB level, complex queries, transactions). In those cases, configure a test-specific database:

```js
// config/env/test.js (with real database)
module.exports = {
  port: 3333,

  datastores: {
    default: {
      adapter: 'sails-postgresql',
      url:
        process.env.TEST_DATABASE_URL ||
        'postgresql://localhost:5432/myapp_test'
    }
  },

  models: {
    migrate: 'drop'
  },

  mail: {
    default: 'log'
  },

  log: {
    level: 'error'
  }
}
```

With a real database, `migrate: 'drop'` is even more important -- it ensures the test database is rebuilt from scratch each time.

## Email Mocking

The `mail.default: 'log'` setting handles most cases, but you can also verify that emails were triggered in integration tests by intercepting the mail helper:

```js
// In your test, verify that an email action was reached
it('sends welcome email after signup', async () => {
  const response = await app.post('/signup', {
    fullName: 'New User',
    email: 'welcome@example.com',
    password: 'SecureP@ss1'
  })

  response.assertRedirect('/dashboard')
  // The email was logged (not sent) due to mail.default: 'log'
  // Check the User was created, which implies the email step was reached
  const user = await User.findOne({ email: 'welcome@example.com' })
  assert.ok(user)
})
```

## Environment Variables

### Setting the Test Environment

There are two ways to set the test environment:

```bash
# Using sails_environment (recommended for Sails)
sails_environment=test sails lift

# Using NODE_ENV
NODE_ENV=test sails lift
```

The `playwright.config.js` uses `sails_environment="test"` in its `webServer.command` to ensure Sails loads `config/env/test.js`.

### Custom Environment Variables in Tests

If your app reads custom environment variables, set them in the test script or CI workflow:

```json
{
  "scripts": {
    "test:e2e": "STRIPE_SECRET_KEY=sk_test_fake playwright test"
  }
}
```

Or in `config/env/test.js` for Sails-level config:

```js
module.exports = {
  // ... other config

  custom: {
    stripeSecretKey: 'sk_test_fake_key_for_testing',
    sendgridApiKey: 'SG.fake_key_for_testing',
    enableFeatureX: true
  }
}
```

## GitHub Actions CI Workflow

The project includes a GitHub Actions workflow that runs both unit and e2e tests on every push and pull request.

### The Workflow File

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run e2e tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

### Workflow Breakdown

#### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

Tests run on:

- Direct pushes to `main` or `develop`
- Pull requests targeting `main` or `develop`

This ensures all code is tested before merge and after merge.

#### Node.js Setup

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

Uses Node.js 20 (LTS) with npm caching. The `cache: 'npm'` option caches the npm cache directory between runs, speeding up `npm ci`.

#### npm ci vs npm install

The workflow uses `npm ci` (clean install) instead of `npm install`:

- Deletes `node_modules/` and installs from scratch
- Uses exact versions from `package-lock.json`
- Faster and more reliable in CI
- Fails if `package-lock.json` is out of sync with `package.json`

#### Unit Tests First

```yaml
- name: Run unit tests
  run: npm run test:unit
```

Unit tests run first because they are fast and do not require browser binaries. If unit tests fail, the workflow fails early without wasting time on Playwright installation.

#### Playwright Browser Installation

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

- `--with-deps` installs OS-level dependencies (libraries Chromium needs on Ubuntu)
- `chromium` installs only Chromium (not Firefox or WebKit), matching the project config
- This step takes 20-40 seconds in CI

#### E2E Tests

```yaml
- name: Run e2e tests
  run: npm run test:e2e
```

Playwright auto-starts the Sails server via the `webServer` config in `playwright.config.js`, runs all tests headless, then shuts down the server.

#### Artifact Upload

```yaml
- name: Upload test results
  uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
    retention-days: 7
```

- `if: ${{ !cancelled() }}` uploads artifacts even if tests failed (so you can see screenshots and traces of failures)
- `test-results/` contains screenshots, traces, and test data from Playwright
- `playwright-report/` contains the HTML test report
- Artifacts are retained for 7 days

### Downloading and Viewing CI Artifacts

After a CI run, download the test results artifact from the GitHub Actions UI. To view the Playwright HTML report locally:

```bash
# Unzip the downloaded artifact
unzip test-results.zip -d test-results-ci

# Serve the Playwright report
npx playwright show-report test-results-ci/playwright-report
```

## Local Test Configuration Tips

### Running the Full Suite Locally

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run all tests (matches what CI does)
npm test
```

### Parallel Development and Testing

Since the test server runs on port 3333 and the dev server on port 1337, you can run both simultaneously:

```bash
# Terminal 1: dev server
sails lift

# Terminal 2: run tests against port 3333
npm run test:e2e
```

### Resetting Test Data

If test data persists unexpectedly (rare with `migrate: 'drop'`), clear the sails-disk storage:

```bash
rm -rf .tmp/localDiskDb
```

### Debugging Failing CI Tests

1. Download the `test-results` artifact from the GitHub Actions run
2. Check screenshots in `test-results/` for visual failures
3. Open traces with `npx playwright show-trace <path-to-trace.zip>`
4. Check the Playwright HTML report for detailed error messages

## Configuration Quick Reference

| Setting                      | Value         | Purpose                                    |
| ---------------------------- | ------------- | ------------------------------------------ |
| `port`                       | 3333          | Separate from dev (1337) and prod (80/443) |
| `datastores.default.adapter` | `sails-disk`  | In-memory, no DB server needed             |
| `models.migrate`             | `drop`        | Clean schema on every lift                 |
| `mail.default`               | `log`         | Prevent real emails                        |
| `log.level`                  | `error`       | Reduce test output noise                   |
| CI Node version              | 20            | LTS with full test runner support          |
| CI browser                   | Chromium only | Matches project config, fast install       |
| Artifact retention           | 7 days        | Enough time to debug failures              |
