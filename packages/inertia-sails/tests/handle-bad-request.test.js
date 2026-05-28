const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const handleBadRequest = require('../lib/handle-bad-request')
const {
  INERTIA,
  PRECOGNITION,
  PRECOGNITION_SUCCESS,
  PRECOGNITION_VALIDATE_ONLY
} = require('../lib/helpers/inertia-headers')

/**
 * @param {Object} [options]
 * @param {Record<string, any>} [options.headers]
 * @returns {any}
 */
function createRequest({ headers = {} } = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )

  return {
    session: {},
    headers: normalizedHeaders,
    _sails: {
      log: {
        info() {}
      }
    },
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
    redirectArgs: /** @type {any[]|null} */ (null),
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
    /**
     * @param {any} body
     * @returns {any}
     */
    json(body) {
      this.body = body
      return this
    },
    end() {
      this.ended = true
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
     * @param {number} statusCode
     * @returns {any}
     */
    sendStatus(statusCode) {
      this.statusCode = statusCode
      return this
    },
    /**
     * @param {any} body
     * @returns {any}
     */
    send(body) {
      this.body = body
      return this
    }
  }
}

describe('handleBadRequest', function () {
  it('returns Precognition validation errors as 422 JSON', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true'
      }
    })
    const res = createResponse()

    handleBadRequest(req, res, {
      problems: [{ email: 'Email is already taken.' }]
    })

    assert.equal(res.statusCode, 422)
    assert.deepEqual(res.body, {
      errors: {
        email: ['Email is already taken']
      }
    })
    assert.equal(res.headers[PRECOGNITION], 'true')
    assert.equal(res.headers.Vary, PRECOGNITION)
    assert.equal(req.session.errors, undefined)
    assert.equal(res.redirectArgs, null)
  })

  it('limits Precognition errors to requested fields', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true',
        [PRECOGNITION_VALIDATE_ONLY]: 'email'
      }
    })
    const res = createResponse()

    handleBadRequest(req, res, {
      problems: [
        { email: 'Email is invalid.' },
        { password: 'Password is required.' }
      ]
    })

    assert.deepEqual(res.body, {
      errors: {
        email: ['Email is invalid']
      }
    })
  })

  it('treats unrelated validate-only errors as a successful Precognition response', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true',
        [PRECOGNITION_VALIDATE_ONLY]: 'fullName'
      }
    })
    const res = createResponse()

    handleBadRequest(req, res, {
      problems: [
        { email: 'Email is required.' },
        { password: 'Password is required.' }
      ]
    })

    assert.equal(res.statusCode, 204)
    assert.equal(res.ended, true)
    assert.equal(res.body, null)
    assert.equal(res.headers[PRECOGNITION_SUCCESS], 'true')
  })

  it('normalizes Sails input validation errors for Precognition', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true'
      }
    })
    const res = createResponse()
    const error = new Error('Invalid inputs')
    error.problems = ['"email" must be a valid email address']

    handleBadRequest(req, res, error)

    assert.deepEqual(res.body, {
      errors: {
        email: ['Please enter a valid email address']
      }
    })
  })

  it('normalizes Anchor email validation errors for Precognition', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true'
      }
    })
    const res = createResponse()
    const error = new Error('Invalid inputs')
    error.problems = [
      "Invalid email: Value ('not-an-email') was not a valid email address"
    ]

    handleBadRequest(req, res, error)

    assert.equal(res.statusCode, 422)
    assert.deepEqual(res.body, {
      errors: {
        email: ['Please enter a valid email address']
      }
    })
  })

  it('humanizes structured Anchor validation errors for Precognition', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true'
      }
    })
    const res = createResponse()

    handleBadRequest(req, res, {
      problems: [
        {
          password: [
            {
              rule: 'minLength',
              message:
                "Value ('short') was shorter than the configured minimum length (8)"
            }
          ]
        }
      ]
    })

    assert.deepEqual(res.body, {
      errors: {
        password: ['Password must be at least 8 characters']
      }
    })
  })

  it('humanizes RTTC validation errors for Precognition', function () {
    const req = createRequest({
      headers: {
        [PRECOGNITION]: 'true'
      }
    })
    const res = createResponse()

    handleBadRequest(req, res, {
      errors: [
        {
          code: 'E_NOT_EVEN_CLOSE',
          hops: ['profile', 'displayName'],
          actual: undefined,
          expected: 'string'
        }
      ]
    })

    assert.deepEqual(res.body, {
      errors: {
        'profile.displayName': ['Profile display name is required']
      }
    })
  })

  it('keeps normal Inertia badRequest redirects unchanged', function () {
    const req = createRequest({
      headers: {
        [INERTIA]: 'true',
        Referrer: '/signup'
      }
    })
    const res = createResponse()

    handleBadRequest(req, res, {
      problems: [{ email: 'Email is already taken.' }]
    })

    assert.deepEqual(req.session.errors, {
      email: ['Email is already taken']
    })
    assert.deepEqual(res.redirectArgs, [303, '/signup'])
    assert.equal(res.statusCode, null)
  })

  it('stores friendly Anchor validation errors for normal Inertia requests', function () {
    const req = createRequest({
      headers: {
        [INERTIA]: 'true',
        Referrer: '/forgot-password'
      }
    })
    const res = createResponse()
    const error = new Error('Invalid inputs')
    error.problems = [
      "Invalid email: Value ('not-an-email') was not a valid email address"
    ]

    handleBadRequest(req, res, error)

    assert.deepEqual(req.session.errors, {
      email: ['Please enter a valid email address']
    })
    assert.deepEqual(res.redirectArgs, [303, '/forgot-password'])
  })
})
