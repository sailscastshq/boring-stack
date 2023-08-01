/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/
  // '*': true,
  'auth/*': 'is-guest',
  'auth/view-check-email': 'is-authenticated',
  'auth/view-verified-email': 'is-authenticated',
  'auth/view-link-expired': 'is-authenticated',
  'auth/resend-link': 'is-authenticated',
  'auth/view-login': 'is-guest',
  'user/*': 'is-authenticated'
}
