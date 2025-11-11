module.exports = {
  friendlyName: 'Features',

  description: 'View features page.',

  inputs: {},

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'features' }
  }
}
