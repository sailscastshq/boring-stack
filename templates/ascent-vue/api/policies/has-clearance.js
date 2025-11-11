/**
 * has-clearance policy
 *
 * Checks if the authenticated user has the required clearance level
 * for the requested action based on their team role
 */

module.exports = function (req, res, next) {
  return sails.hooks.clearance.check(req, res, next)
}
