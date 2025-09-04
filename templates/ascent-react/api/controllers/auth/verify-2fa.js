module.exports = {
  friendlyName: 'Verify 2FA',
  description: 'Verify 2FA code and complete login process.',

  inputs: {
    code: {
      type: 'string',
      required: true,
      description: 'The 6-digit verification code.',
      example: '123456'
    },
    method: {
      type: 'string',
      isIn: ['totp', 'email'],
      required: true,
      description: 'The 2FA method being used.'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    unauthorized: {
      responseType: 'redirect'
    },
    invalid: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ code, method }) {
    if (!this.req.session.partialLogin) {
      throw { unauthorized: '/login' }
    }

    const partialLogin = this.req.session.partialLogin

    if (Date.now() - partialLogin.loginTimestamp > 10 * 60 * 1000) {
      delete this.req.session.partialLogin
      delete this.req.session.twoFactorMethods
      throw { unauthorized: '/login' }
    }

    const user = await User.findOne({ id: partialLogin.userId })

    let isValidCode = false

    if (method === 'totp' && user.totpEnabled) {
      const speakeasy = require('speakeasy')
      isValidCode = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: code,
        window: 2
      })
    } else if (method === 'email' && user.emailTwoFactorEnabled) {
      if (
        !user.twoFactorVerificationCode ||
        !user.twoFactorVerificationCodeExpiresAt
      ) {
        throw 'invalid'
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

      isValidCode = user.twoFactorVerificationCode === code

      if (isValidCode) {
        await User.updateOne({ id: user.id }).set({
          twoFactorVerificationCode: null,
          twoFactorVerificationCodeExpiresAt: null
        })
      }
    }

    if (!isValidCode) {
      throw { invalid: { problems: [{ code: 'Invalid verification code.' }] } }
    }

    if (partialLogin.rememberMe) {
      this.req.session.cookie.maxAge =
        sails.config.custom.rememberMeCookieMaxAge
    }

    this.req.session.userId = user.id

    const destination = partialLogin.intendedDestination

    delete this.req.session.partialLogin
    delete this.req.session.twoFactorMethods

    return destination
  }
}
