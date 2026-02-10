---
name: transactions
description: Waterline database transactions - getDatastore().transaction(), .usingConnection(), leased connections
metadata:
  tags: transactions, usingConnection, getDatastore, atomic, rollback
---

# Transactions

Transactions ensure that a group of database operations either all succeed or all fail together (atomicity). If any operation throws an error, all changes are rolled back.

## Basic Transaction Pattern

Use `sails.getDatastore().transaction()` to wrap operations in a transaction. Each query inside must chain `.usingConnection(db)`:

```js
await sails.getDatastore().transaction(async (db) => {
  var newInvoice = await Invoice.create({
    invoiceNumber: sails.helpers.generateId(12),
    creator: userId,
    client: clientId,
    status: 'draft'
  })
    .fetch()
    .usingConnection(db)

  for (const item of itemsToCreate) {
    await InvoiceItem.create({
      ...item,
      invoice: newInvoice.id
    }).usingConnection(db)
  }
})
```

If any query inside the callback throws, all operations are automatically rolled back.

## Transaction with Reads and Writes

```js
await sails.getDatastore().transaction(async (db) => {
  // Read inside the transaction to get a consistent snapshot
  var invoice = await Invoice.findOne({ id: invoiceId }).usingConnection(db)

  if (!invoice) {
    throw 'notFound' // Rolls back (though nothing was written yet)
  }

  // Delete children first
  await InvoiceItem.destroy({ invoice: invoiceId }).usingConnection(db)

  // Then delete the parent
  await Invoice.destroyOne({ id: invoiceId }).usingConnection(db)
})
```

## Transaction: Create User + Team Atomically

A real-world pattern from the Boring Stack ascent templates:

```js
// api/helpers/user/signup-with-team.js
await sails.getDatastore().transaction(async (db) => {
  // Create the user
  var newUser = await User.create({
    email,
    password,
    fullName,
    tosAcceptedByIp: req.ip
  })
    .fetch()
    .usingConnection(db)

  // Create the team
  var newTeam = await Team.create({
    name: `${fullName}'s Team`
  })
    .fetch()
    .usingConnection(db)

  // Create the membership linking user to team as owner
  await Membership.create({
    member: newUser.id,
    team: newTeam.id,
    role: 'owner',
    status: 'active'
  }).usingConnection(db)
})
```

## Named Datastore Transactions

If your model uses a named (non-default) datastore:

```js
await sails.getDatastore('mysql').transaction(async (db) => {
  await Order.create({ ... }).usingConnection(db)
  await OrderItem.createEach(items).usingConnection(db)
})
```

## .usingConnection(db)

Every query inside a transaction **must** chain `.usingConnection(db)` to use the leased connection. Without it, the query runs outside the transaction on a separate connection.

```js
// CORRECT -- uses the transaction connection
await User.create({ ... }).fetch().usingConnection(db)

// WRONG -- runs outside the transaction
await User.create({ ... }).fetch()
```

## Chaining .usingConnection() with Other Modifiers

`.usingConnection()` can be chained with any other modifier:

```js
await Invoice.create({ ... }).fetch().usingConnection(db)
await InvoiceItem.destroy({ invoice: id }).usingConnection(db)
await User.findOne({ id: userId }).usingConnection(db)
await User.updateOne({ id: userId }).set({ ... }).usingConnection(db)
```

## Error Handling in Transactions

If you need specific error handling inside a transaction, use try/catch within the callback:

```js
await sails.getDatastore().transaction(async (db) => {
  try {
    await User.create({ email }).fetch().usingConnection(db)
  } catch (error) {
    if (error.code === 'E_UNIQUE') {
      // Handle uniqueness error -- the transaction will still roll back
      // because we re-throw
      throw { badRequest: { problems: [{ email: 'Already exists.' }] } }
    }
    throw error
  }
})
```

## When to Use Transactions

Use transactions when:

- Creating related records that must all exist together (user + team + membership)
- Transferring data between records (debit one account, credit another)
- Deleting parent + child records atomically
- Any operation where partial completion would leave data in an inconsistent state

You do NOT need transactions for:

- Single record operations (create, update, destroy)
- Read-only queries
- Operations where partial failure is acceptable
