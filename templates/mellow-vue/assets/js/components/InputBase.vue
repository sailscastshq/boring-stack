<script setup>
import Input from '@/components/ui/input/Input.vue'

import WarningTriangle from '@/components/ui/icons/WarningTriangle.vue'

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
</script>

<template>
  <div class="block space-y-1.5">
    <label :for="id" class="block text-base font-medium text-gray-900">{{
      label
    }}</label>
    <span class="relative block">
      <span
        class="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
      >
        <slot name="icon"></slot>
      </span>
      <Input
        :id="id"
        :class="[
          'placeholder:text-gray min-h-12 block w-full rounded-lg border bg-white py-3 pl-11 pr-10 text-base shadow-none transition-colors placeholder:text-base focus:outline-none focus:ring-2',
          error
            ? 'border-red-300 bg-red-50/40 text-red-950 focus:border-red-500 focus:ring-red-100'
            : 'border-gray/50 focus:ring-gray-100'
        ]"
        v-bind="$attrs"
        :model-value="modelValue"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="errorId"
        @update:model-value="emit('update:modelValue', $event)"
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
      <WarningTriangle class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>
<style>
::-ms-reveal {
  display: none;
}
</style>
