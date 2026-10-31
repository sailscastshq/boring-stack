module.exports = {
  friendlyName: 'Create link',

  inputs: {
    url: {
      type: 'string',
      required: true,
      isURL: true,
      maxLength: 2048
    }
  },

  exits: {
    success: {
      statusCode: 201
    }
  },

  fn: async function ({ url }) {
    return { url }
  }
}
