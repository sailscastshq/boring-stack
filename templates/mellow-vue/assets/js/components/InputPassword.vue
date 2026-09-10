<script setup>
import Button from '@/components/ui/button/Button.vue'

import Lock from '@/components/ui/icons/Lock.vue'
import Eye from '@/components/ui/icons/Eye.vue'
import EyeOff from '@/components/ui/icons/EyeOff.vue'

import { ref } from 'vue'
import InputBase from '@/components/InputBase.vue'

const showPassword = ref(false)

defineProps({
  label: {
    type: String,
    default: 'Password'
  },
  id: {
    type: String,
    default: 'password'
  },
  placeholder: {
    type: String,
    default: 'Your password'
  },
  error: {
    type: String,
    default: ''
  }
})

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <InputBase
    :label="label"
    :id="id"
    :type="showPassword ? 'text' : 'password'"
    :placeholder="placeholder"
    :error="error"
  >
    <template #icon>
      <Lock class="text-gray h-5 w-5" />
    </template>
    <template #suffix>
      <span class="absolute right-3 top-1/2 -translate-y-1/2">
        <Button
          type="button"
          @click="toggleShowPassword"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          class="min-h-5 min-w-5 rounded-sm bg-transparent p-0 hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent"
        >
          <Eye class="text-gray h-5 w-5" v-if="!showPassword" />
          <EyeOff class="text-gray h-5 w-5" v-else />
        </Button>
      </span>
    </template>
    <slot></slot>
  </InputBase>
</template>
