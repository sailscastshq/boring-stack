---
name: getting-started
description: Overview of sails-hook-mail, config/mail.js structure, available transports, development vs production setup, and dependencies
metadata:
  tags: mail, setup, configuration, transports, sails-hook-mail, log, smtp, resend, nodemailer
---

# Getting Started with Email

## Overview

The Boring JavaScript Stack uses [sails-hook-mail](https://docs.sailscasts.com/mail) for email delivery. It is a Sails.js hook that provides a unified API for sending emails through configurable transports. The hook automatically registers `sails.helpers.mail.send` as a helper, making email sending available anywhere in your Sails application.

Key features:

- **Multiple transports** -- SMTP, Resend, and log (for development)
- **EJS templates** -- HTML email templates with template data injection
- **Shared layouts** -- A single layout file wraps all email templates
- **Configurable per environment** -- Log transport in development, real transports in production
- **Global from address** -- Set once, used across all emails

## Dependencies

Install `sails-hook-mail` and a transport package:

```bash
# Core mail hook (required)
npm install sails-hook-mail

# For SMTP transport (Mailgun, SendGrid, AWS SES, etc.)
npm install nodemailer

# For Resend transport
npm install resend
```

The `sails-hook-mail` package automatically hooks into Sails at lift time. No manual registration is needed -- Sails discovers it from `node_modules`.

## config/mail.js

The mail configuration lives in `config/mail.js`. It controls which mailer is active, defines available mailers and their transports, and sets the global sender address.

```js
// config/mail.js
module.exports.mail = {
  /**
   * Default Mailer
   * (sails.config.mail.default)
   *
   * Determines the default mailer used to send email messages from your Sails application.
   * You can set up alternative mailers and use them as needed, but this mailer will be
   * the default choice.
   */
  default: process.env.MAIL_MAILER || 'log',

  /**
   * Mailer Configurations
   * (sails.config.mail.mailers)
   *
   * Configure all the mailers used by your Sails application along with their respective settings.
   * Several examples have been provided for you, and you are free to add your own mailers based on
   * your application's requirements.
   *
   * Supported transports: "log", "smtp", "resend"
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
   * (sails.config.mail.from)
   *
   * Set a default name and email address to be used as the sender for all emails
   * sent by your Sails application. This global "From" address ensures that all
   * outgoing emails have a consistent sender identity.
   */
  from: {
    address: 'boring@sailscasts.com',
    name: 'The Boring JavaScript Stack'
  }
}
```

### Configuration Breakdown

#### `default`

The name of the mailer to use by default. This must match a key in the `mailers` object. The `MAIL_MAILER` environment variable allows switching transports without code changes:

```bash
# Development (default -- logs to console)
MAIL_MAILER=log

# Production (send real emails via SMTP)
MAIL_MAILER=smtp

# Production (send real emails via Resend)
MAIL_MAILER=resend
```

#### `mailers`

An object where each key is a mailer name and each value specifies its `transport`. You can define as many mailers as needed:

```js
mailers: {
  smtp: { transport: 'smtp' },
  log: { transport: 'log' },
  resend: { transport: 'resend' }
}
```

#### `from`

The global sender identity. Every email sent through `sails.helpers.mail.send` uses this address unless explicitly overridden per-email:

```js
from: {
  address: 'hello@myapp.com',
  name: 'My App'
}
```

## Available Transports

### Log Transport

The `log` transport prints email content to the Sails console instead of sending it. This is the default for development and testing.

```js
mailers: {
  log: {
    transport: 'log'
  }
}
```

When an email is sent with the log transport, sails-hook-mail outputs the subject, recipient, and rendered HTML to `sails.log.info`. This lets you verify email content without configuring an SMTP server or spending API credits.

### SMTP Transport

The `smtp` transport sends emails through any SMTP server using Nodemailer under the hood. This works with Mailgun, SendGrid, AWS SES, Postmark, or any standard SMTP provider.

```js
mailers: {
  smtp: {
    transport: 'smtp'
  }
}
```

SMTP credentials are configured via environment variables:

```bash
MAIL_MAILER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.myapp.com
SMTP_PASS=your-smtp-password
```

### Resend Transport

The `resend` transport uses the [Resend](https://resend.com) API for email delivery. It requires the `resend` npm package and an API key.

```js
mailers: {
  resend: {
    transport: 'resend'
  }
}
```

Configuration via environment variable:

```bash
MAIL_MAILER=resend
RESEND_API_KEY=re_123456789
```

## How the Hook Works

When Sails lifts, `sails-hook-mail` does the following:

1. **Reads `config/mail.js`** -- Loads the mail configuration from `sails.config.mail`
2. **Registers `sails.helpers.mail.send`** -- Creates a helper that any action, helper, or script can call
3. **Sets up the default transport** -- Initializes the transport specified by `sails.config.mail.default`

The registered helper accepts these parameters:

- `template` -- The EJS template name (filename without `.ejs` extension, in `views/emails/`)
- `to` -- Recipient email address
- `subject` -- Email subject line
- `templateData` -- Object of variables passed to the EJS template
- `from` -- (Optional) Override the global from address for this email
- `mailer` -- (Optional) Use a specific mailer instead of the default

## File Structure

A complete email setup in a Boring Stack app looks like this:

```
my-app/
├── config/
│   ├── mail.js                           # Mail configuration
│   ├── custom.js                         # baseUrl, token TTLs
│   └── env/
│       ├── test.js                       # Force log transport in tests
│       └── production.js                 # Production overrides
├── views/
│   ├── layouts/
│   │   └── layout-email.ejs              # Shared email layout (header, footer)
│   └── emails/
│       ├── email-verify-account.ejs      # Account verification
│       ├── email-reset-password.ejs      # Password reset
│       ├── email-magic-link.ejs          # Magic link sign-in
│       ├── email-2fa-login-verification.ejs   # 2FA login code
│       ├── email-2fa-setup-verification.ejs   # 2FA setup code
│       ├── email-team-invitation.ejs     # Team invitation
│       └── email-verify-new-email.ejs    # Email change verification
└── api/
    └── controllers/
        └── auth/
            ├── signup.js                 # Sends verification email
            ├── forgot-password.js        # Sends reset email
            ├── request-magic-link.js     # Sends magic link email
            └── send-login-email-2fa.js   # Sends 2FA code email
```

## Development Setup

For development, the default configuration works out of the box. The `log` transport is active by default, so emails are printed to the console:

```js
// config/mail.js -- no changes needed for development
module.exports.mail = {
  default: process.env.MAIL_MAILER || 'log', // Defaults to 'log'
  mailers: {
    log: { transport: 'log' }
  },
  from: {
    address: 'dev@myapp.com',
    name: 'My App'
  }
}
```

Start your app and send a test email:

```js
// In any action or helper
await sails.helpers.mail.send.with({
  subject: 'Test Email',
  template: 'email-verify-account',
  to: 'user@example.com',
  templateData: {
    fullName: 'Test User',
    token: 'abc123'
  }
})
```

The email content will appear in your terminal output instead of being sent.

### Visual Testing with Mailpit

For visually testing email templates during development, use [Mailpit](https://mailpit.axllent.org/) -- a local SMTP server with a web UI:

```bash
# Install Mailpit
brew install mailpit

# Run it (SMTP on port 1025, UI on port 8025)
mailpit
```

Then configure your app to use SMTP pointed at Mailpit:

```bash
MAIL_MAILER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
```

Open `http://localhost:8025` to view sent emails in a real email client interface.

## Production Setup

For production, set the `MAIL_MAILER` environment variable and provide transport credentials:

```bash
# Using SMTP (e.g., Mailgun)
MAIL_MAILER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.myapp.com
SMTP_PASS=your-password

# Or using Resend
MAIL_MAILER=resend
RESEND_API_KEY=re_123456789
```

Update the `from` address to match your verified domain:

```js
// config/mail.js
from: {
  address: 'hello@myapp.com',
  name: 'My App'
}
```

## Test Environment

In the test environment, always force the `log` transport so tests never send real emails:

```js
// config/env/test.js
module.exports = {
  mail: {
    default: 'log',
    mailers: {
      log: {
        transport: 'log'
      }
    }
  }
}
```

## Custom Settings for Email

Token TTLs and other email-related settings belong in `config/custom.js`:

```js
// config/custom.js
module.exports.custom = {
  appName: 'My App',
  baseUrl: 'http://localhost:1337',

  // Token expiration times
  passwordResetTokenTTL: 24 * 60 * 60 * 1000, // 24 hours
  emailProofTokenTTL: 24 * 60 * 60 * 1000, // 24 hours
  invitationExpiresTTL: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Contact email for support
  internalEmail: 'contact@myapp.com'
}
```

These values are accessed in actions and templates via `sails.config.custom.baseUrl`, `sails.config.custom.emailProofTokenTTL`, etc.

## Quick Start Checklist

1. Install `sails-hook-mail` (and `nodemailer` or `resend` if needed)
2. Configure `config/mail.js` with your mailers and from address
3. Create the email layout at `views/layouts/layout-email.ejs`
4. Create email templates in `views/emails/`
5. Send emails using `await sails.helpers.mail.send.with({ ... })`
6. Set environment variables for production transport credentials
7. Force `log` transport in `config/env/test.js`
