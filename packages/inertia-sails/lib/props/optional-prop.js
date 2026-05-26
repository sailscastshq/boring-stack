const ignoreFirstLoadSymbol = require('../helpers/ignore-first-load-symbol')

/**
 * @typedef {import('../types').PropCallback} PropCallback
 */

/**
 * OptionalProp - A prop that is only evaluated when explicitly requested.
 *
 * Optional props are excluded from the initial page load and only resolved
 * when the client explicitly requests them via partial reloads. This is useful
 * for expensive data that isn't needed on every page view.
 *
 * @example
 * // Only load when explicitly requested
 * expensiveStats: sails.inertia.optional(async () => {
 *   return await Analytics.computeExpensiveStats()
 * })
 *
 * @example
 * // Client-side: Request the optional prop
 * // router.reload({ only: ['expensiveStats'] })
 */
module.exports = class OptionalProp {
  /**
   * Create a new OptionalProp instance
   * @param {PropCallback} callback - The callback function to resolve the prop value
   */
  constructor(callback) {
    /** @type {PropCallback} */
    this.callback = callback
    Object.defineProperty(this, ignoreFirstLoadSymbol, {
      value: true,
      enumerable: true,
      configurable: true,
      writable: true
    })
  }
}
