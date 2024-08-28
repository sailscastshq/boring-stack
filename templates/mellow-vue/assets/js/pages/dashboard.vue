<script setup>
import { usePage } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})
const page = usePage()
const loggedInUser = page.props.user
</script>
<template>Welcome to your dashboard, {{ loggedInUser.fullName }}</template>
