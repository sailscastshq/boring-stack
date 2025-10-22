module.exports = {
  friendlyName: 'Set return URL',

  description: 'Store return URL in session with validation.',

  inputs: {
    req: {
      type: 'ref',
      description: 'The current request object',
      required: true
    },
    url: {
      type: 'string',
      description: 'URL to store (defaults to current request URL)'
    }
  },

  exits: {
    success: {
      description: 'Return URL stored successfully',
      outputType: 'string'
    }
  },

  fn: async function ({ req, url }) {
    // Use current request URL if no specific URL provided
    const urlToStore = url || req.url
    const SESSION_KEY = 'authReturnUrl'
    const DEFAULT_URL = '/dashboard'

    // Auth routes that should never be used as return URLs
    const FORBIDDEN_PATHS = [
      '/login',
      '/signup',
      '/logout',
      '/forgot-password',
      '/magic-link',
      '/check-email',
      '/verify-email',
      '/resend-link',
      '/verify-2fa',
      '/setup-totp',
      '/setup-2fa',
      '/verify-magic-link',
      '/auth/redirect',
      '/auth/callback'
    ]

    // Validate URL format and content
    function isValidReturnUrl(url) {
      if (!url || typeof url !== 'string') {
        return false
      }

      // Must be relative URL starting with /
      if (!url.startsWith('/') || url.startsWith('//')) {
        return false
      }

      // Length and character validation
      if (url.length > 2000 || url.includes('\n') || url.includes('\r')) {
        return false
      }

      // Check against forbidden auth paths
      const urlPath = url.split('?')[0].toLowerCase() // Get path without query params

      for (const forbiddenPath of FORBIDDEN_PATHS) {
        if (
          urlPath === forbiddenPath ||
          urlPath.startsWith(`${forbiddenPath}/`)
        ) {
          sails.log.verbose(`Rejected auth route as return URL: ${url}`)
          return false
        }
      }

      return true
    }

    if (isValidReturnUrl(urlToStore)) {
      req.session[SESSION_KEY] = urlToStore
      sails.log.verbose(`Return URL stored in session: ${urlToStore}`)
      return urlToStore
    } else {
      sails.log.verbose(`Invalid/forbidden return URL rejected: ${urlToStore}`)
      return DEFAULT_URL
    }
  }
}
