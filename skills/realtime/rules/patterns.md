---
name: patterns
description: Common realtime patterns with complete examples — chat rooms, live notifications, presence tracking, live dashboards, collaborative editing, and real-time search
metadata:
  tags: patterns, chat, notifications, presence, dashboard, collaboration, realtime
---

# Common Realtime Patterns

Complete, ready-to-use examples for common realtime scenarios. Each pattern includes server-side actions and client-side listener code.

## Chat Rooms

### Server: Join, Leave, and Send Messages

```js
// api/controllers/chat/join.js
module.exports = {
  inputs: {
    roomId: { type: 'string', required: true }
  },

  fn: async function ({ roomId }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    const room = await ChatRoom.findOne({ id: roomId })
    if (!room) {
      return this.res.notFound()
    }

    sails.sockets.join(this.req, `chat-${roomId}`)

    // Notify others that someone joined
    sails.sockets.broadcast(
      `chat-${roomId}`,
      'userJoined',
      {
        userId: this.req.session.userId,
        roomId
      },
      this.req
    )

    // Return recent message history
    const messages = await ChatMessage.find({
      room: roomId,
      sort: 'createdAt DESC',
      limit: 50
    }).populate('sender')

    return messages.reverse()
  }
}

// api/controllers/chat/leave.js
module.exports = {
  inputs: {
    roomId: { type: 'string', required: true }
  },

  fn: async function ({ roomId }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    // Notify others before leaving
    sails.sockets.broadcast(
      `chat-${roomId}`,
      'userLeft',
      {
        userId: this.req.session.userId,
        roomId
      },
      this.req
    )

    sails.sockets.leave(this.req, `chat-${roomId}`)
    return { left: true }
  }
}

// api/controllers/chat/send.js
module.exports = {
  inputs: {
    roomId: { type: 'string', required: true },
    text: { type: 'string', required: true, maxLength: 2000 }
  },

  fn: async function ({ roomId, text }) {
    const message = await ChatMessage.create({
      room: roomId,
      sender: this.req.session.userId,
      text
    }).fetch()

    const populated = await ChatMessage.findOne({ id: message.id }).populate(
      'sender'
    )

    // Broadcast to all sockets in the room (except sender)
    sails.sockets.broadcast(`chat-${roomId}`, 'newMessage', populated, this.req)

    return populated
  }
}
```

### Server: Typing Indicators

```js
// api/controllers/chat/typing.js
module.exports = {
  inputs: {
    roomId: { type: 'string', required: true },
    isTyping: { type: 'boolean', required: true }
  },

  fn: async function ({ roomId, isTyping }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    sails.sockets.broadcast(
      `chat-${roomId}`,
      'typing',
      {
        userId: this.req.session.userId,
        isTyping
      },
      this.req
    )

    return { ok: true }
  }
}
```

### Client: React Chat Component

```jsx
import { useEffect, useState, useCallback, useRef } from 'react'

function ChatRoom({ roomId, currentUser }) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // Join the room
    io.socket.get('/api/chat/join', { roomId }, (data) => {
      setMessages(data)
    })

    // Listen for new messages
    function handleNewMessage(msg) {
      setMessages((prev) => [...prev, msg])
    }

    // Listen for typing indicators
    function handleTyping({ userId, isTyping }) {
      setTypingUsers((prev) => {
        const next = new Set(prev)
        if (isTyping) next.add(userId)
        else next.delete(userId)
        return next
      })
    }

    io.socket.on('newMessage', handleNewMessage)
    io.socket.on('typing', handleTyping)

    return () => {
      io.socket.off('newMessage', handleNewMessage)
      io.socket.off('typing', handleTyping)
      io.socket.get('/api/chat/leave', { roomId })
    }
  }, [roomId])

  const sendMessage = useCallback(
    (text) => {
      io.socket.post('/api/chat/send', { roomId, text }, (data, jwr) => {
        if (jwr.statusCode === 200) {
          setMessages((prev) => [...prev, data])
        }
      })
    },
    [roomId]
  )

  const handleInputChange = useCallback(() => {
    io.socket.post('/api/chat/typing', { roomId, isTyping: true })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      io.socket.post('/api/chat/typing', { roomId, isTyping: false })
    }, 2000)
  }, [roomId])

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender.fullName}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {typingUsers.size > 0 && (
        <div className="typing-indicator">
          {typingUsers.size === 1
            ? 'Someone is typing...'
            : `${typingUsers.size} people typing...`}
        </div>
      )}
    </div>
  )
}
```

## Live Notifications

### Server: User-Specific Notification Rooms

```js
// api/controllers/notifications/subscribe.js
module.exports = {
  fn: async function () {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    const userId = this.req.session.userId
    if (!userId) {
      return this.res.forbidden()
    }

    // Join user-specific notification room
    sails.sockets.join(this.req, `user-${userId}-notifications`)

    // Return unread count
    const unreadCount = await Notification.count({
      user: userId,
      read: false
    })

    return { unreadCount }
  }
}

// api/helpers/send-notification.js
module.exports = {
  friendlyName: 'Send notification',

  inputs: {
    userId: { type: 'string', required: true },
    type: { type: 'string', required: true },
    message: { type: 'string', required: true },
    data: { type: 'ref', defaultsTo: {} }
  },

  fn: async function ({ userId, type, message, data }) {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      data,
      read: false
    }).fetch()

    // Push to user's notification room
    sails.sockets.broadcast(`user-${userId}-notifications`, 'notification', {
      verb: 'created',
      data: notification
    })

    return notification
  }
}
```

### Using the Helper From Any Action

```js
// api/controllers/orders/create.js
module.exports = {
  fn: async function () {
    const order = await Order.create({
      /* ... */
    }).fetch()

    // Notify the admin
    await sails.helpers.sendNotification.with({
      userId: order.assignedAdmin,
      type: 'new-order',
      message: `New order #${order.id} received`,
      data: { orderId: order.id }
    })

    return order
  }
}
```

### Client: Notification Toast

```jsx
import { useEffect, useState } from 'react'

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    io.socket.get('/api/notifications/subscribe', (data) => {
      setUnreadCount(data.unreadCount)
    })

    function handleNotification(event) {
      if (event.verb === 'created') {
        setUnreadCount((prev) => prev + 1)

        // Show toast
        const toast = { id: Date.now(), message: event.data.message }
        setToasts((prev) => [...prev, toast])

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, 5000)
      }
    }

    io.socket.on('notification', handleNotification)

    return () => {
      io.socket.off('notification', handleNotification)
    }
  }, [])

  return (
    <div>
      <button className="relative">
        Notifications
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Presence Tracking

### Server: Online/Offline Status

```js
// api/controllers/presence/subscribe.js
module.exports = {
  fn: async function () {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    const userId = this.req.session.userId
    if (!userId) {
      return this.res.forbidden()
    }

    // Join presence room
    sails.sockets.join(this.req, 'presence')

    // Also join user-specific room for targeted updates
    sails.sockets.join(this.req, `user-${userId}`)

    // Mark user as online
    await User.updateOne({ id: userId }).set({
      isOnline: true,
      lastSeenAt: Date.now()
    })

    // Notify others
    sails.sockets.broadcast(
      'presence',
      'userOnline',
      {
        userId,
        timestamp: Date.now()
      },
      this.req
    )

    // Return current online users
    const onlineUsers = await User.find({ isOnline: true }).select([
      'id',
      'fullName',
      'avatarUrl'
    ])

    return onlineUsers
  }
}
```

### Server: Cleanup on Disconnect

```js
// config/sockets.js
module.exports.sockets = {
  afterDisconnect: async function (session, socket, done) {
    if (session.userId) {
      await User.updateOne({ id: session.userId }).set({
        isOnline: false,
        lastSeenAt: Date.now()
      })

      sails.sockets.broadcast('presence', 'userOffline', {
        userId: session.userId,
        timestamp: Date.now()
      })
    }

    done()
  }
}
```

### Client: Online Users List

```jsx
import { useEffect, useState } from 'react'

function OnlineUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    io.socket.get('/api/presence/subscribe', (onlineUsers) => {
      setUsers(onlineUsers)
    })

    function handleOnline({ userId }) {
      setUsers((prev) => {
        if (prev.find((u) => u.id === userId)) return prev
        return [...prev, { id: userId }]
      })
    }

    function handleOffline({ userId }) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }

    io.socket.on('userOnline', handleOnline)
    io.socket.on('userOffline', handleOffline)

    return () => {
      io.socket.off('userOnline', handleOnline)
      io.socket.off('userOffline', handleOffline)
    }
  }, [])

  return (
    <div>
      <h3>Online ({users.length})</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <span className="online-dot" /> {user.fullName}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Live Dashboard

### Server: Dashboard Data with Resourceful PubSub

```js
// api/controllers/dashboard/subscribe.js
module.exports = {
  fn: async function () {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    // Join dashboard room for aggregate updates
    sails.sockets.join(this.req, 'dashboard')

    // Subscribe to recent orders via Resourceful PubSub
    const recentOrders = await Order.find({
      sort: 'createdAt DESC',
      limit: 20
    })

    await Order.subscribe(
      this.req,
      recentOrders.map((o) => o.id)
    )

    return {
      orders: recentOrders,
      stats: {
        totalOrders: await Order.count(),
        pendingOrders: await Order.count({ status: 'pending' }),
        revenue: await Order.sum('amount', { status: 'completed' })
      }
    }
  }
}

// api/controllers/orders/update-status.js
module.exports = {
  inputs: {
    id: { type: 'string', required: true },
    status: { type: 'string', required: true }
  },

  fn: async function ({ id, status }) {
    const order = await Order.updateOne({ id }).set({ status })
    if (!order) {
      return this.res.notFound()
    }

    // Publish change to subscribers of this order
    Order.publish(
      [id],
      {
        verb: 'updated',
        id,
        data: { status: order.status, updatedAt: order.updatedAt }
      },
      this.req
    )

    // Also update dashboard stats
    sails.sockets.broadcast('dashboard', 'statsUpdated', {
      pendingOrders: await Order.count({ status: 'pending' }),
      revenue: await Order.sum('amount', { status: 'completed' })
    })

    return order
  }
}
```

### Client: Auto-Updating Dashboard

```jsx
import { useEffect, useState } from 'react'

function Dashboard() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    io.socket.get('/api/dashboard/subscribe', (data) => {
      setOrders(data.orders)
      setStats(data.stats)
    })

    // Listen for order model updates (Resourceful PubSub)
    function handleOrderEvent(event) {
      if (event.verb === 'updated') {
        setOrders((prev) =>
          prev.map((o) => (o.id === event.id ? { ...o, ...event.data } : o))
        )
      } else if (event.verb === 'created') {
        setOrders((prev) => [event.data, ...prev.slice(0, 19)])
      }
    }

    // Listen for aggregate stats updates
    function handleStatsUpdated(newStats) {
      setStats((prev) => ({ ...prev, ...newStats }))
    }

    io.socket.on('order', handleOrderEvent)
    io.socket.on('statsUpdated', handleStatsUpdated)

    return () => {
      io.socket.off('order', handleOrderEvent)
      io.socket.off('statsUpdated', handleStatsUpdated)
    }
  }, [])

  return (
    <div>
      <div className="stats-grid">
        <div>Total Orders: {stats.totalOrders}</div>
        <div>Pending: {stats.pendingOrders}</div>
        <div>Revenue: ${stats.revenue}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.status}</td>
              <td>${order.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Collaborative Editing

### Server: Document Rooms with Cursor Tracking

```js
// api/controllers/documents/join.js
module.exports = {
  inputs: {
    docId: { type: 'string', required: true }
  },

  fn: async function ({ docId }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    const doc = await Document.findOne({ id: docId })
    if (!doc) {
      return this.res.notFound()
    }

    sails.sockets.join(this.req, `doc-${docId}`)

    // Notify others that someone joined
    sails.sockets.broadcast(
      `doc-${docId}`,
      'collaboratorJoined',
      {
        userId: this.req.session.userId
      },
      this.req
    )

    return doc
  }
}

// api/controllers/documents/update.js
module.exports = {
  inputs: {
    docId: { type: 'string', required: true },
    content: { type: 'string', required: true },
    cursorPosition: { type: 'number' }
  },

  fn: async function ({ docId, content, cursorPosition }) {
    const doc = await Document.updateOne({ id: docId }).set({ content })
    if (!doc) {
      return this.res.notFound()
    }

    sails.sockets.broadcast(
      `doc-${docId}`,
      'documentUpdated',
      {
        content,
        userId: this.req.session.userId,
        cursorPosition,
        timestamp: Date.now()
      },
      this.req
    )

    return doc
  }
}

// api/controllers/documents/cursor.js
module.exports = {
  inputs: {
    docId: { type: 'string', required: true },
    position: { type: 'number', required: true }
  },

  fn: async function ({ docId, position }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    sails.sockets.broadcast(
      `doc-${docId}`,
      'cursorMoved',
      {
        userId: this.req.session.userId,
        position
      },
      this.req
    )

    return { ok: true }
  }
}
```

## Real-Time Search

### Server: Push Updated Results

```js
// api/controllers/search/subscribe.js
module.exports = {
  inputs: {
    query: { type: 'string', required: true }
  },

  fn: async function ({ query }) {
    if (!this.req.isSocket) {
      return this.res.badRequest('WebSocket required')
    }

    // Leave previous search room (if any)
    const prevQuery = this.req.session.searchQuery
    if (prevQuery) {
      sails.sockets.leave(this.req, `search-${prevQuery}`)
    }

    // Join new search room
    this.req.session.searchQuery = query
    sails.sockets.join(this.req, `search-${query}`)

    // Return initial results
    const results = await Product.find({
      or: [{ name: { contains: query } }, { description: { contains: query } }],
      limit: 20
    })

    return results
  }
}

// api/controllers/products/create.js — notify search rooms
module.exports = {
  inputs: {
    name: { type: 'string', required: true },
    description: { type: 'string' },
    price: { type: 'number', required: true }
  },

  fn: async function ({ name, description, price }) {
    const product = await Product.create({ name, description, price }).fetch()

    // Broadcast to relevant search rooms
    for (const term of name.toLowerCase().split(' ')) {
      sails.sockets.broadcast(`search-${term}`, 'searchResultAdded', {
        product
      })
    }

    return product
  }
}
```

### Client: Live Search Results

```jsx
import { useEffect, useState, useCallback, useRef } from 'react'

function LiveSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const debounceRef = useRef(null)

  const doSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    io.socket.get('/api/search/subscribe', { query: searchQuery }, (data) => {
      setResults(data)
    })
  }, [])

  useEffect(() => {
    function handleNewResult({ product }) {
      setResults((prev) => [product, ...prev])
    }

    io.socket.on('searchResultAdded', handleNewResult)

    return () => {
      io.socket.off('searchResultAdded', handleNewResult)
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search products..."
      />
      <ul>
        {results.map((product) => (
          <li key={product.id}>
            {product.name} — ${product.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
```
