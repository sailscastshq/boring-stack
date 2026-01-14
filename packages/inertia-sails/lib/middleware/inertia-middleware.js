const resolveValidationErrors = require('../helpers/resolve-validation-errors')
const requestContext = require('../helpers/request-context')

/**
 * Inertia middleware that handles validation errors and request context.
 *
 * Uses AsyncLocalStorage to make the request available throughout the
 * request lifecycle without explicitly passing it.
 *
 * For flash messages, users have two options:
 * - `sails.inertia.flash()` - Inertia flash (does NOT persist in browser history)
 * - `req.flash()` - Session flash via sails-flash (for non-Inertia or traditional use)
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
    // This makes req available via requestContext.getRequest() anywhere
    requestContext.run(req, () => {
      // Handle validation errors
      const validationErrors = resolveValidationErrors(req)
      req.flash('errors', validationErrors)
      hook.share('errors', req.flash('errors')[0] || {})

      return next()
    })
  }
}

module.exports = inertia
