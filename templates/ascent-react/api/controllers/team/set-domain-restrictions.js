module.exports = {
  friendlyName: 'Set domain restrictions',

  description: 'Add new domains to the team invite link restrictions',

  inputs: {
    teamId: {
      type: 'string',
      required: true,
      description: 'The ID of the team to update domain restrictions for'
    },
    domainRestrictions: {
      type: 'json',
      required: true,
      description: 'Array of new domain strings to add to existing restrictions'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    teamNotFound: {
      responseType: 'notFound'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ teamId, domainRestrictions }) {
    const userId = this.req.session.userId

    // Domain validation regex - matches valid domain format
    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    // Validate each domain
    const invalidDomains = []
    for (const domain of domainRestrictions) {
      if (typeof domain !== 'string' || !domainRegex.test(domain.trim())) {
        invalidDomains.push(domain)
      }
    }

    if (invalidDomains.length > 0) {
      throw {
        badRequest: {
          problems: [
            `Invalid domains: ${invalidDomains.join(
              ', '
            )}. Please use valid domain names like 'example.com' or 'company.org'.`
          ]
        }
      }
    }

    // Find the team and verify ownership
    const team = await Team.findOne({ id: teamId, owner: userId })

    if (!team) {
      throw 'teamNotFound'
    }

    // Normalize domains (trim and lowercase)
    const normalizedNewDomains = domainRestrictions.map((domain) =>
      domain.trim().toLowerCase()
    )

    // Get existing domain restrictions (normalized)
    const existingDomains = (team.domainRestrictions || []).map((domain) =>
      domain.toLowerCase()
    )

    // Filter out duplicates and append new domains
    const newDomains = normalizedNewDomains.filter(
      (domain) => !existingDomains.includes(domain)
    )

    const updatedDomains = [...(team.domainRestrictions || []), ...newDomains]

    // Update the team's domain restrictions
    await Team.updateOne({ id: teamId }).set({
      domainRestrictions: updatedDomains
    })

    // Set success message
    const addedCount = newDomains.length
    const duplicateCount = normalizedNewDomains.length - addedCount

    let message = ''
    if (addedCount > 0) {
      message = `Added ${addedCount} domain restriction${
        addedCount === 1 ? '' : 's'
      }.`
    }
    if (duplicateCount > 0) {
      message += ` ${duplicateCount} domain${
        duplicateCount === 1 ? '' : 's'
      } already restricted.`
    }
    if (addedCount === 0 && duplicateCount === 0) {
      message = 'No new domains were added.'
    }

    this.req.flash('success', message.trim())
    return '/settings/team'
  }
}
