---
name: configuration
description: config/sockets.js reference — core options, CORS/security, lifecycle callbacks, session integration, Redis adapter setup, and multi-server deployment
metadata:
  tags: config, sockets, redis, security, cors, session, lifecycle, realtime
---

# Configuration

All WebSocket configuration lives in `config/sockets.js`. The hook provides sensible defaults — most apps only need to configure security settings for production.

## Core Options

```js
// config/sockets.js
module.exports.sockets = {
  // Transport methods (default: ['websocket'])
  // Options: 'websocket', 'polling'
  transports: ['websocket'],

  // Path for Socket.IO connections (default: '/socket.io')
  path: '/socket.io',

  // Milliseconds without a pong before considering connection closed (default: 60000)
  pingTimeout: 60000,

  // Milliseconds between ping packets (default: 25000)
  pingInterval: 25000,

  // Maximum message size in bytes (default: 10E7, ~100MB)
  // Acts as DoS protection — reject oversized messages
  maxHttpBufferSize: 10e7,

  // Whether to include HTTP status code in socket responses (default: true)
  sendStatusCode: true,

  // Whether to include response headers in socket responses (default: true)
  sendResponseHeaders: true
}
```

## CORS and Security

### `onlyAllowOrigins` (Required in Production)

Whitelist of allowed origins for WebSocket connections. This prevents cross-site WebSocket hijacking:

```js
// config/env/production.js
module.exports = {
  sockets: {
    onlyAllowOrigins: ['https://myapp.com', 'https://www.myapp.com']
  }
}
```

**If not set in production**, the server will log a warning. Always configure this for production deployments.

In development, CORS is automatically permissive to avoid friction.

### Why This Matters

Unlike HTTP CORS (which browsers enforce), WebSocket connections are not subject to same-origin policy by default. Without `onlyAllowOrigins`, any website could open a WebSocket to your server and piggyback on the user's session cookie — a cross-site WebSocket hijacking attack.

## Lifecycle Callbacks

### `beforeConnect(handshake, cb)`

Authorization callback that runs during the WebSocket handshake, before the connection is accepted. Use it to reject unauthorized connections.

```js
// config/sockets.js
module.exports.sockets = {
  beforeConnect: function (handshake, cb) {
    // handshake contains headers, query params, and address info
    const token = handshake.headers['authorization']

    if (!token) {
      return cb(new Error('No authorization token'), false)
    }

    // Verify the token
    try {
      const decoded = sails.helpers.verifyToken(token)
      // You can attach data to the handshake for later use
      handshake.userId = decoded.userId
      return cb(null, true)
    } catch (err) {
      return cb(new Error('Invalid token'), false)
    }
  }
}
```

**Parameters:**

| Param       | Type     | Description                                                                           |
| ----------- | -------- | ------------------------------------------------------------------------------------- |
| `handshake` | object   | Handshake/upgrade request with `headers`, `query`, `address`                          |
| `cb`        | function | Callback: `cb(err, allow)` — pass `null, true` to accept, or `Error, false` to reject |

### `afterDisconnect(session, socket, done)`

Cleanup callback that runs when a socket disconnects. The session is automatically saved after the callback completes.

```js
// config/sockets.js
module.exports.sockets = {
  afterDisconnect: function (session, socket, done) {
    // Clean up presence tracking
    if (session.userId) {
      User.updateOne({ id: session.userId })
        .set({ isOnline: false, lastSeenAt: Date.now() })
        .then(() => {
          // Notify others that this user went offline
          sails.sockets.broadcast('presence', 'userOffline', {
            userId: session.userId
          })

          done()
        })
        .catch((err) => {
          sails.log.error('Presence cleanup error:', err)
          done()
        })
    } else {
      done()
    }
  }
}
```

**Parameters:**

| Param     | Type     | Description                                        |
| --------- | -------- | -------------------------------------------------- |
| `session` | object   | The socket's session data                          |
| `socket`  | object   | The disconnected socket object                     |
| `done`    | function | Callback — must be called when cleanup is complete |

## Session Integration

WebSocket connections share the HTTP session via cookies:

```js
// config/sockets.js
module.exports.sockets = {
  // Expose route for 3rd-party cookie support (default: true)
  // Needed when your API is on a different domain than your frontend
  grant3rdPartyCookie: true
}
```

### Disabling Sessions for Sockets

To connect without session support, send the `nosession` header during handshake:

```js
// Client-side: connect without session
io.sails.headers = { nosession: true }
```

This is useful for non-browser clients (React Native, CLI tools) that don't use cookie-based sessions.

## Redis Adapter

For multi-server deployments, configure the Redis adapter so all servers share room state and can broadcast to each other.

### Setup

```bash
npm install @sailshq/socket.io-redis
```

```js
// config/sockets.js
module.exports.sockets = {
  adapter: '@sailshq/socket.io-redis',
  adapterOptions: {
    host: 'localhost',
    port: 6379,
    pass: '',
    db: 0
  }
}
```

### Production Redis Config

```js
// config/env/production.js
module.exports = {
  sockets: {
    adapter: '@sailshq/socket.io-redis',
    adapterOptions: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      pass: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0
    },
    onlyAllowOrigins: [process.env.APP_URL]
  }
}
```

### Using Redis URL

```js
// config/sockets.js
module.exports.sockets = {
  adapter: '@sailshq/socket.io-redis',
  adapterOptions: {
    url: process.env.REDIS_URL // e.g., 'redis://user:pass@host:6379/0'
  }
}
```

### Using the Official Socket.IO Redis Adapter

```js
// config/sockets.js
module.exports.sockets = {
  adapter: '@socket.io/redis-adapter',
  adapterOptions: {
    host: 'localhost',
    port: 6379
  }
}
```

### Custom Redis Clients

For advanced setups, provide pre-configured Redis clients:

```js
// config/sockets.js
const Redis = require('ioredis')

const pubClient = new Redis({ host: 'redis.example.com', port: 6379 })
const subClient = pubClient.duplicate()

module.exports.sockets = {
  adapter: '@sailshq/socket.io-redis',
  adapterOptions: {
    pubClient,
    subClient
  }
}
```

### Redis Lifecycle Callbacks

Monitor Redis connection health:

```js
// config/sockets.js
module.exports.sockets = {
  adapter: '@sailshq/socket.io-redis',
  adapterOptions: {
    host: 'localhost',
    port: 6379,

    onRedisDisconnect: function () {
      sails.log.warn('Redis adapter disconnected!')
    },

    onRedisReconnect: function () {
      sails.log.info('Redis adapter reconnected')
    }
  }
}
```

## Multi-Server Architecture

When using the Redis adapter, multiple Sails servers share WebSocket state:

```
Server A (port 3000)          Redis           Server B (port 3001)
───────────────────          ─────           ───────────────────
Socket connects              pub/sub          Socket connects
  ↓                          channel            ↓
sails.sockets.join()  ──→    Sync    ←──  sails.sockets.join()
  ↓                            ↑              ↓
broadcast('room') ────→  Replicated  ──→  Received by sockets
                         to all servers       in same room
```

### How It Works

1. **Room state** is shared via the Redis adapter — all servers know which sockets are in which rooms
2. **Admin bus** uses a separate Redis pub/sub channel for cross-server operations (join, leave, leaveAll)
3. **Broadcasts** automatically reach sockets on all servers
4. **Socket ID operations** (join/leave by ID) work cross-server via the admin bus

### Admin Bus Configuration

The admin bus runs on a separate Redis connection. You can configure it independently:

```js
// config/sockets.js
module.exports.sockets = {
  adapter: '@sailshq/socket.io-redis',
  adapterOptions: {
    host: 'redis-primary.example.com',
    port: 6379
  },
  adminAdapterOptions: {
    host: 'redis-admin.example.com', // Can use a different Redis instance
    port: 6379
  }
}
```

## Complete Production Configuration

```js
// config/env/production.js
module.exports = {
  sockets: {
    // Security
    onlyAllowOrigins: ['https://myapp.com', 'https://www.myapp.com'],

    // Transport
    transports: ['websocket'],

    // Redis adapter for multi-server
    adapter: '@sailshq/socket.io-redis',
    adapterOptions: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      pass: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB) || 0,

      onRedisDisconnect: function () {
        sails.log.warn('Socket.IO Redis adapter disconnected')
      },
      onRedisReconnect: function () {
        sails.log.info('Socket.IO Redis adapter reconnected')
      }
    },

    // Authorization
    beforeConnect: function (handshake, cb) {
      // Add your authorization logic here
      return cb(null, true)
    },

    // Cleanup
    afterDisconnect: function (session, socket, done) {
      // Add your cleanup logic here
      done()
    }
  }
}
```
