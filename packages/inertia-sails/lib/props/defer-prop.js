const ignoreFirstLoadSymbol = require('../helpers/ignore-first-load-symbol')
const MergeableProp = require('./mergeable-prop')

/**
 * @typedef {import('../types').PropCallback} PropCallback
 *
 * @typedef {Object} DeferPropOptions
 * @property {boolean} [rescue=false] - Whether callback failures should be rescued
 */

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
   * @param {PropCallback} callback - The callback function to resolve the prop value
   * @param {string|DeferPropOptions} [group='default'] - The group name for loading props together, or options
   * @param {DeferPropOptions} [options] - Deferred prop options
   */
  constructor(callback, group = 'default', options = {}) {
    super()
    if (typeof group === 'object' && group !== null) {
      options = group
      group = 'default'
    }
    const groupName = typeof group === 'string' ? group : 'default'

    /** @type {PropCallback} */
    this.callback = callback
    /** @type {string} */
    this.group = groupName
    /** @type {boolean} */
    this.shouldRescue = options.rescue === true
    Object.defineProperty(this, ignoreFirstLoadSymbol, {
      value: true,
      enumerable: true,
      configurable: true,
      writable: true
    })
  }

  /**
   * Get the group name for this deferred prop
   * @returns {string} - The group name
   */
  getGroup() {
    return this.group
  }

  /**
   * Rescue callback failures instead of failing the whole deferred response.
   * The failed prop is omitted from props and reported in rescuedProps.
   *
   * @param {boolean} rescue - Whether callback failures should be rescued
   * @returns {DeferProp} - Returns this for chaining
   */
  rescue(rescue = true) {
    this.shouldRescue = rescue
    return this
  }

  /**
   * Get whether this deferred prop should rescue callback failures.
   * @returns {boolean} - Whether callback failures should be rescued
   */
  shouldRescueProp() {
    return this.shouldRescue
  }
}
