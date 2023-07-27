module.exports = {
  friendlyName: 'View verified email',

  description: 'Display "Verified email" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('verified-email')
  }
}
