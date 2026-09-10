import Spinner from '@/components/ui/spinner/Spinner.jsx'
import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import InputText from '@/components/ui/input/Input.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Message from '@/components/ui/alert/Alert.jsx'
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
        <header className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Create New Team
          </h1>
          <p className="text-gray-600">
            Create a new team to collaborate with others. You'll be the owner of
            this team.
          </p>
        </header>

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
              aria-invalid={!!errors.name}
              className={[
                'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                'w-full'
              ]
                .filter(Boolean)
                .join(' ')}
            />
            {errors.name && (
              <Message
                role={'alert'}
                className={[
                  'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                  'mt-2'
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {errors.name}
              </Message>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={processing || processing}
              aria-busy={processing}
              className={[
                'min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700',
                'px-6'
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {processing && <Spinner className="h-4 w-4" />}
              Create Team
            </Button>
            <Button
              type="button"
              onClick={() => window.history.back()}
              disabled={processing}
              className={
                'min-h-10 border border-brand-200 bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
