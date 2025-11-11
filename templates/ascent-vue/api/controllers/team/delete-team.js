module.exports = {
  friendlyName: 'Delete team',
  description: 'Delete a team and all its data (owners only)',

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'ID of the team to delete'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function ({ teamId }) {
    const userId = this.req.session.userId

    const team = await Team.findOne({ id: teamId })
    if (!team) {
      throw 'notFound'
    }

    const teamName = team.name

    const datastore = sails.getDatastore()
    await datastore.transaction(async (db) => {
      await Membership.destroy({ team: teamId }).usingConnection(db)
      await Invite.destroy({ team: teamId }).usingConnection(db)
      await Team.destroyOne({ id: teamId }).usingConnection(db)
    })

    // Handle user's team switching after deletion
    const remainingMemberships = await Membership.find({
      member: userId,
      status: 'active'
    }).populate('team')

    if (remainingMemberships.length > 0) {
      const firstTeam = remainingMemberships[0].team
      await sails.helpers
        .setTeamSession(this.req, userId, firstTeam.id)
        .tolerate('notFound')
      await User.updateOne({ id: userId }).set({ team: firstTeam.id })

      this.req.flash(
        'success',
        `${teamName} has been deleted. Switched to ${firstTeam.name}.`
      )
    } else {
      const user = await User.findOne({ id: userId })
      const result = await sails.helpers.user
        .createTeam(user)
        .tolerate('notFound')

      if (result) {
        await User.updateOne({ id: userId }).set({ team: result.team.id })
        await sails.helpers
          .setTeamSession(this.req, userId, result.team.id)
          .tolerate('notFound')

        this.req.flash(
          'success',
          `${teamName} has been deleted. A new personal team has been created.`
        )
      }
    }

    return '/dashboard'
  }
}
