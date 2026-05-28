const {
  PRECOGNITION,
  PRECOGNITION_SUCCESS,
  PRECOGNITION_VALIDATE_ONLY
} = require('./inertia-headers')
const appendVaryHeader = require('./vary-header')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 * @typedef {import('../types').InertiaResponse} InertiaResponse
 */

/**
 * @param {any} value
 * @returns {boolean}
 */
function isTruthyHeader(value) {
  if (Array.isArray(value)) {
    return value.some(isTruthyHeader)
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return value === true
}

/**
 * @param {InertiaRequest|undefined|null} req
 * @param {string} header
 * @returns {any}
 */
function getHeader(req, header) {
  return (
    req?.get?.(header) ??
    req?.header?.(header) ??
    req?.headers?.[header] ??
    req?.headers?.[header.toLowerCase()]
  )
}

/**
 * @param {InertiaRequest|undefined|null} req
 * @returns {boolean}
 */
function isPrecognitiveRequest(req) {
  return isTruthyHeader(getHeader(req, PRECOGNITION))
}

/**
 * @param {InertiaRequest|undefined|null} req
 * @returns {string[]}
 */
function getValidateOnlyFields(req) {
  const header = getHeader(req, PRECOGNITION_VALIDATE_ONLY)

  if (!header) {
    return []
  }

  return String(header)
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
}

/**
 * @param {string} field
 * @param {string} requestedField
 * @returns {boolean}
 */
function matchesField(field, requestedField) {
  if (field === requestedField) {
    return true
  }

  const fieldSegments = field.split('.')
  const requestedSegments = requestedField.split('.')

  if (fieldSegments.length !== requestedSegments.length) {
    return false
  }

  return fieldSegments.every(
    (segment, index) => segment === '*' || segment === requestedSegments[index]
  )
}

/**
 * @param {InertiaRequest|undefined|null} req
 * @param {string} field
 * @returns {boolean}
 */
function shouldValidateField(req, field) {
  if (!isPrecognitiveRequest(req)) {
    return true
  }

  const fields = getValidateOnlyFields(req)

  if (fields.length === 0) {
    return true
  }

  return fields.some((requestedField) => matchesField(field, requestedField))
}

/**
 * @param {InertiaResponse} res
 * @returns {InertiaResponse}
 */
function markPrecognitionResponse(res) {
  res.set?.(PRECOGNITION, 'true')
  appendVaryHeader(res, PRECOGNITION)
  return res
}

/**
 * @param {InertiaResponse} res
 * @returns {*}
 */
function sendPrecognitionSuccess(res) {
  markPrecognitionResponse(res)
  res.set?.(PRECOGNITION_SUCCESS, 'true')
  return res.status?.(204).end?.()
}

/**
 * @param {InertiaResponse} res
 * @param {Record<string, string|string[]>} errors
 * @returns {*}
 */
function sendPrecognitionErrors(res, errors) {
  markPrecognitionResponse(res)
  return res.status?.(422).json?.({ errors })
}

module.exports = {
  getValidateOnlyFields,
  isPrecognitiveRequest,
  markPrecognitionResponse,
  sendPrecognitionErrors,
  sendPrecognitionSuccess,
  shouldValidateField
}
