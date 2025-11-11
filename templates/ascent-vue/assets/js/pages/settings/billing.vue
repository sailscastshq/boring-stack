<script setup>
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import { useConfirm } from 'primevue/useconfirm'
import Button from '@/volt/Button.vue'
import Tag from '@/volt/Tag.vue'
import ConfirmDialog from '@/volt/ConfirmDialog.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: (h, page) =>
    h(DashboardLayout, { maxWidth: 'narrow', title: 'Billing' }, () => page)
})

const props = defineProps({
  subscription: {
    type: Object,
    default: null
  },
  plans: {
    type: Object,
    required: true
  }
})

const confirm = useConfirm()

const isSubscribed = computed(() => !!props.subscription)

const planConfig = computed(() =>
  props.subscription ? props.plans[props.subscription.planName] : null
)

const planPrice = computed(() =>
  planConfig.value
    ? planConfig.value.variants[props.subscription.billingCycle]?.amount
    : 0
)

const capitalizedPlanName = computed(() => {
  if (!props.subscription) return ''
  return (
    props.subscription.planName.charAt(0).toUpperCase() +
    props.subscription.planName.slice(1)
  )
})

const formattedNextBillingDate = computed(() => {
  if (!props.subscription) return ''
  return new Date(props.subscription.nextBillingDate).toLocaleDateString()
})
</script>

<template>
  <Head title="Billing Settings | Ascent Vue" />

  <!-- No Active Subscription -->
  <div v-if="!isSubscribed" class="mx-auto max-w-2xl py-16 text-center">
    <header class="mb-8">
      <div
        class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
      >
        <i
          class="pi pi-credit-card text-3xl text-gray-400"
          aria-hidden="true"
        />
      </div>
      <h2 class="mb-3 text-2xl font-semibold text-gray-900">
        No Active Subscription
      </h2>
      <p class="text-gray-600">
        Upgrade to unlock premium features and grow your business.
      </p>
    </header>

    <Link
      href="/pricing"
      class="inline-flex items-center rounded-lg border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
    >
      <i class="pi pi-arrow-right mr-2" />
      View Pricing Plans
    </Link>
  </div>

  <!-- Active Subscription -->
  <div v-else class="max-w-4xl space-y-8">
    <!-- Current Plan -->
    <section class="space-y-6">
      <header>
        <h3 class="text-sm font-medium text-gray-900">Current Plan</h3>
        <p class="mt-1 text-sm text-gray-500">
          Manage your subscription and billing preferences.
        </p>
      </header>

      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div
          class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <div class="flex items-center space-x-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50"
            >
              <i class="pi pi-star text-brand-600" />
            </div>
            <div>
              <div class="flex items-center space-x-3">
                <h4 class="text-lg font-semibold text-gray-900">
                  {{ capitalizedPlanName }} Plan
                </h4>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ subscription.status.toUpperCase() }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                ${{ planPrice }}/{{ subscription.billingCycle }} • Next billing:
                {{ formattedNextBillingDate }}
              </p>
            </div>
          </div>
          <div class="flex space-x-3">
            <a
              v-if="subscription.customerPortalUpdateSubscriptionUrl"
              :href="subscription.customerPortalUpdateSubscriptionUrl"
              target="_blank"
              class="inline-flex items-center rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
            >
              <i class="pi pi-external-link mr-2" />
              Manage Subscription
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Payment Method -->
    <section
      v-if="subscription.cardBrand && subscription.cardLastFour"
      class="space-y-6"
    >
      <header>
        <h3 class="text-sm font-medium text-gray-900">Payment Method</h3>
        <p class="mt-1 text-sm text-gray-500">
          Your current payment method for this subscription.
        </p>
      </header>

      <div class="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50"
            >
              <i class="pi pi-credit-card text-gray-400" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium capitalize text-gray-900">
                  {{ subscription.cardBrand }} ••••
                  {{ subscription.cardLastFour }}
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                >
                  ACTIVE
                </span>
              </div>
              <p class="text-sm text-gray-500">
                Processed by {{ subscription.paymentProcessor }}
              </p>
            </div>
          </div>
          <a
            v-if="subscription.updatePaymentMethodUrl"
            :href="subscription.updatePaymentMethodUrl"
            target="_blank"
            class="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-50"
          >
            <i class="pi pi-external-link mr-2" />
            Update
          </a>
        </div>
      </div>
    </section>

    <!-- Billing Management -->
    <section class="space-y-6">
      <header>
        <h3 class="text-sm font-medium text-gray-900">
          Full Billing Management
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Access your complete billing history, invoices, and subscription
          settings.
        </p>
      </header>

      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="text-center">
          <div class="mb-4">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50"
            >
              <i class="pi pi-receipt text-brand-600" />
            </div>
          </div>
          <h4 class="mb-2 text-lg font-medium text-gray-900">
            Customer Portal
          </h4>
          <p class="mb-4 text-sm text-gray-500">
            View invoices, download receipts, update payment methods, and manage
            your subscription.
          </p>
          <a
            v-if="subscription.customerPortalUrl"
            :href="subscription.customerPortalUrl"
            target="_blank"
            class="inline-flex items-center rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
          >
            <i class="pi pi-external-link mr-2" />
            Open Customer Portal
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
