import { Link, Head, useForm } from '@inertiajs/react'
import { useState, useMemo } from 'react'

import InputEmail from '@/components/InputEmail.jsx'
import InputPassword from '@/components/InputPassword.jsx'
import InputButton from '@/components/InputButton.jsx'
import GoogleButton from '@/components/GoogleButton.jsx'

export default function Login() {
  const { data, setData, ...form } = useForm({
    email: '',
    password: '',
    rememberMe: false
  })

  const disableLoginButton = useMemo(() => {
    if (!data.email) return true
    if (!data.password) return true
    if (form.processing) return true
    return false
  }, [data.email, data.password, form.processing])

  function submit(e) {
    e.preventDefault()
    form.post('/login')
  }
  return (
    <>
      <Head title="Login | Mellow"></Head>
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
            <h1 className="text-2xl">Log into your account</h1>
            <p className="text-lg text-gray">
              Welcome back, please enter your details
            </p>
            {form.errors.email ||
              (form.errors.login && (
                <p className="my-4 w-full rounded-sm border-red-400 bg-red-100 p-4 text-red-500">
                  {form.errors.login || form.errors.email}
                </p>
              ))}
          </section>
          <form onSubmit={submit} className="mb-4 flex flex-col space-y-6">
            <InputEmail
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
            />
            <InputPassword
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
            />
            <section className="flex justify-between text-sm accent-brand">
              <label
                htmlFor="rememberMe"
                className="flex items-center space-x-2 text-gray"
              >
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={data.rememberMe}
                  onChange={(e) => setData('rememberMe', !data.rememberMe)}
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-brand hover:underline"
              >
                Forgot Password
              </Link>
            </section>
            <InputButton
              processing={form.processing}
              disabled={disableLoginButton}
              label="Login"
            />
          </form>
          <GoogleButton />
        </main>
        <footer className="my-8 text-center text-gray">
          <p>
            <span>Don't have an account yet? </span>
            <Link href="/signup" className="text-brand hover:underline">
              Sign up
            </Link>
          </p>
        </footer>
      </section>
    </>
  )
}
