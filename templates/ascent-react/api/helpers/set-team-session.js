/**
 * Set team context and user role in session
 *
 * This helper sets both the current team ID and the user's role
 * in that team for use with Clearance RBAC
 */

module.exports = {
  friendlyName: 'Set team session',

  description: 'Set the current team context and user role in the session',

  inputs: {
    req: {
      type: 'ref',
      description: 'The request object',
      required: true
    },
    userId: {
      type: 'number',
      description: 'The user ID',
      required: true
    },
    teamId: {
      type: 'number',
      description: 'The team ID to set as current context',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Team session context set successfully'
    },
    notFound: {
      description: 'User is not a member of the specified team'
    }
  },

  fn: async function (inputs, exits) {
    const { req, userId, teamId } = inputs

    // Find the user's membership in this team
    const membership = await Membership.findOne({
      member: userId,
      team: teamId,
      status: 'active'
    })

    if (!membership) {
      return exits.notFound()
    }

    // Set team context and user role in session
    req.session.teamId = teamId
    req.session.userRole = membership.role

    sails.log.debug(
      `Set team session: user ${userId} has role '${membership.role}' in team ${teamId}`
    )

    return exits.success()
  }
}
