# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Ascent React is a full-stack React SaaS template built on The Boring JavaScript Stack, combining Sails.js backend with React 19 frontend using Inertia.js for seamless server-side rendering without an API layer.

## Development Commands

### Core Development

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev
# or alternatively
npx sails lift

# Production server
npm start
# or
NODE_ENV=production node app.js

# Lint and format code
npm run lint          # Check code formatting
npm run lint:fix      # Auto-fix formatting issues

# Run tests
npm test              # Run all unit tests
npm run test:unit     # Run unit tests specifically

# Run single test file
node --test ./tests/unit/helpers.test.js
```

### Sails.js Specific Commands

```bash
# Generate Sails components
npx sails generate controller auth/signup
npx sails generate action auth/login
npx sails generate model User
npx sails generate helper format-date

# Run custom scripts
npx sails run cleanup-expired-magic-link-tokens

# Console access for debugging
npx sails console

# Drop database (in development)
npx sails lift --drop
```

## Architecture Overview

### Stack Components

- **Backend**: Sails.js MVC framework with built-in ORM (Waterline)
- **Frontend**: React 19 with PrimeReact UI components
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Sails Hook Shipwright (Rsbuild) with React plugin
- **Data Flow**: Inertia.js eliminates the need for separate API routes

### Key Architecture Patterns

**Modern Monolith with Inertia.js**

- Controllers return `{ page: 'component-path' }` with `responseType: 'inertia'`
- React components receive server data as props automatically
- No API routes needed - data flows directly from controllers to components
- Page components located in `assets/js/pages/`

**Authentication System**

- Session-based authentication with multiple strategies:
  - Password-based login/signup
  - Magic link authentication
  - OAuth (Google) integration
- User model includes comprehensive auth fields and token management
- Policies: `is-authenticated.js` and `is-guest.js` for route protection

**React Component Structure**

```
assets/js/
├── app.js              # Inertia.js setup with PrimeReact provider
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks (e.g., useFlashToast)
├── layouts/           # App layouts (AppLayout.jsx)
└── pages/             # Inertia pages matching controller responses
```

### Database and Models

- Uses Waterline ORM (database agnostic)
- User model with comprehensive authentication features
- Custom model lifecycle callbacks (beforeCreate, beforeUpdate)
- Built-in password hashing and user initialization

### Configuration System

- Environment-specific configs in `config/env/`
- Production config includes security, caching, and deployment settings
- Custom configuration for Inertia.js integration
- Shipwright build configuration with React plugin

## Development Workflow

### Adding New Features

1. **Create route** in `config/routes.js`
2. **Generate controller** action: `npx sails generate action feature/action-name`
3. **Create React page** in `assets/js/pages/feature/`
4. **Controller returns** `{ page: 'feature/page-name' }` with data as props

### Creating API Endpoints (when needed)

```javascript
// In controller
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },
  fn: async function () {
    // Logic here
    return { page: 'dashboard/index', users: users }
  }
}
```

### Authentication Implementation

- Use `is-authenticated` policy for protected routes
- Session data available via `req.session.userId`
- User data automatically passed to React components via AppLayout
- Magic link tokens have cleanup script for maintenance

### Error Handling

- Use `.intercept()` method instead of try/catch blocks for database operations
- Example: `await Model.create(data).intercept('E_UNIQUE', 'customExitName')`
- This provides cleaner error handling that integrates with Sails exit system

### Styling Guidelines

- Custom Tailwind config with brand colors (brand, accent, success)
- PrimeReact components with unstyled mode + Tailwind passthrough
- Design system uses consistent color palette and spacing
- Responsive design patterns throughout

## Testing Strategy

- Unit tests for helpers using Node.js built-in test runner
- Tests bootstrap Sails app with `environment: 'testing'`
- Integration tests can be added for controllers and models
- Frontend components can be tested with React Testing Library

## Build and Deployment

### Asset Pipeline

- Shipwright (Rsbuild) handles React compilation and bundling
- PostCSS processes Tailwind styles
- Hot reload in development via `node --watch app.js`
- Production builds optimize for performance

### Production Considerations

- Configure database adapter in `config/env/production.js`
- Set up Redis for session storage and socket.io scaling
- Enable HTTPS and security headers
- Configure CORS and trusted proxies
- Use environment variables for sensitive configuration

## Key Files and Their Purposes

- `app.js` - Application entry point
- `config/routes.js` - URL routing definitions
- `config/inertia.js` - Inertia.js configuration
- `config/shipwright.js` - Asset build configuration
- `assets/js/app.js` - Frontend entry point with PrimeReact setup
- `api/models/User.js` - Comprehensive user model with auth features
- `scripts/` - Maintenance scripts (token cleanup, etc.)

## Common Patterns

### Controller Pattern

```javascript
module.exports = {
  friendlyName: 'Action name',
  exits: { success: { responseType: 'inertia' } },
  fn: async function () {
    return { page: 'component/path', data: processedData }
  }
}
```

### React Component Pattern

```javascript
import { usePage } from '@inertiajs/react'

export default function Component() {
  const { data } = usePage().props
  // Component logic
}
```
