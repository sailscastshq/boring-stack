---
name: resourceful-pubsub
description: High-level model-centric notification API — subscribe, publish, unsubscribe, getRoomName, blueprint auto-subscription, and standard verb conventions
metadata:
  tags: pubsub, subscribe, publish, models, notifications, blueprints, realtime
---

# Resourceful PubSub

Resourceful PubSub is a high-level API that sits on top of `sails.sockets`. It provides model-centric notifications — subscribe sockets to specific records and publish changes using conventional event names and verb structures.

## How It Works

Resourceful PubSub uses `sails.sockets` under the hood:

1. Each model record gets a conventional room name (e.g., `sails_model_user_42`)
2. `Model.subscribe()` joins a socket to these rooms
3. `Model.publish()` broadcasts to these rooms using the model identity as the event name
4. Clients listen for events named after the model (e.g., `'user'`)

## Core API

### `Model.subscribe(req, ids)`

Subscribe a socket to notifications about specific records.

```js
// Subscribe to a single record
await User.subscribe(req, [userId])

// Subscribe to multiple records
await User.subscribe(req, [userId1, userId2, userId3])
```

**Parameters:**

| Param | Type    | Description                                                 |
| ----- | ------- | ----------------------------------------------------------- |
| `req` | request | The socket request object (must be `req.isSocket === true`) |
| `ids` | array   | Array of record IDs to subscribe to                         |

**Important:** `req` must be a socket request. Calling `subscribe()` from an HTTP request has no effect.

```js
// api/controllers/users/view.js
module.exports = {
  inputs: {
    id: { type: 'string', required: true }
  },

  fn: async function ({ id }) {
    const user = await User.findOne({ id })
    if (!user) {
      return this.res.notFound()
    }

    // If this is a socket request, subscribe to this user's updates
    if (this.req.isSocket) {
      await User.subscribe(this.req, [id])
    }

    return user
  }
}
```

### `Model.publish(ids, data, [req])`

Broadcast a message to all sockets subscribed to the specified records.

```js
// Notify subscribers that a user was updated
User.publish([userId], {
  verb: 'updated',
  id: userId,
  data: { status: 'online', lastSeenAt: Date.now() }
})

// Omit the sender (pass req as third argument)
User.publish(
  [userId],
  {
    verb: 'updated',
    id: userId,
    data: { fullName: 'Jane Smith' }
  },
  req
)
```

**Parameters:**

| Param  | Type    | Description                                                      |
| ------ | ------- | ---------------------------------------------------------------- |
| `ids`  | array   | Array of record IDs whose subscribers should receive the message |
| `data` | object  | Message payload (conventionally includes `verb`, `id`, `data`)   |
| `req`  | request | Optional — socket request to exclude from broadcast              |

### `Model.unsubscribe(req, ids)`

Remove a socket's subscription to specific records.

```js
// Unsubscribe from a single record
await User.unsubscribe(req, [userId])

// Unsubscribe from multiple records
await User.unsubscribe(req, [userId1, userId2])
```

### `Model.getRoomName(id)`

Get the conventional room name for a record. Useful for advanced patterns where you need to combine Resourceful PubSub with low-level `sails.sockets` operations.

```js
const roomName = User.getRoomName(userId)
// Returns something like 'sails_model_user_42'

// Use with sails.sockets for custom operations
sails.sockets.broadcast(roomName, 'customEvent', { data: 'value' })
```

## Standard Verb Conventions

When publishing changes, use these standard verb names for consistency:

### `created`

A new record was created:

```js
// After creating a new message in a chat
const message = await Message.create({ text, room, sender }).fetch()

Message.publish([message.id], {
  verb: 'created',
  id: message.id,
  data: message
})
```

### `updated`

An existing record was modified:

```js
// After updating a user's profile
const user = await User.updateOne({ id: userId }).set({ fullName: 'New Name' })

User.publish([userId], {
  verb: 'updated',
  id: userId,
  data: { fullName: user.fullName },
  previous: { fullName: 'Old Name' } // Optional: include previous values
})
```

### `destroyed`

A record was deleted:

```js
// After deleting a comment
await Comment.destroyOne({ id: commentId })

Comment.publish([commentId], {
  verb: 'destroyed',
  id: commentId
})
```

### `added` / `removed`

Records were added to or removed from an association:

```js
// User was added to a group
await Group.addToCollection(groupId, 'members').members([userId])

Group.publish([groupId], {
  verb: 'added',
  id: groupId,
  attribute: 'members',
  addedIds: [userId]
})

// User was removed from a group
await Group.removeFromCollection(groupId, 'members').members([userId])

Group.publish([groupId], {
  verb: 'removed',
  id: groupId,
  attribute: 'members',
  removedIds: [userId]
})
```

## Blueprint Auto-Subscription

When using Sails blueprints, socket requests to `find` and `findOne` blueprint actions automatically subscribe the requesting socket to the returned records.

```js
// Client makes a socket request to the blueprint find action:
io.socket.get('/api/user', (users) => {
  // The socket is now automatically subscribed to all returned users
  // Any future User.publish() calls for these users will be received
})

// Listen for model events:
io.socket.on('user', (event) => {
  console.log(event.verb) // 'updated', 'destroyed', etc.
  console.log(event.data) // Changed data
})
```

This is the default behavior for blueprint actions. For custom actions, you must call `Model.subscribe()` explicitly.

## Event Naming

The event name for Resourceful PubSub notifications is the **lowercase model identity**:

| Model         | Event Name      |
| ------------- | --------------- |
| `User`        | `'user'`        |
| `ChatMessage` | `'chatmessage'` |
| `OrderItem`   | `'orderitem'`   |

```js
// Server publishes:
User.publish([userId], { verb: 'updated', data: { status: 'online' } })

// Client listens:
io.socket.on('user', (event) => {
  if (event.verb === 'updated') {
    console.log('User updated:', event.data)
  }
})
```

## Combining with sails.sockets

You can mix Resourceful PubSub with low-level `sails.sockets` for flexible patterns:

```js
// Subscribe to model changes via PubSub
await Order.subscribe(req, [orderId])

// Also join a custom room for order-specific chat
sails.sockets.join(req, `order-chat-${orderId}`)

// Later, publish model update via PubSub
Order.publish([orderId], {
  verb: 'updated',
  id: orderId,
  data: { status: 'shipped' }
})

// AND broadcast a custom message to the chat room
sails.sockets.broadcast(`order-chat-${orderId}`, 'orderChat', {
  text: 'Your order has shipped!',
  type: 'system'
})
```

## Complete Example: Live Task Board

```js
// api/controllers/tasks/list.js — Subscribe to all tasks in a project
module.exports = {
  inputs: {
    projectId: { type: 'string', required: true }
  },

  fn: async function ({ projectId }) {
    const tasks = await Task.find({ project: projectId })

    if (this.req.isSocket) {
      // Subscribe to all returned tasks
      await Task.subscribe(
        this.req,
        tasks.map((t) => t.id)
      )

      // Also join project room for new task notifications
      sails.sockets.join(this.req, `project-${projectId}`)
    }

    return tasks
  }
}

// api/controllers/tasks/create.js — Create and notify
module.exports = {
  inputs: {
    projectId: { type: 'string', required: true },
    title: { type: 'string', required: true }
  },

  fn: async function ({ projectId, title }) {
    const task = await Task.create({ project: projectId, title }).fetch()

    // Notify project room about the new task
    sails.sockets.broadcast(
      `project-${projectId}`,
      'task',
      {
        verb: 'created',
        id: task.id,
        data: task
      },
      this.req
    )

    return task
  }
}

// api/controllers/tasks/update.js — Update and publish
module.exports = {
  inputs: {
    id: { type: 'string', required: true },
    status: { type: 'string' },
    title: { type: 'string' }
  },

  fn: async function ({ id, status, title }) {
    const changes = {}
    if (status) changes.status = status
    if (title) changes.title = title

    const task = await Task.updateOne({ id }).set(changes)
    if (!task) {
      return this.res.notFound()
    }

    // Publish to all subscribers of this task
    Task.publish(
      [id],
      {
        verb: 'updated',
        id,
        data: changes
      },
      this.req
    )

    return task
  }
}
```
