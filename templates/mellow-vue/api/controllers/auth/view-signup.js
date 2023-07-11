module.exports = {
  friendlyName: 'View signup',

  description: 'Display "Signup" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    // Respond with view.
    return sails.inertia.render('signup')
  }
}
