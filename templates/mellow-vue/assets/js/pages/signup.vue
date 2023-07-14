<script setup>
import { Link, Head, useForm } from '@inertiajs/vue3'

const form = useForm({
  fullName: null,
  emailAddress: null,
  password: null
})
</script>

<template>
  <Head title="Sign up"></Head>
  <main>
    <h1>Create your account</h1>
    <p>Welcome! Please enter your details to sign up</p>
    <form @submit.prevent="form.post('/signup')">
      <label for="fullName">Name</label>
      <input
        type="text"
        id="fullName"
        placeholder="Enter your name"
        v-model="form.fullName"
      />

      <label for="emailAddress">Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        id="emailAddress"
        v-model="form.emailAddress"
      />

      <label for="password">Password</label>
      <input
        type="password"
        placeholder="Enter your password"
        id="password"
        v-model="form.password"
      />

      <button type="submit">Sign up</button>
    </form>
    <button>Continue with Google</button>
  </main>
  <footer>Already have an account? <Link href="/login">Login</Link></footer>
</template>
