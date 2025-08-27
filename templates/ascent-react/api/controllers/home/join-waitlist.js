module.exports = {
  friendlyName: 'Join waitlist',

  description: 'Join the product waitlist.',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'The email address to add to the waitlist.'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    emailAlreadyInUse: {
      responseType: 'redirect',
      description: 'The provided email address is already on the waitlist.'
    }
  },

  fn: async function ({ email }) {
    await Waitlist.create({
      email: email.toLowerCase().trim()
    }).intercept('E_UNIQUE', (e) => {
      this.req.flash('message', 'You have already joined the waitlist')
      return { emailAlreadyInUse: '/' }
    })

    sails.log.info(`New waitlist signup: ${email}`)
    this.req.flash('success', "You've successfully joined the Ascent waitlist!")
    return '/'
  }
}
