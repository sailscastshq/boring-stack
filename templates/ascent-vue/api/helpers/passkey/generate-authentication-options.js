module.exports = {
  friendlyName: 'Generate authentication options',
  description:
    'Generate WebAuthn authentication challenge options for passkey login.',
  inputs: {
    user: {
      type: 'ref',
      required: true,
      description: 'The user record with passkey data.'
    },
    rpID: {
      type: 'string',
      required: true,
      description: 'The relying party identifier.'
    }
  },
  exits: {
    success: {
      description: 'Authentication options generated successfully.'
    },
    noPasskeys: {
      description: 'User has no passkeys available for authentication.'
    },
    webauthnError: {
      description: 'WebAuthn library error occurred.'
    }
  },

  fn: async function ({ user, rpID }, exits) {
    const { generateAuthenticationOptions } = require('@simplewebauthn/server')

    if (!user.passkeyEnabled || !user.passkeys || user.passkeys.length === 0) {
      return exits.noPasskeys()
    }

    try {
      const options = generateAuthenticationOptions({
        rpID,
        allowCredentials: user.passkeys.map((passkey) => ({
          id: passkey.credentialID,
          type: 'public-key',
          transports: passkey.transports || ['internal', 'hybrid']
        })),
        userVerification: 'preferred',
        timeout: 60000
      })

      return exits.success(options)
    } catch (error) {
      return exits.webauthnError(error)
    }
  }
}
