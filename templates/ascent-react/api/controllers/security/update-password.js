module.exports = {
  friendlyName: 'Update password',
  description: 'Update the password of the logged-in user.',
  inputs: {
    currentPassword: {
      type: 'string',
      required: true,
      description: 'The current password of the user.'
    },
    password: {
      type: 'string',
      required: true,
      description: 'The new password of the user.'
    },
    confirmPassword: {
      type: 'string',
      required: true,
      description: 'The confirmation of the new password.'
    }
  },
  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Password updated successfully.'
    },
    invalid: {
      responseType: 'badRequest',
      description: 'The provided inputs are invalid.'
    },
    unauthorized: {
      responseType: 'redirect',
      description:
        'The provided current password is incorrect, user logged out.'
    }
  },

  fn: async function ({ currentPassword, password, confirmPassword }) {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).select(['password'])

    await sails.helpers.passwords
      .checkPassword(currentPassword, user.password)
      .intercept('incorrect', () => {
        delete this.req.session.userId
        this.req.flash(
          'error',
          'Current password is incorrect. You have been logged out for security.'
        )
        return { unauthorized: '/login' }
      })

    if (password !== confirmPassword) {
      throw {
        invalid: {
          problems: [
            { confirmPassword: 'Password confirmation does not match.' }
          ]
        }
      }
    }
    await User.updateOne({ id: userId }).set({ password })

    this.req.flash('success', 'Password updated successfully')
    return '/settings/security'
  }
}
