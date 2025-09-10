module.exports = {
  friendlyName: 'View team settings',

  description: 'Display "Team Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function () {
    const req = this.req
    const userId = req.session.userId

    const team = await Team.findOne({ owner: userId }).populate('owner')
    if (!team) {
      throw 'notFound'
    }

    team.inviteLink = sails.helpers.team.getInviteLink(team)

    // Fetch all memberships for this team
    const memberships = await Membership.find({
      team: team.id
    })
      .sort('createdAt DESC')
      .populate('member')

    return {
      page: 'settings/team',
      props: {
        team,
        memberships
      }
    }
  }
}
