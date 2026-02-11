---
name: client-side
description: sails.io.js client library — connection, virtual request methods, event listeners, JWR responses, and integration with React, Vue, and Svelte via Inertia.js
metadata:
  tags: sails.io.js, client, io.socket, events, react, vue, svelte, realtime
---

# Client-Side Integration

The `sails.io.js` client library provides the browser-side SDK for connecting to the Sails WebSocket server. It auto-connects on load and exposes methods that mirror HTTP verbs.

## Including sails.io.js

### Script Tag

```html
<!-- Load Socket.IO client first -->
<script src="/dependencies/socket.io.min.js"></script>
<!-- Then load sails.io.js -->
<script src="/dependencies/sails.io.js"></script>
```

### With Inertia.js / Module Bundler

Place `sails.io.js` in `assets/dependencies/` and import it in your app entry:

```js
// assets/js/app.js
import '../dependencies/sails.io.js'
```

Or load it via a script tag in your layout template so it's available globally.

## `io.sails` — Global Configuration

Configure the socket connection before it auto-connects:

```html
<script>
  // Must be set BEFORE sails.io.js loads (or before auto-connect fires)
  io.sails.url = 'https://api.example.com'
  io.sails.autoConnect = true // Default: true
  io.sails.reconnection = true // Default: true
  io.sails.environment = 'production' // Default: inferred from URL
  io.sails.transports = ['websocket'] // Default: ['websocket']
  io.sails.headers = {
    // Custom headers sent with handshake
    'x-custom-header': 'value'
  }
</script>
```

### Configuration Options

| Option         | Default                   | Description                         |
| -------------- | ------------------------- | ----------------------------------- |
| `url`          | `undefined` (same origin) | Server URL to connect to            |
| `autoConnect`  | `true`                    | Auto-connect when sails.io.js loads |
| `reconnection` | `true`                    | Auto-reconnect on disconnect        |
| `transports`   | `['websocket']`           | Transport methods to use            |
| `environment`  | inferred                  | `'production'` or `'development'`   |
| `headers`      | `{}`                      | Custom headers for handshake        |

## `io.socket` — Virtual Request Methods

Once connected, `io.socket` provides methods that send WebSocket messages routed through the Sails router as virtual HTTP requests.

### `io.socket.get(url, [data], callback)`

```js
io.socket.get('/api/users', (data, jwr) => {
  console.log('Users:', data)
  console.log('Status:', jwr.statusCode)
})

// With query parameters
io.socket.get('/api/users', { status: 'active', limit: 10 }, (data, jwr) => {
  console.log('Active users:', data)
})
```

### `io.socket.post(url, [data], callback)`

```js
io.socket.post(
  '/api/messages',
  {
    text: 'Hello!',
    room: 'general'
  },
  (data, jwr) => {
    if (jwr.statusCode === 200) {
      console.log('Message sent:', data)
    }
  }
)
```

### `io.socket.put(url, [data], callback)`

```js
io.socket.put(
  '/api/users/42',
  {
    fullName: 'Jane Smith'
  },
  (data, jwr) => {
    console.log('Updated:', data)
  }
)
```

### `io.socket.patch(url, [data], callback)`

```js
io.socket.patch(
  '/api/users/42',
  {
    status: 'away'
  },
  (data, jwr) => {
    console.log('Patched:', data)
  }
)
```

### `io.socket.delete(url, [data], callback)`

```js
io.socket.delete('/api/messages/99', (data, jwr) => {
  if (jwr.statusCode === 200) {
    console.log('Deleted')
  }
})
```

### `io.socket.request(options, callback)`

Low-level method for custom requests:

```js
io.socket.request(
  {
    method: 'post',
    url: '/api/messages',
    data: { text: 'Hello' },
    headers: { 'x-custom': 'value' }
  },
  (data, jwr) => {
    console.log(data)
  }
)
```

## JWR (JSON WebSocket Response)

All callback functions receive `(data, jwr)` where `jwr` is the JSON WebSocket Response:

```js
io.socket.get('/api/users/42', (data, jwr) => {
  jwr.body // Response body (same as `data`)
  jwr.statusCode // HTTP status code (200, 404, 500, etc.)
  jwr.headers // Response headers
})
```

### Error Handling

```js
io.socket.get('/api/users/42', (data, jwr) => {
  if (jwr.statusCode >= 400) {
    console.error('Error:', jwr.statusCode, data)
    return
  }
  // Handle success
})
```

## Event Listeners

### `io.socket.on(eventName, handler)`

Listen for server-pushed events:

```js
// Listen for custom events from sails.sockets.broadcast()
io.socket.on('newMessage', (data) => {
  console.log('New message:', data.text, 'from', data.sender)
})

// Listen for model events from Resourceful PubSub
io.socket.on('user', (event) => {
  switch (event.verb) {
    case 'updated':
      console.log('User updated:', event.id, event.data)
      break
    case 'destroyed':
      console.log('User deleted:', event.id)
      break
  }
})

// Default event name ('message') from broadcast() without eventName
io.socket.on('message', (data) => {
  console.log('Message:', data)
})
```

### `io.socket.off(eventName, handler)`

Remove an event listener:

```js
function handleMessage(data) {
  console.log(data)
}

io.socket.on('newMessage', handleMessage)

// Later, remove the listener
io.socket.off('newMessage', handleMessage)
```

### Special Events

```js
// Connection established
io.socket.on('connect', () => {
  console.log('Connected to server')
})

// Connection lost
io.socket.on('disconnect', () => {
  console.log('Disconnected from server')
})
```

## Connection Management

### `io.socket.isConnected()`

Check connection status:

```js
if (io.socket.isConnected()) {
  io.socket.post('/api/messages', { text: 'Hello' })
} else {
  console.log('Not connected — message will be queued')
}
```

### `io.socket.disconnect()`

Manually disconnect:

```js
io.socket.disconnect()
```

### `io.socket.reconnect()`

Manually reconnect after disconnect:

```js
io.socket.reconnect()
```

### `io.sails.connect(url, options)`

Create a second socket connection (to a different server):

```js
const analyticsSocket = io.sails.connect('https://analytics.example.com', {
  transports: ['websocket']
})

analyticsSocket.get('/api/events', (data) => {
  console.log('Analytics:', data)
})
```

## Framework Integration

### React

Use `useEffect` for subscribing to events and cleaning up listeners:

```jsx
import { useEffect, useState } from 'react'

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Subscribe to the room via WebSocket
    io.socket.get(`/api/chat/${roomId}/subscribe`, (initialMessages) => {
      setMessages(initialMessages)
    })

    // Listen for new messages
    function handleNewMessage(data) {
      setMessages((prev) => [...prev, data])
    }

    io.socket.on('newMessage', handleNewMessage)

    // Cleanup: remove listener when component unmounts or roomId changes
    return () => {
      io.socket.off('newMessage', handleNewMessage)
      io.socket.post(`/api/chat/${roomId}/unsubscribe`)
    }
  }, [roomId])

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id}>
          {msg.sender}: {msg.text}
        </li>
      ))}
    </ul>
  )
}
```

### Vue (Composition API)

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({ roomId: String })
const messages = ref([])

function handleNewMessage(data) {
  messages.value.push(data)
}

onMounted(() => {
  io.socket.get(`/api/chat/${props.roomId}/subscribe`, (initialMessages) => {
    messages.value = initialMessages
  })

  io.socket.on('newMessage', handleNewMessage)
})

onUnmounted(() => {
  io.socket.off('newMessage', handleNewMessage)
  io.socket.post(`/api/chat/${props.roomId}/unsubscribe`)
})
</script>

<template>
  <ul>
    <li v-for="msg in messages" :key="msg.id">
      {{ msg.sender }}: {{ msg.text }}
    </li>
  </ul>
</template>
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte'

  export let roomId

  let messages = []

  function handleNewMessage(data) {
    messages = [...messages, data]
  }

  onMount(() => {
    io.socket.get(`/api/chat/${roomId}/subscribe`, (initialMessages) => {
      messages = initialMessages
    })

    io.socket.on('newMessage', handleNewMessage)
  })

  onDestroy(() => {
    io.socket.off('newMessage', handleNewMessage)
    io.socket.post(`/api/chat/${roomId}/unsubscribe`)
  })
</script>

<ul>
  {#each messages as msg (msg.id)}
    <li>{msg.sender}: {msg.text}</li>
  {/each}
</ul>
```

## Using with Inertia.js

When using Inertia.js, sails.io.js operates alongside Inertia's client-side router. The two don't conflict — Inertia handles page navigation (full page props replacement), while sails.io.js handles real-time event streams.

A common pattern is to use Inertia for initial page data and sails.io.js for live updates:

```jsx
import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

function Notifications() {
  // Initial data from Inertia page props
  const { notifications: initialNotifications } = usePage().props

  const [notifications, setNotifications] = useState(initialNotifications)

  useEffect(() => {
    // Subscribe to user-specific notifications via WebSocket
    io.socket.get('/api/notifications/subscribe')

    function handleNotification(data) {
      if (data.verb === 'created') {
        setNotifications((prev) => [data.data, ...prev])
      }
    }

    io.socket.on('notification', handleNotification)

    return () => {
      io.socket.off('notification', handleNotification)
    }
  }, [])

  return (
    <ul>
      {notifications.map((n) => (
        <li key={n.id}>{n.message}</li>
      ))}
    </ul>
  )
}
```
