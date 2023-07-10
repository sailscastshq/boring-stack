<script setup>
import { Link, Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Register"></Head>
  <main>
    <h1>Create your account</h1>
    <p>Welcome! Please enter your details to sign up</p>
    <form>
      <label for="name">Name</label>
      <input type="text" placeholder="Enter your name" />

      <label for="email">Email</label>
      <input type="email" placeholder="Enter your email" />

      <label for="password">Password</label>
      <input type="email" placeholder="Enter your password" />

      <button type="submit">Sign up</button>
    </form>
    <button>Continue with Google</button>
  </main>
  <footer>Already have an account? <Link href="/login">Login</Link></footer>
</template>
