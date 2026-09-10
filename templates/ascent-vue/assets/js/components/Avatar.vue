<script setup>
import { computed } from 'vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'

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
  <Avatar
    :src="avatarProps.image"
    alt=""
    v-bind="$attrs"
    :class="[
      shape === 'square' ? 'rounded-lg' : 'rounded-full',
      size === 'large'
        ? 'size-12 text-2xl'
        : size === 'xlarge'
          ? 'size-16 text-3xl'
          : 'size-8'
    ]"
    >{{ avatarProps.label }}</Avatar
  >
</template>
