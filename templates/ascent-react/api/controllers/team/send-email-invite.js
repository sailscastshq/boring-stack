module.exports = {
  friendlyName: 'Send email invitations',
  description: 'Send email invitations for multiple people to join the team',

  inputs: {
    emails: {
      type: ['string'],
      required: true,
      description: 'Array of email addresses to send invitations to'
    }
  },

  exits: {
    success: {
      responseType: 'redirect',
      description: 'Invitations sent successfully'
    },
    invalidEmails: {
      responseType: 'badRequest',
      description: 'One or more emails cannot be invited'
    }
  },

  fn: async function ({ emails }) {
    const loggedInUser = this.req.session.userId
    const teamId = this.req.session.teamId

    const team = await Team.findOne({ id: teamId })
    if (!team) {
      throw 'notFound'
    }

    const problems = []

    for (const email of emails) {
      const normalizedEmail = email.toLowerCase().trim()

      if (
        !normalizedEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ) {
        problems.push(`${email} is not a valid email address`)
        continue
      }

      if (team.domainRestrictions && team.domainRestrictions.length > 0) {
        const emailDomain = normalizedEmail.split('@')[1].toLowerCase()
        const allowedDomains = team.domainRestrictions.map((domain) =>
          domain.toLowerCase()
        )

        if (!allowedDomains.includes(emailDomain)) {
          problems.push(`${email} domain is not allowed to join this team`)
          continue
        }
      }

      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser) {
        const existingMembership = await Membership.findOne({
          member: existingUser.id,
          team: teamId
        })
        if (existingMembership) {
          problems.push(`${email} is already a team member`)
          continue
        }
      }

      const existingInvite = await Invite.findOne({
        team: teamId,
        email: normalizedEmail,
        status: 'pending',
        expiresAt: { '>': Date.now() }
      })

      if (existingInvite) {
        problems.push(`${email} already has a pending invitation`)
        continue
      }
    }

    if (problems.length > 0) {
      throw {
        invalidEmails: {
          problems: [
            {
              emails: problems.join(', ')
            }
          ]
        }
      }
    }

    const validEmails = emails.map((email) => email.toLowerCase().trim())
    const invites = []

    const inviterUser = await User.findOne({ id: loggedInUser })
    const expirationDays = Math.ceil(
      sails.config.custom.invitationExpiresTTL / (1000 * 60 * 60 * 24)
    )

    for (const email of validEmails) {
      const invite = await Invite.create({
        team: teamId,
        email: email,
        invitedBy: loggedInUser,
        via: 'email',
        token: sails.helpers.strings.random('url-friendly'),
        expiresAt: Date.now() + sails.config.custom.invitationExpiresTTL
      }).fetch()

      const inviteUrl = `${sails.config.custom.baseUrl}/team/invite/${invite.token}`

      await sails.helpers.mail.send.with({
        template: 'email-team-invitation',
        templateData: {
          teamName: team.name,
          inviterName: inviterUser.fullName,
          email: email,
          inviteUrl: inviteUrl,
          expirationDays: expirationDays
        },
        to: email,
        subject: `You're invited to join ${team.name} on Ascent`
      })

      sails.log.info(`Team invitation sent to ${email} for team ${team.name}`)
      invites.push(invite)
    }

    const sentCount = invites.length
    const message =
      sentCount === 1
        ? `Invitation sent to ${validEmails[0]}`
        : `${sentCount} invitations sent successfully`

    this.req.flash('success', message)
    return '/settings/team'
  }
}
