module.exports = {
  friendlyName: 'Handle team invite response',
  description: 'Process team invitation acceptance or decline',
  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'The ID of the team being invited to'
    },
    inviteToken: {
      type: 'string',
      required: true,
      description: 'The invitation token to validate'
    },
    response: {
      type: 'string',
      required: true,
      isIn: ['accept', 'decline'],
      description: 'Whether to accept or decline the invitation'
    }
  },
  exits: {
    success: { responseType: 'redirect' },
    teamNotFound: {
      responseType: 'notFound'
    }
  },

  fn: async function ({ teamId, inviteToken, action: response }) {
    const userId = this.req.session.userId

    const team = await Team.findOne({
      id: teamId,
      inviteToken: inviteToken
    }).populate('owner')

    if (!team) {
      throw teamNotFound
    }

    const existingMembership = await Membership.findOne({
      member: userId,
      team: teamId
    })

    if (existingMembership) {
      this.req.flash('message', 'You are already a member of this team.')
      return `/team/${team.inviteToken}`
    }

    if (response === 'decline') {
      this.req.flash(
        'success',
        `You declined the invitation to join ${team.name}.`
      )
      // Redirect to dashboard if logged in, otherwise to home
      return userId ? 'dashboard' : '/'
    }

    if (response === 'accept') {
      // Check domain restrictions before allowing user to join
      if (team.domainRestrictions && team.domainRestrictions.length > 0) {
        // Get the user's email to extract domain
        const user = await User.findOne({ id: userId })
        if (!user) {
          throw 'teamNotFound' // User should exist if they're authenticated
        }

        // Extract domain from user's email
        const emailDomain = user.email.split('@')[1].toLowerCase()

        // Check if user's domain is in the allowed list (case-insensitive)
        const allowedDomains = team.domainRestrictions.map((domain) =>
          domain.toLowerCase()
        )
        const isDomainAllowed = allowedDomains.includes(emailDomain)

        if (!isDomainAllowed) {
          this.req.flash(
            'error',
            'Sorry, only users with email addresses from allowed domains can join this team.'
          )
          return `/team/${team.inviteToken}`
        }
      }

      await Membership.create({
        member: userId,
        team: teamId,
        role: 'member',
        status: 'active'
      })
      this.req.flash(
        'success',
        `Welcome to ${team.name}! You've successfully joined the team.`
      )
      return '/dashboard'
    }
  }
}
