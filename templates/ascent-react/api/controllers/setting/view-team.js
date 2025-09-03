module.exports = {
  friendlyName: 'View team settings',

  description: 'Display "Team Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'settings/team' }
  }
}
