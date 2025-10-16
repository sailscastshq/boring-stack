module.exports = {
  friendlyName: 'Signup with team',

  description:
    'Atomically create a user, team, and membership using database transaction.',

  inputs: {
    fullName: {
      type: 'string',
      required: true,
      maxLength: 120,
      description: "The user's full name"
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: "The user's email address"
    },
    password: {
      type: 'string',
      minLength: 8,
      description: "The user's password"
    },
    emailProofToken: {
      type: 'string',
      description: 'Token for email verification'
    },
    emailProofTokenExpiresAt: {
      type: 'number',
      description: 'Expiration timestamp for email proof token'
    },
    tosAcceptedByIp: {
      type: 'string',
      required: true,
      description: 'IP address where TOS was accepted'
    }
  },

  exits: {
    success: {
      description: 'User, team, and membership created successfully',
      outputType: 'ref'
    },
    emailTaken: {
      description: 'An account with this email address already exists'
    },
    serverError: {
      description: 'Something went wrong during account creation'
    }
  },

  fn: async function ({
    fullName,
    email,
    password,
    emailProofToken,
    emailProofTokenExpiresAt,
    tosAcceptedByIp,
    teamName
  }) {
    const datastore = sails.getDatastore()

    return await datastore.transaction(async (db) => {
      // Create user
      const newUser = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        emailProofToken,
        emailProofTokenExpiresAt,
        tosAcceptedByIp
      })
        .usingConnection(db)
        .fetch()
        .intercept('E_UNIQUE', 'emailTaken')
        .intercept((err) => {
          sails.log.error('Error creating user:', err)
          return 'serverError'
        })

      // Create team for the user
      const defaultTeamName = teamName || `${fullName}'s Team`
      const newTeam = await Team.create({
        name: defaultTeamName,
        owner: newUser.id
      })
        .usingConnection(db)
        .fetch()
        .intercept((err) => {
          sails.log.error('Error creating team for user:', err)
          return 'serverError'
        })

      // Create membership record for the owner
      const newMembership = await Membership.create({
        member: newUser.id,
        team: newTeam.id,
        role: 'owner',
        status: 'active',
        joinedAt: Date.now()
      })
        .usingConnection(db)
        .fetch()
        .intercept((err) => {
          sails.log.error('Error creating membership for user:', err)
          return 'serverError'
        })

      // Update user record to reference their team
      await User.updateOne({ id: newUser.id })
        .set({ team: newTeam.id })
        .usingConnection(db)
        .intercept((err) => {
          sails.log.error('Error updating user with team reference:', err)
          return 'serverError'
        })

      return {
        user: newUser,
        team: newTeam,
        membership: newMembership
      }
    })
  }
}
