---
name: email
description: >
  Email sending patterns for The Boring JavaScript Stack — sails-hook-mail configuration, EJS templates,
  SMTP/Resend transports, and transactional email patterns. Use this skill when configuring mail, writing
  email templates, or sending transactional emails in a Sails.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: email, mail, smtp, resend, templates, ejs, transactional, boring-stack
---

# Email

The Boring JavaScript Stack uses `sails-hook-mail` for email delivery. It provides a simple API for sending emails through configurable transports (SMTP, Resend, log) with EJS-based templates and a shared layout system.

## When to Use

Use this skill when:

- Configuring `sails-hook-mail` in `config/mail.js` (transports, from address, mailers)
- Writing EJS email templates in `views/emails/`
- Using the shared email layout (`views/layouts/layout-email.ejs`)
- Sending emails via `sails.helpers.mail.send.with()`
- Setting up SMTP providers (Mailgun, SendGrid, AWS SES) or Resend
- Implementing transactional email patterns (verification, password reset, magic links, 2FA codes)
- Switching between log transport (development) and real transports (production)

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - Sails Mail overview, config/mail.js, transports, from address
- [rules/sending-emails.md](rules/sending-emails.md) - sails.helpers.mail.send API, parameters, error handling, async patterns
- [rules/templates.md](rules/templates.md) - EJS email templates, layout-email.ejs, template variables, examples
- [rules/providers.md](rules/providers.md) - SMTP config, Resend config, environment variables, per-environment setup
- [rules/transactional-patterns.md](rules/transactional-patterns.md) - Common patterns: verification, password reset, magic link, 2FA, invitations
