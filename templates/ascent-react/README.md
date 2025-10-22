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
- **[PrimeReact](https://primereact.org)** - 80+ production-ready UI components
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework for styling PrimeReact components
- **[Rsbuild](https://rsbuild.dev)** - Fast build tool powered by Rspack (via Sails Shipwright)

### Development & Build Tools

- **[Sails Hook Shipwright](https://github.com/sailscastshq/sails-hook-shipwright)** - Modern asset pipeline with hot reload
- **[Prettier](https://prettier.io)** - Code formatting with Tailwind plugin
- **Node.js Test Runner** - Built-in testing with no additional dependencies
- **[Playwright](https://playwright.dev)** - End-to-end testing framework

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

### 🎨 UI/UX Features

- **Responsive Design** - Mobile-first responsive layouts
- **PrimeReact + Tailwind** - Rich components styled with utility classes
- **Toast Notifications** - User feedback with PrimeReact Toast
- **Loading States** - Comprehensive loading and error states
- **Form Validation** - Client and server-side validation
- **Accessibility** - WCAG-compliant components

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**

### Installation

```bash
# Clone or download the template
npm install

# Copy example configuration
cp config/local.js.example config/local.js

# Start development server
npm run dev
# or
npx sails lift
```

Visit `http://localhost:1337` to see your application running!

### Development Commands

```bash
# Development with hot reload
npm run dev

# Production server
npm start

# Code formatting
npm run lint          # Check formatting
npm run lint:fix      # Auto-fix formatting

# Testing
npm test              # Run all tests
npm run test:unit     # Unit tests only

# Sails.js generators
npx sails generate controller auth/signup
npx sails generate action auth/login
npx sails generate model Product
npx sails generate helper format-date
```

## ✅ Developer Checklist

Use this checklist to set up your SaaS application:

### Initial Setup

- [ ] **Clone/download** the Ascent React template
- [ ] **Install dependencies** with `npm install`
- [ ] **Copy configuration** with `cp config/local.js.example config/local.js`
- [ ] **Configure local settings** in `config/local.js`
- [ ] **Test the application** runs with `npm run dev`

### Database Configuration (Optional)

- [ ] **Choose your database** (PostgreSQL, MySQL, MongoDB, or stick with Sails Disk for development)
- [ ] **Install database adapter** if needed (`sails-postgresql`, `sails-mysql`, `sails-mongo`)
- [ ] **Configure connection** in `config/local.js` or `config/datastores.js`
- [ ] **Run first migration** with `npx sails lift` (creates tables)

### Authentication Setup

- [ ] **Configure email** settings in `config/local.js`
- [ ] **Set up OAuth providers** (Google, GitHub) with your client IDs and secrets
- [ ] **Configure 2FA settings** (TOTP, email verification)
- [ ] **Test auth flows** (signup, login, password reset)

### Payment Integration

- [ ] **Set up Lemon Squeezy** account and API keys
- [ ] **Configure webhooks** for payment events
- [ ] **Set up subscription plans** in Lemon Squeezy dashboard
- [ ] **Test payment flows** in sandbox mode

### Email Configuration

- [ ] **Choose email provider** (SendGrid, Mailgun, SMTP, or use MailHog for development)
- [ ] **Configure email settings** in `config/local.js`
- [ ] **Customize email templates** in `views/emails/`
- [ ] **Test transactional emails** (welcome, reset, etc.)

### File Upload Setup

- [ ] **Set up cloud storage** (AWS S3, Cloudflare R2, etc.) or use local disk storage
- [ ] **Configure upload settings** in `config/local.js`
- [ ] **Test file upload functionality**

### Customization

- [ ] **Update branding** (logo, colors, typography)
- [ ] **Customize Tailwind config** in `tailwind.config.js`
- [ ] **Modify PrimeReact themes** to match your design
- [ ] **Update application metadata** (name, description, etc.)

### Production Deployment

- [ ] **Set up production database** (managed service recommended)
- [ ] **Configure Redis** for sessions and caching
- [ ] **Set up file storage** (AWS S3 or similar)
- [ ] **Configure environment variables** for production
- [ ] **Set up monitoring** and error tracking
- [ ] **Configure CI/CD pipeline** for automated deployments

### Content & SEO

- [ ] **Set up blog content** in `content/blog/`
- [ ] **Configure SEO settings** (meta tags, sitemap)
- [ ] **Add analytics** (Google Analytics, Plausible)
- [ ] **Set up sitemap generation**

### Testing & Quality

- [ ] **Write unit tests** for critical business logic
- [ ] **Set up E2E tests** with Playwright
- [ ] **Configure code formatting** with Prettier
- [ ] **Set up pre-commit hooks** for code quality

## 🎨 PrimeReact + Tailwind Usage

Ascent React combines PrimeReact's rich components with Tailwind's utility classes:

### Authentication Form Example

```jsx
import { useForm } from '@inertiajs/react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Card } from 'primereact/card'

export default function LoginForm() {
  const { data, setData, post, processing, errors } = useForm({
    emailAddress: '',
    password: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/login')
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>

        <div className="space-y-4">
          <div>
            <InputText
              placeholder="Email address"
              value={data.emailAddress}
              onChange={(e) => setData('emailAddress', e.target.value)}
              className={`w-full ${errors.emailAddress ? 'p-invalid' : ''}`}
            />
            {errors.emailAddress && (
              <small className="p-error block mt-1">
                {errors.emailAddress}
              </small>
            )}
          </div>

          <div>
            <Password
              placeholder="Password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              feedback={false}
              toggleMask
              className="w-full"
            />
          </div>
        </div>

        <Button
          type="submit"
          label="Sign In"
          className="w-full"
          loading={processing}
          severity="info"
        />
      </form>
    </Card>
  )
}
```

### Team Management Table

```jsx
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'

export default function TeamMembers({ members }) {
  const roleTemplate = (member) => (
    <Tag
      value={member.role}
      severity={member.role === 'owner' ? 'success' : 'info'}
      className="text-xs"
    />
  )

  const actionTemplate = (member) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      text
      size="small"
      onClick={() => removeMember(member.id)}
    />
  )

  return (
    <div className="bg-white rounded-lg border">
      <DataTable
        value={members}
        className="text-sm"
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="user.fullName" header="Name" />
        <Column field="user.emailAddress" header="Email" />
        <Column body={roleTemplate} header="Role" />
        <Column body={actionTemplate} header="Actions" />
      </DataTable>
    </div>
  )
}
```

## 🛠️ Development with Warp

**✨ Enhanced Development Experience with Warp**

This template ships with a comprehensive `WARP.md` file that provides Warp AI with detailed context about your project structure, patterns, and conventions. This enables intelligent code assistance, including:

- **Smart Code Generation** - Generate components, controllers, and models following project patterns
- **Context-Aware Suggestions** - Get suggestions that understand your Sails.js + React + PrimeReact architecture
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

- **[The Boring Stack Docs](https://docs.sailscasts.com/boring-stack)** - Complete documentation
- **[Database Guide](https://docs.sailscasts.com/boring-stack/database)** - Database setup and configuration
- **[Sails.js Documentation](https://sailsjs.com/documentation)** - Backend framework guide
- **[Inertia.js Guide](https://inertiajs.com)** - Modern monolith approach
- **[PrimeReact Components](https://primereact.org)** - UI component library
- **[React 19 Documentation](https://react.dev)** - Latest React features
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and join our community.

## 📄 License

MIT License - feel free to use this template for any project.

---

_Built with ❤️ by [The Sailscasts Company](https://sailscasts.com) - Part of [The Boring Stack](https://github.com/sailscastshq/boring-stack)_
