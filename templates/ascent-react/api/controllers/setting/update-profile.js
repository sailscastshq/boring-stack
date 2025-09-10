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
    }
  },

  fn: async function ({ fullName, email }) {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).select(['email'])

    const updatedData = {
      fullName
    }

    if (email !== user.email) {
      updatedData.emailChangeCandidate = email
      updatedData.emailStatus = 'change-requested'
      const emailProofToken = sails.helpers.strings.random('url-friendly')
      this.req.flash(
        'info',
        'Please check your email to confirm the new address.'
      )

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

    await User.updateOne({ id: userId }).set(updatedData)
    this.req.flash('success', 'Profile updated successfully!')

    return '/settings/profile'
  }
}
