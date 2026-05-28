const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const defineInertiaHook = require('../..')
const {
  PRECOGNITION,
  PRECOGNITION_SUCCESS,
  PRECOGNITION_VALIDATE_ONLY
} = require('../../lib/helpers/inertia-headers')
const requestContext = require('../../lib/helpers/request-context')

function createHook() {
  /** @type {Record<string, any>} */
  const sails = {
    config: {
      inertia: {
        history: {
          encrypt: false
        }
      }
    },
    log: {
      warn() {}
    }
  }
  const hook = defineInertiaHook(/** @type {any} */ (sails))
  sails.inertia = hook
  return hook
}

/**
 * @param {Record<string, any>} headers
 * @returns {any}
 */
function createRequest(headers = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    headers: normalizedHeaders,
    /**
     * @param {string} header
     * @returns {any}
     */
    get(header) {
      return normalizedHeaders[header.toLowerCase()]
    }
  }
}

function createResponse() {
  /** @type {Record<string, any>} */
  const headers = {}

  return {
    headers,
    statusCode: /** @type {number|null} */ (null),
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
    }
  }
}

/**
 * @param {Record<string, any>} req
 * @param {Record<string, any>} res
 * @param {() => any} callback
 * @returns {Promise<any>}
 */
function runWithContext(req, res, callback) {
  return new Promise((resolve, reject) => {
    requestContext.run(
      /** @type {any} */ (req),
      /** @type {any} */ (res),
      async () => {
        try {
          resolve(await callback())
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

describe('precognition helpers', function () {
  it('detects Precognition requests', function () {
    const hook = createHook()

    assert.equal(hook.isPrecognitive(createRequest()), false)
    assert.equal(
      hook.isPrecognitive(createRequest({ [PRECOGNITION]: 'true' })),
      true
    )
  })

  it('parses Precognition-Validate-Only fields', function () {
    const hook = createHook()
    const req = createRequest({
      [PRECOGNITION_VALIDATE_ONLY]: 'name,email, team.slug '
    })

    assert.deepEqual(hook.validateOnly(req), ['name', 'email', 'team.slug'])
  })

  it('uses validate-only fields to decide if a field should validate', function () {
    const hook = createHook()
    const req = createRequest({
      [PRECOGNITION]: 'true',
      [PRECOGNITION_VALIDATE_ONLY]: 'email,addresses.0.city'
    })

    assert.equal(hook.shouldValidate('email', req), true)
    assert.equal(hook.shouldValidate('password', req), false)
    assert.equal(hook.shouldValidate('addresses.*.city', req), true)
  })

  it('treats normal requests as full validation requests', function () {
    const hook = createHook()

    assert.equal(hook.shouldValidate('email', createRequest()), true)
  })

  it('handles a successful Precognition response', function () {
    const hook = createHook()
    const req = createRequest({ [PRECOGNITION]: 'true' })
    const res = createResponse()

    hook.handlePrecognitionSuccess(req, res)

    assert.equal(res.statusCode, 204)
    assert.equal(res.ended, true)
    assert.equal(res.headers[PRECOGNITION], 'true')
    assert.equal(res.headers[PRECOGNITION_SUCCESS], 'true')
    assert.equal(res.headers.Vary, PRECOGNITION)
  })

  it('sends a successful Precognition response from request context', async function () {
    const hook = createHook()
    const req = createRequest({ [PRECOGNITION]: 'true' })
    const res = createResponse()

    await runWithContext(req, res, async () => {
      hook.precognitionSuccess()
    })

    assert.equal(res.statusCode, 204)
    assert.equal(res.ended, true)
    assert.equal(res.headers[PRECOGNITION], 'true')
    assert.equal(res.headers[PRECOGNITION_SUCCESS], 'true')
    assert.equal(res.headers.Vary, PRECOGNITION)
  })
})
