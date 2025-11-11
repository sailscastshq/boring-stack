/**
 * Hash Token
 *
 * Hashes a magic link token using SHA-256 before storing in database.
 * We never store plain tokens for security - only hashed versions.
 */

const crypto = require('crypto')

module.exports = {
  friendlyName: 'Hash magic link token',

  description:
    'Hash a magic link token using SHA-256 for secure database storage.',

  inputs: {
    token: {
      type: 'string',
      required: true,
      description: 'The plain magic link token to hash'
    }
  },

  exits: {
    success: {
      description: 'The token was successfully hashed',
      outputType: 'string'
    }
  },

  fn: async function ({ token }) {
    // Use SHA-256 to hash the token
    const hash = crypto.createHash('sha256').update(token).digest('hex')

    return hash
  }
}
