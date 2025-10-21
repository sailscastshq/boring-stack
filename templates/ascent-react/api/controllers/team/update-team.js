module.exports = {
  friendlyName: 'Update team',
  description: 'Update team name and settings',

  files: ['logo'],

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'ID of the team to update'
    },
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      description: 'New team name'
    },
    logo: {
      type: 'ref',
      description: 'An uploaded logo image file.'
    }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    notFound: { responseType: 'notFound' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function ({ teamId, name, logo }) {
    const team = await Team.findOne({ id: teamId })
    if (!team) {
      throw 'notFound'
    }

    const updatedData = {
      name: name.trim()
    }

    // Handle logo upload if provided
    if (logo) {
      try {
        const uploadedFile = await sails.uploadOne(logo, {
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
          updatedData.logoUrl = `${sails.config.custom.uploadBaseUrl}/${filename}`
        }
      } catch (err) {
        // Handle upload errors
        let errorMessage = 'Failed to upload logo'
        if (err.code === 'E_EXCEEDS_UPLOAD_LIMIT') {
          errorMessage = 'Logo file size must be less than 5MB'
        } else if (err.code === 'E_INVALID_FILE_TYPE') {
          errorMessage = 'Logo must be an image file (JPEG, PNG, GIF, or WebP)'
        }

        throw {
          badRequest: {
            problems: [
              {
                logo: errorMessage
              }
            ]
          }
        }
      }
    }

    await Team.updateOne({ id: teamId }).set(updatedData)

    this.req.flash('success', 'Team settings updated successfully.')
    return '/settings/team'
  }
}
