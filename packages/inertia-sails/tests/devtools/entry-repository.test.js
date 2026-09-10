const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const EntryRepository = require('../../lib/devtools/entry-repository')

/**
 * @param {string} directory
 * @param {Record<string, any>} [overrides]
 * @returns {EntryRepository}
 */
function repository(directory, overrides = {}) {
  return new EntryRepository({
    path: directory,
    ttl: 24,
    pruneInterval: 300_000,
    limit: 100,
    circuitBreaker: 30_000,
    ...overrides
  })
}

/**
 * @param {string} id
 * @param {number} utime
 * @param {string|null} [tabUuid]
 * @returns {Record<string, any>}
 */
function entry(id, utime, tabUuid = 'tab-one') {
  return {
    __meta: {
      id,
      utime,
      tabUuid,
      component: 'dashboard',
      requestType: 'initial'
    }
  }
}

describe('DevTools entry repository', function () {
  it('atomically stores and retrieves entries', function () {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-devtools-')
    )
    const store = repository(directory)
    const value = entry(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      Date.now() / 1000
    )

    assert.equal(store.record(value), true)
    assert.deepEqual(store.get(value.__meta.id), value)
    assert.equal(
      fs
        .readdirSync(directory)
        .some((file) => file.startsWith('.') && file.endsWith('.tmp')),
      false
    )
  })

  it('ignores corrupt entries and rejects unsafe ids', function () {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-devtools-')
    )
    const store = repository(directory)
    fs.writeFileSync(path.join(directory, 'corrupt-entry.json'), '{')

    assert.equal(store.get('../secrets'), null)
    assert.deepEqual(store.entriesFromDisk(), [])
  })

  it('enforces per-tab limits while preserving other tabs', function () {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-devtools-')
    )
    const store = repository(directory, { limit: 2 })

    const now = Date.now() / 1000
    store.record(entry('11111111-1111-4111-8111-111111111111', now - 4))
    store.record(entry('22222222-2222-4222-8222-222222222222', now - 3))
    store.record(entry('33333333-3333-4333-8333-333333333333', now - 2))
    store.record(
      entry('44444444-4444-4444-8444-444444444444', now - 1, 'tab-two')
    )

    const storedEntries = store.entriesFromDisk().map(({ entry }) => entry)
    assert.equal(
      storedEntries.filter((value) => value.__meta.tabUuid === 'tab-one')
        .length,
      2
    )
    assert.equal(
      storedEntries.filter((value) => value.__meta.tabUuid === 'tab-two')
        .length,
      1
    )
    assert.equal(store.get('11111111-1111-4111-8111-111111111111'), null)
  })

  it('prunes expired entries', function () {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-devtools-')
    )
    const store = repository(directory)
    const old = entry(
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      Date.now() / 1000 - 7200
    )
    store.record(old)
    store.prune(1)

    assert.equal(store.get(old.__meta.id), null)
  })

  it('opens a circuit breaker after a storage failure', function () {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-devtools-')
    )
    const blockedPath = path.join(directory, 'not-a-directory')
    fs.writeFileSync(blockedPath, 'blocked')
    let warnings = 0
    const store = new EntryRepository(
      {
        path: blockedPath,
        ttl: 24,
        pruneInterval: 300_000,
        limit: 100,
        circuitBreaker: 30_000
      },
      {
        warn() {
          warnings += 1
        }
      }
    )
    const value = entry(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      Date.now() / 1000
    )

    assert.equal(store.record(value), false)
    assert.equal(store.record(value), false)
    assert.equal(warnings, 1)
  })
  it('does not serve expired entries between pruning runs', function () {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-devtools-ttl-')
    )
    const store = repository(directory, { ttl: 1 })
    const old = entry('expired-entry', Date.now() / 1000 - 7200)
    fs.writeFileSync(
      path.join(directory, 'expired-entry.json'),
      JSON.stringify(old)
    )
    assert.equal(store.get('expired-entry'), null)
    assert.deepEqual(store.entriesFromDisk(), [])
    fs.rmSync(directory, { recursive: true, force: true })
  })
})
