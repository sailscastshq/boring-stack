/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/
  'GET /': 'home/view-home',
  'POST /waitlist': 'home/join-waitlist',
  'GET /features': 'home/view-features',
  'GET /pricing': 'home/view-pricing',
  'GET /contact': 'home/view-contact',

  'GET /signup': 'auth/view-signup',
  'POST /signup': 'auth/signup',

  'GET /check-email': 'auth/view-check-email',
  'GET /verify-email': 'auth/verify-email',

  'GET /resend-link': 'auth/resend-link',

  'GET /login': 'auth/view-login',
  'POST /login': 'auth/login',

  'GET /verify-2fa': 'auth/view-verify-2fa',
  'POST /verify-2fa': 'auth/verify-2fa',
  'POST /verify-2fa/send-email': 'auth/send-login-email-2fa',

  'POST /magic-link': 'auth/request-magic-link',
  'GET /magic-link/:token': 'auth/verify-magic-link',

  'POST /challenge-passkey': 'auth/challenge-passkey',
  'POST /verify-passkey': 'auth/verify-passkey',

  'GET /forgot-password': 'auth/view-forgot-password',
  'POST /forgot-password': 'auth/forgot-password',

  'GET /reset-password': 'auth/view-reset-password',
  'POST /reset-password': 'auth/reset-password',

  'GET /dashboard': 'dashboard/view-dashboard',

  // Blog routes
  'GET /blog': 'blog/view-blog',

  // Settings routes with nested layout
  'GET /settings/profile': 'setting/view-profile',
  'PATCH /settings/profile': 'setting/update-profile',
  'DELETE /settings/profile': 'setting/delete-profile',

  // Settings sub-pages
  'GET /settings/security': 'setting/view-security',
  'GET /settings/billing': 'setting/view-billing',
  'GET /settings/team': 'setting/view-team',

  // Update password & 2FA Security routes
  'POST /security/setup-initial-password': 'security/setup-initial-password',
  'PATCH /security/update-password': 'security/update-password',
  'POST /security/setup-totp': 'security/setup-totp',
  'POST /security/verify-totp-setup': 'security/verify-totp-setup',
  'POST /security/setup-email-2fa': 'security/setup-email-2fa',
  'POST /security/verify-email-2fa-setup': 'security/verify-email-2fa-setup',
  'POST /security/disable-2fa': 'security/disable-2fa',
  'POST /security/generate-backup-codes': 'security/generate-backup-codes',
  'POST /security/setup-passkey': 'security/setup-passkey',
  'POST /security/verify-passkey-setup': 'security/verify-passkey-setup',
  'POST /security/disable-passkeys': 'security/disable-passkeys',
  'PATCH /security/rename-passkey/:credentialId': 'security/rename-passkey',
  'DELETE /security/delete-passkey/:credentialId': 'security/delete-passkey',

  // Team routes
  'GET /team/:inviteToken': 'team/view-invite',
  'POST /teams/:teamId/reset-invite-token': 'team/reset-invite-token',
  'POST /teams/:teamId/invite-response': 'team/invite-response',
  'POST /teams/:teamId/toggle-invite-link': 'team/toggle-invite-link',
  'POST /teams/:teamId/send-email-invite': 'team/send-email-invite',
  'PATCH /teams/:teamId/domain-restrictions': 'team/set-domain-restrictions',
  'DELETE /teams/:teamId/remove-domain-restriction':
    'team/remove-domain-restriction',

  // Redirects
  'POST /team/reset-invite-token': 'team/reset-invite-token',

  // Redirects
  'GET /profile': '/settings/profile',
  'GET /settings': '/settings/profile',
  'PATCH /profile': 'setting/update-profile',
  'DELETE /profile': 'setting/delete-profile',

  'DELETE /logout': 'user/logout',

  // OAuth authentication routes
  'GET /auth/:provider/redirect': 'auth/redirect',
  'GET /auth/:provider/callback': 'auth/callback'
}
