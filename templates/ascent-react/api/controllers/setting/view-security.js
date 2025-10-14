module.exports = {
  friendlyName: 'View security settings',

  description: 'Display "Security Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const totpSetupData = this.req.session.totpSetupData || null
    const backupCodes = this.req.session.backupCodes || null
    const passkeyRegistration = this.req.session.passkeyRegistration || null

    // Get current user to access password and passkey info
    const user = await User.findOne({ id: this.req.session.userId })
    const hasPassword = !!user.password
    const passwordLastUpdated = user.passwordUpdatedAt
      ? await sails.helpers.formatRelativeDate(user.passwordUpdatedAt)
      : 'Unknown'
    const passwordStrength = user.passwordStrength || {
      label: 'unknown',
      color: 'secondary'
    }

    // Passkey data
    const passkeyEnabled = user.passkeyEnabled
    const passkeyCount = user.passkeys ? user.passkeys.length : 0
    const passkeys = user.passkeys || []

    if (totpSetupData) {
      delete this.req.session.totpSetupData
    }

    if (backupCodes) {
      delete this.req.session.backupCodes
    }

    if (passkeyRegistration) {
      delete this.req.session.passkeyRegistration
    }

    return {
      page: 'settings/security',
      props: {
        totpSetupData,
        backupCodes,
        hasPassword,
        passwordLastUpdated,
        passwordStrength,
        passkeyEnabled,
        passkeyCount,
        passkeys,
        passkeyRegistration
      }
    }
  }
}
