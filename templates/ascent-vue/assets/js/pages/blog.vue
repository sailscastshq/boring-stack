<script setup>
import Input from '@/components/ui/input/Input.vue'

import Newspaper from '@/components/ui/icons/Newspaper.vue'
import ArrowRight from '@/components/ui/icons/ArrowRight.vue'
import { Head, Link } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})

defineProps({
  appName: String,
  blogPosts: Array
})
</script>

<template>
  <Head title="Journal | Ascent" />

  <section class="ascent-page-heading">
    <h1>Notes on<br />building better.</h1>
    <p>Updates, ideas, and useful discoveries from the Ascent team.</p>
  </section>

  <section class="relative bg-white px-4 pb-20 dark:bg-gray-900">
    <div class="mx-auto max-w-4xl">
      <div v-if="blogPosts && blogPosts.length > 0" class="space-y-12">
        <article
          v-for="(post, index) in blogPosts"
          :key="post.slug"
          class="group border-t border-gray-200 py-8 dark:border-gray-700"
        >
          <div
            class="flex flex-col space-y-6 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-8"
          >
            <div class="shrink-0">
              <time
                class="bg-brand-50 text-brand-700 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium dark:text-brand-300 dark:bg-brand-950/40"
              >
                {{ post.publishedOn }}
              </time>
            </div>

            <div class="flex-1 space-y-4">
              <h2
                class="group-hover:text-brand-600 text-2xl font-bold text-gray-900 transition-colors dark:text-gray-100"
              >
                <a :href="`/blog/${post.slug}`" class="hover:underline">
                  {{ post.title }}
                </a>
              </h2>

              <p
                class="text-lg leading-relaxed text-gray-600 dark:text-gray-400"
              >
                {{ post.description }}
              </p>

              <div class="flex items-center justify-between">
                <a
                  :href="`/blog/${post.slug}`"
                  class="group/link text-brand-600 hover:text-brand-700 inline-flex items-center font-semibold transition-colors dark:text-brand-300"
                >
                  Read full article
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1"
                  />
                </a>

                <span
                  v-if="index === 0"
                  class="bg-accent-100 text-accent-800 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold dark:bg-accent-950/40 dark:text-accent-300"
                >
                  Latest
                </span>
              </div>
            </div>
          </div>

          <div
            class="absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 bg-gray-50 dark:bg-gray-950"
          ></div>
        </article>
      </div>

      <div v-else class="py-20 text-center" role="status" aria-live="polite">
        <div
          class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <Newspaper class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          No blog posts yet
        </h3>
        <p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
          Check back soon for updates and insights about building with Ascent
          React.
        </p>
        <Link
          href="/features"
          class="bg-brand-600 hover:bg-brand-700 inline-flex items-center rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200"
        >
          Explore Features
        </Link>
      </div>

      <div
        v-if="blogPosts && blogPosts.length > 0"
        class="relative mt-20 overflow-hidden rounded-3xl px-8 py-12 text-center text-white bg-brand-600"
      >
        <div class="hidden"></div>
        <div class="hidden"></div>

        <div class="relative mx-auto max-w-2xl">
          <h3 class="mb-4 text-3xl font-bold">Never miss an update</h3>
          <p class="mb-8 text-xl text-gray-300">
            Get the latest insights about SaaS development and product launches
            delivered to your inbox.
          </p>
          <form
            class="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row"
          >
            <Input
              type="email"
              id="newsletter-email"
              placeholder="Enter your email"
              aria-label="Email address for newsletter subscription"
              class="focus:border-brand-400 focus:ring-brand-400/50 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:ring-2 focus:outline-none"
              required
            />
            <button
              type="submit"
              class="rounded-lg px-8 py-3 font-semibold text-white transition-all duration-200 shadow-none bg-brand-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
