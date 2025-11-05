<script setup>
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import Avatar from '@/volt/Avatar.vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle'])

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
const url = computed(() => page.url)

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'pi pi-home',
    prefetch: true
  },
  {
    name: 'Team',
    href: '/settings/team',
    icon: 'pi pi-users',
    prefetch: true
  },
  {
    name: 'Billing',
    href: '/settings/billing',
    icon: 'pi pi-credit-card',
    prefetch: true,
    cacheFor: '1m'
  }
]

const settingsItems = [
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: 'pi pi-user',
    prefetch: true
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: 'pi pi-shield',
    prefetch: true
  }
]

function isActiveRoute(href) {
  if (href === '/dashboard') {
    return url.value === '/dashboard'
  }
  return url.value.startsWith(href)
}

const avatarStyle = computed(() => ({
  backgroundColor: loggedInUser.value?.avatarUrl ? undefined : '#6366f1',
  color: '#ffffff'
}))
</script>

<template>
  <div>
    <!-- Mobile overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
      @click="emit('toggle')"
    />

    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="flex h-16 items-center justify-between px-6">
        <Link href="/" class="group flex items-center space-x-2">
          <div class="relative">
            <div
              class="absolute inset-0 scale-110 rounded-xl bg-brand-200/20 opacity-0 blur-sm transition-opacity group-hover:opacity-100"
            />
            <img
              src="/images/logo.svg"
              alt="Ascent Logo"
              class="relative h-8 w-auto transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        <!-- Close button for mobile -->
        <SecondaryButton
          icon="pi pi-times"
          text
          class="lg:hidden"
          @click="emit('toggle')"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <!-- Main Navigation -->
        <div class="space-y-1">
          <Link
            v-for="item in navigationItems"
            :key="item.name"
            :href="item.href"
            :class="[
              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              isActiveRoute(item.href)
                ? 'bg-brand-100 text-brand-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
            ]"
            :prefetch="item.prefetch"
            :cache-for="item.cacheFor"
          >
            <i
              :class="[
                item.icon,
                'mr-3 text-lg transition-colors',
                isActiveRoute(item.href)
                  ? 'text-brand-600'
                  : 'text-gray-400 group-hover:text-brand-500'
              ]"
            />
            {{ item.name }}
          </Link>
        </div>

        <!-- Settings Section -->
        <div class="pt-6">
          <div class="mb-3 px-3">
            <h3
              class="text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Settings
            </h3>
          </div>
          <div class="space-y-1">
            <Link
              v-for="item in settingsItems"
              :key="item.name"
              :href="item.href"
              :class="[
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActiveRoute(item.href)
                  ? 'bg-brand-100 text-brand-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
              ]"
              :prefetch="item.prefetch"
              :cache-for="item.cacheFor"
            >
              <i
                :class="[
                  item.icon,
                  'mr-3 text-lg transition-colors',
                  isActiveRoute(item.href)
                    ? 'text-brand-600'
                    : 'text-gray-400 group-hover:text-brand-500'
                ]"
              />
              {{ item.name }}
            </Link>
          </div>
        </div>
      </nav>

      <!-- User Section -->
      <div class="border-t border-gray-300 p-4">
        <div class="flex items-center space-x-3">
          <Avatar
            :image="loggedInUser?.avatarUrl"
            :label="loggedInUser?.initials"
            size="large"
            shape="circle"
            class="border-2 border-gray-300 [&_img]:rounded-full"
            :style="avatarStyle"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">
              {{ loggedInUser?.fullName }}
            </p>
            <p class="truncate text-xs text-gray-500">
              {{ loggedInUser?.email }}
            </p>
          </div>
          <form action="/logout" method="POST">
            <SecondaryButton
              type="submit"
              icon="pi pi-sign-out"
              text
              size="small"
              tooltip="Sign out"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
