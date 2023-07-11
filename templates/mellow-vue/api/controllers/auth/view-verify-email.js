module.exports = {
  friendlyName: 'View verify email',

  description: 'Display "Verify email" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('verify-email')
  }
}
