<script setup>
import { Head, Link } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})
</script>

<template>
  <Head title="Features - Everything You Need to Scale Fast | Ascent" />

  <!-- Hero Section -->
  <section class="relative overflow-hidden px-4 pb-16 pt-20">
    <div
      class="bg-linear-to-br absolute inset-0 from-brand-50/30 via-white to-accent-50/20"
    />
    <div
      class="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-100/20 blur-3xl"
    />

    <div class="relative mx-auto max-w-4xl text-center">
      <div class="mb-6">
        <span
          class="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700"
        >
          ⚡ Built for Speed
        </span>
      </div>

      <h1
        class="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
      >
        <span class="block leading-tight text-gray-900">
          Everything You Need
        </span>
        <span
          class="bg-linear-to-r block from-brand-600 to-accent-600 bg-clip-text leading-tight text-transparent"
        >
          to Scale Fast
        </span>
      </h1>

      <p
        class="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-600"
      >
        Stop rebuilding the same features over and over. Launch your SaaS with
        enterprise-grade infrastructure that actually works.
        <span class="font-semibold text-gray-900">
          Focus on what makes you unique.
        </span>
      </p>

      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href="/signup"
          class="hover:shadow-3xl bg-linear-to-r group relative inline-block rounded-xl from-brand-600 to-accent-600 px-8 py-4 font-bold text-white no-underline shadow-2xl transition-all duration-200 hover:scale-[1.02]"
        >
          <span class="relative z-10">Start Building Today</span>
          <div
            class="bg-linear-to-r absolute inset-0 rounded-xl from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </Link>
        <a
          href="YOUTUBE_VIDEO_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block rounded-xl border-2 border-gray-300 bg-white px-8 py-4 font-bold text-gray-700 no-underline shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl"
        >
          View Live Demo
        </a>
      </div>
    </div>
  </section>

  <!-- Detailed Features Grid -->
  <section class="relative bg-white px-4 py-20">
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
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <!-- Secure Authentication -->
        <div class="group relative">
          <div
            class="bg-linear-to-r absolute -inset-0.5 rounded-3xl from-brand-600 to-accent-600 opacity-20 blur transition duration-300 group-hover:opacity-30"
          />
          <div
            class="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl"
          >
            <div class="mb-8 flex items-center space-x-4">
              <div
                class="bg-linear-to-br flex h-16 w-16 items-center justify-center rounded-2xl from-brand-500 to-brand-600 shadow-lg"
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  Enterprise Authentication
                </h3>
                <p class="font-medium text-brand-600">
                  Security that scales with you
                </p>
              </div>
            </div>

            <p class="mb-8 text-lg leading-relaxed text-gray-600">
              Stop worrying about security vulnerabilities. Our authentication
              system includes everything from basic password auth to enterprise
              SSO, with security best practices baked in from day one.
            </p>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  OAuth with Google, GitHub, and more
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Magic link authentication (passwordless)
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Two-factor authentication ready
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Session management & security headers
                </span>
              </div>
            </div>

            <div class="mt-8 rounded-2xl bg-brand-50 p-6">
              <div class="flex items-start space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100"
                >
                  <svg
                    class="h-5 w-5 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-brand-900">Enterprise Ready</h4>
                  <p class="text-sm leading-relaxed text-brand-700">
                    Built with OWASP security standards, rate limiting, and
                    audit logging. Your users' data is protected from day one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Billing -->
        <div class="group relative">
          <div
            class="bg-linear-to-r absolute -inset-0.5 rounded-3xl from-accent-600 to-purple-600 opacity-20 blur transition duration-300 group-hover:opacity-30"
          />
          <div
            class="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl"
          >
            <div class="mb-8 flex items-center space-x-4">
              <div
                class="bg-linear-to-br flex h-16 w-16 items-center justify-center rounded-2xl from-accent-500 to-accent-600 shadow-lg"
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  Revenue-Ready Billing
                </h3>
                <p class="font-medium text-accent-600">
                  Start earning from day one
                </p>
              </div>
            </div>

            <p class="mb-8 text-lg leading-relaxed text-gray-600">
              Integrated with Lemon Squeezy for hassle-free payments. Handle
              subscriptions, one-time payments, trials, and complex pricing
              models without touching a single line of payment code.
            </p>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Recurring subscriptions with automatic billing
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Free trials and proration handling
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Multiple pricing tiers and add-ons
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Dunning management for failed payments
                </span>
              </div>
            </div>

            <div class="mt-8 rounded-2xl bg-accent-50 p-6">
              <div class="flex items-start space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100"
                >
                  <svg
                    class="h-5 w-5 text-accent-600"
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
                <div>
                  <h4 class="font-semibold text-accent-900">
                    Revenue Analytics
                  </h4>
                  <p class="text-sm leading-relaxed text-accent-700">
                    Track MRR, churn, LTV, and other key metrics with built-in
                    analytics dashboard. Make data-driven decisions from day
                    one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Management -->
        <div class="group relative">
          <div
            class="bg-linear-to-r absolute -inset-0.5 rounded-3xl from-success-600 to-emerald-600 opacity-20 blur transition duration-300 group-hover:opacity-30"
          />
          <div
            class="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl"
          >
            <div class="mb-8 flex items-center space-x-4">
              <div
                class="bg-linear-to-br flex h-16 w-16 items-center justify-center rounded-2xl from-success-500 to-success-600 shadow-lg"
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  Multi-Tenant Teams
                </h3>
                <p class="font-medium text-success-600">
                  Scale to enterprise customers
                </p>
              </div>
            </div>

            <p class="mb-8 text-lg leading-relaxed text-gray-600">
              Built-in multi-tenancy with complete workspace isolation. Your
              customers can invite teammates, manage permissions, and
              collaborate safely—all without you writing a single line of team
              management code.
            </p>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Role-based permissions (Owner, Admin, Member)
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Email invitations with onboarding flow
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Complete data isolation between workspaces
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Team switching and management UI
                </span>
              </div>
            </div>

            <div class="mt-8 rounded-2xl bg-success-50 p-6">
              <div class="flex items-start space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-5 w-5 text-success-600"
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
                <div>
                  <h4 class="font-semibold text-success-900">
                    Enterprise Security
                  </h4>
                  <p class="text-sm leading-relaxed text-success-700">
                    Every team action is logged and auditable. Perfect for
                    compliance requirements and enterprise security standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Dashboard -->
        <div class="group relative">
          <div
            class="bg-linear-to-r absolute -inset-0.5 rounded-3xl from-purple-600 to-pink-600 opacity-20 blur transition duration-300 group-hover:opacity-30"
          />
          <div
            class="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl"
          >
            <div class="mb-8 flex items-center space-x-4">
              <div
                class="bg-linear-to-br flex h-16 w-16 items-center justify-center rounded-2xl from-purple-500 to-purple-600 shadow-lg"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  Powerful Admin Dashboard
                </h3>
                <p class="font-medium text-purple-600">
                  Control everything from one place
                </p>
              </div>
            </div>

            <p class="mb-8 text-lg leading-relaxed text-gray-600">
              A beautiful, comprehensive admin interface to manage users,
              monitor revenue, track key metrics, and keep your finger on the
              pulse of your growing business.
            </p>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  User management and activity monitoring
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Revenue analytics and subscription insights
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  System health and performance metrics
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"
                >
                  <svg
                    class="h-4 w-4 text-success-600"
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
                <span class="font-medium text-gray-700">
                  Email campaign management and logs
                </span>
              </div>
            </div>

            <div class="mt-8 rounded-2xl bg-purple-50 p-6">
              <div class="flex items-start space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100"
                >
                  <svg
                    class="h-5 w-5 text-purple-600"
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
                <div>
                  <h4 class="font-semibold text-purple-900">
                    Real-time Insights
                  </h4>
                  <p class="text-sm leading-relaxed text-purple-700">
                    Get instant notifications about important events, track user
                    behavior, and make informed decisions with real-time data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Additional Features Grid -->
  <section class="relative bg-gray-50 px-4 py-20">
    <div class="relative mx-auto max-w-7xl">
      <div class="mb-16 text-center">
        <h2
          class="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl"
        >
          And That's Not All
          <span
            class="bg-linear-to-r block from-brand-600 to-accent-600 bg-clip-text text-transparent"
          >
            We've Thought of Everything
          </span>
        </h2>
        <p
          class="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-600"
        >
          Every feature you need to launch and scale your SaaS, built with
          modern technologies and best practices.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- Content & Blog -->
        <div
          class="group relative rounded-2xl border border-gray-300 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Content Management
            </h3>
            <p class="mb-6 leading-relaxed text-gray-600">
              Built-in CMS and blog system powered by Sails Content. Create
              landing pages, write blog posts, and manage marketing content
              without leaving your app.
            </p>
            <div class="space-y-2 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>Markdown editor with live preview</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>SEO optimization built-in</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>Custom page templates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Email System -->
        <div
          class="group relative rounded-2xl border border-gray-300 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
            <p class="mb-6 leading-relaxed text-gray-600">
              Beautiful email templates for onboarding, billing notifications,
              password resets, and customer communication. All automated and
              ready to go.
            </p>
            <div class="space-y-2 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Responsive HTML templates</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Event-triggered automation</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Delivery tracking & analytics</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modern Stack -->
        <div
          class="group relative rounded-2xl border border-gray-300 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="bg-linear-to-br absolute inset-0 rounded-2xl from-blue-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div class="relative">
            <div
              class="bg-linear-to-br mb-6 flex h-14 w-14 items-center justify-center rounded-2xl from-blue-500 to-blue-600 shadow-lg"
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              Modern Tech Stack
            </h3>
            <p class="mb-6 leading-relaxed text-gray-600">
              Built with React 19, Sails.js, and Inertia.js. Modern tooling with
              hot reload, TypeScript support, and everything you need for rapid
              development.
            </p>
            <div class="space-y-2 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>React 19 with modern hooks</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Tailwind CSS + PrimeReact</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Database agnostic ORM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="relative overflow-hidden bg-gray-900 px-4 py-20">
    <div
      class="bg-linear-to-br absolute inset-0 from-gray-900 via-gray-800 to-brand-900"
    />
    <div
      class="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-500/10 blur-3xl"
    />

    <div class="relative mx-auto max-w-4xl text-center">
      <h2
        class="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl"
      >
        Ready to Ship Your
        <span
          class="bg-linear-to-r block from-brand-400 to-accent-400 bg-clip-text text-transparent"
        >
          Next Big Idea?
        </span>
      </h2>

      <p
        class="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-300"
      >
        Stop wasting months on infrastructure. Start with a production-ready
        foundation and focus on what makes your SaaS unique.
      </p>

      <div class="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
        <a
          href="/signup"
          class="hover:shadow-3xl bg-linear-to-r group relative inline-block rounded-xl from-brand-600 to-accent-600 px-10 py-5 text-lg font-bold text-white no-underline shadow-2xl transition-all duration-200 hover:scale-[1.02]"
        >
          <span class="relative z-10">Get Started Today</span>
          <div
            class="bg-linear-to-r absolute inset-0 rounded-xl from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </a>
        <a
          href="YOUTUBE_VIDEO_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block rounded-xl border-2 border-gray-600 bg-transparent px-10 py-5 text-lg font-bold text-white no-underline shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-400 hover:bg-brand-500/10"
        >
          View Live Demo
        </a>
      </div>

      <div
        class="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="h-5 w-5 text-success-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Launch in hours, not months</span>
        </div>
        <div class="flex items-center space-x-2">
          <svg
            class="h-5 w-5 text-success-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Production-ready code</span>
        </div>
        <div class="flex items-center space-x-2">
          <svg
            class="h-5 w-5 text-success-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Your code, your control</span>
        </div>
      </div>
    </div>
  </section>
</template>
