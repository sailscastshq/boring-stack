module.exports = {
  friendlyName: 'View login',

  description: 'Display "Login" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('login')
  }
}
