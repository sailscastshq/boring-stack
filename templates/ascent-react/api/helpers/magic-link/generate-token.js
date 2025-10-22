/**
 * Generate Token
 *
 * Generates a cryptographically secure token for magic link authentication.
 * The token is URL-safe and has sufficient entropy to prevent brute force attacks.
 */

const crypto = require('crypto')

module.exports = {
  friendlyName: 'Generate magic link token',

  description:
    'Generate a cryptographically secure token for magic link authentication.',

  inputs: {},

  exits: {
    success: {
      description: 'A secure magic link token was generated',
      outputType: 'string'
    }
  },

  fn: async function () {
    // Generate 32 bytes (256 bits) of random data
    // This provides 256 bits of entropy, making brute force attacks impractical
    const buffer = crypto.randomBytes(32)

    // Convert to URL-safe base64 string
    // Remove padding characters and replace URL-unsafe characters
    const token = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    return token
  }
}
