/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCustomHook(sails) {
  return {
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function () {
      sails.log.info('Initializing custom hook (`custom`)')
    },
    routes: {
      before: {
        'GET /*': {
          skipAssets: true,
          fn: async function (req, res, next) {
            if (req.session.userId) {
              const loggedInUser = await User.findOne({
                id: req.session.userId
              }).select([
                'email',
                'fullName',
                'googleAvatarUrl',
                'githubAvatarUrl',
                'initials',
                'twoFactorEnabled',
                'totpEnabled',
                'emailTwoFactorEnabled',
                'passkeyEnabled'
              ])
              if (!loggedInUser) {
                sails.log.warn(
                  'Somehow, the user record for the logged-in user (`' +
                    req.session.userId +
                    '`) has gone missing....'
                )
                delete req.session.userId
                return res.redirect('/login')
              }
              // Add avatar URL using helper
              loggedInUser.avatarUrl = await sails.helpers.user.getAvatarUrl(
                loggedInUser
              )

              // Get user's teams for team switcher
              const userMemberships = await Membership.find({
                member: req.session.userId,
                status: 'active'
              })
                .populate('team')
                .sort('createdAt ASC')

              const teams = userMemberships.map((m) => ({
                id: m.team.id,
                name: m.team.name,
                isCurrent: m.team.id === req.session.teamId
              }))

              const currentTeam =
                teams.find((t) => t.isCurrent) || teams[0] || null

              sails.inertia.share('loggedInUser', loggedInUser)
              sails.inertia.share('teams', teams)
              sails.inertia.share('currentTeam', currentTeam)
              res.setHeader('Cache-Control', 'no-cache, no-store')
              return next()
            } else {
              sails.inertia.flushShared('loggedInUser')
              sails.inertia.flushShared('teams')
              sails.inertia.flushShared('currentTeam')
            }
            return next()
          }
        }
      }
    }
  }
}
