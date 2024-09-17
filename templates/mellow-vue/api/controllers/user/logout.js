module.exports = {
  friendlyName: 'Logout',

  description: 'Logout user.',

  inputs: {},

  exits: {
    success: {
      responseType: 'inertiaRedirect'
    }
  },

  fn: async function () {
    sails.inertia.flushShared('loggedInUser')
    delete this.req.session.userId
    return '/login'
  }
}
