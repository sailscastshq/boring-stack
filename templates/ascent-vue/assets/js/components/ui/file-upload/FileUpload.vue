<script setup>
import {
  computed,
  onBeforeUnmount,
  ref,
  shallowRef,
  useAttrs,
  watch
} from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  accept: { type: String, default: undefined },
  capture: { type: [String, Boolean], default: undefined },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  validate: { type: Function, default: () => true }
})

const emit = defineEmits(['change', 'reject'])
const file = defineModel({ default: null })
const attrs = useAttrs()
const root = ref()
const input = ref()
const previewEntries = shallowRef([])
const dragging = ref(false)
let dragDepth = 0

const files = computed(() => {
  const current = file.value
  if (props.multiple) {
    return Array.isArray(current)
      ? current.filter(Boolean)
      : current
        ? [current]
        : []
  }
  return current ? [current] : []
})
const singleFile = computed(() =>
  props.multiple ? null : (files.value[0] ?? null)
)
const previews = computed(() =>
  previewEntries.value.map(({ file: candidate, url }) => ({
    file: candidate,
    previewUrl: url
  }))
)
const previewUrl = computed(() => previews.value[0]?.previewUrl ?? '')

const rootAttrs = computed(() => {
  const {
    class: _class,
    'data-slot': _dataSlot,
    'data-state': _dataState,
    'data-dragging': _dataDragging,
    'data-disabled': _dataDisabled,
    ...rest
  } = attrs
  return rest
})

function resetInput() {
  if (input.value) input.value.value = ''
}

function revokeEntry(entry) {
  if (entry?.url && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(entry.url)
  }
}

function createPreviewEntry(candidate) {
  const canPreview =
    candidate &&
    typeof Blob !== 'undefined' &&
    candidate instanceof Blob &&
    typeof URL.createObjectURL === 'function'
  return {
    file: candidate,
    url: canPreview ? URL.createObjectURL(candidate) : ''
  }
}

function syncPreviews(candidates) {
  const remaining = [...previewEntries.value]
  const next = candidates.map((candidate) => {
    const index = remaining.findIndex((entry) =>
      Object.is(entry.file, candidate)
    )
    if (index === -1) return createPreviewEntry(candidate)
    return remaining.splice(index, 1)[0]
  })
  for (const entry of remaining) revokeEntry(entry)
  previewEntries.value = next
}

function revokePreviews() {
  for (const entry of previewEntries.value) revokeEntry(entry)
  previewEntries.value = []
}

function validationResult(candidate, acceptedFiles) {
  if (!acceptedByAttribute(candidate)) {
    reject(candidate, 'accept', 'That file type is not accepted.')
    return false
  }

  let result
  try {
    result = props.validate(candidate, {
      files: [...acceptedFiles],
      multiple: props.multiple
    })
  } catch {
    reject(candidate, 'validate', 'That file could not be validated.')
    return false
  }

  if (result === true || result === undefined) return true
  reject(
    candidate,
    typeof result === 'object' && result?.reason ? result.reason : 'validate',
    typeof result === 'string' && result
      ? result
      : typeof result === 'object' && result?.message
        ? result.message
        : 'That file is not valid.'
  )
  return false
}

function acceptedByAttribute(candidate) {
  const rules = props.accept
    ?.split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
  if (!rules?.length) return true

  const type = candidate.type?.toLowerCase() ?? ''
  const name = candidate.name?.toLowerCase() ?? ''
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

function reject(candidate, reason, message, files = undefined) {
  const detail = { file: candidate ?? null, reason, message }
  if (files) detail.files = files
  emit('reject', detail)
  resetInput()
  return false
}

function setFile(candidate) {
  file.value = candidate
  emit('change', candidate)
  resetInput()
  return true
}

function select(selection) {
  if (props.disabled) return false
  const candidates = Array.from(selection ?? [])
  if (!candidates.length) return false
  if (!props.multiple && candidates.length > 1) {
    reject(candidates[0], 'multiple', 'Choose one file at a time.', candidates)
    resetInput()
    return false
  }

  const accepted = []
  const current = props.multiple ? [...files.value] : []
  for (const candidate of candidates) {
    if (validationResult(candidate, [...current, ...accepted])) {
      accepted.push(candidate)
    }
  }

  if (!accepted.length) {
    resetInput()
    return false
  }

  return setFile(props.multiple ? [...current, ...accepted] : accepted[0])
}

function choose() {
  if (props.disabled || !input.value) return
  resetInput()
  if (typeof input.value.showPicker === 'function') {
    try {
      input.value.showPicker()
      return
    } catch {
      // The native click path covers browsers that restrict showPicker().
    }
  }
  input.value.click()
}

function clear() {
  if (props.disabled) return
  setFile(props.multiple ? [] : null)
}

function remove(candidate) {
  if (props.disabled) return false
  if (!props.multiple) return setFile(null)
  const index = files.value.findIndex((entry) => Object.is(entry, candidate))
  if (index === -1) return false
  const next = [...files.value]
  next.splice(index, 1)
  return setFile(next)
}

function hasFiles(event) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

function handleDragEnter(event) {
  if (props.disabled || !hasFiles(event)) return
  event.preventDefault()
  dragDepth += 1
  dragging.value = true
}

function handleDragOver(event) {
  if (props.disabled || !hasFiles(event)) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  dragging.value = true
}

function handleDragLeave(event) {
  if (props.disabled || !hasFiles(event)) return
  event.preventDefault()
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) dragging.value = false
}

function handleDrop(event) {
  if (!hasFiles(event)) return
  event.preventDefault()
  dragDepth = 0
  dragging.value = false
  if (!props.disabled) select(event.dataTransfer?.files)
}

const dropzone = computed(() => ({
  'data-dragging': dragging.value ? '' : undefined,
  'data-disabled': props.disabled ? '' : undefined,
  onDragenter: handleDragEnter,
  onDragover: handleDragOver,
  onDragleave: handleDragLeave,
  onDrop: handleDrop
}))

watch(
  files,
  (candidates) => {
    syncPreviews(candidates)
  },
  { immediate: true, flush: 'sync' }
)

onBeforeUnmount(() => {
  revokePreviews()
})

defineExpose({ root, choose, clear, remove })
</script>

<template>
  <div
    ref="root"
    v-bind="rootAttrs"
    data-slot="file-upload"
    :data-state="files.length ? 'ready' : 'empty'"
    :data-dragging="dragging ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :class="attrs.class"
  >
    <input
      ref="input"
      type="file"
      hidden
      data-part="input"
      :accept="accept"
      :capture="capture"
      :multiple="multiple"
      :disabled="disabled"
      @change="select($event.currentTarget.files)"
    />
    <slot
      :file="singleFile"
      :files="files"
      :preview-url="previewUrl"
      :previews="previews"
      :dragging="dragging"
      :choose="choose"
      :clear="clear"
      :remove="remove"
      :dropzone="dropzone"
    />
  </div>
</template>
