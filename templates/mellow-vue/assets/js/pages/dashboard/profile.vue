<script setup>
import { Link, Head, usePage, useForm, router } from '@inertiajs/vue3'

import InputText from '@/components/InputText.vue'
import InputPassword from '@/components/InputPassword.vue'
import InputEmail from '@/components/InputEmail.vue'
import InputButton from '@/components/InputButton.vue'

import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})

const loggedInUser = usePage().props.loggedInUser

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
  form.patch(`/profile`, {
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
    deleteAccountForm.delete('/profile')
  }
}
</script>

<template>
  <Head title="Profile | Mellow"></Head>

  <div class="mx-auto space-y-8 px-4 md:w-8/12 xl:w-4/12">
    <section
      class="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
    >
      <header class="mb-6">
        <h1 class="text-2xl">Profile Information</h1>
        <p class="mt-2 text-gray-600">
          Update your account's profile information and email address.
        </p>
      </header>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <InputText v-model="form.fullName" />
        <InputEmail v-model="form.email" />
        <div class="flex items-center justify-end">
          <InputButton
            :processing="form.processing"
            :disabled="form.processing"
          >
            Save changes
          </InputButton>
        </div>
        <p class="text-right text-green-700" v-if="form.recentlySuccessful">
          Profile updated successfully!
        </p>
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

      <form @submit.prevent="updateProfile" class="space-y-4">
        <InputPassword
          label="Current Password"
          id="currentPassword"
          v-model="form.currentPassword"
          placeholder="Current Password"
        />
        <InputPassword
          label="New Password"
          id="password"
          v-model="form.password"
          placeholder="New Password"
        />
        <InputPassword
          label="Confirm Password"
          placeholder="Confirm Password"
          id="confirmPassword"
          v-model="form.confirmPassword"
        >
          <p class="text-red-500" v-if="form.errors.password">
            {{ form.errors.password }}
          </p>
        </InputPassword>

        <div class="flex items-center justify-end">
          <InputButton
            :processing="form.processing"
            :disabled="form.processing"
          >
            Update Password
          </InputButton>
        </div>
        <p class="text-right text-green-700" v-if="form.recentlySuccessful">
          Profile updated successfully!
        </p>
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

      <form @submit.prevent="deleteAccount" class="space-y-4">
        <InputPassword required v-model="deleteAccountForm.password" />
        <div class="flex items-center justify-end">
          <InputButton
            :processing="deleteAccountForm.processing"
            :disabled="deleteAccountForm.processing"
            class="border-red-600 bg-red-600"
          >
            Delete Account
          </InputButton>
        </div>
      </form>
    </section>

    <InputButton
      @click="router.delete('/logout')"
      class="w-full border-red-600 bg-red-600"
    >
      Logout
    </InputButton>
  </div>
</template>
