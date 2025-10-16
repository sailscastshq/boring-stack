module.exports = {
  friendlyName: 'Update team',
  description: 'Update team name and settings',

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'ID of the team to update'
    },
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      description: 'New team name'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function ({ teamId, name }) {
    // Policy already checked ownership, so we can proceed directly
    const team = await Team.findOne({ id: teamId })
    if (!team) {
      throw 'notFound'
    }

    // Update team name
    await Team.updateOne({ id: teamId }).set({
      name: name.trim()
    })

    this.req.flash('success', 'Team settings updated successfully.')
    return '/settings/team'
  }
}
