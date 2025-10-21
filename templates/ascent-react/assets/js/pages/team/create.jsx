import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import DashboardLayout from '../../layouts/DashboardLayout'

export default function CreateTeam() {
  const { data, setData, post, processing, errors } = useForm({
    name: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/teams')
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Create New Team
          </h1>
          <p className="text-gray-600">
            Create a new team to collaborate with others. You'll be the owner of
            this team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Team Name
            </label>
            <InputText
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Enter team name"
              className="w-full"
              invalid={!!errors.name}
            />
            {errors.name && (
              <Message severity="error" text={errors.name} className="mt-2" />
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={processing}
              loading={processing}
              className="px-6"
            >
              Create Team
            </Button>
            <Button
              type="button"
              outlined
              onClick={() => window.history.back()}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
