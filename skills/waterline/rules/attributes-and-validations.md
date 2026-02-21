---
name: attributes-and-validations
description: Waterline attribute types, validation rules, column mapping, protect, encrypt, defaultsTo, allowNull
metadata:
  tags: attributes, types, validations, columnName, protect, encrypt, required, unique
---

# Attributes and Validations

## Supported Data Types

| Type        | Description                                                | Example          |
| ----------- | ---------------------------------------------------------- | ---------------- |
| `'string'`  | Text data                                                  | `'hello world'`  |
| `'number'`  | Numeric values                                             | `42`, `3.14`     |
| `'boolean'` | True/false                                                 | `true`           |
| `'json'`    | Any JSON-serializable value (objects, arrays, nested data) | `{ x: 1, y: 2 }` |
| `'ref'`     | Any JavaScript value (Date objects, Buffers, etc.)         | `new Date()`     |

## Core Attribute Properties

```js
module.exports = {
  attributes: {
    email: {
      type: 'string', // Data type (required for non-association attrs)
      required: true, // Cannot be null/empty on create
      unique: true, // Database-level uniqueness constraint
      defaultsTo: 'unknown', // Default value when key is omitted
      allowNull: true, // Permits null (string/number/boolean reject null by default)
      columnName: 'email_address', // Map to specific DB column
      columnType: 'text', // Physical DB column type (e.g., 'float', 'text', 'bytea')
      encrypt: true, // Auto-encrypt at rest (requires dataEncryptionKeys config)
      autoIncrement: true, // Auto-generate sequential values
      protect: true // Exclude from default serialization (toJSON)
    }
  }
}
```

## Validation Rules

Sails validates during `.create()` and `.update()`. All validations (except `unique`) run in JavaScript, not the database.

```js
module.exports = {
  attributes: {
    // String validations
    fullName: {
      type: 'string',
      required: true,
      maxLength: 120,
      minLength: 2
    },

    // Email validation
    email: {
      type: 'string',
      isEmail: true,
      maxLength: 200
    },

    // Enum constraint
    emailStatus: {
      type: 'string',
      isIn: ['unverified', 'verified', 'change-requested'],
      defaultsTo: 'unverified'
    },

    // Numeric validations
    starRating: {
      type: 'number',
      min: 1,
      max: 5,
      required: true
    },

    // URL validation
    websiteUrl: {
      type: 'string',
      isURL: true
    },

    // IP address
    tosAcceptedByIp: {
      type: 'string',
      isIP: true
    },

    // UUID
    externalId: {
      type: 'string',
      isUUID: true
    },

    // Regex pattern
    slug: {
      type: 'string',
      unique: true,
      regex: /^[a-z0-9-]+$/
    },

    // Custom validation function
    numHostsEnrolled: {
      type: 'number',
      min: 0,
      custom: (num) => Math.floor(num) === num // Must be integer
    },

    // Custom validation for complex types
    location: {
      type: 'json',
      custom: function (value) {
        return (
          _.isObject(value) &&
          _.isNumber(value.x) &&
          _.isNumber(value.y) &&
          value.x !== Infinity &&
          value.x !== -Infinity
        )
      }
    },

    // Password with custom strength check
    password: {
      type: 'string',
      protect: true,
      minLength: 8,
      custom: function (value) {
        return (
          _.isString(value) &&
          value.length >= 6 &&
          value.match(/[a-z]/i) &&
          value.match(/[0-9]/)
        )
      }
    }
  }
}
```

## Complete Validation Rules Reference

| Rule               | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `custom`           | Custom function returning `true`/`false` |
| `isAfter`          | Date must be after specified date        |
| `isBefore`         | Date must be before specified date       |
| `isBoolean`        | Must be `true` or `false`                |
| `isCreditCard`     | Valid credit card number format          |
| `isEmail`          | Valid email address format               |
| `isHexColor`       | Valid hexadecimal color                  |
| `isIn`             | Value must be in the specified array     |
| `isInteger`        | Must be a whole number                   |
| `isIP`             | Valid IPv4 or IPv6 address               |
| `isNotEmptyString` | Must not be an empty string              |
| `isNotIn`          | Value must NOT be in the array           |
| `isNumber`         | Must be a JavaScript number type         |
| `isString`         | Must be a JavaScript string type         |
| `isURL`            | Valid URL format                         |
| `isUUID`           | Valid UUID (v3, v4, or v5)               |
| `max`              | Number must be <= configured value       |
| `min`              | Number must be >= configured value       |
| `maxLength`        | String character limit                   |
| `minLength`        | Minimum string length                    |
| `regex`            | Must match the regular expression        |

## The `unique` Constraint

Unlike other validations, `unique` is a **database-level constraint**. In development (`migrate: 'alter'`), it is added automatically. In production (`migrate: 'safe'`), you must manage constraints manually.

## Documentation Properties

These are metadata for documentation/tooling and have no runtime effect:

```js
emailAddress: {
  type: 'string',
  description: 'The user\'s email address.',
  extendedDescription: 'Users might be created as unverified or verified...',
  moreInfoUrl: 'https://example.com/docs',
  example: 'mary.sue@example.com'
}
```

## protect: true

Prevents the attribute from appearing in serialized output (`.toJSON()`). Use for passwords, tokens, and internal secrets:

```js
password: { type: 'string', protect: true }
stripeCustomerId: { type: 'string', protect: true }
```

## encrypt: true

Auto-encrypts the attribute at rest. Requires `dataEncryptionKeys` in `config/models.js`. Use `.decrypt()` in queries to retrieve plaintext:

```js
ssn: { type: 'string', encrypt: true }

// Querying encrypted data
var user = await User.findOne({ id: 1 }).decrypt()
```

You cannot query by unencrypted values on encrypted fields.

## ref Type for Dates and Binary

```js
// JavaScript Date objects
startDate: { type: 'ref' }
lastUsedAt: { type: 'ref' }

// Binary data
avatar: { type: 'ref', columnType: 'bytea' }     // PostgreSQL
avatar: { type: 'ref', columnType: 'mediumblob' } // MySQL
```

## JSON Type for Complex Data

```js
settings: { type: 'json', defaultsTo: {} }
envVars: { type: 'json', defaultsTo: [] }
prices: { type: 'json' }
passkeys: { type: 'json' }
backupCodes: { type: 'json' }
domainRestrictions: { type: 'json', defaultsTo: [] }
```

## Disabling Inherited Attributes

A model can opt out of globally-defined attributes:

```js
module.exports = {
  attributes: {
    publicId: false // Disables the inherited publicId from config/models.js
  }
}
```

## Boring Stack Model Naming Rules

**These rules are mandatory for all models in a Boring Stack application.**

### 1. `tableName` must be plural snake_case

Every model MUST define an explicit `tableName` that is the pluralized, snake_case form of the model name:

```js
// api/models/DeployToken.js
module.exports = {
  tableName: 'deploy_tokens', // Required: plural snake_case
  attributes: { ... }
}
```

| Model Name        | `tableName`           |
| ----------------- | --------------------- |
| `User`            | `'users'`             |
| `App`             | `'apps'`              |
| `DeployToken`     | `'deploy_tokens'`     |
| `GitProvider`     | `'git_providers'`     |
| `GitRepository`   | `'git_repositories'`  |
| `AuditLog`        | `'audit_logs'`        |
| `ContainerMetric` | `'container_metrics'` |

### 2. camelCase attributes MUST have `columnName` in snake_case

Any attribute whose name is camelCase MUST include a `columnName` property mapping it to its snake_case equivalent. Attributes that are already single lowercase words (e.g. `name`, `slug`, `team`, `port`) do not need `columnName`.

```js
// CORRECT
fullName: {
  type: 'string',
  columnName: 'full_name',
  required: true
},
isActive: {
  type: 'boolean',
  columnName: 'is_active',
  defaultsTo: true
},
createdBy: {
  model: 'user',
  columnName: 'created_by'
}

// WRONG — missing columnName
fullName: {
  type: 'string',
  required: true
}
```

This applies to all attribute types including associations (`model:` references):

```js
fullName:                    { columnName: 'full_name' },
emailStatus:                 { columnName: 'email_status' },
passwordResetToken:          { columnName: 'password_reset_token' },
passwordResetTokenExpiresAt: { columnName: 'password_reset_token_expires_at' },
emailProofToken:             { columnName: 'email_proof_token' },
googleAccessToken:           { columnName: 'google_access_token' },
tosAcceptedByIp:             { columnName: 'tos_accepted_by_ip' },
lastUsedAt:                  { columnName: 'last_used_at' },
createdBy:                   { columnName: 'created_by' },
revokedBy:                   { columnName: 'revoked_by' }
```
