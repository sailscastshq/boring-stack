module.exports = {
  friendlyName: 'Generate backup codes',

  description: 'Generate new backup codes for 2FA recovery.',

  inputs: {},

  exits: {
    success: {
      description: 'Backup codes generated successfully.',
      outputType: 'ref'
    },
    unauthorized: {
      description: 'User is not authenticated.',
      responseType: 'unauthorized'
    },
    forbidden: {
      description: '2FA is not enabled for this user.',
      responseType: 'forbidden'
    }
  },

  fn: async function (inputs) {
    // Ensure user is authenticated
    if (!this.req.session.userId) {
      throw 'unauthorized'
    }

    const crypto = require('crypto')

    const user = await User.findOne({ id: this.req.session.userId })

    if (!user.twoFactorEnabled) {
      throw 'forbidden'
    }

    // Generate 8 backup codes (8 characters each)
    const backupCodes = []
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      backupCodes.push(code)
    }

    // Store hashed backup codes
    const hashedCodes = []
    for (const code of backupCodes) {
      const hashed = await sails.helpers.passwords.hashPassword(code)
      hashedCodes.push(hashed)
    }

    await User.updateOne({ id: user.id }).set({
      backupCodes: hashedCodes
    })

    return {
      codes: backupCodes,
      message:
        'New backup codes generated successfully. Save these codes in a secure place.'
    }
  }
}
