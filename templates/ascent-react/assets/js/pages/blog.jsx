import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'

Blog.layout = (page) => <AppLayout children={page} />

export default function Blog({ appName, blogPosts }) {
  return (
    <>
      <Head title="Blog - Latest Updates & Insights | Ascent React" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20"></div>
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-100/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
              📚 Latest Insights
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
            <span className="block leading-tight text-gray-900">{appName}</span>
            <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text leading-tight text-transparent">
              Blog
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-600">
            Stay up to date with the latest news, updates, and insights about
            building modern SaaS applications with The Boring Stack.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="relative bg-white px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          {blogPosts && blogPosts.length > 0 ? (
            <div className="space-y-12">
              {blogPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-xl"
                >
                  <div className="flex flex-col space-y-6 sm:flex-row sm:items-start sm:space-x-8 sm:space-y-0">
                    {/* Date */}
                    <div className="flex-shrink-0">
                      <time className="inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                        {post.publishedOn}
                      </time>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                        <a
                          href={`/blog/${post.slug}`}
                          className="hover:underline"
                        >
                          {post.title}
                        </a>
                      </h2>

                      <p className="text-lg leading-relaxed text-gray-600">
                        {post.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <a
                          href={`/blog/${post.slug}`}
                          className="group/link inline-flex items-center font-semibold text-brand-600 transition-colors hover:text-brand-700"
                        >
                          Read full article
                          <svg
                            className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </a>

                        {index === 0 && (
                          <span className="inline-flex items-center rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-brand-500/5 to-accent-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center" role="status" aria-live="polite">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h6.75"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                No blog posts yet
              </h3>
              <p className="mb-8 text-lg text-gray-600">
                Check back soon for updates and insights about building with
                Ascent React.
              </p>
              <Link
                href="/features"
                className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-brand-700"
              >
                Explore Features
              </Link>
            </div>
          )}

          {/* Newsletter Signup */}
          {blogPosts && blogPosts.length > 0 && (
            <div className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 px-8 py-12 text-center text-white">
              {/* Background decoration */}
              <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-accent-500/10 blur-3xl"></div>

              <div className="relative mx-auto max-w-2xl">
                <h3 className="mb-4 text-3xl font-bold">
                  Never miss an update
                </h3>
                <p className="mb-8 text-xl text-gray-300">
                  Get the latest insights about SaaS development and product
                  launches delivered to your inbox.
                </p>
                <form className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter subscription"
                    className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
