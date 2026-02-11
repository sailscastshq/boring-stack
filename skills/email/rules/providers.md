---
name: providers
description: SMTP configuration for Mailgun/SendGrid/AWS SES, Resend setup, environment variables, per-environment config, and local testing tools
metadata:
  tags: smtp, resend, mailgun, sendgrid, aws-ses, providers, environment, production, testing, mailpit, mailtrap
---

# Email Providers

## Overview

`sails-hook-mail` supports multiple email providers through its transport system. The transport determines how emails are physically delivered. You configure transports in `config/mail.js` and switch between them using the `MAIL_MAILER` environment variable.

Available transports:

| Transport | Package Required | Use Case                                                               |
| --------- | ---------------- | ---------------------------------------------------------------------- |
| `log`     | None             | Development/testing -- prints to console                               |
| `smtp`    | `nodemailer`     | Production -- any SMTP provider (Mailgun, SendGrid, AWS SES, Postmark) |
| `resend`  | `resend`         | Production -- Resend API                                               |

## Environment Variables

All email provider configuration uses environment variables. Never hardcode credentials in config files.

### Core Variables

```bash
# Which mailer to use (matches a key in config/mail.js mailers)
MAIL_MAILER=log          # Development
MAIL_MAILER=smtp         # Production with SMTP
MAIL_MAILER=resend       # Production with Resend
```

### SMTP Variables

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.myapp.com
SMTP_PASS=your-smtp-password
```

### Resend Variables

```bash
RESEND_API_KEY=re_123456789
```

## SMTP Configuration

The SMTP transport uses [Nodemailer](https://nodemailer.com) under the hood. Install it first:

```bash
npm install nodemailer
```

### Basic SMTP Setup

```js
// config/mail.js
module.exports.mail = {
  default: process.env.MAIL_MAILER || 'log',
  mailers: {
    smtp: {
      transport: 'smtp'
    },
    log: {
      transport: 'log'
    }
  },
  from: {
    address: 'hello@myapp.com',
    name: 'My App'
  }
}
```

The SMTP transport reads connection details from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Set these in your `.env` file or hosting platform.

### Mailgun

[Mailgun](https://www.mailgun.com/) provides an SMTP relay service.

```bash
MAIL_MAILER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.myapp.com
SMTP_PASS=your-mailgun-smtp-password
```

To find your SMTP credentials in Mailgun:

1. Go to **Sending** > **Domains** > select your domain
2. Click **SMTP credentials**
3. Use the login and password shown

The `from` address must use a verified domain in Mailgun. Verify your domain under **Sending** > **Domains** before sending production emails.

### SendGrid

[SendGrid](https://sendgrid.com/) SMTP relay:

```bash
MAIL_MAILER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

Note: SendGrid uses `apikey` as the literal SMTP username, and your API key as the password.

To create an API key:

1. Go to **Settings** > **API Keys**
2. Click **Create API Key**
3. Grant **Mail Send** permission
4. Copy the generated key -- it is only shown once

### AWS SES

[Amazon Simple Email Service](https://aws.amazon.com/ses/) SMTP interface:

```bash
MAIL_MAILER=smtp
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

Replace `us-east-1` with your AWS region. To get SMTP credentials:

1. Go to **Amazon SES** > **SMTP settings**
2. Click **Create SMTP credentials**
3. Download the credentials (username and password)

Important: New SES accounts start in sandbox mode. You must request production access and verify sender/recipient addresses before sending to arbitrary email addresses.

### Postmark

[Postmark](https://postmarkapp.com/) SMTP:

```bash
MAIL_MAILER=smtp
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your-postmark-server-api-token
SMTP_PASS=your-postmark-server-api-token
```

Postmark uses the same Server API Token for both username and password.

### Custom SMTP Server

Any standard SMTP server works:

```bash
MAIL_MAILER=smtp
SMTP_HOST=mail.mycompany.com
SMTP_PORT=587
SMTP_USER=noreply@mycompany.com
SMTP_PASS=your-password
```

### Common SMTP Ports

| Port | Encryption | Use Case                                |
| ---- | ---------- | --------------------------------------- |
| 587  | STARTTLS   | Recommended for most providers          |
| 465  | SSL/TLS    | Legacy secure SMTP                      |
| 25   | None       | Not recommended (often blocked by ISPs) |

Use port 587 unless your provider specifically requires a different port.

## Resend Configuration

[Resend](https://resend.com) is a modern email API with a developer-friendly interface. Install the package:

```bash
npm install resend
```

### Setup

```js
// config/mail.js
module.exports.mail = {
  default: process.env.MAIL_MAILER || 'log',
  mailers: {
    resend: {
      transport: 'resend'
    },
    log: {
      transport: 'log'
    }
  },
  from: {
    address: 'hello@myapp.com',
    name: 'My App'
  }
}
```

```bash
MAIL_MAILER=resend
RESEND_API_KEY=re_123456789
```

To get an API key:

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** and create a new key
3. Add and verify your sending domain under **Domains**

### Resend Advantages

- Simple API with excellent developer experience
- Built-in analytics and delivery tracking
- React Email template support (if using their SDK directly)
- Generous free tier (100 emails/day)

## Per-Environment Configuration

### Development (Default)

No configuration needed. The default `log` transport prints emails to the console:

```js
// config/mail.js
module.exports.mail = {
  default: process.env.MAIL_MAILER || 'log' // Falls back to 'log'
  // ...
}
```

### Test Environment

Force the `log` transport in tests to prevent accidentally sending real emails:

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

This overrides any `MAIL_MAILER` environment variable during tests.

### Production

Set environment variables on your hosting platform. The `config/mail.js` file reads them automatically via `process.env`:

```bash
# .env or hosting platform environment variables
MAIL_MAILER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.myapp.com
SMTP_PASS=your-password
```

You can also add production-specific mail overrides in `config/env/production.js`:

```js
// config/env/production.js
module.exports = {
  // ... other production config ...

  // Example: Override from address for production
  mail: {
    from: {
      address: 'noreply@myapp.com',
      name: 'My App'
    }
  }
}
```

### Staging

For staging environments, you might want to use a real transport but with a sandboxed domain:

```bash
MAIL_MAILER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@sandbox123.mailgun.org
SMTP_PASS=your-sandbox-password
```

Mailgun sandbox domains only deliver to verified recipients, preventing accidental emails to real users.

## Local Testing Tools

### Log Transport

The simplest approach -- emails are printed to the Sails console. This is the default behavior:

```
info: -----------------------------------------------------------------
info: Sending email...
info: To: user@example.com
info: Subject: Verify your email
info: -----------------------------------------------------------------
info: [HTML content of the email]
info: -----------------------------------------------------------------
```

Good for verifying that emails are being triggered with the correct data. Not useful for testing visual appearance.

### Mailpit

[Mailpit](https://mailpit.axllent.org/) is a local SMTP server with a web-based email viewer. It catches all outgoing emails and displays them in a UI.

```bash
# Install
brew install mailpit

# Run (SMTP: port 1025, Web UI: port 8025)
mailpit
```

Configure your app to use it:

```bash
MAIL_MAILER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
# No username/password needed for Mailpit
```

Then open `http://localhost:8025` to see emails as they arrive. Mailpit shows the full HTML rendering, plain text version, headers, and raw source.

### Mailtrap

[Mailtrap](https://mailtrap.io/) is a cloud-hosted email testing service. It provides a fake SMTP server that captures emails without delivering them.

```bash
MAIL_MAILER=smtp
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

Sign up at [mailtrap.io](https://mailtrap.io) to get credentials. The free tier includes 100 emails/month. Mailtrap provides additional features like spam score analysis and HTML/CSS compatibility checks.

### Testing Workflow Recommendation

1. **During development**: Use `log` transport (default) for quick iteration
2. **For visual testing**: Use Mailpit locally to preview email rendering
3. **Before deployment**: Use Mailtrap to verify emails look correct across clients
4. **In staging**: Use a sandboxed SMTP domain (e.g., Mailgun sandbox)
5. **In production**: Use a verified SMTP or Resend configuration

## Sender Domain Verification

Before sending production emails, you must verify your sending domain with your email provider. This involves adding DNS records (SPF, DKIM, DMARC) to prove you own the domain.

### SPF Record

Authorizes specific servers to send email on behalf of your domain:

```
Type: TXT
Host: @
Value: v=spf1 include:mailgun.org ~all
```

### DKIM Record

Adds a cryptographic signature to verify email authenticity:

```
Type: TXT
Host: smtp._domainkey
Value: (provided by your email provider)
```

### DMARC Record

Tells receiving servers what to do with emails that fail SPF/DKIM checks:

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@myapp.com
```

Each provider has its own verification flow -- check their documentation for specific DNS records to add.

## Multiple Providers

You can configure multiple providers and switch between them per-email:

```js
// config/mail.js
module.exports.mail = {
  default: process.env.MAIL_MAILER || 'log',
  mailers: {
    smtp: { transport: 'smtp' },
    resend: { transport: 'resend' },
    log: { transport: 'log' }
  },
  from: {
    address: 'hello@myapp.com',
    name: 'My App'
  }
}
```

Send through a specific provider by passing the `mailer` parameter:

```js
// Use default mailer
await sails.helpers.mail.send.with({
  subject: 'Welcome',
  template: 'email-welcome',
  to: user.email,
  templateData: { fullName: user.fullName }
})

// Use a specific mailer (overrides default)
await sails.helpers.mail.send.with({
  subject: 'Important notification',
  template: 'email-notification',
  to: user.email,
  mailer: 'resend',
  templateData: { message: 'Your account was updated.' }
})
```

This is useful for sending through different providers based on email type (e.g., transactional emails via SMTP, marketing via Resend).

## Troubleshooting

### Emails Not Sending in Production

1. Verify `MAIL_MAILER` is set to `smtp` or `resend` (not `log`)
2. Check that all required environment variables are set (`SMTP_HOST`, `SMTP_PORT`, etc.)
3. Confirm your `from` address uses a verified domain
4. Check Sails logs for transport errors

### Emails Going to Spam

1. Verify SPF, DKIM, and DMARC records are properly configured
2. Use a verified sending domain (not a free email address)
3. Ensure the `from` address matches the verified domain
4. Avoid spam trigger words in subject lines

### SMTP Connection Timeouts

1. Verify the SMTP host and port are correct
2. Check if your hosting provider blocks outbound SMTP (port 587 or 465)
3. Some providers (e.g., Railway, Render) block outbound SMTP -- use Resend API instead

### Resend API Errors

1. Verify `RESEND_API_KEY` is set correctly
2. Confirm your sending domain is verified in the Resend dashboard
3. Check the Resend dashboard for delivery logs and error details
