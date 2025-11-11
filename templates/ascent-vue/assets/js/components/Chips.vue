<script setup>
import { ref, watch } from 'vue'
import InputText from '@/volt/InputText.vue'
import Chip from '@/volt/Chip.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Enter values'
  },
  separator: {
    type: String,
    default: ','
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = ref('')

function handleKeydown(event) {
  const value = inputValue.value.trim()

  // Handle Enter or separator key
  if (
    event.key === 'Enter' ||
    (props.separator && event.key === props.separator)
  ) {
    event.preventDefault()
    if (value) {
      addChip(value)
    }
  }
  // Handle backspace on empty input to remove last chip
  else if (
    event.key === 'Backspace' &&
    !inputValue.value &&
    props.modelValue.length > 0
  ) {
    removeChip(props.modelValue.length - 1)
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pastedText = event.clipboardData.getData('text')

  if (pastedText) {
    const values = pastedText
      .split(props.separator)
      .map((v) => v.trim())
      .filter((v) => v)

    if (values.length > 0) {
      const newChips = [...props.modelValue, ...values]
      emit('update:modelValue', newChips)
      inputValue.value = ''
    }
  }
}

function addChip(value) {
  if (value && !props.modelValue.includes(value)) {
    const newChips = [...props.modelValue, value]
    emit('update:modelValue', newChips)
  }
  inputValue.value = ''
}

function removeChip(index) {
  const newChips = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newChips)
}

function handleBlur() {
  const value = inputValue.value.trim()
  if (value) {
    addChip(value)
  }
}
</script>

<template>
  <div :class="['chips-container', props.class]">
    <div
      class="flex flex-wrap items-center gap-2 rounded-md border border-surface-300 bg-surface-0 px-3 py-1 min-h-10 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-surface-600 dark:bg-surface-900"
    >
      <!-- Render existing chips -->
      <Chip
        v-for="(chip, index) in modelValue"
        :key="index"
        :label="chip"
        removable
        @remove="removeChip(index)"
        pt:root:class="py-0.5 px-2 text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
      />

      <!-- Input for new chips -->
      <input
        v-model="inputValue"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
        @keydown="handleKeydown"
        @paste="handlePaste"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<style scoped>
.chips-container input {
  min-width: 120px;
}

.chips-container input::placeholder {
  color: var(--text-color-secondary);
}
</style>
