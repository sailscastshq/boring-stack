module.exports = {
  friendlyName: 'Get user avatar URL',

  description:
    'Get the best available avatar URL for a user, falling back from Google to GitHub.',

  inputs: {
    user: {
      type: 'ref',
      description: 'The user record to get avatar URL for.',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Avatar URL retrieved successfully.',
      outputType: 'string?'
    }
  },

  fn: async function ({ user }) {
    // Prioritize Google avatar, then GitHub avatar
    if (user.googleAvatarUrl && user.googleAvatarUrl.trim()) {
      return user.googleAvatarUrl.trim()
    }

    if (user.githubAvatarUrl && user.githubAvatarUrl.trim()) {
      return user.githubAvatarUrl.trim()
    }

    // Return null if no avatar available
    return null
  }
}
