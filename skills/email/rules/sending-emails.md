---
name: sending-emails
description: sails.helpers.mail.send API, parameters, error handling, async patterns, and complete sending examples
metadata:
  tags: send, helper, api, parameters, error-handling, intercept, tolerate, async, recipients
---

# Sending Emails

## The `sails.helpers.mail.send` API

All emails in The Boring JavaScript Stack are sent through a single helper: `sails.helpers.mail.send`. This helper is automatically registered by `sails-hook-mail` when the app lifts.

### Basic Usage

```js
await sails.helpers.mail.send.with({
  subject: 'Verify your email',
  template: 'email-verify-account',
  to: 'user@example.com',
  templateData: {
    token: 'abc123',
    fullName: 'Jane Doe'
  }
})
```

This renders the EJS template at `views/emails/email-verify-account.ejs`, wraps it in the shared layout at `views/layouts/layout-email.ejs`, and sends it via the default mailer configured in `config/mail.js`.

## Parameters

### Required Parameters

| Parameter  | Type     | Description                                                       |
| ---------- | -------- | ----------------------------------------------------------------- |
| `subject`  | `string` | The email subject line                                            |
| `template` | `string` | Name of the EJS template file in `views/emails/` (without `.ejs`) |
| `to`       | `string` | Recipient email address                                           |

### Optional Parameters

| Parameter      | Type     | Description                                            |
| -------------- | -------- | ------------------------------------------------------ |
| `templateData` | `object` | Variables available inside the EJS template            |
| `from`         | `object` | Override the global from address (`{ address, name }`) |
| `mailer`       | `string` | Use a specific mailer instead of the default           |

### `subject`

The email subject line. This is what recipients see in their inbox:

```js
subject: 'Verify your email'
subject: 'Password reset instructions'
subject: `You're invited to join ${team.name} on Ascent`
```

Dynamic subjects using template literals are common for personalized emails.

### `template`

The name of the EJS template file in `views/emails/`, without the `.ejs` extension. The naming convention is `email-{purpose}`:

```js
template: 'email-verify-account' // views/emails/email-verify-account.ejs
template: 'email-reset-password' // views/emails/email-reset-password.ejs
template: 'email-magic-link' // views/emails/email-magic-link.ejs
template: 'email-2fa-login-verification' // views/emails/email-2fa-login-verification.ejs
template: 'email-team-invitation' // views/emails/email-team-invitation.ejs
```

### `to`

The recipient email address. Always a single string:

```js
to: user.email
to: 'admin@myapp.com'
to: normalizedEmail
```

### `templateData`

An object whose keys become variables available in the EJS template. Only the data you explicitly pass is available -- templates do not automatically have access to request data or user sessions.

```js
templateData: {
  fullName: user.fullName,
  token: user.emailProofToken,
  verificationCode: '123456',
  teamName: team.name,
  inviteUrl: `${sails.config.custom.baseUrl}/team/${invite.token}`
}
```

In the template, access these as top-level variables:

```ejs
<p>Hi <strong><%= fullName %></strong>, welcome!</p>
<a href="<%= inviteUrl %>">Join Team</a>
```

Note: `sails` is automatically available in EJS templates, so you can reference `sails.config.custom.baseUrl` and other Sails globals directly in templates without passing them through `templateData`.

### `from` (Optional Override)

Override the global `from` address for a specific email:

```js
await sails.helpers.mail.send.with({
  subject: 'Support ticket received',
  template: 'email-support-confirmation',
  to: user.email,
  from: {
    address: 'support@myapp.com',
    name: 'My App Support'
  },
  templateData: { ticketId: ticket.id }
})
```

If omitted, the `from` address from `config/mail.js` is used.

### `mailer` (Optional)

Send through a specific mailer instead of the default:

```js
// Use the 'resend' mailer even if default is 'smtp'
await sails.helpers.mail.send.with({
  subject: 'Important notification',
  template: 'email-notification',
  to: user.email,
  mailer: 'resend',
  templateData: { message: 'Your account was updated.' }
})
```

## Calling Conventions

Sails helpers support multiple calling styles. For `sails.helpers.mail.send`, always use `.with()` since there are multiple named parameters:

### `.with()` -- Named Parameters (Recommended)

```js
await sails.helpers.mail.send.with({
  subject: 'Welcome!',
  template: 'email-verify-account',
  to: user.email,
  templateData: { fullName: user.fullName, token }
})
```

This is the standard pattern used throughout The Boring JavaScript Stack.

## Error Handling

### `.intercept()` -- Catch and Transform Errors

Use `.intercept()` to catch errors from the mail helper and transform them into meaningful responses. This is the most common pattern:

```js
// api/controllers/auth/request-magic-link.js
await sails.helpers.mail.send
  .with({
    subject: 'Your magic link to sign in',
    template: 'email-magic-link',
    to: normalizedEmail,
    templateData: {
      token: plainToken,
      fullName: user.fullName,
      email: normalizedEmail,
      magicLinkUrl: `${sails.config.custom.baseUrl}/magic-link/${plainToken}`
    }
  })
  .intercept((error) => {
    sails.log.error('Error sending magic link email:', error)
    return {
      badRequest: {
        problems: [{ magicLink: 'Failed to send magic link email' }]
      }
    }
  })
```

The `.intercept()` callback receives the error and returns a new value that gets thrown as the exit. In this example, it converts a mail error into a `badRequest` exit with validation-style problems.

### `.intercept()` with Exit Name

Intercept and redirect to a specific exit:

```js
// api/controllers/auth/send-login-email-2fa.js
await sails.helpers.mail.send
  .with({
    to: user.email,
    subject: 'Login Verification Code',
    template: 'email-2fa-login-verification',
    templateData: {
      fullName: user.fullName,
      verificationCode: verificationCode,
      userAgent: this.req.get('User-Agent'),
      ipAddress: this.req.ip
    }
  })
  .intercept((err) => {
    sails.log.error('Failed to send login 2FA email:', err)
    return 'serverError'
  })
```

### `.tolerate()` -- Suppress Errors

Use `.tolerate()` when email failure should not break the user flow. This is useful for non-critical notifications:

```js
// Send a welcome email, but don't fail the signup if it doesn't send
await sails.helpers.mail.send
  .with({
    subject: 'Welcome to our app!',
    template: 'email-welcome',
    to: user.email,
    templateData: { fullName: user.fullName }
  })
  .tolerate((err) => {
    sails.log.warn('Failed to send welcome email:', err)
  })
```

With `.tolerate()`, the helper returns `undefined` instead of throwing if an error occurs. The callback is optional -- without it, errors are silently swallowed.

### No Error Handling (Let It Throw)

If you want email failures to bubble up and cause a 500 error, simply `await` without `.intercept()` or `.tolerate()`:

```js
// If this email fails, the action will throw a 500
await sails.helpers.mail.send.with({
  subject: 'Verify your email',
  template: 'email-verify-account',
  to: user.email,
  templateData: { token, fullName: user.fullName }
})
```

This is appropriate for critical emails where failure should halt the operation (e.g., account verification during signup).

## Common Sending Patterns

### Pattern 1: Send After Creating a Record

The most common pattern -- create or update a database record, then send an email with data from that record:

```js
// api/controllers/auth/signup.js
module.exports = {
  inputs: {
    fullName: { type: 'string', required: true },
    email: { type: 'string', isEmail: true, required: true },
    password: { type: 'string', required: true, minLength: 8 }
  },

  exits: {
    success: { responseType: 'redirect' }
  },

  fn: async function ({ fullName, email: userEmail, password }) {
    const email = userEmail.toLowerCase()
    const emailProofToken = await sails.helpers.strings.random('url-friendly')

    const signupResult = await sails.helpers.user.signupWithTeam.with({
      fullName,
      email,
      password,
      emailProofToken,
      emailProofTokenExpiresAt:
        Date.now() + sails.config.custom.emailProofTokenTTL,
      tosAcceptedByIp: this.req.ip
    })

    const unverifiedUser = signupResult.user

    await sails.helpers.mail.send.with({
      subject: 'Verify your email',
      template: 'email-verify-account',
      to: unverifiedUser.email,
      templateData: {
        token: unverifiedUser.emailProofToken,
        fullName: unverifiedUser.fullName
      }
    })

    this.req.session.userEmail = unverifiedUser.email
    return '/check-email'
  }
}
```

### Pattern 2: Silent Failure for Security

For password reset and similar flows, never reveal whether an email address exists in the system. Always return success, and only send the email if a user is found:

```js
// api/controllers/auth/forgot-password.js
module.exports = {
  inputs: {
    email: { type: 'string', required: true, isEmail: true }
  },

  exits: {
    success: { responseType: 'redirect' }
  },

  fn: async function ({ email }) {
    const user = await User.findOne({ email })

    if (user) {
      const token = await sails.helpers.strings.random('url-friendly')

      await User.updateOne({ id: user.id }).set({
        passwordResetToken: token,
        passwordResetTokenExpiresAt:
          Date.now() + sails.config.custom.passwordResetTokenTTL
      })

      await sails.helpers.mail.send.with({
        to: user.email,
        subject: 'Password reset instructions',
        template: 'email-reset-password',
        templateData: {
          fullName: user.fullName,
          token
        }
      })
    }

    // Always redirect the same way -- never reveal if the email exists
    return `/check-email?email=${encodeURIComponent(email)}&type=password-reset`
  }
}
```

### Pattern 3: Send with Rate Limiting

Prevent abuse by checking for recent sends before sending again:

```js
// api/controllers/auth/request-magic-link.js (simplified)
fn: async function ({ email }) {
  const normalizedEmail = email.toLowerCase().trim()
  const now = Date.now()

  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser && existingUser.magicLinkTokenExpiresAt) {
    const timeSinceLastRequest =
      now - (existingUser.magicLinkTokenExpiresAt - 15 * 60 * 1000)
    if (timeSinceLastRequest < 2 * 60 * 1000) {
      throw {
        badRequest: {
          problems: [{
            magicLink: 'Please wait a moment before requesting another magic link.'
          }]
        }
      }
    }
  }

  // ... generate token, send email
}
```

### Pattern 4: Send to Multiple Recipients in a Loop

When sending individual emails to multiple recipients (e.g., team invitations), iterate and send one at a time:

```js
// api/controllers/team/send-email-invite.js (simplified)
fn: async function ({ emails }) {
  const inviterUser = await User.findOne({ id: this.req.session.userId })
  const team = await Team.findOne({ id: this.req.session.teamId })
  const expirationDays = Math.ceil(
    sails.config.custom.invitationExpiresTTL / (1000 * 60 * 60 * 24)
  )

  for (const email of emails) {
    const normalizedEmail = email.toLowerCase().trim()

    const invite = await Invite.create({
      team: team.id,
      email: normalizedEmail,
      invitedBy: inviterUser.id,
      via: 'email',
      token: sails.helpers.strings.random('url-friendly'),
      expiresAt: Date.now() + sails.config.custom.invitationExpiresTTL
    }).fetch()

    const inviteUrl = `${sails.config.custom.baseUrl}/team/${invite.token}`

    await sails.helpers.mail.send.with({
      template: 'email-team-invitation',
      templateData: {
        teamName: team.name,
        inviterName: inviterUser.fullName,
        email: normalizedEmail,
        inviteUrl,
        expirationDays
      },
      to: normalizedEmail,
      subject: `You're invited to join ${team.name} on Ascent`
    })
  }

  this.req.flash('success', `${emails.length} invitations sent successfully`)
  return '/settings/team'
}
```

### Pattern 5: Resend a Previously Sent Email

Regenerate a token and resend an email (e.g., resend verification link):

```js
// api/controllers/auth/resend-link.js
module.exports = {
  exits: {
    success: { responseType: 'redirect' }
  },

  fn: async function () {
    const userExists = await User.count({ email: this.req.session.userEmail })
    if (!userExists) {
      return '/check-email'
    }

    const unverifiedUser = await User.updateOne({
      email: this.req.session.userEmail
    }).set({
      emailStatus: 'unverified',
      emailProofToken: sails.helpers.strings.random('url-friendly'),
      emailProofTokenExpiresAt:
        Date.now() + sails.config.custom.emailProofTokenTTL
    })

    await sails.helpers.mail.send.with({
      subject: 'Verify your email',
      template: 'email-verify-account',
      to: unverifiedUser.email,
      templateData: {
        token: unverifiedUser.emailProofToken,
        fullName: unverifiedUser.fullName
      }
    })

    this.req.flash(
      'success',
      'Verification email has been resent to your inbox.'
    )
    return '/check-email'
  }
}
```

### Pattern 6: Send with Context Data (2FA)

Pass request-level context (IP address, user agent) for security emails:

```js
// api/controllers/auth/send-login-email-2fa.js
await sails.helpers.mail.send
  .with({
    to: user.email,
    subject: 'Login Verification Code',
    template: 'email-2fa-login-verification',
    templateData: {
      fullName: user.fullName,
      verificationCode: verificationCode,
      userAgent: this.req.get('User-Agent'),
      ipAddress: this.req.ip
    }
  })
  .intercept((err) => {
    sails.log.error('Failed to send login 2FA email:', err)
    return 'serverError'
  })
```

## Sending from Helpers and Scripts

The `sails.helpers.mail.send` helper is not limited to controllers. It can be called from anywhere that has access to the `sails` global.

### From a Custom Helper

```js
// api/helpers/notify-admin.js
module.exports = {
  friendlyName: 'Notify admin',
  inputs: {
    subject: { type: 'string', required: true },
    message: { type: 'string', required: true }
  },
  fn: async function ({ subject, message }) {
    await sails.helpers.mail.send.with({
      subject,
      template: 'email-admin-notification',
      to: sails.config.custom.internalEmail,
      templateData: { message }
    })
  }
}
```

### From a Shell Script

```js
// scripts/send-weekly-digest.js
module.exports = {
  fn: async function () {
    const users = await User.find({ weeklyDigest: true })

    for (const user of users) {
      await sails.helpers.mail.send
        .with({
          subject: 'Your weekly digest',
          template: 'email-weekly-digest',
          to: user.email,
          templateData: {
            fullName: user.fullName
            // ... digest data
          }
        })
        .tolerate((err) => {
          sails.log.warn(`Failed to send digest to ${user.email}:`, err)
        })
    }

    sails.log.info(`Weekly digest sent to ${users.length} users`)
  }
}
```

Run the script with:

```bash
sails run send-weekly-digest
```

## Important Notes

- **Always `await`** -- `sails.helpers.mail.send` is asynchronous. Forgetting `await` means the email may not send before the response is returned.
- **Use `.with()`** -- Since the helper has multiple named parameters, always use `.with({...})` syntax.
- **Log errors** -- Always log the error in `.intercept()` callbacks before returning a user-facing message. The original error message from the transport may contain useful debugging information.
- **Normalize emails** -- Always lowercase and trim email addresses before sending: `email.toLowerCase().trim()`.
- **Sender verification** -- In production, your `from` address must be verified with your email provider. Unverified sender addresses will cause delivery failures.
