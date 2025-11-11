module.exports = {
  friendlyName: 'Resend invitation',
  description: 'Resend a pending team invitation',

  inputs: {
    inviteId: {
      type: 'string',
      required: true,
      description: 'ID of the invitation to resend'
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Invitation resent successfully'
    }
  },

  fn: async function ({ inviteId }) {
    const teamId = this.req.session.teamId
    const loggedInUser = this.req.session.userId

    const invite = await Invite.findOne({
      id: inviteId,
      team: teamId,
      status: 'pending'
    })

    if (!invite) {
      throw 'notFound'
    }

    const team = await Team.findOne({ id: teamId })
    if (!team) {
      throw 'notFound'
    }

    // Check if invitation has expired
    if (invite.expiresAt < Date.now()) {
      // Update expiration time for expired invitations
      const newExpirationTime =
        Date.now() + sails.config.custom.invitationExpiresTTL
      await Invite.updateOne({ id: inviteId }).set({
        expiresAt: newExpirationTime
      })
    }

    const inviterUser = await User.findOne({ id: loggedInUser })
    const expirationDays = Math.ceil(
      sails.config.custom.invitationExpiresTTL / (1000 * 60 * 60 * 24)
    )

    const inviteUrl = `${sails.config.custom.baseUrl}/team/${invite.token}`

    await sails.helpers.mail.send.with({
      template: 'email-team-invitation',
      templateData: {
        teamName: team.name,
        inviterName: inviterUser.fullName,
        email: invite.email,
        inviteUrl: inviteUrl,
        expirationDays: expirationDays
      },
      to: invite.email,
      subject: `You're invited to join ${team.name} on Ascent`
    })

    sails.log.info(
      `Team invitation resent to ${invite.email} for team ${team.name}`
    )

    this.req.flash('success', `Invitation resent to ${invite.email}`)
    return '/settings/team'
  }
}
