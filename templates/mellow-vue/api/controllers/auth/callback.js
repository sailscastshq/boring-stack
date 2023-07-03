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
    const googleUser = await sails.wish.provider('google').user(code)
    sails.log(googleUser)
    return '/'
  }
}
