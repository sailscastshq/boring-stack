---
name: e2e-testing
description: End-to-end testing with Playwright - configuration, selectors, assertions, navigation, authentication, traces, screenshots, running modes, and CI setup
metadata:
  tags: e2e, playwright, browser, selectors, assertions, navigation, authentication, traces, screenshots, ci
---

# End-to-End Testing with Playwright

E2E tests verify full user flows by driving a real browser against a running Sails server. The Boring JavaScript Stack uses Playwright for all e2e testing.

## Playwright Configuration

The `playwright.config.js` at the project root configures how Playwright runs:

```js
// playwright.config.js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'sails_environment="test" sails lift',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI
  }
})
```

### Configuration Breakdown

| Setting         | Purpose                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| `testDir`       | Where Playwright looks for test files (`tests/e2e/`)                              |
| `fullyParallel` | Run tests within a file in parallel                                               |
| `forbidOnly`    | Fail CI if `.only` is left in tests (prevents accidental focus)                   |
| `retries`       | Retry failed tests in CI (2 retries) but not locally (0)                          |
| `workers`       | 1 worker in CI (stable), auto-detect locally (faster)                             |
| `reporter`      | HTML report -- viewable with `npx playwright show-report`                         |
| `baseURL`       | Base URL for all `page.goto('/')` calls -- points to the test server on port 3333 |
| `trace`         | Capture trace on first retry -- provides timeline, DOM snapshots, network logs    |
| `screenshot`    | Capture screenshot only when a test fails                                         |

### Web Server Auto-Start

The `webServer` block tells Playwright to automatically start the Sails app before running tests:

- **command**: Lifts Sails in test mode (`sails_environment="test"` sets the environment)
- **url**: Playwright waits for this URL to respond before starting tests
- **reuseExistingServer**: In local development, reuse a server that is already running; in CI, always start fresh

This means you do not need to manually start the server before running `npm run test:e2e`. Playwright handles it.

## Writing E2E Tests

E2E test files use ESM (`import`) syntax and the `@playwright/test` package:

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

### The `page` Fixture

Every test receives a `page` object -- a fresh browser tab. Each test gets its own isolated page, so cookies, localStorage, and state do not leak between tests.

### test.describe and test

`test.describe` groups tests (like `describe` in node:test). `test` defines an individual e2e test case. Always use `async` since all browser interactions are asynchronous.

## Navigation

### page.goto

Navigate to a URL. With `baseURL` configured, use relative paths:

```js
test('navigates to about page', async ({ page }) => {
  await page.goto('/about')
  await expect(page).toHaveURL('/about')
})
```

### Clicking Links

```js
test('navigates via link click', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL('/about')
})
```

### Waiting for Navigation

Playwright auto-waits for navigation after clicks, but for explicit control:

```js
test('waits for navigation after form submit', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('password123')

  await Promise.all([
    page.waitForURL('/dashboard'),
    page.getByRole('button', { name: 'Sign in' }).click()
  ])

  await expect(page).toHaveURL('/dashboard')
})
```

## Selectors

Playwright provides role-based, text-based, and test-id-based selectors. Prefer semantic selectors over CSS selectors.

### getByRole (Preferred)

Select elements by their ARIA role. This is the most resilient selector because it matches what assistive technologies see:

```js
// Buttons
page.getByRole('button', { name: 'Submit' })
page.getByRole('button', { name: /submit/i }) // Case-insensitive regex

// Links
page.getByRole('link', { name: 'Dashboard' })

// Headings
page.getByRole('heading', { level: 1 })
page.getByRole('heading', { name: 'Welcome' })

// Form elements
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Remember me' })

// Navigation
page.getByRole('navigation')
page.getByRole('main')
```

### getByText

Select elements by their visible text content:

```js
page.getByText('Welcome to the app')
page.getByText(/welcome/i) // Case-insensitive regex
page.getByText('Sign up', { exact: true }) // Exact match only
```

### getByLabel

Select form inputs by their associated label:

```js
page.getByLabel('Email')
page.getByLabel('Password')
page.getByLabel('Full name')
```

### getByPlaceholder

Select inputs by their placeholder text:

```js
page.getByPlaceholder('Enter your email')
page.getByPlaceholder('Search...')
```

### getByTestId

Select by a `data-testid` attribute. Use as a fallback when semantic selectors are not practical:

```js
// In your component: <div data-testid="user-avatar">...</div>
page.getByTestId('user-avatar')
```

### CSS and XPath (Last Resort)

Use `locator()` with CSS selectors or XPath when other methods do not work:

```js
page.locator('.sidebar .nav-item')
page.locator('#main-content')
page.locator('[data-status="active"]')
```

## Assertions

Playwright assertions auto-wait for conditions to be met (with a default timeout of 5 seconds).

### Page Assertions

```js
// Title
await expect(page).toHaveTitle('Dashboard')
await expect(page).toHaveTitle(/dashboard/i)

// URL
await expect(page).toHaveURL('/dashboard')
await expect(page).toHaveURL(/\/dashboard/)
```

### Element Visibility

```js
await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
await expect(page.getByText('Loading...')).toBeHidden()
await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible()
```

### Text Content

```js
await expect(page.getByRole('main')).toContainText('Hello, Kelvin')
await expect(page.getByTestId('error-message')).toHaveText(
  'Invalid email address'
)
```

### Element State

```js
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled()
await expect(page.getByRole('checkbox')).toBeChecked()
await expect(page.getByRole('textbox')).toHaveValue('hello@example.com')
```

### Element Count

```js
await expect(page.getByRole('listitem')).toHaveCount(5)
```

### Negation

Prefix any assertion with `.not`:

```js
await expect(page.getByText('Error')).not.toBeVisible()
await expect(page).not.toHaveURL('/login')
```

## Form Interactions

### Filling Forms

```js
test('submits the signup form', async ({ page }) => {
  await page.goto('/signup')

  await page.getByLabel('Full name').fill('Kelvin Omereshone')
  await page.getByLabel('Email').fill('kelvin@example.com')
  await page.getByLabel('Password').fill('secureP@ss1')

  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/dashboard')
})
```

### Other Input Interactions

```js
// Clear a field
await page.getByLabel('Email').clear()

// Type character by character (for testing autocomplete, etc.)
await page.getByLabel('Search').pressSequentially('sails', { delay: 100 })

// Select dropdown option
await page.getByLabel('Country').selectOption('US')
await page.getByLabel('Country').selectOption({ label: 'United States' })

// Check/uncheck
await page.getByRole('checkbox', { name: 'Remember me' }).check()
await page.getByRole('checkbox', { name: 'Remember me' }).uncheck()

// File upload
await page.getByLabel('Avatar').setInputFiles('tests/fixtures/avatar.png')
```

## Authentication in Tests

Most e2e tests need an authenticated user. Create a reusable login helper to avoid repeating login steps in every test.

### Login Helper Function

```js
// tests/e2e/helpers/login.js
export async function login(
  page,
  { email = 'test@example.com', password = 'password123' } = {}
) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
}
```

### Using the Login Helper

```js
// tests/e2e/pages/dashboard.test.js
import { test, expect } from '@playwright/test'
import { login } from '../helpers/login'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('shows user name on dashboard', async ({ page }) => {
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('displays recent activity', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Recent Activity' })
    ).toBeVisible()
  })
})
```

### Authentication with Storage State

For faster tests, save the authenticated session state and reuse it:

```js
// tests/e2e/setup/auth.setup.js
import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')

  // Save signed-in state to file
  await page.context().storageState({ path: authFile })
})
```

Then configure `playwright.config.js` to use it:

```js
// In playwright.config.js projects array:
{
  name: 'setup',
  testMatch: /.*\.setup\.js/
},
{
  name: 'chromium',
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'tests/e2e/.auth/user.json'
  },
  dependencies: ['setup']
}
```

Remember to add the auth state file to `.gitignore`:

```
# .gitignore
tests/e2e/.auth/
```

## Testing Inertia Page Transitions

Inertia navigates without full page reloads. Test that SPA transitions work correctly:

```js
test('navigates between pages without full reload', async ({ page }) => {
  await page.goto('/')

  // Click a link (Inertia intercepts this)
  await page.getByRole('link', { name: 'About' }).click()

  // Verify the URL changed
  await expect(page).toHaveURL('/about')

  // Verify new content appeared
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
})
```

### Testing Form Submissions with Inertia

Inertia form submissions use XHR instead of full page submits. Test the resulting state:

```js
test('updates profile via Inertia form', async ({ page }) => {
  await login(page)
  await page.goto('/settings/profile')

  await page.getByLabel('Full name').clear()
  await page.getByLabel('Full name').fill('Updated Name')
  await page.getByRole('button', { name: 'Save changes' }).click()

  // Wait for success feedback
  await expect(page.getByText('Profile updated')).toBeVisible()

  // Verify the change persisted by reloading
  await page.reload()
  await expect(page.getByLabel('Full name')).toHaveValue('Updated Name')
})
```

### Testing Validation Errors

```js
test('shows validation errors on invalid input', async ({ page }) => {
  await page.goto('/signup')

  // Submit empty form
  await page.getByRole('button', { name: 'Create account' }).click()

  // Verify error messages appear
  await expect(page.getByText('Email is required')).toBeVisible()
  await expect(page.getByText('Password is required')).toBeVisible()
})

test('shows error for duplicate email', async ({ page }) => {
  await page.goto('/signup')

  await page.getByLabel('Email').fill('existing@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText('Email already in use')).toBeVisible()
})
```

## Traces and Screenshots

### Screenshot on Failure

With `screenshot: 'only-on-failure'` in the config, Playwright automatically captures a screenshot when a test fails. Screenshots are saved to the `test-results/` directory.

### Manual Screenshots

```js
test('captures current state', async ({ page }) => {
  await page.goto('/dashboard')

  // Full page screenshot
  await page.screenshot({
    path: 'tests/e2e/screenshots/dashboard.png',
    fullPage: true
  })

  // Element screenshot
  const chart = page.getByTestId('revenue-chart')
  await chart.screenshot({ path: 'tests/e2e/screenshots/chart.png' })
})
```

### Traces

Traces provide a complete timeline of a test run -- network requests, DOM snapshots, console logs, and actions. With `trace: 'on-first-retry'`, traces are captured when a test fails and is retried.

View traces with:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

Or use the Playwright Trace Viewer UI:

```bash
npx playwright show-report
# Click on a failed test to see its trace
```

### Configuring Trace Modes

```js
// In playwright.config.js use block:
use: {
  trace: 'on-first-retry',    // Only on retry (default for CI)
  // trace: 'on',              // Always capture traces
  // trace: 'retain-on-failure', // Keep only for failed tests
  // trace: 'off',             // Never capture
}
```

## Running Modes

### Headless (Default)

```bash
npm run test:e2e
# or
npx playwright test
```

No browser window opens. Fastest mode. Used in CI.

### Headed

```bash
npm run test:e2e:headed
# or
npx playwright test --headed
```

Opens a real browser window so you can watch the test execute. Useful for debugging visual issues.

### UI Mode

```bash
npm run test:e2e:ui
# or
npx playwright test --ui
```

Opens Playwright's interactive test explorer. Provides:

- Test file tree with run/skip controls
- Time-travel debugging with DOM snapshots at each step
- Network request log
- Console output
- Trace-like visualization without generating trace files

This is the best mode for developing and debugging e2e tests locally.

### Debug Mode

```bash
npx playwright test --debug
```

Opens the browser and the Playwright Inspector side-by-side. You can step through each action, inspect selectors, and modify the test on the fly.

### Code Generation

```bash
npx playwright codegen http://localhost:3333
```

Opens a browser and the Playwright Inspector. As you interact with the app (click, type, navigate), Playwright generates test code. This is a quick way to scaffold e2e tests.

Note: Start the Sails server first (`sails_environment=test sails lift`) before using codegen.

## Testing Responsive Layouts

```js
test('shows mobile menu on small screen', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  // Desktop nav should be hidden
  await expect(
    page.getByRole('navigation', { name: 'Desktop' })
  ).not.toBeVisible()

  // Mobile menu button should be visible
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()

  // Open mobile menu
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
})
```

## Testing Accessibility

Playwright integrates with accessibility testing libraries:

```js
test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/')

  // Check that all images have alt text
  const images = page.getByRole('img')
  const count = await images.count()
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt')
    expect(alt).toBeTruthy()
  }

  // Verify heading hierarchy
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
})
```

## Page Object Pattern

For larger test suites, encapsulate page interactions in page object classes:

```js
// tests/e2e/pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
    this.errorMessage = page.getByTestId('login-error')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email, password) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

```js
// tests/e2e/pages/login.test.js
import { test, expect } from '@playwright/test'
import { LoginPage } from './LoginPage'

test.describe('Login Page', () => {
  let loginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123')
    await expect(page).toHaveURL('/dashboard')
  })

  test('invalid credentials show error', async ({ page }) => {
    await loginPage.login('user@example.com', 'wrongpassword')
    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toContainText(
      'Invalid email or password'
    )
  })

  test('empty form shows validation', async ({ page }) => {
    await loginPage.submitButton.click()
    await expect(page.getByText('Email is required')).toBeVisible()
  })
})
```

## Complete E2E Test Example

Here is a full e2e test covering a signup-to-dashboard flow:

```js
// tests/e2e/pages/signup-flow.test.js
import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test('new user can sign up and reach dashboard', async ({ page }) => {
    // Start at homepage
    await page.goto('/')
    await expect(page).toHaveTitle(/Ascent/)

    // Navigate to signup
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('/signup')

    // Fill out the signup form
    const uniqueEmail = `test+${Date.now()}@example.com`
    await page.getByLabel('Full name').fill('Test User')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password').fill('SecureP@ss1')

    // Submit the form
    await page.getByRole('button', { name: 'Create account' }).click()

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Verify welcome content
    await expect(page.getByText('Test User')).toBeVisible()
  })

  test('signup with existing email shows error', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel('Full name').fill('Duplicate User')
    await page.getByLabel('Email').fill('existing@example.com')
    await page.getByLabel('Password').fill('SecureP@ss1')
    await page.getByRole('button', { name: 'Create account' }).click()

    // Should stay on signup page with error
    await expect(page).toHaveURL('/signup')
    await expect(page.getByText(/already/i)).toBeVisible()
  })
})
```

## CI Configuration

In CI (GitHub Actions), Playwright runs headless with specific settings:

- `forbidOnly: !!process.env.CI` -- fails the build if `.only()` is left in tests
- `retries: 2` -- retries failed tests twice (catches flaky tests)
- `workers: 1` -- uses a single worker (more stable in CI environments)
- Screenshots and traces are captured on failure and uploaded as artifacts

See [test-configuration](test-configuration.md) for the full GitHub Actions workflow.
