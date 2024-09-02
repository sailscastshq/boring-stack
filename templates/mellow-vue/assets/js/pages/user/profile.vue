<script setup>
import { ref } from 'vue'
import { Link, Head, usePage, useForm } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})

const loggedInUser = ref(usePage().props.loggedInUser)

const userForm = useForm({
  email: loggedInUser.value.email,
  fullName: loggedInUser.value.fullName
})

const passwordForm = useForm({
  currentPassword: null,
  password: null,
  passwordConfirmation: null
})

const deleteAccountForm = useForm({
  password: null
})

const updateProfile = () => {
  userForm.patch(`/users/${loggedInUser.value.id}`, {
    preserveScroll: true,
    preserveState: true
  })
}

const updatePassword = () => {
  passwordForm.put(`/users/${loggedInUser.value.id}/password`, {
    preserveScroll: true,
    preserveState: false,
    onSuccess: () => passwordForm.reset()
  })
}

const deleteAccount = () => {
  deleteAccountForm.delete(`/users/${loggedInUser.value.id}`, {
    preserveScroll: true,
    preserveState: false
  })
}
</script>

<template>
  <Head title="Profile | Mellow"></Head>

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

      <form @submit.prevent="updateProfile" class="space-y-4">
        <label for="fullName" class="relative block">
          <span class="block text-lg">Name</span>
          <span class="absolute left-2 top-[55%]">
            <svg
              class="h-5 w-5 fill-gray"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_185_224)">
                <path
                  d="M12.6667 0H3.33333C2.4496 0.00105857 1.60237 0.352588 0.97748 0.97748C0.352588 1.60237 0.00105857 2.4496 0 3.33333L0 12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H12.6667C13.5504 15.9989 14.3976 15.6474 15.0225 15.0225C15.6474 14.3976 15.9989 13.5504 16 12.6667V3.33333C15.9989 2.4496 15.6474 1.60237 15.0225 0.97748C14.3976 0.352588 13.5504 0.00105857 12.6667 0ZM4.66667 14.6667V14C4.66667 13.1159 5.01786 12.2681 5.64298 11.643C6.2681 11.0179 7.11595 10.6667 8 10.6667C8.88406 10.6667 9.7319 11.0179 10.357 11.643C10.9821 12.2681 11.3333 13.1159 11.3333 14V14.6667H4.66667ZM14.6667 12.6667C14.6667 13.1971 14.456 13.7058 14.0809 14.0809C13.7058 14.456 13.1971 14.6667 12.6667 14.6667V14C12.6667 12.7623 12.175 11.5753 11.2998 10.7002C10.4247 9.825 9.23768 9.33333 8 9.33333C6.76232 9.33333 5.57534 9.825 4.70017 10.7002C3.825 11.5753 3.33333 12.7623 3.33333 14V14.6667C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V3.33333C1.33333 2.8029 1.54405 2.29419 1.91912 1.91912C2.29419 1.54405 2.8029 1.33333 3.33333 1.33333H12.6667C13.1971 1.33333 13.7058 1.54405 14.0809 1.91912C14.456 2.29419 14.6667 2.8029 14.6667 3.33333V12.6667Z"
                  fill="#878787"
                />
                <path
                  d="M7.99998 2.66669C7.47256 2.66669 6.95699 2.82308 6.51846 3.1161C6.07993 3.40912 5.73814 3.8256 5.5363 4.31286C5.33447 4.80013 5.28166 5.33631 5.38455 5.85359C5.48745 6.37088 5.74142 6.84603 6.11436 7.21897C6.4873 7.59191 6.96246 7.84589 7.47974 7.94878C7.99702 8.05168 8.5332 7.99887 9.02047 7.79703C9.50774 7.5952 9.92422 7.25341 10.2172 6.81487C10.5103 6.37634 10.6666 5.86077 10.6666 5.33335C10.6666 4.62611 10.3857 3.94783 9.8856 3.44774C9.3855 2.94764 8.70723 2.66669 7.99998 2.66669ZM7.99998 6.66669C7.73627 6.66669 7.47849 6.58849 7.25922 6.44198C7.03996 6.29547 6.86906 6.08723 6.76814 5.8436C6.66722 5.59996 6.64082 5.33187 6.69227 5.07323C6.74371 4.81459 6.8707 4.57701 7.05717 4.39054C7.24364 4.20407 7.48122 4.07709 7.73986 4.02564C7.9985 3.97419 8.26659 4.0006 8.51023 4.10151C8.75386 4.20243 8.9621 4.37333 9.10861 4.59259C9.25512 4.81186 9.33331 5.06965 9.33331 5.33335C9.33331 5.68698 9.19284 6.02611 8.94279 6.27616C8.69274 6.52621 8.3536 6.66669 7.99998 6.66669Z"
                  fill="#878787"
                />
              </g>
              <defs>
                <clipPath id="clip0_185_224">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </span>
          <input
            type="text"
            id="fullName"
            placeholder="Your name"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
            v-model="userForm.fullName"
          />
        </label>
        <label for="email" class="relative block">
          <span class="block text-lg">Email</span>
          <span class="absolute left-2 top-[55%]">
            <svg
              class="h-5 w-5 fill-gray"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.6667 0.666626H3.33333C2.4496 0.667685 1.60237 1.01921 0.97748 1.64411C0.352588 2.269 0.00105857 3.11623 0 3.99996L0 12C0.00105857 12.8837 0.352588 13.7309 0.97748 14.3558C1.60237 14.9807 2.4496 15.3322 3.33333 15.3333H12.6667C13.5504 15.3322 14.3976 14.9807 15.0225 14.3558C15.6474 13.7309 15.9989 12.8837 16 12V3.99996C15.9989 3.11623 15.6474 2.269 15.0225 1.64411C14.3976 1.01921 13.5504 0.667685 12.6667 0.666626ZM3.33333 1.99996H12.6667C13.0659 2.00074 13.4557 2.12097 13.786 2.34516C14.1163 2.56935 14.3719 2.88726 14.52 3.25796L9.41467 8.36396C9.03895 8.73817 8.53028 8.94827 8 8.94827C7.46972 8.94827 6.96105 8.73817 6.58533 8.36396L1.48 3.25796C1.6281 2.88726 1.88374 2.56935 2.21403 2.34516C2.54432 2.12097 2.93414 2.00074 3.33333 1.99996ZM12.6667 14H3.33333C2.8029 14 2.29419 13.7892 1.91912 13.4142C1.54405 13.0391 1.33333 12.5304 1.33333 12V4.99996L5.64267 9.30663C6.26842 9.9308 7.11617 10.2813 8 10.2813C8.88383 10.2813 9.73158 9.9308 10.3573 9.30663L14.6667 4.99996V12C14.6667 12.5304 14.456 13.0391 14.0809 13.4142C13.7058 13.7892 13.1971 14 12.6667 14Z"
                fill="#878787"
              />
            </svg>
          </span>
          <input
            type="email"
            id="email"
            placeholder="Your email"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
            v-model="userForm.email"
          />
        </label>
        <div class="flex items-center justify-end">
          <button
            type="submit"
            :disabled="userForm.processing"
            class="flex justify-center rounded-md border border-brand bg-brand px-4 py-2 text-white disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:text-gray"
          >
            <svg
              v-if="userForm.processing"
              class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-else> Save changes </span>
          </button>
        </div>
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

      <form @submit.prevent="updatePassword" class="space-y-4">
        <label for="currentPassword" class="relative block">
          <span class="block text-lg">Current Password</span>
          <input
            type="password"
            id="currentPassword"
            placeholder="Current password"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-3 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
            v-model="passwordForm.currentPassword"
          />
        </label>
        <label for="password" class="relative block">
          <span class="block text-lg">New Password</span>
          <input
            type="password"
            id="password"
            placeholder="New password"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-3 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
            v-model="passwordForm.password"
          />
        </label>
        <label for="passwordConfirmation" class="relative block">
          <span class="block text-lg">Confirm New Password</span>
          <input
            type="password"
            id="passwordConfirmation"
            placeholder="Confirm new password"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-3 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
            v-model="passwordForm.passwordConfirmation"
          />
        </label>
        <div class="flex items-center justify-end">
          <button
            type="submit"
            :disabled="passwordForm.processing"
            class="flex justify-center rounded-md border border-brand bg-brand px-4 py-2 text-white disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:text-gray"
          >
            <svg
              v-if="passwordForm.processing"
              class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-else> Update Password </span>
          </button>
        </div>
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
        <label for="password" class="relative block">
          <span class="block text-lg">Password</span>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-3 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
            v-model="deleteAccountForm.password"
          />
        </label>
        <div class="flex items-center justify-end">
          <button
            type="submit"
            :disabled="deleteAccountForm.processing"
            class="flex justify-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:text-gray"
          >
            <svg
              v-if="deleteAccountForm.processing"
              class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-else> Delete Account </span>
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
