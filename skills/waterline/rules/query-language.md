---
name: query-language
description: Waterline query language - WHERE operators, criteria modifiers, sorting, pagination, projections
metadata:
  tags: query, criteria, where, operators, sort, limit, skip, select, omit
---

# Waterline Query Language

## Criteria Object Structure

Queries accept a criteria object with an optional explicit `where` key alongside query options:

```js
// Explicit where
var results = await User.find({
  where: { name: 'mary', occupation: { contains: 'teacher' } },
  sort: [{ firstName: 'ASC' }, { lastName: 'ASC' }],
  limit: 10,
  skip: 20
})

// Shorthand (no where key) -- for simple equality
var results = await User.find({ name: 'mary' })
```

## Equality (Key Pairs)

Multiple keys at the same level are combined with AND:

```js
// name = 'walter' AND state = 'new mexico'
await User.find({ name: 'walter', state: 'new mexico' })
```

## Comparison Operators

```js
// Less than
await User.find({ age: { '<': 30 } })

// Less than or equal
await User.find({ age: { '<=': 20 } })

// Greater than
await User.find({ age: { '>': 18 } })

// Greater than or equal
await User.find({ createdAt: { '>=': new Date('2024-01-01') } })

// Not equal
await User.find({ status: { '!=': 'banned' } })

// Range (combine multiple operators on one attribute)
await User.find({ age: { '>=': 18, '<': 65 } })
```

## In / Not In

```js
// Value in array
await User.find({ emailStatus: { in: ['verified', 'confirmed'] } })

// Array shorthand (same as 'in')
await User.find({ emailStatus: ['verified', 'confirmed'] })

// Not in array
await User.find({ id: { nin: [1, 2, 3] } })

// Not equal with array (also means not-in)
await User.find({ name: { '!=': ['walter', 'skyler'] } })
```

## String Operators

```js
// Contains substring
await User.find({ email: { contains: '@example.com' } })

// Starts with
await User.find({ emailStatus: { startsWith: 'ver' } })

// Ends with
await User.find({ fullName: { endsWith: 'Doe' } })
```

Case-sensitivity of string operators depends on the database adapter.

## OR Clause

An array of criteria objects. A record matches if it satisfies **any** of them:

```js
await User.find({
  or: [
    { emailStatus: 'verified' },
    { emailStatus: 'confirmed' },
    { emailStatus: 'pending' }
  ]
})

// Combine OR with other criteria (AND)
await Screencast.findOne({
  or: [{ id: idOrSlug }, { slug: idOrSlug }],
  published: true
})
```

## AND Clause

Explicit AND (usually implicit via multiple keys):

```js
await User.find({
  where: {
    or: [{ emailStatus: 'verified' }, { emailStatus: 'confirmed' }],
    and: [{ createdAt: { '>=': new Date('2024-01-01') } }]
  }
})
```

## Deeply Nested Conditions

```js
await User.find({
  where: {
    or: [
      {
        and: [
          { emailStatus: 'verified' },
          { createdAt: { '>=': new Date('2024-01-01') } }
        ]
      },
      {
        and: [{ emailStatus: 'confirmed' }, { updatedAt: { '<=': new Date() } }]
      }
    ]
  }
})
```

## Sort

Multiple syntax forms:

```js
// String: ascending (default)
await User.find({ where: { active: true }, sort: 'name' })

// String: descending
await User.find({ where: { active: true }, sort: 'name DESC' })

// String: ascending (explicit)
await User.find({ where: { active: true }, sort: 'name ASC' })

// Chained method
await User.find({ active: true }).sort('createdAt DESC')

// Array of objects (multi-field sort)
await User.find().sort([{ fullName: 'ASC' }, { createdAt: 'DESC' }])
```

## Limit and Skip (Pagination)

```js
// In criteria object
await User.find({ where: { active: true }, limit: 10, skip: 20 })

// Chained methods
await User.find({ active: true }).limit(10).skip(20)

// Using .paginate(pageNumber, perPage) -- zero-indexed page number
await Invoice.find({ creator: userId, status: 'paid' })
  .sort('updatedAt DESC')
  .paginate(page, perPage)
```

## Select (Projection)

Include only specific attributes. The record `id` is always included regardless.

```js
// In criteria
await User.find({
  where: { emailStatus: 'verified' },
  select: ['id', 'email', 'fullName', 'createdAt']
})

// Chained method
await User.find({ emailStatus: 'verified' }).select([
  'fullName',
  'email',
  'emailStatus'
])
```

## Omit (Exclusion)

Exclude specific attributes:

```js
// In criteria
await User.find({
  emailStatus: 'confirmed',
  omit: ['password', 'emailProofToken', 'emailProofTokenExpiresAt']
})

// Chained method
await User.find({ id: { '>': 10 } })
  .omit(['password', 'updatedAt'])
  .limit(10)
```

## Complex Chained Query

All modifiers can be chained together:

```js
await User.find()
  .where({ emailStatus: { in: ['verified', 'confirmed'] } })
  .select(['id', 'email', 'fullName'])
  .sort('createdAt DESC')
  .limit(50)
  .skip(10)
```

## Quick Reference Table

| Operator        | Syntax                             | Meaning                |
| --------------- | ---------------------------------- | ---------------------- |
| `<`             | `{ age: { '<': 30 } }`             | Less than              |
| `<=`            | `{ age: { '<=': 20 } }`            | Less than or equal     |
| `>`             | `{ age: { '>': 18 } }`             | Greater than           |
| `>=`            | `{ age: { '>=': 21 } }`            | Greater than or equal  |
| `!=`            | `{ name: { '!=': 'foo' } }`        | Not equal              |
| `!=` (array)    | `{ name: { '!=': ['a','b'] } }`    | Not in array           |
| `in`            | `{ name: { in: ['a','b'] } }`      | Value in array         |
| `nin`           | `{ name: { nin: ['a','b'] } }`     | Value not in array     |
| `contains`      | `{ subject: { contains: 'x' } }`   | Substring match        |
| `startsWith`    | `{ subject: { startsWith: 'x' } }` | Starts with string     |
| `endsWith`      | `{ subject: { endsWith: 'x' } }`   | Ends with string       |
| `or`            | `{ or: [{a:1},{b:2}] }`            | Matches any condition  |
| `and`           | `{ and: [{a:1},{b:2}] }`           | Matches all conditions |
| Array shorthand | `{ name: ['a','b'] }`              | Same as `in`           |
