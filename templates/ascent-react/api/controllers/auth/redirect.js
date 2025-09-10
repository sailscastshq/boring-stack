module.exports = {
  friendlyName: 'Redirect',

  description: 'Redirect auth.',

  inputs: {
    provider: {
      isIn: ['google', 'github'],
      required: true
    },
    returnUrl: {
      type: 'string',
      description: 'URL to redirect to after successful OAuth login'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ provider, returnUrl }) {
    // Store returnUrl in session for OAuth callback
    if (returnUrl && returnUrl.startsWith('/')) {
      this.req.session.oauthReturnUrl = returnUrl
    }

    return sails.wish.provider(provider).redirect()
  }
}
