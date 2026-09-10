import ArrowLeft from '@/components/ui/icons/ArrowLeft.jsx'
import Key from '@/components/ui/icons/Key.jsx'
import { Link, Head, useForm } from '@inertiajs/react'
import InputEmail from '@/components/InputEmail.jsx'
import InputButton from '@/components/InputButton.jsx'
import { useMemo } from 'react'

export default function ForgotPassword() {
  const form = useForm({
    email: ''
  }).withPrecognition('post', '/forgot-password')
  const { data, setData } = form

  const disableForgetPasswordButton = useMemo(() => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    const isEmailValid = emailRegex.test(data.email)
    if (!isEmailValid) return true
    if (form.processing) return true
    return false
  }, [data.email, form.processing])

  function submit(e) {
    e.preventDefault()
    form.post('/forgot-password')
  }

  return (
    <>
      <Head title="Forgot password | Mellow"></Head>
      <section className="mellow-auth">
        <main className="mellow-auth-main">
          <section className="mb-6 flex flex-col items-center justify-center space-y-2 text-center">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]">
              <Key className="h-[18px] w-[18px]" />
            </span>

            <h1 className="text-2xl">Forgot password?</h1>
            <p className="text-sm text-gray-600">
              We'll send reset instructions to your email
            </p>
          </section>
          <form onSubmit={submit} className="mb-4 flex flex-col space-y-6">
            <InputEmail
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              onBlur={() => form.validate('email')}
              error={form.errors.email}
            />
            <InputButton
              processing={form.processing}
              disabled={disableForgetPasswordButton}
            />
          </form>
        </main>
        <footer className="my-8 text-center text-black">
          <Link href="/login" className="flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
            <span className="pl-2">Back to login</span>
          </Link>
        </footer>
      </section>
    </>
  )
}
