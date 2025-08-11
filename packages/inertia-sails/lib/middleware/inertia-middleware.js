const isInertiaRequest = require('../helpers/is-inertia-request')

const resolveValidationErrors = require('../helpers/resolve-validation-errors')
function inertia(hook) {
  return function inertiaMiddleware(req, res, next) {
    // Always consume flash messages to prevent persistence after refresh
    // This matches the behavior of validation errors which are always consumed
    const flash = {
      message: req.flash('message'),
      error: req.flash('error'),
      success: req.flash('success')
    }

    // Only share flash messages and validation errors if this is an Inertia request
    if (isInertiaRequest(req)) {
      hook.share('flash', flash)

      const validationErrors = resolveValidationErrors(req)
      req.flash('errors', validationErrors)

      hook.share('errors', req.flash('errors')[0] || {})
    }
    // Note: Flash messages are consumed regardless of request type
    // This ensures they don't persist after manual page refresh (F5)

    return next()
  }
}

module.exports = inertia
