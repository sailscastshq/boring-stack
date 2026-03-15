---
name: testing
description: >
  Sounding-first testing patterns for The Boring JavaScript Stack — one test() API, a Sails-centered trial
  context, worlds under tests/, JSON and Inertia request testing, mail capture, and browser-capable trials
  only when the browser truly matters. Use this skill when writing, configuring, or debugging tests in a
  Sails.js + Inertia.js application.
metadata:
  author: sailscastshq
  version: '2.0.0'
  tags: testing, sounding, sails, node-test, playwright, inertia, e2e, unit-tests, boring-stack
---

# Testing

The Boring JavaScript Stack now has one primary testing story: **Sounding**.

Sounding keeps the familiar `test()` API, but gives Sails apps one coherent runtime for:

- helper and business-logic trials
- JSON endpoint and policy behavior
- Inertia page contracts
- mail assertions
- browser-capable flows when the browser truly matters

## When to Use

Use this skill when:

- Writing or restructuring tests in a Sails.js + Inertia.js application
- Migrating older `node:test`, Playwright, or `inertia-sails/test` suites to Sounding
- Designing `tests/unit`, `tests/e2e/pages`, `tests/factories`, and `tests/scenarios`
- Configuring `config/sounding.js` and `config/env/test.js`
- Writing trials around `sails.helpers`, `get()` / `post()`, `visit()`, `auth`, `login`, `mailbox`, or `page`
- Choosing between virtual transport and real HTTP transport
- Keeping mail capture, datastore isolation, and browser setup calm and predictable
- Setting up CI around a Sounding-powered suite

## Sounding Mental Model

Keep these terms straight and use them consistently:

- a **trial** is one named behavior the app must prove
- the **trial context** is the object Sounding passes into `test()`
- `sails` is the canonical center of that context
- a **world** is the named business situation the trial lives inside
- an **actor** is the role operating through that world
- a **suite** is the whole organized test tree for the app

Prefer Sounding's public shape:

- `const { test } = require('sounding')`
- `test('...', async ({ sails, get, visit, auth, login, page, expect }) => {})`
- `sails.helpers.*`
- `sails.sounding.*`

Do not push people back toward:

- ad hoc `getSails()` boot helpers
- `inertia-sails/test` as the main integration story
- Playwright for every request-level behavior
- `tests/sounding/` as a framework-branded island

## Rules

Read the rule files that match the work you are doing:

- [rules/getting-started.md](rules/getting-started.md) - Sounding philosophy, suite layout, scripts, and migration mindset
- [rules/unit-testing.md](rules/unit-testing.md) - helper trials, pure business logic, worlds, factories, and scenarios
- [rules/integration-testing.md](rules/integration-testing.md) - request-level JSON and Inertia trials with `get()`, `post()`, and `visit()`
- [rules/e2e-testing.md](rules/e2e-testing.md) - browser-capable trials with `{ browser: true }`, `page`, `login`, and mobile-aware flows
- [rules/test-configuration.md](rules/test-configuration.md) - `config/sounding.js`, `config/env/test.js`, datastores, mail capture, cleanup, and CI
