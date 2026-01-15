const MergeableProp = require('./mergeable-prop')

/**
 * AlwaysProp - A prop that is always resolved, even during partial reloads.
 *
 * By default, props are only re-evaluated when explicitly requested in a partial reload.
 * AlwaysProp ensures the callback is executed on every request, making it useful for
 * data that must always be fresh (e.g., CSRF tokens, current user state).
 *
 * @extends MergeableProp
 * @example
 * // Always include fresh CSRF token
 * csrf: sails.inertia.always(() => req.csrfToken())
 *
 * @example
 * // Always include current auth state
 * auth: sails.inertia.always(async () => ({
 *   user: req.session.userId ? await User.findOne({ id: req.session.userId }) : null,
 *   isAuthenticated: !!req.session.userId
 * }))
 */
module.exports = class AlwaysProp extends MergeableProp {
  /**
   * Create a new AlwaysProp instance
   * @param {Function} callback - The callback function to resolve the prop value
   */
  constructor(callback) {
    super()
    /** @type {Function} */
    this.callback = callback
  }
}
