<script setup>
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { useForm } from '@inertiajs/vue3'
import InputText from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Message from '@/components/ui/alert/Alert.vue'
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
          class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand w-full"
          :aria-invalid="!!form.errors.name"
        />
        <Message
          role="alert"
          v-if="form.errors.name"
          class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
        >
          {{ form.errors.name }}
        </Message>
      </div>

      <div class="flex gap-3">
        <Button
          :disabled="form.processing || form.processing"
          :aria-busy="form.processing"
          type="submit"
          class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 px-6"
          ><Spinner v-if="form.processing" class="h-4 w-4" />
          Create Team
        </Button>
        <Button
          class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 bg-transparent text-brand dark:bg-transparent dark:text-brand-400"
          type="button"
          @click="() => window.history.back()"
          :disabled="form.processing"
        >
          Cancel
        </Button>
      </div>
    </form>
  </div>
</template>
