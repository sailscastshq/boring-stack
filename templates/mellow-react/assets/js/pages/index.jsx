import ArrowRight from '@/components/ui/icons/ArrowRight.jsx'
import ArrowDown from '@/components/ui/icons/ArrowDown.jsx'
import ExternalLink from '@/components/ui/icons/ExternalLink.jsx'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
Index.layout = AppLayout
export default function Index() {
  return (
    <>
      <Head title="Mellow — Start with the essentials." />
      <section className="mellow-hero">
        <div className="mellow-hero-inner">
          <h1>
            Start with
            <br />
            the essentials.
          </h1>
          <p>
            Authentication and profiles, ready for your next idea.
            <br className="hidden sm:block" /> A simple starting point you can
            make your own.
          </p>
          <div className="mellow-actions">
            <Link href="/signup" className="mellow-primary">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#inside" className="mellow-text-link">
              Explore Mellow <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
      <section id="inside" className="mellow-section">
        <div className="mellow-section-heading">
          <h2>Everything you need to begin.</h2>
        </div>
        <div className="mellow-feature-list">
          <article>
            <div>
              <h3>Authentication</h3>
              <p>
                Sign up, sign in, and get back in when a password slips your
                mind. Every step is ready.
              </p>
            </div>
          </article>
          <article>
            <div>
              <h3>Profiles</h3>
              <p>
                A personal dashboard and profile that give your users somewhere
                to feel at home.
              </p>
            </div>
          </article>
          <article>
            <div>
              <h3>Your source code</h3>
              <p>
                Simple, open source code. Keep what you need, change what you
                like, and make it your own.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="mellow-resources mellow-section">
        <div className="mellow-section-heading">
          <h2>Useful resources.</h2>
        </div>
        <div className="mellow-resource-list">
          <a
            href="https://docs.sailscasts.com/boring-stack"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              The documentation
              <small>Guides for building your application.</small>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=Sails.sails-vscode"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              The VS Code extension
              <small>Tools for your development workflow.</small>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
          <a
            href="https://sailscasts.com/chat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              The community<small>Get help from other builders.</small>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
          <a
            href="https://sailscasts.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              Sailscasts
              <small>Tutorials and courses.</small>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
          <a
            href="https://github.com/sailscastshq/boring-stack"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              The source code<small>Explore and contribute on GitHub.</small>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        </div>
      </section>
      <section className="mellow-section">
        <div className="mellow-section-heading">
          <h2>Common questions.</h2>
        </div>
        <div className="mellow-faq">
          <details>
            <summary>What is Mellow?</summary>
            <p>
              The focused starter for The Boring JavaScript Stack, with
              authentication and profile management ready to use.
            </p>
          </details>
          <details>
            <summary>Where do I start?</summary>
            <p>
              Create an account to explore your dashboard, or open the project
              in your editor and start making it yours.
            </p>
          </details>
          <details>
            <summary>Can I change everything?</summary>
            <p>
              Absolutely. The code, components, and styles live in your
              application. There is no theme to work around.
            </p>
          </details>
        </div>
      </section>
      <section className="mellow-closing">
        <h2>Ready when you are.</h2>
        <Link href="/signup" className="mellow-primary">
          Create your account <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>
    </>
  )
}
