import CheckCircle from '@/components/ui/icons/CheckCircle.jsx'
import { Link, Head } from '@inertiajs/react'

export default function Success({ pageTitle, pageHeading, message }) {
  return (
    <>
      <Head title={`${pageTitle} | Mellow`}></Head>
      <section className="mellow-auth">
        <main className="mellow-auth-main">
          <section className="mb-6 flex flex-col items-center justify-center space-y-4 text-center">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#ECFFF4] text-[#49D489]">
              <CheckCircle className="h-[18px] w-[18px]" />
            </span>

            <h1 className="text-2xl">{pageHeading}</h1>
            <p className="text-sm text-gray-600">
              {message}. Click continue to go to your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="border-brand bg-brand disabled:text-gray w-full rounded-md border px-4 py-3 text-white disabled:bg-gray-200/40"
            >
              Continue
            </Link>
          </section>
        </main>
      </section>
    </>
  )
}
