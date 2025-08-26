module.exports = {
  friendlyName: 'Reset password',

  description: '',

  inputs: {
    token: {
      description: 'The verification token from the email.',
      example: 'lyCap0N9i8wKYz7rhrEPog'
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidOrExpiredToken: {
      responseType: 'redirect',
      description: 'The provided token is expired, invalid, or already used up.'
    },
    badSignupRequest: {
      responseType: 'badRequest',
      description:
        'The provided fullName, password and/or email address are invalid.',
      extendedDescription:
        'If this request was sent from a graphical user interface, the request ' +
        'parameters should have been validated/coerced _before_ they were sent.'
    }
  },

  fn: async function ({ token, password }) {
    if (!token) {
      this.req.flash(
        'error',
        'The password reset link is invalid or has expired. Please request a new link.'
      )
      throw { invalidOrExpiredToken: '/forgot-password' }
    }

    const user = await User.findOne({ passwordResetToken: token })

    if (!user || user.passwordResetTokenExpiresAt <= Date.now()) {
      this.req.flash(
        'error',
        'The password reset link is invalid or has expired. Please request a new link.'
      )
      throw { invalidOrExpiredToken: '/forgot-password' }
    }
    await User.updateOne({ id: user.id }).set({
      password,
      passwordResetToken: '',
      passwordResetTokenExpiresAt: 0
    })

    this.req.session.userId = user.id

    delete this.req.session.userEmail

    this.req.flash(
      'success',
      'Your password has been successfully reset. Welcome back!'
    )

    return '/dashboard'
  }
}
