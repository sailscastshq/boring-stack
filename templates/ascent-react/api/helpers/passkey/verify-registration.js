module.exports = {
  friendlyName: 'Verify registration',
  description: 'Verify WebAuthn registration response for passkey setup.',
  inputs: {
    credential: {
      type: 'ref',
      required: true,
      description: 'The WebAuthn registration credential from the browser.'
    },
    user: {
      type: 'ref',
      required: true,
      description: 'The user record with challenge data.'
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
      description: 'Registration verified successfully.',
      outputDescription: 'Returns registration info for storing.'
    },
    noChallenge: {
      description: 'No active challenge found for user.'
    },
    challengeExpired: {
      description: 'Registration challenge has expired.'
    },
    verificationFailed: {
      description: 'WebAuthn verification failed.'
    },
    webauthnError: {
      description: 'WebAuthn library error occurred.'
    }
  },

  fn: async function ({ credential, user, rpID, origin }, exits) {
    const { verifyRegistrationResponse } = require('@simplewebauthn/server')

    if (!user.passkeyChallenge) {
      return exits.noChallenge()
    }

    if (Date.now() > user.passkeyChallengeExpiresAt) {
      return exits.challengeExpired()
    }

    try {
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: user.passkeyChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true
      })

      if (!verification.verified) {
        return exits.verificationFailed()
      }

      const { registrationInfo } = verification

      const passkeyData = {
        credentialID: registrationInfo.credential.id,
        credentialPublicKey: registrationInfo.credential.publicKey,
        counter: registrationInfo.credential.counter,
        transports: registrationInfo.credential.transports,
        createdAt: Date.now(),
        name: `Passkey ${(user.passkeys || []).length + 1}`
      }

      return exits.success({
        verified: true,
        passkeyData
      })
    } catch (error) {
      return exits.webauthnError(error)
    }
  }
}
