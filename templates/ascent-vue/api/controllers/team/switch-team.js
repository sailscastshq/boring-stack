module.exports = {
  friendlyName: 'Switch team',
  description: 'Switch the current active team context for the user',

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'The ID of the team to switch to'
    }
  },

  exits: {
    success: { responseType: 'redirect' },
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function ({ teamId }) {
    const userId = this.req.session.userId

    if (this.req.session.teamId === teamId) {
      return '/settings/team'
    }

    const membership = await Membership.findOne({
      member: userId,
      team: teamId,
      status: 'active'
    }).populate('team')

    if (!membership) {
      throw 'forbidden'
    }

    await sails.helpers
      .setTeamSession(this.req, userId, teamId)
      .intercept('notFound', () => 'notFound')

    this.req.flash('success', `Switched to ${membership.team.name}`)
    return '/settings/team'
  }
}
