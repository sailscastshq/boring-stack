module.exports = {
  friendlyName: 'Leave team',
  description: 'Leave a team (for non-owners)',

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'ID of the team to leave'
    }
  },

  exits: {
    success: { responseType: 'redirect' },
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function ({ teamId }) {
    const userId = this.req.session.userId

    // Find user's membership
    const membership = await Membership.findOne({
      member: userId,
      team: teamId,
      status: 'active'
    }).populate('team')

    if (!membership) {
      throw 'notFound'
    }

    // Owners cannot leave - they must transfer ownership first
    if (membership.role === 'owner') {
      this.req.flash(
        'error',
        'Team owners cannot leave. Transfer ownership to another member first.'
      )
      return '/settings/team'
    }

    // Delete the membership
    await Membership.destroyOne({ id: membership.id })

    // Get user's remaining teams
    const remainingMemberships = await Membership.find({
      member: userId,
      status: 'active'
    }).populate('team')

    if (remainingMemberships.length > 0) {
      // Switch to first remaining team
      const firstTeam = remainingMemberships[0].team
      await sails.helpers
        .setTeamSession(this.req, userId, firstTeam.id)
        .tolerate('notFound')
      this.req.flash(
        'success',
        `You have left ${membership.team.name} and switched to ${firstTeam.name}.`
      )
    } else {
      // No teams remaining - create a new personal team
      const user = await User.findOne({ id: userId })
      const result = await sails.helpers.user
        .createTeam(user)
        .tolerate('teamCreationFailed', () => {
          this.req.flash(
            'error',
            'Failed to create new team. Please contact support.'
          )
          return '/dashboard'
        })

      if (result) {
        // Update user's team reference and set session
        await User.updateOne({ id: userId }).set({ team: result.team.id })
        await sails.helpers
          .setTeamSession(this.req, userId, result.team.id)
          .tolerate('notFound')

        this.req.flash(
          'success',
          `You have left ${membership.team.name}. A new personal team has been created for you.`
        )
      }
    }

    return '/dashboard'
  }
}
