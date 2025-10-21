import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Message } from 'primereact/message'

export default function Contact() {
  const [selectedTopic, setSelectedTopic] = useState(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    company: '',
    topic: '',
    message: ''
  })

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
    // TODO: Implement actual form submission
    console.log('Contact form submitted:', data)
    // For now, just reset the form
    reset()
    setSelectedTopic(null)
  }

  return (
    <>
      <Head title="Contact Us | Ascent" />

      <div className="min-h-screen bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"></div>
        </div>

        <div className="relative px-6 py-24 sm:py-32 lg:px-8">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Have a question or need help? We'd love to hear from you. Send us
              a message and we'll respond as soon as possible.
            </p>
          </header>

          <div className="mx-auto mt-16 max-w-xl">
            <div className="relative">
              {/* Background blur effect */}
              <div className="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 blur-xl"></div>

              {/* Main card */}
              <div className="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                      >
                        Name
                      </label>
                      <InputText
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                        placeholder="Your name"
                        required
                      />
                      {errors.name && (
                        <Message
                          severity="error"
                          text={errors.name}
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                      >
                        Email
                      </label>
                      <InputText
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                        placeholder="your@email.com"
                        required
                      />
                      {errors.email && (
                        <Message
                          severity="error"
                          text={errors.email}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Company (Optional)
                    </label>
                    <InputText
                      id="company"
                      value={data.company}
                      onChange={(e) => setData('company', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="topic"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Topic
                    </label>
                    <Dropdown
                      value={selectedTopic}
                      onChange={(e) => {
                        setSelectedTopic(e.value)
                        setData('topic', e.value)
                      }}
                      options={topicOptions}
                      placeholder="What can we help you with?"
                      className="w-full"
                      panelClassName="mt-1"
                    />
                    {errors.topic && (
                      <Message
                        severity="error"
                        text={errors.topic}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Message
                    </label>
                    <InputTextarea
                      id="message"
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-medium transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      required
                    />
                    {errors.message && (
                      <Message
                        severity="error"
                        text={errors.message}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                        processing
                          ? 'bg-gray-300'
                          : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                      }`}
                    >
                      {processing ? (
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-5 w-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>

                {/* Contact Info */}
                <footer className="mt-8 border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Other Ways to Reach Us
                    </h3>
                    <address className="mt-4 space-y-2 not-italic">
                      <p className="text-sm text-gray-600">
                        <strong className="text-gray-900">Email:</strong>{' '}
                        <a
                          href="mailto:hello@ascent.app"
                          className="text-brand-600 transition-colors hover:text-brand-500"
                        >
                          hello@ascent.app
                        </a>
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong className="text-gray-900">
                          Response Time:
                        </strong>{' '}
                        We typically respond within 24 hours
                      </p>
                    </address>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
