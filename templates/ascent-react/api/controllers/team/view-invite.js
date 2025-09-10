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

    invalidToken: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ inviteToken }) {
    // Find team by invite token
    const team = await Team.findOne({ inviteToken }).populate('owner')

    if (!team) {
      this.req.flash('error', 'Invalid or expired invitation link.')
      throw { invalidToken: '/login' }
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
