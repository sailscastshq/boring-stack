<script setup>
import Tooltip from '@/components/ui/tooltip/Tooltip.vue'
import X from '@/components/ui/icons/X.vue'
import SidebarOpen from '@/components/ui/icons/SidebarOpen.vue'
import SidebarClose from '@/components/ui/icons/SidebarClose.vue'
import Users from '@/components/ui/icons/Users.vue'
import User from '@/components/ui/icons/User.vue'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.vue'
import LayoutDashboard from '@/components/ui/icons/LayoutDashboard.vue'
import EllipsisVertical from '@/components/ui/icons/EllipsisVertical.vue'
import CreditCard from '@/components/ui/icons/CreditCard.vue'
import Bell from '@/components/ui/icons/Bell.vue'
import Search from '@/components/ui/icons/Search.vue'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Sheet from '@/components/ui/sheet/Sheet.vue'
import { Link, usePage } from '@inertiajs/vue3'
import Avatar from '@/components/Avatar.vue'
import Button from '@/components/ui/button/Button.vue'
import UserMenu from '@/components/UserMenu.vue'
import { useLocalStorage } from '@/composables/localStorage'
import SecondaryButton from '@/components/ui/button/Button.vue'

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
const isDesktop = ref(false)
let viewport
function syncViewport() {
  isDesktop.value = viewport.matches
  if (viewport.matches) isMobileOpen.value = false
}
onMounted(() => {
  viewport = window.matchMedia('(min-width: 1024px)')
  syncViewport()
  viewport.addEventListener('change', syncViewport)
})
onBeforeUnmount(() => viewport?.removeEventListener('change', syncViewport))
watch(url, () => {
  isMobileOpen.value = false
})

const navigationSections = [
  {
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        name: 'Profile',
        href: '/settings/profile',
        icon: User
      },
      {
        name: 'Team',
        href: '/settings/team',
        icon: Users
      },
      {
        name: 'Billing',
        href: '/settings/billing',
        icon: CreditCard
      },
      {
        name: 'Security',
        href: '/settings/security',
        icon: ShieldCheck
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
</script>

<template>
  <div class="flex min-h-screen bg-white dark:bg-gray-900">
    <!-- Sidebar -->
    <component
      :is="isDesktop ? 'aside' : Sheet"
      v-bind="
        isDesktop ? {} : { open: isMobileOpen, 'aria-label': 'Main navigation' }
      "
      @update:open="isMobileOpen = $event"
      :class="[
        'fixed inset-y-0 left-0 right-auto m-0 z-50 flex-col border-r border-gray-200 bg-white p-0 transition-all duration-300 ease-in-out motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-900',
        isCollapsed ? 'lg:w-16' : 'lg:w-64',
        isDesktop
          ? 'flex translate-x-0'
          : 'w-64 open:flex -translate-x-full open:translate-x-0 starting:open:-translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="flex h-16 items-center justify-between px-4">
        <template v-if="!isCollapsed || isMobileOpen">
          <Link href="/" class="group">
            <span
              class="inline-flex items-center gap-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              aria-label="Ascent"
              >Ascent<span
                class="text-brand-600 dark:text-brand-300"
                aria-hidden="true"
                >↗</span
              ></span
            >
          </Link>

          <!-- Desktop collapse button -->
          <button
            @click="toggleSidebar"
            class="hidden rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:block dark:hover:bg-gray-800"
            title="Collapse sidebar"
          >
            <SidebarClose width="16" height="16" />
          </button>

          <!-- Mobile close button -->
          <button
            @click="toggleMobileMenu"
            class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:hidden dark:hover:bg-gray-800"
            title="Close sidebar"
          >
            <X width="16" height="16" />
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
                class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                {{ section.label }}
              </h3>
            </div>

            <!-- Section Items -->
            <div class="space-y-1">
              <Tooltip
                v-for="item in section.items"
                :key="item.name"
                :text="isCollapsed && !isMobileOpen ? item.name : ''"
                placement="right"
              >
                <Link
                  :href="item.href"
                  :aria-label="item.name"
                  :class="[
                    'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActiveRoute(item.href)
                      ? 'bg-brand-50 text-brand-700 dark:text-brand-300 dark:bg-brand-950/40'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                  ]"
                  @click="isMobileOpen && toggleMobileMenu()"
                >
                  <component
                    :is="item.icon"
                    :class="[
                      'text-base',
                      isActiveRoute(item.href)
                        ? 'text-brand-600'
                        : 'text-gray-400 group-hover:text-gray-500',
                      !isCollapsed || isMobileOpen ? 'mr-3' : ''
                    ]"
                    class="h-5 w-5"
                  />
                  <span v-if="!isCollapsed || isMobileOpen">{{
                    item.name
                  }}</span>
                </Link>
              </Tooltip>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Section -->
      <div class="p-3">
        <template v-if="!isCollapsed || isMobileOpen">
          <button
            type="button"
            class="flex cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            popovertarget="sidebar-user-menu"
            aria-haspopup="true"
            aria-label="Account menu"
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
              <p
                class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {{ loggedInUser?.fullName }}
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ loggedInUser?.email }}
              </p>
            </div>
            <EllipsisVertical
              class="h-[1em] w-[1em] shrink-0 text-xs text-gray-400"
            />
          </button>

          <UserMenu id="sidebar-user-menu" />
        </template>
        <template v-else>
          <div class="flex justify-center">
            <button
              type="button"
              popovertarget="collapsed-user-menu"
              aria-label="Account menu"
              class="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Avatar
                :user="loggedInUser"
                size="normal"
                shape="circle"
                class="cursor-pointer [&_img]:rounded-full"
                :title="loggedInUser?.fullName"
                :style="{
                  backgroundColor: loggedInUser?.currentAvatarUrl
                    ? undefined
                    : '#6366f1',
                  color: '#ffffff'
                }"
              />
            </button>
            <UserMenu id="collapsed-user-menu" />
          </div>
        </template>
      </div>
    </component>

    <!-- Main content area -->
    <div
      :class="[
        'flex flex-1 flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      ]"
    >
      <!-- Navbar -->
      <header
        class="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      >
        <div
          class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <div class="flex items-center gap-4">
            <!-- Mobile menu button -->
            <button
              @click="toggleMobileMenu"
              class="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 lg:hidden dark:text-gray-400"
              title="Open sidebar"
            >
              <SidebarOpen width="16" height="16" />
            </button>

            <!-- Desktop expand button -->
            <button
              v-if="isCollapsed"
              @click="toggleSidebar"
              class="hidden rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:block dark:text-gray-400 dark:hover:bg-gray-800"
              title="Expand sidebar"
            >
              <SidebarOpen width="16" height="16" />
            </button>

            <h1 class="text-lg font-medium text-gray-700 dark:text-gray-300">
              {{ title }}
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <SecondaryButton
              aria-label="Search"
              :text="true"
              class="border-transparent bg-transparent text-gray-500 dark:bg-transparent dark:text-gray-400 min-h-10 border border-gray-300 bg-white px-3 py-2 text-base text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 min-h-8 px-2.5 py-1.5 text-sm hover:text-gray-700"
              ><Search class="h-4 w-4"
            /></SecondaryButton>
            <SecondaryButton
              class="min-h-10 border border-gray-300 bg-white px-3 py-2 text-base text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 min-h-8 px-2.5 py-1.5 text-sm border-transparent bg-transparent text-gray-500 dark:bg-transparent dark:text-gray-400"
              aria-label="Notifications"
              ><Bell class="h-4 w-4"
            /></SecondaryButton>

            <!-- User Avatar Dropdown -->
            <div class="relative">
              <button
                type="button"
                popovertarget="navbar-user-menu"
                aria-label="Account menu"
                class="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Avatar
                  :image="loggedInUser?.currentAvatarUrl"
                  :label="loggedInUser?.initials"
                  size="normal"
                  shape="circle"
                  class="hover:ring-brand-200 cursor-pointer transition-all hover:ring-2 [&_img]:rounded-full"
                  :style="{
                    backgroundColor: loggedInUser?.currentAvatarUrl
                      ? undefined
                      : '#6366f1',
                    color: '#ffffff'
                  }"
                />
              </button>

              <UserMenu id="navbar-user-menu" />
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
  </div>
</template>
