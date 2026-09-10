import Input from '@/components/ui/input/Input.jsx'
import Newspaper from '@/components/ui/icons/Newspaper.jsx'
import ArrowRight from '@/components/ui/icons/ArrowRight.jsx'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'

Blog.layout = AppLayout

export default function Blog({ appName, blogPosts }) {
  return (
    <>
      <Head title="Journal | Ascent" />

      {/* Hero Section */}
      <section className="ascent-page-heading">
        <h1>
          Notes on
          <br />
          building better.
        </h1>
        <p>Updates, ideas, and useful discoveries from the Ascent team.</p>
      </section>

      {/* Blog Posts */}
      <section className="relative bg-white px-4 pb-20 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          {blogPosts && blogPosts.length > 0 ? (
            <div className="space-y-12">
              {blogPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className="group border-t border-gray-200 py-8 dark:border-gray-700"
                >
                  <div className="flex flex-col space-y-6 sm:flex-row sm:items-start sm:space-x-8 sm:space-y-0">
                    {/* Date */}
                    <div className="flex-shrink-0">
                      <time className="inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                        {post.publishedOn}
                      </time>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-gray-100">
                        <a
                          href={`/blog/${post.slug}`}
                          className="hover:underline"
                        >
                          {post.title}
                        </a>
                      </h2>

                      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        {post.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <a
                          href={`/blog/${post.slug}`}
                          className="group/link inline-flex items-center font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
                        >
                          Read full article
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </a>

                        {index === 0 && (
                          <span className="inline-flex items-center rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800 dark:bg-accent-950/40 dark:text-accent-300">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 -z-10 rounded-xl  bg-gray-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-950"></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center" role="status" aria-live="polite">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Newspaper className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                No blog posts yet
              </h3>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
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
            <div className="relative mt-20 overflow-hidden rounded-3xl  bg-brand-600 px-8 py-12 text-center text-white">
              {/* Background decoration */}
              <div className="hidden"></div>
              <div className="hidden"></div>

              <div className="relative mx-auto max-w-2xl">
                <h3 className="mb-4 text-3xl font-bold">
                  Never miss an update
                </h3>
                <p className="mb-8 text-xl text-gray-300">
                  Get the latest insights about SaaS development and product
                  launches delivered to your inbox.
                </p>
                <form className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
                  <Input
                    type="email"
                    id="newsletter-email"
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter subscription"
                    className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-lg  bg-brand-600 px-8 py-3 font-semibold text-white shadow-none transition-all duration-200"
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
