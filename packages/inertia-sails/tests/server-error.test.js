const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const handleServerError = require('../lib/responses/server-error')
const { INERTIA } = require('../lib/helpers/inertia-headers')

/**
 * @param {Object} [options]
 * @param {Record<string, any>} [options.headers]
 * @param {Record<string, any>} [options.inertiaConfig]
 * @returns {any}
 */
function createRequest({ headers = {}, inertiaConfig = {} } = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    method: 'GET',
    url: '/broken',
    originalUrl: '/broken?tab=settings',
    query: { tab: 'settings' },
    headers: normalizedHeaders,
    params: { slug: 'broken' },
    body: { email: 'person@example.com', password: 'secret' },
    session: { userId: 10, csrfToken: 'session-secret' },
    /**
     * @param {string} header
     * @returns {any}
     */
    get(header) {
      return normalizedHeaders[header.toLowerCase()]
    },
    /**
     * @param {string} header
     * @returns {any}
     */
    header(header) {
      return normalizedHeaders[header.toLowerCase()]
    },
    _sails: {
      config: {
        inertia: {
          rootView: 'app',
          version: 'test-version',
          errorPage: 'error',
          errorStatuses: [403, 404, 500, 503],
          ...inertiaConfig
        }
      },
      log: {
        error() {}
      },
      inertia: {
        flash() {},
        getLocals() {
          return {}
        },
        getShared() {
          return {}
        },
        shouldClearHistory() {
          return false
        },
        shouldEncryptHistory() {
          return false
        },
        consumePreserveFragment() {
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
  /** @type {Record<string, any>} */
  const headers = {}

  return {
    headers,
    statusCode: /** @type {number|null} */ (null),
    body: /** @type {any} */ (null),
    typeName: /** @type {string|null} */ (null),
    viewName: /** @type {string|null} */ (null),
    viewData: /** @type {any} */ (null),
    redirectArgs: /** @type {any[]|null} */ (null),
    /**
     * @param {string} header
     * @param {any} value
     * @returns {any}
     */
    set(header, value) {
      this.headers[header] = value
      return this
    },
    /**
     * @param {number} statusCode
     * @returns {any}
     */
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    /**
     * @param {string} typeName
     * @returns {any}
     */
    type(typeName) {
      this.typeName = typeName
      return this
    },
    /**
     * @param {any} body
     * @returns {any}
     */
    send(body) {
      this.body = body
      return this
    },
    /**
     * @param {any} body
     * @returns {any}
     */
    json(body) {
      this.body = body
      return this
    },
    /**
     * @param {...any} args
     * @returns {any}
     */
    redirect(...args) {
      this.redirectArgs = args
      return this
    },
    /**
     * @param {string} viewName
     * @param {any} viewData
     * @returns {any}
     */
    view(viewName, viewData) {
      this.viewName = viewName
      this.viewData = viewData
      return this
    }
  }
}

/**
 * @param {string} value
 * @param {() => Promise<void>} callback
 */
async function withNodeEnv(value, callback) {
  const previousValue = process.env.NODE_ENV
  process.env.NODE_ENV = value

  try {
    await callback()
  } finally {
    process.env.NODE_ENV = previousValue
  }
}

describe('server error handling', function () {
  it('renders Youch HTML for development server errors', async function () {
    await withNodeEnv('development', async function () {
      const authToken = ['super', 'secret', 'token'].join('-')
      const sessionToken = ['session', 'secret'].join('-')
      const req = createRequest({
        headers: {
          accept: 'text/html',
          authorization: `Bearer ${authToken}`,
          cookie: `sails.sid=${sessionToken}`
        }
      })
      const res = createResponse()

      await handleServerError(req, res, new Error('Boom from server action'))

      assert.equal(res.statusCode, 500)
      assert.equal(res.typeName, 'text/html')
      assert.match(res.body, /Boom from server action/)
      assert.match(res.body, /Sails request/)
      assert.match(res.body, /window\.__youchStorage/)
      assert.equal(
        res.body.includes("localStorage.getItem('youch-theme')"),
        false
      )
      assert.equal(res.body.includes(authToken), false)
      assert.equal(res.body.includes(sessionToken), false)
    })
  })

  it('renders the configured Inertia error page in production', async function () {
    await withNodeEnv('production', async function () {
      const req = createRequest({
        headers: {
          [INERTIA]: 'true',
          accept: 'text/html'
        }
      })
      const res = createResponse()

      await handleServerError(req, res, new Error('Hidden production failure'))

      assert.equal(res.statusCode, 500)
      assert.equal(res.headers[INERTIA], true)
      assert.equal(res.body.component, 'error')
      assert.equal(res.body.props.status, 500)
      assert.equal(res.body.props.title, 'Server error')
      assert.equal(res.body.props.message, 'Something went wrong on our end.')
      assert.equal(res.body.props.message.includes('Hidden production'), false)
    })
  })

  it('allows explicit error pages to be previewed in development', async function () {
    await withNodeEnv('development', async function () {
      const req = createRequest({
        headers: {
          accept: 'text/html'
        }
      })
      const res = createResponse()

      await handleServerError.handleErrorPage(req, res, {
        statusCode: 500,
        page: 'error'
      })

      assert.equal(res.statusCode, 500)
      assert.equal(res.typeName, null)
      assert.equal(res.viewName, 'app')
      assert.equal(res.viewData.page.component, 'error')
      assert.equal(res.viewData.page.props.status, 500)
      assert.equal(res.viewData.page.props.title, 'Server error')
    })
  })

  it('returns JSON errors for JSON requests', async function () {
    await withNodeEnv('production', async function () {
      const req = createRequest({
        headers: {
          accept: 'application/json'
        }
      })
      const res = createResponse()

      await handleServerError.handleErrorPage(req, res, { statusCode: 404 })

      assert.equal(res.statusCode, 404)
      assert.deepEqual(res.body, {
        error: {
          status: 404,
          title: 'Page not found',
          message: 'The page you are looking for could not be found.'
        }
      })
    })
  })

  it('falls back to Sails error views when the Inertia error page is disabled', async function () {
    await withNodeEnv('production', async function () {
      const req = createRequest({
        headers: {
          accept: 'text/html'
        },
        inertiaConfig: {
          errorPage: false
        }
      })
      const res = createResponse()

      await handleServerError.handleErrorPage(req, res, { statusCode: 404 })

      assert.equal(res.statusCode, 404)
      assert.equal(res.viewName, '404')
      assert.equal(res.viewData.error, null)
    })
  })
})
