module.exports = {
  friendlyName: 'To slug',

  description: 'Convert a string to a URL-friendly slug.',

  inputs: {
    text: {
      type: 'string',
      required: true,
      description: 'The text to convert to a slug'
    }
  },

  exits: {
    success: {
      description: 'Slug generated successfully',
      outputType: 'string'
    }
  },

  fn: async function ({ text }) {
    return (
      text
        .toLowerCase()
        .trim()
        // Replace spaces and special characters with hyphens
        .replace(/[\s\W-]+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
    )
  }
}
