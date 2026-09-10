# Ascent React - The Boring SaaS Stack 🚀

**Ship products with battle-tested technologies. Say no to chasing JavaScript trends.**

Ascent React is a production-ready React SaaS template built on The Boring JavaScript Stack. Focus on shipping to actual real users instead of wrestling with complex build tools and trendy frameworks.

## 🎁 The Boring Stack Philosophy

- 🎯 **Focus on Your Product** - Effortlessly focus on what really matters: shipping to actual real users
- 🙅🏾‍♀️ **No API Required** - Each page receives the necessary data as props from your Sails backend
- 🤝 **Battle-Tested Technologies** - Built with reliable, proven technologies that just work
- 🚀 **Ship Fast** - Iterate quickly and move easily from MVP to scale

## 🔧 Tech Stack

### Backend

- **[Sails.js](https://sailsjs.com)** - MVC framework for Node.js with built-in ORM (Waterline)
- **[Inertia-Sails](https://github.com/sailscastshq/inertia-sails)** - Sails.js adapter for Inertia.js
- **Database Agnostic** - Works with any database via Waterline ORM ([Learn more](https://docs.sailscasts.com/boring-stack/database))
- **Session-based Authentication** - Secure authentication without JWTs
- **Built-in Hooks** - Content management, file uploads, email, payments, and more

### Frontend

- **[React 19](https://react.dev)** - Latest React with modern features and concurrent rendering
- **[Inertia.js](https://inertiajs.com)** - Modern monolith approach eliminating API complexity
- **[Klean UI](https://docs.sailscasts.com/klean-ui/)** - Application-owned UI components and icons
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework for styling Klean UI components
- **[Rsbuild](https://rsbuild.dev)** - Fast build tool powered by Rspack (via Sails Shipwright)

### Development & Build Tools

- **[Sails Hook Shipwright](https://github.com/sailscastshq/sails-hook-shipwright)** - Modern asset pipeline with hot reload
- **[Prettier](https://prettier.io)** - Code formatting with Tailwind plugin
- **[Sounding](https://docs.sailscasts.com/sounding)** - Sails-native testing framework for helpers, requests, Inertia, mail, and browser-capable flows
- **[Playwright](https://playwright.dev)** - Browser engine underneath Sounding browser-capable trials

## ✨ Features Included

### 🔐 Complete Authentication System

- **Email/Password Authentication** - Traditional login and registration
- **Magic Link Authentication** - Passwordless login via email
- **OAuth Integration** - Google OAuth with extensible provider system
- **Two-Factor Authentication (2FA)**:
  - TOTP (Google Authenticator, Authy)
  - Email-based verification
  - Backup codes for recovery
- **WebAuthn/Passkeys** - Modern biometric authentication
- **Password Reset** - Secure password reset flow
- **Account Verification** - Email verification system

### 👥 Team Management & Multi-tenancy

- **Team Creation & Management** - Full team workflow
- **Role-based Access Control** - Team member permissions
- **Team Invitations** - Invite system with email notifications
- **Team Switching** - Seamless context switching between teams
- **Domain Restrictions** - Control team access by email domains

### 💳 Subscription & Billing

- **[Lemon Squeezy](https://lemonsqueezy.com) Integration** - Complete payment processing
- **Subscription Management** - Plans, billing, and customer portal
- **Usage-based Billing** - Track and bill based on usage
- **Webhooks** - Real-time payment event handling

### 📧 Email & Communication

- **Transactional Emails** - Built-in email templates and delivery
- **Email Templates** - Pre-built templates for auth, billing, teams
- **[Nodemailer](https://nodemailer.com)** - Flexible email delivery
- **Flash Messages** - User feedback system

### 📝 Content Management

- **Blog System** - SEO-friendly blog with markdown support
- **Waitlist** - Built-in waitlist functionality for pre-launch
- **Content Hooks** - Extensible content management system

### 🛡️ Security & Performance

- **CSRF Protection** - Built-in CSRF token handling
- **Rate Limiting** - Request rate limiting
- **Security Headers** - Production-ready security configuration
- **Session Management** - Redis-backed sessions for scaling
- **File Uploads** - Secure file upload with S3 integration

### 🛠️ Development with Warp

**✨ Enhanced Development Experience with Warp**

This template ships with a comprehensive `WARP.md` file that provides Warp AI with detailed context about your project structure, patterns, and conventions. This enables intelligent code assistance, including:

- **Smart Code Generation** - Generate components, controllers, and models following project patterns
- **Context-Aware Suggestions** - Get suggestions that understand your Sails.js + React + Klean UI architecture
- **Debugging Assistance** - Get help troubleshooting issues specific to The Boring Stack
- **Best Practices Guidance** - Ensure your code follows established project conventions

To get the best experience:

1. **Open your project in Warp**
2. **Use Warp AI** for code generation and debugging
3. **Reference the WARP.md** file for project-specific guidance
4. **Ask context-aware questions** about your architecture and implementation

## 📁 Project Structure

```
ascent-react/
├── api/                    # Sails.js backend
│   ├── controllers/        # Route handlers
│   ├── models/             # Database models (User, Team, etc.)
│   ├── helpers/            # Reusable business logic
│   └── policies/           # Authorization middleware
├── assets/js/              # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Inertia.js pages
│   ├── layouts/            # App layouts
│   └── hooks/              # Custom React hooks
├── config/                 # Sails.js configuration
├── views/                  # Email templates
├── content/                # Blog and static content
└── tests/                  # Test files
```

## 📚 Learn More

- **[Ascent Documentation](https://docs.sailscasts.com/boring-stack/ascent)** - Complete Ascent template guide
- **[The Boring Stack Docs](https://docs.sailscasts.com/boring-stack)** - Core stack documentation
- **[Database Guide](https://docs.sailscasts.com/boring-stack/database)** - Database setup and configuration
- **[Sails.js Documentation](https://sailsjs.com/documentation)** - Backend framework guide
- **[Inertia.js Guide](https://inertiajs.com)** - Modern monolith approach
- **[Klean UI Components](https://docs.sailscasts.com/klean-ui/)** - Application-owned UI source
- **[React 19 Documentation](https://react.dev)** - Latest React features
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and join our community.

## 📄 License

MIT License - feel free to use this template for any project.

---

_Built with ❤️ by [The Sailscasts Company](https://sailscasts.com) - Part of [The Boring Stack](https://github.com/sailscastshq/boring-stack)_

## Application-owned UI

This template ships editable [Klean UI and Klean Icons](https://docs.sailscasts.com/klean-ui/) source, installed with `klean-ui@0.0.4` under `assets/js/components/ui/`. Ordinary Tailwind classes at the call site control its appearance. There is no Klean runtime or provider.

See [UI.md](UI.md) for the installed inventory, artwork exceptions, and safe update workflow.

## Design and customization

Ascent uses clean neutral surfaces and a teal action color, cool neutral application surfaces, and restrained typography. Public pages use sections and rows; cards are reserved for meaningful groups such as plan selection and security actions. Account screens share the same light/dark treatment as menus and dialogs. See [UI.md](UI.md) for the palette, application recipes, page inventory, and screenshot workflow.

![Template preview](https://raw.githubusercontent.com/sailscastshq/boring-stack/main/.github/previews/ascent-react-home.png)

## Dependency maintenance

The September 2026 dependency refresh updates Sails, Nodemailer, and the framework/build dependencies. Nodemailer 10 requires Node 20 or newer, which is covered by this template's `engines` requirement. Commit `package-lock.json` with dependency changes and verify with `npm ci`, `npm run lint`, `npm test`, and a production build.

The `package.json` overrides keep `qs` on the patched 6.x line and `body-parser` on the patched 1.x line while upstream packages still pin older releases. The scoped `skipper-s3` override updates its AWS SDK within v2, preserving the adapter API.

As of September 10, 2026, `npm audit` still reports findings inherited from `sails-hook-uploads` (`b64`/`hoek`), `sails-hook-content` (`showdown`), and `skipper-s3` (AWS SDK v2/`uuid`). Resolving these requires upstream fixes or tested replacements; npm's proposed downgrades do not establish compatibility. Track the remaining work in [#112](https://github.com/sailscastshq/boring-stack/issues/112).

Revisit overrides when the upstream constraints include patched versions. Do not remove them based only on a successful install.
