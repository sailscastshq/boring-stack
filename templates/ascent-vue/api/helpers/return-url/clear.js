module.exports = {
  friendlyName: 'Clear return URL',

  description: 'Remove return URL from session.',

  inputs: {
    req: {
      type: 'ref',
      description: 'The current request object',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Return URL cleared successfully',
      outputType: 'string'
    }
  },

  fn: async function ({ req }) {
    const SESSION_KEY = 'authReturnUrl'
    const DEFAULT_URL = '/dashboard'

    if (req.session[SESSION_KEY]) {
      delete req.session[SESSION_KEY]
      sails.log.verbose('Return URL cleared from session')
    }

    return DEFAULT_URL
  }
}
