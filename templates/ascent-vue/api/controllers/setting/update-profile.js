module.exports = {
  friendlyName: 'Update profile',

  description: 'Update the profile information of the logged-in user.',

  files: ['avatar'],

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
    avatar: {
      type: 'ref',
      description: 'An uploaded avatar image file.'
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

  fn: async function ({ fullName, email, avatar }) {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).select([
      'email',
      'avatarUrl'
    ])

    const updatedData = {
      fullName
    }

    // Handle avatar upload if provided
    if (avatar) {
      try {
        const uploadedFile = await sails.uploadOne(avatar, {
          allowedTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
          ]
        })

        if (uploadedFile) {
          const filename = uploadedFile.fd.split('/').pop()
          updatedData.avatarUrl = `${sails.config.custom.uploadBaseUrl}/${filename}`
        }
      } catch (err) {
        // Handle upload errors
        let errorMessage = 'Failed to upload avatar'
        if (err.code === 'E_EXCEEDS_UPLOAD_LIMIT') {
          errorMessage = 'Avatar file size must be less than 5MB'
        } else if (err.code === 'E_INVALID_FILE_TYPE') {
          errorMessage =
            'Avatar must be an image file (JPEG, PNG, GIF, or WebP)'
        }

        throw {
          invalid: {
            problems: [
              {
                avatar: errorMessage
              }
            ]
          }
        }
      }
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
