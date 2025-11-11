module.exports = {
  friendlyName: 'Update member role',
  description: "Change a team member's role",

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'ID of the team'
    },
    memberId: {
      type: 'number',
      required: true,
      description: 'ID of the member to update'
    },
    newRole: {
      type: 'string',
      required: true,
      isIn: ['member', 'admin'],
      description: 'New role for the member'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function ({ teamId, memberId, newRole }) {
    const userId = this.req.session.userId

    // Only owners can change roles
    const currentUserMembership = await Membership.findOne({
      member: userId,
      team: teamId,
      status: 'active'
    })

    if (!currentUserMembership || currentUserMembership.role !== 'owner') {
      throw 'forbidden'
    }

    // Find target membership
    const targetMembership = await Membership.findOne({
      member: memberId,
      team: teamId,
      status: 'active'
    }).populate('member')

    if (!targetMembership) {
      throw 'notFound'
    }

    // Cannot change owner role
    if (targetMembership.role === 'owner') {
      this.req.flash(
        'error',
        'Cannot change team owner role. Transfer ownership first.'
      )
      return '/settings/team'
    }

    // Cannot change to owner role (use transfer ownership instead)
    if (newRole === 'owner') {
      this.req.flash(
        'error',
        'Use transfer ownership to make someone the team owner.'
      )
      return '/settings/team'
    }

    // Update the role
    await Membership.updateOne({ id: targetMembership.id }).set({
      role: newRole
    })

    const roleText =
      newRole === 'admin' ? 'promoted to admin' : 'changed to member'
    this.req.flash(
      'success',
      `${
        targetMembership.member.fullName || targetMembership.member.email
      } has been ${roleText}.`
    )
    return '/settings/team'
  }
}
