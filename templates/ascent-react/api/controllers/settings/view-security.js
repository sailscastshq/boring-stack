module.exports = {
  friendlyName: 'View security settings',

  description: 'Display "Security Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'settings/security' }
  }
}
