---
name: e2e-testing
description: Browser-capable testing with Sounding — { browser: true }, page, login, auth, mobile-aware flows, and when to let the browser matter
metadata:
  tags: e2e, browser, sounding, playwright, login, auth, page, mobile
---

# End-to-End Testing

Sounding uses Playwright under the hood for browser-capable trials, but the public story stays the same:

- one `test()` API
- one trial context
- browser surfaces only when the browser matters

## Opting into the browser

Browser-capable trials are explicit:

```js
const { test } = require('sounding')

test(
  'magic link login reaches the dashboard',
  { browser: true },
  async ({ page, login, expect }) => {
    await login.as('reader@example.com', page)

    await expect(page).toHaveURL(/\/dashboard$/)
  }
)
```

When `{ browser: true }` is enabled, the trial context can include:

- `page`
- `browserContext`
- `browser`
- Playwright-backed `expect()` behavior

## Use browser-capable trials for the right things

Good uses:

- sign-in journeys
- editor flows
- gated content flows
- checkout handoff
- mobile navigation
- anything where DOM state and navigation are the behavior

Bad uses:

- simple redirects
- raw JSON response contracts
- page props that `visit()` can prove more cheaply

## Worlds matter even more here

Browser trials become fragile when they carry too much setup.
Use a named world whenever it improves readability.

```js
test(
  'subscriber can finish a members-only issue',
  { browser: true },
  async ({ sails, login, page, expect }) => {
    const current = await sails.sounding.world.use('issue-access')

    await login.as('subscriber', page)
    await page.goto(`/issues/${current.issues.gatedIssue.slug}`)

    await expect(
      page.getByText(current.issues.gatedIssue.premiumDetail)
    ).toBeVisible()
  }
)
```

## Auth in browser-capable trials

Prefer Sounding's auth helpers:

- `login.as(actorOrEmail, page)` for the common path
- `auth.issueMagicLink(actorOrEmail)` when you want the token or URL directly
- `auth.requestMagicLink(actorOrEmail)` when you want to exercise the real request + mail flow

Rules:

- use actor names like `'subscriber'` when the user comes from the current world
- use explicit emails when the trial is really about the auth path itself

## Mobile should stay first-class

A good Boring Stack suite should not treat mobile as an afterthought.

When a flow is navigation-heavy or layout-sensitive, prefer at least one browser-capable trial that exercises the mobile path too.

## File structure

Keep browser-capable trials under the normal product tree:

```text
tests/e2e/pages/
  auth/
    magic-link-browser.test.js
  dashboard/
    editor.test.js
  issues/
    reader-access.test.js
```

Do not create a separate framework-branded folder just because the browser is involved.
