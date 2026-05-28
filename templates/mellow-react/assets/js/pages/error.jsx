import { Head, Link } from '@inertiajs/react'

export default function ErrorPage({ status, title, message }) {
  const homeHref = status === 404 ? '/' : '/dashboard'

  return (
    <>
      <Head title={`${status} ${title} | Mellow`} />

      <main className="from-brand-50/10 flex min-h-screen items-center bg-gradient-to-b to-[#F9FAFB] px-6 py-16 text-black">
        <section className="mx-auto w-full max-w-3xl">
          <p className="text-brand mb-4 text-sm font-semibold">
            Status {status}
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold text-black sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
            {message}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={homeHref}
              className="min-h-11 bg-brand hover:bg-brand-600 focus:ring-brand-100 inline-flex items-center justify-center rounded-md px-5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2"
            >
              Go home
            </Link>
            <button
              type="button"
              className="min-h-11 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => window.history.back()}
            >
              Go back
            </button>
          </div>
        </section>
      </main>
    </>
  )
}
