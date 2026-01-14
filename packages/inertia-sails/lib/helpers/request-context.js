/**
 * Request context using AsyncLocalStorage.
 *
 * This allows accessing the current request anywhere in the async call chain
 * without explicitly passing it through function parameters.
 *
 * Similar to how Laravel's IoC container provides implicit request access.
 */
const { AsyncLocalStorage } = require('async_hooks')

const requestContext = new AsyncLocalStorage()

module.exports = {
  /**
   * Get the AsyncLocalStorage instance
   */
  storage: requestContext,

  /**
   * Run a callback with the request stored in context
   * @param {Object} req - The request object
   * @param {Function} callback - The callback to run
   * @returns {*} - The result of the callback
   */
  run(req, callback) {
    return requestContext.run(req, callback)
  },

  /**
   * Get the current request from context
   * @returns {Object|undefined} - The current request or undefined if not in context
   */
  getRequest() {
    return requestContext.getStore()
  }
}
