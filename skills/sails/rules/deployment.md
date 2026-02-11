---
name: deployment
description: Sails.js deployment - production configuration, Redis sessions, environment setup, migrate safe, performance
metadata:
  tags: deployment, production, redis, environment, performance, hosting, scaling
---

# Deployment

## Production Configuration

Production settings go in `config/env/production.js`. This file is loaded when `NODE_ENV=production`:

```js
// config/env/production.js
module.exports = {
  // Increase hook timeout for slower startup in production
  hookTimeout: 80000,

  datastores: {
    default: {
      adapter: 'sails-postgresql',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for managed databases
    }
  },

  models: {
    migrate: 'safe' // NEVER auto-migrate in production
  },

  blueprints: {
    shortcuts: false // Disable shortcut routes in production
  },

  security: {
    cors: {
      allRoutes: true,
      allowOrigins: [process.env.APP_URL],
      allowCredentials: true
    }
  },

  session: {
    cookie: {
      secure: true, // HTTPS only
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  http: {
    cache: 365.25 * 24 * 60 * 60 * 1000, // Cache static assets for 1 year
    trustProxy: true // Behind load balancer/reverse proxy
  },

  custom: {
    baseUrl: process.env.APP_URL
  },

  log: {
    level: 'warn' // Less verbose logging in production
  }
}
```

## Migration Strategy

**Development**: `migrate: 'alter'` -- Automatically adjusts tables when models change. May lose data on column type changes.

**Production**: `migrate: 'safe'` -- Never auto-migrate. You must manage schema changes manually with database migrations.

```js
// config/models.js (development default)
module.exports.models = {
  migrate: 'alter'
}

// config/env/production.js
module.exports = {
  models: {
    migrate: 'safe'
  }
}
```

## Redis Session Store

In-memory sessions don't persist across restarts or scale across multiple processes. Use Redis for production:

```bash
npm install @sailshq/connect-redis
```

```js
// config/env/production.js
module.exports = {
  session: {
    adapter: '@sailshq/connect-redis',
    url: process.env.REDIS_URL,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }
}
```

## Environment Variables

Use environment variables for all secrets and environment-specific configuration:

```bash
# Required in production
NODE_ENV=production
SESSION_SECRET=your-random-session-secret
DATABASE_URL=postgresql://user:pass@host:5432/dbname
APP_URL=https://myapp.com

# Optional
REDIS_URL=redis://user:pass@host:6379
DATA_ENCRYPTION_KEY=base64-encoded-key
STRIPE_SECRET_KEY=sk_live_...
```

Access in config files:

```js
// config/custom.js
module.exports.custom = {
  baseUrl: process.env.APP_URL || 'http://localhost:1337',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || ''
}

// config/session.js
module.exports.session = {
  secret: process.env.SESSION_SECRET || 'development-secret'
}
```

## config/local.js

The `config/local.js` file is gitignored and used for developer-specific overrides:

```js
// config/local.js (gitignored)
module.exports = {
  port: 1338, // Use a different port locally
  datastores: {
    default: {
      url: 'postgresql://localhost/myapp_dev'
    }
  },
  custom: {
    stripeSecretKey: 'sk_test_my_personal_key'
  }
}
```

## Port and Host Configuration

```js
// config/env/production.js
module.exports = {
  port: process.env.PORT || 1337
  // explicitHost: '0.0.0.0'  // Listen on all interfaces (for Docker)
}
```

Most hosting platforms set `PORT` automatically (Heroku, Render, Railway, etc.).

## Logging Levels

```js
// config/env/production.js
module.exports = {
  log: {
    level: 'warn' // Only warnings and errors
    // Options: 'verbose', 'info', 'debug', 'warn', 'error', 'silent'
  }
}
```

| Level     | Shows                                                 |
| --------- | ----------------------------------------------------- |
| `verbose` | Everything (very noisy)                               |
| `info`    | Info, debug, warnings, errors                         |
| `debug`   | Debug messages, warnings, errors                      |
| `warn`    | Warnings and errors only (recommended for production) |
| `error`   | Errors only                                           |
| `silent`  | Nothing                                               |

## Production Security Checklist

1. **`migrate: 'safe'`** -- Never auto-migrate production databases
2. **Session secret** -- Use a strong, unique `SESSION_SECRET` env var
3. **HTTPS** -- Set `cookie.secure: true` in session config
4. **CSRF enabled** -- Keep `csrf: true` in `config/security.js`
5. **CORS restricted** -- Only allow your domain in `allowOrigins`
6. **Redis sessions** -- Use Redis instead of in-memory sessions
7. **Environment variables** -- No hardcoded secrets in config files
8. **Data encryption key** -- Set via env var, not in source
9. **`trustProxy: true`** -- Enable when behind a reverse proxy
10. **Static asset caching** -- Set long cache headers

## Process Management

Run Sails in production with a process manager:

```bash
# Using PM2
pm2 start app.js --name "myapp" -i max

# Using Node directly (for Docker)
NODE_ENV=production node app.js
```

## Docker Deployment

```dockerfile
FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

ENV NODE_ENV=production
EXPOSE 1337

CMD ["node", "app.js"]
```

## Health Check Endpoint

Add a simple health check route for load balancers:

```js
// config/routes.js
'GET /api/health': { action: 'health-check' }

// api/controllers/health-check.js
module.exports = {
  exits: {
    success: { responseType: '' }  // Raw JSON
  },
  fn: async function () {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime()
    }
  }
}
```

## Scaling

Sails apps scale horizontally. Key requirements for multiple processes:

1. **Shared sessions** -- Use Redis session store (not in-memory)
2. **Shared uploads** -- Use cloud storage (S3) instead of local filesystem
3. **No in-process state** -- Store everything in the database or Redis
4. **Sticky sessions** -- Not required if using Redis sessions

## Database Configuration for Production

### PostgreSQL

```js
// config/env/production.js
datastores: {
  default: {
    adapter: 'sails-postgresql',
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false
  }
}
```

### MySQL

```js
datastores: {
  default: {
    adapter: 'sails-mysql',
    url: process.env.DATABASE_URL
  }
}
```

### SQLite (Development/Small Apps)

```js
// config/datastores.js (default in Boring Stack)
datastores: {
  default: {
    adapter: 'sails-sqlite'
    // Uses ./db/local.db by default
  }
}
```
