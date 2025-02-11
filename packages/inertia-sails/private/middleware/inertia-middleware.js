const isInertiaRequest = require('../helpers/is-inertia-request')

const resolveValidationErrors = require('../helpers/resolve-validation-errors')
function inertia(hook) {
  return function inertiaMiddleware(req, res, next) {
    if (isInertiaRequest(req)) {
      const flash = {
        message: req.flash('message'),
        error: req.flash('error'),
        success: req.flash('success')
      }
      hook.share('flash', flash)

      const validationErrors = resolveValidationErrors(req)
      req.flash('errors', validationErrors)

      hook.share('errors', req.flash('errors')[0] || {})
    }

    return next()
  }
}

module.exports = inertia
