import { Head, useForm } from '@inertiajs/react'
export default function Waitlist() {
  const { data, setData, ...form } = useForm({ email: '' })
  function joinWaitlist(e) {
    e.preventDefault()
    form.post('/waitlist')
  }
  return (
    <>
      <Head title="TBJS Ascent" />
      <header className="mt-12 text-center">
        <h1 className="text-4xl font-bold text-brand">Ascent</h1>
        <p>Fictitious tagline as placeholder because why not</p>
      </header>
      <form onSubmit={joinWaitlist}>
        <input
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          placeholder="Enter your email"
        />
        <button type="submit">Join Waitlist</button>
      </form>
    </>
  )
}
