<script setup>
import ArrowRight from '@/components/ui/icons/ArrowRight.vue'
import { Head, Link } from '@inertiajs/vue3'
import Check from '@/components/ui/icons/Check.vue'
import AppLayout from '@/layouts/AppLayout.vue'
defineOptions({ layout: AppLayout })
</script>
<template>
  <Head title="Features | Ascent" />
  <section class="ascent-page-heading">
    <h1>Good products start<br />on solid ground.</h1>
    <p>
      The everyday essentials, connected from the start. Make your first day
      about your idea.
    </p>
    <Link href="/signup" class="ascent-primary"
      >Get started <ArrowRight class="h-4 w-4 shrink-0"
    /></Link>
  </section>
  <section class="ascent-feature-index" aria-label="Included features">
    <article>
      <div>
        <h2>A welcoming front door.</h2>
        <p>
          Password sign-in, magic links, passkeys, and account recovery. Give
          people a clear path into your application.
        </p>
      </div>
      <ul>
        <li><Check class="h-4 w-4 shrink-0" />Sign-in options</li>
        <li><Check class="h-4 w-4 shrink-0" />Email verification</li>
        <li><Check class="h-4 w-4 shrink-0" />Password recovery</li>
      </ul>
    </article>
    <article>
      <div>
        <h2>Confidence built in.</h2>
        <p>
          Two-factor authentication, backup codes, and passkey management,
          gathered in one place.
        </p>
      </div>
      <ul>
        <li><Check class="h-4 w-4 shrink-0" />Authenticator apps</li>
        <li><Check class="h-4 w-4 shrink-0" />Email verification codes</li>
        <li><Check class="h-4 w-4 shrink-0" />Backup codes</li>
      </ul>
    </article>
    <article>
      <div>
        <h2>Better, together.</h2>
        <p>
          Create a workspace, invite your people, and manage their roles as your
          team grows.
        </p>
      </div>
      <ul>
        <li><Check class="h-4 w-4 shrink-0" />Team invitations</li>
        <li><Check class="h-4 w-4 shrink-0" />Member roles</li>
        <li><Check class="h-4 w-4 shrink-0" />Invite links</li>
      </ul>
    </article>
    <article>
      <div>
        <h2>A foundation for your business.</h2>
        <p>
          Let customers choose a plan and manage their subscription through your
          connected payment provider.
        </p>
      </div>
      <ul>
        <li><Check class="h-4 w-4 shrink-0" />Pricing pages</li>
        <li><Check class="h-4 w-4 shrink-0" />Subscriptions</li>
        <li><Check class="h-4 w-4 shrink-0" />Customer portal</li>
      </ul>
    </article>
    <article>
      <div>
        <h2>The details are part of the product.</h2>
        <p>
          Responsive navigation, useful feedback, and personal preferences make
          everyday work feel considered.
        </p>
      </div>
      <ul>
        <li><Check class="h-4 w-4 shrink-0" />Light and dark mode</li>
        <li><Check class="h-4 w-4 shrink-0" />Profile and avatar</li>
        <li><Check class="h-4 w-4 shrink-0" />Accessible interactions</li>
      </ul>
    </article>
    <article>
      <div>
        <h2>Ready to become yours.</h2>
        <p>
          Your Sails application, your source components, your decisions. Extend
          the foundation around the product you want to build.
        </p>
      </div>
      <ul>
        <li><Check class="h-4 w-4 shrink-0" />Klean UI source</li>
        <li><Check class="h-4 w-4 shrink-0" />Inertia navigation</li>
        <li><Check class="h-4 w-4 shrink-0" />React or Vue</li>
      </ul>
    </article>
  </section>
  <section class="ascent-final">
    <h2>Your idea. A head start.</h2>
    <Link href="/pricing" class="ascent-inline-link"
      >Explore the plans <ArrowRight class="h-4 w-4 shrink-0"
    /></Link>
  </section>
</template>
