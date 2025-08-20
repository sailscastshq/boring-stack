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
              }).select(['email', 'fullName', 'googleAvatarUrl', 'initials'])
              if (!loggedInUser) {
                sails.log.warn(
                  'Somehow, the user record for the logged-in user (`' +
                    req.session.userId +
                    '`) has gone missing....'
                )
                delete req.session.userId
                return res.redirect('/login')
              }
              sails.inertia.share('loggedInUser', loggedInUser)
              res.setHeader('Cache-Control', 'no-cache, no-store')
              return next()
            } else {
              sails.inertia.flushShared('loggedInUser')
            }
            return next()
          }
        }
      }
    }
  }
}
