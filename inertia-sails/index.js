/**
 * inertia hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
const inertia = require('./private/inertia-middleware')
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
        version: 1
      }
    },
    initialize: async function () {
      hook = this
      sails.inertia = hook
      sails.inertia.sharedProps = {}
      sails.inertia.sharedViewData = {}
      sails.on('router:before', function routerBefore() {
        routesToBindInertiaTo.forEach(function iterator(routeAddress) {
          sails.router.bind(routeAddress, inertia(hook))
        })
      })
    },

    share: (key, value = null) => (sails.inertia.sharedProps[key] = value),

    getShared: (key = null) =>
      sails.inertia.sharedProps[key] ?? sails.inertia.sharedProps,

    flushShared: (key) => {
      key
        ? delete sails.inertia.sharedProps[key]
        : (sails.inertia.sharedProps = {})
    },

    viewData: (key, value) => (sails.inertia.sharedViewData[key] = value),

    getViewData: (key) =>
      sails.inertia.sharedViewData[key] ?? sails.inertia.sharedViewData
  }
}
