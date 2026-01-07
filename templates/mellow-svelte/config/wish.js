/**
 * Wish OAuth configuration
 *
 * Configure OAuth providers for authentication.
 * Credentials can be set here, in config/local.js, or via environment variables.
 *
 * Environment variables (auto-detected):
 * - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
 */

module.exports.wish = {
  providers: {
    google: {
      redirect: 'https://your-app.com/auth/google/callback'
    }
  }
}
