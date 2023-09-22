module.exports = {
  friendlyName: 'View forgot password',

  description: 'Display "Forgot password" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('forgot-password')
  }
}
