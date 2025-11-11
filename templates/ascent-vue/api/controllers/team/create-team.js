module.exports = {
  friendlyName: 'Create new team',
  description: 'Create a new team and set user as owner',

  inputs: {
    name: {
      type: 'string',
      required: true,
      maxLength: 100,
      description: 'Name of the new team'
    }
  },

  exits: {
    success: {
      responseType: 'redirect',
      description: 'Team created successfully'
    },
    badRequest: {
      responseType: 'badRequest',
      description: 'Invalid team name or validation error'
    }
  },

  fn: async function ({ name }) {
    const userId = this.req.session.userId

    if (!name || !name.trim()) {
      throw {
        badRequest: {
          problems: [{ name: 'Team name is required.' }]
        }
      }
    }

    const trimmedName = name.trim()

    const user = await User.findOne({ id: userId })
    if (!user) {
      throw 'notFound'
    }

    const ownedTeams = await Team.find({
      name: trimmedName
    }).populate('memberships', {
      where: { member: userId, role: 'owner', status: 'active' }
    })

    if (ownedTeams.length > 0 && ownedTeams[0].memberships.length > 0) {
      throw {
        badRequest: {
          problems: [{ name: 'You already have a team with this name.' }]
        }
      }
    }

    const { team } = await sails.helpers.user.createTeam(user, trimmedName)

    await sails.helpers.setTeamSession(this.req, userId, team.id)

    this.req.flash('success', `Team "${trimmedName}" created successfully`)
    return '/settings/team'
  }
}
