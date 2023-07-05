/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    firstName: {
      type: 'string',
      required: true,
      description: "The user's first name.",
      maxLength: 120,
      example: 'Mike',
      columnName: 'first_name'
    },
    lastName: {
      type: 'string',
      required: true,
      description: "The user's last name.",
      maxLength: 120,
      example: 'McNeil',
      columnName: 'last_name'
    },
    emailAddress: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'mike@sailsjs.com',
      columnName: 'email_address'
    },
    emailStatus: {
      type: 'string',
      isIn: ['unconfirmed', 'change-requested', 'confirmed'],
      defaultsTo: 'unconfirmed',
      description: "The confirmation status of the user's email address.",
      extendedDescription: `Users might be created as "unconfirmed" (e.g. normal signup) or as "confirmed" (e.g. hard-coded admin users). If a user signs up via an OAuth provider, this should be set to "confirmed" if the email has been verified by the OAuth provider`,
      columnName: 'email_status'
    },
    emailChangeCandidate: {
      type: 'string',
      isEmail: true,
      description:
        'A still-unconfirmed email address that this user wants to change to',
      columnName: 'email_change_candidate'
    },
    password: {
      type: 'string',
      description:
        "Securely hashed representation of the user's login password",
      protect: true,
      example: '$2a$12$ymX0WdZU9vc0nM3ftCxGn.6p3aIFvI4haSrr/Y8ByW2BfnzqI1M0y'
    },
    passwordResetToken: {
      type: 'string',
      description:
        "A unique token used to verify the user's identity when recovering a password.  Expires after 1 use, or after a set amount of time has elapsed."
    },

    passwordResetTokenExpiresAt: {
      type: 'number',
      description:
        "A JS timestamp (epoch ms) representing the moment when this user's `passwordResetToken` will expire (or 0 if the user currently has no such token).",
      example: 1502844074211
    },

    emailProofToken: {
      type: 'string',
      description:
        'A pseudorandom, probabilistically-unique token for use in our account verification emails.'
    },

    emailProofTokenExpiresAt: {
      type: 'number',
      description:
        "A JS timestamp (epoch ms) representing the moment when this user's `emailProofToken` will expire (or 0 if the user currently has no such token).",
      example: 1502844074211
    },
    googleUserId: {
      type: 'string',
      description:
        'The unique ID of a user that signs in or register with their Google account.',
      allowNull: true,
      columnName: 'google_user_id'
    },
    googleAccessToken: {
      type: 'string',
      description: 'Access token provided by Google for an OAuth user.',
      allowNull: true,
      columnName: 'google_access_token'
    },
    googleIdToken: {
      type: 'string',
      description: 'The ID token provided by Google for an OAuth user.',
      allowNull: true,
      columnName: 'google_id_token'
    },
    googleAvatarUrl: {
      type: 'string',
      description: 'The picture URL provided by Google for an OAuth user.',
      allowNull: true,
      columnName: 'google_avatar_url'
    }
  }
}
