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
    const unverifiedUser = await User.updateOne(this.req.session.userId).set({
      emailStatus: 'unverified',
      emailProofToken: sails.helpers.strings.random('url-friendly'),
      emailProofTokenExpiresAt:
        Date.now() + sails.config.custom.emailProofTokenTTL
    })
    if (!unverifiedUser) throw 'userNotFound'

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
