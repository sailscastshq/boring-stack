module.exports = {
  friendlyName: 'Login',

  description: 'Log in using the provided email and password combination.',

  extendedDescription: `This action attempts to look up the user record in the database with the
specified email address.  Then, if such a user exists, it uses
bcrypt to compare the hashed password from the database with the provided
password attempt.`,

  inputs: {
    email: {
      description: 'The email to try in this attempt, e.g. "irl@example.com".',
      type: 'string',
      isEmail: true,
      required: true
    },

    password: {
      description:
        'The unencrypted password to try in this attempt, e.g. "passwordlol".',
      type: 'string',
      required: true
    },

    rememberMe: {
      description: "Whether to extend the lifetime of the user's session.",
      type: 'boolean'
    }
  },

  exits: {
    success: {
      description: 'The requesting user agent has been successfully logged in.',
      extendedDescription: `Under the covers, this stores the id of the logged-in user in the session
as the \`userId\` key.  The next time this user agent sends a request, assuming
it includes a cookie (like a web browser), Sails will automatically make this
user id available as req.session.userId in the corresponding action.  (Also note
that, thanks to the included "custom" hook, when a relevant request is received
from a logged-in user, that user's entire record from the database will be fetched
and exposed as a shared data via loggedInUser prop.)`,
      responseType: 'redirect'
    },
    badCombo: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email, password, rememberMe }) {
    const user = await User.findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      throw {
        badCombo: {
          problems: [{ login: 'Wrong email/password.' }]
        }
      }
    }

    try {
      await sails.helpers.passwords.checkPassword(password, user.password)
    } catch (e) {
      sails.log.error(e.message)
      throw {
        badCombo: {
          problems: [{ login: 'Wrong email/password.' }]
        }
      }
    }

    if (rememberMe) {
      this.req.session.cookie.maxAge =
        sails.config.custom.rememberMeCookieMaxAge
    }

    this.req.session.userId = user.id
    return '/dashboard'
  }
}
