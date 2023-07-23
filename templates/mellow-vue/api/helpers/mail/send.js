module.exports = {
  friendlyName: 'Send',

  description: 'Send mail.',

  inputs: {
    mailer: {
      type: 'string',
      description: 'The mailer to used.',
      extendedDescription:
        'The mailer should be configured properly in config/mails.js. If not specified, the default mailer in sails.config.mail.default will be used',
      defaultsTo: sails.config.mail.default,
      isIn: ['log']
    },
    template: {
      description:
        'The relative path to an EJS template within our `views/emails/` folder -- WITHOUT the file extension.',
      extendedDescription:
        'Use strings like "foo" or "foo/bar", but NEVER "foo/bar.ejs" or "/foo/bar".  For example, ' +
        '"internal/email-contact-form" would send an email using the "views/emails/internal/email-contact-form.ejs" template.',
      example: 'email-reset-password',
      type: 'string'
    },

    templateData: {
      description:
        'A dictionary of data which will be accessible in the EJS template.',
      extendedDescription:
        'Each key will be a local variable accessible in the template.  For instance, if you supply ' +
        'a dictionary with a `friends` key, and `friends` is an array like `[{name:"Chandra"}, {name:"Mary"}]`),' +
        'then you will be able to access `friends` from the template:\n' +
        '```\n' +
        '<ul>\n' +
        '<% for (friend of friends){ %><li><%= friend.name %></li><% }); %>\n' +
        '</ul>\n' +
        '```' +
        '\n' +
        'This is EJS, so use `<%= %>` to inject the HTML-escaped content of a variable, `<%= %>` to skip HTML-escaping ' +
        'and inject the data as-is, or `<% %>` to execute some JavaScript code such as an `if` statement or `for` loop.',
      type: {},
      defaultsTo: {}
    },
    to: {
      description: 'The email address of the primary recipient.',
      extendedDescription:
        'If this is any address ending in "@example.com", then don\'t actually deliver the message. ' +
        'Instead, just log it to the console.',
      example: 'nola.thacker@example.com',
      required: true,
      isEmail: true
    },
    toName: {
      description: 'Name of the primary recipient as displayed in their inbox.',
      example: 'Nola Thacker'
    },

    subject: {
      description: 'The subject of the email.',
      example: 'Hello there.',
      defaultsTo: ''
    },

    from: {
      description:
        'An override for the default "from" email that\'s been configured.',
      example: 'anne.martin@example.com',
      isEmail: true,
      defaultsTo: sails.config.mail.from.email
    },

    fromName: {
      description: 'An override for the default "from" name.',
      example: 'Anne Martin',
      defaultsTo: sails.config.mail.from.name
    },

    layout: {
      description:
        'Set to `false` to disable layouts altogether, or provide the path (relative ' +
        'from `views/layouts/`) to an override email layout.',
      defaultsTo: 'layout-email',
      custom: (layout) => layout === false || typeof layout === 'string'
    },
    waitForAcknowledgement: {
      description:
        'Whether to wait for acknowledgement (response) that the email was successfully sent (or at least queued for sending) before returning.',
      extendedDescription:
        'Otherwise by default, this returns immediately and delivers the request to deliver this email in the background.',
      type: 'boolean',
      defaultsTo: false
    }
  },

  exits: {
    success: {
      description: 'All done.'
    }
  },

  fn: async function ({ template, templateData, layout, to, subject, mailer }) {
    if (template && !template.startsWith('email-')) {
      sails.log.warn(
        'The "template" that was passed in to `send()` does not begin with ' +
          '"email-" -- but by convention, all email template files in `views/emails/` should ' +
          'be namespaced in this way.  (This makes it easier to look up email templates by ' +
          'filename; e.g. when using CMD/CTRL+P in Sublime Text.)\n' +
          'Continuing regardless...'
      )
    }
    if (
      template &&
      (template.startsWith('views/') || template.startsWith('views/'))
    ) {
      throw new Error(
        'The "template" that was passed in to `sendTemplateEmail()` was prefixed with\n' +
          '`emails/` or `views/` -- but that part is supposed to be omitted.  Instead, please\n' +
          'just specify the path to the desired email template relative from `views/emails/`.\n' +
          'For example:\n' +
          "  template: 'email-reset-password'\n" +
          'Or:\n' +
          "  template: 'admin/email-contact-form'\n" +
          " [?] If you're unsure or need advice, see https://sailsjs.com/support"
      )
    } //•
    // Determine appropriate email layout and template to use.
    const path = require('path')
    const emailTemplatePath = path.join('emails/', template)
    let emailTemplateLayout
    if (layout) {
      emailTemplateLayout = path.relative(
        path.dirname(emailTemplatePath),
        path.resolve('layouts/', layout)
      )
    } else {
      emailTemplateLayout = false
    }
    // Compile HTML template.
    // > Note that we set the layout, provide access to core `url` package (for
    // > building links and image srcs, etc.)
    const url = require('url')
    const htmlEmailContents = await sails
      .renderView(emailTemplatePath, {
        layout: emailTemplateLayout,
        url,
        ...templateData
      })
      .intercept((err) => {
        err.message =
          'Could not compile view template.\n' +
          '(Usually, this means the provided data is invalid, or missing a piece.)\n' +
          'Details:\n' +
          err.message
        return err
      })

    // Log info to the console about the email that WOULD have been sent.
    // Specifically, if the mailer is set to 'log' or email address is anything "@example.com".

    // > This is used below when determining whether to actually send the email,
    // > for convenience during development, but also for safety.  (For example,
    // > a special-cased version of "user@example.com" is used by Trend Micro Mars
    // > scanner to "check apks for malware".)
    const isToAddressConsideredFake = Boolean(to.match(/@example\.com$/i))
    if (mailer == 'log' || isToAddressConsideredFake) {
      const logMessage = `
    Mailer is set to log so Sails is logging the email:
    -=-=-=-=-=-=-=-=-=-=-=-=-= Email log -=-=-=-=-=-=-=-=-=-=-=-=-=
    To: ${to}
    Subject: ${subject}

    Body:
    ${htmlEmailContents}
    -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  `
      sails.log(logMessage)
    }

    return {}
  }
}
