module.exports = {
  friendlyName: 'Delete profile',

  description: "Delete the logged-in user's account and all related data.",

  inputs: {},

  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'User account deleted successfully.'
    },
    unauthorized: {
      responseType: 'inertiaRedirect',
      description: 'User is not logged in.'
    },
    hasTeamMembers: {
      responseType: 'badRequest',
      description:
        'User owns teams with other members and cannot delete account.'
    },
    serverError: {
      responseType: 'inertiaRedirect',
      description: 'An error occurred during account deletion.'
    }
  },

  fn: async function () {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).intercept(
      'notFound',
      () => {
        delete this.req.session.userId
        return { unauthorized: '/login' }
      }
    )

    const memberships = await Membership.find({ member: userId })
    const ownedTeams = memberships.filter((m) => m.role === 'owner')

    for (const membership of ownedTeams) {
      const otherMemberships = await Membership.find({
        team: membership.team,
        member: { '!=': userId }
      })

      if (otherMemberships.length > 0) {
        throw {
          hasTeamMembers: {
            problems: [
              {
                ownership:
                  'You cannot delete your account because you own teams with other members. Please transfer ownership or remove all members first.'
              }
            ]
          }
        }
      }
    }

    await sails
      .getDatastore()
      .transaction(async (db) => {
        const memberships = await Membership.find({
          member: userId
        }).usingConnection(db)

        const ownedTeams = memberships.filter((m) => m.role === 'owner')
        const regularMemberships = memberships.filter((m) => m.role !== 'owner')

        for (const membership of ownedTeams) {
          const teamId = membership.team

          await Subscription.destroy({ team: teamId }).usingConnection(db)
          await Invite.destroy({ team: teamId }).usingConnection(db)
          await Membership.destroy({ team: teamId }).usingConnection(db)
          await Team.destroyOne({ id: teamId }).usingConnection(db)
          sails.log.info(`Deleted team ${teamId} (user was only member)`)
        }

        await Membership.destroy({
          id: regularMemberships.map((m) => m.id)
        }).usingConnection(db)

        await Invite.destroy({ invitedBy: userId }).usingConnection(db)

        await Invite.destroy({ email: user.email }).usingConnection(db)

        await User.destroyOne({ id: userId }).usingConnection(db)

        sails.log.info(
          `Successfully deleted user ${userId} and all related data`
        )
      })
      .intercept((err) => {
        sails.log.error('Error deleting account:', err)
        return { serverError: '/account/settings' }
      })

    delete this.req.session.userId

    return '/login'
  }
}
