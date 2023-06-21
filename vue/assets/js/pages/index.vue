<script setup>
import { Link } from '@inertiajs/inertia-vue3'
import Counter from "@/components/Counter.vue";

const { name } = defineProps({
  name: String,
});
</script>

<template>
  <div
    class="flex h-screen flex-col items-center justify-center space-y-8 text-center text-gray-700"
  >
    <h1>
      A brand new
      <span class="text-xl font-bold text-purple-400"> {{ name }}</span> app on
      Sails
    </h1>
    <counter />

     <Link href="/example" class="text-purple-600 underline">
        Go to example page
    </Link>

    <ul class="flex space-x-4 text-gray-400">
      <li>
        <a
          href="https://sailsjs.com"
          target="_blank"
          class="hover:text-gray-600 hover:underline"
          >Sails</a
        >
      </li>
      <li>
        <a
          href="https://inertiajs.com"
          target="_blank"
          class="hover:text-gray-600 hover:underline"
          >Inertia</a
        >
      </li>
      <li>
        <a
          href="https://vuejs.org"
          target="_blank"
          class="hover:text-gray-600 hover:underline"
          >Vue</a
        >
      </li>
      <li>
        <a
          href="https://tailwindcss.com"
          target="_blank"
          class="hover:text-gray-600 hover:underline"
          >Tailwind CSS</a
        >
      </li>
    </ul>
  </div>
</template>
