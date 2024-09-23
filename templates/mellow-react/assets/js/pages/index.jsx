import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
import '~/css/homepage.css'

Index.layout = (page) => <AppLayout children={page} />
export default function Index() {
  return (
    <>
      <Head title="Simplify Authentication, Focus on Shipping | Mellow" />
      <section className="mx-4 mt-20">
        <h1 className="mb-4 text-center text-4xl font-bold text-brand md:text-5xl">
          Simplify Authentication, Focus on Shipping 🚀
        </h1>
        <p className="mx-auto max-w-3xl text-center text-xl text-gray-600">
          Mellow handles user management, so you can build what matters.
        </p>
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
      <section className="space-y-8 px-4 py-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 md:p-12">
        <article>
          <h3 className="text-xl text-brand md:mb-2 md:text-2xl">
            Productivity
          </h3>
          <p className="font-light text-gray md:text-lg">
            Let Mellow be the starting point of your next SPA. With
            authentication and profile management taken care of, you can focus
            on your core business logic
          </p>
        </article>
        <article>
          <h3 className="text-xl text-brand md:mb-2 md:text-2xl">
            Seamless authentication
          </h3>
          <p className="font-light text-gray md:text-lg">
            Experience effortless user authentication and simplified profile
            management with Mellow, creating a seamless user journey for
            developers and users.
          </p>
        </article>
        <article>
          <h3 className="text-xl text-brand md:mb-2 md:text-2xl">
            Profile management
          </h3>
          <p className="font-light text-gray md:text-lg">
            Let users manage their profiles with ease using Mellow. It offers a
            simple and secure way to update their name, email address, and
            password.
          </p>
        </article>
      </section>
      <section className="bg-[#F9FAFB] px-4 py-8 md:flex md:space-x-64 md:p-12">
        <h2 className="flex-grow-0 text-xl text-black md:w-2/12 md:text-3xl">
          Frequently asked questions
        </h2>
        <section className="flex-1">
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">What is Mellow?</summary>
            <p className="text-sm text-black md:text-lg">
              Mellow is the default starter template for The Boring JavaScript
              Stack. It provides authentication and profile management out of
              the box.
            </p>
          </details>
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">
              How do I get started with Mellow?
            </summary>
            <p className="text-sm text-black md:text-lg">
              Chances are you already have scaffolded a new project using Mellow
              if you are seeing this. Just open up the project in your editor
              and start coding away.
            </p>
          </details>
          <details className="relative border-b border-[#D7D7D7] py-4">
            <summary className="text-gray md:text-lg">
              Can I customize Mellow?
            </summary>
            <p className="text-sm text-black md:text-lg">
              For sure! All the code in Mellow is open source so you can copy
              and paste and customize to your heart's content.
            </p>
          </details>
        </section>
      </section>
    </>
  )
}
