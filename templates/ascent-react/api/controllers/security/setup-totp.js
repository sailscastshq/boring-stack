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
    const speakeasy = require('speakeasy')
    const QRCode = require('qrcode')

    const user = await User.findOne({ id: this.req.session.userId })

    const secret = speakeasy.generateSecret({
      name: user.email,
      issuer: 'Ascent React',
      length: 32
    })
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url)

    // Store temporary secret (not yet verified)
    await User.updateOne({ id: user.id }).set({
      totpSecret: secret.base32 // Store temporarily until verification
    })

    // Store QR code data in session for the modal
    this.req.session.totpSetupData = {
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret.base32,
      otpauthUrl: secret.otpauth_url
    }

    return '/settings/security'
  }
}
