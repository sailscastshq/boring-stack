import X from '@/components/ui/icons/X.jsx'
import Check from '@/components/ui/icons/Check.jsx'
import Copy from '@/components/ui/icons/Copy.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import WarningTriangle from '@/components/ui/icons/WarningTriangle.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
import EllipsisVertical from '@/components/ui/icons/EllipsisVertical.jsx'
import SignOut from '@/components/ui/icons/SignOut.jsx'
import Globe from '@/components/ui/icons/Globe.jsx'
import { useState, useEffect, useRef } from 'react'
import { Link, usePage, router, useForm, Head } from '@inertiajs/react'

import DashboardLayout from '@/layouts/DashboardLayout'

import Button from '@/components/ui/button/Button.jsx'
import InputText from '@/components/ui/input/Input.jsx'
import InputSwitch from '@/components/ui/switch/Switch.jsx'
import Chips from '@/components/ui/tags-input/TagsInput.jsx'
import Avatar from '@/components/ui/avatar/Avatar.jsx'
import Message from '@/components/ui/alert/Alert.jsx'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.jsx'
import Dialog from '@/components/Modal.jsx'
import Menu from '@/components/ui/menu/Menu.jsx'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import ImageUpload from '@/components/ImageUpload'

TeamSettings.layout = [DashboardLayout, { title: 'Team', maxWidth: 'narrow' }]

export default function TeamSettings({
  team,
  memberships,
  userRole,
  pendingInvites = []
}) {
  const confirmation = useConfirmation()

  const { copied, copyToClipboard } = useCopyToClipboard()
  const { loggedInUser } = usePage().props
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  const isOwner = userRole === 'owner'

  // Track member actions
  const [memberActions, setMemberActions] = useState(new Set())

  // Track invitation actions
  const [inviteActions, setInviteActions] = useState(new Set())

  // Form for editing team name
  const {
    data: teamData,
    setData: setTeamData,
    patch: patchTeam,
    processing: processingTeam,
    errors: teamErrors,
    reset: resetTeam
  } = useForm({
    name: team?.name,
    logo: null
  })
  // Form for toggle invite link
  const {
    data: toggleData,
    setData: setToggleData,
    post: postToggle,
    processing: processingToggle
  } = useForm({
    inviteLinkEnabled: team?.inviteLinkEnabled ?? true
  })

  // Form for domain restrictions
  const {
    data: domainData,
    setData: setDomainData,
    patch: patchDomains,
    processing: processingDomains
  } = useForm({
    domainRestrictions: []
  })

  // Track which domains are being removed
  const [removingDomains, setRemovingDomains] = useState(new Set())
  // Auto-submit when toggle data changes
  useEffect(() => {
    // Only submit if we have a team and the value is different from the initial team value
    if (
      team &&
      toggleData.inviteLinkEnabled !== (team.inviteLinkEnabled ?? true)
    ) {
      postToggle(`/teams/${team.id}/toggle-invite-link`)
    }
  }, [toggleData.inviteLinkEnabled])

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)

  // Form for invite emails
  const {
    data: emailData,
    setData: setEmailData,
    post: postEmails,
    processing: processingEmails,
    errors: emailErrors,
    reset: resetEmails
  } = useForm({
    emails: []
  })

  // Form for transfer ownership
  const {
    data: transferData,
    setData: setTransferData,
    post: postTransfer,
    processing: processingTransfer,
    errors: transferErrors,
    reset: resetTransfer
  } = useForm({
    newOwnerEmail: '',
    confirmationText: ''
  })

  // Create team members list from memberships only (owner has a membership record too)
  const teamMembers = (memberships || []).map((membership) => ({
    id: membership.member.id,
    name: membership.member.fullName || membership.member.email,
    email: membership.member.email,
    role: membership.role.charAt(0).toUpperCase() + membership.role.slice(1), // Capitalize first letter
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      membership.member.fullName || membership.member.email
    )}&background=10B981&color=fff`
  }))

  function handleInvite(e) {
    e.preventDefault()
    if (team) {
      postEmails(`/teams/${team.id}/send-email-invite`, {
        preserveScroll: true,
        onSuccess: () => {
          resetEmails()
        }
      })
    }
  }
  function handleToggleInviteLink(e) {
    const newValue = e.target.checked

    if (team) {
      setToggleData('inviteLinkEnabled', newValue)
    }
  }

  function resetInviteLink() {
    if (team) {
      router.post(`/teams/${team.id}/reset-invite-token`)
    }
  }

  function handleDomainRestrictionsSubmit(e) {
    e.preventDefault()
    if (team) {
      patchDomains(`/teams/${team.id}/domain-restrictions`, {
        onSuccess: () => {
          // Clear the chips after successful submission
          setDomainData('domainRestrictions', [])
        }
      })
    }
  }

  function handleRemoveDomain(domain) {
    if (team) {
      // Add domain to removing set
      setRemovingDomains((prev) => new Set([...prev, domain]))

      // Use router directly for the DELETE request
      router.delete(`/teams/${team.id}/remove-domain-restriction`, {
        data: { domain },
        onFinish: () => {
          // Remove domain from removing set when request completes
          setRemovingDomains((prev) => {
            const newSet = new Set(prev)
            newSet.delete(domain)
            return newSet
          })
        }
      })
    }
  }

  function handleRoleChange(member, newRole) {
    setMemberActions((prev) => new Set([...prev, `role-${member.id}`]))
    router.patch(`/teams/${team.id}/members/${member.id}/role`, { newRole })
  }

  function confirmRemoveMember(member) {
    confirmation.request({
      message: `Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`,
      header: 'Remove Team Member',
      acceptClassName:
        'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-white',
      accept: () => {
        setMemberActions((prev) => new Set([...prev, `remove-${member.id}`]))
        router.delete(`/teams/${team.id}/members/${member.id}`)
      }
    })
  }

  function confirmLeaveTeam() {
    confirmation.request({
      message:
        'Are you sure you want to leave this team? You will lose access to all team resources.',
      header: 'Leave Team',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        router.post(`/teams/${team.id}/leave`)
      }
    })
  }

  function handleUpdateTeam(e) {
    e.preventDefault()

    const data = {
      name: teamData.name
    }

    if (teamData.logo instanceof File) {
      data.logo = teamData.logo
    }

    patchTeam(`/teams/${team.id}`, {
      preserveScroll: true,
      data,
      onSuccess: () => {
        resetTeam('logo')
      }
    })
  }

  function handleTransferOwnership(e) {
    e.preventDefault()
    if (team) {
      postTransfer(`/teams/${team.id}/transfer`, {
        onSuccess: () => {
          resetTransfer()
          setShowTransferModal(false)
        }
      })
    }
  }

  function confirmDeleteTeam() {
    confirmation.request({
      message: `Are you sure you want to delete ${team.name}? This action cannot be undone and will permanently delete all team data, memberships, and invitations.`,
      header: 'Delete Team',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        router.delete(`/teams/${team.id}`)
      }
    })
  }

  return (
    <>
      <>
        <Head title="Team Settings | Ascent React"></Head>

        <div className="max-w-4xl space-y-8">
          {/* Invite by Link - Only for owners/admins */}
          {isOwnerOrAdmin && (
            <section className="space-y-6">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Invite by link
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Allow team members to invite others using a shareable link.
                  </p>
                </div>
                <InputSwitch
                  aria-label="Invite by link"
                  checked={toggleData.inviteLinkEnabled}
                  onChange={handleToggleInviteLink}
                  disabled={processingToggle}
                  className={'checked:bg-brand dark:checked:bg-brand'}
                />
              </header>

              {team.inviteLinkEnabled && (
                <div className="space-y-6">
                  {/* Invite Link */}
                  <div>
                    <div className="flex items-center space-x-3 space-y-1">
                      <InputText
                        value={team?.inviteLink || ''}
                        readOnly
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'flex-1 text-sm'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      <Button
                        onClick={() => copyToClipboard(team?.inviteLink)}
                        aria-label={copied ? 'Copied!' : 'Copy link'}
                        title={copied ? 'Copied!' : 'Copy link'}
                        className={[
                          'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                          copied
                            ? 'text-success-600 hover:text-success-700'
                            : 'text-gray-500 hover:text-gray-700'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={resetInviteLink}
                      link
                      className={
                        'min-h-10 min-h-8 border border-brand bg-brand px-2.5 px-3 py-1.5 py-2 text-base text-sm text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700'
                      }
                    >
                      {'Reset invite link'}
                    </Button>
                  </div>

                  {/* Restrict by Domain */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Restrict by domain
                      </h4>
                      <p className="text-sm text-gray-500">
                        Only allow users with emails at specific domains to join
                        your team through the invite link.
                      </p>
                    </div>
                    <form
                      onSubmit={handleDomainRestrictionsSubmit}
                      className="flex items-center space-x-3"
                    >
                      <Chips
                        value={domainData.domainRestrictions}
                        aria-label="Restricted domains"
                        placeholder="Domains, separated by comma"
                        className="flex-1"
                        onChange={(e) => setDomainData('domainRestrictions', e)}
                      />
                      <Button
                        type="submit"
                        disabled={
                          processingDomains ||
                          !domainData.domainRestrictions ||
                          domainData.domainRestrictions.length === 0 ||
                          processingDomains
                        }
                        aria-busy={processingDomains}
                        className={
                          'min-h-10 border border-brand-200 bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                        }
                      >
                        {processingDomains && <Spinner className="h-4 w-4" />}
                        {'Set'}
                      </Button>
                    </form>

                    {/* Domain List */}
                    {team?.domainRestrictions &&
                      team.domainRestrictions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="mb-2 text-xs font-medium text-gray-700">
                            Restricted Domains
                          </h5>
                          <div className="space-y-2">
                            {team.domainRestrictions.map((domain, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-3"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600">
                                    <Globe
                                      className={'h-[1em] w-[1em] shrink-0 '}
                                    ></Globe>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {domain}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Domain restriction
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  disabled={removingDomains.has(domain)}
                                  onClick={() => handleRemoveDomain(domain)}
                                  aria-label={
                                    removingDomains.has(domain)
                                      ? 'Removing...'
                                      : 'Remove domain restriction'
                                  }
                                  title={
                                    removingDomains.has(domain)
                                      ? 'Removing...'
                                      : 'Remove domain restriction'
                                  }
                                  className={[
                                    'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                                    'text-red-600 hover:bg-red-50 hover:text-red-700'
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                >
                                  {removingDomains.has(domain) ? (
                                    <Spinner className="h-4 w-4" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Invite by Email - Only for owners/admins */}
          {isOwnerOrAdmin && (
            <section className="space-y-6">
              <header>
                <h3 className="text-sm font-medium text-gray-900">
                  Invite by email
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Email invitations are valid for 7 days.
                </p>
              </header>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Chips
                      value={emailData.emails}
                      aria-label="Invitation emails"
                      placeholder="Enter email addresses and press enter"
                      className="flex-1"
                      onChange={(e) => setEmailData('emails', e)}
                    />
                    <Button
                      type="submit"
                      disabled={
                        processingEmails ||
                        !emailData.emails ||
                        emailData.emails.length === 0 ||
                        processingEmails
                      }
                      aria-busy={processingEmails}
                      className={
                        'min-h-10 border border-brand-200 bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                      }
                    >
                      {processingEmails && <Spinner className="h-4 w-4" />}
                      {'Invite'}
                    </Button>
                  </div>
                  {emailErrors.emails && (
                    <Message
                      role={'alert'}
                      className={
                        'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
                      }
                    >
                      {emailErrors.emails}
                    </Message>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* Team Members */}
          <section className="space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Team Members
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {teamMembers.length}{' '}
                  {teamMembers.length === 1 ? 'member' : 'members'}
                </p>
              </div>
              {/* Leave Team Button - only for non-owners */}
              {userRole !== 'owner' && (
                <Button
                  onClick={confirmLeaveTeam}
                  className={
                    'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                  }
                >
                  <SignOut className="h-4 w-4" />
                  {'Leave team'}
                </Button>
              )}
            </header>

            <div className="divide-y divide-gray-50">
              {teamMembers.map((member) => {
                const isCurrentUser = member.id === loggedInUser.id
                const canManage = isOwnerOrAdmin && !isCurrentUser
                const canChangeRole =
                  isOwner &&
                  !isCurrentUser &&
                  member.role.toLowerCase() !== 'owner'
                const canRemove =
                  canManage && member.role.toLowerCase() !== 'owner'
                const currentRole = member.role.toLowerCase()

                // Create a ref for this member's menu

                // Build action menu items
                const actionItems = []

                if (canChangeRole) {
                  if (currentRole === 'member') {
                    actionItems.push({
                      label: 'Make admin',
                      command: () => handleRoleChange(member, 'admin')
                    })
                  } else if (currentRole === 'admin') {
                    actionItems.push({
                      label: 'Make member',
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
                    className: 'text-red-600',
                    command: () => confirmRemoveMember(member)
                  })
                }

                return (
                  <div
                    key={member.id}
                    className="hover:bg-gray-25 flex items-center justify-between py-3 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={member.avatar}
                        alt={''}
                        className={'size-8 rounded-full'}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {member.name}
                          </span>
                          {isCurrentUser && (
                            <span className="flex-shrink-0 text-xs text-gray-500">
                              (you)
                            </span>
                          )}
                        </div>
                        <div className="truncate text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center space-x-3">
                      {/* Custom Role Badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.role.toLowerCase() === 'owner'
                            ? 'bg-green-100 text-green-800'
                            : member.role.toLowerCase() === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.role}
                      </span>

                      {/* Action Menu */}
                      {actionItems.length > 0 && (
                        <div className="relative">
                          <Button
                            popoverTarget={`member-${member.id}-menu`}
                            aria-label={`Actions for ${member.name}`}
                            className={[
                              'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                              'text-gray-400 hover:text-gray-600'
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                          <Menu
                            id={`member-${member.id}-menu`}
                            className="w-48"
                            aria-label={`Actions for ${member.name}`}
                          >
                            {actionItems.map((action, index) =>
                              action.separator ? (
                                <hr
                                  key={index}
                                  className="my-1 border-gray-200 dark:border-gray-700"
                                />
                              ) : (
                                <button
                                  key={action.label}
                                  type="button"
                                  role="menuitem"
                                  className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                    action.className || ''
                                  }`}
                                  onClick={action.command}
                                >
                                  {action.label}
                                </button>
                              )
                            )}
                          </Menu>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Pending Invitations - Only for owners/admins */}
          {isOwnerOrAdmin && pendingInvites.length > 0 && (
            <section className="space-y-6">
              <header>
                <h3 className="text-sm font-medium text-gray-900">
                  Pending Invitations
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {pendingInvites.length}{' '}
                  {pendingInvites.length === 1 ? 'invitation' : 'invitations'}{' '}
                  waiting for response
                </p>
              </header>

              <div className="divide-y divide-gray-50">
                {pendingInvites.map((invite) => {
                  const isExpiring =
                    invite.expiresAt - Date.now() < 24 * 60 * 60 * 1000 // expires in less than 24 hours
                  const inviterName =
                    invite.invitedBy?.fullName ||
                    invite.invitedBy?.email ||
                    'Someone'
                  const inviteDate = new Date(
                    invite.createdAt
                  ).toLocaleDateString()

                  return (
                    <div
                      key={invite.id}
                      className="hover:bg-gray-25 flex items-center justify-between py-3 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Envelope
                            className={'h-[1em] w-[1em] shrink-0 text-sm'}
                          ></Envelope>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="truncate text-sm font-medium text-gray-900">
                              {invite.email}
                            </span>
                            {isExpiring && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                                Expires soon
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Invited by {inviterName} on {inviteDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center space-x-2">
                        <Button
                          onClick={() => {
                            setInviteActions(
                              (prev) =>
                                new Set([...prev, `resend-${invite.id}`])
                            )
                            router.post(
                              `/teams/${team.id}/invites/${invite.id}/resend`,
                              {},
                              {
                                preserveScroll: true,
                                onFinish: () => {
                                  setInviteActions((prev) => {
                                    const newSet = new Set(prev)
                                    newSet.delete(`resend-${invite.id}`)
                                    return newSet
                                  })
                                }
                              }
                            )
                          }}
                          disabled={
                            inviteActions.has(`resend-${invite.id}`) ||
                            inviteActions.has(`cancel-${invite.id}`) ||
                            inviteActions.has(`resend-${invite.id}`)
                          }
                          aria-busy={inviteActions.has(`resend-${invite.id}`)}
                          className={[
                            'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                            'text-blue-600 hover:text-blue-700'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {inviteActions.has(`resend-${invite.id}`) && (
                            <Spinner className="h-4 w-4" />
                          )}
                          {'Resend'}
                        </Button>
                        <Button
                          onClick={() => {
                            confirmation.request({
                              message: `Cancel invitation for ${invite.email}?`,
                              header: 'Cancel Invitation',
                              acceptClassName:
                                'bg-red-600 hover:bg-red-700 text-white border-red-600',
                              accept: () => {
                                setInviteActions(
                                  (prev) =>
                                    new Set([...prev, `cancel-${invite.id}`])
                                )
                                router.delete(
                                  `/teams/${team.id}/invites/${invite.id}`,
                                  {
                                    preserveScroll: true,
                                    onFinish: () => {
                                      setInviteActions((prev) => {
                                        const newSet = new Set(prev)
                                        newSet.delete(`cancel-${invite.id}`)
                                        return newSet
                                      })
                                    }
                                  }
                                )
                              }
                            })
                          }}
                          disabled={
                            inviteActions.has(`resend-${invite.id}`) ||
                            inviteActions.has(`cancel-${invite.id}`) ||
                            inviteActions.has(`cancel-${invite.id}`)
                          }
                          aria-busy={inviteActions.has(`cancel-${invite.id}`)}
                          className={[
                            'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                            'text-red-600 hover:text-red-700'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {inviteActions.has(`cancel-${invite.id}`) && (
                            <Spinner className="h-4 w-4" />
                          )}
                          {'Cancel'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Team Settings - Only for owners - At bottom for dangerous actions */}
          {isOwner && (
            <section className="space-y-6">
              <header>
                <h3 className="text-sm font-medium text-gray-900">
                  Team Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your team's basic information and advanced settings.
                </p>
              </header>

              <div className="space-y-6">
                {/* Edit Team Name and Logo */}
                <form onSubmit={handleUpdateTeam} className="space-y-4">
                  {/* Team Logo */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Logo
                    </label>
                    <ImageUpload
                      currentImageUrl={team?.logoUrl}
                      onImageSelect={(file) => setTeamData('logo', file)}
                      placeholder="Choose logo"
                    />
                    {teamErrors.logo && (
                      <Message
                        role={'alert'}
                        className={[
                          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                          'mt-2'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {teamErrors.logo}
                      </Message>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="teamName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Team name
                    </label>
                    <div className="mt-1 flex space-x-3">
                      <InputText
                        id="teamName"
                        value={teamData.name}
                        onChange={(e) => setTeamData('name', e.target.value)}
                        placeholder="Enter team name"
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'flex-1'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      <Button
                        type="submit"
                        disabled={
                          processingTeam ||
                          (!teamData.name?.trim() && !teamData.logo) ||
                          (teamData.name === team.name && !teamData.logo) ||
                          processingTeam
                        }
                        aria-busy={processingTeam}
                        className={
                          'min-h-10 min-h-8 border border-brand bg-brand px-2.5 px-3 py-1.5 py-2 text-base text-sm text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700'
                        }
                      >
                        {processingTeam && <Spinner className="h-4 w-4" />}
                        {processingTeam ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                    {teamErrors.name && (
                      <Message
                        role={'alert'}
                        className={[
                          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                          'mt-2'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {teamErrors.name}
                      </Message>
                    )}
                  </div>
                </form>

                {/* Danger Zone */}
                <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  {/* Transfer Ownership */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">
                        Transfer Ownership
                      </h4>
                      <p className="mt-1 text-sm text-red-600">
                        Transfer team ownership to another team member. You will
                        become an admin.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowTransferModal(true)}
                      className={
                        'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                      }
                    >
                      {'Transfer ownership'}
                    </Button>
                  </div>

                  {/* Delete Team */}
                  <div className="flex items-center justify-between border-t border-red-200 pt-4">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">
                        Delete Team
                      </h4>
                      <p className="mt-1 text-sm text-red-600">
                        Permanently delete this team and all its data. This
                        action cannot be undone.
                      </p>
                    </div>
                    <Button
                      onClick={confirmDeleteTeam}
                      className={
                        'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                      }
                    >
                      {'Delete team'}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Transfer Ownership Modal */}
        <Dialog
          className="max-w-lg"
          open={showTransferModal}
          title={'Transfer Team Ownership'}
          onClose={() => {
            setShowTransferModal(false)
            resetTransfer()
          }}
        >
          <form onSubmit={handleTransferOwnership} className="space-y-4">
            <div>
              <label
                htmlFor="newOwnerEmail"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Owner Email
              </label>
              <InputText
                id="newOwnerEmail"
                value={transferData.newOwnerEmail}
                onChange={(e) =>
                  setTransferData('newOwnerEmail', e.target.value)
                }
                placeholder="Enter team member's email"
                aria-invalid={!!transferErrors.newOwnerEmail}
                className={[
                  'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                  'w-full'
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              {transferErrors.newOwnerEmail && (
                <Message
                  role={'alert'}
                  className={[
                    'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                    'mt-2'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {transferErrors.newOwnerEmail}
                </Message>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmationText"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Type <strong>transfer {team?.name}</strong> to confirm the
                transfer:
              </label>
              <InputText
                id="confirmationText"
                value={transferData.confirmationText}
                onChange={(e) =>
                  setTransferData('confirmationText', e.target.value)
                }
                placeholder={`transfer ${team?.name}`}
                aria-invalid={!!transferErrors.confirmationText}
                className={[
                  'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                  'w-full'
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              {transferErrors.confirmationText && (
                <Message
                  role={'alert'}
                  className={[
                    'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                    'mt-2'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {transferErrors.confirmationText}
                </Message>
              )}
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <WarningTriangle
                    className={'h-[1em] w-[1em] shrink-0 text-red-400'}
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: This action cannot be undone
                  </h3>
                  <p className="mt-2 text-sm text-red-700">
                    You will transfer full ownership to the selected team member
                    and become an admin. They will be able to manage all team
                    settings, including transferring ownership again or deleting
                    the team.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setShowTransferModal(false)
                  resetTransfer()
                }}
                disabled={processingTransfer}
                className={
                  'min-h-10 border border-brand-200 bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  processingTransfer ||
                  !transferData.newOwnerEmail.trim() ||
                  transferData.confirmationText.toLowerCase().trim() !==
                    `transfer ${team?.name}`.toLowerCase() ||
                  processingTransfer
                }
                aria-busy={processingTransfer}
                className={
                  'min-h-10 border border-red-600 bg-red-600 px-3 py-2 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700'
                }
              >
                {processingTransfer && <Spinner className="h-4 w-4" />}
                Transfer Ownership
              </Button>
            </div>
          </form>
        </Dialog>
      </>
      <ConfirmationDialog state={confirmation} />
    </>
  )
}
