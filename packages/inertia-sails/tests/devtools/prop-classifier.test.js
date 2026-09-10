const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const classifyProp = require('../../lib/devtools/prop-classifier')
const AlwaysProp = require('../../lib/props/always-prop')
const DeferProp = require('../../lib/props/defer-prop')
const MergeProp = require('../../lib/props/merge-prop')
const OnceProp = require('../../lib/props/once-prop')
const OptionalProp = require('../../lib/props/optional-prop')
const ScrollProp = require('../../lib/props/scroll-prop')
const { HEADERS } = require('../../lib/devtools/constants')
const {
  INFINITE_SCROLL_MERGE_INTENT,
  RESET
} = require('../../lib/helpers/inertia-headers')

/**
 * @param {Record<string, string>} [headers]
 * @returns {any}
 */
function request(headers = {}) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )
  return {
    get(/** @type {string} */ name) {
      return normalized[name.toLowerCase()]
    }
  }
}

describe('DevTools prop classifier', function () {
  it('classifies each supported prop wrapper', function () {
    assert.equal(
      classifyProp('auth', new AlwaysProp(() => null), request()).inertiaType,
      'always'
    )
    assert.equal(
      classifyProp('filters', new OptionalProp(() => null), request())
        .inertiaType,
      'optional'
    )
    assert.equal(
      classifyProp('messages', new MergeProp(() => null), request())
        .inertiaType,
      'merge'
    )
    assert.equal(
      classifyProp('invoices', new ScrollProp(() => [], {}), request())
        .inertiaType,
      'scroll'
    )
    assert.equal(
      classifyProp('permissions', new OnceProp(() => null), request())
        .inertiaType,
      'once'
    )
  })

  it('only marks DeferProp as deferred for a real deferred delivery', function () {
    const prop = new DeferProp(() => null, 'sidebar')

    assert.equal(classifyProp('analytics', prop, request()).inertiaType, null)
    assert.equal(
      classifyProp('analytics', prop, request({ [HEADERS.DEFERRED]: 'true' }))
        .inertiaType,
      'defer'
    )
    assert.equal(
      classifyProp('analytics', prop, request({ [HEADERS.DEFERRED]: 'true' }))
        .deferGroup,
      'sidebar'
    )
  })

  it('records reset, merge direction, deep merge, and scroll intent', function () {
    const prepended = new MergeProp(() => null).prepend('data')
    const deep = new MergeProp(() => null).deepMerge().matchOn('data.id')
    const scroll = new ScrollProp(() => [], { matchOn: 'id' })

    assert.equal(
      classifyProp('users', prepended, request({ [RESET]: 'users,filters' }))
        .reset,
      true
    )
    assert.equal(
      classifyProp('users', prepended, request()).mergeDirection,
      'prepend'
    )
    assert.equal(classifyProp('users', deep, request()).deepMerge, true)
    assert.equal(
      classifyProp(
        'users',
        scroll,
        request({ [INFINITE_SCROLL_MERGE_INTENT]: 'prepend' })
      ).mergeDirection,
      'prepend'
    )
    assert.equal(classifyProp('users', scroll, request()).deepMerge, undefined)
    assert.deepEqual(classifyProp('users', scroll, request()).matchOn, ['id'])
    assert.deepEqual(classifyProp('users', deep, request()).matchOn, [
      'data.id'
    ])
  })
})
