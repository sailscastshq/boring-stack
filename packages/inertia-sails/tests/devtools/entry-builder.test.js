const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const createRedactor = require('../../lib/devtools/redactor')
const {
  captureBodyString,
  captureBodyValue,
  captureRawResponseBody,
  captureRequestBody,
  resolveRequestType,
  summarizeUploads
} = require('../../lib/devtools/entry-builder')
const {
  BODY_OMISSION_REASONS,
  HEADERS
} = require('../../lib/devtools/constants')
const {
  INERTIA,
  PARTIAL_COMPONENT,
  PRECOGNITION
} = require('../../lib/helpers/inertia-headers')

/**
 * @param {Record<string, any>} headers
 * @param {Record<string, any>} [overrides]
 * @returns {any}
 */
function request(headers = {}, overrides = {}) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )
  return {
    method: 'GET',
    headers: normalized,
    get(/** @type {string} */ name) {
      return normalized[name.toLowerCase()]
    },
    ...overrides
  }
}

describe('DevTools entry builder', function () {
  it('derives request types in protocol order', function () {
    assert.equal(
      resolveRequestType(request({ [PRECOGNITION]: 'true' }), false),
      'precognition'
    )
    assert.equal(resolveRequestType(request(), true), 'initial')
    assert.equal(resolveRequestType(request(), false), 'http')
    assert.equal(
      resolveRequestType(
        request({ [INERTIA]: 'true', [HEADERS.DEFERRED]: 'true' }),
        true
      ),
      'deferred'
    )
    assert.equal(
      resolveRequestType(
        request({ [INERTIA]: 'true', [HEADERS.POLL]: 'true' }),
        true
      ),
      'poll'
    )
    assert.equal(
      resolveRequestType(
        request({ [INERTIA]: 'true', [PARTIAL_COMPONENT]: 'users/index' }),
        true
      ),
      'partial'
    )
    assert.equal(
      resolveRequestType(
        request({ [INERTIA]: 'true', Purpose: 'prefetch' }),
        true
      ),
      'prefetch'
    )
    assert.equal(
      resolveRequestType(request({ [INERTIA]: 'true' }), true),
      'navigate'
    )
  })

  it('omits bodies for non-Inertia write requests', function () {
    const body = captureRequestBody(
      request({}, { method: 'POST', body: { email: 'ada@example.com' } }),
      createRedactor(),
      256_000
    )

    assert.deepEqual(body, {
      status: 'omitted',
      reason: BODY_OMISSION_REASONS.NON_INERTIA_REQUEST
    })
  })

  it('redacts nested request body values', function () {
    const body = captureRequestBody(
      request(
        { [INERTIA]: 'true' },
        {
          method: 'POST',
          body: {
            email: 'ada@example.com',
            profile: { password: 'secret' }
          }
        }
      ),
      createRedactor({ keys: ['password'] }),
      256_000
    )

    assert.deepEqual(body, {
      status: 'present',
      value: {
        email: 'ada@example.com',
        profile: { password: '[REDACTED]' }
      }
    })
  })

  it('summarizes uploaded files without retaining filesystem handles', function () {
    assert.deepEqual(
      summarizeUploads({
        avatar: {
          originalFilename: 'ada.png',
          size: 42,
          mimeType: 'image/png',
          fd: '/private/tmp/upload'
        }
      }),
      {
        avatar: {
          name: 'ada.png',
          size: 42,
          mimeType: 'image/png'
        }
      }
    )
  })

  it('omits oversized and binary textual bodies', function () {
    assert.deepEqual(captureBodyString('too long', 3), {
      status: 'omitted',
      reason: BODY_OMISSION_REASONS.TOO_LARGE
    })
    assert.deepEqual(captureBodyString(Buffer.from([0xff, 0xfe]), 10), {
      status: 'omitted',
      reason: BODY_OMISSION_REASONS.BINARY
    })
  })
  it('applies size limits to structured request and response bodies', function () {
    const redactor = createRedactor()
    const large = { text: 'x'.repeat(100) }
    const omitted = { status: 'omitted', reason: 'too-large' }
    assert.deepEqual(captureBodyValue(large, redactor, 20), omitted)
    assert.deepEqual(
      captureRequestBody(
        request(
          { [INERTIA]: 'true' },
          {
            method: 'POST',
            body: large
          }
        ),
        redactor,
        20
      ),
      omitted
    )
    assert.deepEqual(
      captureRawResponseBody(
        { value: JSON.stringify(large) },
        {
          headers: { 'content-type': 'application/json' }
        },
        redactor,
        20
      ),
      omitted
    )
  })

  it('redacts raw JSON requests and omits raw multipart uploads', function () {
    const redactor = createRedactor({ keys: ['password'] })
    assert.deepEqual(
      captureRequestBody(
        request(
          { [INERTIA]: 'true' },
          {
            method: 'POST',
            rawBody: '{"password":"secret"}'
          }
        ),
        redactor,
        256_000
      ),
      {
        status: 'present',
        value: { password: '[REDACTED]' }
      }
    )
    assert.deepEqual(
      captureRequestBody(
        request(
          {
            [INERTIA]: 'true',
            'Content-Type': 'multipart/form-data; boundary=test'
          },
          { method: 'POST', rawBody: 'raw file contents' }
        ),
        redactor,
        256_000
      ),
      {
        status: 'omitted',
        reason: 'multipart'
      }
    )
  })
})
