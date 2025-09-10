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
    // Find team by invite token
    const team = await Team.findOne({
      inviteToken,
      inviteLinkEnabled: true
    }).populate('owner')

    if (!team) {
      throw 'notFound'
    }

    return {
      page: 'team/invite',
      props: {
        team,
        inviteToken
      }
    }
  }
}
