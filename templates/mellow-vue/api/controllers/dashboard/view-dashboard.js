module.exports = {
  friendlyName: 'View dashboard',

  description: 'Display "Dashboard" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'dashboard/index' }
  }
}
