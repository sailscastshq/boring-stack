const resolveValidationErrors = require('../helpers/resolve-validation-errors')
const requestContext = require('../helpers/request-context')

/**
 * Inertia middleware that handles validation errors and request context.
 *
 * Uses AsyncLocalStorage to make the request available throughout the
 * request lifecycle without explicitly passing it.
 *
 * This enables request-scoped features:
 * - sails.inertia.share() - Per-request shared props (prevents data leaking between users)
 * - sails.inertia.flash() - Per-request flash messages
 * - sails.inertia.encryptHistory() - Per-request history encryption
 * - sails.inertia.clearHistory() - Per-request history clearing
 *
 * @param {Object} hook - The inertia-sails hook instance
 * @returns {Function} Express/Sails middleware function
 */
function inertia(hook) {
  return function inertiaMiddleware(req, res, next) {
    // Skip Inertia middleware for WebSocket requests
    if (req.isSocket) {
      return next()
    }

    // Wrap the rest of the request in AsyncLocalStorage context
    // This makes req/res and request-scoped data available anywhere
    requestContext.run(req, res, () => {
      // Handle validation errors - share them for this request only
      const validationErrors = resolveValidationErrors(req)
      req.flash('errors', validationErrors)

      // Share errors for this request (request-scoped, not global)
      requestContext.setSharedProp('errors', req.flash('errors')[0] || {})

      return next()
    })
  }
}

module.exports = inertia
