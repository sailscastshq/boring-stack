<script>
  import ArrowLeft from '@/components/ui/icons/ArrowLeft.svelte'
  import Envelope from '@/components/ui/icons/Envelope.svelte'

  import { Link } from '@inertiajs/svelte'
</script>

<svelte:head>
  <title>Verification expired | Mellow</title>
</svelte:head>
<section
  class="from-brand-50/10 flex min-h-screen flex-col justify-center bg-gradient-to-b to-[#F9FAFB] text-black sm:items-center"
>
  <main
    class="mt-10 bg-white px-4 py-10 text-black sm:w-7/12 sm:rounded-lg sm:px-8 sm:shadow-lg md:w-6/12 lg:w-5/12 xl:w-4/12"
  >
    <section
      class="mb-6 flex flex-col items-center justify-center space-y-4 text-center"
    >
      <span
        class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#FFECEC] text-[#FF3A3A]"
        ><Envelope class="h-[18px] w-[18px]" /></span
      >

      <h1 class="text-2xl">Token expired</h1>
      <p class="text-gray text-lg">
        The token sent to your email has expired or been used.
      </p>
      <a
        href="/resend-link"
        class="border-brand bg-brand disabled:text-gray w-full rounded-md border px-4 py-3 text-white disabled:bg-gray-200/40"
      >
        Resend link
      </a>
    </section>
  </main>
  <footer class="my-8 text-center text-black">
    <Link href="/signup" class="flex items-center justify-center">
      <ArrowLeft class="h-4 w-4" />
      <span class="pl-2">Back to sign up</span>
    </Link>
  </footer>
</section>
