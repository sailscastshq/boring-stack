---
name: getting-started
description: Core concepts, model definition basics, datastore configuration, and project setup for Waterline ORM
metadata:
  tags: setup, models, datastores, config, basics
---

# Getting Started with Waterline

## What is Waterline?

Waterline is a datastore-agnostic ORM that provides a uniform API for accessing any supported database. Your application code stays the same regardless of whether you use PostgreSQL, MySQL, MongoDB, SQLite, or Redis.

## Model Definition

Models live in `api/models/` and represent database tables (SQL) or collections (NoSQL). Each file exports a plain object:

```js
// api/models/User.js
module.exports = {
  attributes: {
    fullName: {
      type: 'string',
      required: true,
      maxLength: 120,
      columnName: 'full_name'
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200
    },
    password: {
      type: 'string',
      protect: true,
      minLength: 8
    },
    emailStatus: {
      type: 'string',
      isIn: ['unverified', 'verified', 'change-requested'],
      defaultsTo: 'unverified',
      columnName: 'email_status'
    }
  }
}
```

## Global Model Configuration

Default settings for all models are defined in `config/models.js`:

```js
// config/models.js
module.exports.models = {
  schema: true,
  migrate: 'alter',
  attributes: {
    createdAt: {
      type: 'number',
      autoCreatedAt: true,
      columnName: 'created_at'
    },
    updatedAt: {
      type: 'number',
      autoUpdatedAt: true,
      columnName: 'updated_at'
    },
    id: { type: 'number', autoIncrement: true }
  },
  dataEncryptionKeys: {
    default: 'your-DEK-here'
  },
  cascadeOnDestroy: true
}
```

Key settings:

- **`schema: true`** -- Strict schema mode. Extraneous keys in `.create()` / `.update()` are silently ignored.
- **`migrate: 'alter'`** -- Auto-migrate in development. Use `'safe'` in production.
- **`cascadeOnDestroy: true`** -- Automatically destroy associated child records on delete.

## Default Attributes

Every model automatically gets these three attributes (configurable in `config/models.js`):

- **`id`** -- Auto-incrementing primary key
- **`createdAt`** -- Epoch millisecond timestamp, set on creation
- **`updatedAt`** -- Epoch millisecond timestamp, updated on every save

## Datastore Configuration

Datastores are configured in `config/datastores.js`:

```js
// config/datastores.js
module.exports.datastores = {
  default: {
    adapter: 'sails-sqlite',
    url: './db/local.db'
  },
  content: {
    adapter: 'sails-content'
  }
}
```

Common adapters:

- `sails-sqlite` -- SQLite (default in Boring Stack ascent templates)
- `sails-postgresql` -- PostgreSQL
- `sails-mysql` -- MySQL / MariaDB
- `sails-mongo` -- MongoDB
- `sails-disk` -- File-based (default if no adapter specified, for development)
- `sails-redis` -- Redis (key/value store)
- `sails-content` -- Markdown content files

## Per-Model Datastore Override

A model can use a different datastore than the default:

```js
// api/models/Blog.js
module.exports = {
  datastore: 'content',
  attributes: {
    slug: { type: 'string', unique: true },
    title: { type: 'string', required: true },
    content: { type: 'string', required: true }
  }
}
```

## Table and Column Naming

Use `tableName` on the model and `columnName` on attributes to map camelCase JavaScript to snake_case database columns:

```js
module.exports = {
  tableName: 'users',
  attributes: {
    fullName: { type: 'string', columnName: 'full_name' },
    emailStatus: { type: 'string', columnName: 'email_status' },
    passwordResetToken: { type: 'string', columnName: 'password_reset_token' }
  }
}
```

## Global Model Access

Models are available as globals -- no `require()` needed:

```js
// In any controller, helper, or action:
const user = await User.findOne({ email: 'test@example.com' })
const count = await Invoice.count({ status: 'paid' })
```

If globals are disabled, access via `sails.models.user`.

## .sailsrc

The `.sailsrc` file configures Sails project settings:

```json
{
  "hooks": {
    "grunt": false
  },
  "generators": {
    "modules": {
      "page": "create-sails-generator/generators/page"
    }
  }
}
```

## Migration Strategies

- **`alter`** -- Auto-migrate columns on lift (development only). Attempts to preserve data.
- **`drop`** -- Drop and recreate all tables on lift (loses data).
- **`safe`** -- Never auto-migrate. You manage schema changes manually (production).
