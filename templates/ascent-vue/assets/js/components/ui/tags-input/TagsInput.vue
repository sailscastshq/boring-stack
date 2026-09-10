<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs
} from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  name: { type: String, default: undefined },
  placeholder: { type: String, default: 'Add a tag' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  max: { type: Number, default: Number.POSITIVE_INFINITY },
  normalize: { type: Function, default: (value) => value.trim() },
  validate: { type: Function, default: () => true }
})
const emit = defineEmits(['change', 'reject'])
const value = defineModel({ type: Array, default: () => [] })
const draft = defineModel('draft', { type: String, default: '' })
const attrs = useAttrs()
const root = ref()
const element = ref()
const removeElements = ref([])
const status = ref('')
let composing = false
let form
let initialValue = []
let initialDraft = ''

const invalid = computed(
  () => attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true'
)
const forwardedAttrs = computed(() => {
  const {
    class: _class,
    'data-slot': _dataSlot,
    'data-disabled': _dataDisabled,
    'data-invalid': _dataInvalid,
    ...rest
  } = attrs
  return rest
})

function announce(message) {
  status.value = ''
  nextTick(() => {
    status.value = message
  })
}

function rejection(raw, message) {
  const detail = { value: raw, message }
  announce(message)
  emit('reject', detail)
  return { accepted: false, raw, message }
}

function evaluate(raw, tags) {
  let tag
  try {
    tag = String(props.normalize(String(raw)) ?? '').trim()
  } catch {
    return rejection(raw, 'That tag could not be normalized.')
  }

  if (!tag) return { accepted: false, empty: true, raw }
  if (tags.length >= props.max) {
    return rejection(raw, `You can add up to ${props.max} tags.`)
  }
  if (tags.includes(tag)) {
    return rejection(raw, `${tag} is already added.`)
  }

  const result = props.validate(tag, tags)
  if (result !== true) {
    return rejection(
      raw,
      typeof result === 'string' && result
        ? result
        : `${tag} is not a valid tag.`
    )
  }

  return { accepted: true, tag, raw }
}

function setTags(tags) {
  value.value = tags
  emit('change', tags)
}

function addCandidates(candidates) {
  const tags = [...value.value]
  const rejected = []
  const rejectionMessages = []
  const added = []

  for (const candidate of candidates) {
    const result = evaluate(candidate, tags)
    if (result.accepted) {
      tags.push(result.tag)
      added.push(result.tag)
    } else if (!result.empty && String(candidate).trim()) {
      rejected.push(String(candidate).trim())
      rejectionMessages.push(result.message)
    }
  }

  if (added.length) {
    setTags(tags)
    const addition =
      added.length === 1 ? `${added[0]} added.` : `${added.length} tags added.`
    announce(
      rejectionMessages.length
        ? `${addition} ${rejectionMessages.at(-1)}`
        : addition
    )
  } else if (rejectionMessages.length) {
    announce(rejectionMessages.at(-1))
  }
  draft.value = rejected.join(', ')
  return added.length > 0
}

function commitDraft() {
  if (props.disabled || props.readonly) return false
  if (!draft.value.trim()) {
    draft.value = ''
    return false
  }
  return addCandidates([draft.value])
}

function updateDraft(event) {
  draft.value = event.currentTarget.value
}

function finishComposition(event) {
  composing = false
  updateDraft(event)
}

function handleInputKeydown(event) {
  if (composing || event.isComposing) return

  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    commitDraft()
    return
  }

  if (event.key === 'Backspace' && !draft.value && value.value.length) {
    event.preventDefault()
    removeAt(value.value.length - 1, false)
    element.value?.focus()
    return
  }

  if (
    event.key === 'ArrowLeft' &&
    event.currentTarget.selectionStart === 0 &&
    value.value.length
  ) {
    event.preventDefault()
    removeElements.value.at(-1)?.focus()
  }
}

function handlePaste(event) {
  if (props.disabled || props.readonly) return
  const pasted = event.clipboardData?.getData('text') ?? ''
  if (!/[,\n]/.test(pasted)) return

  event.preventDefault()
  addCandidates(`${draft.value}${pasted}`.split(/[,\n]+/))
}

function removeAt(index, restoreFocus = true) {
  if (props.disabled || props.readonly || index < 0) return
  const tags = [...value.value]
  const [removed] = tags.splice(index, 1)
  if (removed === undefined) return

  setTags(tags)
  announce(`${removed} removed.`)

  if (restoreFocus) {
    nextTick(() => {
      const controls = root.value?.querySelectorAll('[data-part="remove"]')
      ;(controls?.[index] ?? controls?.[index - 1] ?? element.value)?.focus()
    })
  }
}

function handleRemoveKeydown(event, index) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    removeElements.value[index - 1]?.focus() ?? element.value?.focus()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    removeElements.value[index + 1]?.focus() ?? element.value?.focus()
  } else if (event.key === 'Home') {
    event.preventDefault()
    removeElements.value[0]?.focus()
  } else if (event.key === 'End') {
    event.preventDefault()
    element.value?.focus()
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    removeAt(index)
  }
}

function focusInput(event) {
  if (event.target === root.value) element.value?.focus()
}

function handleReset() {
  queueMicrotask(() => {
    setTags([...initialValue])
    draft.value = initialDraft
  })
}

onMounted(() => {
  initialValue = [...value.value]
  initialDraft = draft.value
  form = element.value?.form
  form?.addEventListener('reset', handleReset)
})

onBeforeUnmount(() => form?.removeEventListener('reset', handleReset))

defineExpose({
  element,
  focus: (options) => element.value?.focus(options),
  commit: commitDraft
})
</script>

<template>
  <div
    ref="root"
    data-slot="tags-input"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :class="
      twMerge(
        [
          'flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 shadow-sm outline-none transition-colors duration-150',
          'hover:border-gray-400 focus-within:border-gray-950 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-950',
          'data-disabled:cursor-not-allowed data-disabled:bg-gray-100 data-disabled:text-gray-500',
          'data-invalid:border-red-600 data-invalid:focus-within:outline-red-600',
          'dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600 dark:focus-within:border-white dark:focus-within:outline-white dark:data-disabled:bg-gray-900 dark:data-disabled:text-gray-500 dark:data-invalid:border-red-500 dark:data-invalid:focus-within:outline-red-500',
          'motion-reduce:transition-none'
        ],
        attrs.class
      )
    "
    @click="focusInput"
  >
    <ul v-if="value.length" role="list" data-part="list" class="contents">
      <li
        v-for="(tag, index) in value"
        :key="`${tag}-${index}`"
        data-part="tag"
        class="inline-flex min-w-0 items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      >
        <span data-part="tag-label" class="min-w-0 truncate">{{ tag }}</span>
        <button
          v-if="!readonly"
          :ref="(node) => (removeElements[index] = node)"
          type="button"
          data-part="remove"
          :disabled="disabled"
          :aria-label="`Remove ${tag}`"
          class="-mr-1 inline-grid size-6 shrink-0 cursor-pointer place-items-center rounded-sm text-gray-500 outline-none hover:bg-gray-200 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus-visible:outline-white"
          @click="removeAt(index)"
          @keydown="handleRemoveKeydown($event, index)"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            class="size-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </li>
    </ul>

    <input
      ref="element"
      v-bind="forwardedAttrs"
      :value="draft"
      :placeholder="value.length ? undefined : placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required && value.length === 0"
      :aria-invalid="attrs['aria-invalid']"
      data-part="input"
      class="min-h-6 min-w-28 flex-1 border-0 bg-transparent p-0 text-base text-inherit outline-none placeholder:text-gray-500 disabled:cursor-not-allowed dark:placeholder:text-gray-400"
      @compositionstart="composing = true"
      @compositionend="finishComposition"
      @input="updateDraft"
      @keydown="handleInputKeydown"
      @paste="handlePaste"
      @blur="commitDraft"
    />

    <input
      v-for="(tag, index) in value"
      :key="`field-${tag}-${index}`"
      type="hidden"
      :name="name"
      :value="tag"
      :form="attrs.form"
      :disabled="disabled || !name"
    />
    <span class="sr-only" aria-live="polite" aria-atomic="true">{{
      status
    }}</span>
  </div>
</template>
