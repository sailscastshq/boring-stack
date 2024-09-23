module.exports = {
  friendlyName: 'Forgot password',

  description:
    'Send a password recovery notification to the user with the specified email address.',

  inputs: {
    email: {
      description:
        'The email address of the alleged user who wants to recover their password.',
      example: 'kelvin@boringstack.com',
      type: 'string',
      required: true,
      isEmail: true
    }
  },

  exits: {
    success: {
      description:
        'The email address might have matched a user in the database.  (If so, a recovery email was sent.)',
      responseType: 'redirect'
    }
  },

  fn: async function ({ email }) {
    const userExists = await User.count({ email: this.req.session.userEmail })
    if (!userExists) {
      return '/check-email'
    }

    const token = await sails.helpers.strings.random('url-friendly')

    const user = await User.updateOne({ email }).set({
      passwordResetToken: token,
      passwordResetTokenExpiresAt:
        Date.now() + sails.config.custom.passwordResetTokenTTL
    })

    await sails.helpers.mail.send.with({
      to: user.email,
      subject: 'Password reset instructions',
      template: 'email-reset-password',
      templateData: {
        fullName: user.fullName,
        token
      }
    })

    this.req.session.userEmail = user.email
    return '/check-email'
  }
}
