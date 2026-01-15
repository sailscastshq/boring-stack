<script setup>
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import Toast from '@/volt/Toast.vue'
import Avatar from '@/components/Avatar.vue'
import { useFlashToast } from '@/composables/flash-toast'

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
const url = computed(() => page.url)

useFlashToast()
</script>

<template>
  <div
    class="bg-linear-to-b from-brand-50/10 flex min-h-screen flex-col to-[#F9FAFB] dark:from-gray-900 dark:to-gray-950"
  >
    <header
      class="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:border-opacity-40 dark:bg-gray-900/90"
    >
      <nav
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8"
      >
        <Link href="/" class="group flex items-center space-x-2">
          <div class="relative">
            <div
              class="bg-brand-200/20 absolute inset-0 scale-110 rounded-xl opacity-0 blur-sm transition-opacity group-hover:opacity-100"
            ></div>
            <img
              src="/images/logo.svg"
              alt="Ascent Logo"
              class="relative h-10 w-auto transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        <div v-if="!loggedInUser" class="flex items-center space-x-8">
          <nav
            class="hidden items-center space-x-1 md:flex"
            aria-label="Primary navigation"
          >
            <Link
              href="/features"
              :class="`rounded-lg px-3 py-2 font-medium transition-all duration-200 ${
                url === '/features'
                  ? 'bg-brand-100 text-brand-700'
                  : 'hover:bg-brand-50/80 hover:text-brand-600 text-gray-700'
              }`"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              :class="`rounded-lg px-3 py-2 font-medium transition-all duration-200 ${
                url === '/pricing'
                  ? 'bg-brand-100 text-brand-700'
                  : 'hover:bg-brand-50/80 hover:text-brand-600 text-gray-700'
              }`"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              :class="`rounded-lg px-3 py-2 font-medium transition-all duration-200 ${
                url.startsWith('/blog')
                  ? 'bg-brand-100 text-brand-700'
                  : 'hover:bg-brand-50/80 hover:text-brand-600 text-gray-700'
              }`"
            >
              Blog
            </Link>
            <a
              href="https://docs.sailscasts.com/boring-stack/ascent"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:bg-brand-50/80 hover:text-brand-600 rounded-lg px-3 py-2 font-medium text-gray-700 transition-all duration-200"
            >
              Docs
            </a>
          </nav>

          <div class="flex items-center space-x-3">
            <Link
              href="/login"
              class="hover:text-brand-600 rounded-lg px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              href="/signup"
              class="bg-linear-to-r from-brand-600 to-accent-600 group relative rounded-lg px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <span class="relative z-10">Get Started</span>
              <div
                class="bg-linear-to-r from-brand-700 to-accent-700 absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
              ></div>
            </Link>
          </div>
        </div>

        <div v-else class="flex items-center space-x-6">
          <nav class="hidden items-center space-x-4 md:flex">
            <Link
              href="/dashboard"
              class="hover:text-brand font-medium text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
          <Link href="/profile" aria-label="Go to profile">
            <Avatar
              :image="loggedInUser.currentAvatarUrl"
              :label="loggedInUser.initials"
              size="large"
              shape="circle"
              class="hover:border-brand border-2 border-gray-300 transition-colors [&_img]:rounded-full"
              :style="{
                backgroundColor: loggedInUser.currentAvatarUrl
                  ? undefined
                  : '#6366f1',
                color: '#ffffff'
              }"
            />
          </Link>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <Toast />

    <footer
      class="bg-linear-to-br to-brand-900 relative overflow-hidden from-gray-900 via-gray-800 text-white"
    >
      <div
        class="bg-brand-500/10 absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl"
      ></div>
      <div
        class="bg-accent-500/10 absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-3xl"
      ></div>

      <div class="relative mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div class="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div class="md:col-span-1">
            <Link href="/" class="group mb-6 flex items-center space-x-2">
              <div class="relative">
                <div
                  class="bg-brand-300/20 absolute inset-0 scale-110 rounded-xl opacity-0 blur-sm transition-opacity group-hover:opacity-100"
                ></div>
                <img
                  src="/images/logo.svg"
                  alt="Ascent Logo"
                  class="relative h-10 w-auto brightness-0 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)] invert filter transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            <p class="mb-6 text-sm leading-relaxed text-gray-300">
              The complete SaaS platform for modern teams. Scale your business
              with battle-tested technologies and launch faster than ever.
            </p>
            <div class="flex space-x-4">
              <a
                href="https://x.com/Dominus_Kelvin"
                class="hover:bg-brand-600 group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-all duration-200 hover:text-white"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
              <a
                href="https://github.com/sailscastshq/boring-stack"
                class="hover:bg-brand-600 group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-all duration-200 hover:text-white"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  />
                </svg>
              </a>
              <a
                href="https://sailsjs.com/chat"
                class="hover:bg-brand-600 group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-all duration-200 hover:text-white"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026 13.83 13.83 0 001.226-1.963.074.074 0 00-.041-.104 13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0 a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <section>
            <h3 class="mb-6 text-lg font-bold text-white">Product</h3>
            <nav>
              <ul class="space-y-4">
                <li>
                  <Link
                    href="/features"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-brand-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-brand-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Pricing
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          <section>
            <h3 class="mb-6 text-lg font-bold text-white">Resources</h3>
            <nav>
              <ul class="space-y-4">
                <li>
                  <Link
                    href="/blog"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-accent-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Blog
                  </Link>
                </li>
                <li>
                  <a
                    href="https://docs.sailscasts.com/boring-stack/ascent"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-accent-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://sailsjs.com/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-accent-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Community
                  </a>
                </li>
              </ul>
            </nav>
          </section>

          <section>
            <h3 class="mb-6 text-lg font-bold text-white">Company</h3>
            <nav>
              <ul class="space-y-4">
                <li>
                  <Link
                    href="/contact"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-success-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="/legal/privacy"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-success-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/legal/terms"
                    class="group flex items-center text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      class="bg-success-500 mr-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    ></span>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </nav>
          </section>
        </div>

        <div class="mt-16 border-t border-gray-700/50 pt-8">
          <div
            class="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0"
          >
            <div class="flex items-center space-x-6">
              <p class="text-sm text-gray-400">
                © 2025 Ascent. All rights reserved.
              </p>
              <div
                class="hidden items-center space-x-4 text-xs text-gray-500 md:flex"
              >
                <span class="flex items-center space-x-1">
                  <div
                    class="h-2 w-2 animate-pulse rounded-full bg-green-400"
                  ></div>
                  <span>All systems operational</span>
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-6">
              <p class="text-sm text-gray-400">
                <span>Built with </span>
                <a
                  href="https://github.com/sailscastshq/boring-stack"
                  class="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                >
                  The Boring Stack
                </a>
                <span> by </span>
                <a
                  href="https://x.com/Dominus_Kelvin"
                  class="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                >
                  Kelvin Omereshone
                </a>
                <span> and contributors.</span>
              </p>
            </div>
          </div>

          <div
            class="border-brand-500/20 bg-linear-to-r from-brand-500/10 to-accent-500/10 mt-8 rounded-2xl border p-6"
          >
            <div class="text-center">
              <h4 class="mb-2 font-bold text-white">Stay Updated</h4>
              <p class="mb-4 text-sm text-gray-300">
                Get the latest updates on new features and product launches.
              </p>
              <div class="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  class="focus:border-brand-400 focus:ring-brand-400/50 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2"
                />
                <button
                  class="bg-linear-to-r from-brand-600 to-accent-600 rounded-lg px-6 py-2 font-semibold text-white transition-all duration-200 hover:shadow-lg"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
