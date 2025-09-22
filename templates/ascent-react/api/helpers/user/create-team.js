module.exports = {
  friendlyName: 'Create team',

  description:
    'Automatically create a team and membership for a newly registered user.',

  inputs: {
    user: {
      type: 'ref',
      required: true,
      description: 'The user record for whom to create a team'
    },

    teamName: {
      type: 'string',
      description:
        'Optional custom team name. Defaults to "{User\'s Name} Team"'
    }
  },

  exits: {
    success: {
      description: 'Team and membership created successfully',
      outputType: 'ref'
    },

    teamCreationFailed: {
      description: 'Failed to create team for user'
    }
  },

  fn: async function ({ user, teamName }) {
    const defaultTeamName = teamName || `${user.fullName}'s Team`
    const datastore = sails.getDatastore()

    return await datastore.transaction(async (db) => {
      // Create the team with the user as owner
      const team = await Team.create({
        name: defaultTeamName,
        owner: user.id
      })
        .usingConnection(db)
        .fetch()
        .intercept((err) => {
          sails.log.error('Error creating team for user:', err)
          return 'teamCreationFailed'
        })

      // Create the membership record for the owner
      const membership = await Membership.create({
        member: user.id,
        team: team.id,
        role: 'owner',
        status: 'active',
        joinedAt: Date.now()
      })
        .usingConnection(db)
        .fetch()
        .intercept((err) => {
          sails.log.error('Error creating membership for user:', err)
          return 'teamCreationFailed'
        })

      // Update user record to reference their team
      await User.updateOne({ id: user.id })
        .set({ team: team.id })
        .usingConnection(db)
        .intercept((err) => {
          sails.log.error('Error updating user with team reference:', err)
          return 'teamCreationFailed'
        })

      return { team, membership }
    })
  }
}
