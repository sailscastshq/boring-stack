module.exports = {
  friendlyName: 'Generate backup codes',
  description: 'Generate new backup codes for 2FA recovery.',
  inputs: {},
  exits: {
    success: {
      responseType: 'redirect',
      description: 'Backup codes generated successfully.'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },
  fn: async function (inputs) {
    const crypto = require('crypto')
    const user = await User.findOne({ id: this.req.session.userId })

    if (!user.twoFactorEnabled) {
      throw {
        badRequest: {
          problems: [
            {
              generateBackupCodes:
                'You must enable enable 2FA to generate backup codes'
            }
          ]
        }
      }
    }

    // Generate 8 backup codes (8 characters each)
    const backupCodes = []
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      backupCodes.push(code)
    }

    await User.updateOne({ id: user.id }).set({
      backupCodes: backupCodes
    })
    this.req.session.backupCodes = backupCodes
    return '/settings/security'
  }
}
