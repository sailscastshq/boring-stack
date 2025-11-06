<script setup>
import { computed } from 'vue'
import { Head, usePage, useForm, router } from '@inertiajs/vue3'
import { useConfirm } from 'primevue/useconfirm'
import InputText from '@/volt/InputText.vue'
import Button from '@/volt/Button.vue'
import Avatar from '@/components/Avatar.vue'
import Message from '@/volt/Message.vue'
import ConfirmDialog from '@/volt/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DangerButton from '@/volt/DangerButton.vue'

defineOptions({
  layout: (h, page) =>
    h(DashboardLayout, { maxWidth: 'narrow', title: 'Profile' }, () => page)
})

const page = usePage()
const confirm = useConfirm()

const loggedInUser = computed(() => page.props.loggedInUser)

const form = useForm({
  email: loggedInUser.value.email,
  fullName: loggedInUser.value.fullName,
  avatar: null
})

const deleteAccountForm = useForm({
  password: undefined
})

function updateProfile(e) {
  e.preventDefault()
  form.patch('/settings/profile', {
    preserveScroll: true,
    preserveState: true,
    onError: (errors) => {
      console.error('Update failed:', errors)
    }
  })
}

function confirmDeleteAccount() {
  confirm.require({
    message:
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
    header: 'Delete Account',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
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
  <Head title="Profile Settings | Ascent Vue" />
  <ConfirmDialog :style="{ width: '32rem' }" />

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
            v-if="form.errors.avatar"
            severity="error"
            :text="form.errors.avatar"
            class="mt-2"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="fullName" class="mb-1 block text-sm text-gray-700">
              Full Name
            </label>
            <InputText id="fullName" v-model="form.fullName" class="w-full" />
          </div>

          <div>
            <label for="email" class="mb-1 block text-sm text-gray-700">
              Email Address
            </label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3">
          <span v-if="form.recentlySuccessful" class="text-sm text-green-600">
            Saved
          </span>
          <Button
            type="submit"
            :label="form.processing ? 'Saving changes...' : 'Save changes'"
            :loading="form.processing"
            size="small"
            variant="outlined"
          />
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
                <i class="pi pi-sign-out text-orange-600" />
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
                label="Sign out"
                @click="signOutEverywhere"
                size="small"
                variant="outlined"
                severity="warning"
                icon="pi pi-sign-out"
              />
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
                <i class="pi pi-trash text-red-600" />
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-sm font-medium text-red-900">Delete account</h4>
                <p class="mt-1 text-sm text-red-700">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
            </div>
            <div class="flex justify-end sm:ml-4 sm:shrink-0">
              <DangerButton
                label="Delete"
                @click="confirmDeleteAccount"
                size="small"
                icon="pi pi-trash"
                variant="outlined"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
