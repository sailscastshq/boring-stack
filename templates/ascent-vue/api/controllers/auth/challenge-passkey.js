module.exports = {
  friendlyName: 'Challenge passkey',
  description: 'Generate a WebAuthn challenge for passkey authentication.',
  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'The email address of the user attempting to sign in.'
    }
  },
  exits: {
    success: {
      responseType: 'redirect',
      description: 'WebAuthn challenge generated successfully.'
    },
    unavailable: {
      responseType: 'redirect',
      description: 'Passkeys not available for this account.'
    }
  },

  fn: async function ({ email }) {
    const user = await User.findOne({ email }).select([
      'id',
      'passkeyEnabled',
      'passkeys'
    ])

    if (!user) {
      this.req.flash(
        'error',
        'Passkeys not available for this account. Try magic link or password instead.'
      )
      throw { unavailable: '/login' }
    }

    const rpID = sails.config.custom.baseUrl
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')

    const options = await sails.helpers.passkey.generateAuthenticationOptions
      .with({ user, rpID })
      .intercept('noPasskeys', () => {
        this.req.flash(
          'error',
          'Passkeys not available for this account. Try magic link or password instead.'
        )
        return { unavailable: '/login' }
      })
      .intercept('webauthnError', (error) => {
        sails.log.error('WebAuthn challenge generation error:', error)
        this.req.flash(
          'error',
          'Unable to generate passkey challenge. Please try again.'
        )
        return { unavailable: '/login' }
      })

    await User.updateOne({ id: user.id }).set({
      passkeyChallenge: options.challenge,
      passkeyChallengeExpiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    })

    // Store challenge data in session for frontend
    this.req.session.passkeyChallenge = {
      options,
      email
    }

    return '/login'
  }
}
