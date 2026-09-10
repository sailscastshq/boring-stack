<script setup>
import X from '@/components/ui/icons/X.vue'
import WarningTriangle from '@/components/ui/icons/WarningTriangle.vue'
import User from '@/components/ui/icons/User.vue'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.vue'
import Globe from '@/components/ui/icons/Globe.vue'
import Envelope from '@/components/ui/icons/Envelope.vue'
import Copy from '@/components/ui/icons/Copy.vue'
import Check from '@/components/ui/icons/Check.vue'
import EllipsisVertical from '@/components/ui/icons/EllipsisVertical.vue'
import SignOut from '@/components/ui/icons/SignOut.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { ref, computed, watch } from 'vue'
import { Link, usePage, router, useForm, Head } from '@inertiajs/vue3'
import { useConfirmation } from '@/composables/confirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import Button from '@/components/ui/button/Button.vue'
import InputText from '@/components/ui/input/Input.vue'
import ToggleSwitch from '@/components/ui/switch/Switch.vue'
import Avatar from '@/components/Avatar.vue'
import Message from '@/components/ui/alert/Alert.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: (h, page) =>
    h(DashboardLayout, { maxWidth: 'narrow', title: 'Team' }, () => page)
})
import Dialog from '@/components/Modal.vue'
import Menu from '@/components/ui/menu/Menu.vue'
import { useCopyToClipboard } from '@/composables/copyToClipboard'
import ImageUpload from '@/components/ImageUpload.vue'
import Chips from '@/components/ui/tags-input/TagsInput.vue'
import DangerButton from '@/components/ui/button/Button.vue'
import SecondaryButton from '@/components/ui/button/Button.vue'

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
const confirmation = useConfirmation()
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
  confirmation.request({
    message: `Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`,
    header: 'Remove Team Member',
    icon: WarningTriangle,
    acceptClass:
      'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-white',
    rejectProps: { label: 'Cancel' },
    acceptProps: { label: 'Remove' },
    accept: () => {
      memberActions.value.add(`remove-${member.id}`)
      router.delete(`/teams/${props.team.id}/members/${member.id}`)
    }
  })
}

function confirmLeaveTeam() {
  confirmation.request({
    message:
      'Are you sure you want to leave this team? You will lose access to all team resources.',
    header: 'Leave Team',
    icon: WarningTriangle,
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

  const data = {
    name: teamForm.name
  }

  if (teamForm.logo instanceof File) {
    data.logo = teamForm.logo
  }

  teamForm
    .transform(() => data)
    .patch(`/teams/${props.team.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        teamForm.reset('logo')
      }
    })
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
  confirmation.request({
    message: `Are you sure you want to delete ${props.team.name}? This action cannot be undone and will permanently delete all team data, memberships, and invitations.`,
    header: 'Delete Team',
    icon: WarningTriangle,
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
        icon: ShieldCheck,
        command: () => handleRoleChange(member, 'admin')
      })
    } else if (currentRole === 'admin') {
      actionItems.push({
        label: 'Make member',
        icon: User,
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
      icon: X,
      class: 'text-red-600',
      command: () => confirmRemoveMember(member)
    })
  }

  return actionItems
}
</script>

<template>
  <ConfirmationDialog :state="confirmation" />
  <Head title="Team Settings | Ascent Vue" />

  <div class="max-w-4xl space-y-8">
    <!-- Invite by Link - Only for owners/admins -->
    <section v-if="isOwnerOrAdmin" class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Invite by link
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Allow team members to invite others using a shareable link.
          </p>
        </div>
        <ToggleSwitch
          aria-label="Invite by link"
          class="checked:bg-brand dark:checked:bg-brand"
          :model-value="toggleForm.inviteLinkEnabled"
          @update:model-value="handleToggleInviteLink"
          :disabled="toggleForm.processing"
        />
      </header>

      <div v-if="team.inviteLinkEnabled" class="space-y-6">
        <!-- Invite Link -->
        <div>
          <div class="flex items-center space-y-1 space-x-3">
            <InputText
              :model-value="team?.inviteLink || ''"
              readonly
              class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand flex-1 text-sm"
            />
            <Button
              class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm"
              :aria-label="copied ? 'Copied!' : 'Copy link'"
              @click="copyToClipboard(team?.inviteLink)"
              :title="copied ? 'Copied!' : 'Copy link'"
              :class="
                copied
                  ? 'text-success-600 hover:text-success-700 dark:text-success-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              "
              ><component :is="copied ? Check : Copy" class="h-4 w-4"
            /></Button>
          </div>
          <button
            type="button"
            @click="resetInviteLink"
            class="text-brand-600 cursor-pointer text-sm hover:underline dark:text-brand-300"
          >
            Reset invite link
          </button>
        </div>

        <!-- Restrict by Domain -->
        <div class="space-y-3">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
              Restrict by domain
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
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
              aria-label="Restricted domains"
              placeholder="Domains, separated by comma"
              class="flex-1"
            />
            <Button
              class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 bg-transparent text-brand dark:bg-transparent dark:text-brand-400"
              :disabled="
                domainForm.processing ||
                !domainForm.domainRestrictions ||
                domainForm.domainRestrictions.length === 0 ||
                domainForm.processing
              "
              :aria-busy="domainForm.processing"
              type="submit"
              ><Spinner
                v-if="domainForm.processing"
                class="h-4 w-4"
              />Set</Button
            >
          </form>

          <!-- Domain List -->
          <div
            v-if="
              team?.domainRestrictions && team.domainRestrictions.length > 0
            "
            class="mt-4"
          >
            <h5
              class="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
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
                    class="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 dark:text-blue-300"
                  >
                    <Globe class="h-[1em] w-[1em] shrink-0" />
                  </div>
                  <div>
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {{ domain }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Domain restriction
                    </div>
                  </div>
                </div>
                <Button
                  :aria-label="
                    removingDomains.has(domain)
                      ? 'Removing...'
                      : 'Remove domain restriction'
                  "
                  :disabled="removingDomains.has(domain)"
                  class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300"
                  @click="handleRemoveDomain(domain)"
                  :title="
                    removingDomains.has(domain)
                      ? 'Removing...'
                      : 'Remove domain restriction'
                  "
                  ><Spinner
                    v-if="removingDomains.has(domain)"
                    class="h-4 w-4" /><X v-else class="h-4 w-4"
                /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Invite by Email - Only for owners/admins -->
    <section v-if="isOwnerOrAdmin" class="space-y-6">
      <header>
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          Invite by email
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Email invitations are valid for 7 days.
        </p>
      </header>
      <form @submit="handleInvite" class="space-y-4">
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <Chips
              v-model="emailForm.emails"
              aria-label="Invitation emails"
              placeholder="Enter email addresses and press enter"
              class="flex-1"
            />
            <Button
              class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 bg-transparent text-brand dark:bg-transparent dark:text-brand-400"
              :disabled="
                emailForm.processing ||
                !emailForm.emails ||
                emailForm.emails.length === 0 ||
                emailForm.processing
              "
              :aria-busy="emailForm.processing"
              type="submit"
              ><Spinner
                v-if="emailForm.processing"
                class="h-4 w-4"
              />Invite</Button
            >
          </div>
          <Message
            role="alert"
            class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            v-if="emailForm.errors.emails"
          >
            {{ emailForm.errors.emails }}
          </Message>
        </div>
      </form>
    </section>

    <!-- Team Members -->
    <section class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Team Members
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ teamMembers.length }}
            {{ teamMembers.length === 1 ? 'member' : 'members' }}
          </p>
        </div>
        <!-- Leave Team Button - only for non-owners -->
        <DangerButton
          class="min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-base text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-red-600 hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
          v-if="userRole !== 'owner'"
          @click="confirmLeaveTeam"
          ><SignOut class="h-4 w-4" />Leave team</DangerButton
        >
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
                <span
                  class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ member.name }}
                </span>
                <span
                  v-if="member.id === loggedInUser.id"
                  class="shrink-0 text-xs text-gray-500 dark:text-gray-400"
                >
                  (you)
                </span>
              </div>
              <div class="truncate text-sm text-gray-500 dark:text-gray-400">
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
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                  : member.role.toLowerCase() === 'admin'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              ]"
            >
              {{ member.role }}
            </span>

            <!-- Action Menu -->
            <div v-if="getActionItems(member).length > 0" class="relative">
              <Button
                class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm text-gray-400 hover:text-gray-600"
                :popovertarget="`menu-${member.id}`"
                :aria-label="`Actions for ${member.name}`"
                ><EllipsisVertical class="h-4 w-4"
              /></Button>
              <Menu
                :id="`menu-${member.id}`"
                class="w-48"
                :aria-label="`Actions for ${member.name}`"
              >
                <template
                  v-for="(action, index) in getActionItems(member)"
                  :key="index"
                >
                  <hr
                    v-if="action.separator"
                    class="my-1 border-gray-200 dark:border-gray-700"
                  />
                  <button
                    v-else
                    type="button"
                    role="menuitem"
                    class="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    @click="action.command"
                  >
                    {{ action.label }}
                  </button>
                </template>
              </Menu>
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
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          Pending Invitations
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
              class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
            >
              <Envelope class="h-[1em] w-[1em] shrink-0 text-sm" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-2">
                <span
                  class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ invite.email }}
                </span>
                <span
                  v-if="invite.expiresAt - Date.now() < 24 * 60 * 60 * 1000"
                  class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                >
                  Expires soon
                </span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
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
              :disabled="
                inviteActions.has(`resend-${invite.id}`) ||
                inviteActions.has(`cancel-${invite.id}`) ||
                inviteActions.has(`resend-${invite.id}`)
              "
              :aria-busy="inviteActions.has(`resend-${invite.id}`)"
              class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-300"
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
              ><Spinner
                v-if="inviteActions.has(`resend-${invite.id}`)"
                class="h-4 w-4"
              />Resend</Button
            >
            <DangerButton
              :disabled="
                inviteActions.has(`resend-${invite.id}`) ||
                inviteActions.has(`cancel-${invite.id}`) ||
                inviteActions.has(`cancel-${invite.id}`)
              "
              :aria-busy="inviteActions.has(`cancel-${invite.id}`)"
              class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-300"
              @click="
                () => {
                  confirmation.request({
                    message: `Cancel invitation for ${invite.email}?`,
                    header: 'Cancel Invitation',
                    icon: WarningTriangle,
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
              ><Spinner
                v-if="inviteActions.has(`cancel-${invite.id}`)"
                class="h-4 w-4"
              />Cancel</DangerButton
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Team Settings - Only for owners - At bottom for dangerous actions -->
    <section v-if="isOwner" class="space-y-6">
      <header>
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          Team Settings
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your team's basic information and advanced settings.
        </p>
      </header>

      <div class="space-y-6">
        <!-- Edit Team Name and Logo -->
        <form @submit="handleUpdateTeam" class="space-y-4">
          <!-- Team Logo -->
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Logo
            </label>
            <ImageUpload
              :current-image-url="team?.logoUrl"
              @image-select="(file) => (teamForm.logo = file)"
              placeholder="Choose logo"
            />
            <Message
              role="alert"
              v-if="teamForm.errors.logo"
              class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
            >
              {{ teamForm.errors.logo }}
            </Message>
          </div>

          <div>
            <label
              for="teamName"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Team name
            </label>
            <div class="mt-1 flex space-x-3">
              <InputText
                id="teamName"
                v-model="teamForm.name"
                class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand flex-1"
                placeholder="Enter team name"
              />
              <Button
                class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm"
                :disabled="
                  teamForm.processing ||
                  (!teamForm.name?.trim() && !teamForm.logo) ||
                  (teamForm.name === team.name && !teamForm.logo) ||
                  teamForm.processing
                "
                :aria-busy="teamForm.processing"
                type="submit"
                ><Spinner v-if="teamForm.processing" class="h-4 w-4" />{{
                  teamForm.processing ? 'Saving...' : 'Save'
                }}</Button
              >
            </div>
            <Message
              role="alert"
              v-if="teamForm.errors.name"
              class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
            >
              {{ teamForm.errors.name }}
            </Message>
          </div>
        </form>

        <!-- Danger Zone -->
        <div
          class="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/40 dark:border-red-900"
        >
          <!-- Transfer Ownership -->
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-red-900 dark:text-red-300">
                Transfer Ownership
              </h4>
              <p class="mt-1 text-sm text-red-600 dark:text-red-300">
                Transfer team ownership to another team member. You will become
                an admin.
              </p>
            </div>
            <DangerButton
              class="min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-base text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-red-600 hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
              @click="showTransferModal = true"
              >Transfer ownership</DangerButton
            >
          </div>

          <!-- Delete Team -->
          <div
            class="flex items-center justify-between border-t border-red-200 pt-4 dark:border-red-900"
          >
            <div>
              <h4 class="text-sm font-medium text-red-900 dark:text-red-300">
                Delete Team
              </h4>
              <p class="mt-1 text-sm text-red-600 dark:text-red-300">
                Permanently delete this team and all its data. This action
                cannot be undone.
              </p>
            </div>
            <DangerButton
              class="min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-base text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-red-600 hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
              @click="confirmDeleteTeam"
              >Delete team</DangerButton
            >
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Transfer Ownership Modal -->
  <Dialog
    title="Transfer Team Ownership"
    :open="showTransferModal"
    @update:open="
      (value) => {
        showTransferModal = value
        if (!value) transferForm.reset()
      }
    "
    class="max-w-lg"
  >
    <form @submit="handleTransferOwnership" class="space-y-4">
      <div>
        <label
          for="newOwnerEmail"
          class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          New Owner Email
        </label>
        <InputText
          id="newOwnerEmail"
          v-model="transferForm.newOwnerEmail"
          placeholder="Enter team member's email"
          class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand w-full"
          :aria-invalid="!!transferForm.errors.newOwnerEmail"
        />
        <Message
          role="alert"
          v-if="transferForm.errors.newOwnerEmail"
          class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
        >
          {{ transferForm.errors.newOwnerEmail }}
        </Message>
      </div>

      <div>
        <label
          for="confirmationText"
          class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Type <strong>transfer {{ team?.name }}</strong> to confirm the
          transfer:
        </label>
        <InputText
          id="confirmationText"
          v-model="transferForm.confirmationText"
          :placeholder="`transfer ${team?.name}`"
          class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand w-full"
          :aria-invalid="!!transferForm.errors.confirmationText"
        />
        <Message
          role="alert"
          v-if="transferForm.errors.confirmationText"
          class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-2"
        >
          {{ transferForm.errors.confirmationText }}
        </Message>
      </div>

      <div
        class="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/40 dark:border-red-900"
      >
        <div class="flex">
          <div class="shrink-0">
            <WarningTriangle class="h-[1em] w-[1em] shrink-0 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
              Warning: This action cannot be undone
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-300">
              You will transfer full ownership to the selected team member and
              become an admin. They will be able to manage all team settings,
              including transferring ownership again or deleting the team.
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <SecondaryButton
          class="min-h-10 border border-gray-300 bg-white px-3 py-2 text-base text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 bg-transparent text-brand dark:bg-transparent dark:text-brand-400"
          type="button"
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
          class="min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-base text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
          :disabled="
            transferForm.processing ||
            !transferForm.newOwnerEmail.trim() ||
            transferForm.confirmationText.toLowerCase().trim() !==
              `transfer ${team?.name}`.toLowerCase() ||
            transferForm.processing
          "
          :aria-busy="transferForm.processing"
          type="submit"
          ><Spinner v-if="transferForm.processing" class="h-4 w-4" />
          Transfer Ownership
        </DangerButton>
      </div>
    </form>
  </Dialog>
</template>
