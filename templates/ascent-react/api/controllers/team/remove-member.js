module.exports = {
  friendlyName: 'Remove member',
  description: 'Remove a member from the team',

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'ID of the team'
    },
    memberId: {
      type: 'number',
      required: true,
      description: 'ID of the member to remove'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function ({ teamId, memberId }) {
    const userId = this.req.session.userId

    // Verify current user has permission (owner or admin)
    const currentUserMembership = await Membership.findOne({
      member: userId,
      team: teamId,
      status: 'active'
    })

    if (
      !currentUserMembership ||
      !['owner', 'admin'].includes(currentUserMembership.role)
    ) {
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

    // Prevent removing team owner
    if (targetMembership.role === 'owner') {
      this.req.flash(
        'error',
        'Team owner cannot be removed. Transfer ownership first.'
      )
      return '/settings/team'
    }

    // Prevent non-owners from removing admins
    if (
      currentUserMembership.role !== 'owner' &&
      targetMembership.role === 'admin'
    ) {
      this.req.flash('error', 'Only team owners can remove admins.')
      return '/settings/team'
    }

    // Remove the membership
    await Membership.destroyOne({ id: targetMembership.id })

    this.req.flash(
      'success',
      `${
        targetMembership.member.fullName || targetMembership.member.email
      } has been removed from the team.`
    )
    return '/settings/team'
  }
}
