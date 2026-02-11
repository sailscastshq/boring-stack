---
name: transactional-patterns
description: Complete transactional email patterns with controller and template code for verification, password reset, magic links, 2FA codes, and team invitations
metadata:
  tags: transactional, verification, password-reset, magic-link, 2fa, invitation, tokens, security, patterns
---

# Transactional Email Patterns

## Overview

Transactional emails are triggered by user actions -- signing up, resetting a password, logging in with 2FA, accepting a team invitation. Each pattern follows the same structure:

1. **User action** triggers an API request
2. **Controller** generates a token or code, stores it in the database with an expiration, and sends the email
3. **Email template** renders a branded message with a button or code
4. **Verification endpoint** validates the token/code and completes the action

This document covers the five most common transactional email patterns in The Boring JavaScript Stack with complete, working code.

## Pattern 1: Account Verification Email

The signup flow sends a verification email with a unique token. The user clicks the link to verify their email address and activate their account.

### Flow

```
User submits signup form
  -> POST /signup (signup.js)
    -> Generate emailProofToken
    -> Create user with token + expiration
    -> Send email-verify-account
    -> Redirect to /check-email
User clicks link in email
  -> GET /verify-email?token=xxx (verify-email.js)
    -> Find user by token
    -> Check expiration
    -> Set emailStatus = 'verified'
    -> Log user in
    -> Redirect to /dashboard
```

### Controller: Signup

```js
// api/controllers/auth/signup.js
module.exports = {
  friendlyName: 'Register',

  inputs: {
    fullName: {
      type: 'string',
      maxLength: 120,
      required: true
    },
    email: {
      type: 'string',
      isEmail: true,
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    badSignupRequest: {
      responseType: 'badRequest'
    },
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ fullName, email: userEmail, password }) {
    const email = userEmail.toLowerCase()
    const emailProofToken = await sails.helpers.strings.random('url-friendly')

    const signupResult = await sails.helpers.user.signupWithTeam
      .with({
        fullName,
        email,
        password,
        emailProofToken,
        emailProofTokenExpiresAt:
          Date.now() + sails.config.custom.emailProofTokenTTL,
        tosAcceptedByIp: this.req.ip
      })
      .intercept('emailTaken', () => {
        return {
          badSignupRequest: {
            problems: [
              { email: 'An account with this email address already exists.' }
            ]
          }
        }
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

### Controller: Verify Email

```js
// api/controllers/auth/verify-email.js
module.exports = {
  friendlyName: 'Verify email',

  inputs: {
    token: {
      description: 'The verification token from the email.',
      example: 'lyCap0N9i8wKYz7rhrEPog'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidOrExpiredToken: {
      responseType: 'expired'
    }
  },

  fn: async function ({ token }) {
    if (!token) {
      throw 'invalidOrExpiredToken'
    }

    const user = await User.findOne({ emailProofToken: token })

    if (!user || user.emailProofTokenExpiresAt <= Date.now()) {
      throw 'invalidOrExpiredToken'
    }

    if (user.emailStatus === 'unverified') {
      await User.updateOne({ id: user.id }).set({
        emailStatus: 'verified',
        emailProofToken: '',
        emailProofTokenExpiresAt: 0
      })

      this.req.session.userId = user.id

      // Set up team session
      const defaultTeamId = await sails.helpers.user.getDefaultTeam(user.id)
      if (defaultTeamId) {
        await sails.helpers
          .setTeamSession(this.req, user.id, defaultTeamId)
          .tolerate('notFound')
      }

      delete this.req.session.userEmail

      this.req.flash(
        'success',
        'Your email address has been successfully verified!'
      )
      return '/dashboard'
    }
  }
}
```

### Controller: Resend Verification

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

### Token Generation

Use `sails.helpers.strings.random('url-friendly')` to generate URL-safe tokens:

```js
const emailProofToken = await sails.helpers.strings.random('url-friendly')
// Produces something like: 'lyCap0N9i8wKYz7rhrEPog'
```

### Token Expiration

Store expiration as a Unix timestamp (milliseconds). Define TTLs in `config/custom.js`:

```js
// config/custom.js
module.exports.custom = {
  emailProofTokenTTL: 24 * 60 * 60 * 1000 // 24 hours
}
```

Set the expiration when creating the token:

```js
emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL
```

Check it during verification:

```js
if (!user || user.emailProofTokenExpiresAt <= Date.now()) {
  throw 'invalidOrExpiredToken'
}
```

### Clear Token After Use

Always clear the token after successful verification to prevent reuse:

```js
await User.updateOne({ id: user.id }).set({
  emailStatus: 'verified',
  emailProofToken: '',
  emailProofTokenExpiresAt: 0
})
```

## Pattern 2: Password Reset Email

The password reset flow generates a token, emails it to the user, and allows them to set a new password. The key security principle: never reveal whether an email address exists in the system.

### Flow

```
User submits forgot-password form
  -> POST /forgot-password (forgot-password.js)
    -> Look up user by email
    -> If found: generate token, store it, send email
    -> Always redirect to /check-email (same response whether user exists or not)
User clicks link in email
  -> GET /reset-password?token=xxx (view-reset-password.js)
    -> Render reset form
User submits new password
  -> POST /reset-password (reset-password.js)
    -> Find user by token
    -> Check expiration
    -> Update password
    -> Clear token
    -> Log user in
```

### Controller: Forgot Password

```js
// api/controllers/auth/forgot-password.js
module.exports = {
  friendlyName: 'Forgot password',

  description:
    'Send a password recovery notification to the user with the specified email address.',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
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

### Controller: Reset Password

```js
// api/controllers/auth/reset-password.js
module.exports = {
  friendlyName: 'Reset password',

  inputs: {
    token: {
      description: 'The verification token from the email.',
      example: 'lyCap0N9i8wKYz7rhrEPog'
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidOrExpiredToken: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ token, password }) {
    if (!token) {
      this.req.flash(
        'error',
        'The password reset link is invalid or has expired. Please request a new link.'
      )
      throw { invalidOrExpiredToken: '/forgot-password' }
    }

    const user = await User.findOne({ passwordResetToken: token })

    if (!user || user.passwordResetTokenExpiresAt <= Date.now()) {
      this.req.flash(
        'error',
        'The password reset link is invalid or has expired. Please request a new link.'
      )
      throw { invalidOrExpiredToken: '/forgot-password' }
    }

    await User.updateOne({ id: user.id }).set({
      password,
      passwordResetToken: '',
      passwordResetTokenExpiresAt: 0
    })

    this.req.session.userId = user.id
    delete this.req.session.userEmail

    this.req.flash(
      'success',
      'Your password has been successfully reset. Welcome back!'
    )
    return '/dashboard'
  }
}
```

### Security: Silent Failure

The forgot-password action always returns the same response regardless of whether the email exists. This prevents email enumeration attacks:

```js
// CORRECT: same response whether user exists or not
if (user) {
  // ... generate token and send email
}
return `/check-email?email=${encodeURIComponent(email)}&type=password-reset`

// WRONG: reveals whether email exists
if (!user) {
  throw {
    badRequest: { problems: [{ email: 'No account found with this email.' }] }
  }
}
```

## Pattern 3: Magic Link Email

Magic links allow passwordless authentication. The user enters their email, receives a link, and clicks it to sign in. If no account exists, one is created automatically.

### Flow

```
User submits magic link form
  -> POST /request-magic-link (request-magic-link.js)
    -> Rate limit check (2-minute cooldown)
    -> Generate plain token + hashed token
    -> Create user if needed
    -> Store hashed token + expiration
    -> Send email with plain token in URL
    -> Redirect to /check-email
User clicks link in email
  -> GET /magic-link/:token (verify-magic-link.js)
    -> Hash the token from URL
    -> Find user by hashed token
    -> Check expiration and usage
    -> Mark token as used
    -> Log user in
    -> Redirect to dashboard
```

### Controller: Request Magic Link

```js
// api/controllers/auth/request-magic-link.js
module.exports = {
  friendlyName: 'Request magic link',

  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true
    },
    fullName: {
      type: 'string',
      maxLength: 120
    },
    redirectUrl: {
      type: 'string',
      defaultsTo: '/login'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email, fullName, redirectUrl }) {
    const normalizedEmail = email.toLowerCase().trim()
    const now = Date.now()

    // Rate limiting: 2-minute cooldown between requests
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser && existingUser.magicLinkTokenExpiresAt) {
      const timeSinceLastRequest =
        now - (existingUser.magicLinkTokenExpiresAt - 15 * 60 * 1000)
      if (timeSinceLastRequest < 2 * 60 * 1000) {
        throw {
          badRequest: {
            problems: [
              {
                magicLink:
                  'Please wait a moment before requesting another magic link.'
              }
            ]
          }
        }
      }
    }

    // Generate token pair: plain (for URL) + hashed (for database)
    const plainToken = await sails.helpers.magicLink.generateToken()
    const hashedToken = await sails.helpers.magicLink.hashToken(plainToken)
    const expiresAt = now + 15 * 60 * 1000 // 15 minutes

    let user = await User.findOne({ email: normalizedEmail })

    // Check if previous token is still valid
    if (
      user &&
      user.magicLinkToken &&
      !user.magicLinkTokenUsedAt &&
      user.magicLinkTokenExpiresAt > Date.now()
    ) {
      this.req.flash('message', 'Magic link already sent. Check your email.')
      return redirectUrl
    }

    // Create user if they don't exist
    if (!user) {
      const defaultFullName = fullName || normalizedEmail.split('@')[0]
      const signupResult = await sails.helpers.user.signupWithTeam.with({
        fullName: defaultFullName,
        email: normalizedEmail,
        tosAcceptedByIp: this.req.ip
      })
      user = signupResult.user

      await User.updateOne({ id: user.id }).set({
        emailStatus: 'verified',
        magicLinkToken: hashedToken,
        magicLinkTokenExpiresAt: expiresAt,
        magicLinkTokenUsedAt: null
      })
    } else {
      await User.updateOne({ id: user.id }).set({
        magicLinkToken: hashedToken,
        magicLinkTokenExpiresAt: expiresAt,
        magicLinkTokenUsedAt: null
      })
    }

    // Send email with the PLAIN token (not hashed)
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

    return `/check-email?type=magic-link&email=${encodeURIComponent(
      normalizedEmail
    )}`
  }
}
```

### Token Hashing

Magic links use a token pair for security:

- **Plain token** -- sent in the email URL, never stored in the database
- **Hashed token** -- stored in the database, used for lookup

This means even if the database is compromised, the attacker cannot reconstruct valid magic link URLs.

```js
// Generate a URL-safe random token
const plainToken = await sails.helpers.magicLink.generateToken()

// Hash it for storage
const hashedToken = await sails.helpers.magicLink.hashToken(plainToken)

// Store the HASHED token
await User.updateOne({ id: user.id }).set({
  magicLinkToken: hashedToken
})

// Send the PLAIN token in the email
templateData: {
  magicLinkUrl: `${sails.config.custom.baseUrl}/magic-link/${plainToken}`
}
```

### Verification

```js
// api/controllers/auth/verify-magic-link.js
module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: { responseType: 'redirect' },
    invalid: { responseType: 'redirect' }
  },

  fn: async function ({ token }) {
    const result = await sails.helpers.magicLink
      .validateToken(token)
      .intercept('invalid', () => {
        this.req.flash(
          'error',
          'This magic link is invalid, expired, or has already been used. Please request a new one.'
        )
        return { invalid: '/login' }
      })

    const { user } = result

    // Mark token as used (prevents reuse)
    await User.updateOne({ id: user.id }).set({
      magicLinkTokenUsedAt: Date.now()
    })

    this.req.session.userId = user.id

    const defaultTeamId = await sails.helpers.user.getDefaultTeam(user.id)
    if (defaultTeamId) {
      await sails.helpers
        .setTeamSession(this.req, user.id, defaultTeamId)
        .tolerate('notFound')
    }

    return '/dashboard'
  }
}
```

### Rate Limiting

Magic links implement a simple rate limit to prevent abuse. The controller checks how long ago the last magic link was requested and enforces a cooldown:

```js
// 2-minute cooldown between requests for the same email
const timeSinceLastRequest =
  now - (existingUser.magicLinkTokenExpiresAt - 15 * 60 * 1000)
if (timeSinceLastRequest < 2 * 60 * 1000) {
  throw {
    badRequest: {
      problems: [
        {
          magicLink:
            'Please wait a moment before requesting another magic link.'
        }
      ]
    }
  }
}
```

This calculates when the last token was created by subtracting the TTL from the expiration timestamp, then checking if fewer than 2 minutes have elapsed.

## Pattern 4: 2FA Verification Code Email

Two-factor authentication via email sends a 6-digit numeric code. The user enters the code on a verification page to complete login.

### Flow

```
User logs in with password
  -> POST /login (login.js)
    -> Verify credentials
    -> If 2FA enabled: create partial login session
    -> Redirect to /verify-2fa
User requests email 2FA code
  -> POST /send-login-email-2fa (send-login-email-2fa.js)
    -> Verify partial login session exists
    -> Generate 6-digit code
    -> Store code + expiration on user
    -> Send email with code
    -> Redirect to /verify-2fa
User enters code
  -> POST /verify-2fa (verify-2fa.js)
    -> Check code matches + not expired
    -> Complete login
    -> Redirect to /dashboard
```

### Controller: Send 2FA Email Code

```js
// api/controllers/auth/send-login-email-2fa.js
module.exports = {
  friendlyName: 'Send login email 2FA',
  description: 'Send verification code via email during login process.',

  inputs: {},

  exits: {
    success: { responseType: 'redirect' },
    unauthorized: { responseType: 'unauthorized' },
    serverError: { responseType: 'serverError' }
  },

  fn: async function () {
    // Verify partial login session exists
    if (!this.req.session.partialLogin) {
      throw 'unauthorized'
    }

    const partialLogin = this.req.session.partialLogin

    // Check if partial login session has expired (10-minute window)
    if (Date.now() - partialLogin.loginTimestamp > 10 * 60 * 1000) {
      delete this.req.session.partialLogin
      delete this.req.session.twoFactorMethods
      throw { unauthorized: '/login' }
    }

    const user = await User.findOne({ id: partialLogin.userId })

    // Generate 6-digit numeric code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store code on user record
    await User.updateOne({ id: user.id }).set({
      twoFactorVerificationCode: verificationCode,
      twoFactorVerificationCodeExpiresAt: expiresAt
    })

    // Send the code via email
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

    return '/verify-2fa'
  }
}
```

### Code Generation

6-digit numeric codes are generated with `Math.random()`:

```js
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
// Produces: '123456', '987654', '000123', etc.
```

This always produces a 6-digit string (100000-999999). The code is stored as a string to preserve leading zeros.

### Template Data for 2FA

2FA emails include contextual information so users can verify the login attempt is legitimate:

```js
templateData: {
  fullName: user.fullName,
  verificationCode: verificationCode,
  userAgent: this.req.get('User-Agent'),  // Browser/device info
  ipAddress: this.req.ip                   // IP address of requester
}
```

The template displays this information:

```ejs
<p style="margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.5;">
  Time: <%= new Date().toLocaleString('en-US', { timeZone: 'UTC' }) %> UTC<br>
  Browser: <%= userAgent || 'Unknown' %><br>
  IP Address: <%= ipAddress || 'Unknown' %>
</p>
```

### Partial Login Session

2FA requires a "partial login" session -- the user has verified their password but has not completed 2FA yet. This session contains the user ID and a timestamp:

```js
// In the login controller, after password verification:
this.req.session.partialLogin = {
  userId: user.id,
  loginTimestamp: Date.now()
}
```

The 2FA controller checks this session exists and has not expired:

```js
if (!this.req.session.partialLogin) {
  throw 'unauthorized'
}

if (Date.now() - partialLogin.loginTimestamp > 10 * 60 * 1000) {
  delete this.req.session.partialLogin
  throw { unauthorized: '/login' }
}
```

## Pattern 5: Team Invitation Email

Team invitations send a personalized email with a link to join a team. The invitation includes the inviter's name, team name, and an expiration period.

### Flow

```
Team admin submits invite form with email addresses
  -> POST /team/send-email-invite (send-email-invite.js)
    -> Validate emails (format, domain restrictions, existing members)
    -> Check team member limit (subscription plan)
    -> For each email:
      -> Create Invite record with token + expiration
      -> Send email-team-invitation
    -> Flash success message
    -> Redirect to /settings/team
Invitee clicks link in email
  -> GET /team/:token (view-invite.js)
    -> Look up invite by token
    -> Show accept/decline page
Invitee accepts
  -> POST /team/handle-invite (handle-invite.js)
    -> Create user if needed
    -> Create membership
    -> Mark invite as accepted
```

### Controller: Send Team Invitations

```js
// api/controllers/team/send-email-invite.js
module.exports = {
  friendlyName: 'Send email invitations',
  description: 'Send email invitations for multiple people to join the team',

  inputs: {
    emails: {
      type: ['string'],
      required: true,
      description: 'Array of email addresses to send invitations to'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidEmails: {
      responseType: 'badRequest'
    },
    memberLimitReached: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ emails }) {
    const loggedInUser = this.req.session.userId
    const teamId = this.req.session.teamId

    const team = await Team.findOne({ id: teamId })
    if (!team) {
      throw 'notFound'
    }

    // Check subscription limits
    const subscriptionInfo = await sails.helpers.subscription.checkPlan(teamId)
    const potentialNewMembers = subscriptionInfo.memberCount + emails.length

    if (
      !subscriptionInfo.canAddMembers ||
      (subscriptionInfo.memberLimit !== 'unlimited' &&
        potentialNewMembers > subscriptionInfo.memberLimit)
    ) {
      throw {
        memberLimitReached: {
          problems: [
            {
              emails: `Team member limit reached. Upgrade your plan to add more members.`
            }
          ]
        }
      }
    }

    // Validate all emails first
    const problems = []
    for (const email of emails) {
      const normalizedEmail = email.toLowerCase().trim()

      if (
        !normalizedEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ) {
        problems.push(`${email} is not a valid email address`)
        continue
      }

      // Check domain restrictions
      if (team.domainRestrictions && team.domainRestrictions.length > 0) {
        const emailDomain = normalizedEmail.split('@')[1].toLowerCase()
        const allowedDomains = team.domainRestrictions.map((d) =>
          d.toLowerCase()
        )
        if (!allowedDomains.includes(emailDomain)) {
          problems.push(`${email} domain is not allowed to join this team`)
          continue
        }
      }

      // Check if already a member
      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser) {
        const existingMembership = await Membership.findOne({
          member: existingUser.id,
          team: teamId
        })
        if (existingMembership) {
          problems.push(`${email} is already a team member`)
          continue
        }
      }

      // Check for pending invite
      const existingInvite = await Invite.findOne({
        team: teamId,
        email: normalizedEmail,
        status: 'pending',
        expiresAt: { '>': Date.now() }
      })
      if (existingInvite) {
        problems.push(`${email} already has a pending invitation`)
        continue
      }
    }

    if (problems.length > 0) {
      throw {
        invalidEmails: { problems: [{ emails: problems.join(', ') }] }
      }
    }

    // Send invitations
    const validEmails = emails.map((e) => e.toLowerCase().trim())
    const invites = []
    const inviterUser = await User.findOne({ id: loggedInUser })
    const expirationDays = Math.ceil(
      sails.config.custom.invitationExpiresTTL / (1000 * 60 * 60 * 24)
    )

    for (const email of validEmails) {
      const invite = await Invite.create({
        team: teamId,
        email: email,
        invitedBy: loggedInUser,
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
          email: email,
          inviteUrl: inviteUrl,
          expirationDays: expirationDays
        },
        to: email,
        subject: `You're invited to join ${team.name} on Ascent`
      })

      sails.log.info(`Team invitation sent to ${email} for team ${team.name}`)
      invites.push(invite)
    }

    const sentCount = invites.length
    const message =
      sentCount === 1
        ? `Invitation sent to ${validEmails[0]}`
        : `${sentCount} invitations sent successfully`

    this.req.flash('success', message)
    return '/settings/team'
  }
}
```

### Invitation Expiration

Team invitations use a longer TTL than verification tokens (7 days vs 24 hours):

```js
// config/custom.js
invitationExpiresTTL: 7 * 24 * 60 * 60 * 1000,  // 7 days
```

The human-readable expiration is calculated for the template:

```js
const expirationDays = Math.ceil(
  sails.config.custom.invitationExpiresTTL / (1000 * 60 * 60 * 24)
)
// expirationDays = 7
```

### Batch Validation

Team invitations validate all emails before sending any invitations. If any email is invalid, the entire batch is rejected:

```js
// Validate all first
const problems = []
for (const email of emails) {
  // ... check each email, push to problems[]
}

// Only proceed if all valid
if (problems.length > 0) {
  throw { invalidEmails: { problems: [{ emails: problems.join(', ') }] } }
}

// Then send all
for (const email of validEmails) {
  // ... create invite and send email
}
```

## Security Best Practices

### Token Generation

Always use `sails.helpers.strings.random('url-friendly')` for tokens. This produces cryptographically random, URL-safe strings:

```js
const token = await sails.helpers.strings.random('url-friendly')
// 'lyCap0N9i8wKYz7rhrEPog'
```

### Single-Use Tokens

Clear tokens after use to prevent replay attacks:

```js
// After successful verification
await User.updateOne({ id: user.id }).set({
  emailProofToken: '',
  emailProofTokenExpiresAt: 0
})

// For magic links: mark as used
await User.updateOne({ id: user.id }).set({
  magicLinkTokenUsedAt: Date.now()
})
```

### Expiration Checks

Always check both the token's existence and expiration:

```js
const user = await User.findOne({ passwordResetToken: token })

// Check both conditions
if (!user || user.passwordResetTokenExpiresAt <= Date.now()) {
  throw 'invalidOrExpiredToken'
}
```

### Email Enumeration Prevention

For any endpoint that accepts an email address (forgot password, magic link), never reveal whether the email exists:

```js
// CORRECT: Same response regardless
const user = await User.findOne({ email })
if (user) {
  // ... send email
}
return '/check-email' // Always the same redirect

// WRONG: Different response reveals email existence
if (!user) {
  throw { badRequest: { problems: [{ email: 'Email not found' }] } }
}
```

### Error Logging

Always log the actual error before returning a user-friendly message:

```js
.intercept((error) => {
  sails.log.error('Error sending magic link email:', error)  // Log the real error
  return {
    badRequest: {
      problems: [{ magicLink: 'Failed to send magic link email' }]  // User sees this
    }
  }
})
```

## Config Reference

All token TTLs are defined in `config/custom.js`:

```js
// config/custom.js
module.exports.custom = {
  baseUrl: 'http://localhost:1337',

  // Token expirations
  emailProofTokenTTL: 24 * 60 * 60 * 1000, // 24 hours
  passwordResetTokenTTL: 24 * 60 * 60 * 1000, // 24 hours
  invitationExpiresTTL: 7 * 24 * 60 * 60 * 1000 // 7 days
  // Magic link: 15 minutes (hardcoded in controller)
  // 2FA code: 10 minutes (hardcoded in controller)
}
```

Update `baseUrl` in production so email links point to the correct domain:

```js
// config/env/production.js or environment variable
custom: {
  baseUrl: 'https://myapp.com'
}
```
