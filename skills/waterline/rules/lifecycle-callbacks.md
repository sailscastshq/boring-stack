---
name: lifecycle-callbacks
description: Waterline lifecycle callbacks - beforeCreate, beforeUpdate, afterCreate, customToJSON, custom model methods
metadata:
  tags: lifecycle, callbacks, beforeCreate, beforeUpdate, customToJSON, hooks
---

# Lifecycle Callbacks

Lifecycle callbacks are functions defined on a model that run automatically at certain points during query execution.

## Available Callbacks

| Callback         | Runs When                          |
| ---------------- | ---------------------------------- |
| `beforeValidate` | Before validation on create/update |
| `afterValidate`  | After validation passes            |
| `beforeCreate`   | Before a new record is inserted    |
| `afterCreate`    | After a new record is inserted     |
| `beforeUpdate`   | Before a record is modified        |
| `afterUpdate`    | After a record is modified         |
| `beforeDestroy`  | Before a record is deleted         |
| `afterDestroy`   | After a record is deleted          |
| `beforeFind`     | Before a find query executes       |
| `afterFind`      | After find results are returned    |
| `beforeFindOne`  | Before a findOne query executes    |
| `afterFindOne`   | After findOne result is returned   |

## Callback Signature

All callbacks receive `(valuesToSet, proceed)` for create/update, or `(criteria, proceed)` for find/destroy. You **must** call `proceed()` when done:

```js
beforeCreate: async function (valuesToSet, proceed) {
  // Do work here
  return proceed()
}
```

To abort with an error:

```js
beforeCreate: async function (valuesToSet, proceed) {
  const existing = await Environment.findOne({ project: valuesToSet.project, slug: valuesToSet.slug })
  if (existing) {
    return proceed(new Error('Environment already exists in this project'))
  }
  return proceed()
}
```

## beforeCreate -- Password Hashing + Computed Fields

The most common callback pattern. Hash passwords, generate IDs, compute derived values:

```js
// api/models/User.js
module.exports = {
  attributes: {
    /* ... */
  },

  beforeCreate: async function (valuesToSet, proceed) {
    // Generate initials from full name
    valuesToSet.initials = sails.helpers.getUserInitials(valuesToSet.fullName)

    // Hash password
    if (valuesToSet.password) {
      valuesToSet.password = await sails.helpers.passwords.hashPassword(
        valuesToSet.password
      )
    }

    return proceed()
  }
}
```

## beforeCreate -- Generate Public IDs

```js
// api/models/Invoice.js
module.exports = {
  attributes: {
    /* ... */
  },

  beforeCreate: async function (valuesToSet, proceed) {
    valuesToSet.publicId = sails.helpers.generateId()
    return proceed()
  }
}
```

## beforeCreate -- Slug Generation

```js
// api/models/Project.js
module.exports = {
  attributes: {
    /* ... */
  },

  beforeCreate: async function (values, proceed) {
    if (!values.slug && values.name) {
      values.slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    return proceed()
  }
}
```

## beforeCreate -- Price Computation

```js
// api/models/Course.js
module.exports = {
  attributes: {
    /* ... */
  },

  beforeCreate: async function (valuesToSet, proceed) {
    valuesToSet.price = sails.helpers.convertAmountToCent(valuesToSet.price)
    valuesToSet.discount = sails.helpers.convertAmountToCent(
      valuesToSet.discount
    )
    valuesToSet.amount = valuesToSet.price - valuesToSet.discount
    valuesToSet.slug = sails.helpers.getSlug(valuesToSet.title)
    return proceed()
  }
}
```

## beforeCreate -- Expiration Timestamps

```js
// api/models/Onboarding.js
beforeCreate: async function (valuesToSet, proceed) {
  valuesToSet.publicId = sails.helpers.generateId()
  valuesToSet.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000  // 30 days
  return proceed()
}
```

## beforeCreate -- Conditional Timestamps

```js
// api/models/Membership.js
beforeCreate: async function (valuesToSet, proceed) {
  if (valuesToSet.role === 'owner' || valuesToSet.status === 'active') {
    valuesToSet.joinedAt = Date.now()
  }
  if (valuesToSet.status === 'invited' && !valuesToSet.invitedAt) {
    valuesToSet.invitedAt = Date.now()
  }
  return proceed()
}
```

## beforeCreate -- Generate Invite Token

```js
// api/models/Team.js
beforeCreate: async function (valuesToSet, proceed) {
  if (!valuesToSet.inviteToken) {
    valuesToSet.inviteToken = await sails.helpers.strings.random('url-friendly')
  }
  return proceed()
}
```

## beforeUpdate -- Re-hash Password on Change

```js
// api/models/User.js
beforeUpdate: async function (valuesToSet, proceed) {
  if (valuesToSet.password) {
    valuesToSet.password = await sails.helpers.passwords.hashPassword(valuesToSet.password)
  }
  return proceed()
}
```

## beforeUpdate -- Recompute Slug

```js
// api/models/Voyage.js
beforeUpdate: async function (valuesToSet, proceed) {
  if (valuesToSet.title) {
    valuesToSet.slug = sails.helpers.getSlug(valuesToSet.title)
  }
  return proceed()
}
```

## customToJSON -- Custom Serialization

Not a lifecycle callback per se, but a model method that controls how records are serialized to JSON. Use it to strip sensitive fields:

```js
// api/models/User.js
module.exports = {
  attributes: {
    /* ... */
  },

  customToJSON: function () {
    return Object.keys(this).reduce((result, key) => {
      if (
        ![
          'password',
          'passwordResetTokenExpiresAt',
          'emailProofToken',
          'emailProofTokenExpiresAt',
          'googleIdToken',
          'googleAccessToken'
        ].includes(key)
      ) {
        result[key] = this[key]
      }
      return result
    }, {})
  }
}
```

## Custom Model Methods

Define reusable methods directly on the model:

```js
// api/models/App.js
module.exports = {
  attributes: {
    /* ... */
  },

  generateContainerName: async function (environmentId) {
    const env = await Environment.findOne({ id: environmentId }).populate(
      'project'
    )
    if (!env) return null
    return `slipway-${env.project.slug}-${env.slug}`
  }
}

// api/models/Deployment.js
module.exports = {
  attributes: {
    /* ... */
  },

  appendBuildLog: async function (deploymentId, log) {
    const deployment = await Deployment.findOne({ id: deploymentId })
    if (!deployment) return
    const currentLogs = deployment.buildLogs || ''
    await Deployment.updateOne({ id: deploymentId }).set({
      buildLogs: currentLogs + log
    })
  },

  getDuration: function (deployment) {
    if (!deployment.startedAt) return null
    const end = deployment.finishedAt || Date.now()
    return Math.round((end - deployment.startedAt) / 1000)
  }
}

// Usage:
const containerName = await App.generateContainerName(envId)
await Deployment.appendBuildLog(deploymentId, 'Building...\n')
const seconds = Deployment.getDuration(deployment)
```

## Accessing Model Attributes Metadata

You can read attribute definitions programmatically:

```js
// In a helper -- strip protected attributes
for (let [attrName, attrDef] of Object.entries(User.attributes)) {
  if (attrDef.protect) {
    delete user[attrName]
  }
}
```
