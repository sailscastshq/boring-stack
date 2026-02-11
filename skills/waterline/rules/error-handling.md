---
name: error-handling
description: Waterline error handling - .intercept(), .tolerate(), E_UNIQUE, UsageError, AdapterError
metadata:
  tags: errors, intercept, tolerate, E_UNIQUE, UsageError, AdapterError
---

# Error Handling

## Error Types

Waterline throws three types of errors:

| Error            | Code        | When                                                                         |
| ---------------- | ----------- | ---------------------------------------------------------------------------- |
| **UsageError**   | `E_USAGE`   | Invalid arguments, bad criteria, or `*One` methods matching multiple records |
| **AdapterError** | `E_ADAPTER` | Database-level failures (constraint violations, connection issues)           |
| **Error**        | (generic)   | Other unexpected failures                                                    |

The most common specific error code is **`E_UNIQUE`** -- thrown when a uniqueness constraint is violated.

## .intercept() -- Transform Errors

`.intercept()` catches specific errors and transforms them. Chain it on any query:

```js
// Map E_UNIQUE to a named exit
var newUser = await User.create({
  email: newEmailAddress,
  password: await sails.helpers.passwords.hashPassword(password)
})
  .intercept('E_UNIQUE', 'emailAlreadyInUse')
  .intercept({ name: 'UsageError' }, 'invalid')
  .fetch()
```

### Intercept Patterns

```js
// String code -> named exit
.intercept('E_UNIQUE', 'emailAlreadyInUse')

// Object filter -> named exit
.intercept({ name: 'UsageError' }, 'invalid')

// String code -> callback (transform the error)
.intercept('E_UNIQUE', () => {
  return { badRequest: { problems: [{ email: 'Email already taken.' }] } }
})

// Catch-all callback
.intercept((err) => {
  return new Error('Something went wrong: ' + err.message)
})

// On helpers -- intercept named exits
await sails.helpers.passwords.checkPassword(password, user.password)
  .intercept('incorrect', 'badCombo')
```

### Multiple Intercepts

```js
await AndroidEnterprise.create({ ... })
  .intercept({ status: 400 }, (err) => {
    return { invalidToken: 'The provided token is invalid or expired.' }
  })
  .intercept({ status: 401 }, (err) => {
    return { invalidToken: 'Authorization failed.' }
  })
  .intercept({ status: 403 }, (err) => {
    return { invalidToken: 'Access forbidden.' }
  })
  .intercept((err) => {
    return new Error('Unexpected error: ' + err.message)
  })
```

## .tolerate() -- Suppress Errors

`.tolerate()` catches specific errors and suppresses them silently. The query resolves with `undefined` instead of throwing:

```js
// Suppress E_UNIQUE for idempotent create
await NewsletterSubscription.create({ emailAddress }).tolerate('E_UNIQUE')

// Tolerate with a fallback value
var enrichment = await sails.helpers.iq.getEnriched
  .with({
    firstName,
    lastName,
    emailAddress
  })
  .tolerate((err) => {
    sails.log.warn('Enrichment failed, continuing without it.')
    return { employer: undefined, person: undefined }
  })

// Tolerate network errors on non-critical operations
await sails.helpers.http
  .post(sails.config.custom.slackWebhookUrl, {
    text: 'New signup!'
  })
  .tolerate((err) => {
    sails.log.warn('Slack notification failed:', err.message)
  })
```

## Try/Catch for E_UNIQUE

You can also handle errors with standard try/catch:

```js
try {
  var newUser = await User.create({
    email,
    password,
    fullName,
    emailProofToken,
    emailProofTokenExpiresAt:
      Date.now() + sails.config.custom.emailProofTokenTTL
  }).fetch()
} catch (error) {
  if (error.code === 'E_UNIQUE') {
    throw {
      badSignupRequest: {
        problems: [
          { email: 'An account with this email address already exists.' }
        ]
      }
    }
  } else if (error.name === 'UsageError') {
    throw {
      badSignupRequest: {
        problems: [{ signup: 'Something went wrong. Please try again.' }]
      }
    }
  }
  throw error
}
```

## E_UNIQUE Error Structure

When a uniqueness violation occurs, the error object contains:

```js
{
  name: 'AdapterError',
  code: 'E_UNIQUE',
  attrNames: ['email'],  // Which attribute(s) caused the violation
  raw: { /* original adapter error */ },
  toJSON: function() { /* serialization */ }
}
```

## E_VALIDATION Error (from .validate())

```js
try {
  User.validate('email', inputValue)
} catch (err) {
  if (err.code === 'E_VALIDATION') {
    err.all.forEach((woe) => {
      sails.log(woe.attrName + ': ' + woe.message)
    })
  }
}
```

## Pattern: Intercept on findOne

```js
var user = await User.findOne({ id: userId }).intercept('notFound', () => {
  delete this.req.session.userId
  return { unauthorized: '/login' }
})
```

## Pattern: Intercept on destroy

```js
await User.destroy({ id: userId }).intercept('error', (err) => {
  sails.log.error('Error deleting account:', err)
  throw 'error'
})
```

## Pattern: Intercept on helpers

```js
await sails.helpers.passwords
  .checkPassword(password, user.password)
  .intercept('incorrect', () => {
    delete this.req.session.userId
    return { unauthorized: '/login' }
  })
```

## When to Use .intercept() vs .tolerate() vs try/catch

- **`.intercept()`** -- When you want to transform an error into a different error or named exit. The query still fails, but with a controlled error.
- **`.tolerate()`** -- When you want to suppress the error entirely. The query resolves successfully (with `undefined` or a fallback). Use for non-critical operations.
- **`try/catch`** -- When you need full control over error handling logic, or need to inspect error properties like `.code` or `.attrNames`.
