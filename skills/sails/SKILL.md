---
name: sails
description: Sails.js framework patterns for The Boring JavaScript Stack - actions, helpers, routes, policies, hooks, configuration, and more
version: 1.0.0
---

# Sails.js

Sails.js is the MVC backend framework in The Boring JavaScript Stack. It provides convention-over-configuration server-side architecture with actions, helpers, models, policies, hooks, and a powerful routing system. The Boring Stack defaults to the **actions2** format for all controllers and helpers.

## Rules

- [actions](rules/actions.md) - Actions2 format, inputs, exits, response types, and action patterns
- [helpers](rules/helpers.md) - Reusable helpers with inputs, exits, sync/async, error handling
- [routes](rules/routes.md) - Route configuration, dynamic parameters, wildcards, route targets
- [policies](rules/policies.md) - Request guards, policy configuration, authentication patterns
- [hooks](rules/hooks.md) - App-level hooks, lifecycle, shared data, custom hook patterns
- [configuration](rules/configuration.md) - Config files, environment variables, custom settings, datastores
- [responses](rules/responses.md) - Custom response types, the Inertia response flow, error responses
- [security](rules/security.md) - CORS, CSRF, sessions, cookies, security best practices
