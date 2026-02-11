---
name: sails
description: >
  Sails.js framework patterns for The Boring JavaScript Stack - actions, helpers, routes, policies, hooks,
  configuration, security, middleware, file uploads, deployment, and more. Use this skill when building,
  reviewing, or debugging any server-side code in a Sails.js application.
metadata:
  author: sailscastshq
  version: '2.1.0'
  tags: sails, sailsjs, backend, mvc, actions, helpers, routes, policies, hooks, middleware, deployment, boring-stack
---

# Sails.js

Sails.js is the MVC backend framework in The Boring JavaScript Stack. It provides convention-over-configuration server-side architecture with actions, helpers, models, policies, hooks, and a powerful routing system. The Boring Stack defaults to the **actions2** format for all controllers and helpers.

Sails is built on Express and uses the Waterline ORM for database access. It pairs with Inertia.js to render React, Vue, or Svelte frontends without building a separate API.

## Rules

### Getting Started

- [getting-started](rules/getting-started.md) - App anatomy, project structure, file conventions, .sailsrc, globals, bootstrap

### Core Concepts

- [actions](rules/actions.md) - Actions2 format, inputs, exits, response types, and action patterns
- [helpers](rules/helpers.md) - Reusable helpers with inputs, exits, sync/async, error handling
- [routes](rules/routes.md) - Route configuration, dynamic parameters, wildcards, route targets
- [policies](rules/policies.md) - Request guards, policy configuration, authentication patterns
- [hooks](rules/hooks.md) - App-level hooks, lifecycle, shared data, custom hook patterns

### Request Pipeline

- [request-lifecycle](rules/request-lifecycle.md) - How requests flow through hooks, middleware, policies, actions, and responses
- [middleware](rules/middleware.md) - HTTP middleware pipeline, config/http.js, Express middleware, custom middleware

### Configuration & Infrastructure

- [configuration](rules/configuration.md) - Config files, environment variables, custom settings, datastores
- [responses](rules/responses.md) - Custom response types, the Inertia response flow, error responses
- [security](rules/security.md) - CORS, CSRF, sessions, cookies, security best practices
- [deployment](rules/deployment.md) - Production config, Redis sessions, environment setup, scaling

### Framework Reference

- [sails-object](rules/sails-object.md) - The global sails object: sails.config, sails.helpers, sails.models, sails.log, sails.inertia
- [file-uploads](rules/file-uploads.md) - File upload patterns with sails.uploadOne, Skipper, cloud storage
- [shell-scripts](rules/shell-scripts.md) - Background tasks, data migrations, maintenance scripts
- [blueprints](rules/blueprints.md) - Auto-generated REST API, blueprint configuration, when to use
- [generators](rules/generators.md) - Scaffolding with sails generate, custom generators, the page generator
