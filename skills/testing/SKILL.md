---
name: testing
description: >
  Testing patterns for The Boring JavaScript Stack — unit testing with Node.js test runner, end-to-end testing
  with Playwright, and integration testing with inertia-sails/test. Use this skill when writing, configuring,
  or debugging tests in a Sails.js + Inertia.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: testing, unit-tests, e2e, playwright, integration, node-test, boring-stack
---

# Testing

The Boring JavaScript Stack uses a layered testing strategy: **unit tests** for helpers and business logic, **integration tests** for Inertia action responses, and **end-to-end tests** for full browser flows. Each layer uses purpose-built tooling that requires zero external test frameworks.

## When to Use

Use this skill when:

- Writing unit tests for Sails.js helpers using Node.js built-in test runner (`node:test`)
- Writing end-to-end tests with Playwright for page flows and user interactions
- Writing integration tests using `inertia-sails/test` assertion library
- Configuring the test environment (`config/env/test.js`, database strategy, email mocking)
- Setting up Playwright configuration (`playwright.config.js`)
- Setting up CI/CD pipelines with GitHub Actions for automated testing
- Understanding the `getSails()` singleton pattern for test initialization

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - Testing philosophy, project structure, npm scripts, prerequisites
- [rules/unit-testing.md](rules/unit-testing.md) - Node.js built-in test runner, getSails() pattern, helper testing, assertions
- [rules/e2e-testing.md](rules/e2e-testing.md) - Playwright setup, configuration, page testing, selectors, traces, CI
- [rules/integration-testing.md](rules/integration-testing.md) - inertia-sails/test API, all assertion methods, partial requests
- [rules/test-configuration.md](rules/test-configuration.md) - Test environment config, database strategy, email mocking, GitHub Actions CI
