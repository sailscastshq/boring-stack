module.exports = {
  friendlyName: 'View verify email',

  description: 'Display "Verify email" page.',

  exits: {
    success: {}
  },

  fn: async function () {
    let message = null
    if (this.req.get('referrer').includes('forgot-password')) {
      message = `We sent a password resent link to ${this.req.session.userEmail}`
    } else {
      message = `We sent an email verification link to ${this.req.session.userEmail}`
    }
    return sails.inertia.render('check-email', {
      message
    })
  }
}
