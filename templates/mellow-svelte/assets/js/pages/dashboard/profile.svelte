<script context="module">
  import AppLayout from '@/layouts/AppLayout.svelte'
  export const layout = AppLayout
</script>

<script>
  import { Link, page, useForm, router } from '@inertiajs/svelte'

  import InputText from '@/components/InputText.svelte'
  import InputPassword from '@/components/InputPassword.svelte'
  import InputEmail from '@/components/InputEmail.svelte'
  import InputButton from '@/components/InputButton.svelte'

  const loggedInUser = $page.props.loggedInUser

  const form = useForm({
    email: loggedInUser.email,
    fullName: loggedInUser.fullName,
    currentPassword: null,
    password: null,
    confirmPassword: null
  })

  const deleteAccountForm = useForm({
    password: null
  })

  function updateProfile() {
    $form.patch(`/profile`, {
      preserveScroll: true,
      preserveState: true,
      onError: (errors) => {
        console.error('Update failed:', errors)
      }
    })
  }

  function deleteAccount() {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      $deleteAccountForm.delete('/profile')
    }
  }
</script>

<svelte:head>
  <title>Profile | Mellow</title>
</svelte:head>
<div class="mx-auto space-y-8 px-4 md:w-4/12">
  <section
    class="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
  >
    <header class="mb-6">
      <h1 class="text-2xl">Profile Information</h1>
      <p class="mt-2 text-gray-600">
        Update your account's profile information and email address.
      </p>
    </header>

    <form on:submit|preventDefault={updateProfile} class="space-y-4">
      <InputText bind:value={$form.fullName} />
      <InputEmail bind:value={$form.email} />
      <div class="flex items-center justify-end">
        <InputButton processing={$form.processing} disabled={$form.processing}>
          Save changes
        </InputButton>
      </div>
      {#if $form.recentlySuccessful}
        <p class="text-right text-green-700">Profile updated successfully!</p>
      {/if}
    </form>
  </section>

  <section
    class="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
  >
    <header class="mb-6">
      <h2 class="text-2xl">Change Password</h2>
      <p class="mt-2 text-gray-600">
        Ensure your account is using a long, random password to stay secure.
      </p>
    </header>

    <form on:submit|preventDefault={updateProfile} class="space-y-4">
      <InputPassword
        label="Current Password"
        id="currentPassword"
        bind:value={$form.currentPassword}
        placeholder="Current Password"
      />
      <InputPassword
        label="New Password"
        id="password"
        bind:value={$form.password}
        placeholder="New Password"
      />
      <InputPassword
        label="Confirm Password"
        placeholder="Confirm Password"
        id="confirmPassword"
        bind:value={$form.confirmPassword}
      >
        {#if $form.errors.password}
          <p class="text-red-500">
            {$form.errors.password}
          </p>
        {/if}
      </InputPassword>

      <div class="flex items-center justify-end">
        <InputButton processing={$form.processing} disabled={$form.processing}>
          Update Password
        </InputButton>
      </div>
      {#if $form.recentlySuccessful}
        <p class="text-right text-green-700">Profile updated successfully!</p>
      {/if}
    </form>
  </section>

  <section
    class="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
  >
    <header class="mb-6">
      <h2 class="text-2xl">Delete Account</h2>
      <p class="mt-2 text-gray-600">
        Once your account is deleted, all of its resources and data will be
        permanently deleted. Before deleting your account, please download any
        data or information that you wish to retain.
      </p>
    </header>

    <form on:submit|preventDefault={deleteAccount} class="space-y-4">
      <InputPassword required bind:value={$deleteAccountForm.password} />
      <div class="flex items-center justify-end">
        <InputButton
          processing={$deleteAccountForm.processing}
          disabled={$deleteAccountForm.processing}
          class="border-red-600 bg-red-600"
        >
          Delete Account
        </InputButton>
      </div>
    </form>
  </section>

  <InputButton
    type="button"
    on:click={() => router.delete('/logout')}
    class="w-full border-red-600 bg-red-600"
  >
    Logout
  </InputButton>
</div>
