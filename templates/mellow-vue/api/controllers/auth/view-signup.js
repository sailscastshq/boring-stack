module.exports = {
  friendlyName: 'View signup',

  description: 'Display "Signup" page.',
  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('signup')
  }
}
