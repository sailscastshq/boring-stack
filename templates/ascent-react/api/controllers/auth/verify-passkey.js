module.exports = {
  friendlyName: 'Verify passkey',
  description: 'Verify WebAuthn assertion and log user in.',
  inputs: {
    assertion: {
      type: 'json',
      required: true,
      description: 'The WebAuthn assertion response from the browser.'
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'The email address of the user signing in.'
    }
  },
  exits: {
    success: {
      responseType: 'redirect',
      description: 'User successfully authenticated and logged in.'
    },
    invalid: {
      responseType: 'badRequest',
      description: 'Invalid assertion or verification failed.'
    },
    expired: {
      responseType: 'badRequest',
      description: 'Challenge has expired.'
    }
  },

  fn: async function ({ assertion, email }) {
    const user = await User.findOne({ email }).select([
      'id',
      'passkeyChallenge',
      'passkeyChallengeExpiresAt',
      'passkeys',
      'team'
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

    const verificationResult = await sails.helpers.passkey.verifyAuthentication
      .with({ assertion, user, rpID, origin })
      .intercept('noChallenge', () => {
        return {
          invalid: {
            problems: [{ passkey: 'No active passkey challenge found.' }]
          }
        }
      })
      .intercept('challengeExpired', async () => {
        await User.updateOne({ id: user.id }).set({
          passkeyChallenge: null,
          passkeyChallengeExpiresAt: null
        })
        return {
          expired: {
            problems: [
              { passkey: 'Passkey challenge has expired. Please try again.' }
            ]
          }
        }
      })
      .intercept('passkeyNotFound', () => {
        return {
          invalid: {
            problems: [{ passkey: 'Passkey not found for this account.' }]
          }
        }
      })
      .intercept('verificationFailed', () => {
        return {
          invalid: {
            problems: [{ passkey: 'Passkey verification failed.' }]
          }
        }
      })
      .intercept('webauthnError', (error) => {
        sails.log.error('WebAuthn verification error:', error)
        return {
          invalid: {
            problems: [
              { passkey: 'Passkey verification failed. Please try again.' }
            ]
          }
        }
      })

    // Update counter for replay attack prevention
    const updatedPasskeys = user.passkeys.map((passkey) =>
      passkey.credentialID === assertion.id
        ? { ...passkey, counter: verificationResult.newCounter }
        : passkey
    )

    // Clear challenge and update passkey counter
    await User.updateOne({ id: user.id }).set({
      passkeyChallenge: null,
      passkeyChallengeExpiresAt: null,
      passkeys: updatedPasskeys
    })

    this.req.session.userId = user.id
    await sails.helpers
      .setTeamSession(this.req, user.id, user.team)
      .tolerate('notFound')
      .intercept((err) => {
        sails.log.error(
          `Error setting team session for user ${user.id} and team ${user.team}:`,
          err
        )
        return err
      })

    return '/dashboard'
  }
}
