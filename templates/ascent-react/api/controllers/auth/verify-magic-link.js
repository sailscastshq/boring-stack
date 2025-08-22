module.exports = {
  friendlyName: 'Verify magic link',

  description: 'Verify a magic link token and authenticate the user.',

  extendedDescription: `This action validates the magic link token from the URL,
  authenticates the user if the token is valid, and redirects them to the dashboard.
  The token is marked as used after successful authentication.`,

  inputs: {
    token: {
      description: 'The magic link token from the URL',
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'User successfully authenticated via magic link',
      responseType: 'redirect'
    },

    invalid: {
      description: 'Magic link token is invalid, expired, or already used',
      responseType: 'redirect'
    }
  },

  fn: async function ({ token }) {
    const result = await sails.helpers.magicLink
      .validateToken(token)
      .intercept('invalid', () => {
        this.req.flash(
          'error',
          'This magic link is invalid, expired, or has already been used. Please request a new one.'
        )
        throw { invalid: '/login' }
      })

    const { user } = result

    await User.updateOne({ id: user.id }).set({
      magicLinkTokenUsedAt: Date.now()
    })

    this.req.session.userId = user.id
    return '/dashboard'
  }
}
