const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  createDefaultMergeOperation,
  normalizeMergeOptions,
  normalizeMergeTargets,
  resolvePropPath,
  unique
} = require('../../lib/props/merge-targets')

describe('merge-targets', function () {
  it('creates the default root append operation', function () {
    assert.deepEqual(createDefaultMergeOperation(), {
      direction: 'append',
      path: null,
      matchOn: null,
      isDefault: true
    })
  })

  it('normalizes string options as match-on metadata', function () {
    assert.deepEqual(normalizeMergeOptions('id'), { matchOn: 'id' })
  })

  it('normalizes root targets', function () {
    assert.deepEqual(normalizeMergeTargets(null, { matchOn: 'id' }), [
      {
        path: null,
        matchOn: 'id'
      }
    ])
  })

  it('normalizes array targets with shared match-on metadata', function () {
    assert.deepEqual(normalizeMergeTargets(['users', 'messages'], 'id'), [
      {
        path: 'users',
        matchOn: 'id'
      },
      {
        path: 'messages',
        matchOn: 'id'
      }
    ])
  })

  it('normalizes object targets as path-to-match maps', function () {
    assert.deepEqual(
      normalizeMergeTargets({
        'users.data': 'id',
        messages: 'uuid'
      }),
      [
        {
          path: 'users.data',
          matchOn: 'id'
        },
        {
          path: 'messages',
          matchOn: 'uuid'
        }
      ]
    )
  })

  it('resolves prop paths and unique values', function () {
    assert.equal(resolvePropPath('users', 'data'), 'users.data')
    assert.equal(resolvePropPath('users', null), 'users')
    assert.deepEqual(unique(['users', 'users', 'messages']), [
      'users',
      'messages'
    ])
  })
})
