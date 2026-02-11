---
name: associations
description: Waterline associations - one-to-one, one-to-many, many-to-many, populate, cross-datastore
metadata:
  tags: associations, populate, model, collection, via, one-to-many, many-to-many
---

# Associations

Associations represent relationships between models. They are NOT automatically included in query results -- you must explicitly call `.populate()`.

## One-to-Many (Most Common)

One record ("the one") links to multiple records ("the many"). The "many" side holds the foreign key.

```js
// api/models/User.js -- the "one" side
module.exports = {
  attributes: {
    fullName: { type: 'string' },
    invoices: {
      collection: 'invoice',
      via: 'creator'
    }
  }
}

// api/models/Invoice.js -- the "many" side (holds the FK)
module.exports = {
  attributes: {
    invoiceNumber: { type: 'string' },
    totalAmount: { type: 'number' },
    creator: {
      model: 'user'
    }
  }
}
```

Create an associated record by passing the parent's primary key:

```js
await Invoice.create({
  invoiceNumber: 'INV-001',
  totalAmount: 5000,
  creator: userId // Just the ID value
})
```

## One-to-One

Use `model` on both sides. Add `unique: true` on the FK side to enforce one-to-one at the database level:

```js
// api/models/User.js
module.exports = {
  attributes: {
    name: { type: 'string' },
    pet: {
      collection: 'pet',
      via: 'owner'
    }
  }
}

// api/models/Pet.js
module.exports = {
  attributes: {
    name: { type: 'string' },
    owner: {
      model: 'user',
      unique: true // Enforces one-to-one
    }
  }
}
```

## Many-to-Many

Both sides use `collection` and `via`. Waterline automatically creates a junction table:

```js
// api/models/User.js
module.exports = {
  attributes: {
    fullName: { type: 'string' },
    courses: {
      collection: 'course',
      via: 'purchasers'
    }
  }
}

// api/models/Course.js
module.exports = {
  attributes: {
    title: { type: 'string' },
    purchasers: {
      collection: 'user',
      via: 'courses'
    }
  }
}
```

Manage many-to-many with collection methods:

```js
// Add association
await User.addToCollection(userId, 'courses', [courseId])
await Course.addToCollection(courseId, 'purchasers', [userId])

// Remove association (does NOT delete the records themselves)
await User.removeFromCollection(userId, 'courses', [courseId])
await Course.removeFromCollection(courseId, 'purchasers', [userId])

// Replace all associations
await User.replaceCollection(userId, 'courses', [course1, course2, course3])
```

## One-Way Association (No `via`)

When only one side defines the association. Changes on one side do NOT sync to the other:

```js
// api/models/Course.js
module.exports = {
  attributes: {
    title: { type: 'string' },
    purchasers: { collection: 'user' } // No 'via' -- one-way
  }
}
```

## Self-Referencing Associations

A model can associate with itself:

```js
// api/models/Comment.js -- threaded comments
module.exports = {
  attributes: {
    body: { type: 'string' },
    parentComment: {
      model: 'comment',
      columnName: 'parent_comment'
    }
  }
}

// api/models/Invoice.js -- template invoices
module.exports = {
  attributes: {
    templateInvoice: {
      model: 'invoice',
      columnName: 'template_invoice'
    }
  }
}
```

## Multiple Associations to the Same Model

```js
// api/models/Creator.js
module.exports = {
  attributes: {
    invoices: { collection: 'invoice', via: 'creator' },
    clients: { collection: 'client', via: 'creator' },
    expenses: { collection: 'expense', via: 'creator' },
    settings: { collection: 'setting', via: 'creator' }
  }
}
```

## populate()

Load associated records. Must be called explicitly:

```js
// Single populate
var invoice = await Invoice.findOne({ id: invoiceId }).populate('client')

// Multiple populates
var invoice = await Invoice.findOne({ publicId: id, creator: userId })
  .populate('items')
  .populate('creator')
  .populate('client')

// Populate with subcriteria (filter, sort, limit the populated records)
var ticket = await Ticket.findOne({ id: ticketId })
  .populate('ticketType', { select: ['name'] })
  .populate('order')

// Populate on find (returns array of records, each with populated data)
var users = await User.find().populate('invoices')
```

After populate, the associated data is available as a nested object or array:

```js
var subscription = await Subscription.findOne({ id: subId }).populate('user')
// subscription.user.organization is now accessible
```

## Populate Default Limit

Waterline applies a default limit of 30 on `.populate()` results. Override in `config/models.js` or per-query.

## Cross-Datastore Associations

Sails supports populating associations across different databases (e.g., Users in PostgreSQL + Comments in MongoDB). Waterline handles the multi-step querying automatically.

For many-to-many across datastores, use `dominant: true` on one side to specify where the junction table lives:

```js
// api/models/User.js (MySQL)
module.exports = {
  datastore: 'mysql',
  attributes: {
    wishlist: {
      collection: 'product',
      via: 'wishlistedBy',
      dominant: true // Junction table created in MySQL
    }
  }
}

// api/models/Product.js (Redis)
module.exports = {
  datastore: 'redis',
  attributes: {
    wishlistedBy: {
      collection: 'user',
      via: 'wishlist'
    }
  }
}
```

## Association Keywords Reference

| Keyword             | Used On                   | Meaning                                             |
| ------------------- | ------------------------- | --------------------------------------------------- |
| `model: 'user'`     | FK holder ("many" side)   | Points to one record in another model               |
| `collection: 'pet'` | Inverse side ("one" side) | References multiple records                         |
| `via: 'owner'`      | Used with `collection`    | Names the FK attribute on the other model           |
| `unique: true`      | On `model` attribute      | Enforces one-to-one at DB level                     |
| `dominant: true`    | On `collection` attribute | Determines which datastore hosts the junction table |
