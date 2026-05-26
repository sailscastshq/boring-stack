const { ERROR_BAG } = require('./inertia-headers')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 * @typedef {Record<string, string|string[]>} ValidationErrors
 */

/**
 * @module resolveValidationErrors
 * @description Resolves and formats validation errors from the session for Inertia responses.
 *
 * @param {InertiaRequest} req - The current HTTP request object.
 * @returns {ValidationErrors} An object representing the validation errors in the desired format.
 */
module.exports = function resolveValidationErrors(req) {
  if (!req.session || !req.session.errors) {
    return {}
  }

  const flashedErrors = /** @type {Record<string, string[]>} */ (
    req.session.errors
  )

  const collectedErrors = Object.keys(flashedErrors).reduce((result, bag) => {
    const errorsForBag = flashedErrors[bag]
    /** @type {string[]} */
    const mappedErrors = errorsForBag.map((error) =>
      error.replace(/"([^"]+)"/, '$1')
    )
    // Ensure that single errors are wrapped in an array
    result[bag] = mappedErrors.length > 1 ? mappedErrors : mappedErrors[0]
    return result
  }, /** @type {ValidationErrors} */ ({}))

  const inertiaErrorBag = req.headers[ERROR_BAG]

  if (inertiaErrorBag && collectedErrors[inertiaErrorBag]) {
    const selectedErrors = {
      [inertiaErrorBag]: collectedErrors[inertiaErrorBag]
    }
    return selectedErrors
  }

  if (collectedErrors.default) {
    const defaultErrors = { default: collectedErrors.default }
    return defaultErrors
  }
  delete req.session.errors
  return collectedErrors
}
