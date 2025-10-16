import { useState, useEffect } from 'react'
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
import { Menu } from 'primereact/menu'
import { Dropdown } from 'primereact/dropdown'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

TeamSettings.layout = (page) => (
  <DashboardLayout title="Team" maxWidth="narrow">
    {page}
  </DashboardLayout>
)

export default function TeamSettings({ team, memberships, userRole }) {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const { loggedInUser } = usePage().props
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  const isOwner = userRole === 'owner'

  // Track member actions
  const [memberActions, setMemberActions] = useState(new Set())
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
      acceptClassName: 'p-button-danger',
      accept: () => {
        router.post(`/teams/${team.id}/leave`)
      }
    })
  }

  return (
    <>
      <Head title="Team Settings | Ascent React"></Head>
      <ConfirmDialog />

      <div className="max-w-4xl space-y-8">
        {/* Invite by Link - Only for owners/admins */}
        {isOwnerOrAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
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
            </div>

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
          </div>
        )}

        {/* Invite by Email - Only for owners/admins */}
        {isOwnerOrAdmin && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Invite by email
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Email invitations are valid for 7 days.
              </p>
            </div>
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
          </div>
        )}

        {/* Team Members */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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
                severity="secondary"
                outlined
                onClick={confirmLeaveTeam}
              />
            )}
          </div>

          <div className="space-y-2">
            {teamMembers.map((member) => {
              const isCurrentUser = member.id === loggedInUser.id
              const canManage = isOwnerOrAdmin && !isCurrentUser
              const canChangeRole =
                isOwner &&
                !isCurrentUser &&
                member.role.toLowerCase() !== 'owner'
              const canRemove =
                canManage && member.role.toLowerCase() !== 'owner'

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar image={member.avatar} size="large" shape="circle" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-gray-500">(you)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Role Management */}
                    {canChangeRole ? (
                      <Dropdown
                        value={member.role.toLowerCase()}
                        options={[
                          { label: 'Member', value: 'member' },
                          { label: 'Admin', value: 'admin' }
                        ]}
                        onChange={(e) => handleRoleChange(member, e.value)}
                        className="w-28"
                        size="small"
                        disabled={memberActions.has(`role-${member.id}`)}
                      />
                    ) : (
                      <Tag
                        value={member.role}
                        severity={
                          member.role.toLowerCase() === 'owner'
                            ? 'success'
                            : 'info'
                        }
                        className="text-xs"
                      />
                    )}

                    {/* Remove Member Button */}
                    {canRemove && (
                      <Button
                        icon={
                          memberActions.has(`remove-${member.id}`)
                            ? 'pi pi-spin pi-spinner'
                            : 'pi pi-times'
                        }
                        size="small"
                        text
                        severity="danger"
                        disabled={memberActions.has(`remove-${member.id}`)}
                        onClick={() => confirmRemoveMember(member)}
                        tooltip={
                          memberActions.has(`remove-${member.id}`)
                            ? 'Removing...'
                            : 'Remove member'
                        }
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
