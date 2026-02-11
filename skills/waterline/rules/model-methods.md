---
name: model-methods
description: All Waterline model methods - find, findOne, findOrCreate, create, createEach, update, updateOne, destroy, destroyOne
metadata:
  tags: find, findOne, create, update, destroy, fetch, methods
---

# Model Methods

All model methods are asynchronous. They return a chainable Deferred object that resolves when `.exec()`, `await`, or `.then()` is called.

## find()

Find records matching criteria. Returns an array (empty `[]` if no matches).

```js
// Basic find
var users = await User.find({ emailStatus: 'verified' })

// With projection
var users = await User.find({
  where: { emailStatus: 'verified' },
  select: ['name', 'email']
})

// With sort, limit, skip, populate
var invoices = await Invoice.find({ creator: userId, status: 'paid' })
  .select(['publicId', 'invoiceNumber', 'totalAmount', 'currency', 'status'])
  .populate('client')
  .sort('updatedAt DESC')
  .paginate(page, perPage)
```

**Chainable:** `.where()`, `.sort()`, `.limit()`, `.skip()`, `.select()`, `.omit()`, `.populate()`, `.meta()`, `.decrypt()`, `.intercept()`, `.tolerate()`

## findOne()

Find a single record. Returns the record dictionary or `undefined` (not an error) if no match.

```js
var user = await User.findOne({ email: email.toLowerCase() })
if (!user) {
  throw { badCombo: { problems: [{ login: 'Wrong email/password.' }] } }
}

// By ID (shorthand)
var user = await User.findOne(this.req.session.userId)

// With populate
var invoice = await Invoice.findOne({ publicId: id, creator: userId })
  .populate('items')
  .populate('creator')
  .populate('client')

// With select
var user = await User.findOne({ id: userId }).select(['password', 'email'])

// Populate with subcriteria
var ticket = await Ticket.findOne({ id: ticketId })
  .populate('ticketType', { select: ['name'] })
  .populate('order')
```

**Does NOT support** `skip` or `limit`.

## findOrCreate()

Find an existing record or create a new one. The `wasCreated` boolean is only available in callback form:

```js
// Callback form (provides wasCreated)
User.findOrCreate(
  { or: [{ googleId: googleUser.id }, { email: googleUser.email }] },
  {
    googleId: googleUser.id,
    email: googleUser.email,
    fullName: googleUser.name,
    emailStatus: googleUser.verified_email ? 'verified' : 'unverified'
  }
).exec(async (error, user, wasCreated) => {
  if (error) throw error
  if (!wasCreated) {
    await User.updateOne({ id: user.id }).set({ emailStatus: 'verified' })
  }
})

// Await form (no wasCreated)
var item = await InvoiceItem.findOrCreate(criteria, {
  ...item,
  invoice: invoiceToUpdate.id
})
```

## create()

Create a new record. Returns nothing by default -- chain `.fetch()` to get the created record.

```js
// Fire and forget (no return value)
await HistoricalUsageSnapshot.create(Object.assign({}, inputs))

// With .fetch() to get the created record back
var newUser = await User.create({
  email,
  password,
  fullName,
  tosAcceptedByIp: this.req.ip,
  emailProofToken,
  emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL
}).fetch()

// With .intercept() for error handling
var newUser = await User.create({
  firstName,
  lastName,
  emailAddress: newEmailAddress,
  password: await sails.helpers.passwords.hashPassword(password)
})
  .intercept('E_UNIQUE', 'emailAlreadyInUse')
  .intercept({ name: 'UsageError' }, 'invalid')
  .fetch()

// With .tolerate() for idempotent operations
await NewsletterSubscription.create({ emailAddress }).tolerate('E_UNIQUE')
```

**Input dictionaries are mutated in-place** (Sails v1.0+). Clone if you need to preserve the original.

## createEach()

Create multiple records at once:

```js
await User.createEach([
  { name: 'Finn', email: 'finn@example.com' },
  { name: 'Jake', email: 'jake@example.com' }
])

// With .fetch()
var users = await User.createEach(userDataArray).fetch()
```

Watch for database size limits (MySQL: 4MB default query size, MongoDB: 16MB per document).

## update()

Update all records matching criteria. Returns nothing by default.

```js
// Bulk update
await User.update({ emailStatus: 'pending' }).set({ emailStatus: 'verified' })

// With .fetch() to get updated records
var updatedUsers = await User.update({ emailStatus: 'pending' })
  .set({ emailStatus: 'verified' })
  .fetch()
```

`.set()` is **required**. Does NOT support `skip`, `limit`, or `select`.

## updateOne()

Update a single record. Returns the updated record or `undefined`. Throws if criteria matches more than one record.

```js
var updatedUser = await User.updateOne({ id: user.id }).set({
  password,
  passwordResetToken: '',
  passwordResetTokenExpiresAt: 0
})

if (updatedUser) {
  sails.log('Successfully updated.')
} else {
  sails.log('No matching user found.')
}
```

**Does NOT support `.fetch()`** -- it inherently returns the record.

**Background update** (fire-and-forget with `.exec()`):

```js
User.updateOne({ id: loggedInUser.id })
  .set({ lastSeenAt: Date.now() })
  .exec((err) => {
    if (err) {
      sails.log.error('Background task failed:', err)
    }
  })
```

## destroy()

Destroy all records matching criteria. An empty `{}` destroys ALL records.

```js
// By criteria
await User.destroy({
  emailStatus: 'unconfirmed',
  createdAt: { '<': new Date('2023-01-01') }
})

// By multiple IDs
await User.destroy({ id: { in: [3, 97] } })

// With .fetch() to get deleted records
var deleted = await User.destroy({ inactive: true }).fetch()
```

Does NOT support `skip`, `limit`, or `select`.

## destroyOne()

Destroy a single record. Returns the destroyed record or `undefined`. Throws if criteria matches more than one record.

```js
var deleted = await User.destroyOne({ id: 4 })
if (deleted) {
  sails.log('Deleted user:', deleted.id)
} else {
  sails.log('No user found with id: 4')
}

// Used in cleanup
await User.destroyOne({ id: genesisUser.id })
await Team.destroyOne({ id: defaultTeam.id })
```

**Does NOT support `.fetch()`** -- it inherently returns the record.

## validate()

Synchronous method that validates a value against a model attribute's rules without touching the database:

```js
try {
  var normalized = User.validate('emailAddress', inputValue)
} catch (err) {
  if (err.code === 'E_VALIDATION') {
    err.all.forEach((woe) => {
      sails.log(woe.attrName + ': ' + woe.message)
    })
  }
}
```

This is the only synchronous model method. Useful for pre-validating data before third-party API calls.

## Method Behavior Summary

| Method         | Returns by default              | With `.fetch()`         | Safety check                        |
| -------------- | ------------------------------- | ----------------------- | ----------------------------------- |
| `find`         | `Array`                         | N/A                     | --                                  |
| `findOne`      | `Dict` or `undefined`           | N/A                     | --                                  |
| `findOrCreate` | `Dict`                          | N/A                     | Throws if criteria matches multiple |
| `create`       | Nothing                         | Created record          | --                                  |
| `createEach`   | Nothing                         | Created records array   | --                                  |
| `update`       | Nothing                         | Updated records array   | --                                  |
| `updateOne`    | Updated record or `undefined`   | N/A (inherent)          | Throws if >1 match                  |
| `destroy`      | Nothing                         | Destroyed records array | --                                  |
| `destroyOne`   | Destroyed record or `undefined` | N/A (inherent)          | Throws if >1 match                  |
| `validate`     | Normalized value (sync)         | N/A                     | Throws `E_VALIDATION`               |
