module.exports = {
  friendlyName: 'Disable 2FA',
  description: 'Disable specific two-factor authentication methods or all 2FA.',
  inputs: {
    method: {
      type: 'string',
      description: 'The 2FA method to disable: totp, email, or all.',
      isIn: ['totp', 'email', 'all'],
      defaultsTo: 'all',
      example: 'totp'
    }
  },
  exits: {
    success: {
      responseType: 'redirect',
      description: '2FA method disabled successfully.'
    },
    badRequest: {
      description: 'Invalid method or user has no 2FA enabled.',
      responseType: 'badRequest'
    }
  },
  fn: async function ({ method }) {
    const user = await User.findOne({ id: this.req.session.userId })
    if (!user.twoFactorEnabled) {
      throw {
        badRequest: {
          problems: [{ twoFactor: 'No 2FA methods are currently enabled.' }]
        }
      }
    }
    let valuesToSet = {}
    // Handle different disable methods
    if (method === 'totp') {
      valuesToSet.totpEnabled = false
      valuesToSet.totpSecret = null

      // If email 2FA is also not enabled, disable 2FA entirely
      if (!user.emailTwoFactorEnabled) {
        valuesToSet.twoFactorEnabled = false
        valuesToSet.backupCodes = null
      }
    } else if (method === 'email') {
      valuesToSet.emailTwoFactorEnabled = false
      valuesToSet.twoFactorVerificationCode = null
      valuesToSet.twoFactorVerificationCodeExpiresAt = null

      // If TOTP is also not enabled, disable 2FA entirely
      if (!user.totpEnabled) {
        valuesToSet.twoFactorEnabled = false
        valuesToSet.backupCodes = null
      }
    } else if (method === 'all') {
      valuesToSet.twoFactorEnabled = false
      valuesToSet.totpEnabled = false
      valuesToSet.totpSecret = null
      valuesToSet.emailTwoFactorEnabled = false
      valuesToSet.twoFactorVerificationCode = null
      valuesToSet.twoFactorVerificationCodeExpiresAt = null
      valuesToSet.backupCodes = null
    }

    await User.updateOne({ id: user.id }).set(valuesToSet)
    const methodDisplayName =
      method === 'all'
        ? 'All two-factor authentication methods'
        : method === 'totp'
        ? 'Authenticator app (TOTP)'
        : 'Email verification (2FA)'

    this.req.flash('success', `${methodDisplayName} disabled successfully`)
    return '/settings/security'
  }
}
