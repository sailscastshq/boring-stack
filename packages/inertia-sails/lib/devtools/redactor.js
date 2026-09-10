const REDACTED = '[REDACTED]'
const UNSERIALIZABLE = '[UNSERIALIZABLE]'

/**
 * @param {string[]} values
 * @returns {Set<string>}
 */
function normalizedSet(values) {
  return new Set(values.map((value) => value.toLowerCase()))
}

/**
 * Convert live application values into data that JSON can safely persist.
 *
 * @param {any} value
 * @param {WeakSet<object>} [seen]
 * @returns {any}
 */
function sanitizeForJson(value, seen = new WeakSet()) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : UNSERIALIZABLE
  }

  if (
    typeof value === 'undefined' ||
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  ) {
    return UNSERIALIZABLE
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? UNSERIALIZABLE : value.toISOString()
  }

  if (Buffer.isBuffer(value)) {
    return UNSERIALIZABLE
  }

  if (typeof value !== 'object') {
    return UNSERIALIZABLE
  }

  if (seen.has(value)) {
    return UNSERIALIZABLE
  }

  seen.add(value)

  if (Array.isArray(value)) {
    const result = value.map((item) => sanitizeForJson(item, seen))
    seen.delete(value)
    return result
  }

  /** @type {Record<string, any>} */
  const result = {}

  try {
    for (const [key, item] of Object.entries(value)) {
      result[key] = sanitizeForJson(item, seen)
    }
  } catch {
    seen.delete(value)
    return UNSERIALIZABLE
  }

  seen.delete(value)
  return result
}

/**
 * @param {any} value
 * @param {Set<string>} sensitiveKeys
 * @returns {any}
 */
function redactValue(value, sensitiveKeys) {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, sensitiveKeys))
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  /** @type {Record<string, any>} */
  const result = {}

  for (const [key, item] of Object.entries(value)) {
    result[key] = key
      .toLowerCase()
      .split(/[.\[\]]+/)
      .some((segment) => sensitiveKeys.has(segment))
      ? REDACTED
      : redactValue(item, sensitiveKeys)
  }

  return result
}

/**
 * @param {{keys?: string[], headers?: string[]}} [config]
 */
module.exports = function createRedactor(config = {}) {
  const sensitiveKeys = normalizedSet(config.keys || [])
  const sensitiveHeaders = normalizedSet(config.headers || [])

  /**
   * @param {any} value
   * @returns {any}
   */
  function redact(value) {
    return redactValue(sanitizeForJson(value), sensitiveKeys)
  }

  /**
   * @param {Record<string, any>} headers
   * @returns {Record<string, string>}
   */
  function redactHeaders(headers = {}) {
    /** @type {Record<string, string>} */
    const result = {}

    for (const [key, value] of Object.entries(headers)) {
      result[key.toLowerCase()] = sensitiveHeaders.has(key.toLowerCase())
        ? REDACTED
        : Array.isArray(value)
        ? value.map(String).join(', ')
        : ['referer', 'location', 'x-inertia-location'].includes(
            key.toLowerCase()
          )
        ? redactUrl(String(value))
        : String(value)
    }

    return result
  }

  /**
   * @param {string} url
   * @returns {string}
   */
  function redactUrl(url) {
    try {
      const absolute = /^[a-z][a-z\d+.-]*:\/\//i.test(url)
      const protocolRelative = url.startsWith('//')
      const rootRelative = url.startsWith('/')
      const parsed = new URL(url, 'http://inertia-devtools.local')

      for (const key of [...parsed.searchParams.keys()]) {
        const segments = key
          .split(/[.[\]]+/)
          .map((segment) => segment.toLowerCase())
          .filter(Boolean)
        if (segments.some((segment) => sensitiveKeys.has(segment))) {
          parsed.searchParams.set(key, REDACTED)
        }
      }

      if (absolute) return parsed.toString()
      if (protocolRelative) {
        return `//${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`
      }

      const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`
      return rootRelative ? relative : relative.replace(/^\//, '')
    } catch {
      return url
    }
  }

  /**
   * @param {any} value
   * @param {string|null} [parentKey]
   * @returns {any}
   */
  function redactStorageValue(value, parentKey = null) {
    if (Array.isArray(value)) {
      return value.map((item) => redactStorageValue(item))
    }

    if (value === null || typeof value !== 'object') {
      if (
        typeof value === 'string' &&
        (parentKey === 'url' || parentKey === 'redirectlocation')
      ) {
        return redactUrl(value)
      }
      return value
    }

    if (parentKey === 'requestheaders' || parentKey === 'responseheaders') {
      return redactHeaders(value)
    }

    /** @type {Record<string, any>} */
    const result = {}
    for (const [key, item] of Object.entries(value)) {
      result[key] = redactStorageValue(item, key.toLowerCase())
    }

    return result
  }

  return {
    redact,
    redactHeaders,
    redactUrl,

    /**
     * Defense-in-depth pass applied immediately before storage.
     *
     * @param {any} value
     * @returns {any}
     */
    redactStoragePayload(value) {
      return redactStorageValue(redact(value))
    }
  }
}

module.exports.REDACTED = REDACTED
module.exports.UNSERIALIZABLE = UNSERIALIZABLE
module.exports.sanitizeForJson = sanitizeForJson
