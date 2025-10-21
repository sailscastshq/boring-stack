import { useState, useEffect, useRef } from 'react'
import { Link, usePage, router, useForm, Head } from '@inertiajs/react'

import DashboardLayout from '@/layouts/DashboardLayout'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { Chips } from 'primereact/chips'
import { Avatar } from 'primereact/avatar'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { Menu } from 'primereact/menu'
import { Dropdown } from 'primereact/dropdown'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import ImageUpload from '@/components/ImageUpload'

TeamSettings.layout = (page) => (
  <DashboardLayout title="Team" maxWidth="narrow">
    {page}
  </DashboardLayout>
)

export default function TeamSettings({
  team,
  memberships,
  userRole,
  pendingInvites = []
}) {
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
        onSuccess: () => {
          resetEmails()
        }
      })
    }
  }
  function handleToggleInviteLink(e) {
    const newValue = e.value

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
    confirmDialog({
      message: `Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`,
      header: 'Remove Team Member',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setMemberActions((prev) => new Set([...prev, `remove-${member.id}`]))
        router.delete(`/teams/${team.id}/members/${member.id}`)
      }
    })
  }

  function confirmLeaveTeam() {
    confirmDialog({
      message:
        'Are you sure you want to leave this team? You will lose access to all team resources.',
      header: 'Leave Team',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        router.post(`/teams/${team.id}/leave`)
      }
    })
  }

  function handleUpdateTeam(e) {
    e.preventDefault()
    patchTeam(`/teams/${team.id}`, { preserveScroll: true })
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
    confirmDialog({
      message: `Are you sure you want to delete ${team.name}? This action cannot be undone and will permanently delete all team data, memberships, and invitations.`,
      header: 'Delete Team',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        router.delete(`/teams/${team.id}`)
      }
    })
  }

  return (
    <>
      <Head title="Team Settings | Ascent React"></Head>
      <ConfirmDialog style={{ width: '32rem' }} />

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
                checked={toggleData.inviteLinkEnabled}
                onChange={handleToggleInviteLink}
                disabled={processingToggle}
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
                      className="flex-1 text-sm"
                    />
                    <Button
                      icon={copied ? 'pi pi-check' : 'pi pi-copy'}
                      onClick={() => copyToClipboard(team?.inviteLink)}
                      size="small"
                      tooltip={copied ? 'Copied!' : 'Copy link'}
                      className={
                        copied
                          ? 'text-success-600 hover:text-success-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }
                      text
                    />
                  </div>
                  <Button
                    label="Reset invite link"
                    onClick={resetInviteLink}
                    size="small"
                    link
                  />
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
                      onChange={(e) =>
                        setDomainData('domainRestrictions', e.value)
                      }
                      placeholder="Domains, separated by comma"
                      className="flex-1"
                      separator=","
                    />
                    <Button
                      type="submit"
                      label="Set"
                      outlined
                      loading={processingDomains}
                      disabled={
                        processingDomains ||
                        !domainData.domainRestrictions ||
                        domainData.domainRestrictions.length === 0
                      }
                    />
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
                                  <i className="pi pi-globe"></i>
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
                                icon={
                                  removingDomains.has(domain)
                                    ? 'pi pi-spin pi-spinner'
                                    : 'pi pi-times'
                                }
                                size="small"
                                text
                                disabled={removingDomains.has(domain)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleRemoveDomain(domain)}
                                tooltip={
                                  removingDomains.has(domain)
                                    ? 'Removing...'
                                    : 'Remove domain restriction'
                                }
                              />
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
                    onChange={(e) => setEmailData('emails', e.value)}
                    placeholder="Enter email addresses and press enter"
                    className="flex-1"
                    separator=","
                  />
                  <Button
                    type="submit"
                    label="Invite"
                    outlined
                    loading={processingEmails}
                    disabled={
                      processingEmails ||
                      !emailData.emails ||
                      emailData.emails.length === 0
                    }
                  />
                </div>
                {emailErrors.emails && (
                  <Message severity="error" text={emailErrors.emails} />
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
                label="Leave team"
                icon="pi pi-sign-out"
                size="small"
                severity="danger"
                outlined
                onClick={confirmLeaveTeam}
              />
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
              const menuRef = useRef(null)

              // Build action menu items
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
                      image={member.avatar}
                      size="normal"
                      shape="circle"
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
                          icon="pi pi-ellipsis-v"
                          size="small"
                          text
                          className="text-gray-400 hover:text-gray-600"
                          onClick={(e) => menuRef.current?.toggle(e)}
                        />
                        <Menu
                          ref={menuRef}
                          model={actionItems}
                          popup
                          className="w-48"
                        />
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
                        <i className="pi pi-envelope text-sm"></i>
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
                        label="Resend"
                        size="small"
                        text
                        className="text-blue-600 hover:text-blue-700"
                        loading={inviteActions.has(`resend-${invite.id}`)}
                        disabled={
                          inviteActions.has(`resend-${invite.id}`) ||
                          inviteActions.has(`cancel-${invite.id}`)
                        }
                        onClick={() => {
                          setInviteActions(
                            (prev) => new Set([...prev, `resend-${invite.id}`])
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
                      />
                      <Button
                        label="Cancel"
                        size="small"
                        text
                        className="text-red-600 hover:text-red-700"
                        loading={inviteActions.has(`cancel-${invite.id}`)}
                        disabled={
                          inviteActions.has(`resend-${invite.id}`) ||
                          inviteActions.has(`cancel-${invite.id}`)
                        }
                        onClick={() => {
                          confirmDialog({
                            message: `Cancel invitation for ${invite.email}?`,
                            header: 'Cancel Invitation',
                            icon: 'pi pi-exclamation-triangle',
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
                      />
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
                      severity="error"
                      text={teamErrors.logo}
                      className="mt-2"
                    />
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
                      className="flex-1"
                      placeholder="Enter team name"
                    />
                    <Button
                      type="submit"
                      label={processingTeam ? 'Saving...' : 'Save'}
                      size="small"
                      loading={processingTeam}
                      disabled={
                        processingTeam ||
                        (!teamData.name?.trim() && !teamData.logo) ||
                        (teamData.name === team.name && !teamData.logo)
                      }
                    />
                  </div>
                  {teamErrors.name && (
                    <Message
                      severity="error"
                      text={teamErrors.name}
                      className="mt-2"
                    />
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
                    label="Transfer ownership"
                    size="small"
                    severity="danger"
                    outlined
                    onClick={() => setShowTransferModal(true)}
                  />
                </div>

                {/* Delete Team */}
                <div className="flex items-center justify-between border-t border-red-200 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-900">
                      Delete Team
                    </h4>
                    <p className="mt-1 text-sm text-red-600">
                      Permanently delete this team and all its data. This action
                      cannot be undone.
                    </p>
                  </div>
                  <Button
                    label="Delete team"
                    size="small"
                    severity="danger"
                    outlined
                    onClick={confirmDeleteTeam}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Transfer Ownership Modal */}
      <Dialog
        header="Transfer Team Ownership"
        visible={showTransferModal}
        onHide={() => {
          setShowTransferModal(false)
          resetTransfer()
        }}
        style={{ width: '32rem' }}
        modal
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
              onChange={(e) => setTransferData('newOwnerEmail', e.target.value)}
              placeholder="Enter team member's email"
              className="w-full"
              invalid={!!transferErrors.newOwnerEmail}
            />
            {transferErrors.newOwnerEmail && (
              <Message
                severity="error"
                text={transferErrors.newOwnerEmail}
                className="mt-2"
              />
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
              className="w-full"
              invalid={!!transferErrors.confirmationText}
            />
            {transferErrors.confirmationText && (
              <Message
                severity="error"
                text={transferErrors.confirmationText}
                className="mt-2"
              />
            )}
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="pi pi-exclamation-triangle text-red-400" />
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
              outlined
              onClick={() => {
                setShowTransferModal(false)
                resetTransfer()
              }}
              disabled={processingTransfer}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              severity="danger"
              loading={processingTransfer}
              disabled={
                processingTransfer ||
                !transferData.newOwnerEmail.trim() ||
                transferData.confirmationText.toLowerCase().trim() !==
                  `transfer ${team?.name}`.toLowerCase()
              }
            >
              Transfer Ownership
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
