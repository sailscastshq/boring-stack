import ArrowLeft from '@/components/ui/icons/ArrowLeft.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
import { Link, Head } from '@inertiajs/react'

export default function CheckEmail({ message }) {
  return (
    <>
      <Head title="Check your email | Mellow"></Head>
      <section className="mellow-auth">
        <main className="mellow-auth-main">
          <section className="mb-6 flex flex-col items-center justify-center space-y-4 text-center">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]">
              <Envelope className="h-[18px] w-[18px]" />
            </span>

            <h1 className="text-2xl">Check your email</h1>
            {message && <p className="text-sm text-gray-600">{message}</p>}
            <button
              type="button"
              className="border-brand bg-brand disabled:text-gray w-full rounded-md border px-4 py-3 text-white disabled:bg-gray-200/40"
            >
              Open email app
            </button>

            <p className="text-gray my-8 text-center">
              <span> Didn't receive email? </span>
              <a href="/resend-link" className="text-brand hover:underline">
                Resend
              </a>
            </p>
          </section>
        </main>
        <footer className="my-8 text-center text-black">
          <Link href="/signup" className="flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
            <span className="pl-2">Back to sign up</span>
          </Link>
        </footer>
      </section>
    </>
  )
}
