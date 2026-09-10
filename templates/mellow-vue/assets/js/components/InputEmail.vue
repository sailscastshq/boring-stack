<script setup>
import Envelope from '@/components/ui/icons/Envelope.vue'

import InputBase from '@/components/InputBase.vue'

defineProps({
  label: {
    type: String,
    default: 'Email'
  },
  id: {
    type: String,
    default: 'email'
  },
  placeholder: {
    type: String,
    default: 'Your email'
  },
  error: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <InputBase
    :label="label"
    :id="id"
    type="email"
    :placeholder="placeholder"
    :error="error"
  >
    <template #icon>
      <Envelope class="text-gray h-5 w-5" />
    </template>
    <slot></slot>
  </InputBase>
</template>
