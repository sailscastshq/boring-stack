<script setup>
import ArrowRight from '@/components/ui/icons/ArrowRight.vue'
import { Head, Link, usePage } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { computed } from 'vue'

defineOptions({
  layout: (h, page) => h(DashboardLayout, {}, () => page)
})

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
</script>

<template>
  <Head title="Dashboard | Ascent" />

  <section class="ascent-workspace-intro">
    <h1>Welcome back, {{ loggedInUser.fullName.split(' ')[0] }}.</h1>
    <p>Your account, your team, and your next steps.</p>
  </section>
  <section class="ascent-workspace-links" aria-label="Workspace shortcuts">
    <Link href="/settings/profile">
      <h2>Make it yours <ArrowRight class="h-4 w-4 shrink-0" /></h2>
      <p>Update your profile and choose how you show up.</p></Link
    ><Link href="/settings/team">
      <h2>Build together <ArrowRight class="h-4 w-4 shrink-0" /></h2>
      <p>Manage your workspace, people, and invitations.</p></Link
    ><Link href="/settings/billing">
      <h2>Your plan <ArrowRight class="h-4 w-4 shrink-0" /></h2>
      <p>Review your subscription and billing details.</p></Link
    >
  </section>
  <section class="ascent-workspace-note">
    <div>
      <h2>Keep your account secure.</h2>
      <p>Review your password, passkeys, and two-factor authentication.</p>
    </div>
    <Link href="/settings/security" class="ascent-inline-link"
      >Security settings <ArrowRight class="h-4 w-4 shrink-0"
    /></Link>
  </section>
</template>
