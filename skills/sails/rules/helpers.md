---
name: helpers
description: Sails.js helpers - reusable functions with inputs, exits, sync/async patterns, error handling
metadata:
  tags: helpers, reusable, inputs, exits, sync, async, intercept, tolerate
---

# Helpers

Helpers are reusable functions that follow the same machine specification as actions. They live in `api/helpers/` and are automatically loaded as `sails.helpers.*`.

## Basic Helper

```js
// api/helpers/format-currency.js
module.exports = {
  friendlyName: 'Format currency',
  description: 'Format a cent amount as a human-readable currency string.',

  inputs: {
    amount: {
      type: 'number',
      required: true,
      description: 'Amount in cents.'
    },
    currency: {
      type: 'string',
      defaultsTo: 'USD'
    }
  },

  fn: async function ({ amount, currency }) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount / 100)
  }
}
```

### Calling Helpers

```js
// Named arguments (recommended)
const formatted = await sails.helpers.formatCurrency.with({
  amount: 1999,
  currency: 'USD'
})

// Positional arguments (for single-input helpers)
const formatted = await sails.helpers.formatCurrency(1999)
```

## Subdirectory Organization

Helpers in subdirectories are namespaced:

```
api/helpers/
├── format-currency.js        → sails.helpers.formatCurrency()
├── passwords/
│   ├── hash-password.js      → sails.helpers.passwords.hashPassword()
│   └── check-password.js     → sails.helpers.passwords.checkPassword()
├── billing/
│   ├── create-customer.js    → sails.helpers.billing.createCustomer()
│   └── handle-invoice-paid.js → sails.helpers.billing.handleInvoicePaid()
└── mail/
    ├── send-template.js      → sails.helpers.mail.sendTemplate()
    └── send.js               → sails.helpers.mail.send()
```

Generate helpers:

```bash
npx sails generate helper passwords/hash-password
npx sails generate helper billing/create-customer
```

## Helpers with Multiple Exits

```js
// api/helpers/passwords/check-password.js
module.exports = {
  friendlyName: 'Check password',
  description: 'Check if a password matches a hashed password.',

  inputs: {
    password: {
      type: 'string',
      required: true
    },
    hashedPassword: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Password matches.'
    },
    incorrect: {
      description: 'The provided password does not match.'
    }
  },

  fn: async function ({ password, hashedPassword }) {
    const bcrypt = require('bcrypt')
    const isMatch = await bcrypt.compare(password, hashedPassword)
    if (!isMatch) {
      throw 'incorrect'
    }
  }
}
```

## Synchronous Helpers

For simple computations that don't need async:

```js
// api/helpers/get-gravatar-url.js
module.exports = {
  sync: true,

  inputs: {
    email: { type: 'string', required: true }
  },

  fn: function ({ email }) {
    const crypto = require('crypto')
    const hash = crypto
      .createHash('md5')
      .update(email.toLowerCase().trim())
      .digest('hex')
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`
  }
}
```

Synchronous helpers can be called without `await`:

```js
const url = sails.helpers.getGravatarUrl('user@example.com')
```

## Passing `req` to Helpers

When a helper needs request context, pass `req` as a `ref` input:

```js
// api/helpers/get-current-user.js
module.exports = {
  inputs: {
    req: {
      type: 'ref',
      required: true
    }
  },

  fn: async function ({ req }) {
    if (!req.session.userId) return null
    return await User.findOne({ id: req.session.userId })
  }
}
```

```js
// In an action:
const user = await sails.helpers.getCurrentUser(this.req)
```

## Error Handling with Helpers

### `.intercept()` -- Map Exits

Map a helper's exit to a different exit in the calling action:

```js
// In an action:
await sails.helpers.passwords.checkPassword
  .with({ password, hashedPassword: user.password })
  .intercept('incorrect', () => ({
    badLoginRequest: {
      problems: [{ login: 'Wrong email/password combination.' }]
    }
  }))
```

### `.tolerate()` -- Handle Exits Gracefully

Tolerate a specific exit and continue execution:

```js
// Tolerate and return undefined
await sails.helpers.stripe
  .deleteCustomer(customerId)
  .tolerate('customerNotFound')

// Tolerate with a fallback value
const customer = await sails.helpers.stripe
  .getCustomer(customerId)
  .tolerate('notFound', () => null)
```

### `.intercept()` with Error Transformation

```js
await sails.helpers.billing.chargeCard
  .with({ amount, customerId })
  .intercept('cardDeclined', (err) => {
    return new Error(
      'Your card was declined. Please update your payment method.'
    )
  })
  .intercept('insufficientFunds', () => ({
    badRequest: {
      problems: [{ payment: 'Insufficient funds.' }]
    }
  }))
```

## Common Helper Patterns

### Password Hashing

```js
// api/helpers/passwords/hash-password.js
module.exports = {
  inputs: {
    password: { type: 'string', required: true }
  },

  fn: async function ({ password }) {
    const bcrypt = require('bcrypt')
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  }
}
```

### Email Sending

```js
// api/helpers/mail/send-template.js
module.exports = {
  inputs: {
    to: { type: 'string', required: true, isEmail: true },
    subject: { type: 'string', required: true },
    template: { type: 'string', required: true },
    templateData: { type: 'json', defaultsTo: {} }
  },

  exits: {
    success: { description: 'Email sent.' }
  },

  fn: async function ({ to, subject, template, templateData }) {
    // Use your email service (Mailgun, SES, etc.)
    await sails.helpers.mail.send.with({
      to,
      subject,
      htmlContent: await sails.renderView(`emails/${template}`, templateData)
    })
  }
}
```

### File Upload Helper

```js
// api/helpers/upload-one.js
module.exports = {
  inputs: {
    file: { type: 'ref', required: true },
    maxBytes: { type: 'number', defaultsTo: 10 * 1024 * 1024 }
  },

  fn: async function ({ file, maxBytes }) {
    const uploads = await sails.upload(file, { maxBytes })
    if (uploads.length === 0) {
      throw new Error('No file uploaded.')
    }
    return uploads[0]
  }
}
```

### Generating Tokens

```js
// api/helpers/generate-token.js
module.exports = {
  sync: true,

  inputs: {
    length: { type: 'number', defaultsTo: 32 }
  },

  fn: function ({ length }) {
    const crypto = require('crypto')
    return crypto.randomBytes(length).toString('hex')
  }
}
```

## Helpers Calling Other Helpers

Helpers can call other helpers freely:

```js
// api/helpers/billing/create-subscription.js
module.exports = {
  inputs: {
    userId: { type: 'string', required: true },
    plan: { type: 'string', required: true }
  },

  fn: async function ({ userId, plan }) {
    const user = await User.findOne({ id: userId })

    // Create Stripe customer if needed
    if (!user.stripeCustomerId) {
      const customer = await sails.helpers.billing.createCustomer.with({
        email: user.email,
        name: user.fullName
      })
      await User.updateOne({ id: userId }).set({
        stripeCustomerId: customer.id
      })
    }

    // Create the subscription
    const subscription =
      await sails.helpers.billing.createStripeSubscription.with({
        customerId: user.stripeCustomerId,
        priceId: sails.config.custom.stripePrices[plan]
      })

    // Send confirmation email
    await sails.helpers.mail.sendTemplate.with({
      to: user.email,
      subject: 'Subscription Confirmed',
      template: 'subscription-confirmed',
      templateData: { user, plan }
    })

    return subscription
  }
}
```
