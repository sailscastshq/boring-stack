<script>
  import ArrowLeft from '@/components/ui/icons/ArrowLeft.svelte'
  import Key from '@/components/ui/icons/Key.svelte'

  import { Link, useForm } from '@inertiajs/svelte'
  import InputEmail from '@/components/InputEmail.svelte'
  import InputButton from '@/components/InputButton.svelte'

  const form = useForm({
    email: null
  }).withPrecognition('post', '/forgot-password')

  function shouldDisableForgetPasswordButton(form) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    const isEmailValid = emailRegex.test(form.email)
    if (!isEmailValid) return true
    if (form.processing) return true
    return false
  }

  let disableForgetPasswordButton = $derived(
    shouldDisableForgetPasswordButton(form)
  )

  function submit() {
    form.post('/forgot-password')
  }
</script>

<svelte:head>
  <title>Forgot password | Mellow</title>
</svelte:head>
<section class="mellow-auth">
  <main class="mellow-auth-main">
    <section
      class="mb-6 flex flex-col items-center justify-center space-y-2 text-center"
    >
      <span
        class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]"
        ><Key class="h-[18px] w-[18px]" /></span
      >

      <h1 class="text-2xl">Forgot password?</h1>
      <p class="text-sm text-gray-600">
        We'll send reset instructions to your email
      </p>
    </section>
    <form
      onsubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      class="mb-4 flex flex-col space-y-6"
    >
      <InputEmail
        bind:value={form.email}
        error={form.errors.email}
        onblur={() => form.validate('email')}
      />
      <InputButton
        processing={form.processing}
        disabled={disableForgetPasswordButton}>Forgot password</InputButton
      >
    </form>
  </main>
  <footer class="my-8 text-center text-black">
    <Link href="/login" class="flex items-center justify-center">
      <ArrowLeft class="h-4 w-4" />
      <span class="pl-2">Back to login</span>
    </Link>
  </footer>
</section>
