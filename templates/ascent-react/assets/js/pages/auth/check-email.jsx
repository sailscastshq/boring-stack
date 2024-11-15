import { Link, Head } from '@inertiajs/react'

export default function CheckEmail({ message }) {
  return (
    <>
      <Head title="Check your email | Mellow"></Head>
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
              <rect width="50" height="50" rx="25" fill="#F4ECFF" />
              <g clipPath="url(#clip0_74_2116)">
                <path
                  d="M30.25 16.75H19.75C18.7558 16.7512 17.8027 17.1467 17.0997 17.8497C16.3967 18.5527 16.0012 19.5058 16 20.5V29.5C16.0012 30.4942 16.3967 31.4473 17.0997 32.1503C17.8027 32.8533 18.7558 33.2488 19.75 33.25H30.25C31.2442 33.2488 32.1973 32.8533 32.9003 32.1503C33.6033 31.4473 33.9988 30.4942 34 29.5V20.5C33.9988 19.5058 33.6033 18.5527 32.9003 17.8497C32.1973 17.1467 31.2442 16.7512 30.25 16.75ZM19.75 18.25H30.25C30.6991 18.2509 31.1376 18.3861 31.5092 18.6384C31.8808 18.8906 32.1684 19.2482 32.335 19.6653L26.5915 25.4095C26.1688 25.8305 25.5966 26.0669 25 26.0669C24.4034 26.0669 23.8312 25.8305 23.4085 25.4095L17.665 19.6653C17.8316 19.2482 18.1192 18.8906 18.4908 18.6384C18.8624 18.3861 19.3009 18.2509 19.75 18.25ZM30.25 31.75H19.75C19.1533 31.75 18.581 31.5129 18.159 31.091C17.7371 30.669 17.5 30.0967 17.5 29.5V21.625L22.348 26.47C23.052 27.1722 24.0057 27.5665 25 27.5665C25.9943 27.5665 26.948 27.1722 27.652 26.47L32.5 21.625V29.5C32.5 30.0967 32.2629 30.669 31.841 31.091C31.419 31.5129 30.8467 31.75 30.25 31.75Z"
                  fill="#6C25C1"
                />
              </g>
              <defs>
                <clipPath id="clip0_74_2116">
                  <rect
                    width="18"
                    height="18"
                    fill="white"
                    transform="translate(16 16)"
                  />
                </clipPath>
              </defs>
            </svg>

            <h1 className="text-2xl">Check your email</h1>
            {message && <p className="text-lg text-gray">{message}</p>}
            <button
              type="button"
              className="w-full rounded-md border border-brand bg-brand px-4 py-3 text-white disabled:bg-gray-200/40 disabled:text-gray"
            >
              Open email app
            </button>

            <p className="my-8 text-center text-gray">
              <span> Didn't receive email? </span>
              <a href="/resend-link" className="text-brand hover:underline">
                Resend
              </a>
            </p>
          </section>
        </main>
        <footer className="my-8 text-center text-black">
          <Link href="/signup" className="flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="fill-current"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.6667 7.33337H6L8.19333 5.14004C8.25582 5.07806 8.30542 5.00433 8.33926 4.92309C8.37311 4.84185 8.39053 4.75471 8.39053 4.66671C8.39053 4.5787 8.37311 4.49156 8.33926 4.41032C8.30542 4.32908 8.25582 4.25535 8.19333 4.19337C8.06843 4.06921 7.89946 3.99951 7.72333 3.99951C7.54721 3.99951 7.37824 4.06921 7.25333 4.19337L4.39333 7.06004C4.14294 7.30894 4.00149 7.64699 4 8.00004C4.00324 8.35078 4.14456 8.68611 4.39333 8.93337L7.25333 11.8C7.31549 11.8618 7.3892 11.9106 7.47025 11.9439C7.55129 11.9771 7.63809 11.9941 7.72569 11.9937C7.81329 11.9934 7.89997 11.9759 7.98078 11.9421C8.06159 11.9083 8.13495 11.8589 8.19667 11.7967C8.25839 11.7345 8.30726 11.6608 8.3405 11.5798C8.37373 11.4987 8.39068 11.4119 8.39037 11.3243C8.39006 11.2368 8.3725 11.1501 8.33869 11.0693C8.30489 10.9885 8.25549 10.9151 8.19333 10.8534L6 8.66671H12.6667C12.8435 8.66671 13.013 8.59647 13.1381 8.47144C13.2631 8.34642 13.3333 8.17685 13.3333 8.00004C13.3333 7.82323 13.2631 7.65366 13.1381 7.52864C13.013 7.40361 12.8435 7.33337 12.6667 7.33337Z" />
            </svg>
            <span className="pl-2">Back to sign up</span>
          </Link>
        </footer>
      </section>
    </>
  )
}
