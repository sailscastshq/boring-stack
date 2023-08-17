module.exports = {
  friendlyName: 'View reset password',

  description: 'Display "Reset password" page.',

  inputs: {
    token: {
      description: 'The reset token from the email.',
      example: 'lyCap0N9i8wKYz7rhrEPog'
    }
  },
  exits: {
    success: {},
    invalidOrExpiredToken: {
      responseType: 'expired',
      description: 'The provided token is expired, invalid, or already used up.'
    }
  },

  fn: async function ({ token }) {
    if (!token) {
      throw 'invalidOrExpiredToken'
    }
    return sails.inertia.render('reset-password')
  }
}
