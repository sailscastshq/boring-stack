module.exports = {
  friendlyName: 'View billing settings',

  description: 'Display "Billing Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'settings/billing' }
  }
}
