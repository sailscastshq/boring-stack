module.exports = {
  friendlyName: 'View team invite',

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
    const req = this.req

    // Find team by invite token
    const team = await Team.findOne({ inviteToken }).populate('owner')

    if (!team) {
      req.flash('error', 'Invalid or expired invitation link.')
      throw { invalidToken: '/login' }
    }

    // If user is logged in, check if they're already a member
    let existingMembership = null
    let currentUser = null

    if (req.session.userId) {
      currentUser = await User.findOne({ id: req.session.userId })

      existingMembership = await Membership.findOne({
        member: req.session.userId,
        team: team.id
      })
    }

    return {
      page: 'team/invite',
      props: {
        team,
        currentUser,
        existingMembership,
        inviteToken
      }
    }
  }
}
