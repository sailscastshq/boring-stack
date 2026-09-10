<script setup>
import WarningTriangle from '@/components/ui/icons/WarningTriangle.vue'
import SignOut from '@/components/ui/icons/SignOut.vue'
import Trash from '@/components/ui/icons/Trash.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { computed } from 'vue'
import { Head, usePage, useForm, router } from '@inertiajs/vue3'
import { useConfirmation } from '@/composables/confirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import InputText from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Avatar from '@/components/Avatar.vue'
import Message from '@/components/ui/alert/Alert.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DangerButton from '@/components/ui/button/Button.vue'

defineOptions({
  layout: (h, page) =>
    h(DashboardLayout, { maxWidth: 'narrow', title: 'Profile' }, () => page)
})

const page = usePage()
const confirmation = useConfirmation()

const loggedInUser = computed(() => page.props.loggedInUser)

const form = useForm({
  email: loggedInUser.value.email,
  fullName: loggedInUser.value.fullName,
  avatar: null
})

const deleteAccountForm = useForm({})

function updateProfile(e) {
  e.preventDefault()

  const data = {
    email: form.email,
    fullName: form.fullName
  }

  if (form.avatar instanceof File) {
    data.avatar = form.avatar
  }

  form
    .transform(() => data)
    .patch('/settings/profile', {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        form.reset('avatar')
      },
      onError: (errors) => {
        console.error('Update failed:', errors)
      }
    })
}

function confirmDeleteAccount() {
  confirmation.request({
    message:
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
    header: 'Delete Account',
    icon: WarningTriangle,
    acceptClass:
      'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-white',
    rejectProps: { label: 'Cancel' },
    acceptProps: {
      label: 'Delete Account',
      severity: 'danger'
    },
    accept: () => {
      deleteAccountForm.delete('/settings/profile')
    }
  })
}
function signOutEverywhere() {
  router.delete('/logout')
}
</script>

<template>
  <ConfirmationDialog :state="confirmation" />
  <Head title="Profile Settings | Ascent Vue" />

  <div class="max-w-2xl space-y-12">
    <!-- Profile Header -->
    <header class="flex items-center space-x-4">
      <Avatar
        :image="loggedInUser.currentAvatarUrl"
        :label="loggedInUser.initials"
        size="large"
        shape="circle"
      />
      <div>
        <h2 class="text-lg font-medium text-gray-900">
          {{ loggedInUser.fullName }}
        </h2>
        <p class="text-sm text-gray-500">{{ loggedInUser.email }}</p>
      </div>
    </header>

    <!-- Profile Information -->
    <section class="space-y-6">
      <div>
        <h3 class="mb-4 text-sm font-medium text-gray-900">
          Profile Information
        </h3>
        <p class="mb-6 text-sm text-gray-500">
          Update your personal details and contact information.
        </p>
      </div>

      <form @submit="updateProfile" class="space-y-4">
        <!-- Avatar Upload -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Avatar
          </label>
          <ImageUpload
            :current-image-url="loggedInUser.avatarUrl"
            @image-select="(file) => (form.avatar = file)"
          />
          <Message
            role="alert"
            v-if="form.errors.avatar"
            class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
          >
            {{ form.errors.avatar }}
          </Message>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="fullName" class="mb-1 block text-sm text-gray-700">
              Full Name
            </label>
            <InputText
              id="fullName"
              v-model="form.fullName"
              class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand w-full"
            />
          </div>

          <div>
            <label for="email" class="mb-1 block text-sm text-gray-700">
              Email Address
            </label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand w-full"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3">
          <span v-if="form.recentlySuccessful" class="text-sm text-green-600">
            Saved
          </span>
          <Button
            class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-brand dark:bg-transparent dark:text-brand-400"
            :disabled="false || form.processing"
            :aria-busy="form.processing"
            type="submit"
            ><Spinner v-if="form.processing" class="h-4 w-4" />{{
              form.processing ? 'Saving changes...' : 'Save changes'
            }}</Button
          >
        </div>
      </form>
    </section>

    <!-- Account Actions -->
    <section class="space-y-6">
      <div>
        <h3 class="mb-4 text-sm font-medium text-gray-900">Account Actions</h3>
        <p class="mb-6 text-sm text-gray-500">
          Manage your account security and data.
        </p>
      </div>

      <div class="space-y-4">
        <!-- Sign out everywhere card -->
        <div
          class="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-6"
        >
          <div
            class="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0"
          >
            <div class="flex items-start space-x-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50"
              >
                <SignOut class="h-[1em] w-[1em] shrink-0 text-orange-600" />
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-sm font-medium text-orange-900">
                  Sign out everywhere
                </h4>
                <p class="mt-1 text-sm text-orange-700">
                  Sign out from all devices and browser sessions for enhanced
                  security.
                </p>
              </div>
            </div>
            <div class="flex justify-end sm:ml-4 sm:shrink-0">
              <DangerButton
                class="min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-base text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-red-600 hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
                @click="signOutEverywhere"
                ><SignOut class="h-4 w-4" />Sign out</DangerButton
              >
            </div>
          </div>
        </div>

        <!-- Delete account card -->
        <div
          class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm sm:p-6"
        >
          <div
            class="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0"
          >
            <div class="flex items-start space-x-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100"
              >
                <Trash class="h-[1em] w-[1em] shrink-0 text-red-600" />
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-sm font-medium text-red-900">Delete account</h4>
                <p class="mt-1 text-sm text-red-700">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <Message
                  role="alert"
                  v-if="deleteAccountForm.errors.ownership"
                  class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-3"
                >
                  {{ deleteAccountForm.errors.ownership }}
                </Message>
              </div>
            </div>
            <div class="flex justify-end sm:ml-4 sm:shrink-0">
              <DangerButton
                class="min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-base text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-red-600 hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
                @click="confirmDeleteAccount"
                ><Trash class="h-4 w-4" />Delete</DangerButton
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
