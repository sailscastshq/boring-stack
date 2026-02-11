---
name: two-factor
description: Two-factor authentication - TOTP with speakeasy, email 2FA codes, backup codes, partial login session, setup and verification flows
metadata:
  tags: 2fa, totp, speakeasy, qrcode, backup-codes, email-2fa, partial-login, two-factor, mfa
---

# Two-Factor Authentication

## Overview

The Boring Stack supports three second-factor methods:

1. **TOTP** -- Time-based one-time passwords via authenticator apps (Google Authenticator, Authy, 1Password)
2. **Email 2FA** -- 6-digit codes sent to the user's email
3. **Backup codes** -- 8-character emergency codes for when other methods are unavailable

All three methods share the same verification action (`auth/verify-2fa`) and the same partial login session pattern. When any 2FA method is enabled on a user's account, password login creates a partial login instead of a full login.

## Libraries

```json
{
  "dependencies": {
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.0"
  }
}
```

- **speakeasy** -- TOTP secret generation and code verification
- **qrcode** -- Generate QR codes for authenticator app scanning

## The Partial Login Session

When a user with 2FA enabled logs in with their password, the login action does **not** set `req.session.userId`. Instead, it creates a partial login:

```js
// In api/controllers/auth/login.js, after password verified:
if (user.twoFactorEnabled) {
  this.req.session.partialLogin = {
    userId: user.id,
    createdAt: Date.now()
  }
  return '/auth/two-factor'
}
```

The `has-partially-logged-in` policy guards the 2FA verification page:

```js
// api/policies/has-partially-logged-in.js
module.exports = async function (req, res, proceed) {
  if (req.session.partialLogin && req.session.partialLogin.userId) {
    // Check 10-minute timeout
    const elapsed = Date.now() - req.session.partialLogin.createdAt
    if (elapsed > 10 * 60 * 1000) {
      delete req.session.partialLogin
      return res.redirect('/login')
    }
    return proceed()
  }
  return res.redirect('/login')
}
```

### Session Timeout

The partial login session has a **10-minute timeout**. If the user takes too long to enter their 2FA code, the session is cleared and they must log in again. This limits the window for session hijacking attacks.

## TOTP Setup

### Step 1: Generate Secret

```js
// api/helpers/totp/generate-secret.js
const speakeasy = require('speakeasy')

module.exports = {
  inputs: {
    email: {
      type: 'string',
      required: true
    }
  },

  fn: async function ({ email }) {
    const secret = speakeasy.generateSecret({
      name: `${sails.config.custom.appName || 'MyApp'} (${email})`,
      issuer: sails.config.custom.appName || 'MyApp',
      length: 20
    })

    return {
      base32: secret.base32,
      otpauthUrl: secret.otpauth_url
    }
  }
}
```

### Step 2: Generate QR Code

```js
// api/helpers/totp/generate-qr-code.js
const QRCode = require('qrcode')

module.exports = {
  inputs: {
    otpauthUrl: {
      type: 'string',
      required: true
    }
  },

  fn: async function ({ otpauthUrl }) {
    // Generate as data URL for embedding in <img> tags
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)
    return qrCodeDataUrl
  }
}
```

### Setup Controller

```js
// api/controllers/security/setup-totp.js
module.exports = {
  exits: {
    success: {
      responseType: '' // Returns JSON
    }
  },

  fn: async function () {
    const user = await User.findOne({ id: this.req.session.userId })

    // Generate secret
    const secret = await sails.helpers.totp.generateSecret(user.email)

    // Generate QR code
    const qrCode = await sails.helpers.totp.generateQrCode(secret.otpauthUrl)

    // Temporarily store the secret (not yet enabled until verified)
    await User.updateOne({ id: user.id }).set({
      totpSecret: secret.base32
    })

    return {
      qrCode, // Data URL for <img src={qrCode} />
      secret: secret.base32, // Manual entry fallback
      otpauthUrl: secret.otpauthUrl
    }
  }
}
```

### Verify TOTP Setup

The user must enter a valid code from their authenticator app to confirm the setup:

```js
// api/controllers/security/verify-totp-setup.js
module.exports = {
  inputs: {
    code: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidCode: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ code }) {
    const user = await User.findOne({ id: this.req.session.userId })

    if (!user.totpSecret) {
      throw {
        invalidCode: {
          problems: [
            { form: 'TOTP has not been set up. Start the setup process first.' }
          ]
        }
      }
    }

    // Verify the code
    const isValid = await sails.helpers.totp.verify.with({
      secret: user.totpSecret,
      token: code
    })

    if (!isValid) {
      throw {
        invalidCode: {
          problems: [{ code: 'Invalid verification code. Please try again.' }]
        }
      }
    }

    // Enable TOTP and 2FA
    await User.updateOne({ id: user.id }).set({
      totpEnabled: true,
      twoFactorEnabled: true
    })

    // Generate backup codes if none exist
    if (!user.backupCodes || user.backupCodes.length === 0) {
      const backupCodes = []
      for (let i = 0; i < 10; i++) {
        backupCodes.push(
          await sails.helpers.strings.random('url-friendly').meta({ len: 8 })
        )
      }
      await User.updateOne({ id: user.id }).set({ backupCodes })
    }

    return '/settings/security'
  }
}
```

## TOTP Verification Helper

```js
// api/helpers/totp/verify.js
const speakeasy = require('speakeasy')

module.exports = {
  inputs: {
    secret: {
      type: 'string',
      required: true
    },
    token: {
      type: 'string',
      required: true
    }
  },

  fn: async function ({ secret, token }) {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Accept codes from 1 step before/after (30-sec window each side)
    })

    return isValid
  }
}
```

The `window: 2` setting allows for clock skew between the server and the authenticator app. Each "window" is a 30-second TOTP step, so `window: 2` accepts codes from the current step, 1 step before, and 1 step after (a 90-second total window).

## Email 2FA Setup

### Setup Controller

```js
// api/controllers/security/setup-email-2fa.js
module.exports = {
  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function () {
    const user = await User.findOne({ id: this.req.session.userId })

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))

    // Store code with 10-minute expiry
    await User.updateOne({ id: user.id }).set({
      twoFactorVerificationCode: code,
      twoFactorVerificationCodeExpiresAt: Date.now() + 10 * 60 * 1000
    })

    // Send the code via email
    await sails.helpers.mail.send.with({
      to: user.email,
      subject: 'Your verification code',
      template: 'email-two-factor-code',
      templateData: {
        code,
        fullName: user.fullName
      }
    })

    return '/settings/security/verify-email-2fa'
  }
}
```

### Verify Email 2FA Setup

```js
// api/controllers/security/verify-email-2fa-setup.js
module.exports = {
  inputs: {
    code: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidCode: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ code }) {
    const user = await User.findOne({ id: this.req.session.userId })

    // Validate code
    if (user.twoFactorVerificationCode !== code) {
      throw {
        invalidCode: {
          problems: [{ code: 'Invalid verification code.' }]
        }
      }
    }

    // Check expiry
    if (user.twoFactorVerificationCodeExpiresAt < Date.now()) {
      throw {
        invalidCode: {
          problems: [
            { code: 'Verification code has expired. Please request a new one.' }
          ]
        }
      }
    }

    // Enable email 2FA
    await User.updateOne({ id: user.id }).set({
      emailTwoFactorEnabled: true,
      twoFactorEnabled: true,
      twoFactorVerificationCode: null,
      twoFactorVerificationCodeExpiresAt: null
    })

    // Generate backup codes if none exist
    if (!user.backupCodes || user.backupCodes.length === 0) {
      const backupCodes = []
      for (let i = 0; i < 10; i++) {
        backupCodes.push(
          await sails.helpers.strings.random('url-friendly').meta({ len: 8 })
        )
      }
      await User.updateOne({ id: user.id }).set({ backupCodes })
    }

    return '/settings/security'
  }
}
```

## Backup Codes

### Generation

```js
// api/controllers/security/generate-backup-codes.js
module.exports = {
  exits: {
    success: {
      responseType: '' // Returns JSON
    }
  },

  fn: async function () {
    const user = await User.findOne({ id: this.req.session.userId })

    if (!user.twoFactorEnabled) {
      return this.res.badRequest({
        message: '2FA must be enabled to generate backup codes.'
      })
    }

    // Generate 10 backup codes (8 characters each, URL-friendly)
    const backupCodes = []
    for (let i = 0; i < 10; i++) {
      backupCodes.push(
        await sails.helpers.strings.random('url-friendly').meta({ len: 8 })
      )
    }

    // Store codes (replaces any previous codes)
    await User.updateOne({ id: user.id }).set({ backupCodes })

    // Return codes so the user can save them
    return { backupCodes }
  }
}
```

### How Backup Codes Are Consumed

When a backup code is used during login verification, it is removed from the array so it cannot be reused:

```js
// Inside verify-2fa action (backup code path):
const codeIndex = user.backupCodes.indexOf(code)
if (codeIndex !== -1) {
  // Remove the used code
  const updatedCodes = [...user.backupCodes]
  updatedCodes.splice(codeIndex, 1)
  await User.updateOne({ id: user.id }).set({ backupCodes: updatedCodes })
  // Proceed with login...
}
```

## The Verify 2FA Action

This is the unified verification action that handles all three 2FA methods:

```js
// api/controllers/auth/verify-2fa.js
module.exports = {
  inputs: {
    code: {
      type: 'string',
      required: true
    },
    method: {
      type: 'string',
      isIn: ['totp', 'email', 'backup'],
      defaultsTo: 'totp'
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidCode: {
      responseType: 'badRequest'
    },
    sessionExpired: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ code, method }) {
    const partialLogin = this.req.session.partialLogin

    // Check session timeout (10 minutes)
    if (!partialLogin || Date.now() - partialLogin.createdAt > 10 * 60 * 1000) {
      delete this.req.session.partialLogin
      throw { sessionExpired: '/login' }
    }

    const user = await User.findOne({ id: partialLogin.userId })
    if (!user) {
      delete this.req.session.partialLogin
      throw { sessionExpired: '/login' }
    }

    let verified = false

    // ---- TOTP Verification ----
    if (method === 'totp') {
      if (!user.totpEnabled || !user.totpSecret) {
        throw {
          invalidCode: {
            problems: [{ code: 'TOTP is not enabled on this account.' }]
          }
        }
      }

      verified = await sails.helpers.totp.verify.with({
        secret: user.totpSecret,
        token: code
      })

      if (!verified) {
        throw {
          invalidCode: {
            problems: [{ code: 'Invalid authenticator code.' }]
          }
        }
      }
    }

    // ---- Email Code Verification ----
    else if (method === 'email') {
      if (!user.emailTwoFactorEnabled) {
        throw {
          invalidCode: {
            problems: [{ code: 'Email 2FA is not enabled on this account.' }]
          }
        }
      }

      if (user.twoFactorVerificationCode !== code) {
        throw {
          invalidCode: {
            problems: [{ code: 'Invalid verification code.' }]
          }
        }
      }

      if (user.twoFactorVerificationCodeExpiresAt < Date.now()) {
        throw {
          invalidCode: {
            problems: [
              { code: 'Verification code has expired. Request a new one.' }
            ]
          }
        }
      }

      verified = true

      // Clear the used code
      await User.updateOne({ id: user.id }).set({
        twoFactorVerificationCode: null,
        twoFactorVerificationCodeExpiresAt: null
      })
    }

    // ---- Backup Code Verification ----
    else if (method === 'backup') {
      if (!user.backupCodes || user.backupCodes.length === 0) {
        throw {
          invalidCode: {
            problems: [{ code: 'No backup codes available.' }]
          }
        }
      }

      const codeIndex = user.backupCodes.indexOf(code)
      if (codeIndex === -1) {
        throw {
          invalidCode: {
            problems: [{ code: 'Invalid backup code.' }]
          }
        }
      }

      // Remove the used backup code
      const updatedCodes = [...user.backupCodes]
      updatedCodes.splice(codeIndex, 1)
      await User.updateOne({ id: user.id }).set({ backupCodes: updatedCodes })

      verified = true
    }

    if (!verified) {
      throw {
        invalidCode: {
          problems: [{ code: 'Verification failed.' }]
        }
      }
    }

    // Promote partial login to full login
    this.req.session.userId = partialLogin.userId
    delete this.req.session.partialLogin

    // Set active team
    const defaultTeam = await sails.helpers.user.getDefaultTeam(user.id)
    if (defaultTeam) {
      this.req.session.activeTeamId = defaultTeam.id
    }

    // Redirect to stored return URL
    const returnUrl = await sails.helpers.returnUrl.get(this.req)
    await sails.helpers.returnUrl.clear(this.req)

    return returnUrl
  }
}
```

## Sending Email 2FA Code During Login

When a user with email 2FA reaches the verification page, they can request a code:

```js
// api/controllers/auth/send-login-email-2fa.js
module.exports = {
  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function () {
    const partialLogin = this.req.session.partialLogin
    if (!partialLogin) {
      return this.res.redirect('/login')
    }

    const user = await User.findOne({ id: partialLogin.userId })
    if (!user) {
      return this.res.redirect('/login')
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))

    // Store with 10-minute expiry
    await User.updateOne({ id: user.id }).set({
      twoFactorVerificationCode: code,
      twoFactorVerificationCodeExpiresAt: Date.now() + 10 * 60 * 1000
    })

    // Send email
    await sails.helpers.mail.send.with({
      to: user.email,
      subject: 'Your login verification code',
      template: 'email-two-factor-code',
      templateData: {
        code,
        fullName: user.fullName
      }
    })

    return '/auth/two-factor'
  }
}
```

## Disabling 2FA

```js
// api/controllers/security/disable-2fa.js
module.exports = {
  inputs: {
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    incorrect: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ password }) {
    const user = await User.findOne({ id: this.req.session.userId })

    // Require password confirmation to disable 2FA
    await sails.helpers.passwords
      .checkPassword(password, user.password)
      .intercept('incorrect', () => {
        return {
          incorrect: {
            problems: [{ password: 'Incorrect password.' }]
          }
        }
      })

    // Disable all 2FA methods
    await User.updateOne({ id: user.id }).set({
      twoFactorEnabled: false,
      totpEnabled: false,
      emailTwoFactorEnabled: false,
      totpSecret: null,
      backupCodes: [],
      twoFactorVerificationCode: null,
      twoFactorVerificationCodeExpiresAt: null
    })

    return '/settings/security'
  }
}
```

## Frontend Integration

### TOTP Setup (React Example)

```jsx
import { useForm, router } from '@inertiajs/react'
import { useState } from 'react'

function TotpSetup() {
  const [setupData, setSetupData] = useState(null)
  const { data, setData, post, errors, processing } = useForm({ code: '' })

  async function startSetup() {
    const response = await fetch('/security/setup-totp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')
          ?.content
      }
    })
    const result = await response.json()
    setSetupData(result)
  }

  function verifyCode(e) {
    e.preventDefault()
    post('/security/verify-totp-setup')
  }

  if (!setupData) {
    return <button onClick={startSetup}>Set up authenticator app</button>
  }

  return (
    <div>
      <h2>Scan this QR code with your authenticator app</h2>
      <img src={setupData.qrCode} alt="TOTP QR Code" />
      <p>
        Or enter this key manually: <code>{setupData.secret}</code>
      </p>

      <form onSubmit={verifyCode}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={data.code}
          onChange={(e) => setData('code', e.target.value)}
          placeholder="Enter 6-digit code"
        />
        {errors.code && <p className="text-red-500">{errors.code}</p>}
        <button type="submit" disabled={processing}>
          Verify
        </button>
      </form>
    </div>
  )
}
```

### 2FA Verification Page (React Example)

```jsx
import { useForm } from '@inertiajs/react'
import { useState } from 'react'

function VerifyTwoFactor() {
  const [method, setMethod] = useState('totp')
  const { data, setData, post, errors, processing } = useForm({
    code: '',
    method: 'totp'
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/auth/verify-2fa')
  }

  function switchMethod(newMethod) {
    setMethod(newMethod)
    setData('method', newMethod)
    setData('code', '')
  }

  function requestEmailCode() {
    router.post('/auth/send-login-email-2fa')
  }

  return (
    <div>
      <h1>Two-factor authentication</h1>

      <div>
        <button onClick={() => switchMethod('totp')}>Authenticator app</button>
        <button onClick={() => switchMethod('email')}>Email code</button>
        <button onClick={() => switchMethod('backup')}>Backup code</button>
      </div>

      {method === 'email' && (
        <button onClick={requestEmailCode}>Send code to email</button>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={data.code}
          onChange={(e) => setData('code', e.target.value)}
          placeholder={
            method === 'totp'
              ? 'Enter 6-digit code'
              : method === 'email'
              ? 'Enter email code'
              : 'Enter backup code'
          }
        />
        {errors.code && <p className="text-red-500">{errors.code}</p>}
        <button type="submit" disabled={processing}>
          Verify
        </button>
      </form>
    </div>
  )
}
```

## Routes

```js
// config/routes.js
module.exports.routes = {
  // 2FA login verification (requires partial login)
  'GET /auth/two-factor': { action: 'auth/view-verify-2fa' },
  'POST /auth/verify-2fa': { action: 'auth/verify-2fa' },
  'POST /auth/send-login-email-2fa': { action: 'auth/send-login-email-2fa' },

  // TOTP setup (requires authentication)
  'POST /security/setup-totp': { action: 'security/setup-totp' },
  'POST /security/verify-totp-setup': { action: 'security/verify-totp-setup' },

  // Email 2FA setup (requires authentication)
  'POST /security/setup-email-2fa': { action: 'security/setup-email-2fa' },
  'POST /security/verify-email-2fa-setup': {
    action: 'security/verify-email-2fa-setup'
  },

  // Backup codes and disabling (requires authentication)
  'POST /security/generate-backup-codes': {
    action: 'security/generate-backup-codes'
  },
  'POST /security/disable-2fa': { action: 'security/disable-2fa' }
}
```

## Policy Configuration

```js
// config/policies.js (2FA-related entries)
module.exports.policies = {
  // 2FA verification: requires partial login (NOT is-authenticated)
  'auth/view-verify-2fa': 'has-partially-logged-in',
  'auth/verify-2fa': 'has-partially-logged-in',
  'auth/send-login-email-2fa': 'has-partially-logged-in'

  // 2FA setup: requires full authentication (inherited from '*': 'is-authenticated')
  // security/setup-totp: is-authenticated
  // security/verify-totp-setup: is-authenticated
  // security/setup-email-2fa: is-authenticated
  // security/verify-email-2fa-setup: is-authenticated
  // security/generate-backup-codes: is-authenticated
  // security/disable-2fa: is-authenticated
}
```

## Summary

| Method | Library   | Code Format         | Expiry             | Storage                             |
| ------ | --------- | ------------------- | ------------------ | ----------------------------------- |
| TOTP   | speakeasy | 6-digit numeric     | 30 sec (window: 2) | Secret in `totpSecret`              |
| Email  | --        | 6-digit numeric     | 10 minutes         | Code in `twoFactorVerificationCode` |
| Backup | --        | 8-char alphanumeric | Never (single-use) | Array in `backupCodes`              |
