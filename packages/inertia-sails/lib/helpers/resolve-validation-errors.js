// @ts-nocheck
const { ERROR_BAG } = require('./inertia-headers')

/**
 * @module resolveValidationErrors
 * @description Resolves and formats validation errors from the session for Inertia responses.
 *
 * @param {Object} req - The current HTTP request object.
 * @returns {Object} An object representing the validation errors in the desired format.
 */
module.exports = function resolveValidationErrors(req) {
  if (!req.session || !req.session.errors) {
    return {}
  }

  const flashedErrors = req.session.errors

  const collectedErrors = Object.keys(flashedErrors).reduce((result, bag) => {
    const errorsForBag = flashedErrors[bag]
    const mappedErrors = errorsForBag.map((error) =>
      error.replace(/"([^"]+)"/, '$1')
    )
    // Ensure that single errors are wrapped in an array
    result[bag] = mappedErrors.length > 1 ? mappedErrors : mappedErrors[0]
    return result
  }, {})

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
