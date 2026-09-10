<script>
  import CheckCircle from '@/components/ui/icons/CheckCircle.svelte'

  import { Link } from '@inertiajs/svelte'
  export let pageTitle
  export let pageHeading
  export let message
</script>

<svelte:head>
  {`${pageTitle} | Mellow`}
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
        class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#ECFFF4] text-[#49D489]"
        ><CheckCircle class="h-[18px] w-[18px]" /></span
      >

      <h1 class="text-2xl">{pageHeading}</h1>
      <p class="text-gray text-lg">
        {message}. Click continue to go to your dashboard.
      </p>
      <Link
        href="/dashboard"
        class="border-brand bg-brand disabled:text-gray w-full rounded-md border px-4 py-3 text-white disabled:bg-gray-200/40"
      >
        Continue
      </Link>
    </section>
  </main>
</section>
