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
    },
    returnUrl: {
      description: 'URL to redirect to after successful authentication',
      type: 'string'
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

  fn: async function ({ token, returnUrl }) {
    const result = await sails.helpers.magicLink
      .validateToken(token)
      .intercept('invalid', () => {
        this.req.flash(
          'error',
          'This magic link is invalid, expired, or has already been used. Please request a new one.'
        )
        return { invalid: '/login' }
      })

    const { user } = result

    await User.updateOne({ id: user.id }).set({
      magicLinkTokenUsedAt: Date.now()
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

    return returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard'
  }
}
