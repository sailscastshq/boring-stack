<script setup>
import ArrowLeft from '@/components/ui/icons/ArrowLeft.vue'
import CheckCircle from '@/components/ui/icons/CheckCircle.vue'
import Lock from '@/components/ui/icons/Lock.vue'

import { Link, Head, useForm } from '@inertiajs/vue3'
import { ref, computed } from 'vue'
import InputButton from '@/components/InputButton.vue'
import InputPassword from '@/components/InputPassword.vue'
const { token } = defineProps({
  token: String
})

const form = useForm({
  token,
  password: null,
  confirmPassword: null
})

const containsSpecialChars = computed(() => {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  return specialChars.test(form.password)
})
const passwordIsValid = computed(() => {
  return form.password?.length >= 8
})

const disableResetPasswordButton = computed(() => {
  if (!passwordIsValid.value) return true
  if (!containsSpecialChars.value) return true
  if (form.processing) return true
  if (form.password != form.confirmPassword) return true
  return false
})
</script>

<template>
  <Head title="Reset password | Mellow"></Head>
  <section class="mellow-auth">
    <main class="mellow-auth-main">
      <section
        class="mb-6 flex flex-col items-center justify-center space-y-2 text-center"
      >
        <span
          class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]"
          ><Lock class="h-[18px] w-[18px]"
        /></span>

        <h1 class="text-2xl">Create a new password</h1>
        <p class="text-sm text-gray-600">Set a new password</p>
      </section>
      <form
        @submit.prevent="form.post('/reset-password')"
        class="mb-4 flex flex-col space-y-6"
      >
        <InputPassword
          v-model="form.password"
          label="New password"
          id="newPassword"
          :error="form.errors.password"
        />
        <InputPassword
          v-model="form.confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          id="confirmPassword"
          :error="form.errors.confirmPassword"
        />
        <ul class="flex justify-between text-sm">
          <li
            class="flex items-center space-x-1 text-gray-500"
            :class="{ 'text-green': passwordIsValid }"
          >
            <CheckCircle class="h-4 w-4" />
            <span>At least 8 characters</span>
          </li>
          <li
            class="flex items-center space-x-1 text-gray-500"
            :class="{ 'text-green': containsSpecialChars }"
          >
            <CheckCircle class="h-4 w-4" />
            <span>At least 1 special characters</span>
          </li>
        </ul>
        <InputButton
          :processing="form.processing"
          :disabled="disableResetPasswordButton"
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
</template>
