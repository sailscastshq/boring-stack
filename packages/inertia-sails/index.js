/**
 * inertia hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
const inertia = require('./private/middleware/inertia-middleware')
const DeferProp = require('./private/props/defer-prop')
const render = require('./private/render')
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
          encrypt: false,
          clear: false
        }
      }
    },
    initialize: async function () {
      hook = this
      sails.inertia = hook
      sails.inertia.sharedProps = {}
      sails.inertia.sharedViewData = {}
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
    share: function (key, value = null) {
      return (sails.inertia.sharedProps[key] = value)
    },

    /**
     * Get shared properties
     * @param {string|null} key - The key of the property to get, or null to get all
     * @returns {*} - The shared property or all shared properties
     */
    getShared: function (key = null) {
      return sails.inertia.sharedProps[key] ?? sails.inertia.sharedProps
    },

    /**
     * Flush shared properties
     * @param {string|null} key - The key of the property to flush, or null to flush all
     */
    flushShared: function (key) {
      return key
        ? delete sails.inertia.sharedProps[key]
        : (sails.inertia.sharedProps = {})
    },

    /**
     * Add view data
     * @param {string} key - The key of the view data
     * @param {*} value - The value of the view data
     */
    viewData: function (key, value) {
      return (sails.inertia.sharedViewData[key] = value)
    },

    /**
     * Get view data
     * @param {string} key - The key of the view data to get
     * @returns {*} - The view data
     */
    getViewData: function (key) {
      return sails.inertia.sharedViewData[key] ?? sails.inertia.sharedViewData
    },

    /**
     * Create a deferred prop
     * This allows you to load certain page data after the initial render.
     * @docs https://docs.sailscasts.com/boring-stack/deferred-props
     * @param {Function} cb - The callback function to execute
     * @param {string} group - The group name
     * @returns {DeferProp} - The deferred prop
     */
    defer: function (cb, group = 'default') {
      return new DeferProp(cb, group)
    },

    /**
     * Render the response
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @param {Object} data - The data to render
     * @returns {*} - The rendered response
     */
    render: function (req, res, data) {
      return render(req, res, data)
    }
  }
}
