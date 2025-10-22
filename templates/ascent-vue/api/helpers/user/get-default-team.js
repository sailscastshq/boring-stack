module.exports = {
  friendlyName: 'Get default team',
  description:
    'Find the best team to set as default for a user based on their memberships',

  inputs: {
    userId: {
      type: 'string',
      required: true,
      description: 'The user ID to find a team for'
    }
  },

  exits: {
    success: {
      outputType: 'string',
      description:
        'Returns the team ID to use as default, or null if user has no teams'
    }
  },

  fn: async function ({ userId }) {
    const memberships = await Membership.find({
      member: userId,
      status: 'active'
    })
      .populate('team')
      .sort('createdAt ASC')

    if (!memberships || memberships.length === 0) {
      return null
    }

    // First try to find a team they own
    const ownedTeam = memberships.find((m) => m.role === 'owner')
    if (ownedTeam) {
      return ownedTeam.team.id
    }

    // If no owned teams, return the first available team
    return memberships[0].team.id
  }
}
