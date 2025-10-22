module.exports = {
  friendlyName: 'View profile settings',

  description: 'Display "Profile Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'settings/profile' }
  }
}
