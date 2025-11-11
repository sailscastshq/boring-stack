/**
 * Mail
 * (sails.config.mail)
 *
 * Use the settings below to configure mail ntegration in your app.
 *
 * For more information on Mail configuration, visit:
 * https://docs.sailscasts.com/mail/
 */

module.exports.mail = {
  /**
   * Default Mailer
   * (sails.config.mail.default)
   *
   * Determines the default mailer used to send email messages from your Sails application.
   * You can set up alternative mailers and use them as needed, but this mailer will be
   * the default choice.
   *
   */
  default: process.env.MAIL_MAILER || 'log',
  /**
   * Mailer Configurations
   * (config.mail.mailers)
   *
   * Configure all the mailers used by your Sails application along with their respective settings.
   * Several examples have been provided for you, and you are free to add your own mailers based on
   * your application's requirements.
   *
   * Sails Mail supports various mail "transport" options for sending emails. You can specify which one
   * you are using for your mailers below. Feel free to add additional mailers as needed.
   *
   * Supported transports: "log", "smtp", "resend",
   *
   */
  mailers: {
    smtp: {
      transport: 'smtp'
    },
    log: {
      transport: 'log'
    },
    nodemailer: {
      transport: 'smtp'
    }
  },
  /**
   * Global "From" Address
   * (config.mail.from)
   *
   * Set a default name and email address to be used as the sender for all emails
   * sent by your Sails application. This global "From" address ensures that all
   * outgoing emails have a consistent sender identity.
   *
   */
  from: {
    address: 'boring@sailscasts.com',
    name: 'The Boring JavaScript Stack'
  }
}
