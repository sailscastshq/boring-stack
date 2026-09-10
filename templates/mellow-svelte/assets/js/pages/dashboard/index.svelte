<script context="module">
  import AppLayout from '@/layouts/AppLayout.svelte'
  export const layout = AppLayout
</script>

<script>
  import ArrowRight from '@/components/ui/icons/ArrowRight.svelte'
  import { Link, usePage } from '@inertiajs/svelte'

  const page = usePage()

  $: loggedInUser = page.props.loggedInUser
</script>

<svelte:head>
  <title>Dashboard | Mellow</title>
</svelte:head>
<section class="mellow-workspace">
  <div class="mellow-workspace-heading">
    <h1>Welcome, {loggedInUser.fullName}.</h1>
    <p class="text-sm text-gray-600">
      A place to settle in and make things happen.
    </p>
  </div>
  <div class="mellow-account-row">
    <h2>Your profile</h2>
    <div>
      <p>Make yourself at home. Update your name, email, and password.</p>
      <p class="mt-2 break-all">{loggedInUser.email}</p>
    </div>
    <Link href="/profile" class="mellow-primary"
      >Edit Profile <ArrowRight class="h-4 w-4 shrink-0" /></Link
    >
  </div>
  <div class="mellow-account-row">
    <h2>Your next step</h2>
    <p>
      The basics are in place. Explore the documentation and start shaping your
      application.
    </p>
    <a
      href="https://docs.sailscasts.com/boring-stack"
      class="mellow-text-link"
      target="_blank"
      rel="noopener noreferrer"
      >Explore the docs <ArrowRight class="h-4 w-4 shrink-0" /></a
    >
  </div>
</section>
