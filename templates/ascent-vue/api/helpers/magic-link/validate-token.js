/**
 * Validate Token
 *
 * Validates a magic link token and returns the associated user if valid.
 * Checks expiration, usage status, and token validity.
 */

module.exports = {
  friendlyName: 'Validate magic link token',

  description:
    'Validate a magic link token and return the associated user if valid.',

  inputs: {
    token: {
      type: 'string',
      required: true,
      description: 'The plain magic link token to validate'
    }
  },

  exits: {
    success: {
      description: 'Token validation result',
      outputType: 'ref'
    },

    invalid: {
      description: 'Token is invalid, expired, or already used'
    }
  },

  fn: async function ({ token }) {
    // Hash the provided token to compare with stored hash
    const hashedToken = await sails.helpers.magicLink.hashToken(token)

    // Find user with this magic link token
    const user = await User.findOne({
      magicLinkToken: hashedToken
    })

    if (!user) {
      throw 'invalid'
    }

    const now = Date.now()

    // Check if token has expired
    if (!user.magicLinkTokenExpiresAt || user.magicLinkTokenExpiresAt < now) {
      throw 'invalid'
    }

    // Check if token has already been used
    if (user.magicLinkTokenUsedAt) {
      throw 'invalid'
    }

    return {
      user: user,
      isValid: true
    }
  }
}
