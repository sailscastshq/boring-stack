import ArrowRight from '@/components/ui/icons/ArrowRight.jsx'
import ExternalLink from '@/components/ui/icons/ExternalLink.jsx'
import { Link, Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'

Dashboard.layout = AppLayout
export default function Dashboard() {
  const page = usePage()
  const loggedInUser = page.props.loggedInUser

  return (
    <>
      <Head title="Dashboard | Mellow"></Head>
      <section className="mellow-workspace">
        <div className="mellow-workspace-heading">
          <h1>Welcome, {loggedInUser.fullName}.</h1>
          <p className="text-sm text-gray-600">
            A place to settle in and make things happen.
          </p>
        </div>
        <div className="mellow-account-row">
          <h2>Your profile</h2>
          <div>
            <p>Make yourself at home. Update your name, email, and password.</p>
            <p className="mt-2 break-all">{loggedInUser.email}</p>
          </div>
          <Link href="/profile" className="mellow-primary">
            Edit Profile <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
        <div className="mellow-account-row">
          <h2>Your next step</h2>
          <p>
            The basics are in place. Explore the documentation and start shaping
            your application.
          </p>
          <a
            href="https://docs.sailscasts.com/boring-stack"
            className="mellow-text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore the docs <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        </div>
      </section>
    </>
  )
}
