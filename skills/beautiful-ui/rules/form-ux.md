---
name: form-ux
description: Form UX patterns — layout, label placement, input sizing, field grouping, validation timing, error presentation, submit buttons, multi-step forms, inline editing, optional fields, help text, and destructive action confirmation
metadata:
  tags: form-ux, forms, validation, error-handling, labels, fieldset, submit-button, multi-step, inline-edit, destructive-action, inertia, useForm
---

# Form UX Patterns

Forms are where users give you their data. Bad forms cost conversions, cause frustration, and generate support tickets. These patterns are grounded in research from Nielsen Norman Group, Baymard Institute, and Luke Wroblewski — not opinion.

## Form Layout

**Single-column forms are completed 15 seconds faster** than multi-column forms (CXL Institute research). Multi-column layouts draw attention in multiple directions, making it harder to determine field order.

**Rule:** Default to single-column. Only pair fields side-by-side when they are logically related short fields: first name + last name, city + state + zip.

```html
<form class="mx-auto max-w-lg space-y-6">
  <!-- Related short fields share a row -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div><!-- First name --></div>
    <div><!-- Last name --></div>
  </div>

  <!-- Email spans full width -->
  <div><!-- Email --></div>

  <!-- Address: varied widths match expected content -->
  <div class="grid grid-cols-6 gap-4">
    <div class="col-span-6 sm:col-span-3"><!-- City --></div>
    <div class="col-span-3 sm:col-span-1"><!-- State --></div>
    <div class="col-span-3 sm:col-span-2"><!-- Zip --></div>
  </div>
</form>
```

**Constrain form width** with `max-w-lg` or `max-w-xl`. A 5-character zip code field spanning 1200px signals the wrong expected input.

## Label Placement

**Top-aligned labels are fastest** (Luke Wroblewski's eye-tracking research). The eye moves in a single downward path instead of a Z-shaped scan.

```html
<!-- Top-aligned (recommended) -->
<div>
  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
    Email address
  </label>
  <input
    id="email"
    type="email"
    class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  />
</div>
```

**Never use floating/animated labels.** They shrink to unreadable sizes, fail WCAG contrast when minimized, and confuse users who mistake placeholder text for pre-filled data.

**Never use placeholder as the sole label.** Placeholders disappear on input, increasing memory burden. Use a real `<label>`.

## Input Sizing

**Input width is an affordance** signaling expected content length (NNG research). A zip code field spanning full width suggests the user should type more than 5 characters.

| Content type     | Width                              |
| ---------------- | ---------------------------------- |
| Full name, email | Full width (`w-full`)              |
| Street address   | Full width                         |
| City             | Half width (`col-span-3` in 6-col) |
| State            | Narrow (`col-span-1`)              |
| Zip/postal code  | Narrow-medium (`col-span-2`)       |
| Phone            | Medium (`max-w-xs`)                |
| CVV              | Very narrow (`max-w-[5rem]`)       |

**Consistent height:** Use the same `py-2 px-3` padding on all inputs, selects, and textareas. Set minimum height `min-h-10` (40px) for touch targets.

## Field Grouping

Group related fields with `<fieldset>` and `<legend>` — screen readers announce the legend text before each field within the group, giving context.

```html
<form class="space-y-8">
  <fieldset class="space-y-4">
    <legend class="text-lg font-semibold text-gray-900">
      Personal Information
    </legend>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div><!-- First name --></div>
      <div><!-- Last name --></div>
    </div>
    <div><!-- Email --></div>
  </fieldset>

  <fieldset class="space-y-4 border-t border-gray-200 pt-8">
    <legend class="text-lg font-semibold text-gray-900">
      Shipping Address
    </legend>
    <div><!-- Street --></div>
    <div class="grid grid-cols-6 gap-4">
      <div class="col-span-3"><!-- City --></div>
      <div class="col-span-1"><!-- State --></div>
      <div class="col-span-2"><!-- Zip --></div>
    </div>
  </fieldset>
</form>
```

**Three grouping strategies:**

1. **Spacing only** — `space-y-8` between groups, `space-y-4` within (short forms)
2. **Border separator** — `border-t pt-8` between sections (medium forms)
3. **Card sections** — `rounded-lg border p-6` around each group (settings pages)

## Validation Timing

**"Reward early, punish late."** The most important form UX principle:

- **Punish late (on blur):** Validate when the user leaves a field. Don't show errors while they're still typing.
- **Reward early (on input):** When a field already shows an error, clear it immediately as the user fixes it.
- **Required fields:** Only validate empty required fields on submit, not on blur. A user tabbing through shouldn't see "Required" on fields they haven't reached.

### React with Inertia.js

```jsx
import { useForm } from '@inertiajs/react'

export default function SignupForm() {
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    email: '',
    password: ''
  })

  function handleChange(field, value) {
    setData(field, value)
    // "Reward early": clear error as soon as user starts fixing
    if (errors[field]) clearErrors(field)
  }

  function submit(e) {
    e.preventDefault()
    post('/signup')
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-md space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 ${
            errors.email
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={processing}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {processing ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
```

### Vue with Inertia.js

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({ email: '', password: '' })

function handleChange(field) {
  if (form.errors[field]) form.clearErrors(field)
}

function submit() {
  form.post('/signup')
}
</script>

<template>
  <form @submit.prevent="submit" novalidate class="mx-auto max-w-md space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
        >Email</label
      >
      <input
        id="email"
        type="email"
        v-model="form.email"
        @input="handleChange('email')"
        :aria-invalid="!!form.errors.email"
        :aria-describedby="form.errors.email ? 'email-error' : undefined"
        :class="[
          'block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1',
          form.errors.email
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        ]"
      />
      <p
        v-if="form.errors.email"
        id="email-error"
        class="mt-1 text-sm text-red-600"
      >
        {{ form.errors.email }}
      </p>
    </div>
    <button
      type="submit"
      :disabled="form.processing"
      class="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {{ form.processing ? 'Creating account...' : 'Create account' }}
    </button>
  </form>
</template>
```

### Svelte with Inertia.js

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({ email: '', password: '' })

  function handleChange(field) {
    if ($form.errors[field]) $form.clearErrors(field)
  }

  function submit(e) {
    e.preventDefault()
    $form.post('/signup')
  }
</script>

<form onsubmit={submit} novalidate class="mx-auto max-w-md space-y-4">
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
    <input
      id="email"
      type="email"
      bind:value={$form.email}
      oninput={() => handleChange('email')}
      aria-invalid={!!$form.errors.email}
      aria-describedby={$form.errors.email ? 'email-error' : undefined}
      class="block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 {$form.errors.email
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
    />
    {#if $form.errors.email}
      <p id="email-error" class="mt-1 text-sm text-red-600">{$form.errors.email}</p>
    {/if}
  </div>
  <button type="submit" disabled={$form.processing} class="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
    {$form.processing ? 'Creating account...' : 'Create account'}
  </button>
</form>
```

## Error Presentation

### Inline Errors

Every error field needs three things: red border, error message, and ARIA attributes.

```html
<div>
  <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
    >Email</label
  >
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
    class="block w-full rounded-md border border-red-300 px-3 py-2 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
  />
  <p id="email-error" class="mt-1 flex items-center gap-1 text-sm text-red-600">
    Please enter a valid email address
  </p>
</div>
```

**Never use color alone to indicate errors** (WCAG 1.4.1). The red border must be accompanied by text.

### Error Summary (For Forms With 5+ Fields)

```jsx
{
  Object.keys(errors).length > 0 && (
    <div
      role="alert"
      className="rounded-md bg-red-50 border border-red-200 p-4 mb-6"
    >
      <h2 className="text-sm font-medium text-red-800">
        There were {Object.keys(errors).length} errors with your submission
      </h2>
      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-red-700">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} className="underline">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

The summary links to each field so users can click to jump to the error.

## Submit Button Patterns

### Position and Sizing

```html
<!-- Full-width on mobile, auto-width aligned left on desktop -->
<button
  type="submit"
  class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
>
  Save changes
</button>
```

### Loading States

```jsx
<button
  type="submit"
  disabled={processing}
  className="relative rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
>
  <span className={processing ? 'invisible' : ''}>Save changes</span>
  {processing && (
    <span className="absolute inset-0 flex items-center justify-center">
      <svg
        className="h-5 w-5 animate-spin text-white"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>
  )}
</button>
```

### Button Labels

Use specific verbs that describe what happens next:

- "Create account" — not "Submit"
- "Save changes" — not "Submit"
- "Send message" — not "Submit"
- "Place order" — not "Submit"

### Dirty State

Disable submit until the form has changes. With Inertia.js, `useForm` tracks `isDirty` automatically:

```jsx
<button disabled={!form.isDirty || processing}>Save changes</button>
```

## Success Feedback

### Inline (Settings/Profile Forms)

Use Inertia's `recentlySuccessful` — stays true for ~2 seconds after success:

```jsx
// React
<div className="flex items-center gap-3">
  <button type="submit" disabled={processing}>
    Save changes
  </button>
  {recentlySuccessful && (
    <p className="text-sm text-green-600">Saved successfully.</p>
  )}
</div>
```

```vue
<!-- Vue -->
<button type="submit" :disabled="form.processing">Save changes</button>
<p
  v-if="form.recentlySuccessful"
  class="text-sm text-green-600"
>Saved successfully.</p>
```

```svelte
<!-- Svelte -->
<button type="submit" disabled={$form.processing}>Save changes</button>
{#if $form.recentlySuccessful}
  <p class="text-sm text-green-600">Saved successfully.</p>
{/if}
```

### Redirect with Flash (Create Forms)

```js
// Sails action
fn: async function () {
  await Team.create({ name: this.req.body.name })
  this.req.session.flash = { success: 'Team created successfully' }
  return this.res.redirect('/teams')
}
```

## Optional vs Required Fields

**Mark optional fields, not required ones.** Users naturally fill out everything unless told otherwise. Marking required with asterisks makes users skip optional fields.

```html
<!-- Required (no marker) -->
<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
  Email address
</label>

<!-- Optional (marked) -->
<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
  Phone number
  <span class="ml-1 text-sm font-normal text-gray-400">(Optional)</span>
</label>
```

## Select vs Radio Buttons

| Number of options | Use                |
| ----------------- | ------------------ |
| 2 (yes/no)        | Checkbox or toggle |
| 3–5               | Radio buttons      |
| 6+                | Select dropdown    |

Radio buttons show all options at once (single click). Selects hide options (click to open, scroll, click to select — three actions).

### Card-Style Radio Buttons

For important choices like pricing plans, transform radios into selectable cards:

```jsx
{
  plans.map((plan) => (
    <label
      key={plan.id}
      className={`flex cursor-pointer items-center rounded-lg border-2 p-4 ${
        data.plan === plan.id
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="radio"
        name="plan"
        value={plan.id}
        checked={data.plan === plan.id}
        onChange={(e) => setData('plan', e.target.value)}
        className="sr-only"
      />
      <div>
        <p className="font-medium text-gray-900">{plan.name}</p>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </div>
    </label>
  ))
}
```

## Help Text

Place help text below the input, linked via `aria-describedby`:

```html
<div>
  <label for="password" class="block text-sm font-medium text-gray-700 mb-1"
    >Password</label
  >
  <input
    id="password"
    type="password"
    aria-describedby="password-hint"
    class="block w-full rounded-md border border-gray-300 px-3 py-2"
  />
  <p id="password-hint" class="mt-1 text-sm text-gray-500">
    Must be at least 8 characters with one uppercase letter and one number.
  </p>
</div>
```

When both help text and an error exist, include both IDs: `aria-describedby="password-hint password-error"`. Screen readers announce them in order.

## Destructive Action Confirmation

**Hierarchy of safety patterns:**

1. **Undo** — Best for reversible actions (Gmail's "Undo" after delete)
2. **Type-to-confirm** — Best for irreversible, high-impact actions
3. **Confirmation dialog** — Last resort (users habituate to clicking "OK")

### Type-to-Confirm (React with Inertia)

```jsx
import { useForm } from '@inertiajs/react'
import { useRef } from 'react'

function DeleteTeamForm({ team }) {
  const {
    data,
    setData,
    delete: destroy,
    processing
  } = useForm({ confirmation: '' })
  const dialogRef = useRef(null)
  const isConfirmed = data.confirmation === team.name

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm text-red-600"
      >
        Delete team
      </button>
      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 backdrop:bg-black/50 max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            destroy(`/teams/${team.id}`)
          }}
        >
          <h2 className="text-lg font-semibold">Delete {team.name}?</h2>
          <p className="mt-2 text-sm text-gray-500">
            This action is permanent and cannot be undone.
          </p>
          <div className="mt-4">
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type <span className="font-mono font-semibold">{team.name}</span>{' '}
              to confirm
            </label>
            <input
              id="confirm"
              type="text"
              value={data.confirmation}
              onChange={(e) => setData('confirmation', e.target.value)}
              autoComplete="off"
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-3 py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || processing}
              className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Delete permanently
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
```

## Anti-Patterns

1. **Placeholder as label** — Fails WCAG 1.3.1 and 3.3.2. Use a real `<label>`.

2. **Validating on every keystroke** — Premature. Use "reward early, punish late."

3. **Submit button labeled "Submit"** — Tells the user nothing. Use specific verbs.

4. **Not disabling during processing** — Causes duplicate submissions.

5. **Multi-column for unrelated fields** — Email next to phone creates scanning confusion. Only pair logically related fields.

6. **Marking required with asterisks** — Makes users skip optional fields. Mark optional instead.

7. **Using select for 2-3 options** — Radio buttons are faster and show all choices at once.

8. **Confirmation dialogs for everything** — Users habituate to clicking "OK" without reading. Reserve for truly destructive, irreversible actions.

9. **Right-aligning submit on desktop** — Breaks the vertical scanning path. Align submit with the left edge of form fields.

10. **Error color without text** — Red border alone fails WCAG 1.4.1. Always include error text.
