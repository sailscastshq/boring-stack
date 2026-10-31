const { after, before, describe, it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { INERTIA } = require('../lib/helpers/inertia-headers')

const REQUEST_TIMEOUT_MS = 5000

/** @type {any} */
let app
/** @type {string} */
let baseUrl

/**
 * @returns {Promise<any>}
 */
function liftApp() {
  const Sails = require('sails').constructor
  const sails = new Sails()

  return new Promise((resolve, reject) => {
    sails.lift(
      {
        appPath: path.join(__dirname, 'fixtures', 'actions2-app'),
        environment: 'development',
        port: 0,
        log: { level: 'silent' },
        globals: false,
        session: { secret: 'inertia-sails-test' },
        inertia: { devtools: { enabled: false } },
        hooks: {
          grunt: false,
          views: false,
          orm: false,
          pubsub: false,
          sockets: false,
          blueprints: false,
          i18n: false,
          inertia: require('../index')
        },
        routes: {
          'POST /links': { action: 'links/create' }
        }
      },
      /** @param {Error} [err] */
      (err) => (err ? reject(err) : resolve(sails))
    )
  })
}

/**
 * @param {Record<string, any>} body
 * @param {Record<string, string>} [headers]
 * @returns {Promise<Response>}
 */
function postLink(body, headers = {}) {
  return fetch(`${baseUrl}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers
    },
    body: JSON.stringify(body),
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })
}

describe('Actions2 bad requests with inertia-sails', function () {
  before(async function () {
    app = await liftApp()
    baseUrl = `http://127.0.0.1:${app.hooks.http.server.address().port}`
  })

  after(async function () {
    if (!app) return

    await new Promise((resolve) => app.lower(resolve))
  })

  it('responds 400 to a JSON request with an invalid input', async function () {
    const response = await postLink({
      url: `https://example.com/${'a'.repeat(2048)}`
    })
    const body = await response.json()

    assert.equal(response.status, 400)
    assert.equal(body.code, 'E_MISSING_OR_INVALID_PARAMS')
    assert.ok(Array.isArray(body.problems))
    assert.ok(body.problems.length > 0)
  })

  it('completes a JSON request with a valid input', async function () {
    const response = await postLink({ url: 'https://example.com/docs' })

    assert.equal(response.status, 201)
    assert.deepEqual(await response.json(), {
      url: 'https://example.com/docs'
    })
  })

  it('redirects Inertia requests with invalid inputs back with errors', async function () {
    const response = await postLink(
      { url: `https://example.com/${'a'.repeat(2048)}` },
      {
        [INERTIA]: 'true',
        Referer: '/links/new'
      }
    )

    assert.equal(response.status, 303)
    assert.equal(response.headers.get('location'), '/links/new')
  })
})
