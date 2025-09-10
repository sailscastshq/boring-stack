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

export default function TeamSettings({ team }) {
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

  const [domainRestrictions, setDomainRestrictions] = useState(
    team?.domainRestrictions || []
  )
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
    emails: ''
  })

  const teamMembers = [
    {
      id: 1,
      name: 'Kelvin Omereshone',
      email: 'kelvinomereshone@gmail.com',
      role: 'Admin',
      avatar:
        'https://ui-avatars.com/api/?name=Kelvin+Omereshone&background=0EA5E9&color=fff'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Member',
      avatar:
        'https://ui-avatars.com/api/?name=Jane+Smith&background=10B981&color=fff'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Member',
      avatar:
        'https://ui-avatars.com/api/?name=Bob+Johnson&background=F59E0B&color=fff'
    }
  ]

  function handleInvite(e) {
    e.preventDefault()
    postEmails('/team/invite', {
      data: {
        ...emailData,
        role: 'Member'
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
                <div>
                  <Chips
                    value={domainRestrictions}
                    onChange={(e) => setDomainRestrictions(e.value)}
                    placeholder="Domains, comma separated"
                    className="w-full"
                    separator=","
                  />
                </div>
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
              <InputText
                value={emailData.emails}
                onChange={(e) => setEmailData('emails', e.target.value)}
                placeholder="Emails, comma separated"
                size="small"
                className="flex-1"
              />

              <Button
                type="submit"
                label="Invite"
                size="small"
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
                  <Button
                    icon="pi pi-ellipsis-h"
                    size="small"
                    text
                    onClick={(e) => {
                      console.log('Show menu for', member.name)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
