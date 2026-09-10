# Ascent Vue - The Boring SaaS Stack 🚀

**Ship products with battle-tested technologies. Say no to chasing JavaScript trends.**

Ascent Vue is a production-ready React SaaS template built on The Boring JavaScript Stack. Focus on shipping to actual real users instead of wrestling with complex build tools and trendy frameworks.

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

- **[Vue 3](https://vuejs.org)** - Latest Vue with Composition API and reactivity system
- **[Inertia.js](https://inertiajs.com)** - Modern monolith approach eliminating API complexity
- **[Klean UI](https://docs.sailscasts.com/klean-ui/)** - Custom Vue component library styled with Tailwind CSS
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
- **Context-Aware Suggestions** - Get suggestions that understand your Sails.js + Vue + Klean UI architecture
- **Debugging Assistance** - Get help troubleshooting issues specific to The Boring Stack
- **Best Practices Guidance** - Ensure your code follows established project conventions

To get the best experience:

1. **Open your project in Warp**
2. **Use Warp AI** for code generation and debugging
3. **Reference the WARP.md** file for project-specific guidance
4. **Ask context-aware questions** about your architecture and implementation

## 📁 Project Structure

```
ascent-vue/
├── api/                     # Sails.js backend
│   ├── controllers/
│   ├── models/
│   ├── helpers/
│   └── policies/
├── assets/js/               # Vue frontend
│   ├── components/          # Reusable Vue components
│   ├── Pages/               # Inertia.js pages
│   ├── layouts/             # Application layouts
│   └── composables/         # Vue composables (like React hooks)
├── config/
├── views/                   # Email templates
├── content/                 # Blog/static content
└── tests/

```

## 📚 Learn More

- **[Ascent Documentation](https://docs.sailscasts.com/boring-stack/ascent)** - Complete Ascent template guide
- **[The Boring Stack Docs](https://docs.sailscasts.com/boring-stack)** - Core stack documentation
- **[Database Guide](https://docs.sailscasts.com/boring-stack/database)** - Database setup and configuration
- **[Sails.js Documentation](https://sailsjs.com/documentation)** - Backend framework guide
- **[Inertia.js Guide](https://inertiajs.com)** - Modern monolith approach
- **[Klean UI Components](https://docs.sailscasts.com/klean-ui/)** - Application-owned UI source
- **[Vue 3 Documentation](https://vuejs.org)** - Latest React features
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
