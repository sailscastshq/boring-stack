/**
 * Cleanup Expired Magic Link Tokens
 *
 * Usage: sails run cleanup-expired-magic-link-tokens
 *
 * This script removes expired and used magic link tokens from the database
 * to keep it clean. It should be run periodically via cron job.
 */

module.exports = {
  friendlyName: 'Cleanup expired magic link tokens',

  description: 'Remove expired and used magic link tokens from the database.',

  fn: async function () {
    const now = Date.now()

    try {
      // Find and update users with expired or used tokens
      const result = await User.update({
        or: [
          {
            and: [
              { magicLinkToken: { '!=': null } },
              { magicLinkTokenExpiresAt: { '<': now } }
            ]
          },
          { magicLinkTokenUsedAt: { '!=': null } }
        ]
      }).set({
        magicLinkToken: null,
        magicLinkTokenExpiresAt: null,
        magicLinkTokenUsedAt: null
      })

      sails.log.info(
        `✅ Cleaned up ${result.length} expired/used magic link tokens`
      )

      if (result.length > 0) {
        sails.log.info(
          `   - Expired tokens older than: ${new Date(now).toISOString()}`
        )
        sails.log.info(`   - Used tokens that were no longer needed`)
      }

      return {
        success: true,
        cleanedCount: result.length,
        timestamp: now
      }
    } catch (error) {
      sails.log.error('❌ Error cleaning up magic link tokens:', error)
      throw error
    }
  }
}
