<script setup>
import { watch, onMounted } from 'vue'
import { usePage } from '@inertiajs/vue3'
import Toast from '@/components/ui/toast/Toast.vue'
import { toast } from '@/components/ui/toast/toast.js'
const page = usePage()
function messages(value) {
  return !value ? [] : Array.isArray(value) ? value : [value]
}
function showFlash(flash) {
  if (!flash) return
  for (const [key, title] of [
    ['success', 'Success'],
    ['error', 'Error'],
    ['message', 'Info'],
    ['info', 'Info'],
    ['warning', 'Warning']
  ]) {
    for (const item of messages(flash[key])) {
      toast({
        title,
        message: typeof item === 'object' ? item.message : item,
        duration: key === 'error' ? 5000 : 4000,
        class:
          key === 'error'
            ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
            : ''
      })
    }
  }
  if (flash.toast) {
    const item = flash.toast
    toast({
      title: item.title || item.summary || 'Notification',
      message: item.message || item.detail,
      duration: item.duration ?? item.life ?? 4000
    })
  }
}
onMounted(() => showFlash(page.props.flash))
watch(() => page.props.flash, showFlash)
</script>
<template><Toast position="top-right" /></template>
