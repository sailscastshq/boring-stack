module.exports = {
  friendlyName: 'View invite',

  description: 'Display team invitation page for users to accept or decline.',

  inputs: {
    inviteToken: {
      type: 'string',
      required: true,
      description: 'The team invite token from the URL'
    }
  },

  exits: {
    success: {
      responseType: 'inertia'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function ({ inviteToken }) {
    let team,
      via = 'link',
      invite = null

    // First: Check if it's a shareable team invite link
    team = await Team.findOne({
      inviteToken,
      inviteLinkEnabled: true
    }).populate('owner')

    if (!team) {
      // Second: Check if it's an individual invite token
      invite = await Invite.findOne({
        token: inviteToken,
        status: 'pending',
        via: 'email'
      })
        .populate('team')
        .populate('invitedBy')

      if (!invite) {
        throw 'notFound'
      }

      // Check if expired
      if (invite.expiresAt < Date.now()) {
        await Invite.updateOne({ id: invite.id }).set({ status: 'expired' })
        throw 'notFound' // Could create specific expired exit
      }

      team = invite.team
      via = invite.via
    }

    return {
      page: 'team/invite',
      props: {
        team,
        inviteToken,
        via,
        invite: invite
          ? {
              email: invite.email,
              invitedBy: invite.invitedBy,
              expiresAt: invite.expiresAt,
              via: invite.via
            }
          : null
      }
    }
  }
}
