<script setup>
import { computed } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import Menu from '@/components/ui/menu/Menu.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import Plus from '@/components/ui/icons/Plus.vue'
import User from '@/components/ui/icons/User.vue'
import InfoCircle from '@/components/ui/icons/InfoCircle.vue'
import SignOut from '@/components/ui/icons/SignOut.vue'
defineProps({ id: { type: String, required: true } })
const page = usePage()
const user = computed(() => page.props.loggedInUser)
const teams = computed(() => page.props.teams || [])
</script>
<template>
  <Menu
    :id="id"
    class="w-64 max-w-[calc(100vw-2rem)]"
    aria-label="Account menu"
  >
    <div class="mb-1 border-b border-gray-200 px-3 py-3 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <Avatar
          :src="user?.currentAvatarUrl"
          alt=""
          class="bg-indigo-500 text-white"
          >{{ user?.initials }}</Avatar
        >
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ user?.fullName }}</p>
          <p class="truncate text-xs text-gray-500">{{ user?.email }}</p>
        </div>
      </div>
    </div>
    <template v-if="teams.length">
      <p class="px-3 py-2 text-xs font-bold uppercase text-gray-500">Teams</p>
      <button
        v-for="team in teams"
        :key="team.id"
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="router.post(`/teams/${team.id}/switch`)"
      >
        <Avatar :src="team.logoUrl" alt="" class="size-8 rounded-lg">{{
          team.name.charAt(0)
        }}</Avatar>
        <span>{{ team.name }}</span
        ><span
          v-if="page.props.currentTeam?.id === team.id"
          class="ml-auto h-2 w-2 rounded-full bg-sky-500"
          ><span class="sr-only">Current team</span></span
        >
      </button>
      <Link
        href="/team/create"
        role="menuitem"
        class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        ><Plus class="h-4 w-4" />New team</Link
      >
      <hr class="my-1 border-gray-200 dark:border-gray-700" />
    </template>
    <Link
      href="/profile"
      role="menuitem"
      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      ><User class="h-4 w-4" />My profile</Link
    >
    <Link
      href="/help"
      role="menuitem"
      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      ><InfoCircle class="h-4 w-4" />Help</Link
    >
    <hr class="my-1 border-gray-200 dark:border-gray-700" />
    <button
      type="button"
      role="menuitem"
      class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-800"
      @click="router.delete('/logout')"
    >
      <SignOut class="h-4 w-4" />Sign out
    </button>
  </Menu>
</template>
