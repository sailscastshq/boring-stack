<script setup>
import { ref } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import Avatar from '@/components/Avatar.vue'
import Menu from '@/volt/Menu.vue'

const menuRef = ref()
const page = usePage()
const { loggedInUser, teams, currentTeam } = page.props
console.log(loggedInUser)
const items = ref([])

if (teams && teams.length > 0) {
  const teamItems = teams.map((team) => ({
    label: team.name,
    teamId: team.id,
    logoUrl: team.logoUrl,
    isCurrent: currentTeam?.id === team.id,
    command: () => router.post(`/teams/${team.id}/switch`)
  }))

  teamItems.push({
    label: 'New team',
    isNewTeam: true,
    command: () => router.visit('/team/create')
  })

  items.value.push({
    label: 'Teams',
    items: teamItems
  })
  items.value.push({ separator: true })
}

items.value.push(
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

defineExpose({
  toggle: (event) => menuRef.value?.toggle(event)
})
</script>

<template>
  <Menu
    ref="menuRef"
    id="user_menu"
    :model="items"
    :popup="true"
    class="w-full md:w-64"
  >
    <template #start>
      <div class="border-b border-surface-200 px-4 py-3">
        <div class="flex items-center">
          <Avatar
            :image="loggedInUser.currentAvatarUrl"
            :label="loggedInUser.initials"
            class="mr-3"
            shape="circle"
            size="normal"
            :style="{
              backgroundColor: loggedInUser.currentAvatarUrl
                ? undefined
                : '#6366f1',
              color: '#ffffff'
            }"
          />
          <div class="flex min-w-0 flex-1 flex-col">
            <span
              class="truncate text-sm font-semibold text-gray-900 dark:text-white"
            >
              {{ loggedInUser.fullName }}
            </span>
            <span class="truncate text-xs text-gray-500">
              {{ loggedInUser.email }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template #submenulabel="{ item }">
      <span class="text-xs font-bold uppercase text-surface-500">{{
        item.label
      }}</span>
    </template>

    <template #item="{ item, props }">
      <button
        v-if="item.teamId"
        type="button"
        class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left"
        v-bind="props.action"
        :class="
          item.isCurrent
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-700 hover:bg-gray-50'
        "
      >
        <Avatar
          :image="item.logoUrl"
          :label="item.label.charAt(0)"
          shape="square"
        />
        <span class="text-sm font-medium">{{ item.label }}</span>
        <span v-if="item.isCurrent" class="relative ml-auto flex size-3">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"
          ></span>
          <span
            class="relative inline-flex size-3 rounded-full bg-sky-500"
          ></span>
        </span>
      </button>
      <Link
        v-else-if="item.isNewTeam"
        href="/team/create"
        class="flex items-center gap-2 px-3 py-2"
        v-bind="props.action"
      >
        <div
          class="flex items-center justify-center w-8 h-8 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg"
        >
          <i class="pi pi-plus text-sm text-surface-400" />
        </div>
        <span class="text-sm font-medium">{{ item.label }}</span>
      </Link>
      <a
        v-else
        class="flex items-center gap-2"
        v-bind="props.action"
        :class="{ 'text-red-500': item.isSignOut }"
      >
        <i :class="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>
