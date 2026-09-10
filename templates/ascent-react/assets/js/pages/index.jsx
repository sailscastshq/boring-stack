import ArrowRight from '@/components/ui/icons/ArrowRight.jsx'
import ExternalLink from '@/components/ui/icons/ExternalLink.jsx'
import Input from '@/components/ui/input/Input.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.jsx'
import Users from '@/components/ui/icons/Users.jsx'
import CreditCard from '@/components/ui/icons/CreditCard.jsx'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
Index.layout = AppLayout
export default function Index() {
  const form = useForm({ email: '' })
  return (
    <>
      <Head title="Ascent — A head start for your next product." />
      <section className="ascent-hero">
        <div className="ascent-hero-inner">
          <div className="ascent-hero-bottom">
            <div>
              <h1>
                A head start for
                <br />
                your next product.
              </h1>
              <p>Accounts, teams, and billing, ready to make your own.</p>
            </div>
            <div className="ascent-waitlist">
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  form.post('/waitlist', { preserveScroll: true })
                }}
              >
                <label htmlFor="waitlist-email" className="sr-only">
                  Email address
                </label>
                <div className="ascent-form-row">
                  <Input
                    id="waitlist-email"
                    className="min-h-12 rounded-lg border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    value={form.data.email}
                    onChange={(event) =>
                      form.setData('email', event.target.value)
                    }
                    type="email"
                    autoComplete="email"
                    placeholder="Your email address"
                    required
                    disabled={form.processing}
                    aria-invalid={Boolean(form.errors.email)}
                    aria-describedby={
                      form.errors.email || form.errors.waitlist
                        ? 'waitlist-error'
                        : undefined
                    }
                  />
                  <Button
                    className="min-h-12 rounded-lg bg-brand-600 px-5 py-3 text-white hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-700 dark:active:bg-brand-800"
                    type="submit"
                    disabled={form.processing}
                    aria-busy={form.processing}
                  >
                    {form.processing && <Spinner className="h-4 w-4" />}
                    <span>
                      {form.processing ? 'Joining…' : 'Join the waitlist'}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Button>
                </div>
                {(form.errors.email || form.errors.waitlist) && (
                  <p
                    id="waitlist-error"
                    className="mt-3 text-sm text-red-600 dark:text-red-300"
                    role="alert"
                  >
                    {form.errors.email || form.errors.waitlist}
                  </p>
                )}
              </form>
              <p className="ascent-form-note">
                Product updates, straight to your inbox. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="ascent-overview">
        <div className="ascent-section-title">
          <h2>The foundations, already connected.</h2>
          <Link href="/features" className="ascent-inline-link">
            Explore the features <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
        <div className="ascent-capabilities">
          <article>
            <ShieldCheck className="h-6 w-6" />
            <h3>Authentication</h3>
            <p>
              Passwords, magic links, passkeys, and two-factor authentication.
              Let people sign in their way.
            </p>
          </article>
          <article>
            <Users className="h-6 w-6" />
            <h3>Team management</h3>
            <p>
              Invitations, roles, and shared workspaces. Built for the people
              building with you.
            </p>
          </article>
          <article>
            <CreditCard className="h-6 w-6" />
            <h3>Billing</h3>
            <p>
              Plans, subscriptions, and a customer portal. Connect your billing
              and focus on your product.
            </p>
          </article>
        </div>
      </section>
      <section className="ascent-detail">
        <div>
          <h2>Built to make your own.</h2>
        </div>
        <div>
          <p>
            Keep the parts that move you forward. Shape the rest around your
            idea. Every component, screen, and interaction is yours to work
            with.
          </p>
          <div className="ascent-detail-links">
            <a
              href="https://docs.sailscasts.com/boring-stack/ascent"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the documentation{' '}
              <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
            <a
              href="https://github.com/sailscastshq/boring-stack"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the source <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
          </div>
        </div>
      </section>
      <section className="ascent-questions">
        <div className="ascent-section-title">
          <h2>Common questions.</h2>
        </div>
        <div>
          <details>
            <summary>What comes with Ascent?</summary>
            <p>
              Authentication, team management, billing, account settings, and
              public pages. A connected starting point for your SaaS
              application.
            </p>
          </details>
          <details>
            <summary>Can I make it my own?</summary>
            <p>
              Yes. The application and Klean components live in your source.
              Change the styles, extend the flows, and build your own features.
            </p>
          </details>
          <details>
            <summary>What do I need to configure?</summary>
            <p>
              Connect your database, email transport, and payment provider for
              your deployment. The documentation walks through the setup.
            </p>
          </details>
        </div>
      </section>
      <section className="ascent-final">
        <h2>Start building with Ascent.</h2>
        <Link href="/signup" className="ascent-primary">
          Get started <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>
    </>
  )
}
