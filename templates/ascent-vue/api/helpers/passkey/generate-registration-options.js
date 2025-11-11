module.exports = {
  friendlyName: 'Generate registration options',
  description: 'Generate WebAuthn registration options for passkey setup.',
  inputs: {
    user: {
      type: 'ref',
      required: true,
      description: 'The user record with existing passkey data.'
    },
    rpID: {
      type: 'string',
      required: true,
      description: 'The relying party identifier.'
    },
    rpName: {
      type: 'string',
      required: true,
      description: 'The relying party name.'
    },
    userId: {
      type: 'string',
      required: true,
      description: 'The user ID for WebAuthn.'
    }
  },
  exits: {
    success: {
      description: 'Registration options generated successfully.'
    },
    webauthnError: {
      description: 'WebAuthn library error occurred.'
    }
  },

  fn: async function ({ user, rpID, rpName, userId }, exits) {
    const { generateRegistrationOptions } = require('@simplewebauthn/server')

    const userIdBuffer = Buffer.from(userId)

    try {
      const options = generateRegistrationOptions({
        rpName,
        rpID,
        userID: userIdBuffer,
        userName: user.email,
        userDisplayName: user.email,
        attestationType: 'none',
        excludeCredentials: user.passkeys
          ? user.passkeys
              .filter((passkey) => passkey.credentialID) // Only include passkeys with valid credentialID
              .map((passkey) => ({
                id: passkey.credentialID,
                type: 'public-key'
              }))
          : [],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'required'
        },
        timeout: 60000
      })

      return exits.success(options)
    } catch (error) {
      return exits.webauthnError(error)
    }
  }
}
