---
name: sails-sockets
description: Low-level sails.sockets API reference — room management (join, leave, leaveAll), broadcasting (broadcast, blast), socket lookup (getId, get), and bulk operations
metadata:
  tags: sails.sockets, rooms, broadcast, blast, join, leave, api, realtime
---

# sails.sockets API

The `sails.sockets` object provides low-level methods for room management and broadcasting. All methods are available after Sails lifts.

## Room Management

### `sails.sockets.join(socket, roomName, [cb])`

Subscribe a socket to a room. Sockets in a room receive messages broadcast to that room.

```js
// Join using the request object (most common)
sails.sockets.join(req, 'chat-general')

// Join using a socket object directly
sails.sockets.join(req.socket, 'chat-general')

// Join using a socket ID string (works cross-server with Redis)
sails.sockets.join('abc123socketId', 'chat-general')

// With callback
sails.sockets.join(req, 'chat-general', (err) => {
  if (err) {
    return res.serverError(err)
  }
  return res.ok()
})
```

**Parameters:**

| Param      | Type                   | Description                                                           |
| ---------- | ---------------------- | --------------------------------------------------------------------- |
| `socket`   | req, socket, or string | The socket to subscribe (request object, socket object, or socket ID) |
| `roomName` | string                 | Name of the room to join                                              |
| `cb`       | function               | Optional callback `(err)`                                             |

A socket can be in multiple rooms simultaneously. Room names are arbitrary strings.

### `sails.sockets.leave(socket, roomName, [cb])`

Unsubscribe a socket from a room.

```js
sails.sockets.leave(req, 'chat-general')

// With callback
sails.sockets.leave(req, 'chat-general', (err) => {
  if (err) {
    return res.serverError(err)
  }
  sails.log.info('Left the room')
})
```

**Parameters:** Same as `join()`.

### `sails.sockets.leaveAll(roomName, [cb])`

Remove all sockets from a room and unsubscribe them.

```js
// Remove everyone from the room
sails.sockets.leaveAll('chat-general')

// With callback
sails.sockets.leaveAll('chat-general', (err) => {
  if (err) {
    return res.serverError(err)
  }
  sails.log.info('Room cleared')
})
```

Useful for cleanup when a chat room is deleted or a session ends.

### `sails.sockets.addRoomMembersToRooms(sourceRoom, destRooms, [cb])`

Subscribe all sockets in one room to one or more additional rooms.

```js
// Everyone in 'team-alpha' also joins 'company-announcements'
sails.sockets.addRoomMembersToRooms('team-alpha', 'company-announcements')

// Add to multiple rooms at once
sails.sockets.addRoomMembersToRooms('team-alpha', ['announcements', 'events'])
```

Works cross-server when using Redis adapter.

### `sails.sockets.removeRoomMembersFromRooms(sourceRoom, destRooms, [cb])`

Unsubscribe all sockets in one room from one or more other rooms.

```js
// Remove everyone in 'team-alpha' from 'announcements'
sails.sockets.removeRoomMembersFromRooms('team-alpha', 'announcements')

// Remove from multiple rooms
sails.sockets.removeRoomMembersFromRooms('team-alpha', [
  'announcements',
  'events'
])
```

## Broadcasting

### `sails.sockets.broadcast(roomNames, [eventName], data, [socketToOmit])`

Send a message to all sockets in one or more rooms.

```js
// Broadcast to a single room (default event name: 'message')
sails.sockets.broadcast('chat-general', { text: 'Hello!' })

// Broadcast with a custom event name
sails.sockets.broadcast('chat-general', 'newMessage', {
  text: 'Hello everyone!',
  sender: 'Alice',
  timestamp: Date.now()
})

// Broadcast to multiple rooms
sails.sockets.broadcast(['chat-general', 'chat-random'], 'announcement', {
  text: 'Server maintenance in 5 minutes'
})

// Broadcast but exclude the sender (pass req as last arg)
sails.sockets.broadcast(
  'chat-general',
  'newMessage',
  {
    text: 'Hello!',
    sender: 'Alice'
  },
  req
)
```

**Parameters:**

| Param          | Type               | Description                                 |
| -------------- | ------------------ | ------------------------------------------- |
| `roomNames`    | string or string[] | Room(s) to broadcast to                     |
| `eventName`    | string             | Event name (default: `'message'`)           |
| `data`         | object             | Message payload                             |
| `socketToOmit` | req or socket      | Socket that should NOT receive this message |

**Omitting the sender:** The last argument pattern is the most common way to prevent the sender from receiving their own message. Pass `req` (the request object) as the last argument:

```js
// In an action that handles a chat message:
module.exports = {
  fn: async function () {
    const message = await Message.create({
      text: this.req.param('text'),
      sender: this.req.session.userId
    }).fetch()

    // Broadcast to everyone in the room EXCEPT the sender
    sails.sockets.broadcast('chat-general', 'newMessage', message, this.req)

    return message
  }
}
```

### `sails.sockets.blast([eventName], data, [socketToOmit])`

Broadcast to ALL connected sockets in the default namespace (not scoped to a room).

```js
// Blast to everyone
sails.sockets.blast('systemAlert', {
  message: 'Server restarting in 5 minutes'
})

// Blast with default event name ('message')
sails.sockets.blast({ type: 'maintenance', eta: 300 })

// Blast but exclude one socket
sails.sockets.blast('systemAlert', { message: 'Hello' }, req)
```

**Use sparingly** — blasting to all sockets is rarely what you want. Prefer `broadcast()` with specific rooms.

## Socket Lookup

### `sails.sockets.getId(req)`

Get the socket ID from a request object.

```js
const socketId = sails.sockets.getId(req)
sails.log.info(`Socket ${socketId} connected`)
```

Returns `undefined` if the request is not a socket request.

### `sails.sockets.get(socketId)`

Get a socket object by its ID.

```js
const socket = sails.sockets.get(socketId)
```

**Important:** Only finds sockets connected to the current server. In a multi-server setup with Redis, use socket IDs with `join()`/`leave()` instead (they work cross-server).

### `sails.sockets.parseSocket(req)`

Extract the socket object from a request:

```js
const socket = sails.sockets.parseSocket(req)
if (socket) {
  // It's a socket request
}
```

## Default Event Name

When `eventName` is omitted from `broadcast()` or `blast()`, the default event name is `'message'`:

```js
// These are equivalent:
sails.sockets.broadcast('room', { text: 'hi' })
sails.sockets.broadcast('room', 'message', { text: 'hi' })

// Client listens on 'message' event:
io.socket.on('message', (data) => {
  console.log(data.text) // 'hi'
})
```

## Common Room Naming Conventions

Use descriptive, namespaced room names:

```js
// Per-user rooms (for notifications)
sails.sockets.join(req, `user-${userId}`)

// Per-resource rooms (for live updates)
sails.sockets.join(req, `order-${orderId}`)

// Feature-specific rooms
sails.sockets.join(req, `chat-${roomId}`)
sails.sockets.join(req, `dashboard-stats`)

// Role-based rooms
sails.sockets.join(req, 'admins')
sails.sockets.join(req, 'moderators')
```

## Action Pattern: Subscribe + Broadcast

The typical pattern is: one action subscribes sockets to a room, another action broadcasts updates.

```js
// api/controllers/orders/subscribe.js — Subscribe to order updates
module.exports = {
  inputs: {
    orderId: { type: 'string', required: true }
  },

  fn: async function ({ orderId }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    const order = await Order.findOne({ id: orderId })
    if (!order) {
      return this.res.notFound()
    }

    sails.sockets.join(this.req, `order-${orderId}`)
    return order
  }
}

// api/controllers/orders/update-status.js — Update and broadcast
module.exports = {
  inputs: {
    orderId: { type: 'string', required: true },
    status: { type: 'string', required: true }
  },

  fn: async function ({ orderId, status }) {
    const order = await Order.updateOne({ id: orderId }).set({ status })
    if (!order) {
      return this.res.notFound()
    }

    // Broadcast to all subscribers of this order
    sails.sockets.broadcast(`order-${orderId}`, 'orderUpdated', {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt
    })

    return order
  }
}
```
