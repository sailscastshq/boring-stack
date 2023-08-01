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
  'GET /': 'home/index',

  'GET /signup': 'auth/view-signup',
  'POST /signup': 'auth/signup',
  'GET /check-email': 'auth/view-check-email',
  'GET /verify-email': 'auth/verify-email',
  'GET /verified-email': 'auth/view-verified-email',
  'GET /link-expired': 'auth/view-link-expired',
  'GET /resend-link': 'auth/resend-link',

  'GET /login': 'auth/view-login',

  // Continue with Google flow
  'GET /auth/redirect': 'auth/redirect',
  'GET /auth/callback': 'auth/callback'
}
