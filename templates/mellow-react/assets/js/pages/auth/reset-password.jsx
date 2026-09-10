import ArrowLeft from '@/components/ui/icons/ArrowLeft.jsx'
import CheckCircle from '@/components/ui/icons/CheckCircle.jsx'
import Lock from '@/components/ui/icons/Lock.jsx'
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
      <section className="mellow-auth">
        <main className="mellow-auth-main">
          <section className="mb-6 flex flex-col items-center justify-center space-y-2 text-center">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]">
              <Lock className="h-[18px] w-[18px]" />
            </span>

            <h1 class="text-2xl">Create a new password</h1>
            <p class="text-sm text-gray-600">Set a new password</p>
          </section>
          <form onSubmit={submit} className="mb-4 flex flex-col space-y-6">
            <InputPassword
              label="New Password"
              id="newPassword"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={form.errors.password}
            />
            <InputPassword
              label="Confirm Password"
              id="confirmPassword"
              value={data.confirmPassword}
              onChange={(e) => setData('confirmPassword', e.target.value)}
              error={form.errors.confirmPassword}
            />
            <ul className="flex justify-between text-sm">
              <li
                className={`flex items-center space-x-1 text-gray-500 ${
                  passwordIsValid && 'text-green'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>At least 8 characters</span>
              </li>
              <li
                className={`flex items-center space-x-1 text-gray-500 ${
                  containsSpecialChars && 'text-green'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
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
        <footer className="text-gray my-8 text-center">
          <Link href="/login" className="flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
            <span className="pl-2">Back to login</span>
          </Link>
        </footer>
      </section>
    </>
  )
}
