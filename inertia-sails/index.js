/**
 * inertia hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
const inertia = require('./private/inertia-middleware')
module.exports = function defineInertiaHook(sails) {
  let hook
  let sharedProps = {}
  let sharedViewData = {}
  let rootView = 'app'
  routesToBindInertiaTo = [
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
        version: 1
      }
    },
    initialize: async function () {
      hook = this
      sails.inertia = hook

      sails.on('router:before', function routerBefore() {
        routesToBindInertiaTo.forEach(function iterator(routeAddress) {
          sails.router.bind(
            routeAddress,
            inertia(sails, { hook, sharedProps, sharedViewData, rootView })
          )
        })
      })
    },

    share: (key, value = null) => (sharedProps[key] = value),

    getShared: (key = null) => sharedProps[key] ?? sharedProps,

    flushShared: (key) => {
      key ? delete sharedProps[key] : (sharedProps = {})
    },

    viewData: (key, value) => (sharedViewData[key] = value),

    getViewData: (key) => sharedViewData[key] ?? sharedViewData,

    setRootView: (newRootView) => (rootView = newRootView),

    getRootView: () => rootView
  }
}
