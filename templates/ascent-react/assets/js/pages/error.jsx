import { Head, Link } from '@inertiajs/react'

export default function ErrorPage({ status, title, message }) {
  const homeHref = status === 404 ? '/' : '/dashboard'

  return (
    <>
      <Head title={`${status} ${title} | Ascent`} />

      <main className="flex min-h-screen items-center bg-white px-6 py-16 text-gray-950 dark:bg-gray-950 dark:text-white">
        <section className="mx-auto w-full max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-brand-600 dark:text-brand-300">
            Status {status}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold text-gray-950 dark:text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {message}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={homeHref}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
            >
              Go home
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
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
