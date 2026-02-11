# Waterline Skills for Claude Code

Write Waterline ORM queries and Sails.js models just by prompting Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/waterline
```

## Usage

After installing, Claude will automatically apply Waterline best practices when you work on Sails.js projects:

> "Create a User model with email verification and password reset"

> "Write a query to find all active users created this year, sorted by name"

> "Set up a many-to-many association between Users and Courses"

## Skills Included

- **getting-started** - Core concepts, model definitions, datastores
- **query-language** - WHERE operators, criteria modifiers, sorting, pagination
- **model-methods** - find, findOne, create, update, destroy and variants
- **associations** - One-to-one, one-to-many, many-to-many, populate
- **attributes-and-validations** - Types, validation rules, column mapping
- **lifecycle-callbacks** - beforeCreate, beforeUpdate, customToJSON
- **error-handling** - .intercept(), .tolerate(), E_UNIQUE
- **transactions** - Database transactions with usingConnection
- **aggregation-and-streaming** - count, sum, avg, stream
- **collections-and-advanced** - Collection manipulation, archive, native queries

## What is Waterline?

[Waterline](https://github.com/balderdashy/waterline) is the ORM built into [Sails.js](https://sailsjs.com). It supports PostgreSQL, MySQL, MongoDB, SQLite, and Redis through swappable adapters.

## Links

- [Sails.js Documentation](https://sailsjs.com/documentation)
- [Waterline ORM Reference](https://sailsjs.com/documentation/reference/waterline-orm)
- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)

## License

MIT
