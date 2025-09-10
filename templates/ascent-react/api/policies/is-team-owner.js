/**
 * Policy to check if the logged-in user owns the specified team
 */
module.exports = function (req, res, proceed) {
  const teamId = req.param('teamId')
  if (req.session.teamId != teamId) {
    return res.forbidden()
  }
  return proceed()
}
