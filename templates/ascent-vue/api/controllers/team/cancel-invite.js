module.exports = {
  friendlyName: 'Cancel invitation',
  description: 'Cancel a pending team invitation',

  inputs: {
    inviteId: {
      type: 'string',
      required: true,
      description: 'ID of the invitation to cancel'
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Invitation cancelled successfully'
    }
  },

  fn: async function ({ inviteId }) {
    const teamId = this.req.session.teamId

    const invite = await Invite.findOne({
      id: inviteId,
      team: teamId,
      status: 'pending'
    })

    if (!invite) {
      throw 'notFound'
    }

    await Invite.updateOne({ id: inviteId }).set({ status: 'cancelled' })

    this.req.flash(
      'success',
      `Invitation to ${invite.email} has been cancelled`
    )
    return '/settings/team'
  }
}
