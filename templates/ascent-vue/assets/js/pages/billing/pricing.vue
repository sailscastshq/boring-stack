<script setup>
import { Link, Head } from '@inertiajs/vue3'
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})

const props = defineProps({
  plans: {
    type: Object,
    required: true
  }
})

const billingCycle = ref('monthly')

const sliderPosition = computed(() => {
  return billingCycle.value === 'monthly' ? 'left-2 w-40' : 'left-[162px] w-40'
})
</script>

<template>
  <Head title="Simple, Transparent Pricing - No Hidden Fees | Ascent" />

  <!-- Hero Section -->
  <section class="relative overflow-hidden px-4 pt-20">
    <div
      class="from-brand-50/30 to-accent-50/20 absolute inset-0 bg-linear-to-br via-white"
    />
    <div
      class="bg-brand-100/20 absolute top-20 left-1/2 h-96 w-96 -translate-x-1/2 transform rounded-full blur-3xl"
    />

    <div class="relative mx-auto max-w-4xl text-center">
      <div class="mb-6">
        <span
          class="bg-success-100 text-success-700 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
        >
          💰 Simple Pricing
        </span>
      </div>

      <h1
        class="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
      >
        <span class="block leading-tight text-gray-900">
          Pricing That Makes
        </span>
        <span
          class="from-brand-600 to-accent-600 block bg-linear-to-r bg-clip-text leading-tight text-transparent"
        >
          Perfect Sense
        </span>
      </h1>

      <p
        class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-medium text-gray-600"
      >
        Start free, scale when you're ready. No hidden fees, no surprises.
        <span class="font-semibold text-gray-900">
          Just honest, transparent pricing that grows with your business.
        </span>
      </p>

      <!-- Billing Toggle -->
      <div class="mb-16 flex flex-col items-center justify-center">
        <div
          class="relative inline-flex items-center rounded-2xl border border-gray-300 bg-white p-2 shadow-lg"
        >
          <!-- Sliding Background -->
          <div
            :class="[
              'from-brand-600 to-accent-600 absolute top-2 bottom-2 rounded-xl bg-linear-to-r shadow-md transition-all duration-500 ease-in-out',
              sliderPosition
            ]"
          />

          <!-- Monthly Button -->
          <button
            @click="billingCycle = 'monthly'"
            :class="[
              'relative z-10 w-40 rounded-xl px-8 py-4 text-sm font-bold transition-colors duration-300 focus:outline-none',
              billingCycle === 'monthly'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Monthly
          </button>

          <!-- Yearly Button -->
          <button
            @click="billingCycle = 'yearly'"
            :class="[
              'relative z-10 w-40 rounded-xl px-8 py-4 text-sm font-bold transition-colors duration-300 focus:outline-none',
              billingCycle === 'yearly'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Yearly
          </button>
        </div>

        <!-- Savings indicator below toggle - always reserve space -->
        <div class="mt-3 flex h-6 items-center justify-center">
          <div
            v-if="billingCycle === 'yearly'"
            class="bg-success-100 text-success-700 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-all duration-300"
          >
            Save 20%
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Cards -->
  <section class="relative px-4 pb-20">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Starter Plan -->
        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-3xl bg-linear-to-r from-gray-600 to-gray-400 opacity-10 blur transition duration-300 group-hover:opacity-20"
          />
          <div
            class="relative rounded-3xl border border-gray-300 bg-white p-10 shadow-xl"
          >
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-gray-900">Starter</h3>
              <p class="mt-2 text-gray-600">
                Perfect for side projects and small teams getting started
              </p>
            </div>

            <div class="mb-8">
              <div class="flex items-baseline">
                <span class="text-6xl font-bold text-gray-900">
                  ${{ plans.starter.variants[billingCycle].amount }}
                </span>
                <span class="ml-2 text-lg font-medium text-gray-500">
                  /
                  {{
                    billingCycle === 'monthly'
                      ? 'month'
                      : 'month, billed yearly'
                  }}
                </span>
              </div>
              <p
                v-if="billingCycle === 'yearly'"
                class="text-success-600 mt-1 text-sm font-medium"
              >
                Save ${{
                  plans.starter.variants.monthly.amount * 12 -
                  plans.starter.variants.yearly.amount * 12
                }}
                per year
              </p>
            </div>

            <div class="mb-8 space-y-4">
              <h4 class="font-semibold text-gray-900">What's included:</h4>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Up to 5 team members</p>
                  <p class="text-sm text-gray-500">
                    Add your core team and start collaborating
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    Complete authentication system
                  </p>
                  <p class="text-sm text-gray-500">
                    OAuth, magic links, 2FA ready
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Subscription billing</p>
                  <p class="text-sm text-gray-500">
                    Lemon Squeezy integration included
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Email support</p>
                  <p class="text-sm text-gray-500">Get help when you need it</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Basic analytics</p>
                  <p class="text-sm text-gray-500">
                    Track key metrics and user activity
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <Link
                :href="`/checkout?plan=starter&billingCycle=${billingCycle}`"
                class="block w-full rounded-xl border-2 border-gray-900 bg-gray-900 px-6 py-4 text-center text-lg font-bold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
              >
                Get Started
              </Link>
              <p class="mt-3 text-center text-sm text-gray-500">
                Start your Starter subscription today
              </p>
            </div>
          </div>
        </div>

        <!-- Pro Plan - Featured -->
        <div class="group relative">
          <div
            class="from-brand-600 to-accent-600 absolute -inset-0.5 rounded-3xl bg-linear-to-r opacity-30 blur transition duration-300 group-hover:opacity-40"
          />
          <div
            class="border-brand-300 relative overflow-visible rounded-3xl border bg-white p-10 shadow-2xl"
          >
            <div
              class="absolute -top-4 -right-4 size-44 overflow-hidden rounded-sm"
            >
              <div
                class="from-brand-700 to-accent-700 absolute -top-1 -left-1 size-5 bg-linear-to-br"
              ></div>
              <div
                class="from-brand-700 to-accent-700 absolute -right-1 -bottom-1 size-5 bg-linear-to-br"
              ></div>
              <span
                class="from-brand-600 to-accent-600 absolute right-0 bottom-0 block w-[141.42%] origin-bottom-right rotate-45 bg-linear-to-r py-2.5 text-center text-sm font-semibold tracking-wider text-white uppercase shadow-md"
              >
                Most Popular
              </span>
            </div>

            <div class="mb-8">
              <h3 class="text-2xl font-bold text-gray-900">Pro</h3>
              <p class="mt-2 max-w-md text-gray-600">
                For growing businesses that need advanced features and priority
                support
              </p>
            </div>

            <div class="mb-8">
              <div class="flex items-baseline">
                <span class="text-6xl font-bold text-gray-900">
                  ${{ plans.pro.variants[billingCycle].amount }}
                </span>
                <span class="ml-2 text-lg font-medium text-gray-500">
                  /
                  {{
                    billingCycle === 'monthly'
                      ? 'month'
                      : 'month, billed yearly'
                  }}
                </span>
              </div>
              <p
                v-if="billingCycle === 'yearly'"
                class="text-success-600 mt-1 text-sm font-medium"
              >
                Save ${{
                  plans.pro.variants.monthly.amount * 12 -
                  plans.pro.variants.yearly.amount * 12
                }}
                per year
              </p>
            </div>

            <div class="mb-8 space-y-4">
              <h4 class="font-semibold text-gray-900">
                Everything in Starter, plus:
              </h4>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    Unlimited team members
                  </p>
                  <p class="text-sm text-gray-500">
                    Scale your team without limits
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    Advanced role permissions
                  </p>
                  <p class="text-sm text-gray-500">
                    Granular control over user access
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Priority support</p>
                  <p class="text-sm text-gray-500">Get help in under 4 hours</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    Advanced analytics & reporting
                  </p>
                  <p class="text-sm text-gray-500">
                    Revenue tracking, cohort analysis, and more
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Custom integrations</p>
                  <p class="text-sm text-gray-500">
                    Connect with your favorite tools
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg
                    class="text-success-600 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">White-label options</p>
                  <p class="text-sm text-gray-500">
                    Brand the experience as your own
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <Link
                :href="`/checkout?plan=pro&billingCycle=${billingCycle}`"
                class="from-brand-600 to-accent-600 block w-full rounded-xl bg-linear-to-r px-6 py-4 text-center text-lg font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl"
              >
                Get Started
              </Link>
              <p class="mt-3 text-center text-sm text-gray-500">
                Start your Pro subscription today
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Feature Comparison Table -->
  <section class="relative bg-gray-50 px-4 py-20">
    <div class="mx-auto max-w-7xl">
      <div class="mb-16 text-center">
        <h2
          class="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl"
        >
          Compare Plans
          <span
            class="from-brand-600 to-accent-600 block bg-linear-to-r bg-clip-text text-transparent"
          >
            Choose What's Right for You
          </span>
        </h2>
        <p
          class="mx-auto max-w-3xl text-xl leading-relaxed font-medium text-gray-600"
        >
          Every plan includes our core features. Upgrade for advanced
          functionality and priority support.
        </p>
      </div>

      <div
        class="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-xl"
      >
        <div class="overflow-x-auto">
          <table
            class="w-full"
            role="table"
            aria-label="Plan features comparison"
          >
            <thead>
              <tr class="border-b border-gray-300 bg-gray-50">
                <th class="px-6 py-4 text-left">
                  <span class="text-lg font-semibold text-gray-900">
                    Features
                  </span>
                </th>
                <th class="px-6 py-4 text-center">
                  <div>
                    <div class="text-lg font-bold text-gray-900">Starter</div>
                    <div class="text-sm text-gray-500">
                      ${{ plans.starter.variants[billingCycle].amount }}/month
                    </div>
                  </div>
                </th>
                <th class="bg-brand-50 px-6 py-4 text-center">
                  <div>
                    <div class="text-brand-700 text-lg font-bold">Pro</div>
                    <div class="text-brand-600 text-sm">
                      ${{ plans.pro.variants[billingCycle].amount }}/month
                    </div>
                    <div
                      class="bg-brand-100 text-brand-700 mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                      Most Popular
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr class="bg-gray-50">
                <td class="px-6 py-4 font-semibold text-gray-900">
                  Core Features
                </td>
                <td />
                <td class="bg-brand-50/30" />
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Team Members</td>
                <td class="px-6 py-4 text-center text-gray-700">Up to 5</td>
                <td class="bg-brand-50/30 px-6 py-4 text-center text-gray-700">
                  Unlimited
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Authentication System</td>
                <td class="px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Subscription Billing</td>
                <td class="px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Basic Analytics</td>
                <td class="px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>

              <tr class="bg-gray-50">
                <td class="px-6 py-4 font-semibold text-gray-900">
                  Advanced Features
                </td>
                <td />
                <td class="bg-brand-50/30" />
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">
                  Advanced Role Permissions
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">
                  Advanced Analytics & Reporting
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Custom Integrations</td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">White-label Options</td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>

              <tr class="bg-gray-50">
                <td class="px-6 py-4 font-semibold text-gray-900">Support</td>
                <td />
                <td class="bg-brand-50/30" />
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Email Support</td>
                <td class="px-6 py-4 text-center text-gray-700">Standard</td>
                <td class="bg-brand-50/30 px-6 py-4 text-center text-gray-700">
                  Priority (4hr response)
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">Phone Support</td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700">
                  Dedicated Account Manager
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td class="bg-brand-50/30 px-6 py-4 text-center">
                  <svg
                    class="text-success-600 mx-auto h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="relative overflow-hidden bg-white px-4 py-20">
    <div class="relative mx-auto max-w-4xl">
      <div class="mb-16 text-center">
        <h2
          class="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl"
        >
          Frequently Asked
          <span
            class="from-brand-600 to-accent-600 block bg-linear-to-r bg-clip-text text-transparent"
          >
            Questions
          </span>
        </h2>
      </div>

      <div class="space-y-6">
        <details
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors"
            >
              What's included in the free trial?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              >
                <svg
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180"
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
              <p class="leading-relaxed text-gray-600">
                Your 14-day free trial includes full access to all features in
                your chosen plan. No credit card required to start, and you can
                cancel anytime during the trial period.
              </p>
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
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors"
            >
              Can I change plans later?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              >
                <svg
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180"
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
              <p class="leading-relaxed text-gray-600">
                Absolutely! You can upgrade or downgrade your plan at any time.
                Changes take effect immediately, and we'll prorate any billing
                differences.
              </p>
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
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors"
            >
              Is there a setup fee or hidden costs?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              >
                <svg
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180"
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
              <p class="leading-relaxed text-gray-600">
                No setup fees, no hidden costs. The price you see is what you
                pay. All features, integrations, and support are included in
                your subscription.
              </p>
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
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors"
            >
              What payment methods do you accept?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              >
                <svg
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180"
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
              <p class="leading-relaxed text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American
                Express) and PayPal. All payments are processed securely through
                Lemon Squeezy.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="relative overflow-hidden bg-gray-900 px-4 py-20">
    <div
      class="to-brand-900 absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800"
    />
    <div
      class="bg-brand-500/10 absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 transform rounded-full blur-3xl"
    />

    <div class="relative mx-auto max-w-4xl text-center">
      <h2
        class="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl"
      >
        Ready to Get
        <span
          class="from-brand-400 to-accent-400 block bg-linear-to-r bg-clip-text text-transparent"
        >
          Started?
        </span>
      </h2>

      <p
        class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-medium text-gray-300"
      >
        Join thousands of developers who are already building amazing SaaS
        products with our platform.
      </p>

      <div class="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href="/signup"
          class="hover:shadow-3xl group from-brand-600 to-accent-600 relative inline-block rounded-xl bg-linear-to-r px-10 py-5 text-lg font-bold text-white no-underline shadow-2xl transition-all duration-200 hover:scale-[1.02]"
        >
          <span class="relative z-10">Start Free Trial</span>
          <div
            class="from-brand-700 to-accent-700 absolute inset-0 rounded-xl bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100"
          />
        </Link>
        <a
          href="YOUTUBE_VIDEO_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:border-brand-400 hover:bg-brand-500/10 inline-block rounded-xl border-2 border-gray-600 bg-transparent px-10 py-5 text-lg font-bold text-white no-underline shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          See It in Action
        </a>
      </div>

      <div
        class="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="text-success-500 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>14-day free trial</span>
        </div>
        <div class="flex items-center space-x-2">
          <svg
            class="text-success-500 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>No credit card required</span>
        </div>
        <div class="flex items-center space-x-2">
          <svg
            class="text-success-500 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  </section>
</template>
