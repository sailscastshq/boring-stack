<script setup>
import { ref, computed } from 'vue'
import { Head, useForm, Link } from '@inertiajs/vue3'
import Button from '@/volt/Button.vue'
import InputText from '@/volt/InputText.vue'
import Textarea from '@/volt/Textarea.vue'
import Select from '@/volt/Select.vue'
import Message from '@/volt/Message.vue'
import Toast from '@/volt/Toast.vue'
import { useFlashToast } from '@/composables/flashToast'

const props = defineProps({
  internalEmail: {
    type: String,
    required: true
  }
})

const toast = ref(null)
useFlashToast(toast)

const selectedTopic = ref(null)

const form = useForm({
  name: '',
  email: '',
  company: '',
  topic: '',
  message: ''
})

const topicOptions = [
  { label: 'General Inquiry', value: 'general' },
  { label: 'Sales & Pricing', value: 'sales' },
  { label: 'Technical Support', value: 'support' },
  { label: 'Enterprise Plans', value: 'enterprise' },
  { label: 'Partnerships', value: 'partnerships' },
  { label: 'Feature Request', value: 'feature-request' },
  { label: 'Bug Report', value: 'bug-report' },
  { label: 'Other', value: 'other' }
]

function handleSubmit(e) {
  e.preventDefault()
  form.post('/contact', {
    onSuccess: () => {
      form.reset()
      selectedTopic.value = null
    }
  })
}

function handleTopicChange(e) {
  selectedTopic.value = e.value
  form.topic = e.value
}
</script>

<template>
  <Head title="Contact Us | Ascent" />

  <main
    class="bg-linear-to-br min-h-screen from-brand-50/30 via-white to-accent-50/20"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"
      />
      <div
        class="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"
      />
    </div>

    <div class="relative px-6 py-24 sm:py-32 lg:px-8">
      <!-- Logo -->
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div
              class="absolute inset-0 scale-110 rounded-2xl bg-brand-200/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
            />
            <img
              src="/images/logo.svg"
              alt="Ascent Logo"
              class="relative h-12 w-auto transition-transform group-hover:scale-105"
            />
          </div>
        </Link>
      </div>

      <header class="mx-auto max-w-2xl text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Get in Touch
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Have a question or need help? We'd love to hear from you. Send us a
          message and we'll respond as soon as possible.
        </p>
      </header>

      <section class="mx-auto mt-16 max-w-xl">
        <div class="relative">
          <div
            class="bg-linear-to-r absolute inset-0 scale-105 rounded-2xl from-brand-600/10 to-accent-600/10 blur-xl"
            aria-hidden="true"
          />

          <div
            class="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl"
          >
            <form
              @submit="handleSubmit"
              class="space-y-5"
              aria-label="Contact form"
            >
              <fieldset
                class="grid grid-cols-1 gap-5 sm:grid-cols-2"
                aria-describedby="contact-info"
              >
                <div>
                  <label
                    for="name"
                    class="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Name
                  </label>
                  <InputText
                    id="name"
                    v-model="form.name"
                    class="w-full rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    placeholder="Your name"
                    required
                  />
                  <Message
                    v-if="form.errors.name"
                    severity="error"
                    :text="form.errors.name"
                    class="mt-2"
                    role="alert"
                  />
                </div>

                <div>
                  <label
                    for="email"
                    class="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Email
                  </label>
                  <InputText
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="w-full rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    placeholder="your@email.com"
                    required
                  />
                  <Message
                    v-if="form.errors.email"
                    severity="error"
                    :text="form.errors.email"
                    class="mt-2"
                    role="alert"
                  />
                </div>
              </fieldset>

              <fieldset>
                <label
                  for="company"
                  class="mb-2 block text-sm font-semibold text-gray-900"
                >
                  Company (Optional)
                </label>
                <InputText
                  id="company"
                  v-model="form.company"
                  class="w-full rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  placeholder="Your company name"
                />
              </fieldset>

              <fieldset>
                <label
                  for="topic"
                  class="mb-2 block text-sm font-semibold text-gray-900"
                >
                  Topic
                </label>
                <Select
                  :model-value="selectedTopic"
                  @update:model-value="handleTopicChange"
                  :options="topicOptions"
                  placeholder="What can we help you with?"
                  class="w-full"
                  panel-class="mt-1"
                />
                <Message
                  v-if="form.errors.topic"
                  severity="error"
                  :text="form.errors.topic"
                  class="mt-2"
                  role="alert"
                />
              </fieldset>

              <fieldset>
                <label
                  for="message"
                  class="mb-2 block text-sm font-semibold text-gray-900"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  v-model="form.message"
                  class="w-full rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  :rows="6"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
                <Message
                  v-if="form.errors.message"
                  severity="error"
                  :text="form.errors.message"
                  class="mt-2"
                  role="alert"
                />
              </fieldset>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="form.processing"
                  :aria-describedby="
                    form.processing ? 'submit-status' : undefined
                  "
                  :class="[
                    'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                    form.processing
                      ? 'bg-gray-300'
                      : 'bg-linear-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                  ]"
                >
                  <div
                    v-if="form.processing"
                    class="flex items-center space-x-2"
                    id="submit-status"
                  >
                    <svg
                      class="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Sending...</span>
                  </div>
                  <span v-else>Send Message</span>
                </button>
              </div>
            </form>

            <footer class="mt-8 border-t border-gray-300 pt-8">
              <div class="text-center">
                <h3 class="text-lg font-semibold text-gray-900">
                  Other Ways to Reach Us
                </h3>
                <address class="mt-4 space-y-2 not-italic">
                  <p class="text-sm text-gray-600">
                    <strong class="text-gray-900">Email:</strong>
                    <a
                      :href="`mailto:${internalEmail}`"
                      class="text-brand-600 transition-colors hover:text-brand-500"
                    >
                      {{ internalEmail }}
                    </a>
                  </p>
                  <p class="text-sm text-gray-600">
                    <strong class="text-gray-900"> Response Time: </strong>
                    We typically respond within 24 hours
                  </p>
                </address>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </div>
  </main>

  <Toast ref="toast" />
</template>
