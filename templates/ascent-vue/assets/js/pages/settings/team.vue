<script setup>
import { ref, computed, watch } from 'vue'
import { Link, usePage, router, useForm, Head } from '@inertiajs/vue3'
import { useConfirm } from 'primevue/useconfirm'
import Button from '@/volt/Button.vue'
import InputText from '@/volt/InputText.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import Avatar from '@/components/Avatar.vue'
import Message from '@/volt/Message.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: (h, page) =>
    h(DashboardLayout, { maxWidth: 'narrow', title: 'Team' }, () => page)
})
import Dialog from '@/volt/Dialog.vue'
import Menu from '@/volt/Menu.vue'
import Select from '@/volt/Select.vue'
import { useCopyToClipboard } from '@/composables/copyToClipboard'
import ImageUpload from '@/components/ImageUpload.vue'
import Chips from '@/components/Chips.vue'
import DangerButton from '@/volt/DangerButton.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import DangerButton from '@/volt/DangerButton.vue'

const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  memberships: {
    type: Array,
    default: () => []
  },
  userRole: {
    type: String,
    required: true
  },
  pendingInvites: {
    type: Array,
    default: () => []
  }
})

const page = usePage()
const confirm = useConfirm()
const { copied, copyToClipboard } = useCopyToClipboard()

const loggedInUser = computed(() => page.props.loggedInUser)
const isOwnerOrAdmin = computed(
  () => props.userRole === 'owner' || props.userRole === 'admin'
)
const isOwner = computed(() => props.userRole === 'owner')

// Track member actions
const memberActions = ref(new Set())

// Track invitation actions
const inviteActions = ref(new Set())

// Form for editing team name
const teamForm = useForm({
  name: props.team?.name,
  logo: null
})

// Form for toggle invite link
const toggleForm = useForm({
  inviteLinkEnabled: props.team?.inviteLinkEnabled ?? true
})

// Form for domain restrictions
const domainForm = useForm({
  domainRestrictions: []
})

// Track which domains are being removed
const removingDomains = ref(new Set())

// Auto-submit when toggle data changes
watch(
  () => toggleForm.inviteLinkEnabled,
  (newValue, oldValue) => {
    // Only submit if we have a team and the value is different from the initial team value
    if (
      props.team &&
      newValue !== (props.team.inviteLinkEnabled ?? true) &&
      oldValue !== undefined
    ) {
      toggleForm.post(`/teams/${props.team.id}/toggle-invite-link`)
    }
  }
)

const showInviteForm = ref(false)
const showTransferModal = ref(false)

// Form for invite emails
const emailForm = useForm({
  emails: []
})

// Form for transfer ownership
const transferForm = useForm({
  newOwnerEmail: '',
  confirmationText: ''
})

// Create team members list from memberships only (owner has a membership record too)
const teamMembers = computed(() => {
  return (props.memberships || []).map((membership) => ({
    id: membership.member.id,
    name: membership.member.fullName || membership.member.email,
    email: membership.member.email,
    role: membership.role.charAt(0).toUpperCase() + membership.role.slice(1), // Capitalize first letter
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      membership.member.fullName || membership.member.email
    )}&background=10B981&color=fff`
  }))
})

function handleInvite(e) {
  e.preventDefault()
  if (props.team) {
    emailForm.post(`/teams/${props.team.id}/send-email-invite`, {
      preserveScroll: true,
      onSuccess: () => {
        emailForm.reset()
      }
    })
  }
}

function handleToggleInviteLink(value) {
  if (props.team) {
    toggleForm.inviteLinkEnabled = value
  }
}

function resetInviteLink() {
  if (props.team) {
    router.post(`/teams/${props.team.id}/reset-invite-token`)
  }
}

function handleDomainRestrictionsSubmit(e) {
  e.preventDefault()
  if (props.team) {
    domainForm.patch(`/teams/${props.team.id}/domain-restrictions`, {
      preserveScroll: true,
      onSuccess: () => {
        domainForm.domainRestrictions = []
      }
    })
  }
}

function handleRemoveDomain(domain) {
  if (props.team) {
    // Add domain to removing set
    removingDomains.value.add(domain)

    // Use router directly for the DELETE request
    router.delete(`/teams/${props.team.id}/remove-domain-restriction`, {
      data: { domain },
      onFinish: () => {
        // Remove domain from removing set when request completes
        removingDomains.value.delete(domain)
      }
    })
  }
}

function handleRoleChange(member, newRole) {
  memberActions.value.add(`role-${member.id}`)
  router.patch(`/teams/${props.team.id}/members/${member.id}/role`, { newRole })
}

function confirmRemoveMember(member) {
  confirm.require({
    message: `Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`,
    header: 'Remove Team Member',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    rejectProps: { label: 'Cancel' },
    acceptProps: { label: 'Remove' },
    accept: () => {
      memberActions.value.add(`remove-${member.id}`)
      router.delete(`/teams/${props.team.id}/members/${member.id}`)
    }
  })
}

function confirmLeaveTeam() {
  confirm.require({
    message:
      'Are you sure you want to leave this team? You will lose access to all team resources.',
    header: 'Leave Team',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    rejectProps: { label: 'Cancel' },
    acceptProps: { label: 'Leave' },
    accept: () => {
      router.post(`/teams/${props.team.id}/leave`)
    }
  })
}

function handleUpdateTeam(e) {
  e.preventDefault()
  teamForm.patch(`/teams/${props.team.id}`, { preserveScroll: true })
}

function handleTransferOwnership(e) {
  e.preventDefault()
  if (props.team) {
    transferForm.post(`/teams/${props.team.id}/transfer`, {
      onSuccess: () => {
        transferForm.reset()
        showTransferModal.value = false
      }
    })
  }
}

function confirmDeleteTeam() {
  confirm.require({
    message: `Are you sure you want to delete ${props.team.name}? This action cannot be undone and will permanently delete all team data, memberships, and invitations.`,
    header: 'Delete Team',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    rejectProps: { label: 'Cancel' },
    acceptProps: { label: 'Delete' },
    accept: () => {
      router.delete(`/teams/${props.team.id}`)
    }
  })
}

// Helper to build action menu items for a member
function getActionItems(member) {
  const isCurrentUser = member.id === loggedInUser.value.id
  const canManage = isOwnerOrAdmin.value && !isCurrentUser
  const canChangeRole =
    isOwner.value && !isCurrentUser && member.role.toLowerCase() !== 'owner'
  const canRemove = canManage && member.role.toLowerCase() !== 'owner'
  const currentRole = member.role.toLowerCase()

  const actionItems = []

  if (canChangeRole) {
    if (currentRole === 'member') {
      actionItems.push({
        label: 'Make admin',
        icon: 'pi pi-shield',
        command: () => handleRoleChange(member, 'admin')
      })
    } else if (currentRole === 'admin') {
      actionItems.push({
        label: 'Make member',
        icon: 'pi pi-user',
        command: () => handleRoleChange(member, 'member')
      })
    }
  }

  if (canRemove) {
    if (actionItems.length > 0) {
      actionItems.push({ separator: true })
    }
    actionItems.push({
      label: 'Remove member',
      icon: 'pi pi-times',
      class: 'text-red-600',
      command: () => confirmRemoveMember(member)
    })
  }

  return actionItems
}
</script>

<template>
  <Head title="Team Settings | Ascent Vue" />

  <div class="max-w-4xl space-y-8">
    <!-- Invite by Link - Only for owners/admins -->
    <section v-if="isOwnerOrAdmin" class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-900">Invite by link</h3>
          <p class="mt-1 text-sm text-gray-500">
            Allow team members to invite others using a shareable link.
          </p>
        </div>
        <ToggleSwitch
          :model-value="toggleForm.inviteLinkEnabled"
          @update:model-value="handleToggleInviteLink"
          :disabled="toggleForm.processing"
        />
      </header>

      <div v-if="team.inviteLinkEnabled" class="space-y-6">
        <!-- Invite Link -->
        <div>
          <div class="flex items-center space-x-3 space-y-1">
            <InputText
              :model-value="team?.inviteLink || ''"
              readonly
              class="flex-1 text-sm"
            />
            <Button
              :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
              @click="copyToClipboard(team?.inviteLink)"
              size="small"
              :tooltip="copied ? 'Copied!' : 'Copy link'"
              :class="
                copied
                  ? 'text-success-600 hover:text-success-700'
                  : 'text-gray-500 hover:text-gray-700'
              "
              text
            />
          </div>
          <button
            type="button"
            @click="resetInviteLink"
            class="text-brand-600 text-sm hover:underline cursor-pointer"
          >
            Reset invite link
          </button>
        </div>

        <!-- Restrict by Domain -->
        <div class="space-y-3">
          <div>
            <h4 class="text-sm font-medium text-gray-900">
              Restrict by domain
            </h4>
            <p class="text-sm text-gray-500">
              Only allow users with emails at specific domains to join your team
              through the invite link.
            </p>
          </div>
          <form
            @submit="handleDomainRestrictionsSubmit"
            class="flex items-center space-x-3"
          >
            <Chips
              v-model="domainForm.domainRestrictions"
              placeholder="Domains, separated by comma"
              class="flex-1"
              separator=","
            />
            <Button
              type="submit"
              label="Set"
              variant="outlined"
              :loading="domainForm.processing"
              :disabled="
                domainForm.processing ||
                !domainForm.domainRestrictions ||
                domainForm.domainRestrictions.length === 0
              "
            />
          </form>

          <!-- Domain List -->
          <div
            v-if="
              team?.domainRestrictions && team.domainRestrictions.length > 0
            "
            class="mt-4"
          >
            <h5 class="mb-2 text-xs font-medium text-gray-700">
              Restricted Domains
            </h5>
            <div class="space-y-2">
              <div
                v-for="(domain, index) in team.domainRestrictions"
                :key="index"
                class="flex items-center justify-between py-3"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full text-blue-600"
                  >
                    <i class="pi pi-globe" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ domain }}
                    </div>
                    <div class="text-xs text-gray-500">Domain restriction</div>
                  </div>
                </div>
                <Button
                  :icon="
                    removingDomains.has(domain)
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-times'
                  "
                  size="small"
                  text
                  :disabled="removingDomains.has(domain)"
                  class="text-red-600 hover:bg-red-50 hover:text-red-700"
                  @click="handleRemoveDomain(domain)"
                  :tooltip="
                    removingDomains.has(domain)
                      ? 'Removing...'
                      : 'Remove domain restriction'
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Invite by Email - Only for owners/admins -->
    <section v-if="isOwnerOrAdmin" class="space-y-6">
      <header>
        <h3 class="text-sm font-medium text-gray-900">Invite by email</h3>
        <p class="mt-1 text-sm text-gray-500">
          Email invitations are valid for 7 days.
        </p>
      </header>
      <form @submit="handleInvite" class="space-y-4">
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <Chips
              v-model="emailForm.emails"
              placeholder="Enter email addresses and press enter"
              class="flex-1"
              separator=","
            />
            <Button
              type="submit"
              label="Invite"
              variant="outlined"
              :loading="emailForm.processing"
              :disabled="
                emailForm.processing ||
                !emailForm.emails ||
                emailForm.emails.length === 0
              "
            />
          </div>
          <Message v-if="emailForm.errors.emails" severity="error">
            {{ emailForm.errors.emails }}
          </Message>
        </div>
      </form>
    </section>

    <!-- Team Members -->
    <section class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-900">Team Members</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ teamMembers.length }}
            {{ teamMembers.length === 1 ? 'member' : 'members' }}
          </p>
        </div>
        <!-- Leave Team Button - only for non-owners -->
        <DangerButton
          v-if="userRole !== 'owner'"
          label="Leave team"
          icon="pi pi-sign-out"
          size="small"
          variant="outlined"
          @click="confirmLeaveTeam"
        />
      </header>

      <div class="divide-y divide-gray-50">
        <div
          v-for="member in teamMembers"
          :key="member.id"
          class="hover:bg-gray-25 flex items-center justify-between py-3 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <Avatar :image="member.avatar" size="normal" shape="circle" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-2">
                <span class="truncate text-sm font-medium text-gray-900">
                  {{ member.name }}
                </span>
                <span
                  v-if="member.id === loggedInUser.id"
                  class="shrink-0 text-xs text-gray-500"
                >
                  (you)
                </span>
              </div>
              <div class="truncate text-sm text-gray-500">
                {{ member.email }}
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-center space-x-3">
            <!-- Custom Role Badge -->
            <span
              :class="[
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                member.role.toLowerCase() === 'owner'
                  ? 'bg-green-100 text-green-800'
                  : member.role.toLowerCase() === 'admin'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              ]"
            >
              {{ member.role }}
            </span>

            <!-- Action Menu -->
            <div v-if="getActionItems(member).length > 0" class="relative">
              <Button
                icon="pi pi-ellipsis-v"
                size="small"
                text
                class="text-gray-400 hover:text-gray-600"
                @click="(e) => $refs[`menu-${member.id}`][0].toggle(e)"
              />
              <Menu
                :ref="`menu-${member.id}`"
                :model="getActionItems(member)"
                :popup="true"
                class="w-48"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pending Invitations - Only for owners/admins -->
    <section
      v-if="isOwnerOrAdmin && pendingInvites.length > 0"
      class="space-y-6"
    >
      <header>
        <h3 class="text-sm font-medium text-gray-900">Pending Invitations</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ pendingInvites.length }}
          {{ pendingInvites.length === 1 ? 'invitation' : 'invitations' }}
          waiting for response
        </p>
      </header>

      <div class="divide-y divide-gray-50">
        <div
          v-for="invite in pendingInvites"
          :key="invite.id"
          class="hover:bg-gray-25 flex items-center justify-between py-3 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"
            >
              <i class="pi pi-envelope text-sm" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-2">
                <span class="truncate text-sm font-medium text-gray-900">
                  {{ invite.email }}
                </span>
                <span
                  v-if="invite.expiresAt - Date.now() < 24 * 60 * 60 * 1000"
                  class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800"
                >
                  Expires soon
                </span>
              </div>
              <div class="text-sm text-gray-500">
                Invited by
                {{
                  invite.invitedBy?.fullName ||
                  invite.invitedBy?.email ||
                  'Someone'
                }}
                on {{ new Date(invite.createdAt).toLocaleDateString() }}
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-center space-x-2">
            <Button
              label="Resend"
              size="small"
              text
              class="text-blue-600 hover:text-blue-700"
              :loading="inviteActions.has(`resend-${invite.id}`)"
              :disabled="
                inviteActions.has(`resend-${invite.id}`) ||
                inviteActions.has(`cancel-${invite.id}`)
              "
              @click="
                () => {
                  inviteActions.add(`resend-${invite.id}`)
                  router.post(
                    `/teams/${team.id}/invites/${invite.id}/resend`,
                    {},
                    {
                      preserveScroll: true,
                      onFinish: () => {
                        inviteActions.delete(`resend-${invite.id}`)
                      }
                    }
                  )
                }
              "
            />
            <DangerButton
              label="Cancel"
              size="small"
              text
              class="text-red-600 hover:text-red-700"
              :loading="inviteActions.has(`cancel-${invite.id}`)"
              :disabled="
                inviteActions.has(`resend-${invite.id}`) ||
                inviteActions.has(`cancel-${invite.id}`)
              "
              @click="
                () => {
                  confirm.require({
                    message: `Cancel invitation for ${invite.email}?`,
                    header: 'Cancel Invitation',
                    icon: 'pi pi-exclamation-triangle',
                    acceptClass:
                      'bg-red-600 hover:bg-red-700 text-white border-red-600',
                    rejectProps: { label: 'No' },
                    acceptProps: { label: 'Yes, cancel' },
                    accept: () => {
                      inviteActions.add(`cancel-${invite.id}`)
                      router.delete(`/teams/${team.id}/invites/${invite.id}`, {
                        preserveScroll: true,
                        onFinish: () => {
                          inviteActions.delete(`cancel-${invite.id}`)
                        }
                      })
                    }
                  })
                }
              "
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Team Settings - Only for owners - At bottom for dangerous actions -->
    <section v-if="isOwner" class="space-y-6">
      <header>
        <h3 class="text-sm font-medium text-gray-900">Team Settings</h3>
        <p class="mt-1 text-sm text-gray-500">
          Manage your team's basic information and advanced settings.
        </p>
      </header>

      <div class="space-y-6">
        <!-- Edit Team Name and Logo -->
        <form @submit="handleUpdateTeam" class="space-y-4">
          <!-- Team Logo -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Logo
            </label>
            <ImageUpload
              :current-image-url="team?.logoUrl"
              @image-select="(file) => (teamForm.logo = file)"
              placeholder="Choose logo"
            />
            <Message v-if="teamForm.errors.logo" severity="error" class="mt-2">
              {{ teamForm.errors.logo }}
            </Message>
          </div>

          <div>
            <label
              for="teamName"
              class="block text-sm font-medium text-gray-700"
            >
              Team name
            </label>
            <div class="mt-1 flex space-x-3">
              <InputText
                id="teamName"
                v-model="teamForm.name"
                class="flex-1"
                placeholder="Enter team name"
              />
              <Button
                type="submit"
                :label="teamForm.processing ? 'Saving...' : 'Save'"
                size="small"
                :loading="teamForm.processing"
                :disabled="
                  teamForm.processing ||
                  (!teamForm.name?.trim() && !teamForm.logo) ||
                  (teamForm.name === team.name && !teamForm.logo)
                "
              />
            </div>
            <Message v-if="teamForm.errors.name" severity="error" class="mt-2">
              {{ teamForm.errors.name }}
            </Message>
          </div>
        </form>

        <!-- Danger Zone -->
        <div class="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <!-- Transfer Ownership -->
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-red-900">
                Transfer Ownership
              </h4>
              <p class="mt-1 text-sm text-red-600">
                Transfer team ownership to another team member. You will become
                an admin.
              </p>
            </div>
            <DangerButton
              label="Transfer ownership"
              size="small"
              variant="outlined"
              @click="showTransferModal = true"
            />
          </div>

          <!-- Delete Team -->
          <div
            class="flex items-center justify-between border-t border-red-200 pt-4"
          >
            <div>
              <h4 class="text-sm font-medium text-red-900">Delete Team</h4>
              <p class="mt-1 text-sm text-red-600">
                Permanently delete this team and all its data. This action
                cannot be undone.
              </p>
            </div>
            <DangerButton
              label="Delete team"
              size="small"
              variant="outlined"
              @click="confirmDeleteTeam"
            />
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Transfer Ownership Modal -->
  <Dialog
    header="Transfer Team Ownership"
    :visible="showTransferModal"
    @update:visible="
      (value) => {
        showTransferModal = value
        if (!value) transferForm.reset()
      }
    "
    :style="{ width: '32rem' }"
    :modal="true"
  >
    <form @submit="handleTransferOwnership" class="space-y-4">
      <div>
        <label
          for="newOwnerEmail"
          class="mb-2 block text-sm font-medium text-gray-700"
        >
          New Owner Email
        </label>
        <InputText
          id="newOwnerEmail"
          v-model="transferForm.newOwnerEmail"
          placeholder="Enter team member's email"
          class="w-full"
          :invalid="!!transferForm.errors.newOwnerEmail"
        />
        <Message
          v-if="transferForm.errors.newOwnerEmail"
          severity="error"
          class="mt-2"
        >
          {{ transferForm.errors.newOwnerEmail }}
        </Message>
      </div>

      <div>
        <label
          for="confirmationText"
          class="mb-2 block text-sm font-medium text-gray-700"
        >
          Type <strong>transfer {{ team?.name }}</strong> to confirm the
          transfer:
        </label>
        <InputText
          id="confirmationText"
          v-model="transferForm.confirmationText"
          :placeholder="`transfer ${team?.name}`"
          class="w-full"
          :invalid="!!transferForm.errors.confirmationText"
        />
        <Message
          v-if="transferForm.errors.confirmationText"
          severity="error"
          class="mt-2"
        >
          {{ transferForm.errors.confirmationText }}
        </Message>
      </div>

      <div class="rounded-lg border border-red-200 bg-red-50 p-4">
        <div class="flex">
          <div class="shrink-0">
            <i class="pi pi-exclamation-triangle text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Warning: This action cannot be undone
            </h3>
            <p class="mt-2 text-sm text-red-700">
              You will transfer full ownership to the selected team member and
              become an admin. They will be able to manage all team settings,
              including transferring ownership again or deleting the team.
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <SecondaryButton
          type="button"
          variant="outlined"
          @click="
            () => {
              showTransferModal = false
              transferForm.reset()
            }
          "
          :disabled="transferForm.processing"
        >
          Cancel
        </SecondaryButton>
        <DangerButton
          type="submit"
          :loading="transferForm.processing"
          :disabled="
            transferForm.processing ||
            !transferForm.newOwnerEmail.trim() ||
            transferForm.confirmationText.toLowerCase().trim() !==
              `transfer ${team?.name}`.toLowerCase()
          "
        >
          Transfer Ownership
        </DangerButton>
      </div>
    </form>
  </Dialog>
</template>
