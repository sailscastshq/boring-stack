const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const resolveScrollProps = require('../../lib/props/resolve-scroll-props')
const ScrollProp = require('../../lib/props/scroll-prop')

describe('resolveScrollProps', function () {
  it('emits Inertia scroll metadata for scroll props', function () {
    const result = resolveScrollProps({
      users: new ScrollProp(() => [], {
        page: 1,
        perPage: 10,
        total: 25
      })
    })

    assert.deepEqual(result, {
      scrollProps: {
        users: {
          pageName: 'page',
          currentPage: 2,
          previousPage: 1,
          nextPage: 3,
          reset: false
        }
      }
    })
  })

  it('supports custom page names', function () {
    const result = resolveScrollProps({
      orders: new ScrollProp(() => [], {
        page: 0,
        pageName: 'orders',
        perPage: 15,
        total: 20
      })
    })

    assert.deepEqual(result, {
      scrollProps: {
        orders: {
          pageName: 'orders',
          currentPage: 1,
          previousPage: null,
          nextPage: 2,
          reset: false
        }
      }
    })
  })
})
