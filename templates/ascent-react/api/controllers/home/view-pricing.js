module.exports = {
  friendlyName: 'Pricing',

  description: 'View pricing page.',

  inputs: {},

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'pricing' }
  }
}
