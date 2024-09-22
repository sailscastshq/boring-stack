import { Link, Head, useForm } from '@inertiajs/react'
import { useMemo } from 'react'

import InputText from '@/components/InputText.jsx'
import InputEmail from '@/components/InputEmail.jsx'
import InputPassword from '@/components/InputPassword.jsx'
import InputButton from '@/components/InputButton.jsx'
import GoogleButton from '@/components/GoogleButton.jsx'

export default function Signup() {
  const { data, setData, ...form } = useForm({
    fullName: '',
    email: '',
    password: ''
  })

  const containsSpecialChars = useMemo(() => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    return specialChars.test(data.password)
  }, [data.password])

  const passwordIsValid = useMemo(() => {
    return data.password?.length >= 8
  })

  const disableSignupButton = useMemo(() => {
    if (!passwordIsValid) return true
    if (!containsSpecialChars) return true
    if (form.processing) return true
    return false
  })

  function submit(e) {
    e.preventDefault()
    form.post('/signup')
  }
  return (
    <>
      <Head title="Sign up | Mellow"></Head>
      <section className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-brand-50/10 to-[#F9FAFB] text-black sm:items-center">
        <main className="mt-10 bg-white px-4 py-10 text-black sm:w-7/12 sm:rounded-lg sm:px-8 sm:shadow-lg md:w-6/12 lg:w-5/12 xl:w-4/12">
          <section className="mb-6 flex flex-col items-center justify-center space-y-2 text-center">
            <Link href="/">
              <svg
                className="self-center"
                width="57"
                height="38"
                viewBox="0 0 57 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M42.5981 38C40.585 38 39.3448 37.0706 37.3184 35.976C35.292 34.8814 29.4312 30.4743 29.4312 24.9884C29.4312 21.2669 28.4719 18.2569 26.8381 15.8581C25.2166 13.4778 23.0198 11.8286 20.7345 10.6644C19.6332 10.1036 18.4872 9.64488 17.346 9.26581C16.6808 9.04499 16.2947 8.33065 16.5834 7.69203C18.4128 3.64197 22.4871 0.824097 27.22 0.824097C33.6625 0.824097 38.8855 6.04681 38.8855 12.4896C38.8855 13.868 38.6465 15.1907 38.2075 16.4181C40.067 15.165 42.3075 14.4338 44.7183 14.4338C51.1609 14.4338 56.3835 19.6565 56.3835 26.0994C56.3835 33.8555 49.5679 38 42.5981 38Z"
                  fill="#6C25C1"
                />
                <path
                  d="M0 25.1274C0 31.2765 4.05403 36.4 9.42465 37.532C10.2536 37.8349 11.1486 38.0001 12.0822 38.0001H30.2069C30.8147 38.0001 31.0794 37.1872 30.6153 36.7945C27.4478 34.1143 25.0937 30.3371 25.0937 24.9885C25.0937 22.0496 24.3495 19.9092 23.2531 18.3C22.1443 16.6723 20.5847 15.4558 18.7655 14.5289C16.9294 13.5937 14.936 12.998 13.0324 12.5757C12.5841 12.5191 12.1278 12.4897 11.6655 12.4897C5.22272 12.4897 0 18.1479 0 25.1274Z"
                  fill="#6C25C1"
                />
              </svg>
            </Link>

            <h1 className="text-2xl">Create your account</h1>
            <p className="text-lg text-gray">
              Welcome! Please enter your details to sign up
            </p>
          </section>
          {form.errors.signup && (
            <p className="my-4 w-full rounded-sm border-red-400 bg-red-100 p-4 text-red-500">
              {form.errors?.signup}
            </p>
          )}

          <form onSubmit={submit} className="mb-4 flex flex-col space-y-6">
            <InputText
              value={data.fullName}
              onChange={(e) => setData('fullName', e.target.value)}
            />

            {form.errors.fullName && (
              <p className="text-red-500" v-if="form.errors.fullName">
                {form.errors.fullName}
              </p>
            )}
            <InputEmail
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
            />
            {form.errors.email && (
              <p className="text-red-500">{form.errors.email}</p>
            )}
            <InputPassword
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
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
            <p className="text-gray">
              <span>You agree to our </span>
              <a href="/terms" className="text-brand hover:underline">
                Terms Of Use
              </a>
              <span> and </span>
              <a href="/privacy-policy" className="text-brand hover:underline">
                Privacy Policy
              </a>
            </p>
            <InputButton
              processing={form.processing}
              disabled={disableSignupButton}
              label="Sign up"
            />
          </form>
          <GoogleButton />
        </main>
        <footer className="my-8 text-center text-gray">
          <p>
            <span>Already have an account? </span>
            <Link href="/login" className="text-brand hover:underline">
              Login
            </Link>
          </p>
        </footer>
      </section>
    </>
  )
}
