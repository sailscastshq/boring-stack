const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const render = require('../lib/render')
const { INERTIA, VERSION, LOCATION } = require('../lib/helpers/inertia-headers')

function createRequest({
  method = 'GET',
  url = '/dashboard',
  query = {},
  headers = {},
  version = 'current-version',
  sharedProps = {},
  locals = {}
} = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    method,
    url,
    query,
    get(header) {
      return normalizedHeaders[header.toLowerCase()]
    },
    _sails: {
      config: {
        inertia: {
          rootView: 'app',
          version
        }
      },
      inertia: {
        getLocals() {
          return locals
        },
        getShared() {
          return sharedProps
        },
        shouldClearHistory() {
          return false
        },
        shouldEncryptHistory() {
          return false
        },
        consumeFlash() {
          return {}
        }
      }
    }
  }
}

function createResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    viewName: null,
    viewData: null,
    ended: false,
    set(header, value) {
      this.headers[header] = value
      return this
    },
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    end() {
      this.ended = true
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    view(viewName, viewData) {
      this.viewName = viewName
      this.viewData = viewData
      return this
    }
  }
}

describe('render', function () {
  it('returns a 409 location response on GET asset version mismatch', async function () {
    const req = createRequest({
      url: '/dashboard',
      query: { tab: 'billing' },
      headers: {
        [INERTIA]: 'true',
        [VERSION]: 'old-version'
      }
    })
    const res = createResponse()
    let resolvedProps = false

    await render(req, res, {
      page: 'dashboard/index',
      props: {
        expensive: async () => {
          resolvedProps = true
          return 'should not resolve'
        }
      }
    })

    assert.equal(res.statusCode, 409)
    assert.equal(res.ended, true)
    assert.equal(res.headers.Vary, 'X-Inertia')
    assert.equal(res.headers[LOCATION], '/dashboard?tab=billing')
    assert.equal(resolvedProps, false)
  })

  it('does not return a 409 location response for non-GET mismatches', async function () {
    const req = createRequest({
      method: 'POST',
      headers: {
        [INERTIA]: 'true',
        [VERSION]: 'old-version'
      }
    })
    const res = createResponse()

    await render(req, res, {
      page: 'dashboard/index',
      props: {
        saved: true
      }
    })

    assert.equal(res.statusCode, null)
    assert.equal(res.headers[LOCATION], undefined)
    assert.equal(res.body.component, 'dashboard/index')
  })

  it('uses the v3 Vary header for Inertia JSON responses', async function () {
    const req = createRequest({
      headers: {
        [INERTIA]: 'true',
        [VERSION]: 'current-version'
      }
    })
    const res = createResponse()

    await render(req, res, {
      page: 'dashboard/index',
      props: {
        stats: { users: 10 }
      }
    })

    assert.equal(res.headers[INERTIA], true)
    assert.equal(res.headers.Vary, 'X-Inertia')
    assert.deepEqual(res.body.props.stats, { users: 10 })
  })
})
