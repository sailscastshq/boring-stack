---
name: getting-started
description: What realtime means in Sails, two-tier architecture, virtual requests, setup, and the relationship between HTTP and WebSocket requests
metadata:
  tags: setup, architecture, virtual-requests, sockets, basics, realtime
---

# Getting Started with Realtime

## What is Realtime in Sails?

Traditional HTTP is request-response: the client asks, the server answers, the connection closes. Realtime communication uses WebSockets to maintain a persistent, bidirectional connection between client and server. This enables the server to push updates to the client at any time — without the client having to poll.

Sails provides realtime support through `sails-hook-sockets`, built on Socket.IO 4.x. It adds two powerful capabilities:

1. **Virtual requests** — socket messages are routed through the same Sails router as HTTP requests, so the same actions handle both
2. **Room-based messaging** — organize connected sockets into rooms for targeted broadcasting

## Two-Tier Architecture

Sails offers two levels of realtime API:

### Tier 1: `sails.sockets` (Low-Level)

Direct room management and broadcasting. Use this for custom messaging patterns.

```js
// Join a socket to a room
sails.sockets.join(req, 'chat-room-42')

// Broadcast to everyone in the room
sails.sockets.broadcast('chat-room-42', 'newMessage', {
  text: 'Hello everyone!',
  sender: 'Alice'
})
```

### Tier 2: Resourceful PubSub (High-Level)

Model-centric notifications. Subscribe sockets to specific records and publish changes automatically.

```js
// Subscribe the requesting socket to changes on these users
User.subscribe(req, [userId])

// Later, when a user is updated, notify all subscribers
User.publish([userId], {
  verb: 'updated',
  data: { status: 'online' }
})
```

### When to Use Which

| Scenario                            | Use                               |
| ----------------------------------- | --------------------------------- |
| Chat rooms, custom channels         | `sails.sockets`                   |
| Typing indicators, cursor positions | `sails.sockets`                   |
| Model CRUD notifications            | Resourceful PubSub                |
| Live data tables, dashboards        | Resourceful PubSub                |
| User-specific notifications         | Either (rooms or model subscribe) |

## Virtual Requests

The most powerful concept in Sails realtime is **virtual requests**. When a client sends a message over a WebSocket, the hook converts it into a virtual HTTP request and routes it through the standard Sails router. This means:

- The same actions handle both HTTP and WebSocket requests
- Routes, policies, and middleware all apply
- Sessions are shared between HTTP and WebSocket connections

```js
// This action handles BOTH HTTP GET /api/messages and socket GET /api/messages
// api/controllers/messages/list.js
module.exports = {
  fn: async function () {
    const messages = await Message.find({ room: this.req.param('room') })

    // If this is a socket request, subscribe to future messages
    if (this.req.isSocket) {
      sails.sockets.join(this.req, `room-${this.req.param('room')}`)
    }

    return messages
  }
}
```

### Detecting Socket Requests

Use `req.isSocket` to check if a request came from a WebSocket:

```js
if (req.isSocket) {
  // This is a WebSocket request
  sails.sockets.join(req, 'some-room')
}
```

Additional request properties available for socket requests:

```js
req.isSocket // true for WebSocket requests
req.socket // The raw Socket.IO socket object
req.transport // 'socket.io'
req.protocol // 'ws'
```

## Installation

Install sails-hook-sockets:

```bash
npm install sails-hook-sockets
```

The hook auto-registers with Sails — no manual configuration needed for basic usage.

## Client Library

The client-side library `sails.io.js` provides the SDK for connecting to the Sails WebSocket server. Include it in your frontend:

```html
<script src="/dependencies/sails.io.js"></script>
```

Or in an Inertia.js app, load it in your entry file:

```js
// assets/js/app.js
import '../dependencies/sails.io.js'
```

Once loaded, `io.socket` auto-connects and provides methods to make virtual requests:

```js
// These send WebSocket messages that are routed like HTTP requests
io.socket.get('/api/messages', { room: 'general' }, (data, jwr) => {
  console.log(data) // Response body (same as HTTP response)
  console.log(jwr.statusCode) // HTTP status code
})

io.socket.post(
  '/api/messages',
  {
    room: 'general',
    text: 'Hello!'
  },
  (data, jwr) => {
    console.log('Message sent')
  }
)
```

## Session Integration

WebSocket connections share the same session as HTTP requests. When a user logs in via HTTP, their socket connection has access to the same session data:

```js
// The user logged in via HTTP POST /login
// Their socket connection shares the session
module.exports = {
  fn: async function () {
    // req.session is the same whether HTTP or socket
    const userId = this.req.session.userId

    if (this.req.isSocket && userId) {
      // Subscribe this user's socket to their notification room
      sails.sockets.join(this.req, `user-${userId}`)
    }
  }
}
```

Session sharing works because sockets send the session cookie during the handshake, and Sails loads the same session store entry.

## How It Works Under the Hood

```
Browser                          Sails Server
───────                          ────────────
1. Page loads sails.io.js
2. io.socket auto-connects  ──→  Socket.IO handshake
                                  ↓
                                  Session loaded from cookie
                                  beforeConnect() runs (if configured)
                                  Socket connection accepted
                                  ↓
3. io.socket.get('/api/x') ──→  Virtual request created
                                  ↓
                                  Routed through Sails router
                                  Policies applied
                                  Action executed
                                  ↓
4. Callback fired          ←──  Response sent via socket callback

5. Server pushes update    ←──  sails.sockets.broadcast('room', data)
   io.socket.on('event')
```

## Quick Example: Live Counter

A minimal example showing both tiers in action:

```js
// api/controllers/counter/subscribe.js
module.exports = {
  fn: async function () {
    if (!this.req.isSocket) {
      return this.res.badRequest(
        'This endpoint requires a WebSocket connection'
      )
    }

    sails.sockets.join(this.req, 'counter-watchers')
    return { count: await Visit.count() }
  }
}

// api/controllers/counter/increment.js
module.exports = {
  fn: async function () {
    await Visit.create({ timestamp: Date.now() })
    const count = await Visit.count()

    // Push the new count to all watchers
    sails.sockets.broadcast('counter-watchers', 'counterUpdated', { count })

    return { count }
  }
}
```

Client side:

```js
// Subscribe to counter updates
io.socket.get('/api/counter/subscribe', (data) => {
  console.log('Initial count:', data.count)
})

// Listen for updates
io.socket.on('counterUpdated', (data) => {
  console.log('New count:', data.count)
})
```
