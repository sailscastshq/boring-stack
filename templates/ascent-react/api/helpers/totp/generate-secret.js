module.exports = {
  friendlyName: 'Generate TOTP secret',

  description: 'Generate a new TOTP secret for user setup.',

  inputs: {
    userEmail: {
      type: 'string',
      required: true,
      description: "The user's email address."
    },
    issuer: {
      type: 'string',
      required: true,
      description: 'The application name.'
    },
    secretLength: {
      type: 'number',
      defaultsTo: 32,
      description: 'Length of the secret.'
    }
  },

  exits: {
    success: {
      outputFriendlyName: 'TOTP secret data',
      outputDescription:
        'Generated secret with base32 encoding and otpauth URL.',
      outputType: 'ref'
    }
  },

  fn: async function ({ userEmail, issuer, length }) {
    const speakeasy = require('speakeasy')

    return speakeasy.generateSecret({
      name: userEmail,
      issuer,
      length
    })
  }
}
