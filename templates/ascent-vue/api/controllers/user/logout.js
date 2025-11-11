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
    sails.inertia.flushShared('teams')
    sails.inertia.flushShared('currentTeam')

    delete this.req.session.userId
    return '/login'
  }
}
