---
name: aggregation-and-streaming
description: Waterline aggregation methods (count, sum, avg) and streaming with eachRecord/eachBatch
metadata:
  tags: count, sum, avg, stream, eachRecord, eachBatch, aggregation
---

# Aggregation and Streaming

## count()

Count records matching criteria. Returns a number.

```js
// Simple count
var total = await Invoice.count({ creator: userId, status: 'paid' })

// Count with operators
var activeUsers = await User.count({
  emailStatus: { in: ['verified', 'confirmed'] },
  createdAt: { '>=': new Date('2024-01-01') }
})

// Existence check pattern
var invoiceExists = await Invoice.count({
  creator: userId,
  publicId: id
})
if (!invoiceExists) {
  throw 'notFound'
}

// Check for conflicts
if ((await User.count({ email: user.emailChangeCandidate })) > 0) {
  throw 'emailAddressNoLongerAvailable'
}
```

**Chainable:** `.where()`, `.meta()`, `.intercept()`, `.tolerate()`

Does NOT support `skip`, `limit`, or `select`.

## sum()

Sum a numeric attribute across matching records:

```js
var totalBalance = await BankAccount.sum('balance')

// With criteria
var totalBalance = await BankAccount.sum('balance').where({
  or: [{ balance: { '<': 32000 } }, { suspended: true }]
})

// Sum expenses in a date range
var totalExpenses = await Expense.sum('amount').where({
  creator: userId,
  expenseDate: { '>=': startDate, '<=': endDate }
})
```

**Parameters:** `Model.sum(numericAttrName, criteria?)` -- The first argument is the attribute name (string), the second is optional criteria.

Some databases may return `null` instead of `0` when no records match.

## avg()

Compute the average of a numeric attribute:

```js
var averageBalance = await BankAccount.avg('balance').where({
  ownerAge: { '>=': 35, '<=': 45 }
})

var averageRating = await Course.avg('rating').where({ published: true })
```

**Parameters:** `Model.avg(numericAttrName, criteria?)` -- Same signature as `sum()`.

## stream()

Process large result sets without loading everything into memory. Records are fetched in batches internally (default: 30 per batch).

### Per-Record Processing

```js
await User.stream({ emailStatus: 'verified' }).eachRecord(async (user) => {
  console.log(user.email, user.fullName)
  // Process each user one at a time
})
```

### Per-Batch Processing

```js
await User.stream({ active: true }).eachBatch(async (users) => {
  // Process an array of users at once
  await Promise.all(
    users.map(async (user) => {
      await sendWeeklyDigest(user)
    })
  )
})
```

### Custom Batch Size

```js
// Via argument to eachBatch
await User.stream({ active: true }).eachBatch(100, async (users) => {
  // Batches of 100
})

// Via meta
await User.stream({ active: true })
  .meta({ batchSize: 100 })
  .eachRecord(async (user) => {
    // Still processes one at a time, but fetches in batches of 100
  })
```

### Stream with Sort and Limit

```js
await User.stream({ emailStatus: 'verified' })
  .sort('createdAt ASC')
  .limit(1000)
  .eachRecord(async (user) => {
    // Process the first 1000 verified users, oldest first
  })
```

### Stream with Populate

```js
await User.stream({ active: true })
  .populate('orders')
  .eachRecord(async (user) => {
    // user.orders is populated
  })
```

### Stream with Decrypt

```js
await User.stream({})
  .decrypt()
  .eachRecord(async (user) => {
    // Encrypted attributes are decrypted
  })
```

## Stream Behavior

- Iteratees are processed **one at a time, in series** (not parallel)
- If any iteratee throws, the stream **stops immediately** and the error propagates
- Fetches records in batches internally to prevent memory overflow
- Each batch contains 1 to `batchSize` records
- You must choose either `.eachRecord()` OR `.eachBatch()` (not both)

**Chainable:** `.eachRecord()`, `.eachBatch()`, `.sort()`, `.limit()`, `.skip()`, `.populate()`, `.meta()`, `.decrypt()`, `.intercept()`, `.tolerate()`

## When to Use stream() vs find()

- **`find()`** -- Result set fits comfortably in memory (hundreds to low thousands of records)
- **`stream()`** -- Large result sets (thousands to millions), background jobs, data exports, migrations, bulk email sending
