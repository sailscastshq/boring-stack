import { Link, Head, useForm } from '@inertiajs/react'
import { useMemo } from 'react'
import InputPassword from '@/components/InputPassword'
import InputButton from '@/components/InputButton'

export default function ResetPassword({ token }) {
  const { data, setData, ...form } = useForm({
    token,
    password: '',
    confirmPassword: ''
  })

  const containsSpecialChars = useMemo(() => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    return specialChars.test(data.password)
  }, [data.password])

  const passwordIsValid = useMemo(() => {
    return data.password?.length >= 8
  })

  const disableResetPasswordButton = useMemo(() => {
    if (!passwordIsValid) return true
    if (!containsSpecialChars) return true
    if (form.processing) return true
    if (data.password != data.confirmPassword) return true
    return false
  }, [data.password, data.confirmPassword, form.processing])

  function submit(e) {
    e.preventDefault()
    form.post('/reset-password')
  }

  return (
    <>
      <Head title="Reset password | Mellow"></Head>
      <section className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-brand-50/10 to-[#F9FAFB] text-black sm:items-center">
        <main className="mt-10 bg-white px-4 py-10 text-black sm:w-7/12 sm:rounded-lg sm:px-8 sm:shadow-lg md:w-6/12 lg:w-5/12 xl:w-4/12">
          <section className="mb-6 flex flex-col items-center justify-center space-y-2 text-center">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="50" height="50" rx="25" fill="#F4ECFF" />
              <g clipPath="url(#clip0_70_1475)">
                <path
                  d="M30.25 22.318V21.25C30.25 19.8576 29.6969 18.5223 28.7123 17.5377C27.7277 16.5531 26.3924 16 25 16C23.6076 16 22.2723 16.5531 21.2877 17.5377C20.3031 18.5223 19.75 19.8576 19.75 21.25V22.318C19.082 22.6095 18.5135 23.0894 18.1139 23.6989C17.7143 24.3084 17.501 25.0212 17.5 25.75V30.25C17.5012 31.2442 17.8967 32.1973 18.5997 32.9003C19.3027 33.6033 20.2558 33.9988 21.25 34H28.75C29.7442 33.9988 30.6973 33.6033 31.4003 32.9003C32.1033 32.1973 32.4988 31.2442 32.5 30.25V25.75C32.499 25.0212 32.2857 24.3084 31.8861 23.6989C31.4865 23.0894 30.918 22.6095 30.25 22.318ZM21.25 21.25C21.25 20.2554 21.6451 19.3016 22.3483 18.5983C23.0516 17.8951 24.0054 17.5 25 17.5C25.9946 17.5 26.9484 17.8951 27.6517 18.5983C28.3549 19.3016 28.75 20.2554 28.75 21.25V22H21.25V21.25ZM31 30.25C31 30.8467 30.7629 31.419 30.341 31.841C29.919 32.2629 29.3467 32.5 28.75 32.5H21.25C20.6533 32.5 20.081 32.2629 19.659 31.841C19.2371 31.419 19 30.8467 19 30.25V25.75C19 25.1533 19.2371 24.581 19.659 24.159C20.081 23.7371 20.6533 23.5 21.25 23.5H28.75C29.3467 23.5 29.919 23.7371 30.341 24.159C30.7629 24.581 31 25.1533 31 25.75V30.25Z"
                  fill="#6C25C1"
                />
                <path
                  d="M25 26.5C24.8011 26.5 24.6103 26.579 24.4697 26.7197C24.329 26.8603 24.25 27.0511 24.25 27.25V28.75C24.25 28.9489 24.329 29.1397 24.4697 29.2803C24.6103 29.421 24.8011 29.5 25 29.5C25.1989 29.5 25.3897 29.421 25.5303 29.2803C25.671 29.1397 25.75 28.9489 25.75 28.75V27.25C25.75 27.0511 25.671 26.8603 25.5303 26.7197C25.3897 26.579 25.1989 26.5 25 26.5Z"
                  fill="#6C25C1"
                />
              </g>
              <defs>
                <clipPath id="clip0_70_1475">
                  <rect
                    width="18"
                    height="18"
                    fill="white"
                    transform="translate(16 16)"
                  />
                </clipPath>
              </defs>
            </svg>

            <h1 class="text-2xl">Create a new password</h1>
            <p class="text-lg text-gray">Set a new password</p>
          </section>
          <form onSubmit={submit} className="mb-4 flex flex-col space-y-6">
            <InputPassword
              label="New Password"
              id="newPassword"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
            />
            {form.errors.password && (
              <p className="text-red-500">{form.errors.password}</p>
            )}
            <InputPassword
              label="Confirm Password"
              id="confirmPassword"
              value={data.confirmPassword}
              onChange={(e) => setData('confirmPassword', e.target.value)}
            />
            {form.errors.password && (
              <p className="text-red-500">{form.errors.password}</p>
            )}
            <ul className="flex justify-between text-sm">
              <li
                className={`flex items-center space-x-1 text-gray-500 ${
                  passwordIsValid && 'text-green'
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_74_1911)">
                    <path d="M8 0C3.58867 0 0 3.58867 0 8C0 12.4113 3.58867 16 8 16C12.4113 16 16 12.4113 16 8C16 3.58867 12.4113 0 8 0ZM12.1333 7.008L9.18267 9.90467C8.66067 10.4167 7.98867 10.672 7.316 10.672C6.65067 10.672 5.98533 10.4213 5.46533 9.91933L4.19933 8.67467C3.93667 8.41667 3.93333 7.99467 4.19133 7.732C4.44867 7.46867 4.872 7.46533 5.134 7.724L6.396 8.96467C6.91333 9.46467 7.73 9.462 8.25 8.95267L11.2 6.05667C11.462 5.798 11.8827 5.80267 12.1427 6.06533C12.4007 6.328 12.3967 6.75 12.1333 7.008Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_74_1911">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>At least 8 characters</span>
              </li>
              <li
                className={`flex items-center space-x-1 text-gray-500 ${
                  containsSpecialChars && 'text-green'
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_74_1911)">
                    <path d="M8 0C3.58867 0 0 3.58867 0 8C0 12.4113 3.58867 16 8 16C12.4113 16 16 12.4113 16 8C16 3.58867 12.4113 0 8 0ZM12.1333 7.008L9.18267 9.90467C8.66067 10.4167 7.98867 10.672 7.316 10.672C6.65067 10.672 5.98533 10.4213 5.46533 9.91933L4.19933 8.67467C3.93667 8.41667 3.93333 7.99467 4.19133 7.732C4.44867 7.46867 4.872 7.46533 5.134 7.724L6.396 8.96467C6.91333 9.46467 7.73 9.462 8.25 8.95267L11.2 6.05667C11.462 5.798 11.8827 5.80267 12.1427 6.06533C12.4007 6.328 12.3967 6.75 12.1333 7.008Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_74_1911">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>At least 1 special characters</span>
              </li>
            </ul>

            <InputButton
              label="Reset password"
              processing={form.processing}
              disabled={disableResetPasswordButton}
            />
          </form>
        </main>
        <footer className="my-8 text-center text-gray">
          <Link href="/login" className="flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              class="fill-current"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.6667 7.33337H6L8.19333 5.14004C8.25582 5.07806 8.30542 5.00433 8.33926 4.92309C8.37311 4.84185 8.39053 4.75471 8.39053 4.66671C8.39053 4.5787 8.37311 4.49156 8.33926 4.41032C8.30542 4.32908 8.25582 4.25535 8.19333 4.19337C8.06843 4.06921 7.89946 3.99951 7.72333 3.99951C7.54721 3.99951 7.37824 4.06921 7.25333 4.19337L4.39333 7.06004C4.14294 7.30894 4.00149 7.64699 4 8.00004C4.00324 8.35078 4.14456 8.68611 4.39333 8.93337L7.25333 11.8C7.31549 11.8618 7.3892 11.9106 7.47025 11.9439C7.55129 11.9771 7.63809 11.9941 7.72569 11.9937C7.81329 11.9934 7.89997 11.9759 7.98078 11.9421C8.06159 11.9083 8.13495 11.8589 8.19667 11.7967C8.25839 11.7345 8.30726 11.6608 8.3405 11.5798C8.37373 11.4987 8.39068 11.4119 8.39037 11.3243C8.39006 11.2368 8.3725 11.1501 8.33869 11.0693C8.30489 10.9885 8.25549 10.9151 8.19333 10.8534L6 8.66671H12.6667C12.8435 8.66671 13.013 8.59647 13.1381 8.47144C13.2631 8.34642 13.3333 8.17685 13.3333 8.00004C13.3333 7.82323 13.2631 7.65366 13.1381 7.52864C13.013 7.40361 12.8435 7.33337 12.6667 7.33337Z" />
            </svg>
            <span className="pl-2">Back to login</span>
          </Link>
        </footer>
      </section>
    </>
  )
}
