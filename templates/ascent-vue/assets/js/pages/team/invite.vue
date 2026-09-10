<script setup>
import X from '@/components/ui/icons/X.vue'
import Users from '@/components/ui/icons/Users.vue'
import Link from '@/components/ui/icons/Link.vue'
import Clock from '@/components/ui/icons/Clock.vue'
import Check from '@/components/ui/icons/Check.vue'
import Building from '@/components/ui/icons/Building.vue'
import { Link as InertiaLink, Head, useForm } from '@inertiajs/vue3'

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
    class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
  >
    <!-- Background Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="hidden" />
      <div class="hidden" />
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <!-- Logo -->
      <div class="mb-8 flex items-center justify-center">
        <InertiaLink href="/" class="group">
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
        </InertiaLink>
      </div>

      <!-- Header -->
      <header class="mb-8 text-center">
        <div class="mb-6 flex items-center justify-center">
          <div class="relative">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-xl shadow-none bg-gray-50 dark:bg-gray-950"
            >
              <Users class="h-8 w-8 text-white" />
            </div>
            <div class="hidden" />
          </div>
        </div>

        <h1
          class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
        >
          Join {{ team.name }}
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
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
        <div class="hidden" />

        <!-- Main card -->
        <div
          class="relative rounded-xl border border-gray-100 bg-white px-8 py-10 shadow-none dark:border-gray-700 dark:bg-gray-900"
        >
          <div class="space-y-6">
            <!-- Team Info -->
            <div
              class="rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-center dark:border-gray-700"
            >
              <div class="mb-4 flex items-center justify-center">
                <div
                  class="bg-brand-100 text-brand-600 flex h-12 w-12 items-center justify-center rounded-xl dark:text-brand-300 dark:bg-brand-950/40"
                >
                  <Building class="h-6 w-6" />
                </div>
              </div>
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {{ team.name }}
              </h3>

              <!-- Invitation Details -->
              <div
                v-if="via === 'email' && invite"
                class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <div class="flex items-center justify-center space-x-2">
                  <span>Sent to {{ invite.email }}</span>
                </div>

                <div
                  v-if="invite.expiresAt"
                  class="flex items-center justify-center space-x-2"
                >
                  <Clock class="h-4 w-4" />
                  <span>
                    Expires
                    {{ new Date(invite.expiresAt).toLocaleDateString() }}
                  </span>
                </div>
              </div>

              <div v-if="via === 'link'" class="mt-4">
                <div
                  class="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Link class="h-4 w-4" />
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
                  class="flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-4 text-lg font-medium text-red-600 shadow-none transition-all duration-200 hover:brightness-95 hover:border-red-300 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:bg-gray-900 dark:text-red-300 dark:border-red-900"
                >
                  <X class="mr-2 h-5 w-5" />
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
                  class="hover:bg-brand-700 focus:ring-brand-500 flex w-full items-center justify-center rounded-xl px-6 py-4 text-lg font-bold text-white shadow-none transition-all duration-200 hover:brightness-95 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 bg-brand-600"
                >
                  <Check class="mr-2 h-5 w-5" />
                  {{ form.processing ? 'Processing...' : 'Accept' }}
                </button>
              </form>
            </div>

            <!-- Footer Info -->
            <footer
              class="border-t border-gray-100 pt-6 text-center dark:border-gray-700"
            >
              <p class="text-sm text-gray-500 dark:text-gray-400">
                By accepting, you'll be able to collaborate with the team and
                access shared resources.
              </p>
              <p class="mt-2 text-xs text-gray-400">
                Need help?
                <InertiaLink
                  href="/contact"
                  class="text-brand-600 hover:text-brand-500 dark:text-brand-300"
                >
                  Contact support
                </InertiaLink>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
