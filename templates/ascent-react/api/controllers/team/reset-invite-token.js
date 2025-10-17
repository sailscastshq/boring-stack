module.exports = {
  friendlyName: 'Reset invite token',
  description:
    'Reset the invite token for a team, generating a new unique URL.',
  inputs: {
    teamId: {
      type: 'string',
      required: true,
      description: 'The ID of the team to reset the invite token for'
    }
  },
  exits: {
    success: {
      responseType: 'redirect'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function ({ teamId }) {
    const userId = this.req.session.userId

    const team = await Team.findOne({ id: teamId })

    if (!team) {
      throw 'notFound'
    }
    // Generate new invite token and update team
    const updatedTeam = await Team.updateOne({ id: teamId }).set({
      inviteToken: sails.helpers.strings.random('url-friendly')
    })

    this.req.flash('success', 'Team invite link has been reset successfully!')
    return '/settings/team'
  }
}
