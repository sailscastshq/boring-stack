<script setup>
import ArrowRight from '@/components/ui/icons/ArrowRight.vue'
import ArrowDown from '@/components/ui/icons/ArrowDown.vue'
import { Head, Link } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
defineOptions({ layout: AppLayout })
</script>
<template>
  <Head title="Mellow — Start with the essentials." />
  <section class="mellow-hero">
    <div class="mellow-hero-inner">
      <h1>Start with<br />the essentials.</h1>
      <p>
        Authentication and profiles, ready for your next idea.<br
          class="hidden sm:block"
        />
        A simple starting point you can make your own.
      </p>
      <div class="mellow-actions">
        <Link href="/signup" class="mellow-primary"
          >Get started <ArrowRight class="h-4 w-4" /></Link
        ><a href="#inside" class="mellow-text-link"
          >Explore Mellow <ArrowDown class="h-4 w-4"
        /></a>
      </div>
    </div>
  </section>
  <section id="inside" class="mellow-section">
    <div class="mellow-section-heading">
      <h2>Everything you need to begin.</h2>
    </div>
    <div class="mellow-feature-list">
      <article>
        <div>
          <h3>Authentication</h3>
          <p>
            Sign up, sign in, and get back in when a password slips your mind.
            Every step is ready.
          </p>
        </div>
      </article>
      <article>
        <div>
          <h3>Profiles</h3>
          <p>
            A personal dashboard and profile that give your users somewhere to
            feel at home.
          </p>
        </div>
      </article>
      <article>
        <div>
          <h3>Your source code</h3>
          <p>
            Simple, open source code. Keep what you need, change what you like,
            and make it your own.
          </p>
        </div>
      </article>
    </div>
  </section>
  <section class="mellow-resources mellow-section">
    <div class="mellow-section-heading">
      <h2>Useful resources.</h2>
    </div>
    <div class="mellow-resource-list">
      <a
        href="https://docs.sailscasts.com/boring-stack"
        target="_blank"
        rel="noopener noreferrer"
        ><span
          >The documentation<small
            >Guides for building your application.</small
          ></span
        ><ArrowRight class="h-4 w-4 shrink-0"
      /></a>
      <a
        href="https://marketplace.visualstudio.com/items?itemName=Sails.sails-vscode"
        target="_blank"
        rel="noopener noreferrer"
        ><span
          >The VS Code extension<small
            >Tools for your development workflow.</small
          ></span
        ><ArrowRight class="h-4 w-4 shrink-0"
      /></a>
      <a
        href="https://sailscasts.com/chat"
        target="_blank"
        rel="noopener noreferrer"
        ><span>The community<small>Get help from other builders.</small></span
        ><ArrowRight class="h-4 w-4 shrink-0"
      /></a>
      <a href="https://sailscasts.com" target="_blank" rel="noopener noreferrer"
        ><span>Sailscasts<small>Tutorials and courses.</small></span
        ><ArrowRight class="h-4 w-4 shrink-0"
      /></a>
      <a
        href="https://github.com/sailscastshq/boring-stack"
        target="_blank"
        rel="noopener noreferrer"
        ><span
          >The source code<small>Explore and contribute on GitHub.</small></span
        ><ArrowRight class="h-4 w-4 shrink-0"
      /></a>
    </div>
  </section>
  <section class="mellow-section">
    <div class="mellow-section-heading">
      <h2>Common questions.</h2>
    </div>
    <div class="mellow-faq">
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
          Create an account to explore your dashboard, or open the project in
          your editor and start making it yours.
        </p>
      </details>
      <details>
        <summary>Can I change everything?</summary>
        <p>
          Absolutely. The code, components, and styles live in your application.
          There is no theme to work around.
        </p>
      </details>
    </div>
  </section>
  <section class="mellow-closing">
    <h2>Ready when you are.</h2>
    <Link href="/signup" class="mellow-primary"
      >Create your account <ArrowRight class="h-4 w-4 shrink-0"
    /></Link>
  </section>
</template>
