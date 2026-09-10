<script setup>
import User from '@/components/ui/icons/User.vue'

import InputBase from '@/components/InputBase.vue'

defineProps({
  label: {
    type: String,
    default: 'Name'
  },
  id: {
    type: String,
    default: 'name'
  },
  placeholder: {
    type: String,
    default: 'Your name'
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
    type="text"
    :placeholder="placeholder"
    :error="error"
  >
    <template #icon>
      <User class="text-gray h-5 w-5" />
    </template>
    <slot></slot>
  </InputBase>
</template>
