module.exports = {
  friendlyName: 'Verify TOTP code',

  description: "Verify a TOTP code against a user's secret.",

  inputs: {
    secret: {
      type: 'string',
      required: true,
      description: "The user's TOTP secret (base32 encoded)."
    },
    token: {
      type: 'string',
      required: true,
      description: 'The 6-digit TOTP code to verify.'
    },
    window: {
      type: 'number',
      defaultsTo: 2,
      description: 'Time window for verification (allows for clock drift).'
    }
  },

  exits: {
    success: {
      outputFriendlyName: 'TOTP verification result',
      outputDescription: 'Whether the TOTP code is valid.',
      outputType: 'boolean'
    }
  },

  fn: async function ({ secret, token, window }) {
    const speakeasy = require('speakeasy')

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window
    })
  }
}
