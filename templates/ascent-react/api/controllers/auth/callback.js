module.exports = {
  friendlyName: 'Callback',
  description: 'OAuth callback handler for Google and GitHub.',
  inputs: {
    provider: {
      isIn: ['google', 'github'],
      required: true
    },
    code: {
      type: 'string',
      required: true
    }
  },
  exits: {
    success: {
      responseType: 'redirect'
    }
  },
  fn: async function ({ code, provider }, exits) {
    const req = this.req

    try {
      const oauthUser = await sails.wish.provider(provider).user(code)

      const userSearchCriteria =
        provider === 'google'
          ? { or: [{ googleId: oauthUser.id }, { email: oauthUser.email }] }
          : { or: [{ githubId: oauthUser.id }, { email: oauthUser.email }] }

      let newUserData = {
        email: oauthUser.email,
        fullName: oauthUser.name,
        emailStatus: 'verified',
        tosAcceptedByIp: req.ip
      }

      if (provider === 'google') {
        newUserData = {
          ...newUserData,
          googleId: oauthUser.id,
          googleAvatarUrl: oauthUser.picture,
          googleAccessToken: oauthUser.accessToken,
          googleIdToken: oauthUser.idToken
        }
      } else if (provider === 'github') {
        newUserData = {
          ...newUserData,
          githubId: oauthUser.id,
          githubAvatarUrl: oauthUser.avatar_url,
          githubAccessToken: oauthUser.accessToken
        }
      }

      User.findOrCreate(userSearchCriteria, newUserData).exec(
        async (error, user, wasCreated) => {
          if (error && error.code === 'E_INVALID_NEW_RECORD') {
            const problems = []
            if (error.message.includes('email')) {
              problems.push({
                email: `Unable to access your email from ${
                  provider === 'google' ? 'Google' : 'GitHub'
                }. Please make sure it is public.`
              })
            }
            if (
              error.message.includes('name') ||
              error.message.includes('fullName')
            ) {
              problems.push({
                fullName: `Unable to access your name from ${
                  provider === 'google' ? 'Google' : 'GitHub'
                }. Please make sure you have one set.`
              })
            }
            throw {
              badRequest: {
                problems:
                  problems.length > 0
                    ? problems
                    : [
                        {
                          login:
                            'OAuth authentication failed due to missing required information.'
                        }
                      ]
              }
            }
          }

          if (error) {
            sails.log.error('OAuth callback error:', error)
            req.flash('error', 'Authentication failed. Please try again.')
            return exits.success('/login?mode=password')
          }

          if (wasCreated) {
            // Create team for new OAuth user (they're already verified)
            await sails.helpers.user
              .createTeam({ user })
              .intercept('teamCreationFailed', () => {
                sails.log.warn(
                  `Failed to create team for OAuth user ${user.id}`
                )
                // Continue with OAuth flow even if team creation fails
              })
          }

          if (!wasCreated) {
            const updates = {}

            if (provider === 'google') {
              if (user.email !== oauthUser.email) {
                updates.emailChangeCandidate = oauthUser.email
              }
              if (user.googleId !== oauthUser.id) {
                updates.googleId = oauthUser.id
              }
              if (user.fullName !== oauthUser.name) {
                updates.fullName = oauthUser.name
              }
              if (user.googleAvatarUrl !== oauthUser.picture) {
                updates.googleAvatarUrl = oauthUser.picture
              }
              if (user.googleAccessToken !== oauthUser.accessToken) {
                updates.googleAccessToken = oauthUser.accessToken
              }
              if (user.googleIdToken !== oauthUser.idToken) {
                updates.googleIdToken = oauthUser.idToken
              }
            } else if (provider === 'github') {
              if (user.email !== oauthUser.email) {
                updates.emailChangeCandidate = oauthUser.email
              }
              if (user.githubId !== oauthUser.id) {
                updates.githubId = oauthUser.id
              }
              if (user.fullName !== oauthUser.name) {
                updates.fullName = oauthUser.name
              }
              if (user.githubAvatarUrl !== oauthUser.avatar_url) {
                updates.githubAvatarUrl = oauthUser.avatar_url
              }
              if (user.githubAccessToken !== oauthUser.accessToken) {
                updates.githubAccessToken = oauthUser.accessToken
              }
            }
            if (user.emailStatus !== 'verified') {
              updates.emailStatus = 'verified'
            }
            if (!user.tosAcceptedByIp) {
              updates.tosAcceptedByIp = req.ip
            }
            if (Object.keys(updates).length > 0) {
              await User.updateOne({ id: user.id }).set(updates)
            }
          }

          req.session.userId = user.id
          return exits.success('/dashboard')
        }
      )
    } catch (error) {
      sails.log.error('OAuth provider error:', error)
      req.flash('error', 'Authentication failed. Please try again.')
      return exits.success('/login?mode=password')
    }
  }
}
