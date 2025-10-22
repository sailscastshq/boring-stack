module.exports = {
  friendlyName: 'Submit contact',
  description: 'Submit a contact form message.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    company: {
      type: 'string',
      allowNull: true,
      maxLength: 100
    },
    topic: {
      type: 'string',
      required: true,
      isIn: [
        'general',
        'sales',
        'support',
        'enterprise',
        'partnerships',
        'feature-request',
        'bug-report',
        'other'
      ]
    },
    message: {
      type: 'string',
      required: true,
      maxLength: 2000
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ name, email, company, topic, message }) {
    const topicLabels = {
      general: 'General Inquiry',
      sales: 'Sales & Pricing',
      support: 'Technical Support',
      enterprise: 'Enterprise Plans',
      partnerships: 'Partnerships',
      'feature-request': 'Feature Request',
      'bug-report': 'Bug Report',
      other: 'Other'
    }

    const topicLabel = topicLabels[topic] || 'General Inquiry'

    await sails.helpers.mail.send.with({
      to: sails.config.custom.internalEmail,
      subject: `[Contact Form] ${topicLabel} - ${name}`,
      template: 'email-contact-form-notification',
      templateData: {
        name,
        email,
        company: company || 'Not specified',
        topic: topicLabel,
        message,
        timestamp: new Date().toISOString()
      }
    })

    await sails.helpers.mail.send.with({
      to: email,
      subject: `We received your message - ${sails.config.custom.appName}`,
      template: 'email-contact-form-confirmation',
      templateData: {
        name,
        topic: topicLabel,
        message
      }
    })

    sails.log.info(
      `Contact form submitted by ${name} (${email}) - Topic: ${topicLabel}`
    )

    this.req.flash(
      'success',
      "Thank you for your message! We'll get back to you within 24 hours."
    )
    return '/contact'
  }
}
