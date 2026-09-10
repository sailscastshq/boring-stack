const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const createRedactor = require('../../lib/devtools/redactor')

describe('DevTools redaction', function () {
  it('redacts nested keys case-insensitively', function () {
    const redactor = createRedactor({ keys: ['password', 'api_key'] })

    assert.deepEqual(
      redactor.redact({
        Password: 'secret',
        profile: { api_key: 'key', name: 'Ada' }
      }),
      {
        Password: '[REDACTED]',
        profile: { api_key: '[REDACTED]', name: 'Ada' }
      }
    )
  })

  it('redacts sensitive headers case-insensitively', function () {
    const redactor = createRedactor({ headers: ['authorization', 'cookie'] })

    assert.deepEqual(
      redactor.redactHeaders({
        Authorization: 'Bearer secret',
        Cookie: ['session=secret'],
        Accept: 'application/json'
      }),
      {
        authorization: '[REDACTED]',
        cookie: '[REDACTED]',
        accept: 'application/json'
      }
    )
  })

  it('redacts simple and nested query parameter names', function () {
    const redactor = createRedactor({ keys: ['token', 'secret'] })
    const redacted = new URL(
      redactor.redactUrl(
        'https://example.com/users?token=one&filter%5Bsecret%5D=two&page=1'
      )
    )

    assert.equal(redacted.searchParams.get('token'), '[REDACTED]')
    assert.equal(redacted.searchParams.get('filter[secret]'), '[REDACTED]')
    assert.equal(redacted.searchParams.get('page'), '1')
    assert.equal(
      redactor.redactUrl('/login?token=secret&next=%2Fdashboard'),
      '/login?token=%5BREDACTED%5D&next=%2Fdashboard'
    )
  })

  it('keeps circular or unsupported values from breaking persistence', function () {
    /** @type {Record<string, any>} */
    const value = { count: 1, bigint: BigInt(2) }
    value.circular = value

    assert.deepEqual(createRedactor().redact(value), {
      count: 1,
      bigint: '[UNSERIALIZABLE]',
      circular: '[UNSERIALIZABLE]'
    })
  })
  it('redacts dotted props and query secrets in diagnostic headers', function () {
    const redactor = createRedactor({ keys: ['password', 'token'] })
    assert.deepEqual(redactor.redact({ 'user.password': 'secret' }), {
      'user.password': '[REDACTED]'
    })
    const headers = redactor.redactHeaders({
      Referer: 'https://example.com/?user.token=secret',
      Location: '/login?token=secret'
    })
    assert.equal(
      new URL(headers.referer).searchParams.get('user.token'),
      '[REDACTED]'
    )
    assert.equal(headers.location, '/login?token=%5BREDACTED%5D')
  })
})
