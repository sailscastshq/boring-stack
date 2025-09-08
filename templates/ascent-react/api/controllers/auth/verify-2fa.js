module.exports = {
  friendlyName: 'Verify 2FA',
  description: 'Verify 2FA code and complete login process.',

  inputs: {
    code: {
      type: 'string',
      required: true,
      description:
        'The verification code (6 digits for TOTP/email, 8 characters for backup codes).',
      example: '123456'
    },
    method: {
      type: 'string',
      isIn: ['totp', 'email', 'backup'],
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
    sessionExpired: {
      responseType: 'redirect'
    },
    invalid: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ code, method }) {
    const partialLogin = this.req.session.partialLogin

    if (Date.now() - partialLogin.loginTimestamp > 10 * 60 * 1000) {
      delete this.req.session.partialLogin
      delete this.req.session.twoFactorMethods
      throw { sessionExpired: '/login?expired=true' }
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
        throw {
          invalid: {
            problems: [{ code: 'No 2FA code found. Please request a new one.' }]
          }
        }
      }

      if (Date.now() > user.twoFactorVerificationCodeExpiresAt) {
        await User.updateOne({ id: user.id }).set({
          twoFactorVerificationCode: null,
          twoFactorVerificationCodeExpiresAt: null
        })
        throw {
          invalid: {
            problems: [
              { code: '2FA Verification code has ben used or has expired.' }
            ]
          }
        }
      }

      isValidCode = user.twoFactorVerificationCode === code

      if (isValidCode) {
        await User.updateOne({ id: user.id }).set({
          twoFactorVerificationCode: null,
          twoFactorVerificationCodeExpiresAt: null
        })
      }
    } else if (method === 'backup' && user.twoFactorEnabled) {
      // Check if user has backup codes
      if (!user.backupCodes || user.backupCodes.length === 0) {
        throw {
          invalid: {
            problems: [
              {
                code: 'No backup codes found. Please generate backup codes first.'
              }
            ]
          }
        }
      }

      // Verify backup code against stored codes
      const matchingCodeIndex = user.backupCodes.indexOf(code)

      if (matchingCodeIndex !== -1) {
        isValidCode = true
      }

      if (isValidCode && matchingCodeIndex !== -1) {
        // Remove the used backup code from the array
        const updatedBackupCodes = [...user.backupCodes]
        updatedBackupCodes.splice(matchingCodeIndex, 1)

        await User.updateOne({ id: user.id }).set({
          backupCodes: updatedBackupCodes
        })
      }
    }

    if (!isValidCode) {
      throw {
        invalid: { problems: [{ code: 'Invalid or used backup code.' }] }
      }
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
