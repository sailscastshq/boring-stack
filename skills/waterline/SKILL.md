---
name: waterline
description: >
  Waterline ORM query language, model definitions, associations, and data access patterns for Sails.js.
  Use this skill when writing, reviewing, or debugging Waterline queries, model attributes, associations,
  lifecycle callbacks, validations, or any database interaction in a Sails.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: waterline, sails, orm, database, query, models
---

# Waterline ORM

Waterline is the datastore-agnostic ORM/ODM used by Sails.js. It provides a normalized API for interacting with any supported database (PostgreSQL, MySQL, MongoDB, SQLite, Redis) using a consistent query language.

## When to Use

Use this skill when:

- Defining Sails.js models (attributes, types, validations, associations)
- Writing Waterline queries (find, create, update, destroy, count, etc.)
- Using criteria objects with operators (`contains`, `startsWith`, `in`, `nin`, `<`, `>`, `!=`, `or`, `and`)
- Setting up associations (one-to-one, one-to-many, many-to-many)
- Handling query errors (`.intercept()`, `.tolerate()`, `E_UNIQUE`)
- Working with transactions, streaming, aggregation, or collection manipulation
- Configuring datastores and model settings

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - Core concepts, model definition, datastores, configuration
- [rules/query-language.md](rules/query-language.md) - WHERE operators, criteria modifiers, or/and, sort, limit, skip, select, omit
- [rules/model-methods.md](rules/model-methods.md) - find, findOne, findOrCreate, create, update, destroy, and their variants
- [rules/associations.md](rules/associations.md) - one-to-one, one-to-many, many-to-many, populate, cross-datastore
- [rules/attributes-and-validations.md](rules/attributes-and-validations.md) - Types, validation rules, columnName, protect, encrypt, defaultsTo
- [rules/lifecycle-callbacks.md](rules/lifecycle-callbacks.md) - beforeCreate, beforeUpdate, afterCreate, customToJSON
- [rules/error-handling.md](rules/error-handling.md) - .intercept(), .tolerate(), E_UNIQUE, UsageError, AdapterError
- [rules/transactions.md](rules/transactions.md) - getDatastore().transaction(), .usingConnection(), leased connections
- [rules/aggregation-and-streaming.md](rules/aggregation-and-streaming.md) - count, sum, avg, stream, eachRecord, eachBatch
- [rules/collections-and-advanced.md](rules/collections-and-advanced.md) - addToCollection, removeFromCollection, replaceCollection, archive, native, meta
