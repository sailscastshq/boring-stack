---
name: unit-testing
description: Helper and business-logic testing with Sounding — sails.helpers, worlds, factories, scenarios, assertions, and light app-aware trials
metadata:
  tags: unit-testing, sounding, helpers, worlds, scenarios, factories, node-test
---

# Unit Testing

In The Boring JavaScript Stack, unit testing now means **light Sounding trials**, not a separate framework story.

Use these trials for:

- `sails.helpers.*`
- pure business logic
- model-adjacent rules that do not need a browser
- helper orchestration and return values

## The default shape

```js
const { test } = require('sounding')

test('signupWithTeam creates a team', async ({ sails, expect }) => {
  const result = await sails.helpers.user.signupWithTeam({
    fullName: 'Kelvin O',
    email: 'kelvin@example.com',
    tosAcceptedByIp: '127.0.0.1'
  })

  expect(result.user.email).toBe('kelvin@example.com')
  expect(result.team.name).toBeDefined()
})
```

Guidelines:

- prefer `sails.helpers.*` as the canonical surface
- keep these trials fast and business-focused
- do not boot a browser for helper behavior
- prefer `expect()` over raw `assert` in the public DX

## When to load a world

A helper trial does not always need a world.
But when the behavior is easier to understand as a business situation, use one.

```js
test('publisher editor world creates a draft issue', async ({
  sails,
  expect
}) => {
  const current = await sails.sounding.world.use('publisher-editor')

  expect(current.users.publisher).toBeDefined()
  expect(current.issues.draftIssue.status).toBe('draft')
})
```

Use a world when it makes the test more truthful and easier to read.
Do not use one when the helper only needs a direct input and output.

## Factories and scenarios

Put primitive builders under `tests/factories/`:

```text
tests/factories/
  user.js
  issue.js
  subscription.js
```

Put business situations under `tests/scenarios/`:

```text
tests/scenarios/
  issue-access.js
  publisher-editor.js
  magic-link-signin.js
```

Rules of thumb:

- a **factory** describes one record shape well
- a **scenario** composes factories into a named situation
- a **world** is the resolved return value of a scenario
- an **actor** is the role inside that world

## Good helper trials

Good helper trials:

- prove one business truth
- use readable titles
- avoid giant setup blocks
- use a world only when it improves clarity

Weak helper trials:

- duplicate scenario setup inline
- assert on incidental implementation detail
- create large fake data piles for one tiny rule

## Organizing helper trials

```text
tests/unit/
  helpers/
    capitalize.test.js
    get-user-initials.test.js
    signup-with-team.test.js
```

Mirror the helper names when that makes sense.
When the helper is part of a broader behavior, choose the behavior name instead.
