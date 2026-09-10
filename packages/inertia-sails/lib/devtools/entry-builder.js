const { isUtf8 } = require('buffer')
const {
  INERTIA,
  LOCATION,
  PARTIAL_COMPONENT,
  PRECOGNITION
} = require('../helpers/inertia-headers')
const { BODY_OMISSION_REASONS, HEADERS, REQUEST_TYPES } = require('./constants')
const { readHeader } = require('./prop-classifier')

/**
 * @param {any} req
 * @returns {boolean}
 */
function isPrefetch(req) {
  return (
    readHeader(req, 'Purpose') === 'prefetch' ||
    readHeader(req, 'Sec-Purpose') === 'prefetch'
  )
}

/**
 * @param {any} req
 * @param {boolean} renderedPage
 * @returns {string}
 */
function resolveRequestType(req, renderedPage) {
  if (readHeader(req, PRECOGNITION) !== null) {
    return REQUEST_TYPES.PRECOGNITION
  }

  if (readHeader(req, INERTIA) === null) {
    return renderedPage ? REQUEST_TYPES.INITIAL : REQUEST_TYPES.HTTP
  }

  if (readHeader(req, HEADERS.DEFERRED) !== null) {
    return REQUEST_TYPES.DEFERRED
  }

  if (readHeader(req, HEADERS.POLL) !== null) {
    return REQUEST_TYPES.POLL
  }

  if (readHeader(req, PARTIAL_COMPONENT) !== null) {
    return REQUEST_TYPES.PARTIAL
  }

  if (isPrefetch(req)) {
    return REQUEST_TYPES.PREFETCH
  }

  return REQUEST_TYPES.NAVIGATE
}

/**
 * @param {any} req
 * @returns {string}
 */
function absoluteRequestUrl(req) {
  const forwardedProtocol = readHeader(req, 'X-Forwarded-Proto')
  const protocol = (forwardedProtocol || req.protocol || 'http')
    .split(',')[0]
    .trim()
  const host = (
    readHeader(req, 'X-Forwarded-Host') ||
    readHeader(req, 'Host') ||
    'localhost'
  )
    .split(',')[0]
    .trim()
  const url = req.originalUrl || req.url || '/'

  try {
    return new URL(url, `${protocol}://${host}`).toString()
  } catch {
    return `${protocol}://${host}${url.startsWith('/') ? url : `/${url}`}`
  }
}

/**
 * @param {any} value
 * @returns {boolean}
 */
function isUploadLike(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (typeof value.originalFilename === 'string' ||
      typeof value.filename === 'string') &&
    ('fd' in value || 'stream' in value || 'size' in value)
  )
}

/**
 * @param {any} value
 * @param {WeakSet<object>} [seen]
 * @returns {any}
 */
function summarizeUploads(value, seen = new WeakSet()) {
  if (isUploadLike(value)) {
    return {
      name: value.originalFilename || value.filename || null,
      size: typeof value.size === 'number' ? value.size : null,
      mimeType: value.mimeType || value.mimetype || value.type || null
    }
  }
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return '[UNSERIALIZABLE]'
  seen.add(value)

  if (Array.isArray(value)) {
    const result = value.map((item) => summarizeUploads(item, seen))
    seen.delete(value)
    return result
  }

  /** @type {Record<string, any>} */
  const result = {}
  for (const [key, item] of Object.entries(value)) {
    result[key] = summarizeUploads(item, seen)
  }
  seen.delete(value)
  return result
}

/**
 * @returns {{status: 'empty'}}
 */
function emptyBody() {
  return { status: 'empty' }
}

/**
 * @param {string} reason
 * @returns {{status: 'omitted', reason: string}}
 */
function omittedBody(reason) {
  return { status: 'omitted', reason }
}

/**
 * @param {any} value
 * @param {{redact: (value: any) => any}} redactor
 * @param {number} [limit]
 * @returns {Record<string, any>}
 */
function captureBodyValue(value, redactor, limit = 256_000) {
  let encoded

  try {
    encoded = JSON.stringify(value)
  } catch {
    return omittedBody(BODY_OMISSION_REASONS.UNSERIALIZABLE)
  }

  if (typeof encoded !== 'string') {
    return omittedBody(BODY_OMISSION_REASONS.UNSERIALIZABLE)
  }

  if (Buffer.byteLength(encoded, 'utf8') > limit) {
    return omittedBody(BODY_OMISSION_REASONS.TOO_LARGE)
  }

  return {
    status: 'present',
    value: redactor.redact(JSON.parse(encoded))
  }
}

/**
 * @param {string|Buffer|null|undefined} value
 * @param {number} limit
 * @returns {Record<string, any>}
 */
function captureBodyString(value, limit) {
  if (value === null || value === undefined || value === '') return emptyBody()

  if (Buffer.isBuffer(value)) {
    if (value.length > limit) {
      return omittedBody(BODY_OMISSION_REASONS.TOO_LARGE)
    }
    if (typeof isUtf8 === 'function' && !isUtf8(value)) {
      return omittedBody(BODY_OMISSION_REASONS.BINARY)
    }
    return { status: 'present', value: value.toString('utf8') }
  }

  if (Buffer.byteLength(value, 'utf8') > limit) {
    return omittedBody(BODY_OMISSION_REASONS.TOO_LARGE)
  }

  return { status: 'present', value }
}

/**
 * Raw request text is captured only when it can be decoded and redacted.
 * @param {string|Buffer} value
 * @param {{redact: (value: any) => any}} redactor
 * @param {number} limit
 * @returns {Record<string, any>}
 */
function captureRequestText(value, redactor, limit) {
  const capture = captureBodyString(value, limit)
  if (capture.status !== 'present') return capture
  try {
    return captureBodyValue(JSON.parse(capture.value), redactor, limit)
  } catch {
    return omittedBody(BODY_OMISSION_REASONS.UNSERIALIZABLE)
  }
}

/**
 * @param {any} req
 * @param {{redact: (value: any) => any}} redactor
 * @param {number} bodyLimit
 * @returns {Record<string, any>}
 */
function captureRequestBody(req, redactor, bodyLimit) {
  const method = String(req.method || 'GET').toUpperCase()
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  if (isWrite && readHeader(req, INERTIA) === null) {
    return omittedBody(BODY_OMISSION_REASONS.NON_INERTIA_REQUEST)
  }

  if ((readHeader(req, 'Content-Type') || '').includes('multipart/')) {
    return omittedBody('multipart')
  }

  const body = req.body
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return captureRequestText(body, redactor, bodyLimit)
  }

  if (
    body !== undefined &&
    body !== null &&
    (typeof body !== 'object' || Object.keys(body).length > 0)
  ) {
    return captureBodyValue(summarizeUploads(body), redactor, bodyLimit)
  }

  const rawBody = req.rawBody
  if (typeof rawBody === 'string' || Buffer.isBuffer(rawBody)) {
    return captureRequestText(rawBody, redactor, bodyLimit)
  }

  return emptyBody()
}

/**
 * @param {any} res
 * @returns {string}
 */
function responseContentType(res) {
  const value =
    typeof res.getHeader === 'function'
      ? res.getHeader('Content-Type')
      : res.headers?.['content-type'] || res.headers?.['Content-Type']
  return Array.isArray(value)
    ? value.join(', ').toLowerCase()
    : String(value || '').toLowerCase()
}

/**
 * @param {any} rawResponse
 * @param {any} res
 * @param {{redact: (value: any) => any}} redactor
 * @param {number} bodyLimit
 * @returns {Record<string, any>}
 */
function captureRawResponseBody(rawResponse, res, redactor, bodyLimit) {
  if (rawResponse?.streamed) {
    return omittedBody(BODY_OMISSION_REASONS.STREAMED)
  }

  const contentType = responseContentType(res)
  if (
    !['json', 'text/', 'xml', 'javascript'].some((needle) =>
      contentType.includes(needle)
    )
  ) {
    return omittedBody(BODY_OMISSION_REASONS.NON_TEXTUAL)
  }

  const value = rawResponse?.value
  if (value === undefined || value === null || value === '') return emptyBody()

  if (typeof value === 'object' && !Buffer.isBuffer(value)) {
    return captureBodyValue(value, redactor, bodyLimit)
  }

  if (contentType.includes('json')) {
    try {
      const decoded = JSON.parse(
        Buffer.isBuffer(value) ? value.toString('utf8') : String(value)
      )
      return captureBodyValue(decoded, redactor, bodyLimit)
    } catch {
      // Fall through and preserve malformed JSON as text.
    }
  }

  return captureBodyString(value, bodyLimit)
}

/**
 * @param {any} res
 * @returns {Record<string, any>}
 */
function responseHeaders(res) {
  if (typeof res.getHeaders === 'function') return res.getHeaders()
  return res.headers || {}
}

/**
 * @param {any} res
 * @returns {string|null}
 */
function redirectLocation(res) {
  const headers = responseHeaders(res)
  const inertiaLocation =
    headers[LOCATION.toLowerCase()] || headers[LOCATION] || null
  if (inertiaLocation) return String(inertiaLocation)

  const status = Number(res.statusCode || 200)
  if (status < 300 || status >= 400) return null
  const location = headers.location || headers.Location
  return location ? String(location) : null
}

/**
 * @param {Object} options
 * @param {any} options.req
 * @param {any} options.res
 * @param {string} options.id
 * @param {string|null} options.batchId
 * @param {bigint} options.startedAt
 * @param {any} options.payload
 * @param {any} options.rawResponse
 * @param {any} options.sourceLocator
 * @param {any} options.redactor
 * @param {number} options.bodyLimit
 * @returns {Record<string, any>}
 */
module.exports = function buildEntry({
  req,
  res,
  id,
  batchId,
  startedAt,
  payload,
  rawResponse,
  sourceLocator,
  redactor,
  bodyLimit
}) {
  const now = Date.now()
  const utime = now / 1000
  const renderedPage =
    payload !== null &&
    typeof payload?.component === 'string' &&
    payload.component !== ''
  const resolvedResponseBody = renderedPage
    ? captureBodyValue(payload.responseBody, redactor, bodyLimit)
    : captureRawResponseBody(rawResponse, res, redactor, bodyLimit)
  const absoluteUrl = redactor.redactUrl(absoluteRequestUrl(req))
  const redirect = redirectLocation(res)

  const entry = {
    __meta: {
      id,
      tabUuid: readHeader(req, HEADERS.TAB),
      batchId,
      timestamp: new Date(now).toISOString(),
      utime,
      method: String(req.method || 'GET').toUpperCase(),
      url: absoluteUrl,
      component: renderedPage ? payload.component : null,
      requestType: resolveRequestType(req, renderedPage),
      status: Number(res.statusCode || 200),
      redirectLocation: redirect ? redactor.redactUrl(redirect) : null,
      serverTimingMs: Number(process.hrtime.bigint() - startedAt) / 1_000_000,
      visitId: readHeader(req, HEADERS.VISIT)
    },
    http: {
      requestHeaders: redactor.redactHeaders(req.headers || {}),
      responseHeaders: redactor.redactHeaders(responseHeaders(res)),
      requestBody: captureRequestBody(req, redactor, bodyLimit),
      responseBody: resolvedResponseBody
    },
    props: payload?.props || {},
    propValues: payload?.propValues || {},
    route: payload?.route || sourceLocator.resolveRoute(req),
    renderSource: payload?.renderSource || null,
    componentPath: payload?.componentPath || null
  }

  return entry
}

module.exports.absoluteRequestUrl = absoluteRequestUrl
module.exports.captureBodyString = captureBodyString
module.exports.captureBodyValue = captureBodyValue
module.exports.captureRawResponseBody = captureRawResponseBody
module.exports.captureRequestBody = captureRequestBody
module.exports.isPrefetch = isPrefetch
module.exports.resolveRequestType = resolveRequestType
module.exports.summarizeUploads = summarizeUploads
