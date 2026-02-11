---
name: oauth
description: OAuth social login with sails-hook-wish - Google and GitHub integration, redirect/callback pattern, findOrCreate, email conflict handling, adding providers
metadata:
  tags: oauth, social-login, google, github, wish, sails-hook-wish, provider, callback
---

# OAuth Authentication

## Overview

The Boring Stack uses `sails-hook-wish` for OAuth social login. Wish provides a clean abstraction over OAuth 2.0 flows, handling the redirect-to-provider and callback-with-code exchange. Out of the box, the Ascent templates support Google and GitHub as OAuth providers.

## Library

```json
{
  "dependencies": {
    "sails-hook-wish": "^0.3.0"
  }
}
```

Wish is a Sails hook that registers itself as `sails.wish`. It reads provider configuration from `config/wish.js` and exposes a simple API for redirecting users and exchanging authorization codes.

## Provider Configuration

```js
// config/wish.js
module.exports.wish = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUrl: `${
      process.env.BASE_URL || 'http://localhost:1337'
    }/auth/callback/github`
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: `${
      process.env.BASE_URL || 'http://localhost:1337'
    }/auth/callback/google`
  }
}
```

### Environment Variables

```bash
# .env (development)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BASE_URL=http://localhost:1337
```

### Setting Up OAuth Apps

**GitHub:**

1. Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Set "Homepage URL" to your app URL
3. Set "Authorization callback URL" to `https://yourapp.com/auth/callback/github`
4. Copy the Client ID and Client Secret

**Google:**

1. Go to Google Cloud Console > APIs & Services > Credentials > Create OAuth Client ID
2. Set application type to "Web application"
3. Add `https://yourapp.com/auth/callback/google` to "Authorized redirect URIs"
4. Copy the Client ID and Client Secret

## The Redirect Action

This action redirects the user to the OAuth provider's authorization page:

```js
// api/controllers/auth/redirect.js
module.exports = {
  inputs: {
    provider: {
      type: 'string',
      required: true,
      isIn: ['github', 'google']
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ provider }) {
    // Wish generates the OAuth authorization URL and redirects
    return sails.wish.provider(provider).redirect()
  }
}
```

The `sails.wish.provider(provider).redirect()` method:

1. Looks up the provider configuration from `config/wish.js`
2. Generates an authorization URL with the client ID, redirect URL, and requested scopes
3. Returns the URL for the redirect response

## The Callback Action

After the user authorizes with the provider, they are redirected back to the callback URL with an authorization code:

```js
// api/controllers/auth/callback.js
module.exports = {
  inputs: {
    provider: {
      type: 'string',
      required: true,
      isIn: ['github', 'google']
    },
    code: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    },
    emailConflict: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ provider, code }) {
    // Exchange the authorization code for user profile data
    const oauthUser = await sails.wish.provider(provider).user(code)

    // The oauthUser object contains:
    // {
    //   id: '12345',           // Provider-specific user ID
    //   name: 'John Doe',      // Display name
    //   email: 'john@example.com',
    //   avatarUrl: 'https://...',
    //   accessToken: 'gho_xxx...',
    //   idToken: 'eyJ...' (Google only)
    // }

    let user

    if (provider === 'github') {
      user = await handleGithubCallback(oauthUser, this.req)
    } else if (provider === 'google') {
      user = await handleGoogleCallback(oauthUser, this.req)
    }

    if (!user) {
      throw { emailConflict: '/login?error=email-conflict' }
    }

    // Full login
    this.req.session.userId = user.id

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

// ---- Provider-specific handlers ----

async function handleGithubCallback(oauthUser, req) {
  // 1. Try to find by GitHub ID (returning user)
  var user = await User.findOne({ githubId: String(oauthUser.id) })

  if (user) {
    // Update tokens and avatar
    await User.updateOne({ id: user.id }).set({
      githubAccessToken: oauthUser.accessToken,
      githubAvatarUrl: oauthUser.avatarUrl
    })
    return user
  }

  // 2. Try to find by email (existing user linking GitHub)
  if (oauthUser.email) {
    user = await User.findOne({ email: oauthUser.email.toLowerCase() })

    if (user) {
      // Link GitHub to existing account
      await User.updateOne({ id: user.id }).set({
        githubId: String(oauthUser.id),
        githubAccessToken: oauthUser.accessToken,
        githubAvatarUrl: oauthUser.avatarUrl
      })
      return user
    }
  }

  // 3. Create new user
  user = await sails.helpers.user.signupWithTeam.with({
    fullName: oauthUser.name || oauthUser.email.split('@')[0],
    email: oauthUser.email.toLowerCase(),
    githubId: String(oauthUser.id)
  })

  await User.updateOne({ id: user.id }).set({
    githubAccessToken: oauthUser.accessToken,
    githubAvatarUrl: oauthUser.avatarUrl,
    emailStatus: 'confirmed' // Email verified by provider
  })

  return user
}

async function handleGoogleCallback(oauthUser, req) {
  // 1. Try to find by Google ID (returning user)
  var user = await User.findOne({ googleId: String(oauthUser.id) })

  if (user) {
    // Update tokens and avatar
    await User.updateOne({ id: user.id }).set({
      googleAccessToken: oauthUser.accessToken,
      googleIdToken: oauthUser.idToken,
      googleAvatarUrl: oauthUser.avatarUrl
    })
    return user
  }

  // 2. Try to find by email (existing user linking Google)
  if (oauthUser.email) {
    user = await User.findOne({ email: oauthUser.email.toLowerCase() })

    if (user) {
      // Link Google to existing account
      await User.updateOne({ id: user.id }).set({
        googleId: String(oauthUser.id),
        googleAccessToken: oauthUser.accessToken,
        googleIdToken: oauthUser.idToken,
        googleAvatarUrl: oauthUser.avatarUrl
      })
      return user
    }
  }

  // 3. Create new user
  user = await sails.helpers.user.signupWithTeam.with({
    fullName: oauthUser.name || oauthUser.email.split('@')[0],
    email: oauthUser.email.toLowerCase(),
    googleId: String(oauthUser.id)
  })

  await User.updateOne({ id: user.id }).set({
    googleAccessToken: oauthUser.accessToken,
    googleIdToken: oauthUser.idToken,
    googleAvatarUrl: oauthUser.avatarUrl,
    emailStatus: 'confirmed' // Email verified by provider
  })

  return user
}
```

## The FindOrCreate Pattern

The callback follows a three-step lookup pattern for every provider:

```
1. Find by OAuth ID (githubId / googleId)
   --> Found: update tokens, return user (returning login)

2. Find by email
   --> Found: link OAuth ID to existing account, return user (account linking)

3. Create new user
   --> signupWithTeam, set OAuth fields, mark email confirmed
```

### Why This Order Matters

- **Step 1 first**: The most common case -- user has logged in with this provider before. Fast lookup by indexed field.
- **Step 2 second**: User signed up with email/password or another provider. We link the new provider to their existing account instead of creating a duplicate.
- **Step 3 last**: Completely new user. Create via `signupWithTeam` which handles the transaction (user + team + membership).

### Email Verification Shortcut

Users who sign up via OAuth have their email marked as `confirmed` immediately:

```js
emailStatus: 'confirmed' // Email verified by provider
```

This is safe because Google and GitHub verify email addresses before including them in the OAuth profile.

## Handling Email Conflicts

In some cases, a provider might not return an email address, or there could be conflicts. The callback should handle these gracefully:

```js
// If the provider doesn't give us an email
if (!oauthUser.email) {
  // Could redirect to a page asking for their email
  req.session.pendingOAuth = {
    provider: 'github',
    providerId: String(oauthUser.id),
    name: oauthUser.name,
    avatarUrl: oauthUser.avatarUrl,
    accessToken: oauthUser.accessToken
  }
  return null // Will trigger emailConflict exit
}
```

For the common case where the email does exist but belongs to a different provider, the Step 2 lookup handles this by linking the accounts automatically.

## Avatar URL Handling

OAuth providers return avatar URLs that the Boring Stack stores and uses for the user's profile:

```js
// Store provider-specific avatar URLs
githubAvatarUrl: oauthUser.avatarUrl
googleAvatarUrl: oauthUser.avatarUrl
```

A helper can resolve the best available avatar:

```js
// api/helpers/user/get-avatar-url.js
module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true
    }
  },

  fn: async function ({ user }) {
    // Priority: custom upload > Google > GitHub > null
    return (
      user.avatarUrl || user.googleAvatarUrl || user.githubAvatarUrl || null
    )
  }
}
```

In the custom hook, the avatar URL can be included in shared data:

```js
sails.inertia.share(
  'loggedInUser',
  sails.inertia.once(async () => {
    if (!req.session.userId) return null
    const user = await User.findOne({ id: req.session.userId })
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      initials: user.initials,
      avatarUrl: await sails.helpers.user.getAvatarUrl(user)
    }
  })
)
```

## Routes

```js
// config/routes.js
module.exports.routes = {
  // OAuth redirect (starts the flow)
  'GET /auth/redirect/:provider': { action: 'auth/redirect' },

  // OAuth callback (provider redirects back here)
  'GET /auth/callback/:provider': { action: 'auth/callback' }
}
```

The `:provider` parameter is automatically passed to the action's `provider` input. The routes handle both GitHub and Google (and any future providers) with a single pair of routes.

## Policy Configuration

Both OAuth routes are guest-only:

```js
// config/policies.js
module.exports.policies = {
  'auth/redirect': 'is-guest',
  'auth/callback': 'is-guest'
}
```

## Frontend Integration

### Social Login Buttons

```jsx
// React
function SocialLoginButtons() {
  return (
    <div>
      <a href="/auth/redirect/github" className="btn-social">
        Continue with GitHub
      </a>

      <a href="/auth/redirect/google" className="btn-social">
        Continue with Google
      </a>
    </div>
  )
}
```

Note these are standard `<a>` links, not Inertia links. The OAuth redirect needs a full page navigation because it leaves the application to go to the provider's authorization page.

### Login Page with All Methods

```jsx
// React - pages/auth/login.jsx
import { useForm, Link } from '@inertiajs/react'

export default function Login() {
  const { data, setData, post, errors, processing } = useForm({
    email: '',
    password: '',
    rememberMe: false
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/auth/login')
  }

  return (
    <div>
      <h1>Log in</h1>

      {/* OAuth buttons */}
      <div>
        <a href="/auth/redirect/github">Continue with GitHub</a>
        <a href="/auth/redirect/google">Continue with Google</a>
      </div>

      <div className="divider">or</div>

      {/* Password form */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          placeholder="Password"
        />
        {errors.form && <p className="text-red-500">{errors.form}</p>}

        <label>
          <input
            type="checkbox"
            checked={data.rememberMe}
            onChange={(e) => setData('rememberMe', e.target.checked)}
          />
          Remember me
        </label>

        <button type="submit" disabled={processing}>
          Log in
        </button>
      </form>

      <Link href="/magic-link">Log in with magic link</Link>
      <Link href="/forgot-password">Forgot your password?</Link>
    </div>
  )
}
```

## Adding a New OAuth Provider

### Step 1: Add Provider Configuration

```js
// config/wish.js
module.exports.wish = {
  github: {
    /* ... */
  },
  google: {
    /* ... */
  },

  // Add new provider
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUrl: `${
      process.env.BASE_URL || 'http://localhost:1337'
    }/auth/callback/twitter`
  }
}
```

### Step 2: Add User Model Fields

```js
// api/models/User.js
{
  twitterId: { type: 'string', allowNull: true },
  twitterAccessToken: { type: 'string', protect: true },
  twitterAvatarUrl: { type: 'string', maxLength: 2048 }
}
```

### Step 3: Add Handler Function

```js
// In api/controllers/auth/callback.js, add a new handler:
async function handleTwitterCallback(oauthUser, req) {
  // 1. Find by Twitter ID
  var user = await User.findOne({ twitterId: String(oauthUser.id) })
  if (user) {
    await User.updateOne({ id: user.id }).set({
      twitterAccessToken: oauthUser.accessToken,
      twitterAvatarUrl: oauthUser.avatarUrl
    })
    return user
  }

  // 2. Find by email
  if (oauthUser.email) {
    user = await User.findOne({ email: oauthUser.email.toLowerCase() })
    if (user) {
      await User.updateOne({ id: user.id }).set({
        twitterId: String(oauthUser.id),
        twitterAccessToken: oauthUser.accessToken,
        twitterAvatarUrl: oauthUser.avatarUrl
      })
      return user
    }
  }

  // 3. Create new user
  user = await sails.helpers.user.signupWithTeam.with({
    fullName: oauthUser.name || oauthUser.email.split('@')[0],
    email: oauthUser.email.toLowerCase(),
    twitterId: String(oauthUser.id)
  })

  await User.updateOne({ id: user.id }).set({
    twitterAccessToken: oauthUser.accessToken,
    twitterAvatarUrl: oauthUser.avatarUrl,
    emailStatus: 'confirmed'
  })

  return user
}
```

### Step 4: Update the Callback Action

```js
// Update the isIn validation and switch in callback.js
inputs: {
  provider: {
    type: 'string',
    required: true,
    isIn: ['github', 'google', 'twitter']  // Add new provider
  }
}

// In fn:
if (provider === 'github') {
  user = await handleGithubCallback(oauthUser, this.req)
} else if (provider === 'google') {
  user = await handleGoogleCallback(oauthUser, this.req)
} else if (provider === 'twitter') {
  user = await handleTwitterCallback(oauthUser, this.req)
}
```

### Step 5: Update customToJSON

```js
// api/models/User.js
customToJSON: function () {
  return _.omit(this, [
    // ...existing fields...
    'twitterAccessToken'
  ])
}
```

### Step 6: Add Frontend Button

```jsx
<a href="/auth/redirect/twitter">Continue with Twitter</a>
```

No route changes needed -- the `:provider` parameter routes already handle any provider name.

## OAuth vs Other Auth Methods

| Feature             | OAuth            | Password              | Magic Link       | Passkey        |
| ------------------- | ---------------- | --------------------- | ---------------- | -------------- |
| Email required      | From provider    | User enters           | User enters      | --             |
| Password needed     | No               | Yes                   | No               | No             |
| External dependency | Provider uptime  | None                  | Email delivery   | None           |
| 2FA interaction     | Bypasses app 2FA | Triggers 2FA          | Bypasses 2FA     | Bypasses 2FA   |
| Account creation    | Automatic        | Separate signup       | Automatic        | Separate setup |
| Email verified      | By provider      | Requires verification | By clicking link | --             |

OAuth login bypasses the application's 2FA because the provider itself may enforce its own 2FA. The user has already authenticated through the provider's security measures.

## Security Considerations

1. **Access tokens are `protect: true`** -- Never exposed in API responses or Inertia props via `customToJSON`
2. **Provider IDs are strings** -- Stored as strings even when numeric to avoid integer overflow issues
3. **Redirect URLs must match** -- The callback URL in `config/wish.js` must exactly match the URL registered with the OAuth provider
4. **Environment variables** -- Client secrets are never hardcoded; always use environment variables
5. **HTTPS in production** -- OAuth providers require HTTPS callback URLs in production
