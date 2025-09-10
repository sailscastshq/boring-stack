module.exports = {
  friendlyName: 'Toggle invite link',

  description: 'Enable or disable the team invite link functionality',

  inputs: {
    teamId: {
      type: 'string',
      required: true,
      description: 'The ID of the team to toggle invite link for'
    },
    inviteLinkEnabled: {
      type: 'boolean',
      required: true,
      description: 'Whether to enable or disable invite by link'
    }
  },

  exits: {
    success: { responseType: 'redirect' },
    teamNotFound: {
      responseType: 'notFound'
    }
  },

  fn: async function ({ teamId, inviteLinkEnabled }) {
    const userId = this.req.session.userId

    // Find the team and verify ownership
    const team = await Team.findOne({ id: teamId, owner: userId })

    if (!team) {
      throw 'notFound'
    }

    // Update the team's invite link settings
    await Team.updateOne({ id: teamId }).set({
      inviteLinkEnabled: inviteLinkEnabled
    })

    // Set success message
    const message = inviteLinkEnabled
      ? 'Invite by link has been enabled.'
      : 'Invite by link has been disabled.'

    this.req.flash('success', message)
    return '/settings/team'
  }
}
