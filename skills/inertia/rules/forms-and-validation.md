---
name: forms-and-validation
description: Form handling with useForm, form submission patterns, validation errors, and the badRequest flow
metadata:
  tags: forms, useForm, validation, errors, badRequest, problems, submission
---

# Forms and Validation

## The useForm Hook

Every form in The Boring JavaScript Stack uses Inertia's `useForm` hook. It manages form data, submission, errors, and loading state.

### React

```jsx
import { useForm } from '@inertiajs/react'

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    rememberMe: false
  })

  function submit(e) {
    e.preventDefault()
    post('/login')
  }

  return (
    <form onSubmit={submit}>
      <input
        type="email"
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
      />
      {errors.email && <p className="text-red-500">{errors.email}</p>}

      <input
        type="password"
        value={data.password}
        onChange={(e) => setData('password', e.target.value)}
      />

      <button type="submit" disabled={processing}>
        {processing ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Vue

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  email: '',
  password: '',
  rememberMe: false
})
</script>

<template>
  <form @submit.prevent="form.post('/login')">
    <input type="email" v-model="form.email" />
    <p v-if="form.errors.email" class="text-red-500">{{ form.errors.email }}</p>

    <input type="password" v-model="form.password" />

    <button type="submit" :disabled="form.processing">
      {{ form.processing ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>
```

### Svelte

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    email: null,
    password: null,
    rememberMe: false
  })
</script>

<form on:submit|preventDefault={$form.post('/login')}>
  <input type="email" bind:value={$form.email} />
  {#if $form.errors.email}
    <p class="text-red-500">{$form.errors.email}</p>
  {/if}

  <input type="password" bind:value={$form.password} />

  <button type="submit" disabled={$form.processing}>
    {$form.processing ? 'Logging in...' : 'Login'}
  </button>
</form>
```

## Form Methods

The `useForm` hook provides methods for each HTTP verb:

```js
form.get(url, options) // GET request
form.post(url, options) // POST request
form.patch(url, options) // PATCH request (partial update)
form.put(url, options) // PUT request (full replacement)
form.delete(url, options) // DELETE request
```

## Form Properties

```js
form.data // Current form data object
form.errors // Validation errors { fieldName: 'message' }
form.processing // Boolean -- is the request in flight?
form.recentlySuccessful // Boolean -- true for ~2 seconds after success
form.isDirty // Boolean -- has the form data changed from initial values?
form.wasSuccessful // Boolean -- was the last submission successful?
```

## Submission Options

```js
form.post('/signup', {
  preserveScroll: true, // Keep scroll position after navigation
  preserveState: true, // Don't reset component state
  only: ['users'], // Only reload specific props (partial reload)
  except: ['meta'], // Reload everything except specific props
  onBefore: (visit) => {}, // Before the request is made
  onStart: (visit) => {}, // When the request starts
  onProgress: (progress) => {}, // Upload progress
  onSuccess: (page) => {
    // After successful response
    form.reset('password')
  },
  onError: (errors) => {
    // After validation error
    console.error('Validation failed:', errors)
  },
  onFinish: () => {}, // After request completes (success or error)
  onCancel: () => {} // If the request is cancelled
})
```

## Transform Data Before Submission

Use `transform()` to modify form data before sending:

```jsx
// Only send changed fields
form
  .transform(() => ({
    email: form.email,
    fullName: form.fullName,
    ...(form.avatar instanceof File ? { avatar: form.avatar } : {})
  }))
  .patch('/settings/profile', { preserveScroll: true })
```

## Reset Form Fields

```js
form.reset() // Reset all fields to initial values
form.reset('password') // Reset specific field
form.reset('password', 'confirmPassword') // Reset multiple fields
```

## Validation Error Flow

### Server Side

When validation fails, the action throws with a `problems` array:

```js
// api/controllers/auth/signup.js
exits: {
  badSignupRequest: { responseType: 'badRequest' }
},
fn: async function ({ email, password }) {
  // Approach 1: Throw explicitly
  throw {
    badSignupRequest: {
      problems: [
        { email: 'An account with this email already exists.' }
      ]
    }
  }

  // Approach 2: Intercept a Waterline error
  await User.create({ email, password })
    .intercept('E_UNIQUE', () => ({
      badSignupRequest: {
        problems: [{ email: 'Email is already taken.' }]
      }
    }))
}
```

### How Errors Flow

1. Action throws `{ exitName: { problems: [...] } }`
2. `badRequest` response calls `sails.inertia.handleBadRequest(req, res, data)`
3. `handleBadRequest` parses `problems` into `{ fieldName: 'message' }` format
4. Errors stored in `req.session.errors`
5. **303 redirect back** to the Referrer URL
6. On next page load, Inertia middleware reads `req.session.errors` and shares as `errors` prop
7. `useForm` picks up errors automatically in `form.errors`

### Client Side

Errors are available immediately after the redirect:

```jsx
// React
{
  form.errors.email && (
    <Message severity="error" text={form.errors.email} className="mt-2" />
  )
}
{
  form.errors.password && (
    <p className="text-red-500 text-sm">{form.errors.password}</p>
  )
}

// For general (non-field) errors:
{
  form.errors.login && (
    <div className="bg-red-100 p-4 text-red-500 rounded">
      {form.errors.login}
    </div>
  )
}
```

```vue
<!-- Vue -->
<p v-if="form.errors.email" class="text-red-500">{{ form.errors.email }}</p>
<p v-if="form.errors.login" class="text-red-500">{{ form.errors.login }}</p>
```

## File Uploads

File uploads work with `useForm` -- just include a `File` object:

```jsx
const { data, setData, post } = useForm({
  avatar: null,
  fullName: ''
})

function handleFileChange(file) {
  setData('avatar', file) // File object
}

function submit(e) {
  e.preventDefault()
  // Inertia automatically uses FormData when a File is detected
  post('/settings/profile')
}
```

On the server, use Sails' upload handling:

```js
fn: async function ({ avatar }) {
  if (avatar) {
    var uploadedFiles = await sails.helpers.uploadOne(avatar)
    // ... process uploaded file
  }
}
```

## Multiple Forms on One Page

Use separate `useForm` instances:

```jsx
const profileForm = useForm({
  email: user.email,
  fullName: user.fullName
})

const passwordForm = useForm({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const deleteForm = useForm({})

// Each form submits independently
profileForm.patch('/settings/profile')
passwordForm.patch('/settings/password')
deleteForm.delete('/settings/profile')
```
