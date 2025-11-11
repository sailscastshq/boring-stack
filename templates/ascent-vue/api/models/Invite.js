/**
 * Invite.js
 *
 * @description :: Model for team invitations (email, SMS, etc.)
 */

module.exports = {
  tableName: 'invites',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    team: {
      model: 'team',
      required: true,
      description: 'The team this invitation is for'
    },

    email: {
      type: 'string',
      required: true,
      isEmail: true,
      maxLength: 200,
      description: 'Email address of the invited user'
    },

    token: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Unique token for this invitation'
    },

    via: {
      type: 'string',
      isIn: ['email'],
      defaultsTo: 'email',
      description: 'How this invitation is delivered',
      extendedDescription:
        'Currently only email is supported. Future versions may include SMS, Slack, or other delivery methods.'
    },

    status: {
      type: 'string',
      isIn: ['pending', 'accepted', 'expired', 'cancelled'],
      defaultsTo: 'pending',
      description: 'Current status of the invitation'
    },

    expiresAt: {
      type: 'number',
      required: true,
      description: 'JS timestamp when this invitation expires',
      columnName: 'expires_at'
    },

    invitedBy: {
      model: 'user',
      required: true,
      description: 'User who sent this invitation',
      columnName: 'invited_by'
    },

    acceptedAt: {
      type: 'number',
      allowNull: true,
      description: 'JS timestamp when invitation was accepted',
      columnName: 'accepted_at'
    },

    acceptedBy: {
      model: 'user',
      description: 'User who accepted this invitation',
      columnName: 'accepted_by'
    },

    //  ╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗
    //  ║║║║╣  ║ ╠═╣ ║║╠═╣ ║ ╠═╣
    //  ╩ ╩╚═╝ ╩ ╩ ╩═╩╝╩ ╩ ╩ ╩ ╩

    metadata: {
      type: 'json',
      description:
        'Additional invitation-specific data for different delivery methods'
    }
  }
}
