import { Head, Link } from '@inertiajs/react'

export default function ErrorPage({ status, title, message }) {
  const homeHref = status === 404 ? '/' : '/dashboard'

  return (
    <>
      <Head title={`${status} ${title} | Ascent`} />

      <main className="flex min-h-screen items-center bg-white px-6 py-16 text-gray-950 dark:bg-gray-950 dark:text-white">
        <section className="mx-auto w-full max-w-3xl">
          <h1 className="max-w-2xl text-4xl font-medium tracking-tight text-gray-950 dark:text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {message}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={homeHref}
              className="min-h-11 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
            >
              Go home
            </Link>
            <button
              type="button"
              className="min-h-11 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
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
