---
name: integration-testing
description: Request-level and Inertia testing with Sounding — get(), post(), visit(), actors, redirects, JSON contracts, props, and transport choices
metadata:
  tags: integration, sounding, request, inertia, json, redirects, props, actors
---

# Integration Testing

In the Sounding world, the old split between "integration tests" and "Inertia tests" gets much calmer.

You still write `test()`.
You just reach for the right surface:

- `get()` / `post()` / `request` for JSON and endpoint behavior
- `visit()` for Inertia contracts

## JSON and endpoint trials

Use request-level trials for:

- status codes
- redirects
- headers
- JSON payloads
- guest vs authenticated access
- policy behavior

```js
const { test } = require('sounding')

test('guest is redirected from dashboard', async ({ get, expect }) => {
  const response = await get('/dashboard')

  expect(response).toHaveStatus(302)
  expect(response).toRedirectTo('/login')
})
```

### Authenticated request trials

```js
test('publisher can create an issue', async ({ sails, expect }) => {
  const current = await sails.sounding.world.use('publisher-editor')

  const response = await sails.sounding.request
    .as(current.users.publisher)
    .post('/api/issues', {
      title: 'New issue'
    })

  expect(response).toHaveStatus(201)
  expect(response).toHaveJsonPath('title', 'New issue')
})
```

Use `request.as(actor)` when the behavior is role-sensitive.

## Inertia trials

Use `visit()` when the contract is an Inertia page, not just a raw status code.

```js
const { test } = require('sounding')

test('pricing returns the right page props', async ({ visit, expect }) => {
  const page = await visit('/pricing')

  expect(page).toHaveStatus(200)
  expect(page).toBeInertiaPage('billing/pricing')
  expect(page).toHaveProp('plans')
})
```

Use `visit()` for:

- component names
- props
- nested prop paths
- validation errors
- partial reload behavior

## Transport choice

Sounding keeps one request API while allowing two transports underneath:

- **virtual** transport by default for fast, app-aware trials
- **http** transport when real HTTP parity matters more

Use a per-trial override when needed:

```js
test(
  'signup should run over real HTTP',
  { transport: 'http' },
  async ({ post, expect }) => {
    const response = await post('/signup', {
      fullName: 'Kelvin O',
      emailAddress: 'kelvin@example.com'
    })

    expect(response).toHaveStatus(200)
  }
)
```

Or scope a client directly:

```js
const http = sails.sounding.request.using('http')
```

## Matchers to prefer

Request-level:

- `toHaveStatus()`
- `toRedirectTo()`
- `toHaveHeader()`
- `toHaveJsonPath()`

Inertia-level:

- `toBeInertiaPage()`
- `toHaveProp()`
- `toMatchProp()`
- `toHaveSharedProp()`
- `toHaveValidationError()`

## What to avoid

Avoid:

- using browser tests for simple redirect or JSON behavior
- writing raw low-level request plumbing in every file
- treating Inertia responses as generic HTML
- keeping `inertia-sails/test` as the main public story

The Sounding path should be the default path.
