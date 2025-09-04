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
        backupCodes
      }
    }
  }
}
