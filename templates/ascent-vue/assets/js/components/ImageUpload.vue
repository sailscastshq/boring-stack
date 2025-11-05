<script setup>
import { ref, watch } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'

const props = defineProps({
  currentImageUrl: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['image-select'])

const previewUrl = ref(props.currentImageUrl)
const fileInputRef = ref(null)

// Watch for changes to currentImageUrl prop
watch(
  () => props.currentImageUrl,
  (newUrl) => {
    previewUrl.value = newUrl
  }
)

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    // Create preview URL
    const url = URL.createObjectURL(file)
    previewUrl.value = url

    // Pass file to parent component
    emit('image-select', file)
  }
}

function openFileDialog() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div :class="['image-upload-container', props.class]">
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileSelect"
    />

    <div class="relative inline-block">
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Profile picture"
        class="h-32 w-32 rounded-lg border border-gray-300 object-cover"
      />
      <div
        v-else
        class="flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
      >
        <i class="pi pi-camera text-2xl text-gray-400" />
        <span class="mt-1 text-xs text-gray-500">No image</span>
      </div>

      <!-- Edit button overlay -->
      <div
        class="absolute -right-4 -top-2 overflow-hidden rounded-full bg-white shadow-md"
      >
        <SecondaryButton
          icon="pi pi-pencil"
          size="small"
          type="button"
          text
          rounded
          tooltip="Change image"
          @click="openFileDialog"
        />
      </div>
    </div>
  </div>
</template>
