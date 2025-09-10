module.exports = {
  tableName: 'memberships',
  attributes: {
    role: {
      type: 'string',
      isIn: ['owner', 'admin', 'member'],
      defaultsTo: 'member',
      description: 'The role of the user in this team (owner, admin, or member)'
    },
    status: {
      type: 'string',
      isIn: ['active', 'invited', 'declined'],
      defaultsTo: 'invited',
      description:
        'The status of this team membership (active, invited, or declined)'
    },
    invitedBy: {
      model: 'user',
      columnName: 'invited_by',
      description: 'The user who sent the team invitation'
    },
    invitedAt: {
      type: 'number',
      columnName: 'invited_at',
      description:
        'A JS timestamp (epoch ms) representing when the invitation was sent',
      example: 1502844074211,
      allowNull: true
    },
    joinedAt: {
      type: 'number',
      columnName: 'joined_at',
      description:
        'A JS timestamp (epoch ms) representing when the user joined the team',
      example: 1502844074211,
      allowNull: true
    },
    member: {
      model: 'user',
      required: true,
      description: 'The user who is a member of this team'
    },
    team: {
      model: 'team',
      required: true,
      description: 'The team that the user belongs to'
    }
  },
  customToJSON: function () {
    return {
      id: this.id,
      role: this.role,
      status: this.status,
      invitedBy: this.invitedBy,
      invitedAt: this.invitedAt,
      joinedAt: this.joinedAt,
      member: this.member,
      team: this.team,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  },
  beforeCreate: async function (valuesToSet, proceed) {
    if (valuesToSet.role === 'owner' || valuesToSet.status === 'active') {
      valuesToSet.joinedAt = Date.now()
    }
    if (valuesToSet.status === 'invited' && !valuesToSet.invitedAt) {
      valuesToSet.invitedAt = Date.now()
    }
    return proceed()
  }
}
