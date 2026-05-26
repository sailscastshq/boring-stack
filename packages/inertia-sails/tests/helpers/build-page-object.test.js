const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const buildPageObject = require('../../lib/helpers/build-page-object')
const DeferProp = require('../../lib/props/defer-prop')
const {
  INERTIA,
  PARTIAL_COMPONENT,
  PARTIAL_DATA
} = require('../../lib/helpers/inertia-headers')

/**
 * @param {Record<string, any>} object
 * @param {string} key
 * @returns {boolean}
 */
function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

function createRequest({
  sharedProps = {},
  pageProps = {},
  clearHistory = false,
  encryptHistory = false,
  preserveFragment = false,
  flash = {},
  headers = {},
  version = 'test-version',
  url = '/dashboard'
} = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    url,
    /**
     * @param {string} header
     * @returns {any}
     */
    get(header) {
      return normalizedHeaders[header.toLowerCase()]
    },
    _sails: {
      config: {
        inertia: {
          version
        }
      },
      inertia: {
        getShared() {
          return sharedProps
        },
        shouldClearHistory() {
          return clearHistory
        },
        shouldEncryptHistory() {
          return encryptHistory
        },
        consumePreserveFragment() {
          return preserveFragment
        },
        consumeFlash() {
          return flash
        }
      }
    },
    pageProps
  }
}

describe('buildPageObject', function () {
  it('omits false history flags from the page object', async function () {
    const req = createRequest()
    const page = await buildPageObject(req, 'dashboard/index', {})

    assert.equal(hasOwn(page, 'clearHistory'), false)
    assert.equal(hasOwn(page, 'encryptHistory'), false)
  })

  it('includes true history flags in the page object', async function () {
    const req = createRequest({
      clearHistory: true,
      encryptHistory: true
    })
    const page = await buildPageObject(req, 'dashboard/index', {})

    assert.equal(page.clearHistory, true)
    assert.equal(page.encryptHistory, true)
  })

  it('omits false preserveFragment from the page object', async function () {
    const req = createRequest()
    const page = await buildPageObject(req, 'dashboard/index', {})

    assert.equal(hasOwn(page, 'preserveFragment'), false)
  })

  it('includes true preserveFragment in the page object', async function () {
    const req = createRequest({
      preserveFragment: true
    })
    const page = await buildPageObject(req, 'dashboard/index', {})

    assert.equal(page.preserveFragment, true)
  })

  it('adds sharedProps metadata for shared prop keys', async function () {
    const req = createRequest({
      sharedProps: {
        auth: { user: { id: 1 } },
        app: { name: 'Boring Stack' }
      }
    })
    const page = await buildPageObject(req, 'dashboard/index', {
      stats: { users: 10 }
    })

    assert.deepEqual(page.sharedProps, ['auth', 'app'])
    assert.deepEqual(page.props.auth, { user: { id: 1 } })
    assert.deepEqual(page.props.stats, { users: 10 })
  })

  it('keeps sharedProps metadata when page props override a shared key', async function () {
    const req = createRequest({
      sharedProps: {
        auth: { user: { id: 1 } }
      }
    })
    const page = await buildPageObject(req, 'dashboard/index', {
      auth: { user: { id: 2 } }
    })

    assert.deepEqual(page.sharedProps, ['auth'])
    assert.deepEqual(page.props.auth, { user: { id: 2 } })
  })

  it('omits sharedProps when no shared props are present', async function () {
    const req = createRequest()
    const page = await buildPageObject(req, 'dashboard/index', {})

    assert.equal(hasOwn(page, 'sharedProps'), false)
  })

  it('includes rescuedProps when a rescuable deferred prop fails', async function () {
    const req = createRequest({
      headers: {
        [INERTIA]: 'true',
        [PARTIAL_COMPONENT]: 'dashboard/index',
        [PARTIAL_DATA]: 'analytics'
      }
    })
    const page = await buildPageObject(req, 'dashboard/index', {
      analytics: new DeferProp(async () => {
        throw new Error('Analytics service unavailable')
      }).rescue()
    })

    assert.deepEqual(page.props, {})
    assert.deepEqual(page.rescuedProps, ['analytics'])
  })

  it('omits merge metadata for rescued deferred props', async function () {
    const req = createRequest({
      headers: {
        [INERTIA]: 'true',
        [PARTIAL_COMPONENT]: 'dashboard/index',
        [PARTIAL_DATA]: 'analytics'
      }
    })
    const analytics = new DeferProp(async () => {
      throw new Error('Analytics service unavailable')
    })
    analytics.append('data', 'id')
    analytics.rescue()

    const page = await buildPageObject(req, 'dashboard/index', { analytics })

    assert.deepEqual(page.rescuedProps, ['analytics'])
    assert.equal(hasOwn(page, 'mergeProps'), false)
    assert.equal(hasOwn(page, 'matchPropsOn'), false)
  })
})
