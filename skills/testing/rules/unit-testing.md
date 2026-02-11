---
name: unit-testing
description: Unit testing with Node.js built-in test runner, getSails() singleton pattern, helper testing, assertions with node:assert/strict, and database-backed tests
metadata:
  tags: unit-testing, node-test, assert, getSails, helpers, models, singleton, describe, before
---

# Unit Testing

Unit tests in The Boring JavaScript Stack use the Node.js built-in test runner (`node:test`) and assertion library (`node:assert/strict`). No external test framework is needed.

## The Node.js Built-in Test Runner

The `node:test` module provides a familiar BDD-style API:

```js
const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach
} = require('node:test')
const assert = require('node:assert/strict')
```

### describe / it

`describe` groups related tests. `it` defines an individual test case. Both accept a string label and a callback function.

```js
describe('sails.helpers.formatCurrency()', () => {
  it('formats cents to dollars', async () => {
    // test body
  })

  it('handles zero amount', async () => {
    // test body
  })
})
```

### Nested describe

You can nest `describe` blocks to organize tests by behavior:

```js
describe('sails.helpers.validateEmail()', () => {
  describe('valid emails', () => {
    it('accepts standard format', async () => {
      /* ... */
    })
    it('accepts plus addressing', async () => {
      /* ... */
    })
  })

  describe('invalid emails', () => {
    it('rejects missing @ symbol', async () => {
      /* ... */
    })
    it('rejects missing domain', async () => {
      /* ... */
    })
  })
})
```

### Lifecycle Hooks

| Hook         | When it runs                                  |
| ------------ | --------------------------------------------- |
| `before`     | Once before all tests in the `describe` block |
| `after`      | Once after all tests in the `describe` block  |
| `beforeEach` | Before each `it` in the `describe` block      |
| `afterEach`  | After each `it` in the `describe` block       |

```js
describe('sails.helpers.createToken()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  afterEach(async () => {
    // Clean up any side effects between tests
  })

  it('generates a unique token', async () => {
    const token = await sails.helpers.createToken()
    assert.ok(token)
    assert.equal(typeof token, 'string')
  })
})
```

### Skipping and Focusing Tests

```js
// Skip a test
it.skip('not implemented yet', async () => {
  // This test will not run
})

// Run only this test (focus)
it.only('debug this specific test', async () => {
  // Only this test runs in the file
})

// Skip a describe block
describe.skip('WIP feature', () => {
  // All tests in this block are skipped
})

// Run from command line with name pattern
// node --test --test-name-pattern="capitalize" tests/unit/**/*.test.js
```

### Test Timeouts

Individual tests can have a timeout (in milliseconds):

```js
it('completes within 5 seconds', { timeout: 5000 }, async () => {
  const result = await sails.helpers.longRunningTask()
  assert.ok(result)
})
```

## The getSails() Singleton Pattern

Unit tests need access to `sails.helpers.*` and other Sails globals. The `getSails()` utility loads a minimal Sails instance once and reuses it across all test files.

### The Code

```js
// tests/util/get-sails.js
const Sails = require('sails').constructor

let sailsInstance = null
let initPromise = null

async function getSails() {
  if (sailsInstance) return sailsInstance
  if (initPromise) return initPromise

  initPromise = new Promise((resolve, reject) => {
    const sailsApp = new Sails()

    sailsApp.load(
      {
        environment: 'test',
        hooks: {
          shipwright: false,
          orm: false,
          sockets: false,
          pubsub: false,
          views: false,
          http: false,
          session: false,
          grunt: false,
          i18n: false,
          flash: false
        },
        log: { level: 'error' }
      },
      (err, sails) => {
        if (err) return reject(err)
        sailsInstance = sails
        resolve(sails)
      }
    )
  })

  return initPromise
}

module.exports = { getSails }
```

### Why a Singleton?

Sails takes time to bootstrap -- loading config, registering helpers, initializing hooks. Creating a new instance per test file would be slow and wasteful. The singleton pattern ensures:

1. **First call** creates the Sails instance and caches it
2. **Subsequent calls** return the cached instance immediately
3. **Concurrent calls** during initialization share the same promise (`initPromise`) to avoid race conditions

Because `--test-concurrency=1` runs test files sequentially, the first file that calls `getSails()` initializes Sails, and every subsequent file reuses the same instance.

### Why sails.load() Instead of sails.lift()?

`sails.load()` initializes the app without binding to a port. This means:

- No HTTP server starts (faster, no port conflicts)
- Helpers, config, and models are all available
- No need to call `sails.lower()` to clean up

For unit tests, you only need helpers and config -- not a running HTTP server.

### Which Hooks Are Disabled and Why

| Hook         | Why disabled                                                                      |
| ------------ | --------------------------------------------------------------------------------- |
| `shipwright` | Vite/asset bundling -- not needed for testing logic                               |
| `orm`        | Waterline database -- disabled for pure helper tests (enable when testing models) |
| `sockets`    | WebSocket support -- not needed for unit tests                                    |
| `pubsub`     | Real-time pub/sub -- depends on sockets                                           |
| `views`      | Server-rendered views -- Boring Stack uses Inertia instead                        |
| `http`       | Express HTTP server -- not needed when not making HTTP requests                   |
| `session`    | Session middleware -- depends on HTTP                                             |
| `grunt`      | Legacy asset pipeline -- replaced by Shipwright/Vite                              |
| `i18n`       | Internationalization -- not typically needed in unit tests                        |
| `flash`      | Flash messages -- depends on session                                              |

### Enabling the ORM Hook for Database Tests

When your helpers interact with models, enable the `orm` hook:

```js
// tests/util/get-sails-with-orm.js
const Sails = require('sails').constructor

let sailsInstance = null
let initPromise = null

async function getSailsWithOrm() {
  if (sailsInstance) return sailsInstance
  if (initPromise) return initPromise

  initPromise = new Promise((resolve, reject) => {
    const sailsApp = new Sails()

    sailsApp.load(
      {
        environment: 'test',
        hooks: {
          shipwright: false,
          sockets: false,
          pubsub: false,
          views: false,
          http: false,
          session: false,
          grunt: false,
          i18n: false,
          flash: false
          // orm is NOT disabled -- it will load
        },
        log: { level: 'error' }
      },
      (err, sails) => {
        if (err) return reject(err)
        sailsInstance = sails
        resolve(sails)
      }
    )
  })

  return initPromise
}

module.exports = { getSailsWithOrm }
```

## Testing Helpers

Helpers are the primary target of unit tests. They are pure functions with defined inputs and exits, making them ideal for isolated testing.

### Basic Helper Test

```js
// api/helpers/format-currency.js
module.exports = {
  friendlyName: 'Format currency',
  description: 'Format a cent amount as a human-readable currency string.',
  inputs: {
    amount: { type: 'number', required: true },
    currency: { type: 'string', defaultsTo: 'USD' }
  },
  fn: async function ({ amount, currency }) {
    const dollars = (amount / 100).toFixed(2)
    return `${currency} ${dollars}`
  }
}
```

```js
// tests/unit/helpers/format-currency.test.js
const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.formatCurrency()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('formats cents to dollar string', async () => {
    const result = await sails.helpers.formatCurrency(1999)
    assert.equal(result, 'USD 19.99')
  })

  it('uses custom currency code', async () => {
    const result = await sails.helpers.formatCurrency(500, 'EUR')
    assert.equal(result, 'EUR 5.00')
  })

  it('handles zero amount', async () => {
    const result = await sails.helpers.formatCurrency(0)
    assert.equal(result, 'USD 0.00')
  })

  it('handles negative amounts', async () => {
    const result = await sails.helpers.formatCurrency(-1500)
    assert.equal(result, 'USD -15.00')
  })
})
```

### Testing Helper Errors

When a helper throws an error through a named exit, test it with `assert.rejects`:

```js
// api/helpers/divide.js
module.exports = {
  friendlyName: 'Divide',
  inputs: {
    dividend: { type: 'number', required: true },
    divisor: { type: 'number', required: true }
  },
  exits: {
    divisionByZero: { description: 'Cannot divide by zero.' }
  },
  fn: async function ({ dividend, divisor }) {
    if (divisor === 0) {
      throw 'divisionByZero'
    }
    return dividend / divisor
  }
}
```

```js
// tests/unit/helpers/divide.test.js
const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.divide()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('divides two numbers', async () => {
    const result = await sails.helpers.divide(10, 2)
    assert.equal(result, 5)
  })

  it('throws divisionByZero for zero divisor', async () => {
    await assert.rejects(
      async () => sails.helpers.divide(10, 0),
      (err) => {
        assert.equal(err.code, 'divisionByZero')
        return true
      }
    )
  })
})
```

### Testing Helpers with intercept/tolerate

When calling code uses `.intercept()` or `.tolerate()`, you can test the raw exit from the helper:

```js
describe('sails.helpers.findUser()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('returns null when tolerating notFound', async () => {
    const user = await sails.helpers.findUser
      .with({ email: 'nonexistent@example.com' })
      .tolerate('notFound', () => null)

    assert.equal(user, null)
  })
})
```

### Testing Helpers with Complex Inputs

```js
// api/helpers/calculate-password-strength.js
module.exports = {
  friendlyName: 'Calculate password strength',
  inputs: {
    password: { type: 'string', required: true }
  },
  fn: async function ({ password }) {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }
}
```

```js
// tests/unit/helpers/calculate-password-strength.test.js
const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.calculatePasswordStrength()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('returns 0 for short simple password', async () => {
    const score = await sails.helpers.calculatePasswordStrength('abc')
    assert.equal(score, 0)
  })

  it('returns 1 for password with 8+ chars', async () => {
    const score = await sails.helpers.calculatePasswordStrength('abcdefgh')
    assert.equal(score, 1)
  })

  it('returns 3 for 12+ chars with uppercase', async () => {
    const score = await sails.helpers.calculatePasswordStrength('abcdefghijkL')
    assert.equal(score, 3) // length>=8, length>=12, uppercase
  })

  it('returns 5 for maximum strength', async () => {
    const score = await sails.helpers.calculatePasswordStrength('Abcdefghijk1!')
    assert.equal(score, 5)
  })
})
```

## The node:assert/strict Module

`node:assert/strict` provides assertion functions that throw `AssertionError` on failure. The `strict` variant uses strict equality (`===`) by default.

### Core Assertions

```js
const assert = require('node:assert/strict')

// Equality
assert.equal(actual, expected) // actual === expected
assert.notEqual(actual, expected) // actual !== expected

// Deep equality (objects, arrays)
assert.deepEqual(actual, expected) // Deep strict comparison
assert.notDeepEqual(actual, expected) // Deep strict not-equal

// Truthiness
assert.ok(value) // value is truthy
assert.ok(!value) // value is falsy (alternative to assert.fail)

// Type and instance
assert.equal(typeof result, 'string') // Type check
assert.ok(result instanceof Date) // Instance check

// Throws (sync functions)
assert.throws(
  () => {
    throw new Error('boom')
  },
  { message: 'boom' }
)
assert.doesNotThrow(() => safeFunction())

// Rejects (async functions / promises)
await assert.rejects(
  async () => {
    throw new Error('async boom')
  },
  { message: 'async boom' }
)
await assert.doesNotReject(async () => safeAsyncFunction())

// String matching with regex
assert.match('hello world', /world/) // String matches regex
assert.doesNotMatch('hello', /world/) // String does not match regex
```

### Deep Equality for Objects

```js
it('returns user profile object', async () => {
  const profile = await sails.helpers.buildProfile('Kelvin Omereshone')

  assert.deepEqual(profile, {
    firstName: 'Kelvin',
    lastName: 'Omereshone',
    displayName: 'Kelvin Omereshone',
    initials: 'KO'
  })
})
```

### Partial Object Matching

`assert.deepEqual` requires an exact match. For partial matching, check individual properties:

```js
it('includes expected fields in result', async () => {
  const result = await sails.helpers.enrichUser({ id: 1, name: 'Ada' })

  // Check specific properties without requiring exact match
  assert.equal(result.name, 'Ada')
  assert.ok(result.enrichedAt instanceof Date)
  assert.equal(typeof result.score, 'number')
})
```

### Testing Arrays

```js
it('returns sorted list of tags', async () => {
  const tags = await sails.helpers.sortTags(['beta', 'alpha', 'gamma'])

  assert.deepEqual(tags, ['alpha', 'beta', 'gamma'])
})

it('filters active items', async () => {
  const items = await sails.helpers.filterActive([
    { name: 'a', active: true },
    { name: 'b', active: false },
    { name: 'c', active: true }
  ])

  assert.equal(items.length, 2)
  assert.equal(items[0].name, 'a')
  assert.equal(items[1].name, 'c')
})
```

## Testing with the Database

When helpers or other code depend on models, you need the ORM hook enabled and proper test isolation.

### Setup for Database Tests

```js
// tests/unit/helpers/find-or-create-user.test.js
const { describe, it, before, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { getSailsWithOrm } = require('../../util/get-sails-with-orm')

describe('sails.helpers.findOrCreateUser()', () => {
  let sails

  before(async () => {
    sails = await getSailsWithOrm()
  })

  beforeEach(async () => {
    // Clear the User table before each test for isolation
    await User.destroy({})
  })

  it('creates a new user when one does not exist', async () => {
    const user = await sails.helpers.findOrCreateUser({
      email: 'new@example.com',
      name: 'New User'
    })

    assert.ok(user.id)
    assert.equal(user.email, 'new@example.com')

    const count = await User.count({ email: 'new@example.com' })
    assert.equal(count, 1)
  })

  it('returns existing user when email already exists', async () => {
    // Seed a user
    await User.create({ email: 'existing@example.com', name: 'Existing' })

    const user = await sails.helpers.findOrCreateUser({
      email: 'existing@example.com',
      name: 'Existing'
    })

    assert.equal(user.email, 'existing@example.com')

    const count = await User.count({ email: 'existing@example.com' })
    assert.equal(count, 1) // Still just one record
  })
})
```

### Database Strategy

The test environment uses `sails-disk` with `migrate: 'drop'`:

- **sails-disk**: In-memory database adapter -- no external database required
- **migrate: 'drop'**: Recreates all tables when Sails loads, ensuring a clean schema

Combined with `beforeEach` cleanup, this gives each test a predictable starting state. See [test-configuration](test-configuration.md) for full environment details.

## Testing Lifecycle Callbacks

Model lifecycle callbacks (like `beforeCreate`, `afterUpdate`) run automatically during model operations. Test them through the model operations themselves:

```js
// api/models/User.js
module.exports = {
  attributes: {
    email: { type: 'string', required: true },
    emailNormalized: { type: 'string' }
  },
  beforeCreate: async function (values, proceed) {
    values.emailNormalized = values.email.toLowerCase().trim()
    return proceed()
  }
}
```

```js
// tests/unit/helpers/user-lifecycle.test.js
const { describe, it, before, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { getSailsWithOrm } = require('../../util/get-sails-with-orm')

describe('User lifecycle callbacks', () => {
  let sails

  before(async () => {
    sails = await getSailsWithOrm()
  })

  beforeEach(async () => {
    await User.destroy({})
  })

  it('normalizes email on create via beforeCreate callback', async () => {
    const user = await User.create({
      email: '  Alice@Example.COM  '
    }).fetch()

    assert.equal(user.emailNormalized, 'alice@example.com')
  })
})
```

## Complete Unit Test File Example

Here is a full, realistic test file that demonstrates all patterns together:

```js
// tests/unit/helpers/slugify.test.js
const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.slugify()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  describe('basic slugification', () => {
    it('converts spaces to hyphens', async () => {
      const slug = await sails.helpers.slugify('hello world')
      assert.equal(slug, 'hello-world')
    })

    it('converts to lowercase', async () => {
      const slug = await sails.helpers.slugify('Hello World')
      assert.equal(slug, 'hello-world')
    })

    it('removes special characters', async () => {
      const slug = await sails.helpers.slugify('hello! @world#')
      assert.equal(slug, 'hello-world')
    })

    it('collapses multiple hyphens', async () => {
      const slug = await sails.helpers.slugify('hello   world')
      assert.equal(slug, 'hello-world')
    })

    it('trims leading and trailing hyphens', async () => {
      const slug = await sails.helpers.slugify(' hello world ')
      assert.equal(slug, 'hello-world')
    })
  })

  describe('edge cases', () => {
    it('handles empty string', async () => {
      const slug = await sails.helpers.slugify('')
      assert.equal(slug, '')
    })

    it('handles string with only special characters', async () => {
      const slug = await sails.helpers.slugify('!@#$%')
      assert.equal(slug, '')
    })

    it('handles numbers', async () => {
      const slug = await sails.helpers.slugify('Chapter 1 Introduction')
      assert.equal(slug, 'chapter-1-introduction')
    })

    it('handles unicode characters', async () => {
      const slug = await sails.helpers.slugify('cafe resume')
      assert.equal(slug, 'cafe-resume')
    })
  })
})
```

## Test Output

When running with `node --test`, the output uses TAP (Test Anything Protocol) format:

```
$ npm run test:unit

> test:unit
> node --test --test-concurrency=1 tests/unit/**/*.test.js

▶ sails.helpers.slugify()
  ▶ basic slugification
    ✔ converts spaces to hyphens (0.523ms)
    ✔ converts to lowercase (0.109ms)
    ✔ removes special characters (0.087ms)
    ✔ collapses multiple hyphens (0.079ms)
    ✔ trims leading and trailing hyphens (0.083ms)
  ▶ basic slugification (1.021ms)

  ▶ edge cases
    ✔ handles empty string (0.082ms)
    ✔ handles string with only special characters (0.076ms)
    ✔ handles numbers (0.088ms)
    ✔ handles unicode characters (0.079ms)
  ▶ edge cases (0.433ms)
▶ sails.helpers.slugify() (1.602ms)

ℹ tests 9
ℹ suites 3
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ duration_ms 312
```
