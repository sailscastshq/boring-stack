/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'users',
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    fullName: {
      type: 'string',
      required: true,
      description: "The user's full name.",
      maxLength: 120,
      example: 'Mike McNeil',
      columnName: 'full_name'
    },
    initials: {
      type: 'string'
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'mike@sailsjs.com',
      columnName: 'email'
    },
    emailStatus: {
      type: 'string',
      isIn: ['unverified', 'verified', 'change-requested'],
      defaultsTo: 'unverified',
      description: "The verification status of the user's email address.",
      extendedDescription: `Users might be created as "unverified" (e.g. normal signup) or as "verified" (e.g. hard-coded admin users or OAuth flow). If a user signs up via an OAuth provider, this should be set to "verified" if the email has been verified by the OAuth provider`,
      columnName: 'email_status'
    },
    emailChangeCandidate: {
      type: 'string',
      isEmail: true,
      description:
        'A still-unverified email address that this user wants to change to',
      columnName: 'email_change_candidate'
    },
    password: {
      type: 'string',
      description:
        "Securely hashed representation of the user's login password",
      protect: true,
      minLength: 8,
      example: '$2a$12$ymX0WdZU9vc0nM3ftCxGn.6p3aIFvI4haSrr/Y8ByW2BfnzqI1M0y'
    },
    passwordUpdatedAt: {
      type: 'number',
      description:
        'A JS timestamp (epoch ms) representing when the password was last updated.',
      example: 1502844074211,
      columnName: 'password_updated_at',
      allowNull: true
    },
    passwordStrength: {
      type: 'json',
      description: 'Password strength analysis (score, label, color)',
      columnName: 'password_strength'
    },
    passwordResetToken: {
      type: 'string',
      description:
        "A unique token used to verify the user's identity when recovering a password.  Expires after 1 use, or after a set amount of time has elapsed.",
      columnName: 'password_reset_token'
    },
    passwordResetTokenExpiresAt: {
      type: 'number',
      description:
        "A JS timestamp (epoch ms) representing the moment when this user's `passwordResetToken` will expire (or 0 if the user currently has no such token).",
      example: 1502844074211,
      columnName: 'password_reset_token_expires_at'
    },
    emailProofToken: {
      type: 'string',
      description:
        'A pseudorandom, probabilistically-unique token for use in our account verification emails.',
      columnName: 'email_proof_token'
    },
    emailProofTokenExpiresAt: {
      type: 'number',
      description:
        "A JS timestamp (epoch ms) representing the moment when this user's `emailProofToken` will expire (or 0 if the user currently has no such token).",
      example: 1502844074211,
      columnName: 'email_proof_token_expires_at'
    },
    googleId: {
      type: 'string',
      description:
        'The unique ID of a user that signs in or register with their Google account.',
      columnName: 'google_id'
    },
    googleAccessToken: {
      type: 'string',
      description: 'Access token provided by Google for an OAuth user.',
      columnName: 'google_access_token'
    },
    googleIdToken: {
      type: 'string',
      description: 'The ID token provided by Google for an OAuth user.',
      columnName: 'google_id_token'
    },
    googleAvatarUrl: {
      type: 'string',
      description: 'The picture URL provided by Google for an OAuth user.',
      columnName: 'google_avatar_url'
    },
    githubId: {
      type: 'string',
      description: 'The unique GitHub ID for an OAuth user.',
      columnName: 'github_id'
    },
    githubAccessToken: {
      type: 'string',
      description: 'Access token provided by GitHub for an OAuth user.',
      columnName: 'github_access_token'
    },
    githubAvatarUrl: {
      type: 'string',
      description: 'The avatar URL provided by GitHub for an OAuth user.',
      columnName: 'github_avatar_url'
    },
    //  ╔╦╗┌─┐┌─┐┬┌─┐  ╦  ┬┌┐┌┬┌─
    //  ║║║├─┤│ ┬││   ║  ││││├┴┐
    //  ╩ ╩┴ ┴└─┘┴└─┘  ╩═╝┴┘└┘┴ ┴
    magicLinkToken: {
      type: 'string',
      description:
        'A secure token used for magic link authentication. This is hashed before storage.',
      columnName: 'magic_link_token'
    },
    magicLinkTokenExpiresAt: {
      type: 'number',
      description:
        'A JS timestamp (epoch ms) representing when this magic link token expires.',
      example: 1502844074211,
      columnName: 'magic_link_token_expires_at'
    },
    magicLinkTokenUsedAt: {
      type: 'number',
      description:
        'A JS timestamp (epoch ms) representing when this magic link token was used (null if unused).',
      example: 1502844074211,
      columnName: 'magic_link_token_used_at',
      allowNull: true
    },

    //  ╔╦╗┬ ┬┌─┐  ╔═╗┌─┐┌─┐┌┬┐┌─┐┬─┐  ╔═╗┬ ┬┌┬┐┬ ┬┌─┐┌┐┌┌┬┐┬┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
    //  ║ ║││││ │  ╠╣ ├─┤│   │ │ │├┬┘  ╠═╣│ │ │ ├─┤├┤ │││ │ ││  ├─┤ │ ││ ││││
    //  ╩ ╩└┴┘└─┘  ╚  ┴ ┴└─┘ ┴ └─┘┴└─  ╩ ╩└─┘ ┴ ┴ ┴└─┘┘└┘ ┴ ┴└─┘┴ ┴ ┴ ┴└─┘┘└┘
    twoFactorEnabled: {
      type: 'boolean',
      defaultsTo: false,
      description:
        'Whether the user has any two-factor authentication methods enabled.',
      columnName: 'two_factor_enabled'
    },
    totpSecret: {
      type: 'string',
      description:
        'The base32 secret key for TOTP (Time-based One-Time Password) authentication.',
      protect: true,
      columnName: 'totp_secret',
      allowNull: true
    },
    totpEnabled: {
      type: 'boolean',
      defaultsTo: false,
      description:
        'Whether TOTP (authenticator app) two-factor authentication is enabled.',
      columnName: 'totp_enabled'
    },
    emailTwoFactorEnabled: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Whether email-based two-factor authentication is enabled.',
      columnName: 'email_two_factor_enabled'
    },
    backupCodes: {
      type: 'json',
      description:
        'Array of one-time backup codes for account recovery when 2FA is unavailable.',
      columnName: 'backup_codes'
    },
    twoFactorVerificationCode: {
      type: 'string',
      description: 'Temporary storage for email-based 2FA verification codes.',
      columnName: 'two_factor_verification_code',
      allowNull: true
    },
    twoFactorVerificationCodeExpiresAt: {
      type: 'number',
      description:
        'A JS timestamp (epoch ms) representing when the 2FA verification code expires.',
      example: 1502844074211,
      columnName: 'two_factor_verification_code_expires_at',
      allowNull: true
    }
  },
  customToJSON: function () {
    return Object.keys(this).reduce((result, key) => {
      if (
        ![
          'googleIdToken',
          'googleUserId',
          'googleAccessToken',
          'githubId',
          'githubAccessToken',
          'password',
          'passwordResetTokenExpiresAt',
          'emailProofToken',
          'emailProofTokenExpiresAt',
          'magicLinkToken',
          'magicLinkTokenExpiresAt',
          'magicLinkTokenUsedAt',
          'totpSecret',
          'backupCodes',
          'twoFactorVerificationCode',
          'twoFactorVerificationCodeExpiresAt'
        ].includes(key)
      ) {
        result[key] = this[key]
      }
      return result
    }, {})
  },
  beforeCreate: async function (valuesToSet, proceed) {
    valuesToSet.initials = sails.helpers.getUserInitials(valuesToSet.fullName)
    if (valuesToSet.password) {
      // Calculate password strength before hashing
      const strength = await sails.helpers.calculatePasswordStrength(
        valuesToSet.password
      )
      valuesToSet.passwordStrength = {
        score: strength.score,
        label: strength.label,
        color: strength.color
      }

      valuesToSet.password = await sails.helpers.passwords.hashPassword(
        valuesToSet.password
      )
      valuesToSet.passwordUpdatedAt = Date.now()
    }
    return proceed()
  },
  beforeUpdate: async function (valuesToSet, proceed) {
    if (valuesToSet.password) {
      // Calculate password strength before hashing
      const strength = await sails.helpers.calculatePasswordStrength(
        valuesToSet.password
      )
      valuesToSet.passwordStrength = {
        score: strength.score,
        label: strength.label,
        color: strength.color
      }

      valuesToSet.password = await sails.helpers.passwords.hashPassword(
        valuesToSet.password
      )
      valuesToSet.passwordUpdatedAt = Date.now()
    }
    return proceed()
  }
}
