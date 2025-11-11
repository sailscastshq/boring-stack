module.exports = {
  friendlyName: 'Send login email 2FA',
  description: 'Send verification code via email during login process.',

  inputs: {},

  exits: {
    success: {
      responseType: 'redirect'
    },
    unauthorized: {
      description: 'No valid partial login session.',
      responseType: 'unauthorized'
    },
    serverError: {
      description: 'Failed to send verification email.',
      responseType: 'serverError'
    }
  },

  fn: async function () {
    if (!this.req.session.partialLogin) {
      throw 'unauthorized'
    }

    const partialLogin = this.req.session.partialLogin

    if (Date.now() - partialLogin.loginTimestamp > 10 * 60 * 1000) {
      delete this.req.session.partialLogin
      delete this.req.session.twoFactorMethods
      throw { unauthorized: '/login' }
    }

    const user = await User.findOne({ id: partialLogin.userId })

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000

    await User.updateOne({ id: user.id }).set({
      twoFactorVerificationCode: verificationCode,
      twoFactorVerificationCodeExpiresAt: expiresAt
    })

    await sails.helpers.mail.send
      .with({
        to: user.email,
        subject: 'Login Verification Code',
        template: 'email-2fa-login-verification',
        templateData: {
          fullName: user.fullName,
          verificationCode: verificationCode,
          userAgent: this.req.get('User-Agent'),
          ipAddress: this.req.ip
        }
      })
      .intercept((err) => {
        sails.log.error('Failed to send login 2FA email:', err)
        return 'serverError'
      })

    return '/verify-2fa'
  }
}
