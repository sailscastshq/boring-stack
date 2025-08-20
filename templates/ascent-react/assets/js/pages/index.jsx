import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
import '~/css/homepage.css'

Index.layout = (page) => <AppLayout children={page} />
export default function Index() {
  return (
    <>
      <Head title="The Boring SaaS Stack - Ship Fast with Battle-Tested Tech | Ascent" />
      <section className="mx-4 mt-20">
        <div className="flex items-center justify-center mb-6">
          <img
            src="/images/ascent-logo.svg"
            alt="Ascent"
            className="h-12 w-auto"
          />
        </div>
        <h1 className="mb-4 text-center text-4xl font-bold text-brand md:text-5xl">
          Ship Fast with Battle-Tested Technologies 🚀
        </h1>
        <p className="mx-auto max-w-3xl text-center text-xl text-gray-600">
          The ultimate React SaaS template built on The Boring Stack. Focus on
          shipping to real users, not chasing trends.
        </p>
        <div className="flex justify-center mt-8 space-x-4">
          <button className="bg-brand text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors">
            Get Started
          </button>
          <button className="border border-brand text-brand px-8 py-3 rounded-lg font-semibold hover:bg-brand hover:text-white transition-colors">
            View Docs
          </button>
        </div>
      </section>
      <section className="px-4 py-12 md:mx-auto md:w-10/12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <a
            href="https://marketplace.visualstudio.com/items?itemName=Sails.sails-vscode"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold text-brand">
              Official VS Code extension
            </h3>
            <p className="mb-4 text-gray-600">
              Install the official Sails VS Code extension to supercharge your
              development experience.
            </p>
            <button className="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
              Install Extension
            </button>
          </a>

          <a
            href="https://sailsjs.com/documentation"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold text-brand">
              The Boring JavaScript Stack Docs
            </h3>
            <p className="mb-4 text-gray-600">
              Official documentation for The Boring JavaScript Stack.
            </p>
            <button className="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
              Read Docs
            </button>
          </a>
          <a
            href="https://sailscasts.com/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold text-brand">
              Sailscasts Discord
            </h3>
            <p className="mb-4 text-gray-600">
              Join the community to discuss Sails.js and get help. Connect with
              fellow developers and stay updated.
            </p>
            <button className="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
              Join Community
            </button>
          </a>

          <a
            href="https://github.com/sailscastshq/boring-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold text-brand">
              Star on GitHub ⭐️
            </h3>
            <p className="mb-4 text-gray-600">
              Give The Boring JavaScript Stack a star on GitHub.
            </p>
            <button className="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
              Star Project
            </button>
          </a>
          <a
            href="https://sailscasts.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold text-brand">
              Sailscasts
            </h3>
            <p className="mb-4 text-gray-600">
              Learn Sails.js and The Boring JavaScript Stack through video
              tutorials and courses.
            </p>
            <button className="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
              Start Learning
            </button>
          </a>
        </div>
      </section>
      <section className="space-y-8 px-4 py-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0 md:p-12">
        <article className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-brand/10 p-3">
              <svg
                className="h-8 w-8 text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl text-brand md:mb-2 md:text-2xl">Ship Fast</h3>
          <p className="font-light text-gray md:text-lg">
            Built with battle-tested technologies. No more wrestling with
            complex build tools or chasing JavaScript trends.
          </p>
        </article>
        <article className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-accent/10 p-3">
              <svg
                className="h-8 w-8 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl text-brand md:mb-2 md:text-2xl">SaaS Ready</h3>
          <p className="font-light text-gray md:text-lg">
            Authentication, payments, teams, admin dashboard, and more.
            Everything you need to launch your SaaS.
          </p>
        </article>
        <article className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-success/10 p-3">
              <svg
                className="h-8 w-8 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl text-brand md:mb-2 md:text-2xl">
            Developer Experience
          </h3>
          <p className="font-light text-gray md:text-lg">
            PrimeReact components, Tailwind CSS, and modern tooling. Everything
            works together seamlessly.
          </p>
        </article>
      </section>
      <section className="bg-[#F9FAFB] px-4 py-8 md:flex md:space-x-64 md:p-12">
        <h2 className="flex-grow-0 text-xl text-black md:w-2/12 md:text-3xl">
          Frequently asked questions
        </h2>
        <section className="flex-1">
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">
              What is Ascent React?
            </summary>
            <p className="text-sm text-black md:text-lg">
              Ascent React is the ultimate free React SaaS template built on The
              Boring JavaScript Stack. It provides everything you need to ship a
              production-ready SaaS application quickly.
            </p>
          </details>
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">
              What features are included?
            </summary>
            <p className="text-sm text-black md:text-lg">
              Authentication (OAuth, Magic Links, 2FA), subscription payments
              with Lemon Squeezy, multi-tenancy, admin dashboard, content blog,
              transactional emails, and more.
            </p>
          </details>
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">
              Can I customize Ascent React?
            </summary>
            <p className="text-sm text-black md:text-lg">
              Absolutely! All the code is open source and built with modern,
              maintainable patterns. Customize to your heart's content with
              PrimeReact components and Tailwind CSS.
            </p>
          </details>
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">
              Why "The Boring Stack"?
            </summary>
            <p className="text-sm text-black md:text-lg">
              Because it uses battle-tested technologies that just work. No
              chasing trends, no complex build tools. Focus on shipping to real
              users, not wrestling with your tools.
            </p>
          </details>
        </section>
      </section>
    </>
  )
}
