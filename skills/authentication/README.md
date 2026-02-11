# Authentication Skills for Claude Code

Build secure authentication flows for The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/authentication
```

## Usage

After installing, Claude will automatically apply authentication best practices when you work on auth-related code:

> "Add magic link login to my app"

> "Set up passkey authentication with WebAuthn"

> "Add two-factor authentication with TOTP and backup codes"

> "Integrate Google OAuth for social login"

## Skills Included

- **getting-started** - Auth architecture, User model, policies, session management
- **password-auth** - Signup, login, password hashing, remember me, validation
- **magic-links** - Passwordless auth with secure token generation and verification
- **passkeys** - WebAuthn registration and authentication with @simplewebauthn
- **two-factor** - TOTP (authenticator app), email codes, backup codes
- **password-reset** - Forgot password flow with secure token lifecycle
- **oauth** - Google and GitHub OAuth via sails-hook-wish

## Auth Methods

The Boring JavaScript Stack supports multiple authentication methods:

| Method      | Library                      | Template        |
| ----------- | ---------------------------- | --------------- |
| Password    | bcrypt (sails-hook-organics) | Mellow + Ascent |
| Magic Links | Custom token helpers         | Mellow + Ascent |
| Passkeys    | @simplewebauthn/server       | Ascent          |
| TOTP 2FA    | speakeasy                    | Ascent          |
| Email 2FA   | Custom code generation       | Ascent          |
| OAuth       | sails-hook-wish              | Mellow + Ascent |

## Links

- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [SimpleWebAuthn](https://simplewebauthn.dev)
- [Sails.js Policies](https://sailsjs.com/documentation/concepts/policies)

## License

MIT
