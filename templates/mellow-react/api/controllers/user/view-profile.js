module.exports = {
  friendlyName: 'View profile',

  description: 'Display "Profile" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'dashboard/profile' }
  }
}
