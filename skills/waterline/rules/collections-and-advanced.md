---
name: collections-and-advanced
description: Collection manipulation (addToCollection, removeFromCollection, replaceCollection), archive, native queries, meta
metadata:
  tags: addToCollection, removeFromCollection, replaceCollection, archive, native, meta, advanced
---

# Collections and Advanced Features

## addToCollection()

Add child records to a many-to-many or one-to-many association. Does NOT create new records -- only establishes relationships.

```js
// Add courses to a user's collection
await User.addToCollection(userId, 'courses', [courseId])

// Add from the other side
await Course.addToCollection(courseId, 'purchasers', [userId])

// Add multiple at once
await User.addToCollection(userId, 'courses', [course1, course2, course3])

// Using .members() syntax
await User.addToCollection(userId, 'pets').members([petId1, petId2])
```

**Behavior:**

- Duplicate associations are **silently skipped** (no error for re-adding)
- Empty child IDs array is a no-op
- Non-existent parent/child IDs are silently handled
- Two-way associations (`via`) are automatically kept in sync

## removeFromCollection()

Remove associations (NOT the records themselves):

```js
// Remove courses from a user
await User.removeFromCollection(userId, 'courses', [courseId])
await Course.removeFromCollection(courseId, 'purchasers', [userId])

// Using .members() syntax
await Invoice.removeFromCollection(invoiceId, 'items').members(
  idsOfItemsRemoved
)

// Remove from multiple parents at once
await User.removeFromCollection([userId1, userId2], 'courses', [courseId])
```

**Behavior:**

- Child records are NOT destroyed -- only the association is removed
- Non-existent IDs are silently ignored
- Already-absent associations are silently skipped

## replaceCollection()

Replace ALL child records in a collection. Detaches existing members and attaches the new set:

```js
// Replace user's courses with a new set
await User.replaceCollection(userId, 'courses').members([course1, course2])

// Empty array detaches ALL members
await User.replaceCollection(userId, 'courses').members([])
```

## archive() and archiveOne()

Soft-delete by copying records to the built-in `Archive` model, then destroying the originals:

```js
// Archive matching records
await Pet.archive({
  lastActiveAt: { '<': Date.now() - 365 * 24 * 60 * 60 * 1000 }
})

// Archive a single record
var archived = await User.archiveOne({ firstName: 'Finn' })
if (archived) {
  sails.log('Archived user:', archived.id)
}

// With .fetch() to get archived records (on archive, not archiveOne)
var archivedRecords = await User.archive({ inactive: true }).fetch()
```

Retrieve archived data:

```js
var record = await Archive.findOne({
  fromModel: 'user',
  originalRecordId: 1
})
// record.originalRecord contains the original data
```

**Caveats:**

- No built-in unarchive functionality
- If you need un-delete, consider using an `isDeleted` boolean flag instead
- `archiveOne()` throws if criteria matches more than one record

## native() (Deprecated)

Direct access to the underlying database driver. MongoDB only. Use `getDatastore().manager` instead:

```js
// Modern approach
var db = sails.getDatastore().manager
```

For SQL databases, use raw queries via the adapter.

## .meta()

Pass metadata through to the adapter. A pass-through dictionary that flows from userland to the database driver:

```js
// Force fetch on create
await User.create({ name: 'Finn' }).meta({ fetch: true }) // Same as .fetch()

// Force decryption
await User.find().meta({ decrypt: true }) // Same as .decrypt()

// Custom batch size for stream
await User.stream({})
  .meta({ batchSize: 100 })
  .eachRecord(async (user) => {})

// Skip deep-cloning of criteria (performance optimization)
await User.find(criteria).meta({ mutateArgs: true })
```

Key recognized meta keys:

- `fetch: true` -- Make create/update/destroy return affected records
- `decrypt: true` -- Decrypt encrypted attributes
- `batchSize: N` -- Custom batch size for `.stream()`
- `mutateArgs: true` -- Skip deep-cloning criteria (performance)

## .decrypt()

Decrypt attributes that have `encrypt: true` on the model:

```js
var user = await User.findOne({ id: 1 }).decrypt()
// user.ssn is now the plaintext value
```

Without `.decrypt()`, encrypted attributes remain as ciphertext.

## .fetch()

Make create/update/destroy return the affected records. Without `.fetch()`, these methods return nothing for performance:

```js
// create + fetch
var newUser = await User.create({ name: 'Finn' }).fetch()

// update + fetch
var updated = await User.update({ active: false }).set({ active: true }).fetch()

// destroy + fetch
var deleted = await User.destroy({ expired: true }).fetch()
```

Note: `updateOne()`, `destroyOne()`, and `archiveOne()` always return the record -- they do NOT support `.fetch()`.

## Background Operations with Callbacks

Run a query without `await` -- useful for fire-and-forget background tasks. Use the callback form instead of awaiting:

```js
// Background user update (no await -- runs behind the scenes)
User.updateOne({ id: loggedInUser.id })
  .set({ lastSeenAt: Date.now() })
  .then(() => {})
  .catch((err) => {
    sails.log.error('Background task failed:', err)
  })
```

## Chainable Methods Quick Reference

| Method               | Available On                                             |
| -------------------- | -------------------------------------------------------- |
| `.where()`           | find, count, sum, avg                                    |
| `.sort()`            | find, stream                                             |
| `.limit()`           | find, stream                                             |
| `.skip()`            | find, stream                                             |
| `.select()`          | find, findOne                                            |
| `.omit()`            | find, findOne                                            |
| `.populate()`        | find, findOne, stream                                    |
| `.fetch()`           | create, createEach, update, destroy, archive             |
| `.set()`             | update, updateOne                                        |
| `.members()`         | addToCollection, removeFromCollection, replaceCollection |
| `.decrypt()`         | find, findOne, create, createEach, update, stream        |
| `.meta()`            | All methods                                              |
| `.intercept()`       | All async methods                                        |
| `.tolerate()`        | All async methods                                        |
| `.usingConnection()` | All async methods (in transactions)                      |
| `.eachRecord()`      | stream                                                   |
| `.eachBatch()`       | stream                                                   |
| `.paginate()`        | find                                                     |
