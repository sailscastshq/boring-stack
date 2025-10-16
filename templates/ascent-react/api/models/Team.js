module.exports = {
  tableName: 'teams',
  attributes: {
    name: {
      type: 'string',
      required: true,
      maxLength: 100,
      example: 'My Team',
      description:
        'The display name of the team that users see in the interface'
    },
    settings: {
      type: 'json',
      defaultsTo: {},
      description:
        'Team-specific configuration and preferences stored as JSON object'
    },
    inviteToken: {
      type: 'string',
      description:
        'Unique token for team invitation links - can be reset for security'
    },
    inviteLinkEnabled: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Whether the invite link is enabled for this team'
    },
    domainRestrictions: {
      type: 'json',
      defaultsTo: [],
      description:
        'Array of email domains that are allowed to join via invite link (empty = no restrictions)'
    },

    owner: {
      model: 'user',
      required: true,
      description:
        'The user who owns this team - every user gets exactly one team they own'
    },
    memberships: {
      collection: 'membership',
      via: 'team',
      description:
        'All memberships for this team (includes owner, admins, and members)'
    },
    invites: {
      collection: 'invite',
      via: 'team',
      description:
        'All invitations for this team (pending, accepted, expired, cancelled)'
    }
  },
  customToJSON: function () {
    return {
      id: this.id,
      name: this.name,
      settings: this.settings,
      inviteToken: this.inviteToken,
      inviteLink: this.inviteLink,
      inviteLinkEnabled: this.inviteLinkEnabled,
      domainRestrictions: this.domainRestrictions,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  },
  beforeCreate: async function (valuesToSet, proceed) {
    // Generate invite token if not provided
    if (!valuesToSet.inviteToken) {
      valuesToSet.inviteToken = await sails.helpers.strings.random(
        'url-friendly'
      )
    }
    return proceed()
  }
}
