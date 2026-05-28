<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: String
  },
  label: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
const errorId = computed(() => (props.error ? `${props.id}-error` : undefined))

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label :for="id" class="block space-y-1.5">
    <span class="block text-base font-medium text-gray-900">{{ label }}</span>
    <span class="relative block">
      <span
        class="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
      >
        <slot name="icon"></slot>
      </span>
      <input
        :id="id"
        :class="[
          'placeholder:text-gray block min-h-12 w-full rounded-lg border bg-white py-3 pl-11 pr-10 text-base shadow-sm transition-colors placeholder:text-base focus:outline-none focus:ring-2',
          error
            ? 'border-red-300 bg-red-50/40 text-red-950 focus:border-red-500 focus:ring-red-100'
            : 'border-gray/50 focus:ring-gray-100'
        ]"
        v-bind="$attrs"
        :value="modelValue"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="errorId"
        @input="updateValue"
      />
      <slot name="suffix"></slot>
    </span>
    <slot></slot>
    <p
      v-if="error"
      :id="errorId"
      class="flex max-w-full items-start gap-1.5 break-words text-sm leading-5 text-red-600"
      role="alert"
    >
      <svg
        class="mt-0.5 h-4 w-4 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-5.75a.75.75 0 0 0 1.5 0v-5a.75.75 0 0 0-1.5 0v5Zm.75 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
    </p>
  </label>
</template>
<style>
::-ms-reveal {
  display: none;
}
</style>
