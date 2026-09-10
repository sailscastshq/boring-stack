<script setup>
import ArrowRight from '@/components/ui/icons/ArrowRight.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.vue'
import Users from '@/components/ui/icons/Users.vue'
import CreditCard from '@/components/ui/icons/CreditCard.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
defineOptions({ layout: AppLayout })
const form = useForm({ email: '' })
</script>
<template>
  <Head title="Ascent — A head start for your next product." />
  <section class="ascent-hero">
    <div class="ascent-hero-inner">
      <div class="ascent-hero-bottom">
        <div>
          <h1>A head start for<br />your next product.</h1>
          <p>Accounts, teams, and billing, ready to make your own.</p>
        </div>
        <div class="ascent-waitlist">
          <form
            @submit.prevent="form.post('/waitlist', { preserveScroll: true })"
          >
            <label for="waitlist-email" class="sr-only">Email address</label>
            <div class="ascent-form-row">
              <Input
                id="waitlist-email"
                class="min-h-12 rounded-lg border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="Your email address"
                required
                :disabled="form.processing"
                :aria-invalid="Boolean(form.errors.email)"
                :aria-describedby="
                  form.errors.email || form.errors.waitlist
                    ? 'waitlist-error'
                    : undefined
                "
              /><Button
                class="min-h-12 rounded-lg bg-brand-600 px-5 py-3 text-white hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-700 dark:active:bg-brand-800"
                type="submit"
                :disabled="form.processing"
                :aria-busy="form.processing"
                ><Spinner v-if="form.processing" class="h-4 w-4" /><span>{{
                  form.processing ? 'Joining…' : 'Join the waitlist'
                }}</span
                ><ArrowRight class="h-4 w-4 shrink-0"
              /></Button>
            </div>
            <p
              v-if="form.errors.email || form.errors.waitlist"
              id="waitlist-error"
              class="mt-3 text-sm text-red-600 dark:text-red-300"
              role="alert"
            >
              {{ form.errors.email || form.errors.waitlist }}
            </p>
          </form>
          <p class="ascent-form-note">
            Product updates, straight to your inbox. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  </section>
  <section class="ascent-overview">
    <div class="ascent-section-title">
      <h2>The foundations, already connected.</h2>
      <Link href="/features" class="ascent-inline-link"
        >Explore the features <ArrowRight class="h-4 w-4 shrink-0"
      /></Link>
    </div>
    <div class="ascent-capabilities">
      <article>
        <ShieldCheck class="h-6 w-6" />
        <h3>Authentication</h3>
        <p>
          Passwords, magic links, passkeys, and two-factor authentication. Let
          people sign in their way.
        </p>
      </article>
      <article>
        <Users class="h-6 w-6" />
        <h3>Team management</h3>
        <p>
          Invitations, roles, and shared workspaces. Built for the people
          building with you.
        </p>
      </article>
      <article>
        <CreditCard class="h-6 w-6" />
        <h3>Billing</h3>
        <p>
          Plans, subscriptions, and a customer portal. Connect your billing and
          focus on your product.
        </p>
      </article>
    </div>
  </section>
  <section class="ascent-detail">
    <div>
      <h2>Built to make your own.</h2>
    </div>
    <div>
      <p>
        Keep the parts that move you forward. Shape the rest around your idea.
        Every component, screen, and interaction is yours to work with.
      </p>
      <div class="ascent-detail-links">
        <a
          href="https://docs.sailscasts.com/boring-stack/ascent"
          target="_blank"
          rel="noopener noreferrer"
          >Read the documentation <ArrowRight class="h-4 w-4 shrink-0" /></a
        ><a
          href="https://github.com/sailscastshq/boring-stack"
          target="_blank"
          rel="noopener noreferrer"
          >Explore the source <ArrowRight class="h-4 w-4 shrink-0"
        /></a>
      </div>
    </div>
  </section>
  <section class="ascent-questions">
    <div class="ascent-section-title">
      <h2>Common questions.</h2>
    </div>
    <div>
      <details>
        <summary>What comes with Ascent?</summary>
        <p>
          Authentication, team management, billing, account settings, and public
          pages. A connected starting point for your SaaS application.
        </p>
      </details>
      <details>
        <summary>Can I make it my own?</summary>
        <p>
          Yes. The application and Klean components live in your source. Change
          the styles, extend the flows, and build your own features.
        </p>
      </details>
      <details>
        <summary>What do I need to configure?</summary>
        <p>
          Connect your database, email transport, and payment provider for your
          deployment. The documentation walks through the setup.
        </p>
      </details>
    </div>
  </section>
  <section class="ascent-final">
    <h2>Start building with Ascent.</h2>
    <Link href="/signup" class="ascent-primary"
      >Get started <ArrowRight class="h-4 w-4 shrink-0"
    /></Link>
  </section>
</template>
