<script setup>
import { useForm } from '@inertiajs/vue3'
import InputText from '@/volt/InputText.vue'
import Button from '@/volt/Button.vue'
import Message from '@/volt/Message.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: DashboardLayout
})

const form = useForm({
  name: ''
})

function handleSubmit() {
  form.post('/teams')
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <header class="mb-8">
      <h1 class="mb-2 text-2xl font-bold text-gray-900">Create New Team</h1>
      <p class="text-gray-600">
        Create a new team to collaborate with others. You'll be the owner of
        this team.
      </p>
    </header>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="mb-2 block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <InputText
          id="name"
          v-model="form.name"
          placeholder="Enter team name"
          class="w-full"
          :invalid="!!form.errors.name"
        />
        <Message
          v-if="form.errors.name"
          severity="error"
          :text="form.errors.name"
          class="mt-2"
        />
      </div>

      <div class="flex gap-3">
        <Button
          type="submit"
          :disabled="form.processing"
          :loading="form.processing"
          class="px-6"
        >
          Create Team
        </Button>
        <Button
          type="button"
          variant="outlined"
          @click="() => window.history.back()"
          :disabled="form.processing"
        >
          Cancel
        </Button>
      </div>
    </form>
  </div>
</template>
