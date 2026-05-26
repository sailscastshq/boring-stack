const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const resolveMergeProps = require('../../lib/props/resolve-merge-props')
const MergeProp = require('../../lib/props/merge-prop')
const DeferProp = require('../../lib/props/defer-prop')
const ScrollProp = require('../../lib/props/scroll-prop')
const {
  INFINITE_SCROLL_MERGE_INTENT,
  RESET
} = require('../../lib/helpers/inertia-headers')

/**
 * @param {Record<string, any>} [headers]
 * @returns {{ get: (header: string) => any }}
 */
function createRequest(headers = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    get(header) {
      return normalizedHeaders[header.toLowerCase()]
    }
  }
}

describe('resolveMergeProps', function () {
  it('marks merge props as appendable root props by default', function () {
    const result = resolveMergeProps(createRequest(), {
      notifications: new MergeProp(() => [])
    })

    assert.deepEqual(result, {
      mergeProps: ['notifications']
    })
  })

  it('supports root-level prepend props', function () {
    const result = resolveMergeProps(createRequest(), {
      notifications: new MergeProp(() => []).prepend()
    })

    assert.deepEqual(result, {
      prependProps: ['notifications']
    })
  })

  it('supports nested append props with match-on metadata', function () {
    const result = resolveMergeProps(createRequest(), {
      users: new MergeProp(() => ({})).append('data', { matchOn: 'id' })
    })

    assert.deepEqual(result, {
      mergeProps: ['users.data'],
      matchPropsOn: ['users.data.id']
    })
  })

  it('supports several nested append and prepend paths', function () {
    const result = resolveMergeProps(createRequest(), {
      dashboard: new MergeProp(() => ({}))
        .append({
          'users.data': 'id',
          messages: 'uuid'
        })
        .prepend('announcements')
    })

    assert.deepEqual(result, {
      mergeProps: ['dashboard.users.data', 'dashboard.messages'],
      prependProps: ['dashboard.announcements'],
      matchPropsOn: ['dashboard.users.data.id', 'dashboard.messages.uuid']
    })
  })

  it('supports deep merge props with match-on metadata', function () {
    const result = resolveMergeProps(createRequest(), {
      chat: new MergeProp(() => ({})).deepMerge().matchOn('messages.id')
    })

    assert.deepEqual(result, {
      deepMergeProps: ['chat'],
      matchPropsOn: ['chat.messages.id']
    })
  })

  it('supports merge metadata on deferred props', function () {
    const result = resolveMergeProps(createRequest(), {
      results: new DeferProp(() => ({}), 'default').append('data', 'id')
    })

    assert.deepEqual(result, {
      mergeProps: ['results.data'],
      matchPropsOn: ['results.data.id']
    })
  })

  it('appends infinite scroll data by wrapper path by default', function () {
    const result = resolveMergeProps(createRequest(), {
      users: new ScrollProp(() => [], { page: 0, perPage: 10, total: 25 })
    })

    assert.deepEqual(result, {
      mergeProps: ['users.data']
    })
  })

  it('prepends infinite scroll data when requested by the client', function () {
    const result = resolveMergeProps(
      createRequest({
        [INFINITE_SCROLL_MERGE_INTENT]: 'prepend'
      }),
      {
        users: new ScrollProp(() => [], { page: 1, perPage: 10, total: 25 })
      }
    )

    assert.deepEqual(result, {
      prependProps: ['users.data']
    })
  })

  it('supports custom infinite scroll wrappers and match-on metadata', function () {
    const result = resolveMergeProps(createRequest(), {
      feed: new ScrollProp(() => [], {
        wrapper: 'items',
        matchOn: 'id'
      })
    })

    assert.deepEqual(result, {
      mergeProps: ['feed.items'],
      matchPropsOn: ['feed.items.id']
    })
  })

  it('skips merge metadata for reset props', function () {
    const result = resolveMergeProps(
      createRequest({
        [RESET]: 'results,notifications.data'
      }),
      {
        results: new MergeProp(() => []),
        notifications: new MergeProp(() => ({})).append('data', 'id')
      }
    )

    assert.deepEqual(result, {})
  })
})
