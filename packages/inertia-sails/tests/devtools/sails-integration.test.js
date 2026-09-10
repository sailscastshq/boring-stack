const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
// @ts-ignore -- Sails does not publish bundled type declarations.
const Sails = require('sails').Sails
const { HEADERS } = require('../../lib/devtools/constants')

/**
 * @param {any} app
 * @param {Record<string, any>} options
 * @returns {Promise<void>}
 */
function load(app, options) {
  return new Promise((resolve, reject) => {
    app.load(options, (/** @type {any} */ error) =>
      error ? reject(error) : resolve()
    )
  })
}

/**
 * @param {any} app
 * @returns {Promise<void>}
 */
function lower(app) {
  return new Promise((resolve) => app.lower(resolve))
}

/**
 * @param {any} app
 * @param {Record<string, any>} options
 * @returns {Promise<{response: any, body: any}>}
 */
function request(app, options) {
  return new Promise((resolve, reject) => {
    app.request(
      options,
      (
        /** @type {any} */ error,
        /** @type {any} */ response,
        /** @type {any} */ body
      ) => {
        if (error) return reject(error)
        resolve({ response, body })
      }
    )
  })
}

describe('DevTools Sails integration', function () {
  it('records a real Sails Inertia request and serves its entry', async function () {
    const app = new Sails()
    const storagePath = fs.mkdtempSync(
      path.join(os.tmpdir(), 'inertia-sails-live-')
    )
    const appPath = fs.mkdtempSync(path.join(os.tmpdir(), 'inertia-sails-app-'))
    const workspacePath = path.resolve(__dirname, '../../../..')
    fs.writeFileSync(
      path.join(appPath, 'package.json'),
      JSON.stringify({
        name: 'inertia-sails-integration-test',
        private: true,
        dependencies: {
          'inertia-sails': '1.5.0',
          'sails-flash': '0.0.1'
        }
      })
    )
    fs.symlinkSync(
      path.join(workspacePath, 'node_modules'),
      path.join(appPath, 'node_modules'),
      'dir'
    )
    await load(app, {
      appPath,
      environment: 'development',
      globals: false,
      log: { level: 'error' },
      installedHooks: {
        'inertia-sails': {}
      },
      hooks: {
        grunt: false,
        orm: false,
        sockets: false,
        pubsub: false
      },
      routes: {
        'GET /__inertia-devtools-smoke': function devToolsSmoke(
          /** @type {any} */ req,
          /** @type {any} */ res
        ) {
          return req._sails.inertia.render(req, res, {
            page: 'devtools/smoke',
            props: {
              message: 'Recorded through Sails'
            }
          })
        }
      },
      inertia: {
        version: 'test-version',
        devtools: {
          storage: {
            path: storagePath
          }
        }
      }
    })

    try {
      const { response, body } = await request(app, {
        method: 'GET',
        url: '/__inertia-devtools-smoke',
        headers: {
          'X-Inertia': 'true',
          Accept: 'application/json'
        }
      })
      const id = response.headers[HEADERS.ID.toLowerCase()]

      assert.equal(response.statusCode, 200)
      assert.match(id, /^[0-9a-f-]{36}$/)
      assert.equal(body.component, 'devtools/smoke')
      assert.doesNotMatch(String(body), /data-inertia-devtools-id/)

      const recorded = await request(app, {
        method: 'GET',
        url: `/_inertia/devtools/entries/${id}`,
        headers: { Accept: 'application/json' }
      })

      assert.equal(recorded.response.statusCode, 200)
      assert.equal(recorded.body.__meta.id, id)
      assert.equal(recorded.body.__meta.requestType, 'navigate')
      assert.equal(recorded.body.__meta.component, 'devtools/smoke')
      assert.equal(recorded.body.propValues.message, 'Recorded through Sails')
    } finally {
      await lower(app)
      fs.rmSync(appPath, { recursive: true, force: true })
      fs.rmSync(storagePath, { recursive: true, force: true })
    }
  })
})
