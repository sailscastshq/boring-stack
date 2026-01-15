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
              // Use once() to cache the logged-in user data on the client.
              // This avoids fetching the same user data on every navigation.
              // The data is cached until:
              // - The user logs out (session cleared)
              // - The user explicitly refreshes
              // - The prop is marked as .fresh() after profile updates
              sails.inertia.share(
                'loggedInUser',
                sails.inertia.once(async () => {
                  const user = await User.findOne({
                    id: req.session.userId
                  }).select([
                    'email',
                    'fullName',
                    'googleAvatarUrl',
                    'initials'
                  ])

                  if (!user) {
                    sails.log.warn(
                      'Somehow, the user record for the logged-in user (`' +
                        req.session.userId +
                        '`) has gone missing....'
                    )
                    delete req.session.userId
                    return null
                  }

                  return user
                })
              )

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
