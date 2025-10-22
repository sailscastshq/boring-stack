module.exports = {
  friendlyName: 'Verify TOTP setup',

  description: 'Verify TOTP code during setup and enable TOTP authentication.',

  inputs: {
    token: {
      type: 'string',
      required: true,
      description: 'The 6-digit TOTP code from the authenticator app.',
      example: '123456'
    }
  },

  exits: {
    success: {
      responseType: 'redirect',
      description: 'TOTP setup verified and enabled successfully.'
    },
    unauthorized: {
      description: 'User is not authenticated.',
      responseType: 'unauthorized'
    },
    invalid: {
      description: 'Invalid TOTP code.',
      responseType: 'badRequest'
    }
  },

  fn: async function ({ token }) {
    const user = await User.findOne({ id: this.req.session.userId })
    if (!user.totpSecret) {
      throw {
        invalid: {
          problems: [
            {
              twoFactorSetup:
                'TOTP setup is required. Please restart the setup process.'
            }
          ]
        }
      }
    }

    const verified = await sails.helpers.totp.verify.with({
      secret: user.totpSecret,
      token: token
    })

    if (!verified) {
      throw {
        invalid: {
          problems: [
            {
              twoFactorSetup:
                'Invalid verification code. Please check your authenticator app and try again.'
            }
          ]
        }
      }
    }
    // Generate backup codes for TOTP setup
    const crypto = require('crypto')
    let backupCodes = []
    let hashedCodes = []

    // Generate 8 backup codes (8 characters each)
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      backupCodes.push(code)
    }

    // Hash backup codes for database storage
    for (const code of backupCodes) {
      const hashed = await sails.helpers.passwords.hashPassword(code)
      hashedCodes.push(hashed)
    }

    // Store plain backup codes in session for the backup codes modal
    this.req.session.backupCodes = backupCodes

    // Enable TOTP and overall 2FA with backup codes
    await User.updateOne({ id: user.id }).set({
      totpEnabled: true,
      twoFactorEnabled: true,
      backupCodes: hashedCodes
    })

    this.req.flash('success', 'TOTP authentication enabled successfully')
    return '/settings/security'
  }
}
