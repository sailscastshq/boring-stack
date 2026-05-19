const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const buildPageObject = require('../../lib/helpers/build-page-object')

function createRequest({
  sharedProps = {},
  pageProps = {},
  clearHistory = false,
  encryptHistory = false,
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

    assert.equal(Object.hasOwn(page, 'clearHistory'), false)
    assert.equal(Object.hasOwn(page, 'encryptHistory'), false)
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

    assert.equal(Object.hasOwn(page, 'sharedProps'), false)
  })
})
