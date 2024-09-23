module.exports = {
  friendlyName: 'Resend link',

  description: '',

  inputs: {},

  exits: {
    success: {
      responseType: 'redirect'
    },
    userNotFound: {
      responseType: 'notFound'
    }
  },

  fn: async function () {
    const userExists = await User.count({ email: this.req.session.userEmail })
    if (!userExists) {
      return '/check-email'
    }
    const unverifiedUser = await User.updateOne(this.req.session.userEmail).set(
      {
        emailStatus: 'unverified',
        emailProofToken: sails.helpers.strings.random('url-friendly'),
        emailProofTokenExpiresAt:
          Date.now() + sails.config.custom.emailProofTokenTTL
      }
    )

    this.req.session.userId = unverifiedUser.id

    await sails.helpers.mail.send.with({
      subject: 'Verify your email',
      template: 'email-verify-account',
      to: unverifiedUser.email,
      templateData: {
        token: unverifiedUser.emailProofToken,
        fullName: unverifiedUser.fullName
      }
    })
    return '/check-email'
  }
}
