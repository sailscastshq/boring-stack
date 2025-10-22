module.exports = {
  friendlyName: 'Setup email 2FA',
  description:
    'Send a verification code to user email to set up email-based 2FA.',

  inputs: {},

  exits: {
    success: {
      responseType: 'redirect',
      description: 'Verification code sent to email successfully.'
    },
    unauthorized: {
      description: 'User is not authenticated.',
      responseType: 'unauthorized'
    },
    serverError: {
      description: 'Failed to send verification email.',
      responseType: 'serverError'
    }
  },

  fn: async function () {
    if (!this.req.session.userId) {
      throw 'unauthorized'
    }

    const user = await User.findOne({ id: this.req.session.userId })

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes from now

    // Store verification code temporarily
    await User.updateOne({ id: user.id }).set({
      twoFactorVerificationCode: verificationCode,
      twoFactorVerificationCodeExpiresAt: expiresAt
    })

    await sails.helpers.mail.send
      .with({
        to: user.email,
        subject: 'Two-Factor Authentication Setup - Verification Code',
        template: 'email-2fa-setup-verification',
        templateData: {
          fullName: user.fullName,
          verificationCode: verificationCode
        }
      })
      .intercept((err) => {
        sails.log.error('Failed to send 2FA verification email:', err)
        return 'serverError'
      })
    return '/settings/security'
  }
}
