<script setup>
import FileUpload from '@/components/ui/file-upload/FileUpload.vue'
import Button from '@/components/ui/button/Button.vue'
import Camera from '@/components/ui/icons/Camera.vue'
import Edit from '@/components/ui/icons/Edit.vue'
defineProps({
  currentImageUrl: { type: String, default: '' },
  accept: { type: String, default: 'image/*' }
})
const emit = defineEmits(['image-select'])
</script>
<template>
  <FileUpload
    :accept="accept"
    @update:model-value="(file) => emit('image-select', file)"
    v-slot="{ previewUrl, choose }"
  >
    <div class="relative inline-block">
      <img
        v-if="previewUrl || currentImageUrl"
        :src="previewUrl || currentImageUrl"
        alt="Profile picture"
        class="h-32 w-32 rounded-lg border border-gray-300 object-cover dark:border-gray-700"
      />
      <div
        v-else
        class="flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-950"
      >
        <Camera class="h-6 w-6 text-gray-400" /><span
          class="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >No image</span
        >
      </div>
      <div
        class="absolute -top-2 -right-4 overflow-hidden rounded-full bg-white shadow-none dark:bg-gray-900"
      >
        <Button
          class="min-h-8 min-w-8 rounded-full bg-transparent p-2 text-gray-600 hover:bg-gray-100 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Change image"
          @click="choose"
          ><Edit class="h-4 w-4"
        /></Button>
      </div>
    </div>
  </FileUpload>
</template>
