<script>
  import ArrowLeft from '@/components/ui/icons/ArrowLeft.svelte'
  import CheckCircle from '@/components/ui/icons/CheckCircle.svelte'
  import Lock from '@/components/ui/icons/Lock.svelte'

  import { Link, useForm } from '@inertiajs/svelte'
  import InputButton from '@/components/InputButton.svelte'
  import InputPassword from '@/components/InputPassword.svelte'

  export let token
  const form = useForm({
    token,
    password: null,
    confirmPassword: null
  })

  function passwordContainsSpecialChars(password) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    return specialChars.test(password)
  }

  $: containsSpecialChars = passwordContainsSpecialChars(form.password)

  $: passwordIsValid = form.password?.length >= 8

  function shouldDisableResetPasswordButton(form) {
    if (!passwordIsValid) return true
    if (!containsSpecialChars) return true
    if (form.processing) return true
    if (form.password != form.confirmPassword) return true
    return false
  }

  $: disableResetPasswordButton = shouldDisableResetPasswordButton(form)

  function submit() {
    form.post('/reset-password')
  }
</script>

<svelte:head>
  <title>Reset password | Mellow</title>
</svelte:head>
<section
  class="from-brand-50/10 flex min-h-screen flex-col justify-center bg-gradient-to-b to-[#F9FAFB] text-black sm:items-center"
>
  <main
    class="mt-10 bg-white px-4 py-10 text-black sm:w-7/12 sm:rounded-lg sm:px-8 sm:shadow-lg md:w-6/12 lg:w-5/12 xl:w-4/12"
  >
    <section
      class="mb-6 flex flex-col items-center justify-center space-y-2 text-center"
    >
      <span
        class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]"
        ><Lock class="h-[18px] w-[18px]" /></span
      >

      <h1 class="text-2xl">Create a new password</h1>
      <p class="text-gray text-lg">Set a new password</p>
    </section>
    <form
      on:submit|preventDefault={submit}
      class="mb-4 flex flex-col space-y-6"
    >
      <InputPassword
        bind:value={form.password}
        label="New password"
        id="newPassword"
      >
        {#if form.errors.password}
          <p class="absolute text-red-500">
            {form.errors.password}
          </p>
        {/if}
      </InputPassword>
      <InputPassword
        bind:value={form.confirmPassword}
        label="Confirm Password"
        placeholder="Confirm Password"
        id="confirmPassword"
      >
        {#if form.errors.confirmPassword}
          <p class="absolute text-red-500">
            {form.errors.confirmPassword}
          </p>
        {/if}
      </InputPassword>
      <ul class="flex justify-between text-sm">
        <li
          class="flex items-center space-x-1 text-gray-500"
          class:text-green={passwordIsValid}
        >
          <CheckCircle class="h-4 w-4" />
          <span>At least 8 characters</span>
        </li>
        <li
          class="flex items-center space-x-1 text-gray-500"
          class:text-green={containsSpecialChars}
        >
          <CheckCircle class="h-4 w-4" />
          <span>At least 1 special characters</span>
        </li>
      </ul>
      <InputButton
        processing={form.processing}
        disabled={disableResetPasswordButton}
        >Reset password
      </InputButton>
    </form>
  </main>
  <footer class="text-gray my-8 text-center">
    <Link href="/login" class="flex items-center justify-center">
      <ArrowLeft class="h-4 w-4" />
      <span class="pl-2">Back to login</span>
    </Link>
  </footer>
</section>
