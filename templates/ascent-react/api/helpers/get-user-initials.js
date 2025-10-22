module.exports = {
  friendlyName: 'Get user initials',
  sync: true,
  description:
    "Extracting initials from user's fullName. Needed to show on the user avatar",

  inputs: {
    fullName: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      outputFriendlyName: 'User initials'
    }
  },

  fn: function ({ fullName }) {
    // Get user initials.
    const [firstName, lastName] = fullName.split(' ')

    const userInitials = lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : `${firstName.slice(0, 2)}`

    return userInitials.toUpperCase()
  }
}
