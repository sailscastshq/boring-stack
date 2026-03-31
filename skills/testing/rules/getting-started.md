---
name: getting-started
description: Sounding testing philosophy, suite structure, scripts, prerequisites, and migration mindset for The Boring JavaScript Stack
metadata:
  tags: getting-started, philosophy, structure, scripts, sounding, testing-strategy
---

# Getting Started with Testing

## Testing Philosophy

The Boring JavaScript Stack now centers its testing story on **Sounding**.

Sounding keeps one primary `test()` API while letting each trial reach for the right layer:

| Layer                       | Sounding surface                        | What it proves                                              | Typical speed |
| --------------------------- | --------------------------------------- | ----------------------------------------------------------- | ------------- |
| **Helper / business logic** | `test()` + `sails.helpers`              | business rules, helper behavior, model-adjacent logic       | Fast          |
| **Request / JSON**          | `test()` + `get()` / `post()`           | status codes, redirects, headers, JSON contracts, policies  | Fast          |
| **Inertia**                 | `test()` + `visit()`                    | component names, props, validation, partial reload behavior | Fast–medium   |
| **Browser**                 | `test()` + `{ browser: true }` + `page` | real navigation, DOM state, editor flows, mobile behavior   | Slower        |
| **Mail**                    | `test()` + `mailbox`                    | transactional email behavior through the real Sails path    | Fast          |

The guiding principle is simple:

- use the lightest trial that can truthfully prove the behavior
- keep `sails` at the center of the trial context
- reach for the browser only when the browser is the behavior

## Core Terms

Use Sounding's vocabulary consistently:

- a **trial** is one named behavior being proved
- a **trial context** is the object passed into `test()`
- a **world** is the named business situation the trial lives inside
- an **actor** is the role operating through that world
- a **suite** is the whole test tree for the app

## Recommended Structure

Keep the suite shaped like the product, not like the framework:

```text
tests/
  unit/
    helpers/
  e2e/
    pages/
      auth/
      billing/
      dashboard/
      issues/
  factories/
  scenarios/
```

Guidelines:

- `tests/unit/` is for fast helper and business-logic trials
- `tests/e2e/pages/` groups request, Inertia, and browser-capable page trials by feature
- `tests/factories/` holds primitive record builders
- `tests/scenarios/` holds named business situations
- do not create `tests/sounding/`

## Package Scripts

A calm default looks like this:

```json
{
  "scripts": {
    "test:unit": "node --test --test-concurrency=1 tests/unit/**/*.test.js",
    "test:e2e": "node --test --test-concurrency=1 tests/e2e/pages/*.test.js tests/e2e/pages/**/*.test.js",
    "test": "npm run test:unit && npm run test:e2e"
  }
}
```

This keeps the runner story simple because Sounding already sits on top of the native Node runner.

## Writing the First Trial

```js
const { test } = require('sounding')

test('guest is redirected from dashboard', async ({ get, expect }) => {
  const response = await get('/dashboard')

  expect(response).toHaveStatus(302)
  expect(response).toRedirectTo('/login')
})
```

This example matters because it shows the whole shape:

- one `test()` API
- one Sails-centered runtime underneath
- one request surface
- one assertion style

## Migration Mindset

When rewriting an older suite, prefer this order:

1. replace custom boot helpers with Sounding
2. migrate request-level tests from browser smoke tests to `get()` / `post()` where appropriate
3. migrate Inertia checks to `visit()`
4. keep browser-capable trials only for real browser behavior
5. move setup into `tests/factories` and `tests/scenarios`

That usually makes the suite both faster and easier to read.

## Prerequisites

- Node.js 18+ (20+ recommended)
- Sounding installed in the app
- Playwright available for browser-capable trials
- `config/env/test.js` configured coherently, plus `config/sounding.js` only if your app needs overrides

Read [test-configuration](test-configuration.md) before changing the environment story.
