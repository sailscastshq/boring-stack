import ChevronLeft from '@/components/ui/icons/ChevronLeft.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
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
      <div className="ascent-auth">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hidden"></div>
          <div className="hidden"></div>
        </div>

        <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
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

          <div className="relative">
            {/* Background blur effect */}
            <div className="hidden"></div>

            {/* Main card */}
            <div className="ascent-auth-panel">
              {/* Email Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full  bg-gray-50 dark:bg-gray-950">
                  <Envelope className="h-8 w-8 text-brand-600 dark:text-brand-300" />
                </div>
              </div>

              <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {getTitle()}
              </h1>

              <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                {getSubtitle()}
              </p>

              <p className="mx-auto mb-8 max-w-md text-base text-gray-600 dark:text-gray-400">
                {getEmailText()}
              </p>

              {/* Open Email App Button */}
              <button
                type="button"
                onClick={handleOpenEmailApp}
                className="mb-6 w-full rounded-xl  bg-brand-600 px-8 py-4 text-lg font-bold text-white shadow-none transition-all duration-200 hover:bg-brand-700 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Open email app
              </button>

              {/* Resend Link - Only show for verification and magic-link */}
              {type !== 'password-reset' && (
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Didn't receive the email?{' '}
                  <Link
                    href="/resend-link"
                    className="font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
                  >
                    Resend link
                  </Link>
                </p>
              )}

              {/* Back to forgot password for password-reset type */}
              {type === 'password-reset' && (
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Try a different email?{' '}
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
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
              className="inline-flex items-center text-base text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {backText}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
