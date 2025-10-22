module.exports = {
  friendlyName: 'Get return URL',

  description:
    'Get return URL from session or query params with fallback to dashboard.',

  inputs: {
    req: {
      type: 'ref',
      description: 'The current request object',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Return URL retrieved successfully',
      outputType: 'string'
    }
  },

  fn: async function ({ req }) {
    const SESSION_KEY = 'authReturnUrl'
    const DEFAULT_URL = '/dashboard'

    // Get returnUrl from session storage only
    return req.session[SESSION_KEY] || DEFAULT_URL
  }
}
