import { Link, Head } from '@inertiajs/react'

export default function Success({ pageTitle, pageHeading, message }) {
  return (
    <>
      <Head title={`${pageTitle} | Mellow`}></Head>
      <section className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-brand-50/10 to-[#F9FAFB] text-black sm:items-center">
        <main className="mt-10 bg-white px-4 py-10 text-black sm:w-7/12 sm:rounded-lg sm:px-8 sm:shadow-lg md:w-6/12 lg:w-5/12 xl:w-4/12">
          <section className="mb-6 flex flex-col items-center justify-center space-y-4 text-center">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="50" height="50" rx="25" fill="#ECFFF4" />
              <g clipPath="url(#clip0_74_2160)">
                <path
                  d="M21.8119 31.497C21.3009 31.4972 20.8109 31.2941 20.4499 30.9325L16.3323 26.8164C15.8892 26.3732 15.8892 25.6548 16.3323 25.2116C16.7755 24.7685 17.4939 24.7685 17.9371 25.2116L21.8119 29.0863L32.0629 18.8353C32.5061 18.3923 33.2245 18.3923 33.6677 18.8353C34.1108 19.2786 34.1108 19.997 33.6677 20.4402L23.1738 30.9325C22.8129 31.2941 22.3228 31.4972 21.8119 31.497Z"
                  fill="#49D489"
                />
              </g>
              <defs>
                <clipPath id="clip0_74_2160">
                  <rect
                    width="18"
                    height="18"
                    fill="white"
                    transform="translate(16 16)"
                  />
                </clipPath>
              </defs>
            </svg>

            <h1 className="text-2xl">{pageHeading}</h1>
            <p className="text-lg text-gray">
              {message}. Click continue to go to your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="w-full rounded-md border border-brand bg-brand px-4 py-3 text-white disabled:bg-gray-200/40 disabled:text-gray"
            >
              Continue
            </Link>
          </section>
        </main>
      </section>
    </>
  )
}
