const ignoreFirstLoadSymbol = require('../helpers/ignore-first-load-symbol')
const MergeableProp = require('./mergeable-prop')

/**
 * DeferProp - A prop that loads after the initial page render.
 *
 * Deferred props are not included in the initial page response. Instead, they are
 * loaded asynchronously after the page renders, improving perceived performance.
 *
 * Use with the `<Deferred>` component on the client side to show loading states.
 *
 * @extends MergeableProp
 * @example
 * // Basic deferred prop
 * analytics: sails.inertia.defer(async () => {
 *   return await Analytics.getStats()
 * })
 *
 * @example
 * // Grouped deferred props - load together
 * users: sails.inertia.defer(() => User.find(), 'sidebar')
 * teams: sails.inertia.defer(() => Team.find(), 'sidebar')
 *
 * @example
 * // Client-side usage with <Deferred> component
 * // <Deferred data="analytics" fallback={<Spinner />}>
 * //   <AnalyticsChart data={analytics} />
 * // </Deferred>
 */
module.exports = class DeferProp extends MergeableProp {
  /**
   * Create a new DeferProp instance
   * @param {Function} callback - The callback function to resolve the prop value
   * @param {string} [group='default'] - The group name for loading props together
   */
  constructor(callback, group) {
    super()
    /** @type {Function} */
    this.callback = callback
    /** @type {string} */
    this.group = group
    /** @type {boolean} */
    this[ignoreFirstLoadSymbol] = true
  }

  /**
   * Get the group name for this deferred prop
   * @returns {string} - The group name
   */
  getGroup() {
    return this.group
  }
}
