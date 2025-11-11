<script setup>
import { computed } from 'vue'
import VoltAvatar from '@/volt/Avatar.vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  // Allow overriding with direct image/label props
  image: {
    type: String,
    default: null
  },
  label: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'normal'
  },
  shape: {
    type: String,
    default: 'circle'
  }
})

const avatarProps = computed(() => {
  // If image/label are directly provided, use them
  if (props.image) {
    return { image: props.image }
  }
  if (props.label) {
    return { label: props.label }
  }

  // Otherwise, compute from user object
  if (props.user?.currentAvatarUrl) {
    return { image: props.user.currentAvatarUrl }
  }
  return { label: props.user?.initials }
})
</script>

<template>
  <VoltAvatar v-bind="{ ...avatarProps, size, shape, ...$attrs }" />
</template>
