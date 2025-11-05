<script setup>
import { ref, computed } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import Avatar from '@/volt/Avatar.vue'
import Menu from '@/volt/Menu.vue'

const menuRef = ref(null)

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
const teams = computed(() => page.props.teams)
const currentTeam = computed(() => page.props.currentTeam)

const sharedUserMenuItems = computed(() => {
  const items = []

  if (teams.value && teams.value.length > 0) {
    items.push({
      key: 'teams-section',
      items: teams.value.map((team) => ({
        label: team.name,
        teamId: team.id,
        logoUrl: team.logoUrl,
        isCurrent: currentTeam.value?.id === team.id,
        command: () => router.post(`/teams/${team.id}/switch`)
      }))
    })
    items.push({
      label: 'New team',
      key: 'new-team',
      isNewTeam: true,
      command: () => router.visit('/team/create')
    })
    items.push({ separator: true })
  }

  items.push(
    {
      label: 'My profile',
      icon: 'pi pi-user',
      command: () => router.visit('/profile')
    },
    {
      label: 'Help',
      icon: 'pi pi-question-circle',
      command: () => router.visit('/help')
    },
    {
      separator: true
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      isSignOut: true,
      command: () => router.delete('/logout')
    }
  )

  return items
})

defineExpose({
  toggle: (event) => menuRef.value?.toggle(event)
})
</script>

<template>
  <Menu ref="menuRef" :model="sharedUserMenuItems" :popup="true" class="w-64">
    <template #start>
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="flex items-center">
          <Avatar
            :image="loggedInUser?.currentAvatarUrl"
            :label="loggedInUser?.initials"
            class="mr-3 [&_img]:rounded-full"
            shape="circle"
            size="normal"
            :style="{
              backgroundColor: loggedInUser?.currentAvatarUrl
                ? undefined
                : '#6366f1',
              color: '#ffffff'
            }"
          />
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-semibold text-gray-900">
              {{ loggedInUser?.fullName }}
            </span>
            <span class="truncate text-xs text-gray-500">
              {{ loggedInUser?.email }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #item="{ item, props }">
      <template v-if="item.key === 'teams-section'">
        <div class="px-4 py-3">
          <div class="mb-3">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Teams
            </span>
          </div>
          <div class="space-y-1">
            <button
              v-for="team in item.items"
              :key="team.teamId"
              @click="team.command"
              :class="[
                'flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors',
                team.isCurrent
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <Avatar
                :image="team.logoUrl"
                :label="team.label.charAt(0).toUpperCase()"
                size="normal"
                class="mr-3 text-xs font-medium [&_img]:rounded-full"
                :style="{
                  backgroundColor: team.logoUrl ? 'transparent' : '#6b7280',
                  color: '#ffffff',
                  width: '1.75rem',
                  height: '1.75rem'
                }"
              />
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium">{{ team.label }}</div>
              </div>
              <span
                v-if="team.isCurrent"
                class="relative flex h-3 w-3 flex-shrink-0"
              >
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"
                />
                <span
                  class="relative inline-flex h-3 w-3 rounded-full bg-brand-500"
                />
              </span>
            </button>
          </div>
        </div>
      </template>
      <template v-else-if="item.isNewTeam">
        <a
          class="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          v-bind="props.action"
        >
          <div
            class="mr-3 flex h-7 w-7 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs font-medium text-gray-400"
          >
            +
          </div>
          <span class="flex-1 font-medium">{{ item.label }}</span>
        </a>
      </template>
      <template v-else-if="item.separator">
        <!-- Let PrimeVue render separator -->
      </template>
      <template v-else>
        <a
          class="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-gray-50 cursor-pointer"
          :class="
            item.isSignOut ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
          "
          v-bind="props.action"
        >
          <i
            v-if="item.icon"
            :class="[
              item.icon,
              'mr-3 text-base',
              item.isSignOut ? 'text-red-500' : 'text-gray-500'
            ]"
          />
          <span class="flex-1">{{ item.label }}</span>
        </a>
      </template>
    </template>
  </Menu>
</template>
