module.exports = {
  friendlyName: 'Register',

  description: 'Register auth.',

  inputs: {
    fullName: {
      type: 'string',
      maxLength: 120,
      required: true
    },
    email: {
      type: 'string',
      isEmail: true,
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs) {
    const unverifiedUser = await User.create(inputs).fetch()
    // share the email

    sails.inertia.share('unverifiedUserEmail', unverifiedUser.email)
    return '/verify-email'
  }
}
