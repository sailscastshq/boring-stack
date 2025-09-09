module.exports = {
  friendlyName: 'Get invite URL',
  sync: true,
  description:
    'Get the complete team invitation URL using the base URL and team invite token.',
  inputs: {
    team: {
      type: 'ref',
      required: true,
      description: 'The team record with invite token'
    }
  },
  exits: {
    success: {
      description: 'Team invite URL retrieved successfully',
      outputType: 'string'
    }
  },

  fn: function ({ team }) {
    const baseUrl = sails.config.custom.baseUrl
    return `${baseUrl}/team/${team.inviteToken}`
  }
}
