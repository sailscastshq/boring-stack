module.exports = {
  friendlyName: 'Verify authentication',
  description: 'Verify WebAuthn authentication response for passkey login.',
  inputs: {
    assertion: {
      type: 'ref',
      required: true,
      description: 'The WebAuthn assertion response from the browser.'
    },
    user: {
      type: 'ref',
      required: true,
      description: 'The user record with passkey data and challenge.'
    },
    rpID: {
      type: 'string',
      required: true,
      description: 'The relying party identifier.'
    },
    origin: {
      type: 'string',
      required: true,
      description: 'The expected origin URL.'
    }
  },
  exits: {
    success: {
      description: 'Authentication verified successfully.',
      outputDescription: 'Returns verification result with new counter.'
    },
    noChallenge: {
      description: 'No active challenge found for user.'
    },
    challengeExpired: {
      description: 'Authentication challenge has expired.'
    },
    passkeyNotFound: {
      description: 'Passkey not found for this assertion.'
    },
    verificationFailed: {
      description: 'WebAuthn verification failed.'
    },
    webauthnError: {
      description: 'WebAuthn library error occurred.'
    }
  },

  fn: async function ({ assertion, user, rpID, origin }, exits) {
    const { verifyAuthenticationResponse } = require('@simplewebauthn/server')

    if (!user.passkeyChallenge) {
      return exits.noChallenge()
    }

    if (Date.now() > user.passkeyChallengeExpiresAt) {
      return exits.challengeExpired()
    }

    const matchingPasskey = user.passkeys?.find(
      (passkey) => passkey.credentialID === assertion.id
    )

    if (!matchingPasskey) {
      return exits.passkeyNotFound()
    }

    try {
      // Convert credentialID to Buffer if it's a string (for SimpleWebAuthn compatibility)
      const credentialIdBuffer =
        typeof matchingPasskey.credentialID === 'string'
          ? Buffer.from(matchingPasskey.credentialID, 'base64url')
          : matchingPasskey.credentialID

      // Convert credentialPublicKey to Uint8Array if it's stored as a plain object
      let credentialPublicKey = matchingPasskey.credentialPublicKey
      if (
        credentialPublicKey &&
        typeof credentialPublicKey === 'object' &&
        !Buffer.isBuffer(credentialPublicKey) &&
        !(credentialPublicKey instanceof Uint8Array)
      ) {
        // If it's stored as a plain object with numeric keys, convert to Uint8Array
        const keys = Object.keys(credentialPublicKey)
          .map((k) => parseInt(k))
          .sort((a, b) => a - b)
        const values = keys.map((k) => credentialPublicKey[k])
        credentialPublicKey = new Uint8Array(values)
      }

      const verificationOptions = {
        response: assertion,
        expectedChallenge: user.passkeyChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: credentialIdBuffer,
          publicKey: credentialPublicKey,
          counter: matchingPasskey.counter
        },
        requireUserVerification: true
      }

      const verification = await verifyAuthenticationResponse(
        verificationOptions
      )

      if (!verification.verified) {
        return exits.verificationFailed()
      }

      return exits.success({
        verified: true,
        newCounter: verification.authenticationInfo.newCounter,
        matchingPasskey
      })
    } catch (error) {
      return exits.webauthnError(error)
    }
  }
}
