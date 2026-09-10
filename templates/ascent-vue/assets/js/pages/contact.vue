<script setup>
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { onMounted, watch } from 'vue'
import { readContactDraft, saveContactDraft } from '@/lib/contact-draft'
import { Head, useForm, Link } from '@inertiajs/vue3'
import InputText from '@/components/ui/input/Input.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Select from '@/components/ui/select/Select.vue'
import Message from '@/components/ui/alert/Alert.vue'

const props = defineProps({
  internalEmail: {
    type: String,
    required: true
  }
})

const form = useForm({
  name: '',
  email: '',
  company: '',
  topic: '',
  message: ''
})

onMounted(() => {
  const draft = readContactDraft()
  if (draft) Object.assign(form, draft)
})
watch(
  () => [form.message, form.topic],
  () => saveContactDraft(form),
  { flush: 'sync' }
)

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
    }
  })
}

function handleTopicChange(value) {
  form.topic = value
}
</script>

<template>
  <Head title="Contact Us | Ascent" />

  <main class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div class="hidden" />
      <div class="hidden" />
    </div>

    <div class="relative px-6 py-24 sm:py-32 lg:px-8">
      <!-- Logo -->
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div class="hidden" />
            <span
              class="inline-flex items-center gap-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              aria-label="Ascent"
              >Ascent<span
                class="text-brand-600 dark:text-brand-300"
                aria-hidden="true"
                >↗</span
              ></span
            >
          </div>
        </Link>
      </div>

      <header class="mx-auto max-w-2xl text-center">
        <h1
          class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100"
        >
          Get in Touch
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Have a question or need help? We'd love to hear from you. Send us a
          message and we'll respond as soon as possible.
        </p>
      </header>

      <section class="mx-auto mt-16 max-w-xl">
        <div class="relative">
          <div class="hidden" aria-hidden="true" />

          <div
            class="relative rounded-xl border border-gray-100 bg-white px-8 py-10 shadow-none dark:border-gray-700 dark:bg-gray-900"
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
                    class="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Name
                  </label>
                  <InputText
                    id="name"
                    v-model="form.name"
                    class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand focus:border-brand-300 focus:ring-brand-100 w-full rounded-lg border border-gray-300 bg-white px-4 py-4 text-base font-medium transition-all duration-200 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Your name"
                    required
                  />
                  <Message
                    v-if="form.errors.name"
                    class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
                    role="alert"
                  >
                    {{ form.errors.name }}
                  </Message>
                </div>

                <div>
                  <label
                    for="email"
                    class="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Email
                  </label>
                  <InputText
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand focus:border-brand-300 focus:ring-brand-100 w-full rounded-lg border border-gray-300 bg-white px-4 py-4 text-base font-medium transition-all duration-200 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800"
                    placeholder="your@email.com"
                    required
                  />
                  <Message
                    v-if="form.errors.email"
                    class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
                    role="alert"
                  >
                    {{ form.errors.email }}
                  </Message>
                </div>
              </fieldset>

              <fieldset>
                <label
                  for="company"
                  class="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Company (Optional)
                </label>
                <InputText
                  id="company"
                  v-model="form.company"
                  class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand focus:border-brand-300 focus:ring-brand-100 w-full rounded-lg border border-gray-300 bg-white px-4 py-4 text-base font-medium transition-all duration-200 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Your company name"
                />
              </fieldset>

              <fieldset>
                <label
                  for="topic"
                  class="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Topic
                </label>
                <Select
                  id="topic"
                  :model-value="form.topic"
                  @update:model-value="handleTopicChange"
                  :options="topicOptions"
                  placeholder="What can we help you with?"
                  class="w-full"
                />
                <Message
                  v-if="form.errors.topic"
                  class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
                  role="alert"
                >
                  {{ form.errors.topic }}
                </Message>
              </fieldset>

              <fieldset>
                <label
                  for="message"
                  class="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  v-model="form.message"
                  class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand focus:border-brand-300 focus:ring-brand-100 w-full rounded-lg border border-gray-300 bg-white px-4 py-4 text-base font-medium transition-all duration-200 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800"
                  :rows="6"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
                <Message
                  v-if="form.errors.message"
                  class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
                  role="alert"
                >
                  {{ form.errors.message }}
                </Message>
              </fieldset>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="form.processing"
                  :aria-describedby="
                    form.processing ? 'submit-status' : undefined
                  "
                  :class="[
                    'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-none transition-all duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                    form.processing
                      ? 'bg-gray-300'
                      : 'hover:bg-brand-700 focus:ring-brand-500  focus:ring-2 focus:ring-offset-2 focus:outline-none bg-brand-600 dark:bg-brand-600'
                  ]"
                >
                  <div
                    v-if="form.processing"
                    class="flex items-center space-x-2"
                    id="submit-status"
                  >
                    <Spinner class="h-5 w-5" />
                    <span>Sending...</span>
                  </div>
                  <span v-else>Send Message</span>
                </button>
              </div>
            </form>

            <footer
              class="mt-8 border-t border-gray-300 pt-8 dark:border-gray-700"
            >
              <div class="text-center">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  Other Ways to Reach Us
                </h3>
                <address class="mt-4 space-y-2 not-italic">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    <strong class="text-gray-900 dark:text-gray-100"
                      >Email:</strong
                    >
                    <a
                      :href="`mailto:${internalEmail}`"
                      class="text-brand-600 hover:text-brand-500 transition-colors dark:text-brand-300"
                    >
                      {{ internalEmail }}
                    </a>
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    <strong class="text-gray-900 dark:text-gray-100">
                      Response Time:
                    </strong>
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
</template>
