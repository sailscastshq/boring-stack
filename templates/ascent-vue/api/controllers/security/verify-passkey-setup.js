module.exports = {
  friendlyName: 'Verify passkey setup',
  description: 'Verify WebAuthn registration credential and store passkey.',
  inputs: {
    credential: {
      type: 'json',
      required: true,
      description: 'The WebAuthn registration credential from the browser.'
    },
    userId: {
      type: 'number',
      required: true,
      description: 'The user ID for whom this passkey is being registered.'
    }
  },
  exits: {
    success: {
      responseType: 'redirect',
      description: 'Passkey successfully registered and stored.'
    },
    invalid: {
      responseType: 'badRequest',
      description: 'Invalid credential or verification failed.'
    },
    expired: {
      responseType: 'badRequest',
      description: 'Registration challenge has expired.'
    },
    unauthorized: {
      responseType: 'redirect',
      description: 'User not authorized to register passkeys for this account.'
    }
  },

  fn: async function ({ credential, userId }) {
    const sessionUserId = this.req.session.userId

    // Ensure user can only register passkeys for their own account
    if (sessionUserId !== userId) {
      sails.log.warn(
        `User ${sessionUserId} attempted to register passkey for user ${userId}`
      )
      throw { unauthorized: '/settings/security' }
    }

    const user = await User.findOne(userId).select([
      'passkeyChallenge',
      'passkeyChallengeExpiresAt',
      'passkeys',
      'passkeyEnabled'
    ])

    if (!user) {
      throw {
        invalid: {
          problems: [{ passkey: 'User not found.' }]
        }
      }
    }

    const rpID = sails.config.custom.baseUrl
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
    const origin = sails.config.custom.baseUrl

    const registrationResult = await sails.helpers.passkey.verifyRegistration
      .with({ credential, user, rpID, origin })
      .intercept('noChallenge', () => {
        return {
          invalid: {
            problems: [
              { passkey: 'No active passkey registration challenge found.' }
            ]
          }
        }
      })
      .intercept('challengeExpired', async () => {
        await User.updateOne(userId).set({
          passkeyChallenge: null,
          passkeyChallengeExpiresAt: null
        })
        return {
          expired: {
            problems: [
              {
                passkey:
                  'Passkey registration challenge has expired. Please try again.'
              }
            ]
          }
        }
      })
      .intercept('verificationFailed', () => {
        return {
          invalid: {
            problems: [{ passkey: 'Passkey registration verification failed.' }]
          }
        }
      })
      .intercept('webauthnError', async (error) => {
        sails.log.error('WebAuthn registration verification error:', error)

        // Clear the challenge since verification failed
        await User.updateOne(userId).set({
          passkeyChallenge: null,
          passkeyChallengeExpiresAt: null
        })

        return {
          invalid: {
            problems: [
              { passkey: 'Passkey registration failed. Please try again.' }
            ]
          }
        }
      })

    // Add to existing passkeys or create new array
    const updatedPasskeys = user.passkeys
      ? [...user.passkeys, registrationResult.passkeyData]
      : [registrationResult.passkeyData]

    // Update user record
    await User.updateOne(userId).set({
      passkeys: updatedPasskeys,
      passkeyEnabled: true,
      passkeyChallenge: null,
      passkeyChallengeExpiresAt: null
    })

    this.req.flash(
      'success',
      'Passkey set up successfully! You can now use biometric authentication to sign in.'
    )
    return '/settings/security'
  }
}
