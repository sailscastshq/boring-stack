module.exports = {
  friendlyName: 'Setup TOTP',
  description:
    'Generate a TOTP secret and QR code for authenticator app setup.',
  inputs: {},
  exits: {
    success: {
      responseType: 'redirect',
      description: 'TOTP setup data generated successfully.'
    }
  },

  fn: async function (inputs) {
    const user = await User.findOne({ id: this.req.session.userId })

    const secret = await sails.helpers.totp.generateSecret.with({
      userEmail: user.email,
      issuer: sails.config.custom.appName
    })

    const qrCodeDataUrl = await sails.helpers.totp.generateQrCode(
      secret.otpauth_url
    )

    await User.updateOne({ id: user.id }).set({
      totpSecret: secret.base32
    })

    this.req.session.totpSetupData = {
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret.base32,
      otpauthUrl: secret.otpauth_url
    }

    return '/settings/security'
  }
}
