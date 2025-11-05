module.exports = {
  friendlyName: 'Handle team invite response',
  description:
    'Process team invitation acceptance or decline for both invite links and email invitations',
  inputs: {
    inviteToken: {
      type: 'string',
      required: true,
      description:
        'The invitation token to validate (either team invite link token or email invite token)'
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
    inviteNotFound: {
      responseType: 'notFound'
    },
    inviteExpired: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ inviteToken, response }) {
    const userId = this.req.session.userId
    let team = null
    let isEmailInvite = false
    let emailInvite = null

    // First, try to find an email invitation with this token
    emailInvite = await Invite.findOne({
      token: inviteToken,
      status: 'pending'
    }).populate('team')

    if (emailInvite) {
      // Check if email invite is expired
      if (Date.now() > emailInvite.expiresAt) {
        await Invite.updateOne({ id: emailInvite.id }).set({
          status: 'expired'
        })
        this.req.flash(
          'error',
          'This invitation has expired. Please request a new invitation.'
        )
        throw { inviteExpired: '/login' }
      }

      team = emailInvite.team
      isEmailInvite = true

      // For email invites, verify the logged-in user matches the invited email
      if (userId) {
        const loggedInUser = await User.findOne({ id: userId })
        if (
          loggedInUser.email.toLowerCase() !== emailInvite.email.toLowerCase()
        ) {
          this.req.flash(
            'error',
            'This invitation is for a different email address.'
          )
          throw { inviteNotFound: '/login' }
        }
      }
    } else {
      // If not an email invite, try to find team by invite link token
      team = await Team.findOne({ inviteToken })

      if (!team) {
        throw 'inviteNotFound'
      }

      // Check if invite links are enabled for this team
      if (!team.inviteLinkEnabled) {
        this.req.flash(
          'error',
          'Invite links have been disabled for this team.'
        )
        throw { inviteNotFound: '/login' }
      }
    }

    // Check if user is already a member of this team
    const existingMembership = await Membership.findOne({
      member: userId,
      team: team.id
    })

    if (existingMembership) {
      this.req.flash('message', 'You are already a member of this team.')
      // For email invites, mark as accepted even if already a member
      if (isEmailInvite) {
        await Invite.updateOne({ id: emailInvite.id }).set({
          status: 'accepted',
          acceptedAt: Date.now(),
          acceptedBy: userId
        })
      }
      return userId ? '/dashboard' : '/'
    }

    if (response === 'decline') {
      // For email invites, mark the invitation as cancelled
      if (isEmailInvite) {
        await Invite.updateOne({ id: emailInvite.id }).set({
          status: 'cancelled'
        })
      }

      this.req.flash(
        'success',
        `You declined the invitation to join ${team.name}.`
      )
      // Redirect to dashboard if logged in, otherwise to home
      return userId ? '/dashboard' : '/'
    }

    if (response === 'accept') {
      // Get the user's information for domain checking
      const user = await User.findOne({ id: userId })
      if (!user) {
        throw 'inviteNotFound' // User should exist if they're authenticated
      }

      // Check domain restrictions before allowing user to join
      if (team.domainRestrictions && team.domainRestrictions.length > 0) {
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
          return isEmailInvite ? '/login' : `/team/${team.inviteToken}`
        }
      }

      const subscriptionInfo = await sails.helpers.subscription.checkPlan(
        team.id
      )

      if (!subscriptionInfo.canAddMembers) {
        this.req.flash(
          'error',
          `This team has reached its member limit. ${
            subscriptionInfo.hasSubscription
              ? `The ${subscriptionInfo.planName} plan allows ${subscriptionInfo.memberLimit} members.`
              : 'The team needs a subscription to add members.'
          } Please ask the team owner to upgrade.`
        )
        return isEmailInvite ? '/login' : `/team/${team.inviteToken}`
      }

      await Membership.create({
        member: userId,
        team: team.id,
        role: 'member',
        status: 'active'
      })

      // For email invites, mark the invitation as accepted
      if (isEmailInvite) {
        await Invite.updateOne({ id: emailInvite.id }).set({
          status: 'accepted',
          acceptedAt: Date.now(),
          acceptedBy: userId
        })
      }

      // Set the team context in the user's session using the helper
      await sails.helpers
        .setTeamSession(this.req, userId, team.id)
        .tolerate('notFound', () => {
          // This shouldn't happen since we just created the membership
          sails.log.warn(
            `Failed to set team session for user ${userId} and team ${team.id}`
          )
        })

      this.req.flash(
        'success',
        `Welcome to ${team.name}! You've successfully joined the team.`
      )
      return '/dashboard'
    }
  }
}
