module.exports = {
  friendlyName: 'View register',

  description: 'Display "Register" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    // Respond with view.
    return sails.inertia.render('register')
  }
}
