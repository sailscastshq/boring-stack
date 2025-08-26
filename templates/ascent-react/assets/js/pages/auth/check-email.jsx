import { Link, Head } from '@inertiajs/react'

export default function CheckEmail({
  title = 'Check your email',
  message = 'We sent a link to your email address. Please check your inbox and follow the instructions.',
  type = 'verification', // 'verification' | 'magic-link'
  email,
  backUrl = '/login',
  backText = 'Back to login'
}) {
  const handleOpenEmailApp = () => {
    // Try to open the user's default email app
    if (typeof window !== 'undefined') {
      window.location.href = 'mailto:'
    }
  }

  const getSubtitle = () => {
    if (type === 'magic-link') {
      return 'We sent you a secure sign-in link'
    } else if (type === 'password-reset') {
      return 'Password reset instructions sent'
    }
    return 'Please verify your email address'
  }

  const getEmailText = () => {
    if (email) {
      let linkType = 'a verification link'
      if (type === 'magic-link') {
        linkType = 'a magic link'
      } else if (type === 'password-reset') {
        linkType = 'password reset instructions'
      }
      return `We sent ${linkType} to ${email}`
    }
    return message
  }

  const getTitle = () => {
    if (type === 'password-reset') {
      return 'Check your email'
    }
    return title
  }

  return (
    <>
      <Head title={`${title} | Ascent`}></Head>
      <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"></div>
        </div>

        <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <Link href="/" className="group">
              <div className="relative">
                <div className="absolute inset-0 scale-110 rounded-2xl bg-brand-200/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                <img
                  src="/images/logo.svg"
                  alt="Ascent Logo"
                  className="relative h-12 w-auto"
                />
              </div>
            </Link>
          </div>

          <div className="relative">
            {/* Background blur effect */}
            <div className="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 blur-xl"></div>

            {/* Main card */}
            <div className="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl text-center">
              {/* Email Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100">
                  <svg
                    className="h-8 w-8 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                {getTitle()}
              </h1>

              <p className="mb-2 text-lg text-gray-600 font-medium">
                {getSubtitle()}
              </p>

              <p className="mb-8 text-base text-gray-600 max-w-md mx-auto">
                {getEmailText()}
              </p>

              {/* Open Email App Button */}
              <button
                type="button"
                onClick={handleOpenEmailApp}
                className="mb-6 w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-brand-700 hover:to-accent-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Open email app
              </button>

              {/* Resend Link - Only show for verification and magic-link */}
              {type !== 'password-reset' && (
                <p className="text-base text-gray-600">
                  Didn't receive the email?{' '}
                  <Link
                    href="/resend-link"
                    className="font-semibold text-brand-600 transition-colors hover:text-brand-500"
                  >
                    Resend link
                  </Link>
                </p>
              )}

              {/* Back to forgot password for password-reset type */}
              {type === 'password-reset' && (
                <p className="text-base text-gray-600">
                  Try a different email?{' '}
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-brand-600 transition-colors hover:text-brand-500"
                  >
                    Back to forgot password
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href={backUrl}
              className="inline-flex items-center text-base text-gray-600 transition-colors hover:text-brand-600"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backText}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
