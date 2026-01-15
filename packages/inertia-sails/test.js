/**
 * Inertia Testing Helpers for Sails.js
 *
 * Provides utilities for integration testing Inertia responses using sails.request().
 * Works alongside your existing unit tests (helpers) and E2E tests (Playwright/Cypress).
 *
 * @docs https://docs.sailscasts.com/boring-stack/testing
 * @example
 * const inertia = require('inertia-sails/test')(sails)
 *
 * describe('Users', () => {
 *   it('lists users', async () => {
 *     const page = await inertia.request('GET /users')
 *     page
 *       .assertComponent('Users/Index')
 *       .assertHas('users', 10)
 *   })
 * })
 */

const { INERTIA, VERSION } = require('./lib/helpers/inertia-headers')

/**
 * @typedef {Object} InertiaPage
 * @property {string} component - The component name
 * @property {string} url - The current URL
 * @property {Object} props - The page props
 * @property {Object} [flash] - Flash data
 * @property {string[]} [mergeProps] - Props to merge
 * @property {string[]} [deepMergeProps] - Props to deep merge
 * @property {Object} [deferredProps] - Deferred props by group
 */

/**
 * @typedef {Object} SailsResponse
 * @property {InertiaPage} body - The response body
 * @property {number} statusCode - HTTP status code
 */

/**
 * InertiaTestResponse - Fluent assertions for Inertia page responses
 */
class InertiaTestResponse {
  /**
   * @param {SailsResponse} response - The Sails response object
   */
  constructor(response) {
    this.response = response
    this.page = response.body
    this.status = response.statusCode
  }

  /**
   * Assert the response has a specific status code
   * @param {number} expected - Expected status code
   * @returns {InertiaTestResponse} - For chaining
   */
  assertStatus(expected) {
    if (this.status !== expected) {
      throw new Error(`Expected status ${expected}, got ${this.status}`)
    }
    return this
  }

  /**
   * Assert the Inertia component matches
   * @param {string} expected - Expected component name
   * @returns {InertiaTestResponse} - For chaining
   */
  assertComponent(expected) {
    if (this.page.component !== expected) {
      throw new Error(
        `Expected component "${expected}", got "${this.page.component}"`
      )
    }
    return this
  }

  /**
   * Assert a prop exists (optionally with specific length for arrays)
   * @param {string} key - Prop key (supports dot notation: 'user.name')
   * @param {number} [length] - Expected array length
   * @returns {InertiaTestResponse} - For chaining
   */
  assertHas(key, length) {
    const value = this._getNestedValue(this.page.props, key)
    if (value === undefined) {
      throw new Error(`Missing prop: ${key}`)
    }
    if (length !== undefined) {
      if (!Array.isArray(value)) {
        throw new Error(`Prop "${key}" is not an array`)
      }
      if (value.length !== length) {
        throw new Error(
          `Expected "${key}" to have ${length} items, got ${value.length}`
        )
      }
    }
    return this
  }

  /**
   * Assert a prop does not exist
   * @param {string} key - Prop key
   * @returns {InertiaTestResponse} - For chaining
   */
  assertMissing(key) {
    const value = this._getNestedValue(this.page.props, key)
    if (value !== undefined) {
      throw new Error(`Prop "${key}" should not exist`)
    }
    return this
  }

  /**
   * Assert props match expected values
   * @param {Object} expected - Object with expected key-value pairs
   * @returns {InertiaTestResponse} - For chaining
   */
  assertProps(expected) {
    for (const [key, expectedValue] of Object.entries(expected)) {
      const actualValue = this._getNestedValue(this.page.props, key)
      if (!this._deepEqual(actualValue, expectedValue)) {
        throw new Error(
          `Prop "${key}" expected ${JSON.stringify(
            expectedValue
          )}, got ${JSON.stringify(actualValue)}`
        )
      }
    }
    return this
  }

  /**
   * Assert a prop value using a callback
   * @param {string} key - Prop key
   * @param {Function} callback - Callback receiving the value, should throw if invalid
   * @returns {InertiaTestResponse} - For chaining
   */
  assertProp(key, callback) {
    const value = this._getNestedValue(this.page.props, key)
    callback(value)
    return this
  }

  /**
   * Assert flash data exists
   * @param {string} key - Flash key
   * @param {*} [value] - Expected value (optional)
   * @returns {InertiaTestResponse} - For chaining
   */
  assertFlash(key, value) {
    if (!this.page.flash || this.page.flash[key] === undefined) {
      throw new Error(`Missing flash: ${key}`)
    }
    if (value !== undefined && this.page.flash[key] !== value) {
      throw new Error(
        `Flash "${key}" expected "${value}", got "${this.page.flash[key]}"`
      )
    }
    return this
  }

  /**
   * Assert flash data does not exist
   * @param {string} key - Flash key
   * @returns {InertiaTestResponse} - For chaining
   */
  assertNoFlash(key) {
    if (this.page.flash && this.page.flash[key] !== undefined) {
      throw new Error(`Flash "${key}" should not exist`)
    }
    return this
  }

  /**
   * Assert the URL matches
   * @param {string} expected - Expected URL
   * @returns {InertiaTestResponse} - For chaining
   */
  assertUrl(expected) {
    if (this.page.url !== expected) {
      throw new Error(`Expected URL "${expected}", got "${this.page.url}"`)
    }
    return this
  }

  /**
   * Assert mergeProps contains specific keys
   * @param {string[]} keys - Expected merge prop keys
   * @returns {InertiaTestResponse} - For chaining
   */
  assertMergeProps(keys) {
    const mergeProps = this.page.mergeProps || []
    for (const key of keys) {
      if (!mergeProps.includes(key)) {
        throw new Error(`Expected "${key}" in mergeProps`)
      }
    }
    return this
  }

  /**
   * Assert deepMergeProps contains specific keys
   * @param {string[]} keys - Expected deep merge prop keys
   * @returns {InertiaTestResponse} - For chaining
   */
  assertDeepMergeProps(keys) {
    const deepMergeProps = this.page.deepMergeProps || []
    for (const key of keys) {
      if (!deepMergeProps.includes(key)) {
        throw new Error(`Expected "${key}" in deepMergeProps`)
      }
    }
    return this
  }

  /**
   * Assert deferredProps contains specific keys
   * @param {string[]} keys - Expected deferred prop keys
   * @param {string} [group] - Optional group name
   * @returns {InertiaTestResponse} - For chaining
   */
  assertDeferredProps(keys, group = 'default') {
    const deferredProps = this.page.deferredProps || {}
    const groupProps = deferredProps[group] || []
    for (const key of keys) {
      if (!groupProps.includes(key)) {
        throw new Error(`Expected "${key}" in deferredProps.${group}`)
      }
    }
    return this
  }

  /**
   * Get the raw page object for custom assertions
   * @returns {Object} - The Inertia page object
   */
  getPage() {
    return this.page
  }

  /**
   * Get the raw props for custom assertions
   * @returns {Object} - The props object
   */
  getProps() {
    return this.page.props
  }

  /**
   * Helper to get nested values using dot notation
   * @private
   * @param {Object} obj - The object to search
   * @param {string} path - Dot-notation path
   * @returns {*} - The value at the path
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce(
      /**
       * @param {Object} current
       * @param {string} key
       */
      (current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined
      },
      obj
    )
  }

  /**
   * Helper for deep equality check
   * @private
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} - Whether the values are deeply equal
   */
  _deepEqual(a, b) {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object' || a === null || b === null) return false
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => this._deepEqual(a[key], b[key]))
  }
}

/**
 * Create Inertia testing utilities for a Sails instance
 * @param {Object} sails - The Sails application instance
 * @returns {Object} - Testing utilities
 */
module.exports = function createInertiaTestUtils(sails) {
  return {
    /**
     * Make an Inertia request and return a test response
     * @param {string|Object} urlOrOptions - URL string or request options
     * @returns {Promise<InertiaTestResponse>} - Test response with assertions
     * @example
     * // Simple GET
     * const page = await inertia.request('GET /users')
     *
     * // With options
     * const page = await inertia.request({
     *   url: 'POST /users',
     *   data: { name: 'John' },
     *   headers: { 'Authorization': 'Bearer token' }
     * })
     */
    async request(urlOrOptions) {
      const options =
        typeof urlOrOptions === 'string' ? { url: urlOrOptions } : urlOrOptions

      return new Promise((resolve, reject) => {
        sails.request(
          {
            ...options,
            headers: {
              [INERTIA]: 'true',
              [VERSION]: sails.config.inertia?.version || '1',
              ...options.headers
            }
          },
          /**
           * @param {Error|null} err - Error if request failed
           * @param {SailsResponse} response - The response object
           * @param {InertiaPage} body - The response body
           */
          (err, response, body) => {
            // For Inertia, even "errors" (redirects, etc) are valid responses
            // We want to return the response for assertions
            if (err && !response) {
              return reject(err)
            }

            // Normalize response
            const normalizedResponse = response || { body, statusCode: 200 }
            if (!normalizedResponse.body && body) {
              normalizedResponse.body = body
            }

            resolve(new InertiaTestResponse(normalizedResponse))
          }
        )
      })
    },

    /**
     * Make a partial reload request
     * @param {string} url - The URL to request
     * @param {string} component - The component name for partial reload
     * @param {string[]} only - Props to reload
     * @returns {Promise<InertiaTestResponse>} - Test response
     * @example
     * const page = await inertia.partialRequest('/users', 'Users/Index', ['users'])
     */
    async partialRequest(url, component, only = []) {
      return this.request({
        url,
        headers: {
          'X-Inertia-Partial-Component': component,
          'X-Inertia-Partial-Data': only.join(',')
        }
      })
    },

    /**
     * Make a request with specific props excluded from partial reload
     * @param {string} url - The URL to request
     * @param {string} component - The component name
     * @param {string[]} except - Props to exclude
     * @returns {Promise<InertiaTestResponse>} - Test response
     */
    async partialExceptRequest(url, component, except = []) {
      return this.request({
        url,
        headers: {
          'X-Inertia-Partial-Component': component,
          'X-Inertia-Partial-Except': except.join(',')
        }
      })
    },

    /**
     * The InertiaTestResponse class for custom extensions
     */
    InertiaTestResponse
  }
}
