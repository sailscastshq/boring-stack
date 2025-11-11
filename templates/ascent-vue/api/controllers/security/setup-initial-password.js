module.exports = {
  friendlyName: 'Setup initial password',
  description:
    'Set up initial password for a logged-in user who does not have one.',
  inputs: {
    password: {
      type: 'string',
      required: true,
      description: 'The new password for the user.',
      minLength: 8
    },
    confirmPassword: {
      type: 'string',
      required: true,
      description: 'The confirmation of the new password.'
    }
  },
  exits: {
    success: {
      responseType: 'redirect',
      description: 'Initial password set up successfully.'
    },
    alreadyHasPassword: {
      responseType: 'badRequest',
      description: 'User already has a password set.'
    },
    invalid: {
      responseType: 'badRequest',
      description: 'The provided inputs are invalid.'
    }
  },

  fn: async function ({ password, confirmPassword }) {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).select(['password'])

    if (user.password) {
      throw {
        alreadyHasPassword: {
          problems: [
            {
              setupInitialPassword:
                'You already have a password set. Use the "Edit" option to change it.'
            }
          ]
        }
      }
    }

    if (password !== confirmPassword) {
      throw {
        invalid: {
          problems: [
            { confirmPassword: 'Password confirmation does not match.' }
          ]
        }
      }
    }

    await User.updateOne({ id: userId }).set({
      password,
      passwordUpdatedAt: Date.now()
    })

    this.req.flash(
      'success',
      'Password set up successfully! You can now enable two-factor authentication.'
    )
    return '/settings/security'
  }
}
