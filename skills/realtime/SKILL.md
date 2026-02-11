---
name: realtime
description: >
  WebSocket and realtime communication with sails-hook-sockets for Sails.js applications.
  Use this skill when building chat, notifications, live updates, presence tracking, or any
  feature that requires persistent bidirectional communication between server and client.
metadata:
  author: sailscastshq
  version: '1.0.0'
  tags: realtime, websockets, sockets, pubsub, socket.io, rooms, sails
---

# Realtime — WebSocket Communication

Sails provides two tiers of realtime support via sails-hook-sockets: low-level room-based messaging (`sails.sockets`) and high-level model-centric notifications (Resourceful PubSub). Both use Socket.IO under the hood and integrate seamlessly with Sails' request lifecycle.

## When to Use

Use this skill when:

- Building chat, messaging, or collaborative features
- Sending live notifications to specific users or groups
- Broadcasting model changes (created, updated, destroyed) to subscribers
- Tracking online presence or user status
- Creating live dashboards with auto-updating data
- Configuring WebSocket security, Redis adapters, or multi-server deployment
- Integrating sails.io.js with React, Vue, or Svelte frontends

## Rules

Read individual rule files for detailed explanations and code examples:

- [rules/getting-started.md](rules/getting-started.md) - What realtime means in Sails, two-tier architecture, setup
- [rules/sails-sockets.md](rules/sails-sockets.md) - Low-level `sails.sockets` API: rooms, broadcast, blast
- [rules/resourceful-pubsub.md](rules/resourceful-pubsub.md) - High-level model API: subscribe, publish, unsubscribe
- [rules/client-side.md](rules/client-side.md) - sails.io.js client library and frontend integration
- [rules/configuration.md](rules/configuration.md) - `config/sockets.js`, Redis adapter, security, lifecycle
- [rules/patterns.md](rules/patterns.md) - Chat rooms, notifications, presence, live dashboards
