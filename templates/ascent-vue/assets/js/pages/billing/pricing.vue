<script setup>
import ChevronDown from '@/components/ui/icons/ChevronDown.vue'
import Check from '@/components/ui/icons/Check.vue'
import { Link, Head, usePage } from '@inertiajs/vue3'
import { ref } from 'vue'
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

const page = usePage()
const billingCycle = ref(
  new URL(page.url, 'http://localhost').searchParams.get('cycle') === 'yearly'
    ? 'yearly'
    : 'monthly'
)
function selectCycle(cycle) {
  billingCycle.value = cycle
  const url = new URL(window.location.href)
  url.searchParams.set('cycle', cycle)
  window.history.replaceState(window.history.state, '', url)
}
</script>

<template>
  <Head title="Simple, Transparent Pricing - No Hidden Fees | Ascent" />

  <!-- Hero Section -->
  <section class="ascent-page-heading">
    <h1>A plan for<br />your next stage.</h1>
    <p>Choose the space your team needs today, with room to grow tomorrow.</p>
    <div class="ascent-cycle" role="group" aria-label="Billing cycle">
      <button
        type="button"
        :aria-pressed="billingCycle === 'monthly'"
        @click="selectCycle('monthly')"
      >
        Monthly</button
      ><button
        type="button"
        :aria-pressed="billingCycle === 'yearly'"
        @click="selectCycle('yearly')"
      >
        Yearly · save 20%
      </button>
    </div>
  </section>

  <!-- Pricing Cards -->
  <section class="relative px-4 pb-20">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Starter Plan -->
        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-xl opacity-10 blur transition duration-300 group-hover:opacity-20 bg-gray-50 dark:bg-gray-950"
          />
          <div
            class="relative rounded-xl border border-gray-300 bg-white p-8 shadow-none dark:border-gray-700 dark:bg-gray-900"
          >
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Starter
              </h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Perfect for side projects and small teams getting started
              </p>
            </div>

            <div class="mb-8">
              <div class="flex items-baseline">
                <span
                  class="text-6xl font-bold text-gray-900 dark:text-gray-100"
                >
                  ${{ plans.starter.variants[billingCycle].amount }}
                </span>
                <span
                  class="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400"
                >
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
                class="text-success-600 mt-1 text-sm font-medium dark:text-success-300"
              >
                Save ${{
                  plans.starter.variants.monthly.amount * 12 -
                  plans.starter.variants.yearly.amount * 12
                }}
                per year
              </p>
            </div>

            <div class="mb-8 space-y-4">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100">
                What's included:
              </h4>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Up to 5 team members
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Add your core team and start collaborating
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Complete authentication system
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    OAuth, magic links, 2FA ready
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Subscription billing
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Lemon Squeezy integration included
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Email support
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Get help when you need it
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Basic analytics
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Track key metrics and user activity
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <Link
                :href="`/checkout?plan=starter&billingCycle=${billingCycle}`"
                class="block w-full rounded-xl border-2 border-gray-900 bg-gray-900 px-6 py-4 text-center text-lg font-bold text-white transition-all duration-200 hover:bg-gray-800 shadow-none dark:border-gray-700"
              >
                Get Started
              </Link>
              <p
                class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                Start your Starter subscription today
              </p>
            </div>
          </div>
        </div>

        <!-- Pro Plan - Featured -->
        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-xl opacity-30 blur transition duration-300 group-hover:opacity-40 bg-gray-50 dark:bg-gray-950"
          />
          <div
            class="border-brand-300 relative overflow-visible rounded-xl border bg-white p-8 shadow-none dark:bg-gray-900 dark:border-brand-900"
          >
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Pro
              </h3>
              <p class="mt-2 max-w-md text-gray-600 dark:text-gray-400">
                For growing businesses that need advanced features and priority
                support
              </p>
            </div>

            <div class="mb-8">
              <div class="flex items-baseline">
                <span
                  class="text-6xl font-bold text-gray-900 dark:text-gray-100"
                >
                  ${{ plans.pro.variants[billingCycle].amount }}
                </span>
                <span
                  class="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400"
                >
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
                class="text-success-600 mt-1 text-sm font-medium dark:text-success-300"
              >
                Save ${{
                  plans.pro.variants.monthly.amount * 12 -
                  plans.pro.variants.yearly.amount * 12
                }}
                per year
              </p>
            </div>

            <div class="mb-8 space-y-4">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100">
                Everything in Starter, plus:
              </h4>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Unlimited team members
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Scale your team without limits
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Advanced role permissions
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Granular control over user access
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Priority support
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Get help in under 4 hours
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Advanced analytics & reporting
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Revenue tracking, cohort analysis, and more
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    Custom integrations
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Connect with your favorite tools
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="bg-success-100 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-success-950/40"
                >
                  <Check
                    class="text-success-600 h-3 w-3 dark:text-success-300"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    White-label options
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Brand the experience as your own
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <Link
                :href="`/checkout?plan=pro&billingCycle=${billingCycle}`"
                class="block w-full rounded-xl px-6 py-4 text-center text-lg font-bold text-white shadow-none transition-all duration-200 hover:brightness-95 bg-brand-600"
              >
                Get Started
              </Link>
              <p
                class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                Start your Pro subscription today
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Feature Comparison Table -->
  <section class="relative bg-gray-50 px-4 py-20 dark:bg-gray-950">
    <div class="mx-auto max-w-7xl">
      <div class="mb-16 text-center">
        <h2
          class="mb-6 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100"
        >
          Compare Plans
          <span class="block text-brand-700 dark:text-brand-300">
            Choose What's Right for You
          </span>
        </h2>
        <p
          class="mx-auto max-w-3xl text-xl leading-relaxed font-medium text-gray-600 dark:text-gray-400"
        >
          Every plan includes our core features. Upgrade for advanced
          functionality and priority support.
        </p>
      </div>

      <div
        class="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-none dark:border-gray-700 dark:bg-gray-900"
      >
        <div class="overflow-x-auto">
          <table
            class="w-full"
            role="table"
            aria-label="Plan features comparison"
          >
            <thead>
              <tr
                class="border-b border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-950"
              >
                <th class="px-6 py-4 text-left">
                  <span
                    class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Features
                  </span>
                </th>
                <th class="px-6 py-4 text-center">
                  <div>
                    <div
                      class="text-lg font-bold text-gray-900 dark:text-gray-100"
                    >
                      Starter
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      ${{ plans.starter.variants[billingCycle].amount }}/month
                    </div>
                  </div>
                </th>
                <th
                  class="bg-brand-50 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <div>
                    <div
                      class="text-brand-700 text-lg font-bold dark:text-brand-300"
                    >
                      Pro
                    </div>
                    <div class="text-brand-600 text-sm dark:text-brand-300">
                      ${{ plans.pro.variants[billingCycle].amount }}/month
                    </div>
                    <div
                      class="bg-brand-100 text-brand-700 mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium dark:text-brand-300 dark:bg-brand-950/40"
                    >
                      Most Popular
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr class="bg-gray-50 dark:bg-gray-950">
                <td
                  class="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100"
                >
                  Core Features
                </td>
                <td />
                <td class="bg-brand-50/30 dark:bg-brand-950/40" />
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Team Members
                </td>
                <td
                  class="px-6 py-4 text-center text-gray-700 dark:text-gray-300"
                >
                  Up to 5
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center text-gray-700 dark:text-gray-300 dark:bg-brand-950/40"
                >
                  Unlimited
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Authentication System
                </td>
                <td class="px-6 py-4 text-center">
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Subscription Billing
                </td>
                <td class="px-6 py-4 text-center">
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Basic Analytics
                </td>
                <td class="px-6 py-4 text-center">
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>

              <tr class="bg-gray-50 dark:bg-gray-950">
                <td
                  class="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100"
                >
                  Advanced Features
                </td>
                <td />
                <td class="bg-brand-50/30 dark:bg-brand-950/40" />
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Advanced Role Permissions
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Advanced Analytics & Reporting
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Custom Integrations
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  White-label Options
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>

              <tr class="bg-gray-50 dark:bg-gray-950">
                <td
                  class="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100"
                >
                  Support
                </td>
                <td />
                <td class="bg-brand-50/30 dark:bg-brand-950/40" />
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Email Support
                </td>
                <td
                  class="px-6 py-4 text-center text-gray-700 dark:text-gray-300"
                >
                  Standard
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center text-gray-700 dark:text-gray-300 dark:bg-brand-950/40"
                >
                  Priority (4hr response)
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Phone Support
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  Dedicated Account Manager
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-gray-400">–</span>
                </td>
                <td
                  class="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40"
                >
                  <Check
                    class="text-success-600 mx-auto h-5 w-5 dark:text-success-300"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section
    class="relative overflow-hidden bg-white px-4 py-20 dark:bg-gray-900"
  >
    <div class="relative mx-auto max-w-4xl">
      <div class="mb-16 text-center">
        <h2
          class="mb-6 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100"
        >
          Frequently Asked
          <span class="block text-brand-700 dark:text-brand-300">
            Questions
          </span>
        </h2>
      </div>

      <div class="space-y-6">
        <details
          class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 shadow-none dark:border-gray-700 dark:bg-gray-900"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors dark:text-gray-100"
            >
              What's included in the free trial?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors dark:bg-brand-950/40"
              >
                <ChevronDown
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180 dark:text-brand-300"
                />
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4 dark:border-gray-700">
              <p class="leading-relaxed text-gray-600 dark:text-gray-400">
                Your 14-day free trial includes full access to all features in
                your chosen plan. No credit card required to start, and you can
                cancel anytime during the trial period.
              </p>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 shadow-none dark:border-gray-700 dark:bg-gray-900"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors dark:text-gray-100"
            >
              Can I change plans later?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors dark:bg-brand-950/40"
              >
                <ChevronDown
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180 dark:text-brand-300"
                />
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4 dark:border-gray-700">
              <p class="leading-relaxed text-gray-600 dark:text-gray-400">
                Absolutely! You can upgrade or downgrade your plan at any time.
                Changes take effect immediately, and we'll prorate any billing
                differences.
              </p>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 shadow-none dark:border-gray-700 dark:bg-gray-900"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors dark:text-gray-100"
            >
              Is there a setup fee or hidden costs?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors dark:bg-brand-950/40"
              >
                <ChevronDown
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180 dark:text-brand-300"
                />
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4 dark:border-gray-700">
              <p class="leading-relaxed text-gray-600 dark:text-gray-400">
                No setup fees, no hidden costs. The price you see is what you
                pay. All features, integrations, and support are included in
                your subscription.
              </p>
            </div>
          </div>
        </details>

        <details
          class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 shadow-none dark:border-gray-700 dark:bg-gray-900"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden"
          >
            <h3
              class="group-hover:text-brand-600 text-lg font-bold text-gray-900 transition-colors dark:text-gray-100"
            >
              What payment methods do you accept?
            </h3>
            <div class="ml-4 shrink-0">
              <div
                class="bg-brand-50 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-full transition-colors dark:bg-brand-950/40"
              >
                <ChevronDown
                  class="text-brand-600 h-4 w-4 transition-transform group-open:rotate-180 dark:text-brand-300"
                />
              </div>
            </div>
          </summary>
          <div class="px-6 pb-6">
            <div class="border-t border-gray-100 pt-4 dark:border-gray-700">
              <p class="leading-relaxed text-gray-600 dark:text-gray-400">
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
    <div class="absolute inset-0 bg-gray-50 dark:bg-gray-950" />
    <div class="hidden" />

    <div class="relative mx-auto max-w-4xl text-center">
      <h2
        class="mb-6 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl"
      >
        Ready to Get
        <span class="block text-brand-700 dark:text-brand-300"> Started? </span>
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
          class="shadow-none group relative inline-block rounded-xl px-10 py-5 text-lg font-bold text-white no-underline transition-all duration-200 hover:brightness-95 bg-brand-600"
        >
          <span class="relative z-10">Start Free Trial</span>
          <div
            class="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 bg-gray-50 dark:bg-gray-950"
          />
        </Link>
        <a
          href="YOUTUBE_VIDEO_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:border-brand-400 hover:bg-brand-500/10 inline-block rounded-xl border-2 border-gray-600 bg-transparent px-10 py-5 text-lg font-bold text-white no-underline shadow-none transition-all duration-200 hover:brightness-95 dark:border-gray-700"
        >
          See It in Action
        </a>
      </div>

      <div
        class="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
      >
        <div class="flex items-center space-x-2">
          <Check class="text-success-500 h-5 w-5" />
          <span>14-day free trial</span>
        </div>
        <div class="flex items-center space-x-2">
          <Check class="text-success-500 h-5 w-5" />
          <span>No credit card required</span>
        </div>
        <div class="flex items-center space-x-2">
          <Check class="text-success-500 h-5 w-5" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  </section>
</template>
