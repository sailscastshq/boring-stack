---
name: multi-step-forms
description: Persist multi-step wizard form data across navigation, reloads, and crashes using localStorage with per-step and aggregate draft strategies
metadata:
  tags: multi-step, wizard, form-persistence, stepper, onboarding, localStorage, draft, inertia
---

# Multi-Step Form Persistence

Multi-step forms (wizards, onboarding flows, checkout processes) are high-stakes: users invest significant time filling out multiple screens. Losing progress on step 4 of 5 because of an accidental refresh or navigation is unacceptable. This rule builds on the single-form draft pattern from `form-persistence.md` and extends it to orchestrate state across multiple steps.

## Architecture

```
Step 1 → Save to localStorage → Step 2 → Save to localStorage → Step 3 → ...
  ↓                                ↓                                ↓
  ASCENT_WIZARD_{id}               ASCENT_WIZARD_{id}               ASCENT_WIZARD_{id}
  { currentStep: 1,               { currentStep: 2,               { currentStep: 3,
    steps: {                        steps: {                        steps: {
      1: { name: "..." },            1: { name: "..." },             1: { name: "..." },
      2: {},                          2: { email: "..." },            2: { email: "..." },
      3: {} }}                        3: {} }}                        3: { plan: "..." } }}
                                                                       ↓
Page reload → Check localStorage → Restore to step 3 with all data intact
                                                                       ↓
Final submit (success) → Clear entire wizard draft from localStorage
```

## Strategy: Single Key vs Per-Step Keys

**Single key (recommended)** — Store all steps under one localStorage key. Simpler to manage, atomic clear on submit, easy to track `currentStep`:

```js
// One key holds everything
'ASCENT_WIZARD_ONBOARDING' → {
  currentStep: 2,
  steps: {
    1: { name: 'Kelvin', company: 'Sailscasts' },
    2: { email: 'kelvin@sailscasts.com', role: 'developer' },
    3: {}
  },
  savedAt: 1707600000000,
  expiresAt: 1708204800000
}
```

**Per-step keys** — Store each step separately. Useful when steps are independent pages with their own Inertia actions:

```js
// Separate keys per step
'ASCENT_WIZARD_ONBOARDING_STEP_1' → { data: { name: '...' }, savedAt: ... }
'ASCENT_WIZARD_ONBOARDING_STEP_2' → { data: { email: '...' }, savedAt: ... }
'ASCENT_WIZARD_ONBOARDING_STEP_3' → { data: { plan: '...' }, savedAt: ... }
```

Use single-key when the wizard is a single-page component with client-side step transitions. Use per-step keys when each step is a separate Inertia page visit.

## Single-Page Wizard (Client-Side Steps)

The most common pattern: one component renders all steps, transitioning between them without server requests. All step data persists to a single localStorage key.

### React

```jsx
// assets/js/hooks/useWizardDraft.js
import { useState, useEffect, useRef, useCallback } from 'react'

export function useWizardDraft(draftKey, stepDefaults, options = {}) {
  const { ttl = 7 * 24 * 60 * 60 * 1000 } = options // Default: 7 days
  const totalSteps = Object.keys(stepDefaults).length

  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState(stepDefaults)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)
  const debounceRef = useRef(null)

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
          return
        }
        if (draft.steps) {
          // Merge saved steps with defaults (handles added fields between deploys)
          const merged = { ...stepDefaults }
          Object.keys(draft.steps).forEach((step) => {
            merged[step] = { ...stepDefaults[step], ...draft.steps[step] }
          })
          setSteps(merged)
          setCurrentStep(draft.currentStep || 1)
          setHasRestoredDraft(true)
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [])

  // Debounced auto-save
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            currentStep,
            steps,
            savedAt: Date.now(),
            expiresAt: Date.now() + ttl
          })
        )
      } catch {}
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [steps, currentStep, draftKey, ttl])

  const updateStep = useCallback((step, data) => {
    setSteps((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }))
  }, [])

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }, [totalSteps])

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback(
    (step) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step)
      }
    },
    [totalSteps]
  )

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey)
  }, [draftKey])

  // Flatten all steps into a single object for final submission
  const allData = Object.values(steps).reduce(
    (acc, stepData) => ({ ...acc, ...stepData }),
    {}
  )

  return {
    currentStep,
    totalSteps,
    steps,
    allData,
    hasRestoredDraft,
    setHasRestoredDraft,
    updateStep,
    goNext,
    goBack,
    goToStep,
    clearDraft
  }
}
```

**Usage — Onboarding wizard**:

```jsx
import { useForm } from '@inertiajs/react'
import { useWizardDraft } from '~/hooks/useWizardDraft'

const stepDefaults = {
  1: { fullName: '', company: '' },
  2: { email: '', role: '' },
  3: { plan: 'starter', billing: 'monthly' }
}

export default function OnboardingPage() {
  const wizard = useWizardDraft('ASCENT_WIZARD_ONBOARDING', stepDefaults)
  const form = useForm(wizard.allData)

  function handleNext() {
    // Optionally validate current step before advancing
    wizard.goNext()
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Merge latest step data into form
    form.setData(wizard.allData)
    form.post('/onboarding/complete', {
      onSuccess: () => wizard.clearDraft()
    })
  }

  return (
    <div>
      {wizard.hasRestoredDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p>
            Welcome back! We restored your progress from step{' '}
            {wizard.currentStep}.
          </p>
          <button
            type="button"
            onClick={() => wizard.setHasRestoredDraft(false)}
            className="text-blue-700 font-medium text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: wizard.totalSteps }, (_, i) => i + 1).map(
          (step) => (
            <button
              key={step}
              onClick={() => wizard.goToStep(step)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                step === wizard.currentStep
                  ? 'bg-blue-600 text-white'
                  : step < wizard.currentStep
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step}
            </button>
          )
        )}
      </div>

      {/* Step content */}
      {wizard.currentStep === 1 && (
        <div className="space-y-4">
          <input
            value={wizard.steps[1].fullName}
            onChange={(e) => wizard.updateStep(1, { fullName: e.target.value })}
            placeholder="Full name"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            value={wizard.steps[1].company}
            onChange={(e) => wizard.updateStep(1, { company: e.target.value })}
            placeholder="Company"
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      )}

      {wizard.currentStep === 2 && (
        <div className="space-y-4">
          <input
            value={wizard.steps[2].email}
            onChange={(e) => wizard.updateStep(2, { email: e.target.value })}
            placeholder="Email"
            className="border rounded px-3 py-2 w-full"
          />
          <select
            value={wizard.steps[2].role}
            onChange={(e) => wizard.updateStep(2, { role: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select role</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      )}

      {wizard.currentStep === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['starter', 'pro'].map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => wizard.updateStep(3, { plan })}
                className={`p-4 border rounded-lg text-center ${
                  wizard.steps[3].plan === plan
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={wizard.goBack}
          disabled={wizard.currentStep === 1}
          className="px-4 py-2 text-gray-600 disabled:opacity-50"
        >
          Back
        </button>
        {wizard.currentStep < wizard.totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={form.processing}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  )
}
```

### Vue

```js
// assets/js/composables/wizardDraft.js
import { ref, watch, onMounted, computed } from 'vue'

export function useWizardDraft(draftKey, stepDefaults, options = {}) {
  const { ttl = 7 * 24 * 60 * 60 * 1000 } = options
  const totalSteps = Object.keys(stepDefaults).length

  const currentStep = ref(1)
  const steps = ref(JSON.parse(JSON.stringify(stepDefaults)))
  const hasRestoredDraft = ref(false)
  let debounceTimer

  // Restore draft on mount
  onMounted(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
          return
        }
        if (draft.steps) {
          const merged = JSON.parse(JSON.stringify(stepDefaults))
          Object.keys(draft.steps).forEach((step) => {
            merged[step] = { ...merged[step], ...draft.steps[step] }
          })
          steps.value = merged
          currentStep.value = draft.currentStep || 1
          hasRestoredDraft.value = true
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  })

  // Debounced auto-save
  watch(
    [currentStep, steps],
    () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              currentStep: currentStep.value,
              steps: steps.value,
              savedAt: Date.now(),
              expiresAt: Date.now() + ttl
            })
          )
        } catch {}
      }, 500)
    },
    { deep: true }
  )

  function updateStep(step, data) {
    steps.value[step] = { ...steps.value[step], ...data }
  }

  function goNext() {
    if (currentStep.value < totalSteps) currentStep.value++
  }

  function goBack() {
    if (currentStep.value > 1) currentStep.value--
  }

  function goToStep(step) {
    if (step >= 1 && step <= totalSteps) currentStep.value = step
  }

  function clearDraft() {
    localStorage.removeItem(draftKey)
  }

  const allData = computed(() =>
    Object.values(steps.value).reduce(
      (acc, stepData) => ({ ...acc, ...stepData }),
      {}
    )
  )

  return {
    currentStep,
    totalSteps,
    steps,
    allData,
    hasRestoredDraft,
    updateStep,
    goNext,
    goBack,
    goToStep,
    clearDraft
  }
}
```

**Usage**:

```vue
<script setup>
import { useForm } from '@inertiajs/vue3'
import { useWizardDraft } from '~/composables/wizardDraft'

const stepDefaults = {
  1: { fullName: '', company: '' },
  2: { email: '', role: '' },
  3: { plan: 'starter', billing: 'monthly' }
}

const wizard = useWizardDraft('ASCENT_WIZARD_ONBOARDING', stepDefaults)

function handleSubmit() {
  const form = useForm(wizard.allData.value)
  form.post('/onboarding/complete', {
    onSuccess: () => wizard.clearDraft()
  })
}
</script>

<template>
  <div>
    <div
      v-if="wizard.hasRestoredDraft.value"
      class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
    >
      <p>
        Welcome back! We restored your progress from step
        {{ wizard.currentStep.value }}.
      </p>
      <button
        type="button"
        @click="wizard.hasRestoredDraft.value = false"
        class="text-blue-700 font-medium text-sm"
      >
        Dismiss
      </button>
    </div>

    <!-- Step 1 -->
    <div v-if="wizard.currentStep.value === 1" class="space-y-4">
      <input
        :value="wizard.steps.value[1].fullName"
        @input="wizard.updateStep(1, { fullName: $event.target.value })"
        placeholder="Full name"
        class="border rounded px-3 py-2 w-full"
      />
      <input
        :value="wizard.steps.value[1].company"
        @input="wizard.updateStep(1, { company: $event.target.value })"
        placeholder="Company"
        class="border rounded px-3 py-2 w-full"
      />
    </div>

    <!-- Step 2 -->
    <div v-if="wizard.currentStep.value === 2" class="space-y-4">
      <input
        :value="wizard.steps.value[2].email"
        @input="wizard.updateStep(2, { email: $event.target.value })"
        placeholder="Email"
        class="border rounded px-3 py-2 w-full"
      />
      <select
        :value="wizard.steps.value[2].role"
        @change="wizard.updateStep(2, { role: $event.target.value })"
        class="border rounded px-3 py-2 w-full"
      >
        <option value="">Select role</option>
        <option value="developer">Developer</option>
        <option value="designer">Designer</option>
        <option value="manager">Manager</option>
      </select>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-8">
      <button
        type="button"
        @click="wizard.goBack()"
        :disabled="wizard.currentStep.value === 1"
        class="px-4 py-2 text-gray-600 disabled:opacity-50"
      >
        Back
      </button>
      <button
        v-if="wizard.currentStep.value < wizard.totalSteps"
        type="button"
        @click="wizard.goNext()"
        class="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next
      </button>
      <button
        v-else
        @click="handleSubmit"
        class="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Complete
      </button>
    </div>
  </div>
</template>
```

### Svelte

```js
// assets/js/stores/wizardDraft.js
export function createWizardDraft(draftKey, stepDefaults, options = {}) {
  const { ttl = 7 * 24 * 60 * 60 * 1000 } = options
  const isBrowser = typeof window !== 'undefined'
  const totalSteps = Object.keys(stepDefaults).length

  let restoredStep = 1
  let restoredSteps = JSON.parse(JSON.stringify(stepDefaults))
  let hasRestoredDraft = false

  // Check for existing draft
  if (isBrowser) {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.expiresAt && draft.expiresAt < Date.now()) {
          localStorage.removeItem(draftKey)
        } else if (draft.steps) {
          const merged = JSON.parse(JSON.stringify(stepDefaults))
          Object.keys(draft.steps).forEach((step) => {
            merged[step] = { ...merged[step], ...draft.steps[step] }
          })
          restoredSteps = merged
          restoredStep = draft.currentStep || 1
          hasRestoredDraft = true
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  }

  return {
    restoredStep,
    restoredSteps,
    hasRestoredDraft,
    totalSteps,

    saveDraft(currentStep, steps) {
      if (!isBrowser) return
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            currentStep,
            steps,
            savedAt: Date.now(),
            expiresAt: Date.now() + ttl
          })
        )
      } catch {}
    },

    clearDraft() {
      if (isBrowser) localStorage.removeItem(draftKey)
    }
  }
}
```

**Usage**:

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'
  import { createWizardDraft } from '~/stores/wizardDraft'

  const stepDefaults = {
    1: { fullName: '', company: '' },
    2: { email: '', role: '' },
    3: { plan: 'starter', billing: 'monthly' }
  }

  const draft = createWizardDraft('ASCENT_WIZARD_ONBOARDING', stepDefaults)

  let currentStep = $state(draft.restoredStep)
  let steps = $state(draft.restoredSteps)
  let showRestoredBanner = $state(draft.hasRestoredDraft)

  // Debounced auto-save
  let debounceTimer
  $effect(() => {
    // Access reactive values to track them
    const snapshot = JSON.stringify({ currentStep, steps })
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      draft.saveDraft(currentStep, steps)
    }, 500)
  })

  function updateStep(step, data) {
    steps[step] = { ...steps[step], ...data }
  }

  function goNext() {
    if (currentStep < draft.totalSteps) currentStep++
  }

  function goBack() {
    if (currentStep > 1) currentStep--
  }

  // Flatten all steps for submission
  function getAllData() {
    return Object.values(steps).reduce((acc, stepData) => ({ ...acc, ...stepData }), {})
  }

  const form = useForm(getAllData())

  function handleSubmit() {
    const data = getAllData()
    Object.assign($form, data)
    $form.post('/onboarding/complete', {
      onSuccess: () => draft.clearDraft()
    })
  }
</script>

{#if showRestoredBanner}
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <p>Welcome back! We restored your progress from step {currentStep}.</p>
    <button type="button" onclick={() => showRestoredBanner = false} class="text-blue-700 font-medium text-sm">
      Dismiss
    </button>
  </div>
{/if}

<!-- Step 1 -->
{#if currentStep === 1}
  <div class="space-y-4">
    <input
      value={steps[1].fullName}
      oninput={(e) => updateStep(1, { fullName: e.target.value })}
      placeholder="Full name"
      class="border rounded px-3 py-2 w-full"
    />
    <input
      value={steps[1].company}
      oninput={(e) => updateStep(1, { company: e.target.value })}
      placeholder="Company"
      class="border rounded px-3 py-2 w-full"
    />
  </div>
{/if}

<!-- Step 2 -->
{#if currentStep === 2}
  <div class="space-y-4">
    <input
      value={steps[2].email}
      oninput={(e) => updateStep(2, { email: e.target.value })}
      placeholder="Email"
      class="border rounded px-3 py-2 w-full"
    />
    <select
      value={steps[2].role}
      onchange={(e) => updateStep(2, { role: e.target.value })}
      class="border rounded px-3 py-2 w-full"
    >
      <option value="">Select role</option>
      <option value="developer">Developer</option>
      <option value="designer">Designer</option>
      <option value="manager">Manager</option>
    </select>
  </div>
{/if}

<!-- Navigation -->
<div class="flex justify-between mt-8">
  <button type="button" onclick={goBack} disabled={currentStep === 1} class="px-4 py-2 text-gray-600 disabled:opacity-50">
    Back
  </button>
  {#if currentStep < draft.totalSteps}
    <button type="button" onclick={goNext} class="px-4 py-2 bg-blue-600 text-white rounded">
      Next
    </button>
  {:else}
    <button onclick={handleSubmit} disabled={$form.processing} class="px-4 py-2 bg-blue-600 text-white rounded">
      Complete
    </button>
  {/if}
</div>
```

## Multi-Page Wizard (Inertia Page Visits)

When each step is a separate Inertia page (e.g., `/onboarding/step-1`, `/onboarding/step-2`), use **per-step keys** since each page mounts independently:

### Draft Key Pattern

```js
// Each step page saves its own draft
const draftKey = `ASCENT_WIZARD_ONBOARDING_STEP_${stepNumber}`
```

### Sails Actions

```js
// api/controllers/onboarding/step-1.js
module.exports = {
  fn: async function () {
    return sails.inertia.render('onboarding/Step1')
  }
}

// api/controllers/onboarding/save-step-1.js
module.exports = {
  inputs: {
    fullName: { type: 'string', required: true },
    company: { type: 'string' }
  },
  fn: async function () {
    // Save step data to session or database
    this.req.session.onboarding = {
      ...this.req.session.onboarding,
      fullName: this.req.body.fullName,
      company: this.req.body.company
    }
    return this.res.redirect('/onboarding/step-2')
  }
}
```

### Page Component (React)

```jsx
// Each step uses useFormDraft from form-persistence.md
import { useFormDraft } from '~/hooks/useFormDraft'

export default function Step1Page() {
  const { form, hasDraft, restoreDraft, discardDraft, clearDraft } =
    useFormDraft(
      'ASCENT_WIZARD_ONBOARDING_STEP_1',
      { fullName: '', company: '' },
      { ttl: 7 * 24 * 60 * 60 * 1000 } // 7 days for onboarding
    )

  function submit(e) {
    e.preventDefault()
    form.post('/onboarding/save-step-1', {
      onSuccess: () => clearDraft()
    })
  }

  return (
    <form onSubmit={submit}>
      {hasDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
          <p>We found your previous progress.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="text-blue-700 font-medium"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="text-gray-500"
            >
              Start fresh
            </button>
          </div>
        </div>
      )}
      <input
        value={form.data.fullName}
        onChange={(e) => form.setData('fullName', e.target.value)}
        placeholder="Full name"
      />
      <input
        value={form.data.company}
        onChange={(e) => form.setData('company', e.target.value)}
        placeholder="Company"
      />
      <button type="submit" disabled={form.processing}>
        Next
      </button>
    </form>
  )
}
```

### Clear All Steps on Final Submit

When the final step submits successfully, clear all per-step drafts:

```js
function clearAllWizardDrafts(prefix, totalSteps) {
  for (let i = 1; i <= totalSteps; i++) {
    localStorage.removeItem(`${prefix}_STEP_${i}`)
  }
}

// In the final step's submit handler
form.post('/onboarding/complete', {
  onSuccess: () => clearAllWizardDrafts('ASCENT_WIZARD_ONBOARDING', 5)
})
```

## Unsaved Changes Warning for Wizards

Combine the `useUnsavedChanges` hook from `form-persistence.md` with the wizard. Only warn when the user tries to leave the wizard entirely — not when navigating between steps:

```jsx
import { useUnsavedChanges } from '~/hooks/useUnsavedChanges'

function OnboardingWizard() {
  const wizard = useWizardDraft('ASCENT_WIZARD_ONBOARDING', stepDefaults)

  // Check if any step has meaningful data
  const hasAnyData = Object.values(wizard.steps).some((stepData) =>
    Object.values(stepData).some((v) =>
      typeof v === 'string' ? v.trim() : false
    )
  )

  useUnsavedChanges(hasAnyData)
  // ...
}
```

## Draft TTL for Wizards

Wizards represent a larger time investment than single forms, so use longer TTL values:

| Wizard Type              | TTL      |
| ------------------------ | -------- |
| Short wizard (2-3 steps) | 24 hours |
| Onboarding flow          | 7 days   |
| Application form         | 30 days  |
| Checkout flow            | 1 hour   |

Checkout flows are the exception — short TTL because prices and availability change. Better to start fresh than restore stale cart data.

## Schema Evolution

When you add or remove fields between deploys, the restored draft may have stale keys. Always merge with defaults to handle this:

```js
// Saved draft from v1 might have: { name: 'John' }
// Current v2 defaults are: { name: '', email: '', phone: '' }

// Merge: saved values win, new fields get defaults
const merged = { ...stepDefaults[step], ...savedDraft.steps[step] }
// Result: { name: 'John', email: '', phone: '' }
```

The `useWizardDraft` hook above handles this automatically via the merge strategy on restore.

## Common Mistakes

1. **Not clearing all steps on final submit** — If you only clear the last step's draft, users will see stale "restore" banners on earlier steps the next time they visit.

2. **Persisting server-owned data** — Only persist user _input_. Don't cache computed prices, available plans, or anything the server controls. Fetch those fresh on each visit.

3. **No TTL on wizard drafts** — A wizard draft from 6 months ago is useless. Always set an expiration.

4. **Blocking step navigation with unsaved changes** — Don't warn when users click "Back" or step indicators _within_ the wizard. Only warn when they try to leave the wizard entirely.

5. **Losing data on validation errors** — When a step's server-side validation fails (Inertia redirects back), the draft should still be in localStorage. The auto-save already handles this — the data persists regardless of server response.
