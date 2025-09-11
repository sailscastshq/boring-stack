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
  'auth/*': 'is-guest',
  'auth/view-verify-2fa': 'has-partially-logged-in',
  'auth/verify-2fa': 'has-partially-logged-in',
  'auth/send-login-email-2fa': 'has-partially-logged-in',
  'user/*': 'is-authenticated',
  'dashboard/*': 'is-authenticated',
  'setting/*': 'is-authenticated',
  'team/*': 'is-authenticated',
  'team/view-invite': true,
  'team/reset-invite-token': ['is-authenticated', 'is-team-owner'],
  'team/toggle-invite-link': ['is-authenticated', 'is-team-owner'],
  'team/set-domain-restrictions': ['is-authenticated', 'is-team-owner'],
  'team/remove-domain-restriction': ['is-authenticated', 'is-team-owner']
}
