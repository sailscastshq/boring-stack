module.exports = {
  friendlyName: 'View team settings',

  description: 'Display "Team Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const req = this.req
    const userId = req.session.userId

    const team = await Team.findOne({ owner: userId })
    team.inviteUrl = sails.helpers.team.getInviteUrl(team)

    return {
      page: 'settings/team',
      props: {
        team
      }
    }
  }
}
