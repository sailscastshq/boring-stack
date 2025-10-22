module.exports = {
  friendlyName: 'Setup passkey',
  description: 'Generate WebAuthn registration options for passkey setup.',
  inputs: {},
  exits: {
    success: {
      responseType: 'redirect',
      description: 'Passkey setup initiated successfully.'
    },
    requiresPassword: {
      responseType: 'badRequest',
      description: 'User must have a password to set up passkeys.'
    }
  },

  fn: async function () {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).select([
      'password',
      'email',
      'passkeys'
    ])

    if (!user.password) {
      throw {
        requiresPassword: {
          problems: [
            {
              general: 'You must have a password set up before adding passkeys.'
            }
          ]
        }
      }
    }

    const rpID = sails.config.custom.baseUrl
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
    const rpName = sails.config.custom.appName

    const options = await sails.helpers.passkey.generateRegistrationOptions
      .with({ user, rpID, rpName, userId })
      .intercept('webauthnError', (error) => {
        sails.log.error(
          'WebAuthn registration options generation error:',
          error
        )
        throw {
          requiresPassword: {
            problems: [
              {
                general:
                  'Unable to generate passkey setup options. Please try again.'
              }
            ]
          }
        }
      })

    // Store challenge in user record with expiration
    await User.updateOne({ id: userId }).set({
      passkeyChallenge: options.challenge,
      passkeyChallengeExpiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    })

    // Store registration options in session for frontend
    this.req.session.passkeyRegistration = {
      options,
      userId
    }

    return '/settings/security'
  }
}
