---
name: authentication
description: >
  Authentication patterns for The Boring JavaScript Stack — session-based auth with password, magic links,
  passkeys (WebAuthn), two-factor authentication (TOTP/email/backup codes), password reset, and OAuth.
  Use this skill when implementing or modifying any authentication flow in a Sails.js application.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: authentication, auth, login, signup, password, magic-link, passkey, webauthn, 2fa, totp, oauth, boring-stack
---

# Authentication

The Boring JavaScript Stack uses **session-based authentication** with multiple sign-in methods. The Ascent templates provide production-ready implementations of password auth, magic links, passkeys, two-factor authentication, password reset, and OAuth — all built on Sails.js actions, helpers, and policies.

## When to Use

Use this skill when:

- Implementing signup and login flows (password or magic link)
- Adding passkey (WebAuthn) support with `@simplewebauthn`
- Setting up two-factor authentication (TOTP, email codes, backup codes)
- Building password reset flows with secure token handling
- Integrating OAuth providers (Google, GitHub) via `sails-hook-wish`
- Configuring authentication policies (`is-authenticated`, `is-guest`, `has-partially-logged-in`)
- Understanding the `req.me` / `req.session.userId` pattern and return URL handling
- Working with the User model's auth-related attributes and lifecycle callbacks

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - Auth architecture, User model overview, policies, req.me, return URL
- [rules/password-auth.md](rules/password-auth.md) - Signup and login flows, password hashing, remember me, validation
- [rules/magic-links.md](rules/magic-links.md) - Token generation/hashing, request/verify actions, auto-signup, security
- [rules/passkeys.md](rules/passkeys.md) - WebAuthn with @simplewebauthn, registration and authentication flows
- [rules/two-factor.md](rules/two-factor.md) - TOTP, email 2FA, backup codes, partial login state, verify-2fa action
- [rules/password-reset.md](rules/password-reset.md) - Forgot/reset flow, token lifecycle, email integration, security
- [rules/oauth.md](rules/oauth.md) - Wish library, Google/GitHub OAuth, redirect/callback, findOrCreate pattern
