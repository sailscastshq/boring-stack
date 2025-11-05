module.exports = {
  friendlyName: 'Generate TOTP QR code',

  description: 'Generate a QR code data URL for TOTP setup.',

  inputs: {
    authURL: {
      type: 'string',
      required: false,
      description: 'The otpauth URL for TOTP setup.',
      example:
        'otpauth://totp/Ascent%20React:user%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Ascent%20React'
    }
  },

  exits: {
    success: {
      outputFriendlyName: 'QR code data URL',
      outputDescription: 'Base64 data URL of the QR code image.',
      outputType: 'string'
    }
  },

  fn: async function ({ authURL }) {
    const qrcode = require('qrcode')
    return await qrcode.toDataURL(authURL)
  }
}
