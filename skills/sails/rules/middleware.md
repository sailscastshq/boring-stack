---
name: middleware
description: Sails.js HTTP middleware configuration - Express middleware, config/http.js, custom middleware, middleware order
metadata:
  tags: middleware, http, express, bodyParser, session, cookies, compression
---

# Middleware

Sails.js is built on Express and uses an HTTP middleware pipeline. Middleware runs on every request before routing occurs.

## config/http.js

The middleware pipeline is configured in `config/http.js`:

```js
// config/http.js
module.exports.http = {
  middleware: {
    // Middleware execution order
    order: [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'assetLog',
      'www',
      'favicon'
    ]

    // Custom middleware definitions
    // myCustomMiddleware: function(req, res, next) { ... }
  }
}
```

### Default Middleware Order

| Position | Middleware     | Purpose                                                  |
| -------- | -------------- | -------------------------------------------------------- |
| 1        | `cookieParser` | Parse cookies from request headers                       |
| 2        | `session`      | Initialize session from cookie/store                     |
| 3        | `bodyParser`   | Parse JSON and form-encoded request bodies               |
| 4        | `compress`     | Gzip response compression                                |
| 5        | `poweredBy`    | Set `X-Powered-By` header (removed in production)        |
| 6        | **`router`**   | Sails router -- matches routes and dispatches to actions |
| 7        | `assetLog`     | Log static asset requests (development only)             |
| 8        | `www`          | Serve static files from `.tmp/public/`                   |
| 9        | `favicon`      | Serve favicon                                            |

**Important**: The `router` middleware is where Sails takes over. Everything before `router` runs on every request. Everything after only runs if no route matched.

## Adding Custom Middleware

Add middleware by defining it in `config/http.js` and inserting it into the `order` array:

```js
// config/http.js
module.exports.http = {
  middleware: {
    order: [
      'cookieParser',
      'session',
      'requestLogger', // Custom middleware
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon'
    ],

    // Define the custom middleware
    requestLogger: function (req, res, next) {
      sails.log.verbose(`${req.method} ${req.url}`)
      return next()
    }
  }
}
```

### Middleware as npm Packages

Use Express-compatible middleware packages:

```js
// config/http.js
const helmet = require('helmet')

module.exports.http = {
  middleware: {
    order: [
      'cookieParser',
      'session',
      'helmetMiddleware',
      'bodyParser',
      'compress',
      'router',
      'www',
      'favicon'
    ],

    helmetMiddleware: helmet({
      contentSecurityPolicy: false // CSP handled separately
    })
  }
}
```

## Production Middleware Settings

```js
// config/env/production.js
module.exports = {
  http: {
    cache: 365.25 * 24 * 60 * 60 * 1000, // Cache static assets for 1 year
    trustProxy: true // Trust X-Forwarded-* headers from load balancers
  }
}
```

### trustProxy

Enable `trustProxy` when behind a reverse proxy (Nginx, Heroku, AWS ELB, Cloudflare):

```js
http: {
  trustProxy: true
}
```

This allows `req.ip` to return the real client IP (from `X-Forwarded-For`) instead of the proxy's IP. Also needed for `req.protocol` to correctly return `https`.

## Body Parser Configuration

The default body parser handles JSON and URL-encoded form data. For large file uploads, you may need to increase limits:

```js
// config/http.js
module.exports.http = {
  middleware: {
    order: [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'router',
      'www',
      'favicon'
    ],

    // Skipper body parser with file upload support and error handling
    bodyParser: (function () {
      var skipper = require('skipper')
      return skipper({
        strict: true,
        limit: '10MB',
        onBodyParserError: (err, req, res) => {
          if (
            _.isNumber(err.statusCode) &&
            err.statusCode >= 400 &&
            err.statusCode < 500
          ) {
            return res.status(400).send(err.message)
          } else if (req.url.match(sails.LOOKS_LIKE_ASSET_RX)) {
            return res.status(403).send()
          } else {
            sails.log.error('Body parser error:', err)
            return res.status(500).send()
          }
        }
      })
    })(),

    // Custom error handler for edge cases (must be last in order)
    middlewareErrorHandler: function (err, req, res, next) {
      if (err.message === 'Range Not Satisfiable') {
        return res.status(416).send()
      } else if (err.message === 'Precondition Failed') {
        return res.status(412).send()
      } else {
        return next(err)
      }
    }
  }
}
```

## Middleware vs Hooks vs Policies

| Mechanism       | When it runs                   | Scope                   | Use case                      |
| --------------- | ------------------------------ | ----------------------- | ----------------------------- |
| **Middleware**  | Before routing                 | Every request           | Parsing, compression, logging |
| **Hook routes** | After routing, before policies | Specific route patterns | Shared data, feature flags    |
| **Policies**    | After hooks, before action     | Specific actions        | Authentication, authorization |

Choose the right level:

- **Need to modify req/res for all requests?** → Middleware
- **Need to share data or run logic for route patterns?** → Hook routes
- **Need to guard specific actions?** → Policies

## Overriding Built-in Middleware

Replace a built-in middleware by defining it with the same name:

```js
// config/http.js
module.exports.http = {
  middleware: {
    // Replace the default session middleware
    session: require('express-session')({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ url: process.env.REDIS_URL })
    })
  }
}
```

## Disabling Middleware

Remove a middleware from the `order` array to disable it:

```js
// config/http.js
module.exports.http = {
  middleware: {
    order: [
      'cookieParser',
      'session',
      'bodyParser',
      // 'compress',      // Disable compression (handled by CDN)
      // 'poweredBy',     // Don't expose framework
      'router',
      'www',
      'favicon'
    ]
  }
}
```
