module.exports = {
  friendlyName: 'Remove domain restriction',

  description: 'Remove a domain from the team invite link restrictions',

  inputs: {
    teamId: {
      type: 'string',
      required: true,
      description: 'The ID of the team to remove domain restriction from'
    },
    domain: {
      type: 'string',
      required: true,
      description: 'The domain to remove from restrictions'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    teamNotFound: {
      responseType: 'notFound'
    },
    domainNotFound: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ teamId, domain }) {
    const userId = this.req.session.userId

    const team = await Team.findOne({ id: teamId })

    if (!team) {
      throw 'teamNotFound'
    }

    // Check if domain exists in restrictions
    const existingDomains = team.domainRestrictions || []
    const normalizedDomain = domain.trim().toLowerCase()

    // Find the domain to remove (case-insensitive)
    const domainIndex = existingDomains.findIndex(
      (existingDomain) => existingDomain.toLowerCase() === normalizedDomain
    )

    if (domainIndex === -1) {
      throw {
        domainNotFound: {
          problems: [`Domain '${domain}' not found in restrictions.`]
        }
      }
    }

    // Remove the domain from restrictions
    const updatedDomains = existingDomains.filter(
      (_, index) => index !== domainIndex
    )

    // Update the team's domain restrictions
    await Team.updateOne({ id: teamId }).set({
      domainRestrictions: updatedDomains
    })

    // Set success message
    this.req.flash(
      'success',
      `Removed domain restriction for '${existingDomains[domainIndex]}'.`
    )
    return '/settings/team'
  }
}
