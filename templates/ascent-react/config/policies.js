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
  'team/*': ['is-authenticated', 'has-clearance'],
  'security/*': 'is-authenticated',

  // Team route exceptions
  'team/view-invite': true, // Public invite viewing
  'team/handle-invite': 'is-authenticated', // Just need auth for accepting invites

  // Member management policies
  'team/remove-member': ['is-authenticated', 'has-clearance'],
  'team/update-role': ['is-authenticated', 'has-clearance'],
  'team/leave-team': ['is-authenticated', 'has-clearance'],
  'team/switch-team': ['is-authenticated', 'has-clearance']
}
