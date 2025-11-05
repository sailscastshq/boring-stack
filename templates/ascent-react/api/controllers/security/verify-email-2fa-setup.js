module.exports = {
  friendlyName: 'Verify email 2FA setup',
  description: 'Verify email 2FA code and enable email-based authentication.',

  inputs: {
    code: {
      type: 'string',
      required: true,
      description: 'The 6-digit verification code sent to email.',
      example: '123456'
    }
  },

  exits: {
    success: {
      responseType: 'redirect',
      description: 'Email 2FA verified and enabled successfully.'
    },
    unauthorized: {
      description: 'User is not authenticated.',
      responseType: 'unauthorized'
    },
    invalid: {
      description: 'Invalid or expired verification code.',
      responseType: 'badRequest'
    }
  },

  fn: async function ({ code }) {
    if (!this.req.session.userId) {
      throw 'unauthorized'
    }

    const user = await User.findOne({ id: this.req.session.userId })

    if (
      !user.twoFactorVerificationCode ||
      !user.twoFactorVerificationCodeExpiresAt
    ) {
      throw {
        invalid: {
          problems: [
            {
              code: 'No verification code found. Please restart the setup flow.'
            }
          ]
        }
      }
    }

    if (Date.now() > user.twoFactorVerificationCodeExpiresAt) {
      await User.updateOne({ id: user.id }).set({
        twoFactorVerificationCode: null,
        twoFactorVerificationCodeExpiresAt: null
      })
      throw {
        invalid: { problems: [{ code: 'Verification code has expired.' }] }
      }
    }

    if (user.twoFactorVerificationCode !== code) {
      throw { invalid: { problems: [{ code: 'Invalid verification code.' }] } }
    }

    await User.updateOne({ id: user.id }).set({
      emailTwoFactorEnabled: true,
      twoFactorEnabled: true,
      twoFactorVerificationCode: null,
      twoFactorVerificationCodeExpiresAt: null
    })

    this.req.flash(
      'success',
      'Email two-factor authentication has been enabled successfully!'
    )

    return '/settings/security'
  }
}
