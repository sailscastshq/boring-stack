module.exports = {
  friendlyName: 'Update profile',

  description: 'Update the profile information of the logged-in user.',

  inputs: {
    fullName: {
      type: 'string',
      required: true,
      description: 'The full name of the user.'
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'The email address of the user.'
    },
    currentPassword: {
      type: 'string',
      description: 'The current password of the user.',
      allowNull: true
    },
    password: {
      type: 'string',
      allowNull: true,
      description: 'The new password of the user.'
    },
    confirmPassword: {
      type: 'string',
      description: 'The confirmation of the new password.',
      allowNull: true
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Profile updated successfully.'
    },
    invalid: {
      responseType: 'badRequest',
      description: 'The provided inputs are invalid.'
    },
    unauthorized: {
      responseType: 'inertiaRedirect',
      description: 'The provided current password is incorrect.'
    }
  },

  fn: async function ({
    fullName,
    email,
    currentPassword,
    password,
    confirmPassword
  }) {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).select([
      'password',
      'email'
    ])

    if (currentPassword) {
      await sails.helpers.passwords
        .checkPassword(currentPassword, user.password)
        .intercept('incorrect', () => {
          delete this.req.session.userId
          return { unauthorized: '/login' }
        })
    }

    const updatedData = {
      fullName
    }
    if (email !== user.email) {
      updatedData.emailChangeCandidate = email
      updatedData.emailStatus = 'change-requested'
      const emailProofToken = sails.helpers.strings.random('url-friendly')

      await sails.helpers.mail.send.with({
        to: email,
        subject: 'Confirm your new email address',
        template: 'email-verify-new-email',
        templateData: {
          fullName,
          token: emailProofToken
        }
      })
    }

    if (password) {
      if (password !== confirmPassword) {
        throw {
          invalid: {
            problems: [{ password: 'Password confirmation does not match.' }]
          }
        }
      }
      updatedData.password = password
    }

    await User.updateOne({ id: userId }).set(updatedData)

    return 'back'
  }
}
