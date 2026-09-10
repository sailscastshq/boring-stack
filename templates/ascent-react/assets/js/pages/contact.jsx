import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Notifications from '@/components/Notifications.jsx'
import { useEffect } from 'react'
import { readContactDraft, saveContactDraft } from '@/lib/contact-draft'
import { Head, useForm, Link } from '@inertiajs/react'
import InputText from '@/components/ui/input/Input.jsx'
import InputTextarea from '@/components/ui/textarea/Textarea.jsx'
import Dropdown from '@/components/ui/select/Select.jsx'
import Message from '@/components/ui/alert/Alert.jsx'

export default function Contact({ internalEmail }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    company: '',
    topic: '',
    message: ''
  })

  useEffect(() => {
    const draft = readContactDraft()
    if (draft) setData((current) => ({ ...current, ...draft }))
  }, [])
  function updateDraft(field, value) {
    const next = { ...data, [field]: value }
    setData(next)
    saveContactDraft(next)
  }

  const topicOptions = [
    { label: 'General Inquiry', value: 'general' },
    { label: 'Sales & Pricing', value: 'sales' },
    { label: 'Technical Support', value: 'support' },
    { label: 'Enterprise Plans', value: 'enterprise' },
    { label: 'Partnerships', value: 'partnerships' },
    { label: 'Feature Request', value: 'feature-request' },
    { label: 'Bug Report', value: 'bug-report' },
    { label: 'Other', value: 'other' }
  ]

  function handleSubmit(e) {
    e.preventDefault()
    post('/contact', {
      onSuccess: () => {
        saveContactDraft({ message: '', topic: '' })
        reset()
      }
    })
  }

  return (
    <>
      <>
        <Head title="Contact Us | Ascent" />

        <main className="min-h-screen  bg-gray-50 dark:bg-gray-950">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="hidden"></div>
            <div className="hidden"></div>
          </div>

          <div className="relative px-6 py-24 sm:py-32 lg:px-8">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center">
              <Link href="/" className="group">
                <div className="relative">
                  <div className="hidden"></div>
                  <span
                    className="inline-flex items-center gap-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    aria-label="Ascent"
                  >
                    Ascent
                    <span
                      className="text-brand-600 dark:text-brand-300"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            <header className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
                Get in Touch
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Have a question or need help? We'd love to hear from you. Send
                us a message and we'll respond as soon as possible.
              </p>
            </header>

            <section className="mx-auto mt-16 max-w-xl">
              <div className="relative">
                <div className="hidden" aria-hidden="true"></div>

                <div className="relative rounded-xl border border-gray-100 bg-white px-8 py-10 shadow-none dark:border-gray-700 dark:bg-gray-900">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    aria-label="Contact form"
                  >
                    <fieldset
                      className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                      aria-describedby="contact-info"
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          Name
                        </label>
                        <InputText
                          id="name"
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          placeholder="Your name"
                          required
                          className={[
                            'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                            'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        {errors.name && (
                          <Message
                            role="alert"
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

                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          Email
                        </label>
                        <InputText
                          id="email"
                          type="email"
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          placeholder="your@email.com"
                          required
                          className={[
                            'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                            'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        {errors.email && (
                          <Message
                            role="alert"
                            className={[
                              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                              'mt-2'
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {errors.email}
                          </Message>
                        )}
                      </div>
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="company"
                        className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        Company (Optional)
                      </label>
                      <InputText
                        id="company"
                        value={data.company}
                        onChange={(e) => setData('company', e.target.value)}
                        placeholder="Your company name"
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="topic"
                        className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        Topic
                      </label>
                      <Dropdown
                        id="topic"
                        value={data.topic}
                        options={topicOptions}
                        placeholder="What can we help you with?"
                        className="w-full"
                        onChange={(e) => {
                          updateDraft('topic', e)
                        }}
                      />
                      {errors.topic && (
                        <Message
                          role="alert"
                          className={[
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                            'mt-2'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {errors.topic}
                        </Message>
                      )}
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        Message
                      </label>
                      <InputTextarea
                        id="message"
                        value={data.message}
                        onChange={(e) => updateDraft('message', e.target.value)}
                        rows={6}
                        placeholder="Tell us more about your inquiry..."
                        required
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      {errors.message && (
                        <Message
                          role="alert"
                          className={[
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                            'mt-2'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {errors.message}
                        </Message>
                      )}
                    </fieldset>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={processing}
                        aria-describedby={
                          processing ? 'submit-status' : undefined
                        }
                        className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                          processing
                            ? 'bg-gray-300'
                            : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600'
                        }`}
                      >
                        {processing ? (
                          <div
                            className="flex items-center space-x-2"
                            id="submit-status"
                          >
                            <Spinner className="h-5 w-5" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </form>

                  <footer className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Other Ways to Reach Us
                      </h3>
                      <address className="mt-4 space-y-2 not-italic">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-gray-100">
                            Email:
                          </strong>{' '}
                          <a
                            href={`mailto:${internalEmail}`}
                            className="text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
                          >
                            {internalEmail}
                          </a>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-gray-100">
                            Response Time:
                          </strong>{' '}
                          We typically respond within 24 hours
                        </p>
                      </address>
                    </div>
                  </footer>
                </div>
              </div>
            </section>
          </div>
        </main>
      </>
      <Notifications />
    </>
  )
}
