---
name: passkeys
description: WebAuthn passkey authentication - registration and login flows using @simplewebauthn/server and @simplewebauthn/browser, challenge management, credential storage
metadata:
  tags: passkey, webauthn, fido2, biometric, simplewebauthn, registration, authentication, credential
---

# Passkey Authentication

## Overview

Passkeys provide phishing-resistant, passwordless authentication using the WebAuthn standard. The Boring Stack implements passkeys with the `@simplewebauthn/server` (backend) and `@simplewebauthn/browser` (frontend) libraries. Users can register multiple passkeys (fingerprint, face ID, security keys) and use them to log in without a password.

## Dependencies

```json
{
  "dependencies": {
    "@simplewebauthn/server": "^11.0.0"
  },
  "devDependencies": {
    "@simplewebauthn/browser": "^11.0.0"
  }
}
```

The server package runs in Sails.js actions and helpers. The browser package runs in the frontend (React/Vue/Svelte) to interact with the platform authenticator.

## User Model Fields

```js
// api/models/User.js (passkey-related attributes)
{
  passkeyEnabled: {
    type: 'boolean',
    defaultsTo: false
  },
  passkeys: {
    type: 'json',
    defaultsTo: []
    // Array of stored credentials:
    // [{
    //   credentialID: 'base64url-encoded-id',
    //   credentialPublicKey: 'base64url-encoded-key',
    //   counter: 0,
    //   transports: ['internal', 'hybrid']
    // }]
  },
  passkeyChallenge: {
    type: 'string'
  },
  passkeyChallengeExpiresAt: {
    type: 'number'
  }
}
```

## Registration Flow

Registration is a two-step process: generate options, then verify the attestation.

### Step 1: Generate Registration Options

```js
// api/helpers/passkey/generate-registration-options.js
const { generateRegistrationOptions } = require('@simplewebauthn/server')

module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true
    }
  },

  fn: async function ({ user }) {
    const options = await generateRegistrationOptions({
      rpName: sails.config.custom.appName || 'My App',
      rpID: sails.config.custom.passkeyRpId || 'localhost',
      userID: String(user.id),
      userName: user.email,
      userDisplayName: user.fullName,
      // Exclude already-registered credentials to prevent duplicates
      excludeCredentials: (user.passkeys || []).map((passkey) => ({
        id: passkey.credentialID,
        type: 'public-key',
        transports: passkey.transports
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    })

    return options
  }
}
```

### Step 1 Controller: Setup Passkey

```js
// api/controllers/security/setup-passkey.js
module.exports = {
  exits: {
    success: {
      responseType: '' // Returns JSON
    }
  },

  fn: async function () {
    const user = await User.findOne({ id: this.req.session.userId })

    const options = await sails.helpers.passkey.generateRegistrationOptions(
      user
    )

    // Store challenge with 5-minute expiry for verification
    await User.updateOne({ id: user.id }).set({
      passkeyChallenge: options.challenge,
      passkeyChallengeExpiresAt: Date.now() + 5 * 60 * 1000
    })

    return options
  }
}
```

### Step 2: Verify Registration

```js
// api/helpers/passkey/verify-registration.js
const { verifyRegistrationResponse } = require('@simplewebauthn/server')

module.exports = {
  inputs: {
    credential: {
      type: 'ref',
      required: true
    },
    expectedChallenge: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Registration verified successfully.'
    },
    invalid: {
      description: 'Registration verification failed.'
    }
  },

  fn: async function ({ credential, expectedChallenge }) {
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: sails.config.custom.baseUrl,
      expectedRPID: sails.config.custom.passkeyRpId || 'localhost'
    })

    if (!verification.verified || !verification.registrationInfo) {
      throw 'invalid'
    }

    return verification.registrationInfo
  }
}
```

### Step 2 Controller: Verify Passkey Setup

```js
// api/controllers/security/verify-passkey-setup.js
module.exports = {
  inputs: {
    credential: {
      type: 'ref',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    challengeExpired: {
      responseType: 'badRequest'
    },
    verificationFailed: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ credential }) {
    const user = await User.findOne({ id: this.req.session.userId })

    // Check challenge expiry
    if (!user.passkeyChallenge || user.passkeyChallengeExpiresAt < Date.now()) {
      throw {
        challengeExpired: {
          problems: [{ form: 'Challenge expired. Please try again.' }]
        }
      }
    }

    // Verify the registration response
    let registrationInfo
    try {
      registrationInfo = await sails.helpers.passkey.verifyRegistration.with({
        credential,
        expectedChallenge: user.passkeyChallenge
      })
    } catch (err) {
      throw {
        verificationFailed: {
          problems: [{ form: 'Passkey verification failed. Please try again.' }]
        }
      }
    }

    // Store the new credential
    const newPasskey = {
      credentialID: registrationInfo.credential.id,
      credentialPublicKey: Buffer.from(
        registrationInfo.credential.publicKey
      ).toString('base64url'),
      counter: registrationInfo.credential.counter,
      transports: credential.response.transports || []
    }

    const updatedPasskeys = [...(user.passkeys || []), newPasskey]

    await User.updateOne({ id: user.id }).set({
      passkeys: updatedPasskeys,
      passkeyEnabled: true,
      passkeyChallenge: null,
      passkeyChallengeExpiresAt: null
    })

    return '/settings/security'
  }
}
```

## Authentication Flow

Authentication is also two steps: generate options (challenge), then verify the assertion.

### Step 1: Challenge Passkey

```js
// api/helpers/passkey/generate-authentication-options.js
const { generateAuthenticationOptions } = require('@simplewebauthn/server')

module.exports = {
  inputs: {
    user: {
      type: 'ref',
      description: 'Optional user for specific credential filtering'
    }
  },

  fn: async function ({ user }) {
    const options = await generateAuthenticationOptions({
      rpID: sails.config.custom.passkeyRpId || 'localhost',
      userVerification: 'preferred',
      // If we know the user, limit to their credentials
      ...(user &&
        user.passkeys && {
          allowCredentials: user.passkeys.map((passkey) => ({
            id: passkey.credentialID,
            type: 'public-key',
            transports: passkey.transports
          }))
        })
    })

    return options
  }
}
```

```js
// api/controllers/auth/challenge-passkey.js
module.exports = {
  inputs: {
    email: {
      type: 'string',
      isEmail: true
    }
  },

  exits: {
    success: {
      responseType: '' // Returns JSON
    }
  },

  fn: async function ({ email }) {
    let user

    // If email provided, generate user-specific challenge
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() })
    }

    const options = await sails.helpers.passkey.generateAuthenticationOptions(
      user
    )

    // Store challenge for verification
    // For known users, store on user record
    // For discoverable credentials, store in session
    if (user) {
      await User.updateOne({ id: user.id }).set({
        passkeyChallenge: options.challenge,
        passkeyChallengeExpiresAt: Date.now() + 5 * 60 * 1000
      })
    } else {
      this.req.session.passkeyChallenge = options.challenge
      this.req.session.passkeyChallengeExpiresAt = Date.now() + 5 * 60 * 1000
    }

    return options
  }
}
```

### Step 2: Verify Passkey

```js
// api/helpers/passkey/verify-authentication.js
const { verifyAuthenticationResponse } = require('@simplewebauthn/server')

module.exports = {
  inputs: {
    credential: {
      type: 'ref',
      required: true
    },
    expectedChallenge: {
      type: 'string',
      required: true
    },
    storedCredential: {
      type: 'ref',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Authentication verified.'
    },
    invalid: {
      description: 'Authentication failed.'
    }
  },

  fn: async function ({ credential, expectedChallenge, storedCredential }) {
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: sails.config.custom.baseUrl,
      expectedRPID: sails.config.custom.passkeyRpId || 'localhost',
      credential: {
        id: storedCredential.credentialID,
        publicKey: Buffer.from(
          storedCredential.credentialPublicKey,
          'base64url'
        ),
        counter: storedCredential.counter
      }
    })

    if (!verification.verified) {
      throw 'invalid'
    }

    return verification.authenticationInfo
  }
}
```

```js
// api/controllers/auth/verify-passkey.js
module.exports = {
  inputs: {
    credential: {
      type: 'ref',
      required: true
    },
    email: {
      type: 'string',
      isEmail: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    invalidPasskey: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ credential, email }) {
    let user
    let expectedChallenge

    if (email) {
      // Known user flow
      user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        throw {
          invalidPasskey: { problems: [{ form: 'Authentication failed.' }] }
        }
      }
      expectedChallenge = user.passkeyChallenge
    } else {
      // Discoverable credential flow: find user by credential ID
      const allUsersWithPasskeys = await User.find({
        passkeyEnabled: true
      })

      for (const candidate of allUsersWithPasskeys) {
        const match = (candidate.passkeys || []).find(
          (pk) => pk.credentialID === credential.id
        )
        if (match) {
          user = candidate
          break
        }
      }

      if (!user) {
        throw {
          invalidPasskey: { problems: [{ form: 'Authentication failed.' }] }
        }
      }

      expectedChallenge = this.req.session.passkeyChallenge
    }

    // Validate challenge expiry
    const challengeExpiry =
      user.passkeyChallengeExpiresAt ||
      this.req.session.passkeyChallengeExpiresAt

    if (!expectedChallenge || challengeExpiry < Date.now()) {
      throw {
        invalidPasskey: {
          problems: [{ form: 'Challenge expired. Please try again.' }]
        }
      }
    }

    // Find the matching stored credential
    const storedCredential = (user.passkeys || []).find(
      (pk) => pk.credentialID === credential.id
    )

    if (!storedCredential) {
      throw {
        invalidPasskey: { problems: [{ form: 'Authentication failed.' }] }
      }
    }

    // Verify the assertion
    let authenticationInfo
    try {
      authenticationInfo =
        await sails.helpers.passkey.verifyAuthentication.with({
          credential,
          expectedChallenge,
          storedCredential
        })
    } catch (err) {
      throw {
        invalidPasskey: { problems: [{ form: 'Authentication failed.' }] }
      }
    }

    // Update counter for replay prevention
    const updatedPasskeys = (user.passkeys || []).map((pk) => {
      if (pk.credentialID === credential.id) {
        return { ...pk, counter: authenticationInfo.newCounter }
      }
      return pk
    })

    await User.updateOne({ id: user.id }).set({
      passkeys: updatedPasskeys,
      passkeyChallenge: null,
      passkeyChallengeExpiresAt: null
    })

    // Clear session challenge if used
    delete this.req.session.passkeyChallenge
    delete this.req.session.passkeyChallengeExpiresAt

    // Full login (passkeys bypass 2FA)
    this.req.session.userId = user.id

    const defaultTeam = await sails.helpers.user.getDefaultTeam(user.id)
    if (defaultTeam) {
      this.req.session.activeTeamId = defaultTeam.id
    }

    const returnUrl = await sails.helpers.returnUrl.get(this.req)
    await sails.helpers.returnUrl.clear(this.req)

    return returnUrl
  }
}
```

## Challenge Management

### 5-Minute Expiry

Both registration and authentication challenges expire after 5 minutes:

```js
await User.updateOne({ id: user.id }).set({
  passkeyChallenge: options.challenge,
  passkeyChallengeExpiresAt: Date.now() + 5 * 60 * 1000
})
```

### Challenge Cleanup

After successful verification, always clear the challenge:

```js
await User.updateOne({ id: user.id }).set({
  passkeyChallenge: null,
  passkeyChallengeExpiresAt: null
})
```

## Counter Tracking

WebAuthn uses a signature counter to detect cloned authenticators. Each authentication increments the counter:

```js
// After verification, update the stored counter
const updatedPasskeys = (user.passkeys || []).map((pk) => {
  if (pk.credentialID === credential.id) {
    return { ...pk, counter: authenticationInfo.newCounter }
  }
  return pk
})
```

If an authenticator presents a counter that is lower than or equal to the stored counter, it may indicate a cloned device. The `@simplewebauthn/server` library handles this check automatically and will reject the response.

## Frontend Integration

### Registration (React Example)

```jsx
import { startRegistration } from '@simplewebauthn/browser'
import { router } from '@inertiajs/react'

async function registerPasskey() {
  try {
    // Step 1: Get registration options from server
    const response = await fetch('/security/setup-passkey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')
          ?.content
      }
    })
    const options = await response.json()

    // Step 2: Create credential with browser/platform authenticator
    const attestation = await startRegistration({ optionsJSON: options })

    // Step 3: Send attestation to server for verification
    router.post('/security/verify-passkey-setup', {
      credential: attestation
    })
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User cancelled the registration
      console.log('Registration cancelled')
    } else {
      console.error('Registration failed:', error)
    }
  }
}
```

### Authentication (React Example)

```jsx
import { startAuthentication } from '@simplewebauthn/browser'
import { router } from '@inertiajs/react'

async function loginWithPasskey(email) {
  try {
    // Step 1: Get authentication options from server
    const response = await fetch('/auth/challenge-passkey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const options = await response.json()

    // Step 2: Get assertion from browser/platform authenticator
    const assertion = await startAuthentication({ optionsJSON: options })

    // Step 3: Send assertion to server for verification
    router.post('/auth/verify-passkey', {
      credential: assertion,
      email
    })
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.log('Authentication cancelled')
    } else {
      console.error('Authentication failed:', error)
    }
  }
}
```

## Configuration

### Relying Party Settings

```js
// config/custom.js
module.exports.custom = {
  baseUrl: 'https://myapp.com',
  appName: 'My App',

  // Passkey settings
  passkeyRpId: 'myapp.com' // Must match the domain (no protocol, no port)
}
```

The `rpID` is the domain that the passkey is bound to. In development, use `localhost`. In production, use the bare domain (e.g., `myapp.com`, not `https://myapp.com`).

### Development vs Production

| Setting        | Development             | Production          |
| -------------- | ----------------------- | ------------------- |
| rpID           | `localhost`             | `myapp.com`         |
| expectedOrigin | `http://localhost:1337` | `https://myapp.com` |

## Routes

```js
// config/routes.js
module.exports.routes = {
  // Passkey authentication (guest)
  'POST /auth/challenge-passkey': { action: 'auth/challenge-passkey' },
  'POST /auth/verify-passkey': { action: 'auth/verify-passkey' },

  // Passkey management (authenticated)
  'POST /security/setup-passkey': { action: 'security/setup-passkey' },
  'POST /security/verify-passkey-setup': {
    action: 'security/verify-passkey-setup'
  }
}
```

## Security Properties

| Property            | How It Works                                                  |
| ------------------- | ------------------------------------------------------------- |
| Phishing resistant  | Credentials are bound to the rpID domain                      |
| No shared secrets   | Public-key cryptography, no passwords stored                  |
| Replay prevention   | Counter tracking detects cloned authenticators                |
| Challenge freshness | 5-minute challenge expiry prevents replay                     |
| Multi-device        | Users can register multiple passkeys                          |
| Bypasses 2FA        | Passkeys are inherently multi-factor (possession + biometric) |
