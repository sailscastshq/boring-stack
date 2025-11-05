<script setup>
import { ref, computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import Toast from '@/volt/Toast.vue'
import Avatar from '@/volt/Avatar.vue'
import Button from '@/volt/Button.vue'
import UserMenu from '@/components/UserMenu.vue'
import { useFlashToast } from '@/composables/flashToast'
import { useLocalStorage } from '@/composables/localStorage'
import SecondaryButton from '@/volt/SecondaryButton.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  maxWidth: {
    type: String,
    default: 'wide'
  }
})

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
const teams = computed(() => page.props.teams)
const currentTeam = computed(() => page.props.currentTeam)
const url = computed(() => page.url)

const isCollapsed = useLocalStorage('ASCENT_SIDEBAR_COLLAPSED', false)
const isMobileOpen = ref(false)

useFlashToast()

const navigationSections = [
  {
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'pi-home'
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        name: 'Profile',
        href: '/settings/profile',
        icon: 'pi-user'
      },
      {
        name: 'Team',
        href: '/settings/team',
        icon: 'pi-users'
      },
      {
        name: 'Billing',
        href: '/settings/billing',
        icon: 'pi-credit-card'
      },
      {
        name: 'Security',
        href: '/settings/security',
        icon: 'pi-shield'
      }
    ]
  }
]

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleMobileMenu = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const isActiveRoute = (href) => {
  if (href === '/dashboard') {
    return url.value === '/dashboard'
  }
  return url.value.startsWith(href)
}

const userMenuRef = ref(null)
const navbarUserMenuRef = ref(null)
</script>

<template>
  <div class="flex min-h-screen bg-white">
    <!-- Mobile backdrop overlay -->
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
      @click="toggleMobileMenu"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out',
        isCollapsed ? 'lg:w-16' : 'lg:w-64',
        isMobileOpen
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Header -->
      <div class="flex h-16 items-center justify-between px-4">
        <template v-if="!isCollapsed || isMobileOpen">
          <Link href="/" class="group">
            <img
              src="/images/logo.svg"
              alt="Ascent Logo"
              class="h-8 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <!-- Desktop collapse button -->
          <button
            @click="toggleSidebar"
            class="hidden rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:block"
            title="Collapse sidebar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>

          <!-- Mobile close button -->
          <button
            @click="toggleMobileMenu"
            class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:hidden"
            title="Close sidebar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </template>
        <div v-else class="mx-auto">
          <Link href="/">
            <img src="/images/logomark.svg" alt="Ascent" class="h-8 w-8" />
          </Link>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4">
        <div class="space-y-6">
          <div
            v-for="(section, sectionIndex) in navigationSections"
            :key="sectionIndex"
          >
            <!-- Section Label -->
            <div
              v-if="section.label && (!isCollapsed || isMobileOpen)"
              class="px-3 pb-2"
            >
              <h3
                class="text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {{ section.label }}
              </h3>
            </div>

            <!-- Section Items -->
            <div class="space-y-1">
              <Link
                v-for="item in section.items"
                :key="item.name"
                :href="item.href"
                :class="[
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActiveRoute(item.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
                @click="isMobileOpen && toggleMobileMenu()"
              >
                <i
                  :class="[
                    'pi',
                    item.icon,
                    'text-base',
                    isActiveRoute(item.href)
                      ? 'text-brand-600'
                      : 'text-gray-400 group-hover:text-gray-500',
                    !isCollapsed || isMobileOpen ? 'mr-3' : ''
                  ]"
                />
                <span v-if="!isCollapsed || isMobileOpen">{{ item.name }}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Section -->
      <div class="p-3">
        <template v-if="!isCollapsed || isMobileOpen">
          <div
            class="flex cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-gray-50"
            @click="(e) => userMenuRef?.toggle(e)"
          >
            <Avatar
              :image="loggedInUser?.currentAvatarUrl"
              :label="loggedInUser?.initials"
              size="normal"
              shape="circle"
              class="[&_img]:rounded-full"
              :style="{
                backgroundColor: loggedInUser?.currentAvatarUrl
                  ? undefined
                  : '#6366f1',
                color: '#ffffff'
              }"
            />
            <div class="ml-3 min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">
                {{ loggedInUser?.fullName }}
              </p>
              <p class="truncate text-xs text-gray-500">
                {{ loggedInUser?.email }}
              </p>
            </div>
            <i class="pi pi-ellipsis-v text-xs text-gray-400" />
          </div>

          <UserMenu ref="userMenuRef" />
        </template>
        <template v-else>
          <div class="flex justify-center">
            <Avatar
              :image="loggedInUser?.currentAvatarUrl"
              :label="loggedInUser?.initials"
              size="normal"
              shape="circle"
              class="cursor-pointer [&_img]:rounded-full"
              @click="(e) => userMenuRef?.toggle(e)"
              :style="{
                backgroundColor: loggedInUser?.currentAvatarUrl
                  ? undefined
                  : '#6366f1',
                color: '#ffffff'
              }"
            />
            <UserMenu ref="userMenuRef" />
          </div>
        </template>
      </div>
    </aside>

    <!-- Main content area -->
    <div
      :class="[
        'flex flex-1 flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      ]"
    >
      <!-- Navbar -->
      <header class="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div
          class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <div class="flex items-center gap-4">
            <!-- Mobile menu button -->
            <button
              @click="toggleMobileMenu"
              class="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 lg:hidden"
              title="Open sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="14" y1="8" x2="20" y2="8"></line>
                <line x1="14" y1="12" x2="20" y2="12"></line>
                <line x1="14" y1="16" x2="20" y2="16"></line>
              </svg>
            </button>

            <!-- Desktop expand button -->
            <button
              v-if="isCollapsed"
              @click="toggleSidebar"
              class="hidden rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:block"
              title="Expand sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="14" y1="8" x2="20" y2="8"></line>
                <line x1="14" y1="12" x2="20" y2="12"></line>
                <line x1="14" y1="16" x2="20" y2="16"></line>
              </svg>
            </button>

            <h1 class="text-lg font-medium text-gray-700">{{ title }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <SecondaryButton
              icon="pi pi-search"
              aria-label="Search"
              :text="true"
              variant="text"
              size="small"
              class="text-gray-500 hover:text-gray-700"
            />
            <SecondaryButton
              icon="pi pi-bell"
              aria-label="Notifications"
              variant="text"
              size="small"
            />

            <!-- User Avatar Dropdown -->
            <div class="relative">
              <Avatar
                :image="loggedInUser?.currentAvatarUrl"
                :label="loggedInUser?.initials"
                size="normal"
                shape="circle"
                class="cursor-pointer transition-all hover:ring-2 hover:ring-brand-200 [&_img]:rounded-full"
                @click="(e) => navbarUserMenuRef?.toggle(e)"
                :style="{
                  backgroundColor: loggedInUser?.currentAvatarUrl
                    ? undefined
                    : '#6366f1',
                  color: '#ffffff'
                }"
              />

              <UserMenu ref="navbarUserMenuRef" />
            </div>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div
          :class="[
            'mx-auto py-12',
            maxWidth === 'narrow'
              ? 'max-w-3xl'
              : maxWidth === 'wide'
              ? 'max-w-7xl'
              : 'sm:w-10/12'
          ]"
        >
          <slot />
        </div>
      </main>
    </div>

    <Toast />
  </div>
</template>
