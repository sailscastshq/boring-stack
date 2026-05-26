const resolveValidationErrors = require('../helpers/resolve-validation-errors')
const requestContext = require('../helpers/request-context')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 * @typedef {import('../types').InertiaResponse} InertiaResponse
 */

/**
 * Inertia middleware that handles validation errors.
 *
 * Note: AsyncLocalStorage context is set up earlier in routes.before
 * (see index.js) so that other hooks can use sails.inertia.share()
 * with proper request context.
 *
 * This middleware handles:
 * - Validation errors from redirects (shared as 'errors' prop)
 *
 * @param {Record<string, any>} hook - The inertia-sails hook instance
 * @returns {(req: InertiaRequest, res: InertiaResponse, next: () => any) => any} Express/Sails middleware function
 */
function inertia(hook) {
  return function inertiaMiddleware(req, res, next) {
    // Skip for WebSocket requests (they don't have req.flash)
    if (req.isSocket) return next()

    // Handle validation errors - share them for this request only
    // Context is already set up by routes.before in index.js
    const validationErrors = resolveValidationErrors(req)
    req.flash('errors', validationErrors)
    requestContext.setSharedProp('errors', req.flash('errors')[0] || {})
    return next()
  }
}

module.exports = inertia
