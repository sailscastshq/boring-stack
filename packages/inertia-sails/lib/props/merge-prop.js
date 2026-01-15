const MergeableProp = require('./mergeable-prop')

/**
 * MergeProp - A prop that merges with existing data during partial reloads.
 *
 * When the client requests a partial reload, merge props are combined with
 * the existing data instead of replacing it entirely.
 *
 * @extends MergeableProp
 * @example
 * // Basic merge - arrays are concatenated
 * notifications: sails.inertia.merge(async () => {
 *   return await Notification.find({ user: req.session.userId }).limit(10)
 * })
 *
 * @example
 * // Deep merge - nested objects are recursively merged
 * settings: sails.inertia.merge(async () => {
 *   return await Settings.findOne({ user: req.session.userId })
 * }).deepMerge()
 */
module.exports = class MergeProp extends MergeableProp {
  /**
   * Create a new MergeProp instance
   * @param {Function} callback - The callback function to resolve the prop value
   */
  constructor(callback) {
    super()
    /** @type {Function} */
    this.callback = callback
    /** @type {boolean} */
    this.shouldMerge = true
  }

  /**
   * Enable deep merging for this prop.
   * Recursively merges nested objects instead of replacing them.
   * @returns {MergeProp} - Returns this for chaining
   */
  deepMerge() {
    this.shouldDeepMerge = true
    return this
  }
}
