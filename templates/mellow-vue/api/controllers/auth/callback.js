module.exports = {
  friendlyName: 'Callback',

  description: 'Callback auth.',

  inputs: {
    code: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },
  fn: async function ({ code }, exits) {
    sails.log(code)
    // All done.
    return '/home'
  }
}
