const resolveValidationErrors = require('../helpers/resolve-validation-errors')
function inertia(hook) {
  return function inertiaMiddleware(req, res, next) {
    // Skip Inertia middleware for WebSocket requests
    // WebSocket requests don't have req.flash() and don't need Inertia rendering
    if (req.isSocket) {
      return next()
    }

    const flash = {
      message: req.flash('message'),
      error: req.flash('error'),
      success: req.flash('success')
    }

    hook.share('flash', flash)

    const validationErrors = resolveValidationErrors(req)
    req.flash('errors', validationErrors)
    hook.share('errors', req.flash('errors')[0] || {})
    return next()
  }
}

module.exports = inertia
