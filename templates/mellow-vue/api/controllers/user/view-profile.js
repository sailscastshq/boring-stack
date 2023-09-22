module.exports = {
  friendlyName: 'View profile',

  description: 'Display "Profile" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('profile')
  }
}
