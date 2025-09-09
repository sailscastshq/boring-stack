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
    const req = this.req
    const userId = req.session.userId

    // Check if user is owner of the team
    const team = await Team.findOne({ id: teamId, owner: userId })

    if (!team) {
      throw 'notFound'
    }

    // Generate new invite token and update team
    const newToken = await sails.helpers.strings.random('url-friendly')
    const updatedTeam = await Team.updateOne({ id: teamId }).set({
      inviteToken: newToken
    })

    // Get the new invite URL
    const inviteUrl = await sails.helpers.team.getInviteUrl({
      team: updatedTeam
    })

    req.flash('success', 'Team invite link has been reset successfully!')
    return '/settings/team'
  }
}
