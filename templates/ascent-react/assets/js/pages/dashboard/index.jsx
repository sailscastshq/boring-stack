import ArrowRight from '@/components/ui/icons/ArrowRight.jsx'
import { Link, Head, usePage } from '@inertiajs/react'
import DashboardLayout from '@/layouts/DashboardLayout.jsx'

Dashboard.layout = [DashboardLayout, { title: 'Dashboard', maxWidth: 'wide' }]
export default function Dashboard() {
  const page = usePage()
  const loggedInUser = page.props.loggedInUser

  return (
    <>
      <Head title="Dashboard | Ascent"></Head>

      <section className="ascent-workspace-intro">
        <h1>Welcome back, {loggedInUser.fullName.split(' ')[0]}.</h1>
        <p>Your account, your team, and your next steps.</p>
      </section>
      <section
        className="ascent-workspace-links"
        aria-label="Workspace shortcuts"
      >
        <Link href="/settings/profile">
          <h2>
            Make it yours <ArrowRight className="h-4 w-4 shrink-0" />
          </h2>
          <p>Update your profile and choose how you show up.</p>
        </Link>
        <Link href="/settings/team">
          <h2>
            Build together <ArrowRight className="h-4 w-4 shrink-0" />
          </h2>
          <p>Manage your workspace, people, and invitations.</p>
        </Link>
        <Link href="/settings/billing">
          <h2>
            Your plan <ArrowRight className="h-4 w-4 shrink-0" />
          </h2>
          <p>Review your subscription and billing details.</p>
        </Link>
      </section>
      <section className="ascent-workspace-note">
        <div>
          <h2>Keep your account secure.</h2>
          <p>Review your password, passkeys, and two-factor authentication.</p>
        </div>
        <Link href="/settings/security" className="ascent-inline-link">
          Security settings <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>
    </>
  )
}
