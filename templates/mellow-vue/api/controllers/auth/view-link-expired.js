module.exports = {
  friendlyName: 'View link expired',

  description: 'Display "Link expired" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    return sails.inertia.render('link-expired')
  }
}
