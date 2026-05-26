const {
  createDefaultMergeOperation,
  normalizeMergeOptions,
  normalizeMergeTargets
} = require('./merge-targets')

/**
 * @typedef {import('../types').MergeOperation} MergeOperation
 * @typedef {import('../types').MergeOptions} MergeOptions
 * @typedef {string|string[]|Record<string, string|null>|null} MergeTargetInput
 */

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
    /** @type {MergeOperation[]} */
    this.mergeOperations = []
    /** @type {string[]} - Paths to use when matching merge items */
    this.matchOnPaths = []
  }

  /**
   * Enable shallow merging for this prop.
   * Arrays are concatenated, top-level object properties are merged.
   * @returns {MergeableProp} - Returns this for chaining
   */
  merge() {
    this.shouldMerge = true
    this.shouldDeepMerge = false
    if (this.mergeOperations.length === 0) {
      this.mergeOperations.push(createDefaultMergeOperation())
    }
    return this
  }

  /**
   * Append this prop, or one or more nested paths, during partial reloads.
   * @param {MergeTargetInput} [paths] - Path(s) to append, or a path-to-matchOn map
   * @param {MergeOptions|string} [options] - Options, or a matchOn string
   * @returns {MergeableProp} - Returns this for chaining
   */
  append(paths = null, options = {}) {
    return this._addMergeOperations('append', paths, options)
  }

  /**
   * Prepend this prop, or one or more nested paths, during partial reloads.
   * @param {MergeTargetInput} [paths] - Path(s) to prepend, or a path-to-matchOn map
   * @param {MergeOptions|string} [options] - Options, or a matchOn string
   * @returns {MergeableProp} - Returns this for chaining
   */
  prepend(paths = null, options = {}) {
    return this._addMergeOperations('prepend', paths, options)
  }

  /**
   * Enable deep merging for this prop.
   * Recursively merges nested objects instead of replacing them.
   * @returns {MergeableProp} - Returns this for chaining
   */
  deepMerge() {
    this.shouldMerge = true
    this.shouldDeepMerge = true
    this.mergeOperations = []
    return this
  }

  /**
   * Configure one or more match-on paths for merge operations.
   * @param {string|string[]} paths - Path(s) ending with the field to match on
   * @returns {MergeableProp} - Returns this for chaining
   */
  matchOn(paths) {
    const normalizedPaths = Array.isArray(paths) ? paths : [paths]
    normalizedPaths.filter(Boolean).forEach((path) => {
      this.matchOnPaths.push(path)
    })
    return this
  }

  /**
   * @param {'append'|'prepend'} direction
   * @param {MergeTargetInput} paths
   * @param {MergeOptions|string} options
   * @returns {MergeableProp}
   */
  _addMergeOperations(direction, paths, options) {
    const normalizedOptions = normalizeMergeOptions(options)

    this.shouldMerge = true
    this.shouldDeepMerge = false
    this._clearDefaultMergeOperation()

    normalizeMergeTargets(paths, normalizedOptions).forEach((target) => {
      this.mergeOperations.push({
        direction,
        path: target.path,
        matchOn: target.matchOn
      })
    })

    return this
  }

  _clearDefaultMergeOperation() {
    if (
      this.mergeOperations.length === 1 &&
      this.mergeOperations[0].isDefault
    ) {
      this.mergeOperations = []
    }
  }
}
