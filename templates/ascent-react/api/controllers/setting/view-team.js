module.exports = {
  friendlyName: 'View team settings',
  description: 'Display team settings page with multi-team support',

  exits: {
    success: { responseType: 'inertia' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function () {
    const userId = this.req.session.userId

    const userMemberships = await Membership.find({
      member: userId,
      status: 'active'
    })
      .populate('team')
      .sort('createdAt DESC')

    if (!userMemberships.length) {
      throw 'notFound'
    }

    const currentTeamId = this.req.session.teamId || userMemberships[0].team.id
    const currentMembership =
      userMemberships.find((m) => m.team.id === currentTeamId) ||
      userMemberships[0]

    if (!this.req.session.teamId) {
      await sails.helpers
        .setTeamSession(this.req, userId, currentMembership.team.id)
        .tolerate()
    }

    const team = await Team.findOne({ id: currentMembership.team.id }).populate(
      'owner'
    )
    team.inviteLink = sails.helpers.team.getInviteLink(team)

    const teamMemberships = await Membership.find({
      team: team.id,
      status: 'active'
    })
      .populate('member')
      .sort('createdAt DESC')

    // Get pending invitations for owners/admins
    let pendingInvites = []
    if (
      currentMembership.role === 'owner' ||
      currentMembership.role === 'admin'
    ) {
      pendingInvites = await Invite.find({
        team: team.id,
        status: 'pending',
        expiresAt: { '>': Date.now() }
      })
        .populate('invitedBy')
        .sort('createdAt DESC')
    }

    return {
      page: 'settings/team',
      props: {
        team,
        memberships: teamMemberships,
        userRole: currentMembership.role,
        pendingInvites
      }
    }
  }
}
