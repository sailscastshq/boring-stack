/**
 * OnceProp - A prop that is resolved only once and cached across navigations.
 *
 * The client tracks which once-props it has received via the X-Inertia-Except-Once-Props
 * header. On subsequent requests, the server skips sending these props again.
 *
 * Useful for expensive computations that don't change often.
 *
 * @example
 * // In your action - basic usage
 * permissions: sails.inertia.once(async () => {
 *   return await Permission.find({ user: this.req.session.userId })
 * })
 *
 * @example
 * // With custom key
 * permissions: sails.inertia.once(async () => {
 *   return await Permission.find({ user: this.req.session.userId })
 * }).as('user-permissions')
 *
 * @example
 * // With expiration (cache for 1 hour)
 * permissions: sails.inertia.once(async () => {
 *   return await Permission.find({ user: this.req.session.userId })
 * }).until(3600)
 *
 * @example
 * // Force refresh even if client has it cached
 * permissions: sails.inertia.once(async () => {
 *   return await Permission.find({ user: this.req.session.userId })
 * }).fresh()
 */
module.exports = class OnceProp {
  /**
   * Create a new OnceProp instance
   * @param {Function} callback - The callback function to resolve the prop value
   */
  constructor(callback) {
    this.callback = callback
    this._key = null
    this._ttl = null
    this._refresh = false
  }

  /**
   * Set a custom key for resolving the once prop.
   * This allows multiple props to share the same cache key.
   * @param {string} key - The custom key
   * @returns {OnceProp} - Returns this for chaining
   */
  as(key) {
    this._key = key
    return this
  }

  /**
   * Get the custom key for this once prop
   * @returns {string|null}
   */
  getKey() {
    return this._key
  }

  /**
   * Mark the property to be forcefully sent to the client,
   * even if the client already has it cached.
   * @param {boolean} value - Whether to force refresh
   * @returns {OnceProp} - Returns this for chaining
   */
  fresh(value = true) {
    this._refresh = value
    return this
  }

  /**
   * Check if this prop should be forcefully refreshed
   * @returns {boolean}
   */
  shouldBeRefreshed() {
    return this._refresh
  }

  /**
   * Set the expiration time for the cached value (in seconds).
   * After this time, the client will request a fresh value.
   * @param {number} seconds - Time in seconds until expiration
   * @returns {OnceProp} - Returns this for chaining
   */
  until(seconds) {
    this._ttl = seconds
    return this
  }

  /**
   * Get the expiration timestamp in milliseconds.
   * Returns null if no expiration is set.
   * @returns {number|null} - Timestamp in milliseconds, or null if no expiration
   */
  expiresAt() {
    if (this._ttl === null) {
      return null
    }
    return Date.now() + this._ttl * 1000
  }
}
