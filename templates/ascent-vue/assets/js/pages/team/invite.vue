<script setup>
import { Link, Head, useForm } from '@inertiajs/vue3'
import Toast from '@/volt/Toast.vue'
import { useFlashToast } from '@/composables/flashToast'

const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  inviteToken: {
    type: String,
    required: true
  },
  via: {
    type: String,
    required: true
  },
  invite: {
    type: Object,
    default: null
  }
})

useFlashToast()

const form = useForm({
  inviteToken: props.inviteToken,
  response: ''
})

function handleInviteResponse(response) {
  form.response = response
  form.post(`/team/${props.inviteToken}`)
}
</script>

<template>
  <Head :title="`Join ${team.name} | Ascent`" />

  <div
    class="bg-linear-to-br flex min-h-screen flex-col justify-center from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8"
  >
    <!-- Background Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"
      />
      <div
        class="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"
      />
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
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
              class="relative h-12 w-auto"
            />
          </div>
        </Link>
      </div>

      <!-- Header -->
      <header class="mb-8 text-center">
        <div class="mb-6 flex items-center justify-center">
          <div class="relative">
            <div
              class="bg-linear-to-r flex h-16 w-16 items-center justify-center rounded-2xl from-brand-600 to-accent-600 shadow-lg"
            >
              <svg
                class="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div
              class="absolute inset-0 scale-110 rounded-2xl bg-brand-200/40 opacity-70 blur-xl"
            />
          </div>
        </div>

        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          Join {{ team.name }}
        </h1>
        <p class="mt-4 text-lg text-gray-600">
          <template v-if="via === 'email' && invite?.invitedBy">
            <strong>
              {{ invite.invitedBy.fullName || invite.invitedBy.email }}
            </strong>
            invited you to join their team
          </template>
          <template v-else>
            You've been invited to join {{ team.name }}
          </template>
        </p>
      </header>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="relative">
        <!-- Background blur effect -->
        <div
          class="bg-linear-to-r absolute inset-0 scale-105 rounded-2xl from-brand-600/10 to-accent-600/10 blur-xl"
        />

        <!-- Main card -->
        <div
          class="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl"
        >
          <div class="space-y-6">
            <!-- Team Info -->
            <div
              class="rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-center"
            >
              <div class="mb-4 flex items-center justify-center">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"
                >
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ team.name }}
              </h3>

              <!-- Invitation Details -->
              <div
                v-if="via === 'email' && invite"
                class="mt-4 space-y-2 text-sm text-gray-600"
              >
                <div class="flex items-center justify-center space-x-2">
                  <span>Sent to {{ invite.email }}</span>
                </div>

                <div
                  v-if="invite.expiresAt"
                  class="flex items-center justify-center space-x-2"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Expires
                    {{ new Date(invite.expiresAt).toLocaleDateString() }}
                  </span>
                </div>
              </div>

              <div v-if="via === 'link'" class="mt-4">
                <div
                  class="flex items-center justify-center space-x-2 text-sm text-gray-600"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>Shareable team invitation</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-4 sm:flex-row">
              <!-- Decline Form -->
              <form
                @submit.prevent="handleInviteResponse('decline')"
                class="order-2 flex-1 sm:order-1"
              >
                <button
                  type="submit"
                  :disabled="form.processing"
                  class="flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-4 text-lg font-medium text-red-600 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-red-300 hover:bg-red-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg
                    class="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {{ form.processing ? 'Processing...' : 'Decline' }}
                </button>
              </form>

              <!-- Accept Form -->
              <form
                @submit.prevent="handleInviteResponse('accept')"
                class="order-1 flex-1 sm:order-2"
              >
                <button
                  type="submit"
                  :disabled="form.processing"
                  class="bg-linear-to-r flex w-full items-center justify-center rounded-xl from-brand-600 to-accent-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-brand-700 hover:to-accent-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg
                    class="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {{ form.processing ? 'Processing...' : 'Accept' }}
                </button>
              </form>
            </div>

            <!-- Footer Info -->
            <footer class="border-t border-gray-100 pt-6 text-center">
              <p class="text-sm text-gray-500">
                By accepting, you'll be able to collaborate with the team and
                access shared resources.
              </p>
              <p class="mt-2 text-xs text-gray-400">
                Need help?
                <Link
                  href="/contact"
                  class="text-brand-600 hover:text-brand-500"
                >
                  Contact support
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Toast />
</template>
