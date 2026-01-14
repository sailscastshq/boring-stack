/**
 * Inertia.js Hook for Sails.js
 *
 * Provides server-side Inertia.js protocol support for The Boring JavaScript Stack.
 *
 * @module inertia-sails
 * @description A hook definition that extends Sails by adding Inertia.js support.
 * @docs https://docs.sailscasts.com/boring-stack/inertia
 */

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * @typedef {Object} InertiaConfig
 * @property {string} [rootView='app'] - The root view template to use
 * @property {string|number|Function} [version=1] - Asset version for cache busting
 * @property {Object} [history] - History encryption settings
 * @property {boolean} [history.encrypt=false] - Whether to encrypt history state
 */

/**
 * @typedef {Object} InertiaPageProps
 * @property {Object.<string, *>} [props] - Page props to pass to the component
 */

/**
 * @typedef {Object} InertiaRenderData
 * @property {string} page - The component name to render
 * @property {Object.<string, *>} [props] - Props to pass to the component
 * @property {Object.<string, *>} [viewData] - Additional view data for the root template
 */

/**
 * @typedef {<T>() => T | Promise<T>} PropCallback
 */

const inertia = require('./lib/middleware/inertia-middleware')
const render = require('./lib/render')
const location = require('./lib/location')
const requestContext = require('./lib/helpers/request-context')

const DeferProp = require('./lib/props/defer-prop')
const OptionalProp = require('./lib/props/optional-prop')
const MergeProp = require('./lib/props/merge-prop')
const AlwaysProp = require('./lib/props/always-prop')
const OnceProp = require('./lib/props/once-prop')
const ScrollProp = require('./lib/props/scroll-prop')
const handleBadRequest = require('./lib/handle-bad-request')
const handleServerError = require('./lib/responses/server-error')

module.exports = function defineInertiaHook(sails) {
  let hook
  const routesToBindInertiaTo = [
    'GET r|^((?![^?]*\\/[^?\\/]+\\.[^?\\/]+(\\?.*)?).)*$|',
    // (^^Leave out assets)
    'POST /*',
    'PATCH /*',
    'PUT /*',
    'DELETE /*'
  ]

  return {
    defaults: {
      inertia: {
        rootView: 'app',
        version: 1,
        history: {
          encrypt: false
        }
      }
    },
    initialize: async function () {
      hook = this
      sails.inertia = hook
      sails.inertia.sharedProps = {}
      sails.inertia.sharedViewData = {}
      sails.inertia.shouldEncryptHistory = sails.config.inertia.history.encrypt
      sails.inertia.shouldClearHistory = false
      sails.on('router:before', function () {
        routesToBindInertiaTo.forEach(function (routeAddress) {
          sails.router.bind(routeAddress, inertia(hook))
        })
      })
    },

    /**
     * Share a property globally
     * @param {string} key - The key of the property
     * @param {*} value - The value of the property
     */
    share(key, value = null) {
      return (sails.inertia.sharedProps[key] = value)
    },

    /**
     * Get shared properties
     * @param {string|null} key - The key of the property to get, or null to get all
     * @returns {*} - The shared property or all shared properties
     */
    getShared(key = null) {
      return sails.inertia.sharedProps[key] ?? sails.inertia.sharedProps
    },

    /**
     * Flush shared properties
     * @param {string|null} key - The key of the property to flush, or null to flush all
     */
    flushShared(key) {
      return key
        ? delete sails.inertia.sharedProps[key]
        : (sails.inertia.sharedProps = {})
    },

    /**
     * Add view data
     * @param {string} key - The key of the view data
     * @param {*} value - The value of the view data
     */
    viewData(key, value) {
      return (sails.inertia.sharedViewData[key] = value)
    },

    /**
     * Get view data
     * @param {string} key - The key of the view data to get
     * @returns {*} - The view data
     */
    getViewData(key) {
      return sails.inertia.sharedViewData[key] ?? sails.inertia.sharedViewData
    },

    /**
     * Create an optional prop
     * This allows you to define properties that are only evaluated when accessed.
     * @docs https://docs.sailscasts.com/boring-stack/partial-reloads#lazy-data-evaluation
     * @param {Function} callback - The callback function to execute
     * @returns {OptionalProp} - The optional prop
     */
    optional(callback) {
      return new OptionalProp(callback)
    },

    /**
     * Create a mergeable prop
     * This allows you to merge multiple props together.
     * @docs https://docs.sailscasts.com/boring-stack/merging-props
     * @param {Function} callback - The callback function to execute
     * @returns {MergeProp} - The mergeable prop
     */
    merge(callback) {
      return new MergeProp(callback)
    },

    /**
     * Create an always prop
     * Always props are resolved on every request, whether partial or not.
     * @docs https://docs.sailscasts.com/boring-stack/partial-reloads#lazy-data-evaluation
     * @param {Function} callback - The callback function
     * @returns {AlwaysProp} - The always prop
     */
    always(callback) {
      return new AlwaysProp(callback)
    },
    /**
     * Create a deferred prop
     * This allows you to load certain page data after the initial render.
     * @docs https://docs.sailscasts.com/boring-stack/deferred-props
     * @param {Function} cb - The callback function to execute
     * @param {string} group - The group name
     * @returns {DeferProp} - The deferred prop
     */
    defer(cb, group = 'default') {
      return new DeferProp(cb, group)
    },

    /**
     * Create a once prop
     * Once props are resolved only once and cached across navigations.
     * The client tracks which props it has via X-Inertia-Except-Once-Props header.
     * Useful for expensive computations that don't change often.
     * @docs https://docs.sailscasts.com/boring-stack/once-props
     * @param {Function} callback - The callback function to execute
     * @returns {OnceProp} - The once prop
     * @example
     * // Basic usage
     * permissions: sails.inertia.once(async () => {
     *   return await Permission.find({ user: this.req.session.userId })
     * })
     * @example
     * // With expiration (1 hour)
     * permissions: sails.inertia.once(() => fetchPermissions()).until(3600)
     * @example
     * // Force refresh
     * permissions: sails.inertia.once(() => fetchPermissions()).fresh()
     */
    once(callback) {
      return new OnceProp(callback)
    },

    /**
     * Share a once prop globally
     * Combines share() and once() - the prop is shared across all responses
     * and only resolved once per session.
     * @docs https://docs.sailscasts.com/boring-stack/once-props#share-once
     * @param {string} key - The key of the property
     * @param {Function} callback - The callback function to execute
     * @returns {OnceProp} - The once prop (for chaining)
     * @example
     * // In a hook or middleware
     * sails.inertia.shareOnce('permissions', async () => {
     *   return await Permission.find({ user: req.session.userId })
     * })
     */
    shareOnce(key, callback) {
      const onceProp = new OnceProp(callback)
      sails.inertia.sharedProps[key] = onceProp
      return onceProp
    },

    /**
     * Flash data to the next Inertia response.
     * Unlike regular props, flash data is NOT persisted in browser history.
     * This prevents "phantom" toasts/notifications when users navigate back.
     * Flash data is stored in the session so it persists across redirects.
     * @docs https://docs.sailscasts.com/boring-stack/flash
     * @param {string|Object} key - The key or an object of key-value pairs
     * @param {*} [value] - The value (if key is a string)
     * @returns {Object} - The hook instance for chaining
     * @example
     * // Single value
     * sails.inertia.flash('success', 'Profile updated!')
     * @example
     * // Multiple values
     * sails.inertia.flash({ success: 'Saved!', highlight: 'profile-section' })
     */
    flash(key, value = null) {
      const req = requestContext.getRequest()
      if (!req || !req.session) {
        sails.log.warn(
          'sails.inertia.flash() called outside of request context'
        )
        return this
      }
      if (!req.session._inertiaFlash) {
        req.session._inertiaFlash = {}
      }
      if (typeof key === 'object' && key !== null) {
        req.session._inertiaFlash = { ...req.session._inertiaFlash, ...key }
      } else {
        req.session._inertiaFlash[key] = value
      }
      return this
    },

    /**
     * Get the current flash data from the session
     * @returns {Object} - The flash data object
     */
    getFlash() {
      const req = requestContext.getRequest()
      return req?.session?._inertiaFlash || {}
    },

    /**
     * Consume and clear flash data from the session.
     * Called internally by build-page-object after adding to response.
     * @param {Object} req - The request object
     * @returns {Object} - The flash data that was consumed
     */
    consumeFlash(req) {
      const flash = req?.session?._inertiaFlash || {}
      if (req?.session) {
        req.session._inertiaFlash = {}
      }
      return flash
    },

    /**
     * Create a deep merge prop
     * Like merge(), but recursively merges nested objects instead of replacing them.
     * @docs https://docs.sailscasts.com/boring-stack/merging-props#deep-merge
     * @param {Function} callback - The callback function to execute
     * @returns {MergeProp} - The mergeable prop with deep merge enabled
     * @example
     * // Deep merge nested user preferences
     * settings: sails.inertia.deepMerge(async () => {
     *   return await Settings.findOne({ user: this.req.session.userId })
     * })
     */
    deepMerge(callback) {
      return new MergeProp(callback).deepMerge()
    },

    /**
     * Render the response
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @param {Object} data - The data to render
     * @returns {*} - The rendered response
     */
    render(req, res, data) {
      return render(req, res, data)
    },
    /**
     * Handle Inertia redirects
     * See https://docs.sailscasts.com/boring-stack/redirects
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @param {string} url - The URL to redirect to
     * @returns {Object} - The response object with the redirect
     */
    location(req, res, url) {
      return location(req, res, url)
    },

    /**
     * Encrypt history
     * @docs https://docs.sailscasts.com/boring-stack/history-encryption
     * @param {boolean} encrypt - Whether to encrypt the history
     */
    encryptHistory(encrypt = true) {
      sails.inertia.shouldEncryptHistory = encrypt
    },

    /**
     * Clear history state.
     * @docs https://docs.sailscasts.com/boring-stack/history-encryption#clearing-history
     */
    clearHistory() {
      sails.inertia.shouldClearHistory = true
    },
    /**
     * Handle bad request responses for Inertia.js
     * For Inertia requests with validation errors, redirects back with errors in session.
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @param {Object|Error} [optionalData] - Optional error data or Error object
     * @returns {*} - Response (redirect for Inertia, status code for non-Inertia)
     */
    handleBadRequest(req, res, optionalData) {
      return handleBadRequest(req, res, optionalData)
    },

    /**
     * Handle server error responses for Inertia.js
     * For Inertia requests in development, displays a styled error modal with stack trace.
     * In production, redirects back with a flash error message.
     * @docs https://docs.sailscasts.com/boring-stack/error-handling
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @param {Object|Error} [error] - Optional error data or Error object
     * @returns {*} - Response (HTML modal for dev Inertia, redirect for prod)
     */
    handleServerError(req, res, error) {
      return handleServerError(req, res, error)
    },

    /**
     * Configure paginated data for infinite scrolling.
     * Wraps Waterline paginated data with proper merge behavior and normalizes
     * pagination metadata for Inertia's <InfiniteScroll> component.
     *
     * Note: Waterline uses 0-based page indexes, but the metadata is normalized
     * to 1-based for the Inertia client.
     *
     * @docs https://docs.sailscasts.com/boring-stack/infinite-scroll
     * @param {Function} callback - Callback returning the paginated data array
     * @param {Object} [options] - Pagination options
     * @param {number} [options.page=0] - Current page index (0-based)
     * @param {number} [options.perPage=10] - Items per page
     * @param {number} [options.total=0] - Total number of items
     * @param {string} [options.pageName='page'] - Query parameter name for pagination
     * @param {string} [options.wrapper='data'] - Key to wrap the data in
     * @returns {ScrollProp} - The scroll prop
     * @example
     * // Basic usage
     * const page = this.req.param('page', 0)
     * const perPage = 20
     * const users = await User.find().paginate(page, perPage)
     * const total = await User.count()
     *
     * return {
     *   page: 'users/index',
     *   props: {
     *     users: sails.inertia.scroll(() => users, { page, perPage, total })
     *   }
     * }
     */
    scroll(callback, options) {
      return new ScrollProp(callback, options || {})
    }
  }
}
