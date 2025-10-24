<script setup>
import { Head, useForm } from '@inertiajs/vue3'
import { ref } from 'vue'
import Message from '@/volt/Message.vue'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})

const isWaitlistActive = ref(true)
const shouldShake = ref(false)

const form = useForm({
  email: ''
})

const handleWaitlistSubmit = (e) => {
  e.preventDefault()

  if (!form.email.trim()) {
    shouldShake.value = true
    setTimeout(() => {
      shouldShake.value = false
    }, 500)
    return
  }

  form.post('/waitlist', { preserveScroll: true })
}
</script>

<template>
  <Head title="Ascent - The Complete SaaS Platform for Modern Teams" />

  <section class="relative overflow-hidden px-4 pb-16 pt-20">
    <!-- Background Elements -->
    <div
      class="bg-linear-to-br absolute inset-0 from-brand-50/30 via-white to-accent-50/20"
    />
    <div
      class="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-100/20 blur-3xl"
    />

    <div class="relative mx-auto max-w-4xl text-center">
      <!-- Logo with subtle animation -->
      <div class="mb-8 flex items-center justify-center">
        <div class="relative">
          <div
            class="absolute inset-0 scale-110 rounded-2xl bg-brand-200/20 blur-xl"
          />
          <img
            src="/images/logo.svg"
            alt="Ascent Logo"
            class="relative h-14 w-auto"
          />
        </div>
      </div>

      <!-- Hero headline with better typography -->
      <h1
        class="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
      >
        <span class="block leading-tight text-gray-900">
          Scale Your Team,
        </span>
        <span
          class="bg-linear-to-r block from-brand-600 to-accent-600 bg-clip-text leading-tight text-transparent"
        >
          Streamline Success
        </span>
      </h1>

      <!-- Improved subheading -->
      <p
        class="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-600"
      >
        Stop building the same authentication, billing, and team features over
        and over.
        <span class="font-semibold text-gray-900">
          Launch your SaaS in days, not months.
        </span>
      </p>

      <!-- Social Proof Badge -->
      <div class="mb-8 flex items-center justify-center">
        <div
          class="inline-flex items-center space-x-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm"
        >
          <div class="flex -space-x-1">
            <div
              class="bg-linear-to-br h-6 w-6 rounded-full border-2 border-white from-blue-400 to-blue-600"
            />
            <div
              class="bg-linear-to-br h-6 w-6 rounded-full border-2 border-white from-green-400 to-green-600"
            />
            <div
              class="bg-linear-to-br h-6 w-6 rounded-full border-2 border-white from-purple-400 to-purple-600"
            />
          </div>
          <span class="text-sm font-medium text-gray-700">
            Join 2,847+ developers
          </span>
        </div>
      </div>

      <!-- Waitlist/CTA Section -->
      <div class="mx-auto mb-16 max-w-lg">
        <div v-if="isWaitlistActive" class="relative">
          <div
            class="bg-linear-to-r absolute inset-0 scale-105 rounded-2xl from-brand-600 to-accent-600 opacity-20 blur-xl"
          />
          <form
            @submit="handleWaitlistSubmit"
            :class="[
              'relative rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl transition-all duration-300',
              shouldShake ? 'ring-4 ring-red-100' : 'hover:shadow-3xl'
            ]"
            :style="{
              animation: shouldShake ? 'shake 0.5s ease-in-out' : 'none'
            }"
          >
            <div class="mb-6 text-center">
              <h3 class="mb-2 text-2xl font-bold text-gray-900">
                Join the Waitlist
              </h3>
              <p class="font-medium text-gray-600">
                Be the first to scale with Ascent
              </p>
            </div>

            <!-- Global error -->
            <div v-if="form.errors.waitlist" class="mb-6" role="alert">
              <Message
                severity="error"
                :text="form.errors.waitlist"
                class="w-full"
              />
            </div>

            <div class="space-y-4">
              <div class="relative">
                <input
                  id="email-input"
                  v-model="form.email"
                  type="email"
                  placeholder="Enter your email address"
                  :class="[
                    'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                    shouldShake || form.errors.email
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-300 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                  ]"
                  :disabled="form.processing"
                  :aria-describedby="
                    form.errors.email ? 'email-error' : undefined
                  "
                  :aria-invalid="form.errors.email ? 'true' : 'false'"
                  required
                />
                <p
                  v-if="form.errors.email"
                  id="email-error"
                  class="mt-2 text-sm text-red-600"
                  role="alert"
                >
                  {{ form.errors.email }}
                </p>
              </div>

              <button
                type="submit"
                :disabled="form.processing"
                class="bg-linear-to-r w-full rounded-xl from-brand-600 to-accent-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-75"
                aria-describedby="email-input"
              >
                <span
                  v-if="form.processing"
                  class="flex items-center justify-center space-x-2"
                >
                  <svg
                    class="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  <span>Joining...</span>
                </span>
                <span v-else>Join the Waitlist →</span>
              </button>
            </div>

            <div
              class="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400"
            >
              <div class="flex items-center space-x-1">
                <svg
                  class="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Early access</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg
                  class="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>No spam</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg
                  class="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </form>
        </div>

        <!-- CTA Mode (when waitlist is disabled) -->
        <div v-else class="text-center">
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              class="hover:shadow-3xl bg-linear-to-r group relative rounded-xl from-brand-600 to-accent-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-200 hover:scale-[1.02]"
            >
              <span class="relative z-10">Start Free Trial</span>
              <div
                class="bg-linear-to-r absolute inset-0 rounded-xl from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
            <button
              class="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 font-bold text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl"
            >
              Schedule Demo
            </button>
          </div>
          <p class="mt-6 text-sm font-medium text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Key Features Section -->
  <section class="relative bg-white px-4 py-20">
    <!-- Subtle background pattern -->
    <div class="bg-linear-to-b absolute inset-0 from-gray-50/50 to-white" />
    <div
      class="absolute inset-0"
      style="
        background-image: radial-gradient(
          circle at 1px 1px,
          rgba(15, 23, 42, 0.15) 1px,
          transparent 0
        );
        background-size: 24px 24px;
      "
    />

    <div class="relative mx-auto max-w-7xl">
      <div class="mb-16 text-center">
        <div class="mb-4">
          <span
            class="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700"
          >
            ✨ Features
          </span>
        </div>
        <h2
          class="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl"
        >
          Everything You Need to
          <span
            class="bg-linear-to-r block from-brand-600 to-accent-600 bg-clip-text text-transparent"
          >
            Scale Fast
          </span>
        </h2>
        <p
          class="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-600"
        >
          From authentication to payments, we've built all the infrastructure
          your growing business needs.
          <span class="mt-2 block font-semibold text-gray-900">
            Focus on what makes you unique.
          </span>
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- Secure Authentication -->
        <div
          class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-brand-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-brand-500 to-brand-600 shadow-lg"
            >
              <svg
                class="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Secure Authentication
            </h3>
            <p class="mb-4 leading-relaxed text-gray-600">
              OAuth, magic links, 2FA, and session management. Enterprise-grade
              security that scales.
            </p>
            <div class="flex items-center text-sm font-medium text-brand-600">
              <span>OAuth • 2FA • Magic Links</span>
            </div>
          </div>
        </div>

        <!-- Subscription Billing -->
        <div
          class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-accent-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-accent-500 to-accent-600 shadow-lg"
            >
              <svg
                class="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Subscription Billing
            </h3>
            <p class="mb-4 leading-relaxed text-gray-600">
              Lemon Squeezy integration for seamless recurring payments and
              subscription management.
            </p>
            <div class="flex items-center text-sm font-medium text-accent-600">
              <span>Recurring • One-time • Trials</span>
            </div>
          </div>
        </div>

        <!-- Team Management -->
        <div
          class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-success-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-success-500 to-success-600 shadow-lg"
            >
              <svg
                class="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Team Management
            </h3>
            <p class="mb-4 leading-relaxed text-gray-600">
              Multi-tenancy with team invites, role-based permissions, and
              complete workspace isolation.
            </p>
            <div class="flex items-center text-sm font-medium text-success-600">
              <span>Roles • Invites • Workspaces</span>
            </div>
          </div>
        </div>

        <!-- Admin Dashboard -->
        <div
          class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-purple-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-purple-500 to-purple-600 shadow-lg"
            >
              <svg
                class="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Admin Dashboard
            </h3>
            <p class="mb-4 leading-relaxed text-gray-600">
              Powerful admin interface to manage users, subscriptions, and
              monitor your business metrics.
            </p>
            <div class="flex items-center text-sm font-medium text-purple-600">
              <span>Analytics • Users • Revenue</span>
            </div>
          </div>
        </div>

        <!-- Content & Blog -->
        <div
          class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-orange-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-orange-500 to-orange-600 shadow-lg"
            >
              <svg
                class="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">Content & Blog</h3>
            <p class="mb-4 leading-relaxed text-gray-600">
              Built-in CMS and blog system powered by Sails Content to engage
              your audience and improve SEO.
            </p>
            <div class="flex items-center text-sm font-medium text-orange-600">
              <span>CMS • Blog • SEO Ready</span>
            </div>
          </div>
        </div>

        <!-- Transactional Email -->
        <div
          class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-red-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-red-500 to-red-600 shadow-lg"
            >
              <svg
                class="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Transactional Email
            </h3>
            <p class="mb-4 leading-relaxed text-gray-600">
              Automated emails for onboarding, billing, notifications, and
              customer communication.
            </p>
            <div class="flex items-center text-sm font-medium text-red-600">
              <span>Templates • Triggers • Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Value Proposition Section -->
  <section class="relative overflow-hidden bg-gray-900 px-4 py-24">
    <!-- Background Elements -->
    <div
      class="bg-linear-to-br absolute inset-0 from-gray-900 via-gray-800 to-brand-900"
    />
    <div
      class="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-500/10 blur-3xl"
    />

    <div class="relative mx-auto max-w-6xl">
      <div class="mb-16 text-center">
        <h2
          class="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        >
          Why Choose
          <span
            class="bg-linear-to-r block from-brand-400 to-accent-400 bg-clip-text text-transparent"
          >
            The Boring Stack?
          </span>
        </h2>
        <p
          class="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-300"
        >
          Because it works. No drama, no complexity, just results.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div class="group text-center">
          <div class="mb-6 flex justify-center">
            <div class="relative">
              <div
                class="absolute inset-0 scale-110 rounded-2xl bg-brand-500/20 blur-xl"
              />
              <div
                class="bg-linear-to-br relative rounded-2xl from-brand-500 to-brand-600 p-4 shadow-2xl"
              >
                <svg
                  class="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h3 class="mb-4 text-2xl font-bold text-white">Ship Fast</h3>
          <p class="leading-relaxed text-gray-300">
            Built with battle-tested technologies. No more wrestling with
            complex build tools or chasing JavaScript trends.
          </p>
          <div
            class="mt-4 inline-flex items-center text-sm font-medium text-brand-400"
          >
            <span>React • Node.js • PostgreSQL</span>
          </div>
        </div>

        <div class="group text-center">
          <div class="mb-6 flex justify-center">
            <div class="relative">
              <div
                class="absolute inset-0 scale-110 rounded-2xl bg-accent-500/20 blur-xl"
              />
              <div
                class="bg-linear-to-br relative rounded-2xl from-accent-500 to-accent-600 p-4 shadow-2xl"
              >
                <svg
                  class="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h3 class="mb-4 text-2xl font-bold text-white">SaaS Ready</h3>
          <p class="leading-relaxed text-gray-300">
            Authentication, payments, teams, admin dashboard, and more.
            Everything you need to launch your SaaS.
          </p>
          <div
            class="mt-4 inline-flex items-center text-sm font-medium text-accent-400"
          >
            <span>Auth • Billing • Multi-tenancy</span>
          </div>
        </div>

        <div class="group text-center">
          <div class="mb-6 flex justify-center">
            <div class="relative">
              <div
                class="absolute inset-0 scale-110 rounded-2xl bg-success-500/20 blur-xl"
              />
              <div
                class="bg-linear-to-br relative rounded-2xl from-success-500 to-success-600 p-4 shadow-2xl"
              >
                <svg
                  class="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h3 class="mb-4 text-2xl font-bold text-white">Premium Experience</h3>
          <p class="leading-relaxed text-gray-300">
            PrimeReact components, Tailwind CSS, and modern tooling. Everything
            works together seamlessly.
          </p>
          <div
            class="mt-4 inline-flex items-center text-sm font-medium text-success-400"
          >
            <span>PrimeReact • Tailwind • TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="relative overflow-hidden bg-white px-4 py-20">
    <!-- Subtle background pattern -->
    <div class="bg-linear-to-b absolute inset-0 from-gray-50/30 to-white" />
    <div
      class="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-brand-100/20 blur-3xl"
    />
    <div
      class="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-accent-100/20 blur-3xl"
    />

    <div class="relative mx-auto max-w-4xl">
      <div class="mb-16 text-center">
        <div class="mb-4">
          <span
            class="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700"
          >
            ❓ FAQ
          </span>
        </div>
        <h2
          class="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl"
        >
          Got Questions?
          <span
            class="bg-linear-to-r block from-brand-600 to-accent-600 bg-clip-text text-transparent"
          >
            We've Got Answers
          </span>
        </h2>
        <p
          class="mx-auto max-w-2xl text-xl font-medium leading-relaxed text-gray-600"
        >
          Everything you need to know about launching your SaaS with Ascent.
        </p>
      </div>

      <div class="space-y-6">
        <details
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600"
            >
              Why should I choose Ascent over building from scratch?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100"
              >
                <svg
                  class="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4">
              <p class="mb-4 leading-relaxed text-gray-600">
                Building a SaaS from scratch takes 6-12 months of expensive
                development time. Ascent gives you everything—authentication,
                billing, teams, admin dashboard—in minutes, not months.
              </p>
              <div
                class="inline-flex items-center space-x-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Save 6+ months of development time</span>
              </div>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600"
            >
              How much money could this save my startup?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-success-50 transition-colors group-hover:bg-success-100"
              >
                <svg
                  class="h-4 w-4 text-success-600 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4">
              <p class="mb-4 leading-relaxed text-gray-600">
                Hiring a full-stack developer costs $120k+ annually. Building
                auth, payments, and admin features takes months of expensive
                development time. Ascent delivers production-ready SaaS
                infrastructure immediately.
              </p>
              <div
                class="inline-flex items-center space-x-2 rounded-lg bg-success-50 px-3 py-2 text-sm font-semibold text-success-700"
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span>ROI from day one instead of month six</span>
              </div>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600"
            >
              Is this actually production-ready or just a demo?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 transition-colors group-hover:bg-accent-100"
              >
                <svg
                  class="h-4 w-4 text-accent-600 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4">
              <p class="mb-4 leading-relaxed text-gray-600">
                100% production-ready. Enterprise-grade security, real payment
                processing, automated emails, database migrations, deployment
                scripts—everything you need to launch and scale.
              </p>
              <div
                class="inline-flex items-center space-x-2 rounded-lg bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Deploy to production in hours, not months</span>
              </div>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600"
            >
              What if I need to customize or add features?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 transition-colors group-hover:bg-purple-100"
              >
                <svg
                  class="h-4 w-4 text-purple-600 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4">
              <p class="mb-4 leading-relaxed text-gray-600">
                You get the full source code—no black boxes, no vendor lock-in.
                Built with clean, modern patterns that are easy to extend. Add
                your unique features on top of our solid foundation.
              </p>
              <div
                class="inline-flex items-center space-x-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700"
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <span>Your code, your control, your IP</span>
              </div>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600"
            >
              How do I know this won't become technical debt?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 transition-colors group-hover:bg-orange-100"
              >
                <svg
                  class="h-4 w-4 text-orange-600 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4">
              <p class="mb-4 leading-relaxed text-gray-600">
                Built on The Boring Stack—proven technologies that have powered
                successful companies for years. No experimental frameworks, no
                bleeding-edge risks. Just reliable, maintainable code that
                scales.
              </p>
              <div
                class="inline-flex items-center space-x-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700"
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>
                  Battle-tested foundation, future-proof architecture
                </span>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
details > summary {
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

@keyframes details-show {
  from {
    opacity: 0;
    transform: var(--details-translate, translateY(-0.5em));
  }
}

details[open] > :not(summary) {
  animation: details-show 150ms ease-in-out;
}

/* Shake animation for form validation */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}
</style>
