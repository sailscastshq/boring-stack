module.exports = {
  friendlyName: 'View create team',
  description: 'Display the create team form',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return {
      page: 'team/create'
    }
  }
}
