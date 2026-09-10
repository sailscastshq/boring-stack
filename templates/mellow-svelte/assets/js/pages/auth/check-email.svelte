<script>
  import ArrowLeft from '@/components/ui/icons/ArrowLeft.svelte'
  import Envelope from '@/components/ui/icons/Envelope.svelte'

  import { Link } from '@inertiajs/svelte'
  export let message
</script>

<svelte:head>
  <title>Check your email | Mellow</title>
</svelte:head>
<section class="mellow-auth">
  <main class="mellow-auth-main">
    <section
      class="mb-6 flex flex-col items-center justify-center space-y-4 text-center"
    >
      <span
        class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]"
        ><Envelope class="h-[18px] w-[18px]" /></span
      >

      <h1 class="text-2xl">Check your email</h1>
      {#if message}
        <p class="text-sm text-gray-600">
          {message}
        </p>
      {/if}
      <button
        type="button"
        class="border-brand bg-brand disabled:text-gray w-full rounded-md border px-4 py-3 text-white disabled:bg-gray-200/40"
      >
        Open email app
      </button>

      <p class="text-gray my-8 text-center">
        Didn't receive email?
        <a href="/resend-link" class="text-brand hover:underline">Resend</a>
      </p>
    </section>
  </main>
  <footer class="my-8 text-center text-black">
    <Link href="/signup" class="flex items-center justify-center">
      <ArrowLeft class="h-4 w-4" />
      <span class="pl-2">Back to sign up</span>
    </Link>
  </footer>
</section>
