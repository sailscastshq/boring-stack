import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'

import AppLayout from '@/layouts/AppLayout.jsx'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Avatar } from 'primereact/avatar'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'
import { Menu } from 'primereact/menu'

TeamSettings.layout = (page) => (
  <AppLayout>
    <SettingsLayout children={page} />
  </AppLayout>
)

export default function TeamSettings() {
  const [inviteByLink, setInviteByLink] = useState(true)
  const [inviteLink] = useState(
    'https://app.ascent-react.com/team/MZZCRmdFKsDjr7SmU7Rl0e'
  )
  const [domainRestriction, setDomainRestriction] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
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
    post('/team/invite', {
      data: {
        ...data,
        role: 'Member'
      },
      onSuccess: () => {
        reset()
        setShowInviteForm(false)
      }
    })
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink)
    // You could show a toast notification here
  }

  function resetInviteLink() {
    // Handle invite link reset logic
    console.log('Reset invite link')
  }

  function setDomainRestrictions() {
    // Handle domain restriction logic
    console.log('Set domain restrictions:', domainRestriction)
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
                As an admin, you can choose whether to enable or disable the
                ability for team members to invite others by invitation link.
              </p>
            </div>
            <button
              onClick={() => setInviteByLink(!inviteByLink)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                inviteByLink ? 'bg-success-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inviteByLink ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {inviteByLink && (
            <div>
              <div className="flex items-center space-x-3 space-y-1">
                <InputText
                  value={inviteLink}
                  readOnly
                  size="small"
                  className="flex-1 text-sm"
                />
                <Button
                  icon="pi pi-copy"
                  onClick={copyInviteLink}
                  size="small"
                  tooltip="Copy link"
                  text
                />
              </div>
              <Button
                label="Reset Links"
                onClick={resetInviteLink}
                text
                size="small"
                severity="secondary"
              />
            </div>
          )}

          {/* Restrict by Domain */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Restrict by domain
              </h4>
              <p className="text-sm text-gray-500">
                Only allow users with emails at specific domains to join your
                team through the invite link.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <InputText
                value={domainRestriction}
                onChange={(e) => setDomainRestriction(e.target.value)}
                placeholder="domains, comma separated"
                size="small"
                className="flex-1"
              />
              <Button
                label="Set"
                onClick={setDomainRestrictions}
                size="small"
                outlined
              />
            </div>
          </div>
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
                value={data.emails}
                onChange={(e) => setData('emails', e.target.value)}
                placeholder="Emails, comma separated"
                size="small"
                className="flex-1"
              />

              <Button
                type="submit"
                label="Invite"
                size="small"
                outlined
                loading={processing}
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
