<script>
  import { Link } from '@inertiajs/svelte'

  export let status
  export let title
  export let message

  $: homeHref = status === 404 ? '/' : '/dashboard'
</script>

<svelte:head>
  <title>{status} {title} | Mellow</title>
</svelte:head>

<main
  class="flex min-h-screen items-center bg-linear-to-b from-brand-50/10 to-[#F9FAFB] px-6 py-16 text-black"
>
  <section class="mx-auto w-full max-w-3xl">
    <p class="mb-4 text-sm font-semibold text-brand">Status {status}</p>
    <h1 class="max-w-2xl text-4xl font-semibold text-black sm:text-5xl">
      {title}
    </h1>
    <p class="mt-5 max-w-xl text-lg leading-8 text-gray-600">
      {message}
    </p>

    <div class="mt-8 flex flex-wrap items-center gap-3">
      <Link
        href={homeHref}
        class="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        Go home
      </Link>
      <button
        type="button"
        class="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
        on:click={() => history.back()}
      >
        Go back
      </button>
    </div>
  </section>
</main>
