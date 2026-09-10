const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('events')
const fs = require('fs')
const os = require('os')
const path = require('path')
const createDevTools = require('../../lib/devtools')
const requestContext = require('../../lib/helpers/request-context')
const { HEADERS } = require('../../lib/devtools/constants')
const { INERTIA } = require('../../lib/helpers/inertia-headers')

class MockResponse extends EventEmitter {
  constructor() {
    super()
    /** @type {Record<string, any>} */
    this.headers = {}
    this.statusCode = 200
    this.body = null
  }

  /**
   * @param {string} name
   * @param {any} value
   * @returns {MockResponse}
   */
  set(name, value) {
    this.headers[name.toLowerCase()] = value
    return this
  }

  /**
   * @param {string} name
   * @param {any} value
   */
  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value
  }

  /**
   * @param {string} name
   * @returns {any}
   */
  getHeader(name) {
    return this.headers[name.toLowerCase()]
  }

  /**
   * @returns {Record<string, any>}
   */
  getHeaders() {
    return { ...this.headers }
  }

  /**
   * @param {string} name
   */
  removeHeader(name) {
    delete this.headers[name.toLowerCase()]
  }

  /**
   * @param {number} status
   * @returns {MockResponse}
   */
  status(status) {
    this.statusCode = status
    return this
  }

  /**
   * @param {any} body
   * @returns {MockResponse}
   */
  json(body) {
    this.setHeader('Content-Type', 'application/json')
    return this.send(JSON.stringify(body))
  }

  /**
   * @param {any} body
   * @returns {MockResponse}
   */
  send(body) {
    if (!this.getHeader('Content-Type')) {
      this.setHeader('Content-Type', 'text/html; charset=utf-8')
    }
    return this.end(body)
  }

  /**
   * @param {any} [body]
   * @returns {MockResponse}
   */
  end(body) {
    this.body = body
    this.emit('finish')
    return this
  }

  /**
   * @param {any} _chunk
   * @returns {boolean}
   */
  write(_chunk) {
    return true
  }
}

/**
 * @param {string} appPath
 * @param {Record<string, any>} [headers]
 * @returns {any}
 */
function createRequest(appPath, headers = {}) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )
  return {
    method: 'GET',
    url: '/dashboard',
    originalUrl: '/dashboard',
    path: '/dashboard',
    protocol: 'http',
    headers: { host: 'localhost:1337', ...normalized },
    route: { path: '/dashboard' },
    options: { action: 'dashboard/view-dashboard' },
    get(/** @type {string} */ name) {
      return this.headers[name.toLowerCase()]
    },
    _appPath: appPath
  }
}

/**
 * @param {string} appPath
 * @param {Record<string, any>} [devtools]
 * @param {string} [environment]
 * @returns {any}
 */
function createSails(appPath, devtools = {}, environment = 'development') {
  return {
    config: {
      appPath,
      environment,
      paths: {
        controllers: path.join(appPath, 'api/controllers')
      },
      inertia: { devtools }
    },
    log: { warn() {} }
  }
}

function createFixtureApp() {
  const appPath = fs.mkdtempSync(path.join(os.tmpdir(), 'inertia-sails-app-'))
  fs.mkdirSync(path.join(appPath, 'api/controllers/dashboard'), {
    recursive: true
  })
  fs.mkdirSync(path.join(appPath, 'assets/js/pages/dashboard'), {
    recursive: true
  })
  fs.writeFileSync(
    path.join(appPath, 'api/controllers/dashboard/view-dashboard.js'),
    `module.exports = {
  fn: async function () {
    return {
      page: 'dashboard/index',
      props: {
        user: { id: 1 }
      }
    }
  }
}
`
  )
  fs.writeFileSync(
    path.join(appPath, 'assets/js/pages/dashboard/index.js'),
    'export default function Dashboard() {}\n'
  )
  return appPath
}

describe('DevTools request recorder', function () {
  it('records and injects an initial Inertia page synchronously', function () {
    const appPath = createFixtureApp()
    const sails = createSails(appPath)
    const devTools = createDevTools(sails)
    const req = createRequest(appPath)
    const res = new MockResponse()

    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => {
        const recorder = requestContext.getDevToolsRecorder()
        recorder.pageRendering('dashboard/index', [])
        recorder.propResolved(
          'user',
          { id: 1, password: 'secret' },
          { id: 1, password: 'secret' }
        )
        recorder.pageRendered({
          component: 'dashboard/index',
          url: '/dashboard',
          version: 'test',
          props: { user: { id: 1, password: 'secret' } }
        })
        res.send('<html><body><div id="app"></div></body></html>')
      })
    })

    const id = res.getHeader(HEADERS.ID)
    const entry = devTools.repository.get(id)

    assert.match(id, /^[0-9a-f-]{36}$/)
    assert.equal(res.getHeader(HEADERS.PARENT_OUT), id)
    assert.match(
      String(res.body),
      new RegExp(
        `<script data-inertia-devtools-id type="application/json">"${id}"</script></body>`
      )
    )
    assert.equal(entry.__meta.requestType, 'initial')
    assert.equal(entry.__meta.component, 'dashboard/index')
    assert.equal(entry.props.user.inertiaType, null)
    assert.deepEqual(entry.propValues.user, {
      id: 1,
      password: '[REDACTED]'
    })
    assert.match(entry.route.actionSource.file, /view-dashboard\.js$/)
    assert.match(entry.renderSource.file, /view-dashboard\.js$/)
    assert.match(
      entry.componentPath,
      /assets\/js\/pages\/dashboard\/index\.js$/
    )
  })

  it('records plain HTTP responses without injecting discovery HTML', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const req = createRequest(appPath)
    req.url = '/health'
    req.originalUrl = '/health'
    req.path = '/health'
    req.route = { path: '/health' }
    req.options = {}
    const res = new MockResponse()
    res.setHeader('Content-Type', 'text/plain')

    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => res.send('healthy'))
    })

    const entry = devTools.repository.get(res.getHeader(HEADERS.ID))
    assert.equal(res.body, 'healthy')
    assert.equal(entry.__meta.requestType, 'http')
    assert.deepEqual(entry.http.responseBody, {
      status: 'present',
      value: 'healthy'
    })
  })

  it('records client correlation and keeps a batch parent on deferred visits', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const req = createRequest(appPath, {
      [INERTIA]: 'true',
      [HEADERS.PARENT]: 'batch-root',
      [HEADERS.TAB]: 'tab-uuid',
      [HEADERS.VISIT]: 'visit-uuid',
      [HEADERS.DEFERRED]: 'true'
    })
    const res = new MockResponse()

    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => {
        const recorder = requestContext.getDevToolsRecorder()
        recorder.pageRendering('dashboard/index', [])
        recorder.propResolved('analytics', [1, 2], [1, 2])
        recorder.pageRendered({
          component: 'dashboard/index',
          url: '/dashboard',
          version: 'test',
          props: { analytics: [1, 2] }
        })
        res.json({ ok: true })
      })
    })

    const entry = devTools.repository.get(res.getHeader(HEADERS.ID))
    assert.equal(res.getHeader(HEADERS.PARENT_OUT), 'batch-root')
    assert.equal(entry.__meta.batchId, 'batch-root')
    assert.equal(entry.__meta.tabUuid, 'tab-uuid')
    assert.equal(entry.__meta.visitId, 'visit-uuid')
    assert.equal(entry.__meta.requestType, 'deferred')
    assert.doesNotMatch(String(res.body), /data-inertia-devtools-id/)
  })

  it('excludes DevTools endpoints from recording', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const req = createRequest(appPath)
    req.url = '/_inertia/devtools/entries'
    req.originalUrl = req.url
    req.path = req.url
    const res = new MockResponse()
    let continued = false

    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => {
        continued = true
      })
    })

    assert.equal(continued, true)
    assert.equal(res.getHeader(HEADERS.ID), undefined)
  })

  it('does no response instrumentation when disabled', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath, {}, 'production'))
    const req = createRequest(appPath)
    const res = new MockResponse()
    let continued = false

    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => {
        continued = true
      })
    })

    assert.equal(continued, true)
    assert.equal(requestContext.getDevToolsRecorder(), null)
    assert.equal(res.getHeader(HEADERS.ID), undefined)
  })

  it('never lets a recorder failure change the application response', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const req = createRequest(appPath)
    const res = new MockResponse()
    devTools.repository.record = () => {
      throw new Error('storage unavailable')
    }

    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => res.send('still healthy'))
    })

    assert.equal(res.statusCode, 200)
    assert.equal(res.body, 'still healthy')
  })

  it('fails closed outside development without an authorizer', async function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(
      createSails(appPath, { enabled: true }, 'production')
    )
    const req = createRequest(appPath)
    req.params = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
    const res = new MockResponse()

    await devTools.show(req, res)

    assert.equal(res.statusCode, 403)
  })

  it('serves stored entries through an approved production authorizer', async function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(
      createSails(
        appPath,
        {
          enabled: true,
          authorize: async () => true
        },
        'production'
      )
    )
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    devTools.repository.record({
      __meta: {
        id,
        utime: Date.now() / 1000,
        tabUuid: null,
        component: null,
        requestType: 'http'
      }
    })
    const req = createRequest(appPath)
    req.params = { id }
    const res = new MockResponse()

    await devTools.show(req, res)

    assert.equal(res.statusCode, 200)
    assert.equal(JSON.parse(String(res.body)).__meta.id, id)
  })
  it('preserves correlation for plain HTTP requests and redirects', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const req = createRequest(appPath, { [HEADERS.PARENT]: 'batch-root' })
    const res = new MockResponse()
    res.statusCode = 302
    res.setHeader('Location', '/dashboard')
    requestContext.run(req, res, () => {
      devTools.middleware(req, res, () => res.end())
    })
    const entry = devTools.repository.get(res.getHeader(HEADERS.ID))
    assert.equal(entry.__meta.batchId, 'batch-root')
    assert.equal(entry.__meta.redirectLocation, '/dashboard')
    assert.equal(res.getHeader(HEADERS.PARENT_OUT), 'batch-root')
  })

  it('lists newest entries first and protects the index outside development', async function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const now = Date.now() / 1000
    for (const [id, utime] of [
      ['old-entry', now - 1],
      ['new-entry', now]
    ]) {
      devTools.repository.record({ __meta: { id, utime } })
    }
    const req = createRequest(appPath)
    const res = new MockResponse()
    await devTools.index(req, res)
    assert.deepEqual(
      JSON.parse(String(res.body)).map((/** @type {any} */ e) => e.__meta.id),
      ['new-entry', 'old-entry']
    )
    const production = createDevTools(
      createSails(appPath, { enabled: true }, 'production')
    )
    const denied = new MockResponse()
    await production.index(req, denied)
    assert.equal(denied.statusCode, 403)
  })
  it('does not inject discovery into streamed response chunks', function () {
    const appPath = createFixtureApp()
    const devTools = createDevTools(createSails(appPath))
    const req = createRequest(appPath)
    const res = new MockResponse()
    requestContext.run(req, res, () =>
      devTools.middleware(req, res, () => {
        const recorder = requestContext.getDevToolsRecorder()
        recorder.pageRendering('dashboard/index', [])
        recorder.pageRendered({ component: 'dashboard/index', props: {} })
        res.write('<html><body>')
        res.end('</body></html>')
      })
    )
    assert.equal(res.body, '</body></html>')
  })
})
