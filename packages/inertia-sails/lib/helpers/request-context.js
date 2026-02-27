/**
 * Request context using AsyncLocalStorage.
 *
 * This allows accessing the current request and request-scoped data anywhere
 * in the async call chain without explicitly passing it through function parameters.
 *
 * Similar to how Laravel's IoC container provides implicit request access.
 *
 * Stored context shape:
 * {
 *   req: Request,
 *   res: Response,
 *   sharedProps: {},      // Request-scoped shared props
 *   sharedLocals: {},     // Request-scoped locals for root EJS template
 *   encryptHistory: null, // Request-scoped history encryption (null = use default)
 *   clearHistory: false,  // Request-scoped clear history flag
 *   refreshOnceProps: [], // Props to force-refresh for this request
 *   rootView: null        // Request-scoped root view template (null = use default)
 * }
 */
const { AsyncLocalStorage } = require('async_hooks')

const requestContext = new AsyncLocalStorage()

module.exports = {
  /**
   * Get the AsyncLocalStorage instance
   */
  storage: requestContext,

  /**
   * Run a callback with request context stored
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} callback - The callback to run
   * @returns {*} - The result of the callback
   */
  run(req, res, callback) {
    const context = {
      req,
      res,
      sharedProps: {},
      sharedLocals: {},
      encryptHistory: null,
      clearHistory: false,
      refreshOnceProps: [], // Props to force-refresh for this request
      rootView: null // Request-scoped root view template
    }
    return requestContext.run(context, () => callback())
  },

  /**
   * Get the full context object
   * @returns {Object|undefined} - The current context or undefined if not in context
   */
  getContext() {
    return requestContext.getStore()
  },

  /**
   * Get the current request from context
   * @returns {Object|undefined} - The current request or undefined if not in context
   */
  getRequest() {
    const context = requestContext.getStore()
    return context?.req
  },

  /**
   * Get the current response from context
   * @returns {Object|undefined} - The current response or undefined if not in context
   */
  getResponse() {
    const context = requestContext.getStore()
    return context?.res
  },

  /**
   * Get request-scoped shared props
   * @returns {Object} - The shared props for this request
   */
  getSharedProps() {
    const context = requestContext.getStore()
    return context?.sharedProps || {}
  },

  /**
   * Set a request-scoped shared prop
   * @param {string} key - The key
   * @param {*} value - The value
   */
  setSharedProp(key, value) {
    const context = requestContext.getStore()
    if (context) {
      context.sharedProps[key] = value
    }
  },

  /**
   * Get request-scoped shared locals
   * @returns {Object} - The shared locals for this request
   */
  getSharedLocals() {
    const context = requestContext.getStore()
    return context?.sharedLocals || {}
  },

  /**
   * Set a request-scoped shared local
   * @param {string} key - The key
   * @param {*} value - The value
   */
  setSharedLocal(key, value) {
    const context = requestContext.getStore()
    if (context) {
      context.sharedLocals[key] = value
    }
  },

  /**
   * Get request-scoped encrypt history setting
   * @returns {boolean|null} - The encrypt history setting or null for default
   */
  getEncryptHistory() {
    const context = requestContext.getStore()
    return context?.encryptHistory ?? null
  },

  /**
   * Set request-scoped encrypt history
   * @param {boolean} encrypt - Whether to encrypt history
   */
  setEncryptHistory(encrypt) {
    const context = requestContext.getStore()
    if (context) {
      context.encryptHistory = encrypt
    }
  },

  /**
   * Get request-scoped clear history flag
   * @returns {boolean} - Whether to clear history
   */
  getClearHistory() {
    const context = requestContext.getStore()
    return context?.clearHistory || false
  },

  /**
   * Set request-scoped clear history flag
   * @param {boolean} clear - Whether to clear history
   */
  setClearHistory(clear) {
    const context = requestContext.getStore()
    if (context) {
      context.clearHistory = clear
    }
  },

  /**
   * Get the list of once props to force-refresh
   * @returns {string[]} - Array of prop keys to refresh
   */
  getRefreshOnceProps() {
    const context = requestContext.getStore()
    return context?.refreshOnceProps || []
  },

  /**
   * Add a prop key to force-refresh
   * @param {string} key - The prop key to refresh
   */
  addRefreshOnceProp(key) {
    const context = requestContext.getStore()
    if (context && !context.refreshOnceProps.includes(key)) {
      context.refreshOnceProps.push(key)
    }
  },

  /**
   * Get request-scoped root view template
   * @returns {string|null} - The root view template or null for default
   */
  getRootView() {
    const context = requestContext.getStore()
    return context?.rootView ?? null
  },

  /**
   * Set request-scoped root view template
   * @param {string} view - The root view template name
   */
  setRootView(view) {
    const context = requestContext.getStore()
    if (context) {
      context.rootView = view
    }
  }
}
