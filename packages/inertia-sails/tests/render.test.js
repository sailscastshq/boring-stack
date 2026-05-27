const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const render = require('../lib/render')
const { INERTIA, VERSION, LOCATION } = require('../lib/helpers/inertia-headers')

/**
 * @param {Object} [options]
 * @param {string} [options.method]
 * @param {string} [options.url]
 * @param {Record<string, any>} [options.query]
 * @param {Record<string, any>} [options.headers]
 * @param {string} [options.version]
 * @param {Record<string, any>} [options.sharedProps]
 * @param {Record<string, any>} [options.locals]
 * @param {Record<string, any>} [options.ssr]
 * @returns {any}
 */
function createRequest({
  method = 'GET',
  url = '/dashboard',
  query = {},
  headers = {},
  version = 'current-version',
  sharedProps = {},
  locals = {},
  ssr
} = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    method,
    url,
    query,
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
          rootView: 'app',
          version,
          ssr
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

/**
 * @param {string} source
 */
function createSsrBundle(source) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'inertia-sails-ssr-'))
  const bundle = path.join(directory, 'inertia.mjs')

  fs.writeFileSync(bundle, source)

  return bundle
}

function createResponse() {
  /** @type {Record<string, any>} */
  const responseHeaders = {}

  return {
    headers: responseHeaders,
    statusCode: /** @type {number|null} */ (null),
    body: /** @type {any} */ (null),
    viewName: /** @type {string|null} */ (null),
    viewData: /** @type {any} */ (null),
    ended: false,
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
    end() {
      this.ended = true
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

  it('passes SSR output to the root view when a page opts in', async function () {
    const bundle = createSsrBundle(`
      export default async function render(page) {
        return {
          head: ['<title>' + page.component + '</title>'],
          body: '<script type="application/json" data-page="app">' + JSON.stringify(page) + '</script><div id="app" data-server-rendered="true">' + page.props.message + '</div>'
        }
      }
    `)
    const req = createRequest({
      ssr: {
        enabled: true,
        bundle,
        pages: false
      }
    })
    const res = createResponse()

    await render(req, res, {
      page: 'dashboard/index',
      props: {
        message: 'Rendered on the server'
      },
      ssr: true
    })

    assert.equal(res.viewName, 'app')
    assert.deepEqual(res.viewData.ssr.head, ['<title>dashboard/index</title>'])
    assert.match(res.viewData.ssr.body, /data-server-rendered="true"/)
    assert.match(res.viewData.ssr.body, /Rendered on the server/)
  })

  it('supports page selectors for SSR', async function () {
    const bundle = createSsrBundle(`
      export default function render(page) {
        return { head: [], body: '<div id="app">' + page.component + '</div>' }
      }
    `)
    const req = createRequest({
      ssr: {
        enabled: true,
        bundle,
        pages: ['dashboard/index']
      }
    })
    const res = createResponse()

    await render(req, res, {
      page: 'dashboard/index',
      props: {}
    })

    assert.match(res.viewData.ssr.body, /dashboard\/index/)
  })

  it('renders all pages when SSR is enabled without a page selector', async function () {
    const bundle = createSsrBundle(`
      export default function render(page) {
        return { head: [], body: '<div id="app">' + page.component + '</div>' }
      }
    `)
    const req = createRequest({
      ssr: {
        enabled: true,
        bundle
      }
    })
    const res = createResponse()

    await render(req, res, {
      page: 'dashboard/index',
      props: {}
    })

    assert.match(res.viewData.ssr.body, /dashboard\/index/)
  })

  it('allows a response to opt out of configured SSR', async function () {
    const bundle = createSsrBundle(`
      export default function render() {
        return { head: [], body: '<div id="app">SSR</div>' }
      }
    `)
    const req = createRequest({
      ssr: {
        enabled: true,
        bundle,
        pages: true
      }
    })
    const res = createResponse()

    await render(req, res, {
      page: 'dashboard/index',
      props: {},
      ssr: false
    })

    assert.equal(res.viewData.ssr, null)
  })
})
