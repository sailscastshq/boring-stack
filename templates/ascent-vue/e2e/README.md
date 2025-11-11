# End-to-End Testing with Playwright

This directory contains E2E tests for Ascent React using [Playwright](https://playwright.dev/).

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.js

# Run tests in debug mode
npx playwright test --debug
```

## Test Structure

- **auth.spec.js** - Authentication flows (signup, login, forgot password) and guest protection
- **public-pages.spec.js** - Public pages (features, pricing, contact, blog)
- **forms.spec.js** - Form submissions (waitlist, contact)

## Configuration

The Playwright configuration is in `playwright.config.js` at the project root:

- **baseURL**: `http://localhost:3333`
- **Test environment**: Uses `NODE_ENV=testing` (port 3333, sails-disk adapter)
- **Browser**: Chromium only (for speed)
- **Web server**: Automatically starts Sails app before tests

## Writing Tests

Tests use **user-facing selectors** following Playwright best practices:

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path')

    // Prefer user-facing selectors
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
```

### Selector Priority (User-First)

1. **`getByRole()`** - Buttons, headings, forms, links
2. **`getByLabel()`** - Form inputs with labels
3. **`getByText()`** - Visible text content
4. **`getByPlaceholder()`** - Input placeholders
5. **CSS/ID selectors** - Only as last resort

## CI/CD

E2E tests run automatically on GitHub Actions for:

- Push to `main` branch
- Pull requests

See `.github/workflows/e2e.yml` for configuration.

## Tips

- Tests use the `testing` environment (port 3333, sails-disk)
- Database migrates to `drop` mode (fresh DB for each run)
- Email transport is set to `log` (no actual emails sent)
- Use unique timestamps for test data: `test-${Date.now()}@example.com`
