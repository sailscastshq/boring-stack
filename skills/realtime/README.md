# Realtime Skills for Claude Code

Build realtime WebSocket features in Sails.js just by prompting Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/realtime
```

## Usage

After installing, Claude will automatically apply realtime best practices when you work on Sails.js projects:

> "Add a live chat room feature with typing indicators"

> "Set up real-time notifications for new orders"

> "Broadcast model changes to subscribed clients"

## Skills Included

- **getting-started** - What realtime means in Sails, two-tier architecture, setup
- **sails-sockets** - Low-level `sails.sockets` API: rooms, broadcast, blast
- **resourceful-pubsub** - High-level model API: subscribe, publish, unsubscribe
- **client-side** - sails.io.js client library and frontend integration
- **configuration** - `config/sockets.js`, Redis adapter, security, lifecycle
- **patterns** - Chat rooms, notifications, presence, live dashboards

## What is Realtime in Sails?

[sails-hook-sockets](https://github.com/sailscastshq/sails-hook-sockets) provides WebSocket support for Sails.js via Socket.IO. It enables persistent bidirectional communication with room-based messaging and model-centric pub/sub notifications.

## Links

- [Sails.js Documentation](https://sailsjs.com/documentation)
- [WebSockets Reference](https://sailsjs.com/documentation/reference/web-sockets)
- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)

## License

MIT
