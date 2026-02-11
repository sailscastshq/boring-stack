---
name: integration-testing
description: Integration testing with inertia-sails/test - making requests to Inertia actions, assertion methods, partial requests, form submissions, redirects, and full CRUD testing
metadata:
  tags: integration, inertia-sails, assertions, props, flash, redirect, partial, crud
---

# Integration Testing with inertia-sails/test

Integration tests verify that Sails actions return the correct Inertia responses -- the right component, props, flash messages, and status codes -- without opening a browser. The `inertia-sails/test` package provides a purpose-built assertion library for this.

## What inertia-sails/test Provides

The `inertia-sails/test` package gives you:

- A test client that makes HTTP requests to your Sails app as if they were Inertia requests
- Response assertion methods for component names, props, flash messages, redirects, and status codes
- Support for partial reload requests (Inertia's `only` and `except` headers)
- No browser needed -- tests run at the HTTP level

Install it as a dev dependency:

```bash
npm install --save-dev inertia-sails
```

The test utilities are imported from `inertia-sails/test`:

```js
const { createInertiaApp } = require('inertia-sails/test')
```

## Setting Up Integration Tests

Integration tests need a running Sails app with the HTTP and Inertia hooks enabled. Create a setup utility:

```js
// tests/util/get-inertia-app.js
const { createInertiaApp } = require('inertia-sails/test')

let app = null
let initPromise = null

async function getInertiaApp() {
  if (app) return app
  if (initPromise) return initPromise

  initPromise = createInertiaApp()
  app = await initPromise
  return app
}

module.exports = { getInertiaApp }
```

`createInertiaApp()` lifts a Sails instance with all hooks needed for request handling (HTTP, session, ORM, etc.) and returns a test client. Like `getSails()`, this is a singleton that initializes once and is reused across all integration test files.

## Making Requests

The test client provides HTTP methods that automatically set Inertia request headers:

```js
const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getInertiaApp } = require('../../util/get-inertia-app')

describe('GET /dashboard', () => {
  let app

  before(async () => {
    app = await getInertiaApp()
  })

  it('returns the Dashboard component', async () => {
    const response = await app.get('/dashboard')
    response.assertComponent('dashboard/ViewDashboard')
  })
})
```

### Available HTTP Methods

```js
// GET request
const response = await app.get('/dashboard')

// POST request with body
const response = await app.post('/signup', {
  fullName: 'Kelvin Omereshone',
  email: 'kelvin@example.com',
  password: 'secureP@ss1'
})

// PUT request
const response = await app.put('/account/update-profile', {
  fullName: 'Updated Name'
})

// PATCH request
const response = await app.patch('/account/update-email', {
  email: 'new@example.com'
})

// DELETE request
const response = await app.delete('/account/delete')
```

### Authenticated Requests

To make requests as an authenticated user, chain `.loginAs()` before the HTTP method:

```js
it('shows dashboard for authenticated user', async () => {
  const user = await User.create({
    fullName: 'Test User',
    email: 'test@example.com',
    password: await sails.helpers.passwords.hashPassword('password123')
  }).fetch()

  const response = await app.loginAs(user).get('/dashboard')
  response.assertComponent('dashboard/ViewDashboard')
})
```

The `loginAs()` method sets up the session with the given user record, simulating an authenticated request.

## Assertion Methods

### assertComponent(componentName)

Verify that the Inertia response renders the expected component:

```js
const response = await app.get('/dashboard')
response.assertComponent('dashboard/ViewDashboard')
```

The component name matches the component path as defined in your action's `return inertia.render('dashboard/ViewDashboard')` call.

### assertHasProps(propsObject)

Verify that specific props are included in the response:

```js
const response = await app.get('/dashboard')
response.assertHasProps({
  stats: {
    totalUsers: 42,
    activeToday: 7
  }
})
```

This checks that the response props contain at least the specified keys and values. Extra props in the response are allowed -- this is a partial match.

### assertHasProp(key)

Verify that a specific prop key exists in the response, without checking its value:

```js
const response = await app.get('/dashboard')
response.assertHasProp('stats')
response.assertHasProp('recentActivity')
```

### assertPropValue(key, value)

Verify that a specific prop has an exact value:

```js
const response = await app.get('/users/1')
response.assertPropValue('user.name', 'Kelvin Omereshone')
response.assertPropValue('user.email', 'kelvin@example.com')
```

### assertFlash(key, value)

Verify that a flash message was set in the response:

```js
const response = await app.post('/account/update-profile', {
  fullName: 'Updated Name'
})
response.assertFlash('message', 'Profile updated successfully')
```

### assertRedirect(url)

Verify that the response is a redirect to the specified URL:

```js
const response = await app.post('/login', {
  email: 'user@example.com',
  password: 'password123'
})
response.assertRedirect('/dashboard')
```

### assertStatus(statusCode)

Verify the HTTP status code of the response:

```js
// Successful page render
const response = await app.get('/dashboard')
response.assertStatus(200)

// Redirect
const response2 = await app.post('/login', {
  email: 'user@example.com',
  password: 'pass'
})
response2.assertStatus(302)

// Inertia redirect (409 with X-Inertia-Location header)
const response3 = await app.post('/account/delete')
response3.assertStatus(409)

// Unauthorized
const response4 = await app.get('/admin')
response4.assertStatus(403)
```

### assertInertiaRedirect(url)

Verify that the response is an Inertia redirect (409 status with `X-Inertia-Location` header). This is different from a standard redirect:

```js
const response = await app.post('/account/complete-setup')
response.assertInertiaRedirect('/dashboard')
```

### assertBadRequest()

Verify that the response is a 400 Bad Request (used for validation errors in Inertia):

```js
const response = await app.post('/signup', {
  email: '', // Missing required field
  password: 'short'
})
response.assertBadRequest()
```

### Combining Assertions

Chain multiple assertions on the same response:

```js
it('returns dashboard with correct props', async () => {
  const user = await User.create({
    fullName: 'Kelvin',
    email: 'kelvin@example.com',
    password: await sails.helpers.passwords.hashPassword('password123')
  }).fetch()

  const response = await app.loginAs(user).get('/dashboard')

  response.assertStatus(200)
  response.assertComponent('dashboard/ViewDashboard')
  response.assertHasProp('stats')
  response.assertHasProp('recentActivity')
  response.assertPropValue('user.fullName', 'Kelvin')
})
```

## Testing Partial Requests

Inertia supports partial reloads where only specified props are returned. Test these with the `only` and `except` options.

### Partial Reload with `only`

```js
it('returns only requested props on partial reload', async () => {
  const user = await User.create({
    fullName: 'Kelvin',
    email: 'kelvin@example.com',
    password: await sails.helpers.passwords.hashPassword('password123')
  }).fetch()

  const response = await app.loginAs(user).get('/dashboard', {
    headers: {
      'X-Inertia-Partial-Data': 'stats',
      'X-Inertia-Partial-Component': 'dashboard/ViewDashboard'
    }
  })

  response.assertComponent('dashboard/ViewDashboard')
  response.assertHasProp('stats')
})
```

### Partial Reload with `except`

```js
it('returns all props except excluded ones', async () => {
  const response = await app.loginAs(user).get('/dashboard', {
    headers: {
      'X-Inertia-Partial-Except': 'heavyData',
      'X-Inertia-Partial-Component': 'dashboard/ViewDashboard'
    }
  })

  response.assertComponent('dashboard/ViewDashboard')
  response.assertHasProp('stats')
  // heavyData should not be present
})
```

## Testing Form Submissions

### Successful Form Submission

```js
describe('POST /signup', () => {
  let app

  before(async () => {
    app = await getInertiaApp()
  })

  it('creates a new user and redirects', async () => {
    const response = await app.post('/signup', {
      fullName: 'New User',
      email: `new+${Date.now()}@example.com`,
      password: 'SecureP@ss1'
    })

    response.assertRedirect('/dashboard')
  })
})
```

### Validation Errors

When form submission fails validation, the action returns a bad request with error props:

```js
describe('POST /signup validation', () => {
  let app

  before(async () => {
    app = await getInertiaApp()
  })

  it('rejects empty email', async () => {
    const response = await app.post('/signup', {
      fullName: 'Test',
      email: '',
      password: 'SecureP@ss1'
    })

    response.assertBadRequest()
  })

  it('rejects weak password', async () => {
    const response = await app.post('/signup', {
      fullName: 'Test',
      email: 'test@example.com',
      password: '123'
    })

    response.assertBadRequest()
  })

  it('rejects duplicate email', async () => {
    // Create a user first
    await User.create({
      fullName: 'Existing',
      email: 'duplicate@example.com',
      password: await sails.helpers.passwords.hashPassword('password123')
    })

    const response = await app.post('/signup', {
      fullName: 'Another',
      email: 'duplicate@example.com',
      password: 'SecureP@ss1'
    })

    response.assertBadRequest()
  })
})
```

## Testing Redirects

### Standard Redirect (302)

Standard redirects happen after successful form submissions:

```js
it('redirects to login after logout', async () => {
  const user = await User.create({
    fullName: 'Test',
    email: 'logout@example.com',
    password: await sails.helpers.passwords.hashPassword('password123')
  }).fetch()

  const response = await app.loginAs(user).post('/logout')
  response.assertRedirect('/login')
  response.assertStatus(302)
})
```

### Inertia Redirect (409)

Inertia redirects are used when the server needs a full page reload (e.g., after clearing cached `once()` data):

```js
it('uses Inertia redirect after session reset', async () => {
  const user = await User.create({
    fullName: 'Test',
    email: 'reset@example.com',
    password: await sails.helpers.passwords.hashPassword('password123')
  }).fetch()

  const response = await app.loginAs(user).post('/account/reset-session')
  response.assertInertiaRedirect('/dashboard')
})
```

## Testing Error Responses

### 404 Not Found

```js
it('returns 404 for non-existent resource', async () => {
  const response = await app.get('/users/99999')
  response.assertStatus(404)
})
```

### 403 Forbidden

```js
it('returns 403 when accessing admin without permission', async () => {
  const regularUser = await User.create({
    fullName: 'Regular',
    email: 'regular@example.com',
    password: await sails.helpers.passwords.hashPassword('password123'),
    isSuperAdmin: false
  }).fetch()

  const response = await app.loginAs(regularUser).get('/admin')
  response.assertStatus(403)
})
```

### Unauthenticated Access

```js
it('redirects to login when not authenticated', async () => {
  const response = await app.get('/dashboard')
  response.assertRedirect('/login')
})
```

## Complete CRUD Integration Test

Here is a full integration test covering create, read, update, and delete for a resource:

```js
// tests/integration/posts.test.js
const { describe, it, before, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { getInertiaApp } = require('../util/get-inertia-app')

describe('Posts CRUD', () => {
  let app
  let user

  before(async () => {
    app = await getInertiaApp()
  })

  beforeEach(async () => {
    // Clean up before each test
    await Post.destroy({})
    await User.destroy({})

    // Create a test user
    user = await User.create({
      fullName: 'Author',
      email: 'author@example.com',
      password: await sails.helpers.passwords.hashPassword('password123')
    }).fetch()
  })

  // -- CREATE --
  describe('POST /posts/create', () => {
    it('creates a new post and redirects to the post page', async () => {
      const response = await app.loginAs(user).post('/posts/create', {
        title: 'My First Post',
        body: 'This is the content of my first post.'
      })

      response.assertRedirect('/posts')
      response.assertFlash('message', 'Post created successfully')

      // Verify it was actually created in the database
      const posts = await Post.find({ author: user.id })
      assert.equal(posts.length, 1)
      assert.equal(posts[0].title, 'My First Post')
    })

    it('rejects a post without a title', async () => {
      const response = await app.loginAs(user).post('/posts/create', {
        title: '',
        body: 'Some content'
      })

      response.assertBadRequest()
    })

    it('requires authentication', async () => {
      const response = await app.post('/posts/create', {
        title: 'Unauthenticated Post',
        body: 'Should fail'
      })

      response.assertRedirect('/login')
    })
  })

  // -- READ (List) --
  describe('GET /posts', () => {
    it('returns the posts list page with posts prop', async () => {
      await Post.createEach([
        { title: 'Post 1', body: 'Body 1', author: user.id },
        { title: 'Post 2', body: 'Body 2', author: user.id }
      ])

      const response = await app.loginAs(user).get('/posts')

      response.assertStatus(200)
      response.assertComponent('posts/ViewPosts')
      response.assertHasProp('posts')
    })
  })

  // -- READ (Single) --
  describe('GET /posts/:id', () => {
    it('returns a single post with its props', async () => {
      const post = await Post.create({
        title: 'Specific Post',
        body: 'Specific content',
        author: user.id
      }).fetch()

      const response = await app.loginAs(user).get(`/posts/${post.id}`)

      response.assertStatus(200)
      response.assertComponent('posts/ViewPost')
      response.assertPropValue('post.title', 'Specific Post')
      response.assertPropValue('post.body', 'Specific content')
    })

    it('returns 404 for non-existent post', async () => {
      const response = await app.loginAs(user).get('/posts/99999')
      response.assertStatus(404)
    })
  })

  // -- UPDATE --
  describe('PUT /posts/:id/update', () => {
    it('updates the post and redirects', async () => {
      const post = await Post.create({
        title: 'Original Title',
        body: 'Original body',
        author: user.id
      }).fetch()

      const response = await app.loginAs(user).put(`/posts/${post.id}/update`, {
        title: 'Updated Title',
        body: 'Updated body'
      })

      response.assertRedirect(`/posts/${post.id}`)
      response.assertFlash('message', 'Post updated successfully')

      // Verify the update in the database
      const updated = await Post.findOne({ id: post.id })
      assert.equal(updated.title, 'Updated Title')
    })

    it('rejects update from non-author', async () => {
      const otherUser = await User.create({
        fullName: 'Other',
        email: 'other@example.com',
        password: await sails.helpers.passwords.hashPassword('password123')
      }).fetch()

      const post = await Post.create({
        title: 'Protected Post',
        body: 'Only author can edit',
        author: user.id
      }).fetch()

      const response = await app
        .loginAs(otherUser)
        .put(`/posts/${post.id}/update`, {
          title: 'Hacked Title'
        })

      response.assertStatus(403)
    })
  })

  // -- DELETE --
  describe('DELETE /posts/:id/delete', () => {
    it('deletes the post and redirects to list', async () => {
      const post = await Post.create({
        title: 'To Delete',
        body: 'Will be deleted',
        author: user.id
      }).fetch()

      const response = await app
        .loginAs(user)
        .delete(`/posts/${post.id}/delete`)

      response.assertRedirect('/posts')
      response.assertFlash('message', 'Post deleted successfully')

      // Verify deletion
      const deleted = await Post.findOne({ id: post.id })
      assert.equal(deleted, undefined)
    })

    it('requires authentication', async () => {
      const post = await Post.create({
        title: 'Protected',
        body: 'Need auth',
        author: user.id
      }).fetch()

      const response = await app.delete(`/posts/${post.id}/delete`)
      response.assertRedirect('/login')
    })
  })
})
```

## Assertion Quick Reference

| Method                        | What it checks                                       |
| ----------------------------- | ---------------------------------------------------- |
| `assertComponent(name)`       | Inertia renders the specified component              |
| `assertHasProps(obj)`         | Response props contain the specified key-value pairs |
| `assertHasProp(key)`          | Response props include the specified key             |
| `assertPropValue(key, value)` | A specific prop has the exact value                  |
| `assertFlash(key, value)`     | A flash message was set with the given key and value |
| `assertRedirect(url)`         | Response is a 302 redirect to the URL                |
| `assertInertiaRedirect(url)`  | Response is a 409 Inertia redirect to the URL        |
| `assertStatus(code)`          | Response has the specified HTTP status code          |
| `assertBadRequest()`          | Response is a 400 Bad Request                        |
