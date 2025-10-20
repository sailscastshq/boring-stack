module.exports = {
  friendlyName: 'Cleanup old file',

  description: 'Remove an old uploaded file from the filesystem.',

  inputs: {
    oldFileUrl: {
      type: 'string',
      description: 'The URL of the old file to remove',
      example: '/uploads/avatar-123.jpg'
    }
  },

  exits: {
    success: {
      description: 'File cleaned up successfully or no file to clean.'
    }
  },

  fn: async function ({ oldFileUrl }, exits) {
    if (!oldFileUrl) {
      return exits.success()
    }

    const path = require('path')
    const fs = require('fs/promises')

    try {
      // Extract filename from URL (e.g., '/uploads/avatar-123.jpg' -> 'avatar-123.jpg')
      const filename = oldFileUrl.replace('/uploads/', '')
      const filePath = path.join(
        sails.config.appPath,
        '.tmp/public/uploads',
        filename
      )

      // Check if file exists and remove it
      await fs.access(filePath)
      await fs.unlink(filePath)

      sails.log.info(`Cleaned up old file: ${filename}`)
    } catch (error) {
      // File doesn't exist or couldn't be removed - not a critical error
      sails.log.debug(`Could not clean up file ${oldFileUrl}:`, error.message)
    }

    return exits.success()
  }
}
