module.exports = {
  friendlyName: 'Join waitlist',

  description: '',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      maxLength: 200
    }
  },

  exits: {
    success: {
      responseType: 'redirect',
      description: 'Successfully joined waitlist'
    },
    badRequest: {
      description: 'The provided email address is invalid.',
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email }) {
    await Waitlist.create({ email }).intercept('E_UNIQUE', 'badRequest')
    return '/'
  }
}
