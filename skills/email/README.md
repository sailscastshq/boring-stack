# Email Skills for Claude Code

Send transactional emails from The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/email
```

## Usage

After installing, Claude will automatically apply email best practices when you work on mail-related code:

> "Send a welcome email after user signup"

> "Create an email template for password reset"

> "Configure Resend as the email provider for production"

> "Add a team invitation email with an expiring link"

## Skills Included

- **getting-started** - Sails Mail overview, config/mail.js, transports
- **sending-emails** - sails.helpers.mail.send API and patterns
- **templates** - EJS email templates, shared layout, template variables
- **providers** - SMTP, Resend, environment-based configuration
- **transactional-patterns** - Verification, password reset, magic links, 2FA codes, invitations

## What is Sails Mail?

[sails-hook-mail](https://docs.sailscasts.com/mail) is a Sails.js hook that provides a unified API for sending emails through multiple transports. It supports SMTP (Mailgun, SendGrid, AWS SES), Resend, and a log transport for development.

## Links

- [Sails Mail Documentation](https://docs.sailscasts.com/mail)
- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [Resend](https://resend.com)

## License

MIT
