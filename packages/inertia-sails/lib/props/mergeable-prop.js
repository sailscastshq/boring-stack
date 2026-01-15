/**
 * MergeableProp - Base class for props that can be merged during partial reloads.
 *
 * Provides merge() and deepMerge() methods for controlling how props are
 * combined with existing data on the client side.
 *
 * @abstract
 */
module.exports = class MergeableProp {
  constructor() {
    /** @type {boolean} - Whether to shallow merge this prop */
    this.shouldMerge = false
    /** @type {boolean} - Whether to deep merge this prop */
    this.shouldDeepMerge = false
  }

  /**
   * Enable shallow merging for this prop.
   * Arrays are concatenated, top-level object properties are merged.
   * @returns {MergeableProp} - Returns this for chaining
   */
  merge() {
    this.shouldMerge = true
    return this
  }

  /**
   * Enable deep merging for this prop.
   * Recursively merges nested objects instead of replacing them.
   * @returns {MergeableProp} - Returns this for chaining
   */
  deepMerge() {
    this.shouldMerge = true
    this.shouldDeepMerge = true
    return this
  }
}
