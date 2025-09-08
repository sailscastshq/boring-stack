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

    // Get current user to access passwordUpdatedAt
    const user = await User.findOne({ id: this.req.session.userId })
    const passwordLastUpdated = user.passwordUpdatedAt
      ? await sails.helpers.formatRelativeDate(user.passwordUpdatedAt)
      : 'Unknown'

    if (totpSetupData) {
      delete this.req.session.totpSetupData
    }

    if (backupCodes) {
      delete this.req.session.backupCodes
    }

    return {
      page: 'settings/security',
      props: {
        totpSetupData,
        backupCodes,
        passwordLastUpdated
      }
    }
  }
}
