/**
 * @typedef {import('./types').InertiaRequest} InertiaRequest
 * @typedef {import('./types').InertiaResponse} InertiaResponse
 * @typedef {import('./types').BadRequestData} BadRequestData
 */
const { INERTIA } = require('./helpers/inertia-headers')
const humanizeValidationErrors = require('./helpers/humanize-validation-errors')
const {
  getValidateOnlyFields,
  isPrecognitiveRequest,
  sendPrecognitionErrors,
  sendPrecognitionSuccess
} = require('./helpers/precognition')

/**
 * @param {Record<string, string[]>} errors
 * @param {string[]} fields
 * @returns {Record<string, string[]>}
 */
function filterErrors(errors, fields) {
  if (fields.length === 0) {
    return errors
  }

  return fields.reduce((result, field) => {
    if (errors[field]) {
      result[field] = errors[field]
    }

    return result
  }, /** @type {Record<string, string[]>} */ ({}))
}

/**
 * Handle bad request responses for Inertia.js
 *
 * For Inertia requests with validation errors, this redirects back to the
 * previous page with errors stored in the session. For non-Inertia requests,
 * it returns a standard 400 response.
 *
 * @param {InertiaRequest} req - Express/Sails request object
 * @param {InertiaResponse} res - Express/Sails response object
 * @param {BadRequestData|Error|Record<string, any>} [optionalData] - Optional error data or Error object
 * @returns {*} - Response (redirect for Inertia, status code for non-Inertia)
 *
 * @example
 * // In an action with validation errors
 * return sails.inertia.handleBadRequest(req, res, {
 *   problems: ['\"email\" is required', '\"password\" must be at least 8 characters']
 * })
 */
module.exports = function handleBadRequest(req, res, optionalData) {
  const sails = req._sails
  const log = sails.log || {}
  const response = /** @type {any} */ (res)
  // Define the status code to send in the response.
  const statusCodeToSet = 400
  const errors = humanizeValidationErrors(optionalData)

  if (isPrecognitiveRequest(req)) {
    const filteredErrors = filterErrors(errors, getValidateOnlyFields(req))

    if (
      Object.keys(errors).length > 0 &&
      Object.keys(filteredErrors).length === 0
    ) {
      return sendPrecognitionSuccess(res)
    }

    return sendPrecognitionErrors(res, filteredErrors)
  }

  // Check if it's an Inertia request
  if (req.header?.(INERTIA)) {
    if (Object.keys(errors).length > 0) {
      req.session = req.session || {}
      req.session.errors = errors
      return response.redirect(303, req.get('Referrer') || '/')
    }
  }

  // If not an Inertia request, perform the normal badRequest response
  if (optionalData === undefined) {
    log.info?.('Ran custom response: res.badRequest()')
    return response.sendStatus(statusCodeToSet)
  } else if (optionalData instanceof Error) {
    log.info?.(
      'Custom response `res.badRequest()` called with an Error:',
      optionalData
    )

    if (typeof (/** @type {*} */ (optionalData).toJSON) !== 'function') {
      if (process.env.NODE_ENV === 'production') {
        return response.sendStatus(statusCodeToSet)
      } else {
        return response.status(statusCodeToSet).send(optionalData.stack)
      }
    }
  } else {
    return response.status(statusCodeToSet).send(optionalData)
  }
}
