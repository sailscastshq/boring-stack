module.exports = {
  friendlyName: 'Logout',

  description: 'Logout user.',

  inputs: {},

  exits: {
    success: {}
  },

  fn: async function () {
    sails.inertia.flushShared('loggedInUser')
    delete this.req.session.userId
    return sails.inertia.location('/')
  }
}
