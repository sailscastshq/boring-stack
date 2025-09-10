import { useState, useEffect } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'

import AppLayout from '@/layouts/AppLayout.jsx'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { Chips } from 'primereact/chips'
import { Avatar } from 'primereact/avatar'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'
import { Menu } from 'primereact/menu'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

TeamSettings.layout = (page) => (
  <AppLayout>
    <SettingsLayout children={page} />
  </AppLayout>
)

export default function TeamSettings({ team, memberships }) {
  const { copied, copyToClipboard } = useCopyToClipboard()
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
    post: postDomains,
    processing: processingDomains
  } = useForm({
    domainRestrictions: team?.domainRestrictions || []
  })

  // Form for removing individual domains
  const {
    data: removeDomainData,
    setData: setRemoveDomainData,
    delete: deleteDomain,
    processing: processingRemoveDomain
  } = useForm({
    domain: ''
  })
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
    postEmails('/team/invite', {
      data: {
        ...emailData
      },
      onSuccess: () => {
        resetEmails()
        setShowInviteForm(false)
      }
    })
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
      postDomains(`/teams/${team.id}/set-domain-restrictions`, {
        onSuccess: () => {
          // Clear the chips after successful submission
          setDomainData('domainRestrictions', [])
        }
      })
    }
  }

  function handleRemoveDomain(domain) {
    if (team) {
      setRemoveDomainData('domain', domain)
      deleteDomain(`/teams/${team.id}/remove-domain-restriction`)
    }
  }

  function confirmRemoveMember(member) {
    confirmDialog({
      message: `Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`,
      header: 'Remove Team Member',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        console.log(`Removing member: ${member.name}`)
      }
    })
  }

  return (
    <>
      <Head title="Team Settings | Ascent React"></Head>
      <ConfirmDialog />

      <div className="max-w-4xl space-y-8">
        {/* Invite by Link */}
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
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                                  />
                                </svg>
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
                              icon="pi pi-times"
                              size="small"
                              text
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleRemoveDomain(domain)}
                              tooltip="Remove domain restriction"
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

        {/* Invite by Email */}
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
              />
            </div>
          </form>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Team Members</h3>
          </div>

          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center space-x-3">
                  <Avatar image={member.avatar} size="large" shape="circle" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {member.name}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-start space-x-3">
                  <Tag
                    value={member.role}
                    className="rounded-md border-0 bg-gray-200 px-2 py-1 text-xs text-gray-700"
                  />
                  {member.role !== 'Owner' && (
                    <Button
                      icon="pi pi-times"
                      size="small"
                      text
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => {
                        confirmRemoveMember(member)
                      }}
                      tooltip="Remove member"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
